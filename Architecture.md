# Architecture Overview

## Module Responsibilities

- `app.py`: main orchestration entry point; wires estimator functions to a dispatch map, spins up Autogen group chats for intake/runner agents, and provides CLI helpers (`estimate`, `run_team_conversation`, `build_team_for_gui`).
- `agents/`: builders for Autogen `ConversableAgent` roles. `intake_agent` handles requirements gathering via session-aware tools, `runner_agent` executes estimators, and specialized agents (`cocomo_agent`, `fpa_agent`, etc.) support optional multi-agent selection flows.
- `tools/`: deterministic estimation engines (`storypoints`, `cocomo`, `parametric`, `bottomup`, `analogous`, `fpa`) plus shared schemas (`schema.py`) and intake utilities (`intake_tools`). Each function returns the common `EstimationOutput` Pydantic model.
- `scripts/`: operational utilities such as `scripts/run_estimator.py` to exercise estimators or the offline intake flow from the command line.
- `data/`, `examples/`, `docs/`: reference payloads, sample inputs, and supporting documentation/tests used by estimators and contributors.

## Data Flow

1. User text enters through `app.estimate()`. When an LLM config is available, it instantiates a group chat via `build_estimation_team`; otherwise it falls back to the deterministic `offline_intake_flow`.
2. The intake agent repeatedly calls `tools.intake_tools.intake_step`, which derives the target estimation method, tracks required inputs in `_SESSION_STORE`, and surfaces follow-up questions.
3. Once the payload is confirmed, `intake_finalize` stores it in `_COMPLETED_PAYLOADS`. The runner agent (or CLI) retrieves it with `consume_final_payload` and selects the matching estimator from a local strategy map.
4. Estimator helpers (`generate_storypoints_estimation`, `generate_cocomo_ii_estimation`, etc.) compute cost/timeline outputs and hydrate the shared `EstimationOutput` schema for downstream consumers.

## Design Patterns

- **Strategy dispatch**: estimator selection is data-driven via dictionaries like `ESTIMATORS` in `app.py`, `agents/runner_agent.py`, and `scripts/run_estimator.py`.
- **Builder/factory helpers**: functions such as `build_intake_agent` and `build_runner_agent` encapsulate Autogen agent configuration, isolating prompts and tool exposure.
- **Shared domain models**: `tools/schema.py` defines a single Pydantic contract (`EstimationOutput`), enforcing consistent responses across estimation methods.
- **Mediator-style coordination**: the optional `agents/decision_engine.py` composes specialized agents into a `GroupChatManager`, delegating technique selection to an orchestrating agent.

## Architectural Considerations

- **Global session state**: `_SESSION_STORE` and `_COMPLETED_PAYLOADS` live in-memory, so concurrent sessions can clash and data is lost on restart; move to a persistence-capable store (database, cache) for robustness.
- **Coupling to Autogen & LLM config**: online/offline modes use different code paths, and the offline mode blocks on `input()`, complicating non-interactive environments; abstracting the intake transport could unify flows.
- **Duplicated estimation scaffolding**: team composition, milestone generation, and timeline logic recur across estimator modules; extracting shared helpers would reduce drift and ease calibration.
- **Distributed configuration**: defaults (model names, hourly rates, DB paths) are scattered. Centralizing configuration management would simplify deployment and tuning.

## Proposed Workflow Architecture

| Step                     | Description                                                                                   | Candidate Components                                                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User Interaction         | Conversational agent gathers open-ended project descriptions and iteratively refines details. | Extend `agents/intake_agent.py` prompt to encourage richer narratives; route via `app.build_estimation_team`.                                                  |
| Semantic Expansion       | LLM expands sparse ideas into structured narratives before confirmation with the user.        | Introduce `agents/expander_agent.py` or augment intake agent with a tool calling an LLM prompt template; store expansion drafts in session state.              |
| Confirmation Loop        | Present expanded summary to user for approval or correction.                                  | Intake agent mediates expansion confirmation; updates `_SESSION_STORE` with user-approved description.                                                         |
| Keyword Parsing & Memory | Parser extracts features, complexity, platform, monetization, historical references.          | New `parser` module (e.g., `tools/parser_tools.py`) that persists structured fields into a durable store (DB/Redis) via a `ProjectContext` model.              |
| Method Evaluation        | Decide best estimation technique based on available parameters.                               | Enhance `agents/decision_engine.py` with explicit rule set; optionally replace `_default_payload` logic in `intake_tools` with rule-driven selector.           |
| Estimation Execution     | Invoke selected estimator(s) with prepared inputs.                                            | Existing helpers in `tools/*.py`; integrate via runner agent or new orchestrator to support hybrid blends and confidence scoring.                              |
| Explainable Output       | Summarize estimates, rationale, and assumptions and prompt for refinements.                   | Reuse conversational agent plus a dedicated `Explainer` function that converts `EstimationOutput` into narrative (potentially leveraging LLM with guardrails). |

### Baseline User Inputs

Before invoking expansion or inference steps, the conversational agent should explicitly gather the following minimal data points (with enumerated choices where possible) to anchor estimation accuracy:

- **Project Type**: Software Development, AI/ML Project, System Integration, Cloud Migration, Mobile Application, Web Application.
- **Project Complexity**: Low (Simple), Medium (Moderate), High (Complex), Very High (Highly Complex).
- **Tech Stack Focus**: Web technologies, Mobile development, AI/ML technologies, Cloud technology, Enterprise systems.
- **Team Preferences**: Desired or expected team size so estimators can derive distribution across senior, mid, and junior roles.
- **Region**: Primary delivery geography for salary benchmarks and labor rate calibration.

These prompts can be codified in `intake_tools` (e.g., `questions["project_type"]`, etc.) and surfaced early in the intake dialogue to ensure downstream estimators receive grounded inputs supplied directly by the user.

### Data Flow Adaptations

1. **Session Context**: replace `_SESSION_STORE` with a durable `ProjectContextRepository` that persists raw inputs, drafts, confirmations, parsed context, selections, estimates, and events per `project_id`.
2. **Expansion Pipeline** _(status-gated)_: `user_text` → `ExpansionService` produces `ExpansionV1` with provenance + diff; store draft with `status:"NEEDS_CONFIRMATION"` and surface prompt: “Here’s a concise expansion of your idea…”.
3. **Confirmation Loop**: intake agent relays draft to user; on `approve`, snapshot is persisted with `source:"user"` for confirmed spans; on edits, recompute diff and update provenance.
4. **Structured Memory & Parsing**: confirmed narrative plus `prior_answers` flow into `ParserService` → `ParsedContextV1`. Parser enforces value ranges, sets confidences, enumerates `missing_signals` (top 3).
5. **Method Selection**: `MethodSelector` evaluates rule set, returns `{"primary":..., "backups": [...], "rationale": "...", "completeness_scores": {...}}`. If multiple qualify, mark `primary:"blend"` and list backups.
6. **Estimator Invocation**: orchestrator triggers estimator(s) only when `status:"OK"`; each estimator records `inputs_snapshot`, drivers (SF/EM/UFP/reuse), confidence, PERT range, and assumptions.
7. **Explanation Layer**: `Explainer` converts outputs + rationale into narrative + machine-readable block, merges `improvement_prompts`, and prepares next-best question when data gaps remain.

### Required Enhancements & Gaps

- **Persistent Context Store**: implement a storage layer to retain conversations, expansions, parsed fields, and estimation results across sessions.
- **Parser Model Integration**: develop or integrate NLP pipelines (keyword extraction, entity recognition) tuned to estimation signals; expose via `ParserService`.
- **Rule Engine**: codify method-selection heuristics with testable rule tables + completeness scoring, enabling deterministic routing and blends.
- **Agent Coordination**: orchestrate hand-offs between conversational agent, LLM expander, parser, selector, and estimator—likely via Autogen GroupChat with ordered speaker selection or a custom workflow controller.
- **Explainability Module**: ensure estimator outputs include rationale, covering assumptions, data gaps, and confidence to support user trust and iterative refinement.
- **Event Logging & Audit**: centralize event emission (`INTAKE_TEXT_CREATED`, `EXPANSION_DRAFTED`, etc.) with timestamps for full traceability.

## Data Contracts

- **ExpansionV1**
  - `summary: str`
  - `features: List[{name: str, source: "user"|"inferred"}]`
  - `non_functionals: List[{name, source}]`
  - `platforms: List[{name: Literal["web","ios","android","desktop","cloud","other"], source}]`
  - `constraints: List[{text, source}]`
  - `assumptions: List[str]`
  - `trace: List[{field: str, value: str, source: "user"|"inferred", note: str}]`
- **ParsedContextV1**
  - `size`, `agile`, `complexity_signals`, `platforms`, `quality`, `team`, `reuse`, `rates`
  - `provenance: List[{field: str, source: "user"|"inferred", span: str, confidence: float}]`
  - `missing_signals: List[str]` (prioritized high-impact gaps)
- **SelectionPayload**
  - `primary: Literal["cocomo2","fpa","agile_sp","analogous","parametric","blend"]`
  - `backups: List[str]`
  - `rationale: str`
  - `completeness_scores: Dict[str, float]`
- **EventEnvelope**
  - `events: List[{type: str, at: datetime, data: dict}]` with canonical types documented above.
- **ResponseEnvelope**
  - `status: "OK"|"NEEDS_CONFIRMATION"|"BLOCKED"|"ERROR"`
  - `expansion_draft: ExpansionV1 | null`
  - `parsed: ParsedContextV1 | null`
  - `selection: SelectionPayload | null`
  - `estimates: List[EstimationOutput]`
  - `events: List[...]`
  - `message_to_user: str`

## Persistence & Services

- `ProjectContextRepository` (SQLModel/SQLite for now) keyed by `project_id`, versioned per interaction.
- `ExpansionService` orchestrates LLM call, provenance tagging, diffing.
- `ParserService` applies hybrid NLP + rule-based extraction, clipping, confidence scoring.
- `MethodSelector` implements prioritized rule evaluation + completeness scoring + blend handling.
- `EventLogger` appends structured events per project with monotonic timestamps.
- `ExplainerService` generates narrative + machine-readable improvement prompts using estimator outputs and missing signals.
