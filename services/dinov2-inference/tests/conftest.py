import io
import sys
from pathlib import Path

import pytest
from PIL import Image
from starlette.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app  # noqa: E402


@pytest.fixture(scope="session")
def client():
    # Entering the context manager runs the FastAPI lifespan, loading the
    # model exactly once for the whole test session.
    with TestClient(app) as test_client:
        yield test_client


def _image_bytes(fmt: str, size=(64, 64), color=(120, 60, 200)) -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", size, color).save(buffer, format=fmt)
    return buffer.getvalue()


@pytest.fixture
def jpeg_bytes():
    return _image_bytes("JPEG")


@pytest.fixture
def png_bytes():
    return _image_bytes("PNG")


@pytest.fixture
def webp_bytes():
    return _image_bytes("WEBP")
