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

## 2. Run the Estimator CLI

Use the helper script from the project root to invoke estimators directly:

```bash
python scripts/run_estimator.py --method fpa --input examples/fpa.json
python scripts/run_estimator.py --method storypoints --input examples/storypoints.yaml
```

- Omit `--method` or `--input` to be prompted interactively.
- Use `--list-methods` to view available techniques.
- YAML support requires `pyyaml` (already included in `requirements.txt`).

The tool prints the `EstimationOutput` JSON so you can diff or pipe the results:

```bash
python scripts/run_estimator.py -m cocomo -i examples/cocomo.json > output.json
```

## 3. Sample Payloads

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
