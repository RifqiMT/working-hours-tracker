# Working Hours Tracker

**Working Hours Tracker** is a multi-profile web application for recording workdays, leave types, location (office, home, anywhere), and time-based productivity insights. It supports daily operations, management reporting, and presentation-ready exports in a browser-first architecture with optional API-backed persistence.

---

## Purpose and audience

The product is built for **individual contributors**, **team leads**, **operations and reporting analysts**, and **product/engineering maintainers** who need consistent time records, transparent calculations, and traceable documentation for governance. See `docs/USER_PERSONAS.md` for full persona definitions.

---

## Product overview

- **Profiles**: Multiple named profiles with role metadata and per-profile entry histories.
- **Entries**: Date, clock in/out, break minutes, day status (`work`, `vacation`, `holiday`, `sick`), location (`WFO`, `WFH`, `Anywhere`), timezone, optional description; stable `id` and timestamps for merge safety.
- **Filters and search**: Basic and advanced modes, calendar date selection, semantic ordering for month/weekday/day/week filters, and rich text search with intent-style hints.
- **Calendar and statistics**: Heat-style calendar, summary cards, custom responsive tooltips (no duplicate native `title` on statistics), Statistics Summary modal with charts and enlarge view.
- **Infographic**: Clustered tables for **General** (filter-scoped totals), **Vacation** (quota and weekday use), **Weekdays** (work and overtime by weekday and period), **Clock In & Clock Out** (3×2 grid of earliest/latest/average in and out), and **Details** (WFO/WFH splits). Period aggregation supports **Annually**, **Quarterly**, **Monthly**, and **Weekly**, with **newest period first**, scrollable tables, and **sticky** headers where applicable. **The timeframe selector is shown and enabled only on Weekdays, Clock, and Details**; it stays hidden and disabled on General and Vacation because those clusters use yearly or filter-scoped logic that does not use the period bucket control.
- **Exports**: CSV and JSON for data; PowerPoint key highlights via `pptxgenjs`; Infographic section CSV aligned with active timeframe.
- **Connectivity**: Header indicator for online/offline and, when available, live downlink estimate plus daily min/max/avg speed context.

---

## Core benefits

| Benefit | Description |
|--------|-------------|
| **Operational consistency** | Single place for WFO, WFH, leave types, and hours with shared rules across UI, exports, and API merge. |
| **Decision-ready insight** | Totals, averages, overtime, weekday and location breakdowns, and multi-grain Infographic views. |
| **Global readiness** | Manual locale packs, runtime i18n, synchronized language UI (including smart-select), and timezone assistance. |
| **Faster reporting** | Built-in CSV/JSON/PPT paths and executive-style Infographic layouts with fullscreen section navigation. |
| **Governance** | Enterprise documentation set under `docs/`, traceability matrix, variables dictionary, and guardrails aligned to shipped behavior. |

---

## Feature summary

### Profile, clock, and entry

- Profile selector, role field, vacation quota modal, add/edit/delete profile flows.
- Quick clock-in and clock-out, single-entry and bulk entry, voice-assisted parsing and review.
- Auto timezone detection (browser and fallbacks).

### Filters and entries table

- Year, month, week, day, day name, status, location, overtime, description filters; entries search.
- Sortable table, timezone-aware display option, selection, batch edit/delete, fullscreen entries mode.

### Analytics

- Statistics cards with structured tooltips; dedicated average sub-tooltips on combo cards.
- Statistics Summary modal (charts, category toolbar, date range, enlarge/download).
- Infographic modal (five clusters, per-section CSV, section fullscreen with in-cluster navigation).

### Data and integration

- Local persistence (`localStorage`) and optional sync with `GET`/`POST /api/working-hours-data` (see `docs/API_CONTRACTS.md`).
- Import, seed CSV, and merge rules documented in architecture and guardrails.

---

## Business and product logic (high level)

- **Working minutes**: `clockOut − clockIn − break`, with validation and standard day length `8h` (`STANDARD_WORK_MINUTES_PER_DAY`) for overtime.
- **Filtered scope**: Infographic **General** summary metrics respect **filtered entries** (same slice as the entries table context); weekday/clock/detail tables aggregate **full profile entries** for period math while respecting the product’s aggregation rules (see `docs/VARIABLES.md`).
- **Overtime**: Minutes worked beyond the standard day on `work` status entries.
- **Merge**: Server and client merge favor newer timestamps and normalized dates; documented in `docs/API_CONTRACTS.md` and `docs/ARCHITECTURE.md`.

---

## Technology stack

| Layer | Technology |
|-------|------------|
| UI | HTML, CSS (design tokens via CSS custom properties), vanilla JavaScript (IIFE modules under `js/`) |
| Charts | Chart.js (Statistics Summary) |
| Presentation | pptxgenjs (bundled to `vendor/` on `npm install`) |
| Backend | Node.js, Express (`server.js`, port **3010**) |
| Frontend static server | `frontend-server.js` (port **3011**, proxies `/api/*`) |
| Persistence | JSON file `data/Working Hours Data.json` (API mode); browser `localStorage` key `workingHoursData` |

---

## Repository layout

| Path | Role |
|------|------|
| `index.html` | Shell UI, themes (`body[data-theme="…"]`), modals, component styles |
| `js/` | Feature modules: `form`, `entries`, `filters`, `render`, `calendar`, `stats-summary`, `infographic`, `i18n`, `data-sync`, etc. |
| `docs/` | PRD, personas, stories, variables, metrics, OKRs, design, traceability, guardrails, API contracts, architecture |
| `data/` | Sample or deployed JSON dataset |
| `vendor/` | Generated `pptxgen.bundle.js` |
| `PRODUCT_DOCUMENTATION_STANDARD.md` | Documentation governance standard |
| `CHANGELOG.md` | Release history |

---

## Local setup

**Prerequisites:** Node.js 18+ recommended.

```bash
npm install
npm start              # API on http://localhost:3010
npm run start:frontend # App on http://localhost:3011 — open this URL in the browser
```

`GET /api/working-hours-data` returns `404` until `data/Working Hours Data.json` exists; the UI still loads.

---

## API summary

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/working-hours-data` | Read persisted root JSON |
| `POST` | `/api/working-hours-data` | Merge and write payload |

Details: `docs/API_CONTRACTS.md`.

---

## Documentation map (authoritative set)

| Document | Contents |
|----------|----------|
| `PRODUCT_DOCUMENTATION_STANDARD.md` | Mandatory docs, quality bar, update triggers, traceability rules |
| `docs/README.md` | Index to all `docs/` files |
| `docs/PRD.md` | Requirements, scope, functional and non-functional requirements |
| `docs/USER_PERSONAS.md` | User segments and workflows |
| `docs/USER_STORIES.md` | Stories and acceptance criteria |
| `docs/VARIABLES.md` | Variable dictionary, formulas, examples, relationship diagrams |
| `docs/PRODUCT_METRICS.md` | KPI definitions and monitoring |
| `docs/METRICS_AND_OKRS.md` | OKRs linked to metrics |
| `docs/DESIGN_GUIDELINES.md` | UX/UI, responsive rules, themes, components |
| `docs/TRACEABILITY_MATRIX.md` | Requirements → stories → code → metrics |
| `docs/GUARDRAILS.md` | Technical and business constraints |
| `docs/ARCHITECTURE.md` | System and module architecture |
| `docs/API_CONTRACTS.md` | HTTP contracts and merge semantics |
| `docs/DATA_SCHEMA_EXAMPLES.md` | Example payloads and walkthroughs |
| `docs/RELEASE_SIGNOFF_TEMPLATES.md` | Sign-off checklists |
| `docs/RELEASE_NOTES_DRAFT.md` | Draft release notes |
| `CHANGELOG.md` | Dated change history |

---

## Versioning and change history

- **Changelog:** `CHANGELOG.md`
- **Feature-to-requirement mapping:** `docs/TRACEABILITY_MATRIX.md`
- **Documentation updates** are part of release readiness per `PRODUCT_DOCUMENTATION_STANDARD.md`.
