# Architecture

## High-Level Topology

- Browser UI (vanilla JS modules under `js/`).
- Local dev API (`dev/server.js`) with file storage.
- Production API (`api/working-hours-data.js`) with Redis persistence.
- Shared merge utility (`lib/merge-working-hours.js`).

## Data Flow

1. User action mutates in-memory profile/entry model.
2. Client normalizes payload and triggers autosave queue.
3. API persists snapshot and returns canonical payload.
4. Startup sync fetches remote snapshot and merges locally.

## Key Architectural Decisions

- Shared merge logic for consistency across runtimes.
- Snapshot write model for deterministic persistence.
- i18n-first UX model for complete locale pack governance.
