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

## Coverage Policy

- Every new FR/NFR must be assigned a trace ID before implementation is considered complete.
- Any requirement without a linked metric and validation artifact is considered at risk.
- Update this file in the same PR as requirement or behavior changes.
