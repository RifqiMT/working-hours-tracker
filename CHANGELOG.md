# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added
- Comprehensive documentation baseline refresh:
  - `README.md`
  - `PRODUCT_DOCUMENTATION_STANDARD.md`
  - `docs/README.md`
  - `docs/ARCHITECTURE.md`
  - `docs/PRD.md`
  - `docs/USER_PERSONAS.md`
  - `docs/USER_STORIES.md`
  - `docs/VARIABLES.md` (with variable relationship chart)
  - `docs/PRODUCT_METRICS.md`
  - `docs/METRICS_AND_OKRS.md`
  - `docs/DESIGN_GUIDELINES.md`
  - `docs/TRACEABILITY_MATRIX.md`
  - `docs/GUARDRAILS.md`
- Phase 2 documentation hardening:
  - `docs/API_CONTRACTS.md`
  - `docs/DATA_SCHEMA_EXAMPLES.md`
  - `docs/RELEASE_SIGNOFF_TEMPLATES.md`
- Documentation roadmap tracking:
  - `docs/NEXT_STEPS.md` for Phase 3 planned artifacts (`TEST_PLAN.md`, `RISK_REGISTER.md`, `OPERATIONAL_RUNBOOK.md`)

### Changed
- Documentation aligned with latest implementation across:
  - entry lifecycle and profile behavior
  - filters/search workflows
  - statistics and infographic UX
  - localization and timezone behaviors
  - API sync and merge semantics
- Statistics section tooltip behavior and localization were hardened:
  - custom responsive tooltip rendering (no duplicate native `title` tooltips)
  - localized weekday abbreviations and localized tooltip micro-labels
  - language selector synchronization across enhanced UI components
- Statistics tooltips were fully refined for readability:
  - structured title/section/detail rendering for dense breakdown content
  - dedicated average-subsection tooltips in combo cards
  - weekday and location breakdowns expanded for total and average contexts
- Connectivity indicator was improved:
  - real-time internet speed estimate in Mbps (when browser telemetry is available)
  - daily min/max/avg speed summary in tooltip context
  - silent/seamless update strategy with event-driven refresh and lightweight polling fallback
- Filter selector UX was stabilized:
  - semantic ordering preserved in smart-select for month/weekday/day/week (with `All` first)
- PPT generator modal was resized to match Statistics Summary and Infographic dynamic viewport envelope.

### Notes
- This release establishes a stronger enterprise documentation governance baseline with explicit contracts and sign-off templates.
