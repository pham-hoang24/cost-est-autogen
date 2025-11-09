# FPA Tools Implementation Plan

## Overview

- Build `tools/fpa_tools.py` on top of the shared estimation schema so FPA-driven estimates match the structure produced by COCOMO helpers.

## Tasks

- **Define core structures**: create dataclasses/enums for Function Point components (EI, EO, EQ, ILF, EIF), complexity thresholds, and the 14 General System Characteristics.
- **Unadjusted FP calculation**: normalize user inputs, map aliases to canonical component names, apply the weight matrix, and sum total Unadjusted Function Points (UFP).
- **Value Adjustment Factor**: validate GSC ratings, compute Total Degree of Influence, and derive the multiplier `0.65 + 0.01 * TDI`.
- **Effort & cost translation**: implement `generate_fpa_estimation()` that converts adjusted FP into labor hours and cost, honoring productivity and billing assumptions while populating the `EstimationOutput` payload.
- **Schedule & staffing**: estimate calendar duration from effort, derive team size using reusable helpers (consider sharing `_build_team_composition`), and fabricate milestone/timeline data mirroring the richness of COCOMO outputs.
- **Reference metadata**: expose helpers like `list_component_weights()` and `list_gsc_definitions()` so callers can present valid options and descriptions.
- **Validation & defaults**: provide deterministic behavior with explicit default parameters and informative errors for missing/invalid inputs.
- **Testability**: keep functions pure, parameterized, and free from side effects to simplify unit testing and downstream agent integration.
