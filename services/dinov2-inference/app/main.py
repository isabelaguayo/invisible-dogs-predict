"""DINOv2 embedding service for InvisibleDogs Predict — Method C (photo search).

Reproduces, at inference time, the exact chain validated in
G:\\Mi unidad\\TFM\\invisible-dogs-tfm\\notebooks\\07_tsinghua_busqueda_visual_validacion_externa.ipynb
(cells 65-66, the reusable `extraer_embeddings_dinov2` function):

    facebook/dinov2-small (AutoImageProcessor + AutoModel)
    -> CLS token: outputs.last_hidden_state[:, 0, :]
    -> L2 normalization: torch.nn.functional.normalize(embeddings, p=2, dim=1)
    -> model.eval() + torch.inference_mode()
    -> dtype: float16 on CUDA, float32 on CPU (notebook 07's own device-aware
       choice; notebook 06, which generated the precomputed PetFinder
       artifact, hardcoded float16 regardless of device — a documented,
       expected source of tiny numerical divergence between this service's
       CPU-float32 output and that GPU-float16 artifact for the same image).

One deliberate addition beyond the validated notebooks: EXIF-orientation
correction (`ImageOps.exif_transpose`) before preprocessing. The notebooks
only ever processed the static PetFinder/Tsinghua datasets, which do not
carry the rotated-JPEG-from-a-phone-camera problem that live user uploads
do; this is the minimal, non-destructive fix for that new input path and
does not touch the model/CLS/normalization chain itself.

This service does ONLY image -> normalized 384-dim embedding. It never
sees, ranks, or returns PetFinder catalog data — that stays server-side in
Next.js (frontend/src/lib/adoptante/photoSearch.ts).
"""

import io
import logging
import time
import uuid
from contextlib import asynccontextmanager

import torch
import torch.nn.functional as F
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from PIL import Image, ImageOps, UnidentifiedImageError
from transformers import AutoImageProcessor, AutoModel

DINOV2_MODEL_NAME = "facebook/dinov2-small"
EMBEDDING_DIMENSION = 384
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ACCEPTED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
NORM_TOLERANCE = 0.01

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("dinov2-inference")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
dtype = torch.float16 if device.type == "cuda" else torch.float32

_model_state: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    started_at = time.perf_counter()
    processor = AutoImageProcessor.from_pretrained(DINOV2_MODEL_NAME)
    model = AutoModel.from_pretrained(DINOV2_MODEL_NAME).to(device=device, dtype=dtype)
    model.eval()
    load_ms = round((time.perf_counter() - started_at) * 1000, 1)
    _model_state["processor"] = processor
    _model_state["model"] = model
    _model_state["load_ms"] = load_ms
    logger.info(
        "model loaded model=%s device=%s dtype=%s load_ms=%s",
        DINOV2_MODEL_NAME, device.type, dtype, load_ms,
    )
    yield
    _model_state.clear()


app = FastAPI(title="InvisibleDogs Predict — DINOv2 inference", lifespan=lifespan)
# Server-to-server only (Next.js calls this, never the browser directly), so
# no CORS middleware is added: see architecture note in the service README.


@app.get("/health")
def health():
    return {
        "status": "ok" if "model" in _model_state else "loading",
        "model": DINOV2_MODEL_NAME,
        "device": device.type,
        "dtype": str(dtype),
        "modelLoadMs": _model_state.get("load_ms"),
    }


@app.post("/embed")
async def embed(file: UploadFile = File(...)):
    request_id = uuid.uuid4().hex[:12]
    received_at = time.perf_counter()

    if file.content_type not in ACCEPTED_CONTENT_TYPES:
        logger.info("request=%s rejected reason=unsupported-content-type", request_id)
        raise HTTPException(status_code=415, detail="Unsupported image type. Use JPEG, PNG or WEBP.")

    payload = await file.read()
    if len(payload) == 0:
        logger.info("request=%s rejected reason=empty-file", request_id)
        raise HTTPException(status_code=400, detail="Empty file.")
    if len(payload) > MAX_UPLOAD_BYTES:
        logger.info("request=%s rejected reason=too-large size=%d", request_id, len(payload))
        raise HTTPException(status_code=413, detail="File exceeds the 10 MB limit.")

    try:
        image = Image.open(io.BytesIO(payload))
        image = ImageOps.exif_transpose(image)
        image = image.convert("RGB")
        image.load()
    except (UnidentifiedImageError, OSError, ValueError) as error:
        logger.info("request=%s rejected reason=undecodable-image error=%s", request_id, type(error).__name__)
        raise HTTPException(status_code=422, detail="The file could not be opened as a valid image.") from error

    try:
        embedding, timing_ms = await run_in_threadpool(_run_inference, image)
    except Exception as error:  # noqa: BLE001 - convert any inference failure to a controlled response
        logger.exception("request=%s inference-failed", request_id)
        raise HTTPException(status_code=502, detail="Inference failed.") from error

    _validate_output_embedding(embedding)

    total_ms = round((time.perf_counter() - received_at) * 1000, 1)
    logger.info(
        "request=%s size=%d content_type=%s device=%s inference_ms=%s total_ms=%s",
        request_id, len(payload), file.content_type, device.type, timing_ms, total_ms,
    )

    return {
        "dimension": EMBEDDING_DIMENSION,
        "normalized": True,
        "embedding": embedding,
        "model": DINOV2_MODEL_NAME,
        "device": device.type,
        "timingMs": {"inference": timing_ms, "total": total_ms},
    }


def _run_inference(image: Image.Image) -> tuple[list[float], float]:
    processor = _model_state["processor"]
    model = _model_state["model"]

    inputs = processor(images=image, return_tensors="pt")
    pixel_values = inputs["pixel_values"].to(device=device, dtype=dtype)

    started_at = time.perf_counter()
    with torch.inference_mode():
        outputs = model(pixel_values=pixel_values)
        cls_embedding = outputs.last_hidden_state[:, 0, :]
        normalized = F.normalize(cls_embedding, p=2, dim=1)
    inference_ms = round((time.perf_counter() - started_at) * 1000, 1)

    vector = normalized.float().cpu().numpy().reshape(-1).tolist()
    return vector, inference_ms


def _validate_output_embedding(embedding: list[float]) -> None:
    if len(embedding) != EMBEDDING_DIMENSION:
        raise HTTPException(status_code=500, detail="Internal error: unexpected embedding shape.")
    if not all(isinstance(value, float) and value == value and abs(value) != float("inf") for value in embedding):
        raise HTTPException(status_code=500, detail="Internal error: embedding contains non-finite values.")
    norm = sum(value * value for value in embedding) ** 0.5
    if abs(norm - 1) > NORM_TOLERANCE:
        raise HTTPException(status_code=500, detail="Internal error: embedding is not L2-normalized.")
