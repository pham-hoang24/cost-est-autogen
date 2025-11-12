# Testing Guide

## 1. Prepare the Environment

1. **Activate the virtual environment**

   ```bash
   cd /Users/phamhoang/Desktop/Cost-est-autogen/cost-est-autogen
   source .venv/bin/activate
   ```

2. **Load local secrets**

   ```bash
   set -a
   source .env        # contains OPENAI_API_KEY
   set +a
   ```

   Skip this when running offline.

3. **Choose LLM mode**
   - Offline testing: set `LLM_CFG = False` in `app.py`.
   - Live agent runs: restore `LLM_CFG` to a dict containing `model`, `temperature`, and `api_key`.

## 2. Run the Workflow CLI

The primary entry point now walks through the orchestrated multi-agent workflow
without requiring a live LLM:

```bash
python app.py
```

You will be prompted for the baseline fields (project type, complexity, tech stack,
team size, region) followed by a free-form project description. The CLI then:

1. Persists the baseline via `WorkflowOrchestrator`.
2. Generates a deterministic semantic expansion for review.
3. Computes method-selection scores and highlights missing inputs.
4. Renders the explainer summary (if estimator outputs have been attached).

If the pipeline still needs more data the CLI clearly lists the follow-up questions.

## 3. Running the Multi-Agent Team

The Autogen configuration mirrors the workflow agents:

```bash
python - <<'PY'
from app import run_workflow_conversation

run_workflow_conversation("Let's start a new estimation session.")
PY
```

- Set `OPENAI_API_KEY` and ensure `USE_WORKFLOW_LLM` (or the default) is truthy to
  run with live LLMs.
- Unset the key or export `USE_WORKFLOW_LLM=0` to run in deterministic offline mode
  using `DummyModelClient`.
- Import `autogen_team_descriptor.json` into Autogen Studio to drive the same team
  through the GUI.

## 4. End-to-End Tests

Pytest is the recommended harness for validating the workflow services. The new
test suite spins up an in-memory repository, walks through the orchestrator
pipeline, attaches a deterministic Story Points estimate, and verifies that the
explainer produces a structured summary.

```bash
pytest tests/test_workflow_end_to_end.py -q
```

The test data mirrors `examples/workflow_session.json`, which you can use as a
fixture when experimenting with API integrations.

## 5. Estimator Utilities

`scripts/run_estimator.py` remains available for calling the deterministic
calculators directly:

```bash
python scripts/run_estimator.py --method fpa --input examples/fpa.json
```

- Use `--list-methods` to display available estimators.
- Provide `--intake` to try the legacy offline intake flow (still useful for
  quick checks even though the orchestrator supersedes it).

## 6. Sample Payloads

Starter payloads live under `examples/`:

- `cocomo.json` – Post-Architecture COCOMO inputs
- `fpa.json` – Function Point counts and GSC ratings
- `storypoints.yaml` – Agile story-point scenario
- `parametric.json` – Cost-per-unit calibration example
- `bottomup.yaml` – Work-package breakdown
- `analogous.json` – Historical analogue blend

Copy and adjust these files to explore different scenarios.

## 4. Re-enabling Full Agent Chats

1. Ensure your `.env` includes a valid `OPENAI_API_KEY`.
2. Set `LLM_CFG` in `app.py` back to a configuration dict:
   ```python
   LLM_CFG = {"model": "gpt-4o", "temperature": 0, "api_key": OPENAI_API_KEY}
   ```
3. Rerun `python app.py` to let the decision engine orchestrate the agent conversation.
