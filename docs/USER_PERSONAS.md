# User Personas

**Purpose:** Describe who uses Working Hours Tracker, what they need to accomplish, and which parts of the product matter most to them. Use this file when prioritizing backlog items, writing acceptance criteria, and validating UX.

**Current state:** Six primary personas cover end users, leads, analysts, platform maintainers, UX quality, and presentation workflows. Personas map to concrete surfaces in the app (entries, filters, statistics, infographic, exports, i18n).

**Operational guidance:** When a feature touches multiple personas, list all affected segments in the traceability matrix and validate acceptance criteria per persona where behavior differs (for example localization versus raw export).

**Change notes:** Update persona-to-feature mapping when new clusters, modals, or export paths ship. Link releases via `CHANGELOG.md`.

---

## Persona 1: Individual Contributor (“Daily Executor”)

| Attribute | Detail |
|-----------|--------|
| **Role** | Individual contributor, specialist, or anyone logging their own time. |
| **Goals** | Log days quickly; correct mistakes; see personal totals and overtime; minimize administrative overhead. |
| **Pain points** | Slow forms; unclear timezone behavior; summaries that hide context behind opaque numbers. |
| **Success signals** | Entry saved in under a minute; weekly pattern visible without spreadsheet work; language and timezone feel trustworthy. |
| **Primary workflows** | Clock in/out, single-day edit, bulk backfill, voice-assisted entry, statistics cards, internet status context. |
| **Key surfaces** | Profile and entry form, entries table, calendar, statistics section, help and timezone indicators. |

---

## Persona 2: Team Lead (“Delivery Coordinator”)

| Attribute | Detail |
|-----------|--------|
| **Role** | Team lead, scrum master, or manager monitoring team rhythm (not payroll processing). |
| **Goals** | Filter to relevant periods; compare WFO and WFH; spot overtime or leave concentration; prepare concise status for leadership. |
| **Pain points** | Inconsistent reporting from team members; tools that only show totals without weekday or location context. |
| **Success signals** | Filters and Infographic clusters answer “who worked when and where” without manual pivot tables. |
| **Primary workflows** | Advanced filters, entries fullscreen, statistics summary modal, infographic clusters (General through Details), timeframe control on weekday-centric clusters. |
| **Key surfaces** | Filters and search, entries table, statistics and infographic modals, export menus. |

---

## Persona 3: Operations / PM Analyst (“Insights Integrator”)

| Attribute | Detail |
|-----------|--------|
| **Role** | Operations, PMO, or analyst responsible for metrics definitions and repeatable reporting. |
| **Goals** | Trace numbers to formulas; export consistent datasets; align dashboards with documented variables and KPIs. |
| **Pain points** | Undefined metrics; documentation drift; CSV columns that do not match on-screen semantics. |
| **Success signals** | `VARIABLES.md` and `PRODUCT_METRICS.md` match app behavior; Infographic CSV matches visible period order and headers. |
| **Primary workflows** | Infographic timeframe switching, per-section CSV export, JSON/CSV full export, API sync review. |
| **Key surfaces** | Infographic modal, export dropdown, API-backed data file, documentation set. |

---

## Persona 4: Product and Engineering Maintainer (“Platform Steward”)

| Attribute | Detail |
|-----------|--------|
| **Role** | Engineer or PM owning reliability, merge semantics, responsive layout, and release hygiene. |
| **Goals** | Keep modules bounded; preserve data integrity; ship with traceability and changelog discipline. |
| **Pain points** | Monolithic changes; undocumented guardrails; regressions on tablet breakpoints or merge paths. |
| **Success signals** | `ARCHITECTURE.md`, `GUARDRAILS.md`, and `TRACEABILITY_MATRIX.md` stay current; releases include doc parity. |
| **Primary workflows** | Code changes in `js/`, `server.js`, theme tokens in `index.html`, i18n keys, documentation updates. |
| **Key surfaces** | Entire stack; emphasis on `data-sync.js`, `server.js`, `infographic.js`, `render.js`, `i18n.js`. |

---

## Persona 5: UX / Localization Reviewer (“Interface Quality Auditor”)

| Attribute | Detail |
|-----------|--------|
| **Role** | UX designer, content designer, or QA focused on readability and locale parity. |
| **Goals** | No duplicate tooltips; readable dense breakdowns; no mixed-language UI after language change; accessible labels. |
| **Pain points** | Native `title` plus custom tooltip; truncated modal content; missing locale keys on new strings. |
| **Success signals** | Statistics tooltips use the custom system only; smart-select reflects language immediately; Infographic sticky headers and clock grid reflow cleanly. |
| **Primary workflows** | Language switch audit, statistics hover review, infographic navigation, modal sizing at breakpoints. |
| **Key surfaces** | Statistics cards, infographic modal, language selector, all `data-i18n` surfaces. |

---

## Persona 6: Reporting Presenter (“Slide-Ready Communicator”)

| Attribute | Detail |
|-----------|--------|
| **Role** | Anyone producing stakeholder decks or walkthroughs from in-app numbers. |
| **Goals** | Consistent modal sizing between analytics and PPT options; readable durations and period labels; fullscreen table review before export. |
| **Pain points** | Inconsistent dialog sizes; abbreviations that do not read well on a projector; exports that disagree with the screen. |
| **Success signals** | Statistics, Infographic, and PPT modals share envelope; Infographic durations use clear unit wording; CSV matches view. |
| **Primary workflows** | Statistics summary, infographic section fullscreen, key highlights PPT generation, CSV export. |
| **Key surfaces** | `stats-summary` and infographic modals, `keyHighlightsPptModal`, export actions. |

---

## Persona-to-feature matrix

| Capability | Daily Executor | Delivery Coordinator | Insights Integrator | Platform Steward | Interface Quality Auditor | Slide-Ready Communicator |
|------------|:--------------:|:--------------------:|:---------------------:|:----------------:|:-------------------------:|:------------------------:|
| Entry / clock | ● | ○ | ○ | ● | ○ | ○ |
| Filters / search | ○ | ● | ● | ○ | ● | ○ |
| Statistics cards / modal | ● | ● | ● | ● | ● | ● |
| Infographic (all clusters) | ○ | ● | ● | ● | ● | ● |
| Timeframe control (Weekdays / Clock / Details only) | ○ | ● | ● | ● | ● | ○ |
| CSV / JSON / PPT export | ○ | ● | ● | ○ | ○ | ● |
| API sync | ○ | ○ | ● | ● | ○ | ○ |
| i18n / tooltips | ● | ● | ○ | ● | ● | ● |

**Legend:** ● primary; ○ secondary.

---

## Related documents

- Requirements: `PRD.md`
- Stories: `USER_STORIES.md`
- Traceability: `TRACEABILITY_MATRIX.md`
