# Architecture

**Purpose:** Describe how Working Hours Tracker is structured at runtime—frontend modules, backend API, data flow, and cross-cutting concerns such as localization, tooltips, and telemetry.

**Current state:** Browser-first SPA-style page (`index.html` + `js/`) with optional Express persistence on port 3010 and static/proxy server on 3011.

**Change notes:** Major structural changes belong here and in `CHANGELOG.md`; requirements mapping stays in `TRACEABILITY_MATRIX.md`.

---

## 1. System Overview

Working Hours Tracker uses a browser-first architecture with optional backend persistence:

- Frontend UI: `index.html` + modular scripts in `js/`.
- API backend: `server.js` on port `3010`.
- Frontend static/proxy server: `frontend-server.js` on port `3011` (proxies `/api/*` to backend).
- Persistent storage: JSON file in `data/Working Hours Data.json`.

## 2. High-Level Components

### Frontend Layer
- **Presentation and layout**: `index.html` (sections, modals, responsive styles).
- **State and constants**: `js/constants.js`, `js/storage.js`.
- **Input and entry management**: `js/form.js`, `js/entries.js`, `js/modal.js`, `js/voice-entry.js`.
- **Filtering and search**: `js/filters.js`, `js/entries-search.js`.
- **Visualization**: `js/render.js`, `js/calendar.js`, `js/stats-summary.js`, `js/infographic.js`.
- **Infographic timeframe logic** (`js/infographic.js`):
  - Derives period keys from each entry date via `periodSortKeyFromDateStr` (annual year; quarterly `YYYY-Qn`; monthly `YYYY-MM`; weekly ISO week-year and week).
  - Aggregates Monday–Friday work metrics into `getWorkStatsByPeriodAndWeekday`, location-split stats into `getWorkStatsByPeriodWeekdayAndLocation`, and clock aggregates into `getClockInOutStatsByPeriodAndWeekday`.
  - `buildWeekdayPeriodOrder` unions keys from those maps (plus explicit years when annual), sorts lexicographically, then **reverses** for newest-first display and export.
  - `patchInfographicWeekdayTables` updates DOM tables after timeframe changes without rebuilding the whole modal.
  - Duration cells in the modal use long-form units (for example **hours** / **minutes** per locale) via `formatInfographicMinutes`, while large numerics may still use compact number styling (**K**, **Mn**, and similar) where shared formatters apply.
- **Infographic layout** (`index.html`): clock cluster uses `.infographic-clock-grid` (3 columns × 2 rows at desktop; reflows at smaller breakpoints). Timeframe-affected tables use `.infographic-table-wrap--timeframe-scroll` for max-height, vertical scroll, and sticky `thead`.
- **Infographic timeframe toolbar state** (`js/infographic.js`): `syncInfographicTimeframeForPanel(panelId)` shows `#infographicTimeframeWrap` and enables `#infographicTimeframe` only when `panelId` is one of `infographicWorkPanel`, `infographicClockPanel`, or `infographicLocationPanel` (see `INFOGRAPHIC_TIMEFRAME_PANEL_IDS`). On **General** and **Vacation**, the wrap is hidden (`.is-hidden`, `hidden`) and the select is disabled with `aria-hidden` / `aria-label` adjustments. Invoked when opening the modal (default cluster: General) and on each category-bar click.
- **Date/time and timezone logic**: `js/time.js`, `js/timezone-picker.js`.
- **Localization**: `js/i18n.js` + locale modules.
- **Import/export**: `js/import.js`, `js/export.js`, `js/seed-csv.js`, `js/highlights-ppt.js`.

### Backend Layer
- Express API (`server.js`) with JSON middleware.
- Endpoints for reading and writing merged normalized data.
- Server-side merge strategy resolves conflicts by timestamps and canonicalized date keys.

## 3. Data Model Summary

Main root payload:

- `data.<profileName>[]`: entry arrays by profile.
- `data.vacationDaysByProfile`: vacation quota records.
- `data.profileMeta`: profile metadata.
- `data.lastClock_<profileName>`: last clock state snapshots.

Entry object (core):

- `id`, `date`, `clockIn`, `clockOut`, `breakMinutes`
- `dayStatus` (`work`, `vacation`, `holiday`, `sick`)
- `location` (`WFO`, `WFH`, `Anywhere`)
- `description`, `timezone`, `createdAt`, `updatedAt`

## 4. Request/Data Flow

1. User submits or edits an entry from UI.
2. Frontend validates and normalizes values.
3. Frontend persists locally and optionally syncs via `/api/working-hours-data`.
4. Backend merges incoming and existing payloads, normalizes duplicates, sorts by date, and writes JSON.
5. Frontend re-renders entries table, statistics, calendar, and infographic views.

## 5. Localization Architecture

- Runtime resolver: `W.I18N.t()` and related helper methods.
- Locale packs: separate language files under `js/`.
- UI text bindings use `data-i18n*` attributes and explicit translation keys.
- Timezone labels and city tokens are localized via i18n dictionaries.

## 5b. Statistics Tooltip and Localization Architecture

- The Statistics section uses a custom tooltip container (`#statsCustomTooltip`) with a dedicated renderer and a singleton event binding in `js/render.js`.
- Tooltip payloads are provided via `data-stats-tooltip` attributes to support multi-line, localized content without relying on native browser `title` tooltips.
- Weekday abbreviations shown on "Days by type" weekday chips are localized using the active locale pack (via `calendarStats.weekdaysShort`), ensuring consistent UI abbreviations across all supported languages.
- `applyTranslations()` triggers language updates, and enhanced UI wrappers (e.g., `smart-select`) are refreshed so the visible language matches the chosen manual language pack immediately.
- Tooltip renderer transforms newline payloads into structured sections (title, headers, grouped rows, indented detail rows) to improve readability without changing translation ownership.
- Combo cards expose dedicated avg sub-tooltips and card-level total tooltips through scoped trigger targeting in `js/render.js`.

## 5c. Internet Status and Speed Telemetry Architecture

- Internet status in `js/init.js` reads `navigator.onLine` and best-effort `navigator.connection.downlink` (or vendor-prefixed equivalents) for live Mbps estimates.
- Real-time updates are event-driven via Network Information API `change` listeners with lightweight polling fallback.
- Daily speed summary values (min/max/avg/count) are stored in localStorage using a local-calendar date key and shown in tooltip context.
- Update cadence is throttled/coalesced to keep UI updates silent and seamless.

## 6. Responsive and UX Architecture

- Multi-breakpoint CSS strategy in `index.html`.
- Main layout contains three adaptive sections:
  - Profile + Clock & Entry
  - Filters + Entries
  - Calendar + Statistics
- Modal architecture supports rich views (statistics summary and infographic), fullscreen card/table interaction, and fluid resizing.
- PPT options modal uses the same dynamic viewport envelope as analytics modals for consistent width/height behavior and internal scrolling.

## 7. Reliability and Integrity Controls

- Defensive JSON parsing and file existence checks in backend.
- Entry merge rules protect newer records and maintain canonical date identity.
- Normalization enforces time format bounds, required defaults, and stable IDs.

## 8. Security Posture (Current)

- Local network app with permissive CORS for development usage.
- No built-in authentication or authorization layer.
- Data stored as local JSON; treat runtime environment as trusted internal workspace.

## 9. Known Constraints

- Single-file JSON storage limits scale and concurrent multi-user semantics.
- No transactional database or event stream.
- No server-side tenant isolation beyond profile data partition in JSON keys.

## 10. Supporting Technical Documents

- `API_CONTRACTS.md`: endpoint behavior and merge semantics.
- `DATA_SCHEMA_EXAMPLES.md`: canonical payload examples and field patterns.
- `RELEASE_SIGNOFF_TEMPLATES.md`: release readiness governance templates.
