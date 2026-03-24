# Working Hours Tracker

**Last documentation review:** 2026-03-24 (aligned with current `working-hours-tracker` sources).

Working Hours Tracker is a privacy-first web application for recording work hours, overtime, sick leave, public holidays, and vacation across **multiple profiles**. The product runs primarily in the browser with data in `localStorage`, and optionally synchronizes to a **local JSON file** via a small Node/Express service. Full product documentation lives under `docs/` and is governed by `PRODUCT_DOCUMENTATION_STANDARD.md`.

## Product Overview

- **Primary users:** individual contributors, freelancers, team leads, and HR/admin stakeholders.
- **Core value:** simple daily logging + strong filtering + practical reporting without cloud lock-in.
- **Deployment model:** open `index.html` directly or run a local server; optional Node API for local file sync.
- **Data ownership:** user-controlled local data (`workingHoursData`), optional local JSON snapshot (`data/Working Hours Data.json`).

## Product Benefits

- Fast daily logging via manual form, quick clock actions, and voice input.
- Multi-profile separation (role/contract/client/person) with dedicated data and vacation settings.
- Timezone-aware entry storage and view conversion.
- Strong reporting suite: statistics card, statistics summary charts, infographic, and PPT highlights.
- Internationalization: **24+ manual locale packs** (full UI + help + PPT export strings, including analytical interpretation), offline-first; optional dynamic translation for user-entered fields when online.
- No cloud dependency for core operations.

## Feature Coverage

- **Profile management:** select, create, edit, delete profile; maintain role metadata and annual vacation quota.
- **Clock & entry:** date, clock in/out, break, day status, location, timezone, description.
- **Voice entry:** speech parsing + review modal + apply/retake flow.
- **Filtering/search:** basic/advanced filters, semantic search intents, calendar date selection, show-all-dates toggle.
- **Entries management:** table sorting/selection, single- and multi-select edit (batch queue oldest→newest with advance after save), delete, icon-based statuses, tooltips, fullscreen mode.
- **Import/export/sync:** CSV/JSON import merge, full dataset export, optional local API save/sync.
- **Reporting:** stats card (filtered context), statistics summary modal (aggregated views), infographic with section exports, **Key Highlights** PowerPoint (days summary, hours & overtime charts, WFO/WFH trends, **localized analytical interpretation** paragraphs under trend charts via `pptExport.*` i18n keys).
- **Theme and language:** dynamic single-select controls with sorted options.

## Business and Product Rules

- Standard workday = `480` minutes (`STANDARD_WORK_MINUTES_PER_DAY` in `js/constants.js`).
- Overtime applies to `work` entries only.
- Non-work statuses (sick/holiday/vacation) use fixed clock defaults **`09:00`–`18:00`**, location **Anywhere**, and a default **60**-minute break for form consistency; clock/location controls are constrained accordingly (`W.NON_WORK_DEFAULTS` in `js/constants.js`; applied in `js/form.js`, `js/modal.js`, `js/voice-entry.js`, `js/clock.js`).
- Work-day location is limited to **WFO** or **WFH** (not “Anywhere”) in the current product logic.
- Current filters drive table, calendar context, and stats card outputs.
- Statistics summary and PPT are all-entry analytical views (not constrained to table page display state).

## Technical Guidelines and Stack

- **Frontend:** HTML + CSS + Vanilla JS modules in `js/`.
- **Data:** `localStorage` root object with per-profile arrays + metadata objects.
- **Optional backend:** `server.js` (`npm start`, default port **3010**) serves static files from the project root and implements `GET/POST /api/working-hours-data` (JSON body limit **5 MB**). `frontend-server.js` (`npm run start:frontend`, port **3011**) serves the same static tree and **proxies** `/api/*` to **3010** for single-origin development.
- **Libraries (CDN / vendor):** Chart.js 4.4.1 (stats summary charts), Luxon 3.4.4 (date/timezone), **PptxGenJS** 3.12.0 (copied to `vendor/pptxgen.bundle.js` on `npm install` via `postinstall`).
- **Scripts:**
  - `npm start` — starts `server.js` (static app + `GET/POST /api/working-hours-data`, default port **3010**).
  - `npm run start:frontend` — starts `frontend-server.js` (static + proxy helper for alternate dev setups).
  - `npm install` — installs dependencies and copies PptxGenJS bundle to `vendor/pptxgen.bundle.js`.
  - `npm run verify:i18n` — locale list / shell parity (`scripts/verify-i18n-locales.js`).
  - `npm run qa:i18n:quick` — quick structural i18n checks.
  - `node scripts/verify-manual-locale-packs-offline.js` — full manual pack structure vs English canonical.

## Source Directory Map

- `index.html` - single-page UI shell and theme token definitions.
- `js/` - modular business logic (namespace `window.WorkHours`); load order is defined in `index.html` (constants → storage → domain → UI → locale packs → `i18n.js` → `init.js`). Includes `seed-csv.js` for optional sample data workflows.
- `docs/` - product, design, architecture, metrics, personas, stories, and variable definitions.
- `server.js` - optional local persistence endpoint.
- `frontend-server.js` - static + proxy helper.
- `vendor/pptxgen.bundle.js` - generated dependency artifact for PPT export.

## Comprehensive Directory Inventory (Current)

- Root runtime files: `index.html`, `server.js`, `frontend-server.js`, `package.json`, `package-lock.json`.
- Product docs and governance: `README.md`, `PRODUCT_DOCUMENTATION_STANDARD.md`, `docs/*.md`.
- Runtime source modules: `js/*.js` (entry, filters, sync, reports, i18n, voice, calendar, modals, helpers).
- Data and export artifacts: `data/` (including `Working Hours Data.json` when present).
- Tooling and verification: `scripts/` (`verify-i18n-locales.js`, `verify-manual-locale-packs-offline.js`, `qa-i18n-quick.js`, generators).
- Vendor dependencies: `vendor/` (PptxGenJS bundle), `node_modules/`.

## Latest Product Logic Updates (Mar 2026)

- Year support expanded and guarded to at least `2070` in selectors and calendar logic (`js/constants.js`, `js/filters.js`, `js/calendar.js`).
- Vacation quota modal redesigned with modern responsive UX and decade expansion controls:
  - default visible years: `2021–2030`
  - expand backward/forward by 10-year steps (`-10Y` / `+10Y`)
  - save path preserves hidden years (`js/vacation-days.js`, `index.html`, `js/init.js`).
- Filter controls are now searchable/suggestive through smart single-select enhancements (`js/smart-select.js`, `index.html`).
- Multiple-entry “Use example” working-day rows now default to:
  - break: `60` minutes
  - location: `WFH` (`js/form.js`).

## Data and Integration Notes

- Main storage key: `workingHoursData`.
- Last selected profile key: `workingHoursLastProfile`.
- Theme persistence key: `workingHoursTheme` (applied via `js/init.js` theme token overrides in `index.html`).
- Entry model includes: `id`, `date`, `clockIn`, `clockOut`, `breakMinutes`, `dayStatus`, `location`, `description`, `timezone`, optional timestamps.
- Import merge strategy is id-first with date fallback.
- **Dynamic user-text translation** (profile role, entry descriptions, search-related display) uses the public Google Translate endpoint when the browser is **online**, with results cached in memory and `localStorage` (`workingHoursUserTextTranslationCache`). It is **on by default**; disable globally with `window.__WH_DISABLE_DYNAMIC_USER_TEXT_TRANSLATION__ = true` (see `docs/GUARDRAILS.md`). This is separate from **offline UI/help** packs, which never require network.
- **Language `auto`:** When the user selects **Auto** (or stored preference is `auto`), the UI resolves to the **browser’s preferred language** if a complete manual pack exists; `localStorage` keeps the value `auto` (it is not overwritten with a concrete locale on load). English (`en`) remains the structural fallback inside i18n when a locale is missing or incomplete. See `js/i18n.js` (`applyTranslations`) and `docs/VARIABLES.md`.
- Internet connectivity indicator: an icon-only badge whose tooltip/ARIA text is localized via the file-based full manual packs (e.g., `common.internetStatus.*`) and is refreshed automatically on language change (no visible network text).

## Internationalization (i18n)

- **`en`** — fully hand-maintained dictionaries in `js/i18n.js` (reference quality).
- **`id`** — file-based full manual pack `js/i18n-id-locale.js` loaded before `js/i18n.js` (edit that file; it is not duplicated in `i18n.js`).
- **All other selectable locales** (G3 → G5 → G10 → G20 and remaining languages) — each has a **full structural pack** cloned from English so every `data-i18n` key resolves without gaps, then:
  - **Language names** in the profile language dropdown use **`Intl.DisplayNames`** in the active UI locale.
  - **Long month and weekday names** for calendar/filter UI use **`Intl.DateTimeFormat`** (charts/PPT may still use abbreviated forms where documented).
- **Manual surface copy and help** — for every non-English selectable language, full UI and the seven help sections live in `js/i18n-<locale>-locale.js` (loaded before `js/i18n.js`). `js/i18n.js` only authors English (`translations.en` + `helpEn`) and wires packs from `window.__WH_TRANSLATIONS_*`.
- **Deeper strings coverage** is delivered by file-based full manual locale packs loaded before `js/i18n.js`. Runtime performs no network warmup for UI/help.
- **One-shot completion:** `#prewarmUiPackBtn` is disabled/hidden in offline-first mode (manual packs are loaded from file; no network pre-cache is performed).

## Documentation Index

- Product documentation standard: `PRODUCT_DOCUMENTATION_STANDARD.md`
- Changelog: `CHANGELOG.md`
- Documentation hub: `docs/README.md`
- PRD: `docs/PRD.md`
- User personas: `docs/USER_PERSONAS.md`
- User stories: `docs/USER_STORIES.md`
- Traceability matrix: `docs/TRACEABILITY_MATRIX.md`
- Variables dictionary: `docs/VARIABLES.md`
- Product metrics catalog: `docs/PRODUCT_METRICS.md`
- Metrics and OKRs: `docs/METRICS_AND_OKRS.md`
- Design guidelines: `docs/DESIGN_GUIDELINES.md`
- Architecture: `docs/ARCHITECTURE.md`
- Guardrails (technical + business): `docs/GUARDRAILS.md`
- i18n tooling (generate/verify packs): `scripts/README-i18n-tools.md`

## Known Constraints

- No built-in auth/RBAC.
- No automated test suite in current package scripts (use **`npm run verify:i18n`** to validate locale list parity in `js/i18n.js`).
- **Hand-maintained UI packs:** `en` is authored in `js/i18n.js`. Indonesian (`id`) and every other selectable language use file-based packs only (`js/i18n-*-locale.js`).
- **Full manual packs (file-based):** `i18n-id-locale.js` → `i18n-af-locale.js` → `i18n-ar-locale.js` → `i18n-pt-br-locale.js` → `i18n-zh-locale.js` → `i18n-cs-locale.js` → `i18n-da-locale.js` → `i18n-nl-locale.js` → `i18n-fi-locale.js` → `i18n-it-locale.js` → `i18n-de-locale.js` → `i18n-fr-locale.js` → `i18n-el-locale.js` → `i18n-hi-locale.js` → `i18n-ja-locale.js` → `i18n-ko-locale.js` → `i18n-no-locale.js` → `i18n-pl-locale.js` → `i18n-pt-locale.js` → `i18n-ru-locale.js` → `i18n-es-locale.js` → `i18n-sv-locale.js` → `i18n-tr-locale.js` → `i18n-uk-locale.js` → `i18n.js`. Arabic sets `dir="rtl"`; Chinese sets `lang="zh-CN"` when `zh` is active.
- **Adding new English keys:** update `translations.en` and `helpEn` in `js/i18n.js`, regenerate each file-based locale pack via `node scripts/generate-manual-locale-from-en-translated.js --lang=<LOCALE> --var=<VAR>`, and update Indonesian by editing `js/i18n-id-locale.js` (or regenerating with your usual tooling). Then confirm with `npm run verify:i18n` and `node scripts/verify-manual-locale-packs-offline.js`.
- Performance and storage scale are bounded by browser storage limits.
- Core app resilience depends on script load order in `index.html`.

## License

No repository license file is currently included.
