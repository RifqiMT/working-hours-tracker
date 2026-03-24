# Architecture

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

## 6. Responsive and UX Architecture

- Multi-breakpoint CSS strategy in `index.html`.
- Main layout contains three adaptive sections:
  - Profile + Clock & Entry
  - Filters + Entries
  - Calendar + Statistics
- Modal architecture supports rich views (statistics summary and infographic), fullscreen card/table interaction, and fluid resizing.

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
