# Product Metrics Catalog

**Last updated:** 2026-03-20

Defines product-level metrics with formulas, sources, and interpretation guidance.

## Measurement Principles

- Prefer implementation-aligned formulas derived from `js/time.js`, `js/render.js`, and reporting modules (`js/stats-summary.js`, `js/infographic.js`, PPT/highlights code paths).
- Separate **operational metrics** (derivable from the local dataset) from **experience/research metrics** (usability tests and surveys).
- Report metrics by **profile** and by **period** (week/month/quarter/year) using the app’s current filter context or selected calendar date range.

## Core Operational Metrics (Derived from local dataset)

| Metric | Definition | Formula (code-aligned) | Source in code | Assumptions / Caveats |
|---|---|---|---|---|
| Daily Logging Coverage | Share of expected workdays that have at least one valid `work` entry. | `logged_workdays / expected_workdays` | `js/filters.js`, `js/time.js`, reporting | Expected workdays uses a weekday policy (Mon–Fri) for the selected period; the app does not model public holidays explicitly. |
| Entry Completeness | Share of entries that satisfy the minimum field set for reliable duration math and reporting. | `complete_entries / total_entries` | entry schema in `js/import.js` + duration rules in `js/time.js` | Required fields for completeness: `date`, parseable `clockIn`, parseable `clockOut`, numeric `breakMinutes` (clamped to ≤ 1,440 when saved via current UI/parser), `dayStatus`, `location`, `timezone`. `description` may be empty. |
| Invalid Duration Rate | Share of `work` entries whose `workingMinutes` cannot be computed. | `invalid_work_entries / total_work_entries` | `js/time.js` (`workingMinutes`) | “Invalid” means `W.workingMinutes(...) === null` (unparseable time or negative span). |
| Overtime Load | Total overtime volume in the period (minutes converted to hours). | `sum(overtimeMinutes) / 60` | overtime computation in `js/render.js`, chart aggregation in `js/stats-summary.js`, exports | Overtime applies to entries with `dayStatus === 'work'` only. |
| Overtime Incidence | Share of workdays with any overtime. | `overtime_workdays / workdays` | `js/stats-summary.js` aggregation logic | A “workday” is a unique `date` with at least one valid `work` entry; overtime_workday requires at least one entry with `overtimeMinutes > 0`. |
| Vacation Utilization | Used vacation vs allocated vacation quota for the profile/year(s) in scope. | `vacation_used / vacation_quota` | `js/vacation-days.js`, `js/infographic.js` | `vacation_used` counts entries with `dayStatus === 'vacation'`; quota comes from `vacationDaysByProfile[profile][year]`. If quota is 0, treat the metric as N/A. |
| Sync Reliability | Fraction of sync attempts that complete successfully. | `successful_sync_ops / attempted_sync_ops` | `server.js`, `js/data-sync.js` | Requires instrumentation or server response capture; current client code is best-effort and may not expose counts without additions. |

## Product Experience Metrics

| Metric | Definition | Measurement Method |
|---|---|---|
| Time to First Valid Entry | Time from first app open to the first saved entry that yields computable `workingMinutes`. | usability test / instrumentation |
| Advanced report output usage rate | Share of active profiles that generate at least one advanced output within a period (stats summary, infographic export, or PPT highlights). | lightweight instrumentation (event logging) or support-ticket tagging |
| Report Generation Efficiency | Time to generate a target output (stats chart, infographic CSV, PPT highlights). | usability test |
| Search Precision Perception | User-rated relevance for search results and typeahead suggestions. | structured survey |
| Theme/Language Discoverability | Ease of finding and applying theme and language controls. | usability test |
| Locale UI completion | Degree to which a locale’s resolved UI strings match the file-based manual pack expectations (no network pre-cache required), including icon-only tooltip/ARIA labels. | compare resolved keys vs `translations.en` in runtime; validate offline structural completeness in CI via `node scripts/verify-manual-locale-packs-offline.js`, and selector/shell coverage parity via `npm run verify:i18n` |
| Pre-cache success rate | N/A in offline-first mode because the runtime network warmup/pre-cache flow is disabled/hidden. | not measured |

## Metric Granularity

- **Entry level:** completeness, invalid duration rate.
- **Day/workday level:** logging coverage, overtime incidence.
- **Period level:** overtime load/incidence trends, vacation utilization.
- **Product level:** adoption and experience signals (time-to-value, discoverability).

## Reporting Cadence

- Weekly operational check (coverage, invalid duration rate, overtime load volume).
- Monthly product review (experience metrics and locale/pre-cache KPIs where instrumentation exists).
- Quarterly strategy review aligned with OKRs.
