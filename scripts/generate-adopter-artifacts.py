"""Generate the versioned, web-facing Adoptante artifacts from TFM CSV files.

The source CSV files are read-only inputs. No visual embeddings, prototypes or
PetFinder photographs are copied by this script.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import unicodedata
from pathlib import Path, PureWindowsPath
from typing import Any


CONTRACT_VERSION = 1
ARTIFACT_VERSION = "adopter-phase-0-a-v1"


def read_rows(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as source:
        return list(csv.DictReader(source))


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def nullable(value: str) -> str | None:
    cleaned = value.strip()
    return cleaned or None


def integer(value: str) -> int:
    return int(float(value))


def number(value: str) -> float:
    return float(value)


def technical_name(display_name: str) -> str:
    ascii_name = (
        unicodedata.normalize("NFKD", display_name)
        .encode("ascii", "ignore")
        .decode("ascii")
        .lower()
    )
    return re.sub(r"[^a-z0-9]+", "-", ascii_name).strip("-")


def write_json(path: Path, value: Any, *, compact: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as target:
        if compact:
            json.dump(value, target, ensure_ascii=False, separators=(",", ":"))
        else:
            json.dump(value, target, ensure_ascii=False, indent=2)
            target.write("\n")


def build_profiles(rows: list[dict[str, str]]) -> list[dict[str, Any]]:
    profiles: list[dict[str, Any]] = []

    for row in rows:
        pet_id = row["PetID"].strip()
        profiles.append(
            {
                "petId": pet_id,
                "embeddingIndex": integer(row["indice_embedding"]),
                "name": row["nombre_app"].strip(),
                "primaryImageFile": PureWindowsPath(
                    row["ruta_imagen_principal"]
                ).name,
                "ageMonths": integer(row["Age"]),
                "sex": row["sexo_app"].strip(),
                "size": row["tamano_app"].strip(),
                "coat": row["pelo_app"].strip(),
                "health": row["salud_app"].strip(),
                "sterilized": row["esterilizado_app"].strip(),
                "vaccinated": row["vacunado_app"].strip(),
                "dewormed": row["desparasitado_app"].strip(),
                "primaryBreed": nullable(row["raza_principal_app"]),
                "secondaryBreed": nullable(row["raza_secundaria_app"]),
                "colors": [
                    color
                    for color in (
                        nullable(row["color_1_app"]),
                        nullable(row["color_2_app"]),
                        nullable(row["color_3_app"]),
                    )
                    if color is not None
                ],
                "photoCount": integer(row["PhotoAmt"]),
                "videoCount": integer(row["VideoAmt"]),
                "riskProbability": number(
                    row["prob_adopcion_lenta_petfinder_final"]
                ),
                "riskLevel": row["nivel_riesgo_relativo"].strip(),
                "riskSource": row["origen_score_petfinder_final"].strip(),
                "completenessIndex": number(row["indice_completitud_ficha"]),
                "completenessLevel": row["nivel_completitud_ficha"].strip(),
            }
        )

    return profiles


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--profiles-csv", required=True, type=Path)
    parser.add_argument("--visual-breeds-csv", required=True, type=Path)
    parser.add_argument("--frontend-root", required=True, type=Path)
    args = parser.parse_args()

    source_profiles = read_rows(args.profiles_csv)
    visual_rows = read_rows(args.visual_breeds_csv)

    if len(source_profiles) != 6474:
        raise ValueError(f"Expected 6474 Adoptante profiles, got {len(source_profiles)}")
    if len(visual_rows) != 130:
        raise ValueError(f"Expected 130 Tsinghua breeds, got {len(visual_rows)}")

    profiles = build_profiles(source_profiles)
    pet_ids = {profile["petId"] for profile in profiles}
    embedding_indices = {profile["embeddingIndex"] for profile in profiles}
    if len(pet_ids) != len(profiles) or len(embedding_indices) != len(profiles):
        raise ValueError("PetID and embeddingIndex must be unique")

    petfinder_breeds = sorted(
        {
            breed
            for row in source_profiles
            for breed in (
                nullable(row["raza_principal_app"]),
                nullable(row["raza_secundaria_app"]),
            )
            if breed is not None
        },
        key=str.casefold,
    )

    visual_breeds = sorted(
        (
            {
                "label": integer(row["label"]),
                "technicalName": technical_name(row["raza_display"]),
                "displayName": row["raza_display"].strip(),
            }
            for row in visual_rows
        ),
        key=lambda breed: breed["label"],
    )
    labels = [breed["label"] for breed in visual_breeds]
    if labels != list(range(130)):
        raise ValueError("Tsinghua labels must be unique and cover 0..129")

    generated_root = (
        args.frontend_root / "src" / "data" / "adoptante" / "generated"
    )
    server_root = args.frontend_root / "server-data" / "adoptante"

    config = {
        "artifactVersion": ARTIFACT_VERSION,
        "contractVersion": CONTRACT_VERSION,
        "source": {
            "profilesFile": args.profiles_csv.name,
            "profilesSha256": sha256(args.profiles_csv),
            "visualBreedsFile": args.visual_breeds_csv.name,
            "visualBreedsSha256": sha256(args.visual_breeds_csv),
        },
        "profileCount": len(profiles),
        "petfinderBreedCount": len(petfinder_breeds),
        "visualBreedCount": len(visual_breeds),
        "rankingMode": "similarity",
        "ageCategories": {
            "puppy": {"minMonths": 1, "maxMonths": 11},
            "young": {"minMonths": 12, "maxMonths": 35},
            "adult": {"minMonths": 36, "maxMonths": 95},
            "senior": {"minMonths": 96, "maxMonths": None},
        },
        "ageZeroTreatment": (
            "Age=0 represents an undetermined age. It is retained only when "
            "the age preference is omitted. The categories are operational "
            "MVP ranges, not a universal veterinary classification."
        ),
    }

    write_json(
        generated_root / "petfinderBreedCatalog.v1.json", petfinder_breeds
    )
    write_json(
        generated_root / "tsinghuaBreedCatalog.v1.json", visual_breeds
    )
    write_json(generated_root / "adopterMvpConfig.v1.json", config)
    write_json(server_root / "petfinderProfiles.v1.json", profiles, compact=True)

    print(f"Generated {len(profiles)} server-only profiles")
    print(f"Generated {len(petfinder_breeds)} PetFinder breed options")
    print(f"Generated {len(visual_breeds)} Tsinghua visual breeds")


if __name__ == "__main__":
    main()
