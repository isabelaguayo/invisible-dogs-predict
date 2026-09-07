"""Prepare and validate the Phase B Adoptante visual-search artifacts.

This script reads the original TFM NPZ files without modifying them. It writes
raw little-endian float32 matrices, manifests and Python golden fixtures for the
server-side TypeScript implementation.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

import numpy as np


ARTIFACT_VERSION = "adopter-search-v1"
DTYPE = "float32-little-endian"
DIMENSION = 384
NORMALIZATION_TOLERANCE = 5e-4
SIMILARITY_TOLERANCE = 1e-5


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as source:
        return json.load(source)


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as target:
        json.dump(value, target, ensure_ascii=False, indent=2)
        target.write("\n")


def write_float32(path: Path, matrix: np.ndarray) -> np.ndarray:
    path.parent.mkdir(parents=True, exist_ok=True)
    binary_matrix = np.ascontiguousarray(matrix, dtype=np.dtype("<f4"))
    binary_matrix.tofile(path)
    return binary_matrix


def norm_summary(matrix: np.ndarray) -> dict[str, float]:
    norms = np.linalg.norm(matrix, axis=1)
    return {
        "minimum": float(norms.min()),
        "maximum": float(norms.max()),
        "mean": float(norms.mean()),
        "maximumAbsoluteErrorFromOne": float(np.max(np.abs(norms - 1.0))),
    }


def matches_age(age_months: int, category: str) -> bool:
    if age_months == 0:
        return False
    if category == "Cachorro":
        return 1 <= age_months <= 11
    if category == "Joven":
        return 12 <= age_months <= 35
    if category == "Adulto":
        return 36 <= age_months <= 95
    if category == "Senior":
        return age_months >= 96
    raise ValueError(f"Unknown age category: {category}")


def matches_filters(profile: dict[str, Any], state: dict[str, Any]) -> bool:
    if "age" in state and not matches_age(profile["ageMonths"], state["age"]):
        return False
    for key in (
        "sex",
        "size",
        "coat",
        "health",
        "sterilized",
        "vaccinated",
        "dewormed",
    ):
        if key in state and profile[key] != state[key]:
            return False
    if "breed" in state and state["breed"] not in (
        profile["primaryBreed"],
        profile["secondaryBreed"],
    ):
        return False
    if "color" in state and state["color"] not in profile["colors"]:
        return False
    return True


def golden_scenarios(labels_by_name: dict[str, int]) -> list[dict[str, Any]]:
    return [
        {
            "id": "all-golden-retriever",
            "description": "Todos Indiferente + Golden Retriever visual",
            "state": {},
            "prototypeLabel": labels_by_name["Golden Retriever"],
        },
        {
            "id": "female-golden-retriever",
            "description": "Sexo Hembra + Golden Retriever visual",
            "state": {"sex": "Hembra"},
            "prototypeLabel": labels_by_name["Golden Retriever"],
        },
        {
            "id": "medium-shiba-dog",
            "description": "Tamaño Mediano + Shiba Dog visual",
            "state": {"size": "Mediano"},
            "prototypeLabel": labels_by_name["Shiba Dog"],
        },
        {
            "id": "combined-french-bulldog",
            "description": "Varios filtros + French Bulldog visual",
            "state": {
                "sex": "Hembra",
                "size": "Mediano",
                "coat": "Largo",
                "health": "Saludable",
                "vaccinated": "Sí",
            },
            "prototypeLabel": labels_by_name["French Bulldog"],
        },
        {
            "id": "few-secondary-breed-shiba-dog",
            "description": "Affenpinscher observado solo como raza secundaria",
            "state": {"breed": "Affenpinscher"},
            "prototypeLabel": labels_by_name["Shiba Dog"],
        },
        {
            "id": "zero-candidates-golden-retriever",
            "description": "Combinación válida sin candidatos",
            "state": {
                "sex": "Hembra",
                "size": "Extra grande",
                "coat": "Largo",
                "health": "Lesión grave",
            },
            "prototypeLabel": labels_by_name["Golden Retriever"],
        },
        {
            "id": "all-toy-poodle",
            "description": "Todos Indiferente + variante explícita Toy Poodle",
            "state": {},
            "prototypeLabel": labels_by_name["Toy Poodle"],
        },
    ]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--petfinder-npz", required=True, type=Path)
    parser.add_argument("--prototypes-npz", required=True, type=Path)
    parser.add_argument("--profiles-json", required=True, type=Path)
    parser.add_argument("--visual-catalog-json", required=True, type=Path)
    parser.add_argument("--server-output", required=True, type=Path)
    parser.add_argument("--golden-output", required=True, type=Path)
    args = parser.parse_args()

    profiles: list[dict[str, Any]] = read_json(args.profiles_json)
    visual_catalog: list[dict[str, Any]] = read_json(args.visual_catalog_json)

    with np.load(args.petfinder_npz, allow_pickle=False) as source:
        source_pet_ids = source["PetID"].astype(str)
        source_petfinder_embeddings = source["embeddings"]

        if source_petfinder_embeddings.shape != (7938, DIMENSION):
            raise ValueError(
                f"Unexpected PetFinder shape: {source_petfinder_embeddings.shape}"
            )
        if source_petfinder_embeddings.dtype != np.float32:
            raise ValueError(
                f"Unexpected PetFinder dtype: {source_petfinder_embeddings.dtype}"
            )

        source_indices = np.asarray(
            [profile["embeddingIndex"] for profile in profiles], dtype=np.int64
        )
        expected_pet_ids = np.asarray(
            [profile["petId"] for profile in profiles], dtype=str
        )
        aligned_pet_ids = source_pet_ids[source_indices]
        mismatches = np.flatnonzero(aligned_pet_ids != expected_pet_ids)
        if len(mismatches):
            row = int(mismatches[0])
            raise ValueError(
                "PetID/embedding mismatch at profile row "
                f"{row}: {expected_pet_ids[row]} != {aligned_pet_ids[row]}"
            )

        adopter_embeddings = source_petfinder_embeddings[source_indices].copy()

    with np.load(args.prototypes_npz, allow_pickle=False) as source:
        source_prototypes = source["embeddings"]
        source_labels = source["label"].astype(np.int64)
        source_breeds = source["raza"].astype(str)

        if source_prototypes.shape != (130, DIMENSION):
            raise ValueError(f"Unexpected prototype shape: {source_prototypes.shape}")
        if source_prototypes.dtype != np.float32:
            raise ValueError(f"Unexpected prototype dtype: {source_prototypes.dtype}")

        prototype_order = np.argsort(source_labels, kind="stable")
        ordered_labels = source_labels[prototype_order]
        if not np.array_equal(ordered_labels, np.arange(130)):
            raise ValueError("Prototype labels must uniquely cover 0..129")
        ordered_prototypes = source_prototypes[prototype_order].copy()
        ordered_breeds = source_breeds[prototype_order]

    catalog_by_label = {int(item["label"]): item for item in visual_catalog}
    if set(catalog_by_label) != set(range(130)):
        raise ValueError("Visual catalog labels must uniquely cover 0..129")
    for label, source_breed in enumerate(ordered_breeds):
        if catalog_by_label[label]["displayName"] != source_breed:
            raise ValueError(
                f"Prototype/catalog mismatch for label {label}: "
                f"{source_breed} != {catalog_by_label[label]['displayName']}"
            )

    petfinder_binary = args.server_output / "petfinderDinov2Embeddings.v1.f32"
    prototype_binary = args.server_output / "tsinghuaBreedPrototypes.v1.f32"
    adopter_embeddings = write_float32(petfinder_binary, adopter_embeddings)
    ordered_prototypes = write_float32(prototype_binary, ordered_prototypes)

    petfinder_norms = norm_summary(adopter_embeddings)
    prototype_norms = norm_summary(ordered_prototypes)
    if petfinder_norms["maximumAbsoluteErrorFromOne"] > NORMALIZATION_TOLERANCE:
        raise ValueError("PetFinder embeddings exceed normalization tolerance")
    if prototype_norms["maximumAbsoluteErrorFromOne"] > NORMALIZATION_TOLERANCE:
        raise ValueError("Tsinghua prototypes exceed normalization tolerance")

    petfinder_manifest = {
        "artifactVersion": ARTIFACT_VERSION,
        "file": petfinder_binary.name,
        "rows": len(profiles),
        "dimension": DIMENSION,
        "dtype": DTYPE,
        "byteLength": petfinder_binary.stat().st_size,
        "sourceNpz": args.petfinder_npz.name,
        "sourceNpzSha256": sha256(args.petfinder_npz),
        "sourceRows": 7938,
        "artifactSha256": sha256(petfinder_binary),
        "profilesArtifact": args.profiles_json.name,
        "profilesArtifactSha256": sha256(args.profiles_json),
        "order": "Same stable row order as petfinderProfiles.v1.json",
        "correspondence": (
            "For every output row i, profiles[i].embeddingIndex selected the "
            "source NPZ row and source PetID was verified equal to profiles[i].petId"
        ),
        "verifiedPetIdCount": len(profiles),
        "normalizationTolerance": NORMALIZATION_TOLERANCE,
        "norms": petfinder_norms,
    }
    write_json(
        args.server_output / "petfinderDinov2Manifest.v1.json",
        petfinder_manifest,
    )

    prototype_rows = [
        {
            "label": label,
            "row": label,
            "technicalName": catalog_by_label[label]["technicalName"],
            "displayName": catalog_by_label[label]["displayName"],
        }
        for label in range(130)
    ]
    prototype_manifest = {
        "artifactVersion": ARTIFACT_VERSION,
        "file": prototype_binary.name,
        "rows": 130,
        "dimension": DIMENSION,
        "dtype": DTYPE,
        "byteLength": prototype_binary.stat().st_size,
        "sourceNpz": args.prototypes_npz.name,
        "sourceNpzSha256": sha256(args.prototypes_npz),
        "artifactSha256": sha256(prototype_binary),
        "order": "Ascending numeric prototype label 0..129",
        "lookup": "label -> rows[label].row",
        "normalizationTolerance": NORMALIZATION_TOLERANCE,
        "norms": prototype_norms,
        "prototypes": prototype_rows,
    }
    write_json(
        args.server_output / "tsinghuaPrototypeManifest.v1.json",
        prototype_manifest,
    )

    labels_by_name = {
        item["displayName"]: int(item["label"]) for item in visual_catalog
    }
    scenarios = golden_scenarios(labels_by_name)
    for scenario in scenarios:
        candidate_rows = [
            row
            for row, profile in enumerate(profiles)
            if matches_filters(profile, scenario["state"])
        ]
        prototype_label = int(scenario["prototypeLabel"])
        prototype = ordered_prototypes[prototype_label]
        if candidate_rows:
            scores = adopter_embeddings[candidate_rows] @ prototype
            ranked_positions = sorted(
                range(len(candidate_rows)),
                key=lambda position: (
                    -float(scores[position]),
                    profiles[candidate_rows[position]]["petId"],
                ),
            )
        else:
            scores = np.asarray([], dtype=np.float32)
            ranked_positions = []

        scenario["referenceName"] = catalog_by_label[prototype_label]["displayName"]
        scenario["candidateCount"] = len(candidate_rows)
        scenario["top20"] = [
            {
                "rank": rank,
                "petId": profiles[candidate_rows[position]]["petId"],
                "similarity": float(scores[position]),
            }
            for rank, position in enumerate(ranked_positions[:20], start=1)
        ]

    golden = {
        "artifactVersion": ARTIFACT_VERSION,
        "source": "Python/NumPy validation against the original TFM NPZ files",
        "similarity": "dot(normalizedPrototype, normalizedPetFinderEmbedding)",
        "ranking": "similarity descending, then PetID ascending",
        "numericTolerance": SIMILARITY_TOLERANCE,
        "goldenRetriever": {
            "label": labels_by_name["Golden Retriever"],
            "prototypeRow": labels_by_name["Golden Retriever"],
            "technicalName": catalog_by_label[
                labels_by_name["Golden Retriever"]
            ]["technicalName"],
        },
        "poodleVariants": {
            name: labels_by_name[name]
            for name in (
                "Miniature Poodle",
                "Toy Poodle",
                "Standard Poodle",
            )
        },
        "scenarios": scenarios,
    }
    write_json(args.golden_output, golden)

    print(f"PetFinder binary: {adopter_embeddings.shape}, {petfinder_binary.stat().st_size} bytes")
    print(f"Prototype binary: {ordered_prototypes.shape}, {prototype_binary.stat().st_size} bytes")
    print(f"Golden scenarios: {len(scenarios)}")
    print(
        "Golden Retriever:",
        labels_by_name["Golden Retriever"],
        catalog_by_label[labels_by_name["Golden Retriever"]]["technicalName"],
    )
    print(
        "Poodle labels:",
        labels_by_name["Miniature Poodle"],
        labels_by_name["Toy Poodle"],
        labels_by_name["Standard Poodle"],
    )


if __name__ == "__main__":
    main()
