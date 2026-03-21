# User Personas

**Last updated:** 2026-03-20

Narrative personas below describe primary contexts for **Working Hours Tracker**. They inform UX priorities, reporting depth, and documentation tone. Map concrete behaviors to `docs/USER_STORIES.md` and `docs/TRACEABILITY_MATRIX.md`.

## Persona A - Individual Contributor

- **Primary context:** logs daily work and leave personally.
- **Goals:** quick logging, accurate overtime visibility, easy month review.
- **Pain points:** manual spreadsheets, inconsistent calculations.
- **High-value features:** clock helpers, form save, filters, stats card, calendar, voice review, break and non-work defaults that reduce mistakes.

## Persona B - Multi-Contract Freelancer

- **Primary context:** tracks separate clients/contracts.
- **Goals:** strict profile separation, per-context reporting, clean exports.
- **Pain points:** mixed records and reconciliation overhead.
- **High-value features:** multi-profile model, export/import, PPT highlights.

## Persona C - Team Lead

- **Primary context:** reviews workload and leave trends.
- **Goals:** identify overtime patterns and staffing pressure.
- **Pain points:** fragmented reporting and missing historical consistency.
- **High-value features:** statistics summary, infographic, filtered analysis, multi-entry batch edit for consistent corrections across a week or sprint.

## Persona D - HR/Compliance Coordinator

- **Primary context:** validates leave/overtime records for audit readiness.
- **Goals:** consistent status logging and quota visibility.
- **Pain points:** incomplete metadata and inconsistent format quality.
- **High-value features:** vacation quota logic, status/location consistency, exports.

## Persona E - Global/Timezone Worker

- **Primary context:** works across timezone boundaries.
- **Goals:** preserve original entry timezone and compare in selected view zone.
- **Pain points:** timezone conversion errors and ambiguous records.
- **High-value features:** timezone picker, view-times-in selector, Luxon-based rendering.

## Cross-Cutting Experience Expectations

- Theme and language selectors should remain discoverable and stable across refresh and locale/theme changes.
- Core data entry and reporting must work without requiring cloud infrastructure.
- When locale packs are fully manual (file-based full packs, including `id` via `js/i18n-id-locale.js`), key UI and help content should not regress due to shell merge overwrites.
- Accessibility: icon-only controls should provide `aria-label`/`title`, and keyboard navigation should work for filters, modals, and table actions.
- Accessibility/i18n: non-text status indicators (such as the internet connectivity badge) must keep tooltip/ARIA text synchronized with the currently selected language via manual full i18n packs.

## Persona-to-Feature Fit Matrix

| Persona | Entry | Filters/Search | Reporting | Data Portability | Theme/Language |
|---|---|---|---|---|---|
| Individual Contributor | High | High | Medium | Medium | Medium |
| Multi-Contract Freelancer | High | High | High | High | Medium |
| Team Lead | Medium | High | High | Medium | Medium |
| HR/Compliance Coordinator | Medium | Medium | High | High | Medium |
| Global/Timezone Worker | High | Medium | Medium | Medium | High |
