#!/usr/bin/env python3
"""
Utility CLI for exercising estimation helpers without the full agent stack.

Usage examples:
  python scripts/run_estimator.py --method fpa --input examples/fpa.json
  python scripts/run_estimator.py -m storypoints -i examples/storypoints.yaml
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Callable, Dict

# Ensure project root is on sys.path when executed directly
ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

try:
    import yaml  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    yaml = None

from tools.analogous_tools import HistoricalProject, generate_analogous_estimation
from tools.bottomup_tools import WorkPackage, generate_bottom_up_estimation
from tools.cocomo_tools import generate_cocomo_ii_estimation
from tools.fpa_tools import FeatureInput as FPAFeatureInput, generate_fpa_estimation
from tools.parametric_tools import UnitBreakdown, generate_parametric_estimation
from tools.storypoints_tools import FeatureInput as StoryFeatureInput, generate_storypoints_estimation

Estimator = Callable[..., Any]

ESTIMATORS: Dict[str, Estimator] = {
    "cocomo": generate_cocomo_ii_estimation,
    "fpa": generate_fpa_estimation,
    "storypoints": generate_storypoints_estimation,
    "parametric": generate_parametric_estimation,
    "bottomup": generate_bottom_up_estimation,
    "analogous": generate_analogous_estimation,
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run estimation helper functions.")
    parser.add_argument(
        "-m",
        "--method",
        choices=sorted(ESTIMATORS),
        help="Estimation technique to execute (prompted if omitted).",
    )
    parser.add_argument(
        "-i",
        "--input",
        help="Path to JSON or YAML file containing keyword arguments.",
    )
    parser.add_argument(
        "--list-methods",
        action="store_true",
        help="List available estimation methods and exit.",
    )
    return parser.parse_args()


def load_payload(path: Path) -> Dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"Input file not found: {path}")
    ext = path.suffix.lower()
    text = path.read_text()
    if ext in {".yaml", ".yml"}:
        if yaml is None:
            raise RuntimeError("PyYAML is required to load YAML files. Install `pyyaml`.")
        return yaml.safe_load(text)
    if ext == ".json":
        return json.loads(text)
    raise ValueError(f"Unsupported input format '{ext}'. Use .json, .yaml, or .yml.")


def prompt_missing(value: str | None, message: str) -> str:
    if value:
        return value
    try:
        return input(message).strip()
    except EOFError:
        raise RuntimeError("Missing required input and no interactive terminal available.")


def main() -> int:
    args = parse_args()

    if args.list_methods:
        print("Available methods:")
        for name in sorted(ESTIMATORS):
            print(f" - {name}")
        return 0

    method_name = prompt_missing(args.method, "Select method (cocomo, fpa, storypoints, parametric, bottomup, analogous): ")
    if method_name not in ESTIMATORS:
        print(f"Unknown method '{method_name}'. Use --list-methods to view options.", file=sys.stderr)
        return 1

    input_path = prompt_missing(args.input, "Path to JSON/YAML payload: ")
    payload = load_payload(Path(input_path))

    estimator = ESTIMATORS[method_name]
    if not isinstance(payload, dict):
        print("Input payload must deserialize to a JSON/YAML object (dictionary).", file=sys.stderr)
        return 1

    try:
        if method_name == "bottomup":
            packages = payload.get("work_packages", [])
            payload["work_packages"] = [WorkPackage(**pkg) for pkg in packages]
        elif method_name == "analogous":
            projects = payload.get("historical_projects", [])
            payload["historical_projects"] = [HistoricalProject(**proj) for proj in projects]
        elif method_name == "parametric" and "unit_breakdown" in payload:
            payload["unit_breakdown"] = [UnitBreakdown(**item) for item in payload["unit_breakdown"]]
        elif method_name == "fpa" and "features" in payload:
            payload["features"] = [FPAFeatureInput(**feat) for feat in payload["features"]]
        elif method_name == "storypoints" and "features" in payload:
            payload["features"] = [StoryFeatureInput(**feat) for feat in payload["features"]]

        result = estimator(**payload)
    except TypeError as exc:
        print(f"Failed to invoke estimator: {exc}", file=sys.stderr)
        return 1

    if hasattr(result, "model_dump_json"):
        print(result.model_dump_json(indent=2))
    else:
        print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())

