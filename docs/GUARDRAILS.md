# Product and Technical Guardrails

This document defines non-negotiable constraints to protect product quality, data integrity, and delivery reliability.

## 1. Business Guardrails

- Do not ship features that compromise core entry accuracy (date/time/status/location/timezone).
- Do not introduce analytics labels or formulas without documented variable definitions.
- Do not claim KPI improvements without measurable evidence from defined metrics.
- Keep user-facing wording consistent, professional, and localized.

## 2. UX Guardrails

- No critical action may become hidden or unreachable at supported breakpoints.
- Avoid fixed-size patterns that create clipping, truncation, or unusable dead space.
- Keep interaction patterns consistent between similar modals and card systems.
- Ensure compact values always have access to full-value context (for example via tooltips).
- Statistics tooltips must use the custom tooltip system (`data-stats-tooltip` + `.stats-custom-tooltip`) and must not rely on native `title` attributes. This prevents duplicate tooltips and improves responsive readability.

## 3. Localization Guardrails

- New user-visible strings must be added through i18n keys.
- Avoid hardcoded language fallbacks in production-facing UI.
- Timezone labels and related city tokens must support localization strategy.
- Locale completeness must be validated before release.
- Tooltip and micro-label text must not depend on i18n keys that are missing across some locale packs. If full coverage cannot be guaranteed, use already-localized tokens only (e.g., `calendarStats.weekdaysShort`, localized status labels, localized location labels).
- The language selector must keep any enhanced UI wrappers (e.g., smart-select) synchronized after `applyTranslations()` so labels and options reflect the chosen language immediately.

## 4. Data and Integrity Guardrails

- Persisted entries require stable identity (`id`) and change timestamps.
- Merge logic must prefer newer updates and retain canonical date mapping.
- Normalization must enforce valid time ranges and known status/location enums.
- Data writes must not silently drop unrelated profile segments.

## 5. Architecture Guardrails

- Preserve modular boundaries in `js/` (avoid monolithic cross-cutting logic).
- Do not bypass shared utility functions when equivalent helper exists.
- Keep backend endpoints backward-compatible unless versioning is introduced.
- Avoid introducing heavy dependencies without clear operational value.

## 6. Operational Guardrails

- Document behavior changes in `CHANGELOG.md`.
- Update impacted docs in the same delivery cycle as code changes.
- Maintain traceability linkage from requirement to implementation and test evidence.
- Regression-check entry flow, filtering, statistics, infographic, and exports before release.

## 7. Security and Privacy Guardrails

- Treat local JSON data as potentially sensitive operational data.
- Avoid logging personal/sensitive text fields in production-like logs.
- Keep API usage within trusted network contexts unless auth is added.

## 8. Release Gate Checklist

- [ ] Functional requirements still pass.
- [ ] No responsive clipping/chopping regressions.
- [ ] Localization checks pass for touched areas.
- [ ] Data merge behavior validated on changed paths.
- [ ] Traceability matrix and changelog updated.
