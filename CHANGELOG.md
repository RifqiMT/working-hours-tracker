# Changelog

All notable changes to `working-hours-tracker` are documented in this file.

Format follows a pragmatic release-note style with dated entries.

## 2026-03-24

### Product and UX

- Refined the vacation quota modal to a modern responsive structure (header/body/footer), with improved row cards and consistent action styling.
- Changed vacation quota modal default year window to `2021–2030`, and added decade expansion controls (`-10Y`, `+10Y`).
- Added safe draft retention during vacation-range expansion and merge-safe saving so hidden-year values are preserved.
- Enhanced all filter selectors with searchable/suggestive smart-select behavior and ranked matching.
- Updated multiple-entry “Use example” working-day defaults to `WFH` and `1-hour` break.

### Data and Time Horizon

- Added supported year constants and guard logic to ensure app usability through at least end of `2070`.
- Expanded year option generation and clamped calendar navigation to supported bounds.

### Sync and Integrity

- Server sync payload handling uses `express.json({ limit: '25mb' })`.
- Client/server dedupe and merge behavior remains aligned around canonical date/time normalization and latest-update conflict resolution.

### Documentation

- Refreshed and synchronized root/docs documentation set to current implementation:
  - `README.md`
  - `PRODUCT_DOCUMENTATION_STANDARD.md`
  - `docs/README.md`
  - `docs/PRD.md`
  - `docs/USER_PERSONAS.md`
  - `docs/USER_STORIES.md`
  - `docs/VARIABLES.md`
  - `docs/PRODUCT_METRICS.md`
  - `docs/METRICS_AND_OKRS.md`
  - `docs/DESIGN_GUIDELINES.md`
  - `docs/TRACEABILITY_MATRIX.md`
  - `docs/GUARDRAILS.md`
  - `docs/ARCHITECTURE.md`

