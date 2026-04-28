# Architecture

## System Overview

Working Hours Tracker uses a modular frontend and dual backend modes:

- **Local mode:** Express API (`dev/server.js`) + file persistence (`data/Working Hours Data.json`).
- **Production mode:** Vercel serverless API (`api/working-hours-data.js`) + Redis persistence.

## Frontend Layer

- UI shell: `index.html`
- State and orchestration: `js/storage.js`, `js/init.js`, `js/handlers.js`
- Domain modules: profiles, entries, filters, rendering, voice, i18n, export/import.

## Data Flow

1. User action mutates app state.
2. `setData` writes localStorage immediately.
3. Autosave queue triggers background POST sync.
4. Startup GET sync merges server snapshot into local state.

## Merge and Normalization

- Shared merge engine in `lib/merge-working-hours.js`.
- Canonical rules normalize date/time and resolve conflict by latest update timestamp.

## Security Architecture

- Optional write authentication for API POST using `X-API-Key`.
- Profile-level hashed password gating for protected actions.
- Security headers configured at edge via `vercel.json`.
