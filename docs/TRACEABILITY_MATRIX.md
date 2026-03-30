# Traceability Matrix

This matrix links business outcomes, requirements, stories, implementation surfaces, and validation artifacts.

| Trace ID | Goal / Requirement | User Story IDs | Key Implementation Areas | Metrics | Validation Artifacts |
|---|---|---|---|---|---|
| TM-001 | Reliable entry creation and edit lifecycle | US-001, US-002 | `js/form.js`, `js/modal.js`, `js/entries.js`, `js/time.js` | PM-01, PM-02, PM-10 | Functional entry tests, save/edit regression checklist |
| TM-002 | Efficient multi-entry capture | US-003 | `js/form.js`, `js/handlers.js`, entry action UI in `index.html` | PM-01, PM-02 | Bulk entry QA scenarios |
| TM-003 | Usable filtering and search | US-004, US-005 | `js/filters.js`, `js/entries-search.js`, entries toolbar/layout | PM-04 | Filter matrix test set |
| TM-004 | Accurate and readable statistics | US-006 | `js/render.js`, `js/stats-summary.js`, stats card CSS | PM-05, PM-09 | Stats consistency checks and UI snapshots |
| TM-005 | Detailed infographic analytics with fluid UX | US-007 | `js/infographic.js`, infographic modal styles in `index.html` | PM-06, PM-09 | Modal fluidity checklist and fullscreen navigation checks |
| TM-006 | Full localization coverage | US-008 | `js/i18n.js`, locale files `js/i18n-*-locale.js`, i18n attributes in `index.html` | PM-08 | Locale pack verification (`verify:i18n`) + manual QA |
| TM-007 | Timezone and location-aware behavior | US-009 | `js/time.js`, `js/modal.js`, `js/timezone-picker.js`, status icons in UI | PM-10, PM-08 | Timezone fallback and tooltip behavior tests |
| TM-008 | Exportable operational reporting | US-010 | `js/export.js`, `js/highlights-ppt.js`, `js/import.js` | PM-07 | Export integrity checks (CSV/JSON/PPT) |
| TM-009 | Data persistence and merge integrity | FR-08 | `server.js`, `frontend-server.js`, `js/data-sync.js` | PM-10 | API integration tests + merge conflict scenarios |
| TM-010 | Responsive and accessibility quality | NFR-03, NFR-04 | `index.html` responsive rules, aria/title label coverage in renderers | PM-09 | Breakpoint regression suite + accessibility spot checks |
| TM-011 | Professional Statistics tooltip UX | US-011 | `index.html` tooltip styles, `js/render.js` custom tooltip logic | PM-11, PM-09 | Tooltip UX QA snapshots + duplicate tooltip suppression checks |
| TM-012 | Localization synchronization after language change | US-012 | `js/i18n.js` applyTranslations flow + smart-select refresh + `js/render.js` dynamic tooltip content | PM-12, PM-08 | Manual language-switch audit + mixed-language prevention tests |
| TM-013 | Semantic filter ordering | US-013 | `js/smart-select.js` filter-specific sorting (`filterMonth`, `filterDayName`, `filterDay`, `filterWeek`) | PM-13, PM-09 | Filter-order UX checklist + screenshot evidence |
| TM-014 | Structured statistics tooltip readability + avg sub-tooltips | US-014 | `js/render.js` structured tooltip renderer + avg tooltip builders, `index.html` tooltip typography styles | PM-11, PM-09 | Readability QA matrix (desktop/tablet/mobile) |
| TM-015 | Real-time internet speed telemetry and daily summary | US-015 | `js/init.js` internet status indicator, daily speed aggregation storage | PM-14, PM-09 | Online/offline transition test + daily summary validation |
| TM-016 | Infographic timeframe bucketing, sort order, scroll tables, and CSV alignment | US-016 | `js/infographic.js` (`periodSortKeyFromDateStr`, `buildWeekdayPeriodOrder`, `patchInfographicWeekdayTables`, `exportInfographicTable`), `index.html` `.infographic-table-wrap--timeframe-scroll` | PM-06, PM-09 | Timeframe matrix QA (all four grains), sticky header scroll check, export row parity |
| TM-017 | Infographic clock cluster 3×2 layout and semantic order | US-017 | `js/infographic.js` clock section builder, `index.html` `.infographic-clock-grid` | PM-06, PM-09 | Layout order checklist at desktop and mobile breakpoints |
| TM-018 | Infographic cluster naming aligned to content | US-018 | `js/i18n.js`, `js/i18n-*-locale.js`, `js/infographic.js` category bar | PM-08, PM-06 | i18n key audit + category button labels |
| TM-019 | Long-form duration display in Infographic modal | US-019 | `js/infographic.js` `formatInfographicMinutes`, `js/time.js` `formatMinutes` | PM-08, PM-09 | Locale spot checks on duration strings |

## Coverage Policy

- Every new FR/NFR must be assigned a trace ID before implementation is considered complete.
- Any requirement without a linked metric and validation artifact is considered at risk.
- Update this file in the same PR as requirement or behavior changes.
