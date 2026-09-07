import math

from app.main import EMBEDDING_DIMENSION, MAX_UPLOAD_BYTES, _model_state


def _post_image(client, content: bytes, content_type: str, filename: str = "photo.jpg"):
    return client.post("/embed", files={"file": (filename, content, content_type)})


def test_jpeg_valido_produce_embedding_384(client, jpeg_bytes):
    response = _post_image(client, jpeg_bytes, "image/jpeg")
    assert response.status_code == 200
    payload = response.json()
    assert payload["dimension"] == EMBEDDING_DIMENSION
    assert payload["normalized"] is True
    assert len(payload["embedding"]) == EMBEDDING_DIMENSION
    assert payload["model"] == "facebook/dinov2-small"


def test_png_valido_produce_embedding_384(client, png_bytes):
    response = _post_image(client, png_bytes, "image/png", filename="photo.png")
    assert response.status_code == 200
    assert len(response.json()["embedding"]) == EMBEDDING_DIMENSION


def test_webp_valido_produce_embedding_384(client, webp_bytes):
    response = _post_image(client, webp_bytes, "image/webp", filename="photo.webp")
    assert response.status_code == 200
    assert len(response.json()["embedding"]) == EMBEDDING_DIMENSION


def test_archivo_no_imagen_es_rechazado(client):
    response = _post_image(client, b"esto no es una imagen, son bytes cualquiera", "image/jpeg")
    assert response.status_code == 422


def test_imagen_corrupta_es_rechazada(client, jpeg_bytes):
    truncated = jpeg_bytes[: len(jpeg_bytes) // 2]
    response = _post_image(client, truncated, "image/jpeg")
    assert response.status_code == 422


def test_content_type_no_soportado_es_rechazado(client, jpeg_bytes):
    response = _post_image(client, jpeg_bytes, "application/pdf", filename="photo.pdf")
    assert response.status_code == 415


def test_archivo_mayor_de_10mb_es_rechazado(client):
    oversized = b"\x00" * (MAX_UPLOAD_BYTES + 1)
    response = _post_image(client, oversized, "image/jpeg")
    assert response.status_code == 413


def test_archivo_vacio_es_rechazado(client):
    response = _post_image(client, b"", "image/jpeg")
    assert response.status_code == 400


def test_embedding_es_finito(client, jpeg_bytes):
    response = _post_image(client, jpeg_bytes, "image/jpeg")
    embedding = response.json()["embedding"]
    assert all(math.isfinite(value) for value in embedding)


def test_embedding_tiene_norma_l2_aproximadamente_uno(client, jpeg_bytes):
    response = _post_image(client, jpeg_bytes, "image/jpeg")
    embedding = response.json()["embedding"]
    norm = math.sqrt(sum(value * value for value in embedding))
    assert abs(norm - 1) < 0.01


def test_determinismo_misma_imagen_mismo_embedding(client, jpeg_bytes):
    first = _post_image(client, jpeg_bytes, "image/jpeg").json()["embedding"]
    second = _post_image(client, jpeg_bytes, "image/jpeg").json()["embedding"]
    assert first == second


def test_modelo_no_se_recarga_entre_requests(client, jpeg_bytes):
    model_before = _model_state["model"]
    _post_image(client, jpeg_bytes, "image/jpeg")
    _post_image(client, jpeg_bytes, "image/jpeg")
    assert _model_state["model"] is model_before


def test_health_reporta_modelo_y_device(client):
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["model"] == "facebook/dinov2-small"
    assert payload["device"] in ("cpu", "cuda")
