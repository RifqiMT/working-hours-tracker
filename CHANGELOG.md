# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added
- Traceability rows **TM-016–TM-019** and user stories **US-016–US-019** (Infographic timeframe, clock 3×2 layout, cluster naming, long-form durations).
- Product metric **PM-15** (directional Infographic timeframe exploration) and OKR cross-reference in `docs/METRICS_AND_OKRS.md`.
- Variables dictionary **section 3e** — Infographic timeframe and period variables, plus an Infographic relationship diagram in `docs/VARIABLES.md`.

### Removed
- `docs/NEXT_STEPS.md` and all documentation references to a “next steps” / Phase 3 documentation roadmap (`PRODUCT_DOCUMENTATION_STANDARD.md`, `docs/README.md`, `docs/RELEASE_NOTES_DRAFT.md`).

### Changed
- Enterprise documentation aligned with **current Infographic** behavior (clusters, timeframe grains, newest-first period order, scroll/sticky tables, 3×2 clock grid, CSV parity): `README.md`, `PRODUCT_DOCUMENTATION_STANDARD.md`, `docs/PRD.md` (**FR-05**), `docs/ARCHITECTURE.md`, `docs/DESIGN_GUIDELINES.md`, `docs/GUARDRAILS.md`, `docs/TRACEABILITY_MATRIX.md`, `docs/PRODUCT_METRICS.md`, `docs/USER_PERSONAS.md`, `docs/USER_STORIES.md`, `docs/README.md`.
- `js/infographic.js`: **General** summary table now uses `formatInfographicMinutes` for average working hours and overtime rows (consistent with long-form duration policy).

### Changed (prior baseline)
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
