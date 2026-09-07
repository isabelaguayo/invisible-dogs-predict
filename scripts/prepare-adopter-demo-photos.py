"""Prepare the controlled PetFinder photo subset used by Adoptante demos.

The original TFM CSV and photographs are read-only inputs. Every copied file
must agree on PetID across the golden fixture, the server profile artifact and
``ruta_imagen_principal``. A mismatch aborts the operation so a photograph can
never be silently associated with a different dog.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import shutil
from pathlib import Path, PureWindowsPath
from typing import Any


SCENARIO_IDS = (
    "all-golden-retriever",
    "female-golden-retriever",
    "medium-shiba-dog",
)
FIXED_RESULT_SCENARIOS = {
    "adult-female-medium-characteristics": (
        "0143edd0a",
        "052c95a93",
        "060d1de98",
        "0636650db",
        "064217ca4",
        "069762ec2",
        "079332bdc",
        "0806f9e3f",
        "0819ac2f6",
        "08bfdc66f",
        "08f40f232",
        "09807c555",
    ),
    "all-chihuahua": (
        "e0667be3b",
        "f477f306f",
        "1712ba40e",
        "719917454",
        "caa16cc3c",
        "56b0b72b1",
        "43b277272",
        "36ab1bdc9",
        "41e4cc1de",
        "3e158c21e",
        "5d792dd24",
        "2b6e5343e",
    ),
}
TOP_RESULTS = 12


def read_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as source:
        return json.load(source)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as target:
        json.dump(value, target, ensure_ascii=False, indent=2)
        target.write("\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--profiles-csv", required=True, type=Path)
    parser.add_argument("--profiles-json", required=True, type=Path)
    parser.add_argument("--golden-json", required=True, type=Path)
    parser.add_argument("--public-output", required=True, type=Path)
    parser.add_argument("--catalog-output", required=True, type=Path)
    args = parser.parse_args()

    profiles = read_json(args.profiles_json)
    profile_by_pet_id = {profile["petId"]: profile for profile in profiles}
    if len(profile_by_pet_id) != len(profiles):
        raise ValueError("Server profile PetID values must be unique")

    golden = read_json(args.golden_json)
    scenario_by_id = {scenario["id"]: scenario for scenario in golden["scenarios"]}
    required_by_pet_id: dict[str, list[str]] = {}
    for scenario_id in SCENARIO_IDS:
        scenario = scenario_by_id.get(scenario_id)
        if scenario is None:
            raise ValueError(f"Missing golden scenario: {scenario_id}")
        top_results = scenario["top20"][:TOP_RESULTS]
        if len(top_results) != TOP_RESULTS:
            raise ValueError(f"Scenario {scenario_id} has fewer than 12 golden results")
        for result in top_results:
            required_by_pet_id.setdefault(result["petId"], []).append(scenario_id)

    for scenario_id, pet_ids in FIXED_RESULT_SCENARIOS.items():
        if len(pet_ids) != TOP_RESULTS:
            raise ValueError(f"Scenario {scenario_id} must contain exactly 12 results")
        for pet_id in pet_ids:
            required_by_pet_id.setdefault(pet_id, []).append(scenario_id)

    csv_rows: dict[str, dict[str, str]] = {}
    with args.profiles_csv.open("r", encoding="utf-8-sig", newline="") as source:
        for row in csv.DictReader(source):
            pet_id = row["PetID"].strip()
            if pet_id in required_by_pet_id:
                if pet_id in csv_rows:
                    raise ValueError(f"Duplicate required PetID in source CSV: {pet_id}")
                csv_rows[pet_id] = row

    missing_rows = sorted(set(required_by_pet_id) - set(csv_rows))
    if missing_rows:
        raise ValueError(f"Required PetID values missing from source CSV: {missing_rows}")

    args.public_output.mkdir(parents=True, exist_ok=True)
    entries: list[dict[str, Any]] = []
    for pet_id in sorted(required_by_pet_id):
        profile = profile_by_pet_id.get(pet_id)
        if profile is None:
            raise ValueError(f"Required PetID missing from server profiles: {pet_id}")

        source_value = csv_rows[pet_id]["ruta_imagen_principal"].strip()
        if not source_value:
            raise ValueError(f"Empty ruta_imagen_principal for {pet_id}")
        source_path = Path(source_value)
        source_name = PureWindowsPath(source_value).name
        expected_name = f"{pet_id}-1.jpg"
        if source_name != expected_name:
            raise ValueError(
                f"Source image name does not match PetID {pet_id}: {source_name}"
            )
        if profile["primaryImageFile"] != source_name:
            raise ValueError(
                f"Server profile image does not match source CSV for {pet_id}"
            )
        if not source_path.is_file():
            raise FileNotFoundError(f"Source photograph not found for {pet_id}: {source_path}")

        source_sha256 = sha256(source_path)
        target_path = args.public_output / source_name
        if target_path.exists() and sha256(target_path) != source_sha256:
            raise ValueError(f"Existing public photograph differs for {pet_id}")
        if not target_path.exists():
            shutil.copy2(source_path, target_path)
        if sha256(target_path) != source_sha256:
            raise ValueError(f"Copied photograph verification failed for {pet_id}")

        entries.append(
            {
                "petId": pet_id,
                "file": source_name,
                "sha256": source_sha256,
                "scenarios": sorted(required_by_pet_id[pet_id]),
            }
        )

    catalog = {
        "artifactVersion": "adopter-phase-c-demo-photos-v1",
        "sourceProfilesSha256": sha256(args.profiles_csv),
        "scenarioIds": [*SCENARIO_IDS, *FIXED_RESULT_SCENARIOS],
        "topResultsPerScenario": TOP_RESULTS,
        "uniquePhotoCount": len(entries),
        "photos": entries,
    }
    write_json(args.catalog_output, catalog)
    print(f"Verified and prepared {len(entries)} unique PetFinder photographs")


if __name__ == "__main__":
    main()
