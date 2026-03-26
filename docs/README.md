# Documentation Index

This folder contains the authoritative product and technical documentation for Working Hours Tracker.

## Document Map

- `ARCHITECTURE.md`  
  System architecture, module boundaries, runtime model, and data flow.

- `API_CONTRACTS.md`  
  Backend endpoint contracts, payload shapes, status codes, and merge rules.

- `DATA_SCHEMA_EXAMPLES.md`  
  Practical schema examples for root payloads, entries, metadata, and formula walkthroughs.

- `PRD.md`  
  Product requirements, scope, functional/non-functional requirements, and release priorities.

- `USER_PERSONAS.md`  
  Primary user segments, goals, pain points, and workflow expectations.

- `USER_STORIES.md`  
  Structured user stories with acceptance criteria and implementation notes.

- `VARIABLES.md`  
  Product variables dictionary, formulas, locations in app, examples, and variable relationship chart.

- `PRODUCT_METRICS.md`  
  Product-level KPI definitions, monitoring strategy, and alert thresholds.

- `METRICS_AND_OKRS.md`  
  Team OKRs and linked metrics for planning and performance management.

- `DESIGN_GUIDELINES.md`  
  UX/UI standards, responsive behavior, component rules, and theme palettes.

- `TRACEABILITY_MATRIX.md`  
  Enterprise-style mapping from goals and requirements to stories, code, tests, and metrics.

- `GUARDRAILS.md`  
  Technical and business constraints that must be respected during delivery.

- `RELEASE_SIGNOFF_TEMPLATES.md`  
  Product, design, engineering, QA, and documentation sign-off checklists.

- `NEXT_STEPS.md`  
  Planned next-phase documentation deliverables and execution order.

- `RELEASE_NOTES_DRAFT.md`  
  Ready-to-publish release summary draft for GitHub Releases.
- Internet speed telemetry and structured tooltip improvements are documented across `ARCHITECTURE.md`, `VARIABLES.md`, `PRODUCT_METRICS.md`, and `TRACEABILITY_MATRIX.md`.

## Cross-File Usage Guidance

- Start from `PRD.md` for feature intent and scope.
- Use `TRACEABILITY_MATRIX.md` to validate implementation and QA coverage.
- Use `VARIABLES.md` + `PRODUCT_METRICS.md` for analytics and reporting definitions.
- Use `DESIGN_GUIDELINES.md` + `GUARDRAILS.md` for UX and engineering boundary decisions.
- Use `TRACEABILITY_MATRIX.md` to confirm Statistics tooltip and localization requirements map to implementation surfaces and metrics.

## Change Governance

All major documentation updates must include corresponding release notes in `../CHANGELOG.md`.

## Planned Documentation Roadmap

- Next planned deliverables are tracked in `NEXT_STEPS.md`.
