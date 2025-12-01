# Multi-Agent Workflow Architecture – Architect Review

## 1. High-Level Overview

- **Goal**: Deliver explainable cost estimates through a stateful, multi-agent workflow that guides users from baseline intake to narrative summaries.
- **Core Engine**: `workflow/WorkflowOrchestrator` governs project context, expansion, parsing, method selection, estimator registration, and explanation.
- **Primary Interfaces**:
  - **FastAPI Microservice** (`main.py`) – REST API handling chat, validation, and report generation for the frontend.
  - **Autogen Team** (`autogen_team_descriptor.json`) – Conversational, Interpreter, Method Selector, Explainer, and Specialist agents sharing orchestrator tools.
  - **Programmatic API** – `WorkflowOrchestrator` plus helpers in `tools/orchestrator_tools.py`.
  - **CLI** – `python app.py` (offline) and `run_workflow_conversation()` (Autogen) drive end-to-end flows.

## 2. Layered Components

| Layer                   | Responsibility                                         | Key Modules                                                                                     |
| ----------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| **Presentation**        | Conversational UX, CLI, GUI integration                | `main.py` (FastAPI), `app.py`, Autogen agents                                                   |
| **Orchestration**       | Workflow state machine, event logging, coordination    | `workflow/controller.py`, `tools/orchestrator_tools.py`, `workflow/tracing.py`                  |
| **Services**            | Expansion, parsing, method scoring, explanations       | `workflow/expansion.py`, `workflow/parser.py`, `workflow/selection.py`, `workflow/explainer.py`, `workflow/inference_service.py`, `workflow/report_generator.py` |
| **Persistence & Audit** | Project context storage, versioning, events            | `workflow/repository.py`, `workflow/events.py`                                                  |
| **Estimation Engines**  | Deterministic calculators returning structured outputs | `tools/*_tools.py` (cocomo, storypoints, parametric, bottomup, analogous, fpa, hybrid, intake)  |

## 3. Agent Roles & Handoffs

- **ConversationalAgent**: Captures baseline fields, submits user descriptions, relays orchestrator status, and manages the user interaction loop.
- **IntakeAgent**: Validates Step 1 baseline inputs and structures initial project context via `intake_tools`.
- **InterpreterAgent**: Generates `ExpansionV1` drafts with provenance and missing signals using `draft_expansion_tool`.
- **MethodSelectorAgent**: Invokes `evaluate_methods_tool` to produce `SelectionPayload` (primary/blend methods, completeness scores, required inputs).
- **ExplainerAgent**: Calls `generate_explanation_tool` to surface Markdown summaries, key drivers, assumptions, and improvement prompts.
- **HybridAgent**: Provides quick, approximate estimates when detailed data is missing.
- **RunnerAgent**: Coordinates the execution of multiple estimation agents (if active).
- **Calculators**: Individual estimator agents (COCOMO, FPA, Agile SP, Parametric, Bottom-up, Analogous) ready to plug into automated execution.

## 4. Data Contracts

- Workflow schemas (`workflow/schemas.py`) define `BaselineInputs`, `ProjectContext`, `ParsedContextV1`, `SelectionPayload`, `ResponseEnvelope`, `CostEstimationReport`.
- Estimator schema (`tools/schema.py`) includes:
  - `cost_range` & `duration_range` (PERT triples with units/currency).
  - `team` array of `TeamRoleCount` (role, count, indicative rate).
  - `drivers`, `assumptions`, `milestones`, `recommendations`, optional `blend_components`.
  - JSON-friendly `results` block (effort, cost breakdown, timeline, deliverables).

## 5. Workflow Control Flow

1. **Intake & Validation** – `IntakeAgent` validates Step 1 inputs; `ConversationalAgent` manages chat-based refinement.
2. **User Narrative & Expansion** – Description stored; `ExpansionService` infers modules, platforms, gaps; `InferenceService` derives technical metrics (KSLOC, Story Points).
3. **Method Evaluation** – `MethodSelector` scores techniques, emits confidence, backups, follow-up questions (`required_inputs`).
4. **Estimation Attachment** – Calculators (or `HybridAgent`) produce enriched `EstimationOutput`; orchestrator persists through `attach_estimate`.
5. **Full Report Generation** – `ReportGeneratorService` compiles all data into a comprehensive `CostEstimationReport`.
6. **Explanation** – `ExplainerService.build_summary` composes Markdown summary consumed by agents/CLI.
7. **Persistence & Audit** – SQLite `ProjectContextRepository` versioning plus `EventLogger` ensure replay/audit support.

## 6. Modes & Integration

- **Offline deterministic mode** (default) uses `offline_model_client.DummyModelClient`.
- **LLM-enabled mode** toggled via `USE_WORKFLOW_LLM` + `OPENAI_API_KEY` / `OPENROUTER_API_KEY`.
- `build_workflow_team()` assembles Autogen GroupChat programmatically; descriptor file mirrors the configuration for GUI imports.

## 7. Testing & Fixtures

- **Pytest**: `tests/test_workflow_end_to_end.py` validates baseline → expansion → selection → estimator attachment → explanation.
- **Sample Session**: `examples/workflow_session.json` demonstrates baseline context, selection output, estimator payload, and explanation text.
- **Documentation**: `docs/testing.md` updated with workflow CLI instructions, Autogen usage, and test guidance.

## 8. Risks & Follow-Ups

- **Automated Estimation Loop**: Orchestration trigger for running calculators automatically is implemented via `main.py` but could be further decentralized to `RunnerAgent`.
- **Validator Deprecations**: Pydantic V1 `@validator` usage should migrate to V2 `@field_validator` to avoid future breakage.
- **Configuration Centralisation**: Hourly rates, thresholds, prompts still embedded in code; consider evolving toward config-driven values.
- **Expansion Service**: LLM integration behind feature flag; add guardrails and tracing before enabling in production environments.
- **Frontend Integration**: Ensure `ProfessionalCostEstimationService.tsx` stays in sync with backend schema changes (especially `CostEstimationReport`).

## 9. Success Criteria Alignment

- Conversational flow requests only minimal baseline upfront and iteratively asks for missing signals.
- Method selector produces deterministic confidence, backups, and follow-up questions.
- Estimation outputs deliver transparent drivers, assumptions, and PERT ranges ready for blending/explanation.
- Explainer summarises results in stakeholder-friendly sections with improvement prompts.
- Persistent audit trail (events, versioned contexts) supports compliance, debugging, and analytics.
