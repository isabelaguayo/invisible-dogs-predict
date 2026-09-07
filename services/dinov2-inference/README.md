# DINOv2 inference service

## Objective

Turns an uploaded dog photo into a 384-dim, L2-normalized DINOv2 embedding
for InvisibleDogs Predict's Adoptante Method C (search by photograph). It
does **only** that — it never sees, ranks, or returns PetFinder catalog
data. Ranking against the 6,474 prepared PetFinder embeddings happens
server-side in Next.js (`frontend/src/lib/adoptante/photoSearch.ts`).

## Pipeline (reproduces the validated notebook chain exactly)

Faithful to `invisible-dogs-tfm/notebooks/07_tsinghua_busqueda_visual_validacion_externa.ipynb`
(cells 65-66, `extraer_embeddings_dinov2`):

```
image -> ImageOps.exif_transpose (new, see below) -> convert("RGB")
      -> AutoImageProcessor (facebook/dinov2-small)
      -> AutoModel (facebook/dinov2-small), model.eval(), torch.inference_mode()
      -> CLS token: outputs.last_hidden_state[:, 0, :]
      -> L2 normalize: torch.nn.functional.normalize(x, p=2, dim=1)
      -> 384-dim float32 vector
```

Device/dtype: `cuda`+`float16` if available, else `cpu`+`float32` — the
same device-aware choice notebook 07 makes. (Notebook 06, which generated
the precomputed PetFinder artifact, hardcoded `float16` regardless of
device; this is a documented, expected source of tiny numerical divergence
between this service's CPU-float32 output and that artifact for the same
image — see the self-match results below, which show it's negligible in
practice: ~0.999997 cosine similarity.)

**One deliberate addition**: `ImageOps.exif_transpose()` before
preprocessing. The validated notebooks only ever processed static
dataset images and never apply EXIF correction; live phone-camera uploads
can carry EXIF rotation that dataset images don't, so this is the minimal,
non-destructive fix for that new input path. It does not touch the
model/CLS/normalization chain.

## Architecture

```
Browser --POST multipart--> Next.js /api/adoptante/photo-search (BFF)
                                  --POST multipart, server-to-server-->
                             Python service POST /embed
                                  <--{dimension, normalized, embedding}--
                             Next.js photoSearch.ts ranks against the
                             6,474 prepared PetFinder embeddings
                                  <--Top 12 (no embedding)--
Browser <--UI-shaped JSON (AdopterDogResult[])--
```

No CORS is configured: the browser only ever talks to Next.js; Next.js
talks to this service server-to-server, so no public CORS surface is
needed.

## Installation

```bash
cd services/dinov2-inference
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu
```

Dependencies pinned to `G:\Mi unidad\TFM\invisible-dogs-tfm\requirements.txt`
(`torch==2.7.1`, `transformers==5.15.1`, `Pillow==12.3.0`) plus
`torchvision==0.22.1` (required by `AutoImageProcessor` at runtime but
absent from that file — see the comment in `requirements.txt`) and
`fastapi`/`uvicorn`/`python-multipart` (new to this service; no FastAPI
service existed anywhere in the TFM project before).

## Running

```bash
.venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

The model loads once at startup (FastAPI lifespan), stays in memory, and
is reused across requests — never reloaded per photo.

## Frontend environment variable

```
ADOPTER_DINOV2_SERVICE_URL=http://127.0.0.1:8000
```

Server-only (see `frontend/.env.example`); read only by the Next.js route
handler, never sent to the browser. Defaults to `http://127.0.0.1:8000` in
code if unset.

## Endpoints

- `POST /embed` — `multipart/form-data`, field `file` (JPEG/PNG/WEBP, ≤10 MB).
  Returns `{ dimension: 384, normalized: true, embedding: number[384], model, device, timingMs }`.
  Rejects unsupported types (415), oversized files (413), empty files
  (400), and undecodable images (422) with no stack trace in the response.
- `GET /health` — `{ status, model, device, dtype, modelLoadMs }`.

## Example (local)

```bash
curl -X POST http://127.0.0.1:8000/embed -F "file=@photo.jpg"
```

## Limitations (this phase)

- CPU-only path is the supported default; CUDA is used opportunistically
  if available, never required.
- No authentication/CORS hardening — intended for `127.0.0.1` only, called
  exclusively by the local Next.js server.
- Single-process, no autoscaling; not meant for concurrent production load.

## Privacy

The uploaded image is read into memory (`await file.read()`), decoded with
Pillow directly from those bytes, and discarded when the request ends —
it is never written to disk, never logged, and never persisted anywhere
(`public/`, `server-data/`, Drive, or a database). Logs record only
request id, size, content type, timing, and device — never image bytes or
the embedding vector itself.
