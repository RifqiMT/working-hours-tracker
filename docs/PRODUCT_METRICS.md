# Product Metrics

## 1. Purpose

This document defines product performance metrics used to evaluate adoption, data quality, user efficiency, and insight value.

## 2. KPI Definitions

| Metric ID | Metric Name | Definition | Formula | Source Variables | Cadence | Target Direction |
|---|---|---|---|---|---|---|
| PM-01 | Entry Completion Rate | Share of initiated entries that are successfully saved. | `savedEntries / initiatedEntries` | form events, save events | Weekly | Up |
| PM-02 | Median Entry Time | Median time from first input to save confirmation. | median(`saveTs - startTs`) | form start/save timestamps | Weekly | Down |
| PM-03 | Edit Correction Rate | Frequency of edits after initial save. | `editedEntries / savedEntries` | entry update events | Weekly | Balanced |
| PM-04 | Filter Utilization | Percentage of sessions using filters. | `sessionsWithFilter / totalSessions` | filter interaction events | Weekly | Up |
| PM-05 | Statistics Engagement | Usage rate of stats summary modal. | `statsModalOpens / activeUsers` | modal open events | Weekly | Up |
| PM-06 | Infographic Engagement | Usage rate of infographic modal. | `infographicOpens / activeUsers` | modal open events | Weekly | Up |
| PM-07 | Export Adoption | Ratio of users generating CSV/JSON/PPT exports. | `usersWithExport / activeUsers` | export events | Monthly | Up |
| PM-08 | Localization Quality Index | Share of audited views without mixed-language literals. | `localizedViewsPass / localizedViewsAudited` | i18n QA audits | Release | Up |
| PM-09 | Responsive Stability Index | Share of tested breakpoints without clipping/truncation defects. | `passBreakpoints / testedBreakpoints` | UX QA regression checks | Release | Up |
| PM-10 | Data Integrity Pass Rate | Percentage of saves passing schema and merge consistency checks. | `validSaves / totalSaves` | API validation + merge checks | Weekly | Up |
| PM-11 | Statistics Tooltip Single-Instance Rate | Share of tooltip hovers where only the custom Statistics tooltip is shown (no duplicate browser-native tooltips). | `singleInstanceHovers / totalTooltipHovers` | tooltip hover QA events + UI snapshots | Release | Up |
| PM-12 | Localization Synchronization After Language Change | Share of language-change sessions where dynamic UI content updates immediately to the selected locale. | `sessionsSyncedPass / totalLanguageChangeSessions` | manual language switch QA audits | Release | Up |
| PM-13 | Semantic Filter Order Compliance | Share of audited filter dropdowns preserving logical sequence (month/weekday/day/week) with `All` first. | `orderedFiltersPass / auditedFilterDropdowns` | filter UX audits | Release | Up |
| PM-14 | Connectivity Telemetry Visibility Rate | Share of online sessions where internet status tooltip exposes live Mbps and daily min/max/avg when telemetry is available. | `telemetryVisibleSessions / eligibleOnlineSessions` | header internet status QA audits | Release | Up |

## 3. Monitoring Guidance

- Monitor PM-01, PM-02, PM-10 as operational health indicators.
- Monitor PM-05, PM-06, PM-07 as value realization indicators.
- Monitor PM-08, PM-09, PM-11, PM-12, PM-13, PM-14 as quality and international readiness indicators.

## 4. Alert Thresholds

- PM-01 < 0.95 for 2 consecutive weeks.
- PM-02 increases by >20% against 4-week baseline.
- PM-09 < 0.98 at release gate.
- PM-10 < 0.995 in production-like testing.

## 5. Metric Integrity Rules

- Metric formulas must reference variables documented in `VARIABLES.md`.
- Formula changes require changelog and traceability updates.
- KPI targets should be revised quarterly with product and engineering leads.
