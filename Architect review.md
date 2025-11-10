Architecture Review Overview
catalog-modules — Summarize primary packages (app.py, agents/, tools/, scripts/) and describe responsibilities.
map-data-flow — Trace how user input moves through intake, estimation helpers, and outputs, noting key dependencies (tools/schema.py, estimator functions).
assess-patterns — Identify design patterns (factory-like builders, strategy mapping, shared schema) and reference representative modules.
flag-risks — Highlight architectural concerns such as global session state, concurrency, or config gaps that could impact scaling or maintainability.