# Architecture

**Last updated:** 2026-03-20

## Runtime model

The product uses a browser-first modular architecture. Core logic is loaded via script tags in `index.html` and attached to `window.WorkHours` (namespace `W`).

Optional **Express** backend (`server.js`, default port **3010**) serves static files from the project root and exposes `GET/POST /api/working-hours-data` for Save/Sync. **`frontend-server.js`** (port **3011**) serves the same static tree and proxies `/api/*` to **3010** so the browser can use a single origin during development (`npm run start:frontend`).

External libraries (for example **Chart.js**, **Luxon**) are loaded from CDN URLs declared in `index.html`; **PptxGenJS** is vendored under `vendor/pptxgen.bundle.js` after `npm install`.

## High-Level Components

- **UI shell:** `index.html` (layout, controls, theme token definitions).
- **Domain/state modules:** `constants.js`, `storage.js`, `entries.js`, `profile.js`, `vacation-days.js`.
- **Interaction modules:** `form.js`, `clock.js`, `filters.js`, `entries-search.js`, `calendar.js`, `render.js`, `modal.js`, `handlers.js`, `init.js`.
- **Reporting modules:** `stats-summary.js`, `infographic.js`, `highlights-ppt.js`.
- **Data boundary modules:** `import.js`, `export.js`, `data-sync.js`.
- **Cross-cutting modules:** `time.js` (durations, break caps, IDs), `timezone-picker.js`, `i18n.js`, `smart-select.js`, `voice-entry.js`, `help.js`.

## Data Flow

1. User input updates form, filter, search, or modal state (including batch edit queues on `W._editBatchOrderedIds`).
2. Entry-level operations persist to the `localStorage` model (`workingHoursData`).
3. Filter and search projections derive visible table, calendar, and stats card state.
4. Reporting modules aggregate entries for summary charts, infographic, and PPT outputs.
5. Optional sync layer serializes or deserializes the full dataset with the local Express API (`js/data-sync.js` + `server.js`).

## Storage Model

- Root object key: `workingHoursData`.
- Includes profile arrays, profile metadata, vacation quota map, last clock state.
- Last active profile stored separately as `workingHoursLastProfile`.

## Integration Points

- **Chart.js:** statistical visualization.
- **Luxon:** timezone conversion and formatting helpers.
- **PptxGenJS:** PPT generation pipeline.
- **Offline translation model:** runtime network translation is disabled by default; UI/help strings are delivered via file-based locale packs loaded by `index.html`.
- **UI pack translation cache:** `workingHoursUiPackTranslationCache::<locale>` is retained for backward compatibility, but offline-first operation does not require network hydration to populate it.
- **Manual full locale packs:** file-based UI/help dictionaries are loaded by `index.html` before `js/i18n.js` and include embedded help content for the locale. Manual full UI/help packs (file-based locale scripts) are: `id` (`js/i18n-id-locale.js`), `af`, `ar`, `pt-BR`, `zh`, `cs`, `da`, `nl`, `fi`, `it`, `fr`, `de`, `el`, `hi`, `ja`, `ko`, `no`, `pl`, `pt`, `ru`, `es`, `sv`, `tr`, `uk`.
- Embedded help/UI content from file-based manual packs is authoritative; shell-based merges are skipped for locales with a loaded manual pack to prevent overwrites.
- **Validation gate:** after changing i18n locale lists or pack scripts, run:
  - `npm run verify:i18n` to keep selector/shell coverage parity.
  - `node scripts/verify-manual-locale-packs-offline.js` to validate offline structural completeness.
- **Non-text indicator i18n:** the internet connectivity badge tooltip/ARIA values are localized via manual full i18n packs (e.g., `common.internetStatus.*`) and re-synchronized on language changes through `W.updateInternetStatusIndicator()` (invoked from `W.refreshDynamicTranslations()`).

## Architectural Constraints

- Script loading order is dependency-sensitive.
- Shared global namespace increases coupling risk.
- No formal test harness currently guards regressions.
- Browser storage limits constrain very large datasets.

## Recommended Evolution Path

- Introduce lightweight test coverage for core formulas and merge behavior.
- Add schema versioning to import/export payloads.
- Isolate global state access behind narrower module interfaces.
- Add deterministic validation around i18n fallback and search intents.
