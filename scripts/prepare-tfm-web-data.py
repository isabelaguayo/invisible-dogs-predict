"""Package existing TFM outputs for the web; no fitting, scoring or embeddings.

Only projects existing rows/columns and copies the 12 photos required by the
initial characteristics view. Git commit and SHA-256 identify every input.
Requires the selected Git LFS inputs to have been downloaded beforehand.
"""
from __future__ import annotations

import csv
import hashlib
import json
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "frontend/server-data/tfm"
COMMIT = "1fe0bcff9a1fa13b86f5d028b05a526f839b6aef"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_source(name: str, sources: dict) -> bytes:
    data = (ROOT / name).read_bytes()
    if data.startswith(b"version https://git-lfs.github.com/spec/v1"):
        raise ValueError(f"Download Git LFS input first: {name}")
    tracked = subprocess.check_output(["git", "show", f"{COMMIT}:{name}"], cwd=ROOT)
    if tracked.startswith(b"version https://git-lfs.github.com/spec/v1"):
        assert f"oid sha256:{sha(data)}" in tracked.decode(), name
    else:
        assert tracked.replace(b"\r\n", b"\n") == data.replace(b"\r\n", b"\n"), f"Source differs from pinned GitHub commit: {name}"
        data = tracked  # Ignore checkout-only CRLF conversion; record Git's bytes.
    sources[name] = {"sha256": sha(data), "bytes": len(data)}
    return data


def rows(name: str, sources: dict) -> list[dict[str, str]]:
    import io
    return list(csv.DictReader(io.StringIO(read_source(name, sources).decode("utf-8-sig"))))


def write_json(name: str, data: object) -> None:
    # Write canonical LF bytes on every OS so generated checksums are stable in Git/CI.
    text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    (DEST / name).write_bytes(text.encode("utf-8"))


def main() -> None:
    head = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    if head != COMMIT:
        raise ValueError("Review the source commit before updating this adapter")
    sources: dict = {}
    profiles = json.loads(read_source("frontend/server-data/adoptante/petfinderProfiles.v1.json", sources))
    scored = {row["PetID"]: row for row in rows("data/processed/petfinder_dogs_enriched_scored.csv", sources)}
    index = {row["PetID"]: row for row in rows("artifacts/visual_search/invisible_dogs_petfinder_search_index.csv", sources)}
    descriptions = {}
    for profile in profiles:
        pet_id = profile["petId"]
        row, visual = scored[pet_id], index[pet_id]
        assert row["Quantity"] == "1", pet_id
        assert abs(float(row["prob_adopcion_lenta_petfinder_final"]) - profile["riskProbability"]) < 1e-12, pet_id
        assert abs(float(visual["prob_adopcion_lenta_petfinder_final"]) - profile["riskProbability"]) < 1e-12, pet_id
        assert visual["nivel_riesgo_relativo"] == profile["riskLevel"], pet_id
        assert Path(visual["ruta_imagen_principal"]).name == profile["primaryImageFile"], pet_id
        descriptions[pet_id] = row["Description"]

    austin = {
        "metrics": rows("outputs/interpretability/metricas_invisible_dog_score_test.csv", sources)[0],
        "bands": rows("outputs/interpretability/resumen_bandas_riesgo_test.csv", sources),
        "topK": rows("outputs/interpretability/metricas_topk_invisible_dog_score_test.csv", sources),
        "families": rows("outputs/interpretability/importancia_ensemble_por_familias.csv", sources),
    }
    # Audit the prepared dataset without exporting its rows or recomputing scores.
    read_source("data/processed/austin/invisible_dogs_dataset_preparado.csv", sources)
    petfinder = {"metrics": rows("outputs/petfinder/resultados_modelo_final_petfinder_test.csv", sources)[0]}
    tsinghua = json.loads(read_source("artifacts/visual_search/invisible_dogs_search_config.json", sources))

    photos = {}
    for profile in sorted(profiles, key=lambda p: p["petId"])[:12]:
        pet_id = profile["petId"]
        name = index[pet_id]["ruta_imagen_principal"]
        assert name == f"data/raw_petfinder/train_images/{pet_id}-1.jpg"
        data = read_source(name, sources)
        assert data[:2] == b"\xff\xd8", name
        url = f"/images/petfinder/historical/{pet_id}-1.jpg"
        target = ROOT / "frontend/public" / url.lstrip("/")
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / name, target)
        photos[pet_id] = {"url": url, "source": name, "sha256": sha(data)}

    DEST.mkdir(parents=True, exist_ok=True)
    write_json("petfinderDescriptions.v1.json", descriptions)
    sources["frontend/server-data/tfm/petfinderDescriptions.v1.json"] = {
        "sha256": sha((DEST / "petfinderDescriptions.v1.json").read_bytes()),
        "derivedFrom": "data/processed/petfinder_dogs_enriched_scored.csv:Description,PetID",
    }
    write_json("tfmSources.v1.json", {
        "repository": "isabelaguayo/invisible-dogs-predict",
        "branch": "documentacion-tfm", "commit": COMMIT,
        "sources": sources, "austin": austin, "petfinder": petfinder,
        "tsinghua": tsinghua, "additionalPhotos": photos,
    })
    print(f"Packaged existing metrics, {len(descriptions)} descriptions and {len(photos)} photos; no model calculations.")


if __name__ == "__main__":
    main()
