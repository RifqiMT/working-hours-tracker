# Product Requirements Document (PRD)

**Last updated:** 2026-03-20

## 1) Product Context

Working Hours Tracker is a browser-first time tracking product for individuals and small teams. It supports multi-profile work logging, leave tracking, timezone-aware records, and reporting outputs (stats, infographic, PPT) while keeping data local.

## 2) Goals and Non-Goals

### Goals

- Capture complete day-level work records quickly and accurately.
- Support multiple profiles with role metadata and annual vacation quota.
- Provide practical analysis for work/overtime/leave via reports.
- Keep the core product operational without cloud infrastructure.

### Non-Goals

- Multi-tenant cloud account system.
- Enterprise RBAC and centralized policy engine.
- Real-time collaboration editing.

## 3) Target Users

- Individual workers and freelancers.
- Contractors managing multiple contracts/contexts.
- Team leads monitoring workload trends.
- HR/compliance users reviewing leave/overtime records.

## 4) Functional Requirements

### Profile and Identity Context

- Create, edit, switch, and delete profiles.
- Store role metadata per profile.
- Configure annual vacation quota per profile.

### Entry Management

- Add/edit entries with date, in/out, break, status, location, timezone, description.
- **Break input constraints:** the numeric break field accepts at most **60** when the unit is minutes and **24** when the unit is hours; persisted `breakMinutes` must not exceed **24 hours** (1,440 minutes). Clamping and display splitting are implemented in `js/time.js` (`parseBreakToMinutes`, `syncBreakInputLimits`, `breakMinutesToInputFields`) and wired from `js/init.js`, `js/form.js`, `js/modal.js`, and `js/voice-entry.js`.
- **Work vs non-work behavior:** for `work`, location is **WFO** or **WFH** only. For `sick`, `holiday`, and `vacation`, the product applies fixed non-work defaults (clock `09:00`–`09:00`, location **Anywhere**, break default for form consistency) and disables clock/location controls that do not apply, consistent across create, edit, and voice review flows (`W.NON_WORK_DEFAULTS`, `js/form.js`, `js/modal.js`, `js/clock.js`, `js/voice-entry.js`).
- Support quick clock-in/out helper actions (work days).
- Support voice-to-entry workflow with review and apply.
- **Batch edit:** when multiple entries are selected, the user may open edit in a queue ordered **oldest → newest** by date (and tie-breakers); after **Save changes**, the flow advances to the next selected entry until the queue is exhausted (`js/render.js`, `js/modal.js`, `js/init.js`).

### Filtering and Search

- Two-mode filtering (basic/advanced).
- Semantic search with typeahead suggestions.
- Calendar date selection filtering.
- Toggle for including all dates.

### Reporting and Output

- Entries table operations: sort/select/edit/delete; multi-select batch edit with oldest→newest queue and advance-after-save.
- Export/import CSV and JSON.
- Statistics card for filtered context.
- Statistics summary modal for aggregated trends.
- Infographic modal with section-level exports.
- Key highlights PPT generation.

### Theming and Internationalization

- Dynamic theme selection from country/theme list (`body[data-theme]` tokens in `index.html`, applied by `js/init.js`).
- Dynamic language selection with fallback behavior.
- Translation updates across UI/reporting surfaces.
- **Offline-first UI/help:** strings are delivered via file-based locale packs loaded by `index.html` before `js/i18n.js`. Bulk UI-pack network prewarm remains opt-in / developer-gated (`ALLOW_NETWORK_TRANSLATION` / `window.__WH_ALLOW_NETWORK_TRANSLATION__`).
- **Online dynamic translation of user-authored text** (profile role, entry descriptions, and related display) is **enabled by default** when online, with caching; teams may disable via `window.__WH_DISABLE_DYNAMIC_USER_TEXT_TRANSLATION__` (see `docs/GUARDRAILS.md`). This does not replace file-based UI packs.
- Effective language default: when the language selector value is `auto` (initial/default) and no explicit language is applied, the effective target language resolves to `en` as a stable offline baseline.
- File-based **manual full UI/help packs** are loaded by `index.html` before `js/i18n.js`, then hydrated into runtime `translations[locale]`.
- Internet connectivity indicator (icon-only): tooltip and ARIA labels are translated via the active full manual i18n packs and re-synced whenever the user changes the language (no visible network status text).
- Manual full UI pack locales (file-based) include:
  - `id` (`js/i18n-id-locale.js`), plus `af`, `ar`, `pt-BR`, `zh`, `cs`, `da`, `nl`, `fi`, `it`, `fr`, `de`, `el`, `hi`, `ja`, `ko`, `no`, `pl`, `pt`, `ru`, `es`, `sv`, `tr`, `uk`.
- Locale pipeline correctness is validated by:
  - `npm run verify:i18n` (`scripts/verify-i18n-locales.js`) for selector/shell coverage parity.
  - `node scripts/verify-manual-locale-packs-offline.js` for offline structural completeness vs the English canonical structure.
  - Runtime script-order correctness and manual-pack authority detection in `js/i18n.js`.

## 5) Non-Functional Requirements

- Browser compatibility with modern JS/DOM support.
- Local persistence via `localStorage`.
- Optional local server API support for save/sync.
- Accessible UI semantics (labels/tooltips/title/aria attributes).
- Responsive layout across desktop and smaller breakpoints.

## 6) Data and Logic Requirements

- Standard work threshold: **480** minutes per day (`W.STANDARD_WORK_MINUTES_PER_DAY`).
- Net work minutes: span between `clockIn` and `clockOut` minus `breakMinutes` (`W.workingMinutes` in `js/time.js`); invalid times yield non-computable duration (`null`).
- Overtime computed from net work minutes **only** when `dayStatus === 'work'`.
- Vacation used/remaining derived from entry status (`vacation`) + annual quota map (`vacationDaysByProfile`).
- Import merge must preserve data integrity (id-first matching strategy; server merge in `server.js` mirrors key rules).
- Export must include full dataset context when requested by feature flow.
- Break persistence must respect UI and parser caps (see Entry Management).

## 7) Success Criteria

- Users can complete profile setup and first entry quickly.
- Filtering and search return expected subsets reliably.
- Report outputs are internally consistent across modules.
- Import/export/sync flows complete without data loss.
- Documentation stays aligned with implementation changes.

## 8) Risks and Constraints

- Script ordering sensitivity across modular JS files.
- Storage size limits in browser environments.
- No network dependency for runtime translation (offline-first).
- Lack of automated test coverage in current toolchain.

## 9) Traceability

- Personas: `USER_PERSONAS.md`
- Stories: `USER_STORIES.md`
- Variables and formulas: `VARIABLES.md`
- Metrics and targets: `PRODUCT_METRICS.md`, `METRICS_AND_OKRS.md`
- Architecture implementation: `ARCHITECTURE.md`
