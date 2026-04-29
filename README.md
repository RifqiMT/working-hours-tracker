# Working Hours Tracker

Working Hours Tracker is a production-ready, multi-profile work logging platform that helps individuals and teams capture daily time records, maintain reliable historical data, and generate management-ready reporting outputs.

## Product Overview

The product addresses three recurring operational gaps in time tracking workflows:

1. Data inconsistency across individuals, profiles, and dates.
2. High friction for recurring daily updates.
3. Limited portability and weak reporting readiness.

The application solves these by combining canonical data normalization, flexible entry methods (single/bulk/voice), and resilient persistence with startup synchronization.

## Product Benefits

- **Operational speed:** users can log updates through single-entry forms, bulk rows, or voice-assisted parsing.
- **Data reliability:** autosave with retry logic and startup merge/sync minimizes data loss risk.
- **Global usability:** timezone-aware storage and multilingual support with manual locale packs.
- **Governance readiness:** traceability, variables dictionary, metrics/OKRs, and guardrail standards.
- **Reporting readiness:** CSV, JSON, infographic, and PowerPoint export capabilities.

## Core Features

### 1) Profile Management

- Multi-profile create/edit/delete.
- Profile role metadata.
- Optional profile-level password lock.
- Vacation quota by profile and year.

### 2) Entry Workflows

- Single daily entry management.
- Bulk multi-day entry workflow.
- Edit/delete selected entries.
- Canonical time and date normalization.

### 3) Voice-Assisted Input

- Speech recognition with multilingual parsing support.
- Review modal before applying parsed fields.
- Canonical persistence model independent of spoken language.

### 4) Data Portability and Sync

- CSV and JSON export/import.
- Startup cloud sync + merge.
- Autosave queue with retry and status indicators.

### 5) Analytics and Reporting

- Filterable entries table.
- Calendar and statistics views.
- Infographic dashboard.
- Key highlights PPT generation.

## Architecture Summary

- **Frontend:** `index.html` + modular vanilla JavaScript in `js/`.
- **Shared merge layer:** `lib/merge-working-hours.js`.
- **Local backend:** `dev/server.js` with `data/Working Hours Data.json`.
- **Production backend:** `api/working-hours-data.js` (Vercel serverless + Redis).
- **Deployment config:** `vercel.json`.

## Tech Stack

- HTML / CSS / JavaScript (vanilla module-style namespace)
- Node.js runtime
- Express (local dev API)
- Vercel Functions (production API)
- Redis persistence (`REDIS_URL`)
- PptxGenJS for PPT export
- Node built-in test runner (`node --test`)

## Business and Technical Guidelines

- Never persist plaintext profile passwords.
- Keep all user-facing text under i18n key governance.
- Treat production POST writes as snapshot semantics.
- Validate release gates (tests + diagnostics + smoke checks + docs alignment).

## Local Setup

```bash
npm install
npm start
```

- UI: `http://localhost:3011`
- Local API: `http://localhost:3010`

## Production Setup

Required environment variable:

- `REDIS_URL`

Optional environment variable:

- `WORKHOURS_API_KEY`

## Documentation Map

See `docs/README.md` for the full enterprise documentation hub.

## Historical Changes

See `CHANGELOG.md`.
