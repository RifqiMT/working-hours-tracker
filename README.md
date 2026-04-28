# Working Hours Tracker

Working Hours Tracker is a production-ready web application for recording daily work logs across multiple profiles, with timezone-aware calculations, analytics, voice-assisted entry, secure profile locking, import/export pipelines, and cloud persistence through serverless APIs.

## Product Benefits

- Reduce manual reporting overhead with fast single-entry and bulk-entry workflows.
- Improve consistency using canonical merge/normalization rules for time and date data.
- Support distributed teams via timezone-safe storage and display conversions.
- Enable secure profile-level access controls for shared-device usage.
- Provide decision-ready analytics (stats, infographic, and PPT highlights export).

## Core Features

- Multi-profile management (create, edit, role metadata, delete, vacation settings).
- Profile password lock/unlock (hashed, client-side verification).
- Clock-in/clock-out and manual daily entry editing.
- Bulk entry creation with validation and duplicate-date handling.
- Voice-based entry parsing and review modal before apply.
- Filterable entries table, calendar view, and statistics summary charts.
- CSV/JSON import-export and PowerPoint highlights generation.
- Full i18n manual language packs and theme system.
- Auto-save queue, retry logic, startup sync, and server merge.

## Technical Architecture

- Frontend: single-page Vanilla JS app (`index.html` + modular files in `js/`).
- Local dev API: Express server (`dev/server.js`) with JSON file persistence.
- Production API: Vercel serverless function (`api/working-hours-data.js`) with Redis backend.
- Shared merge engine: `lib/merge-working-hours.js` (used by local/prod paths).
- Deployment: Vercel (`vercel.json`) with security headers and API routing.

## Tech Stack

- Runtime: Node.js
- Frontend: HTML/CSS/Vanilla JavaScript
- Backend: Express (dev), Vercel Functions (prod)
- Data: local JSON (dev), Redis via `REDIS_URL` (prod)
- Testing: Node test runner (`node --test`)
- Export: PptxGenJS for key highlights deck

## Documentation Map

- Main docs index: `docs/README.md`
- PRD: `docs/PRD.md`
- Personas: `docs/USER_PERSONAS.md`
- User stories: `docs/USER_STORIES.md`
- Variables dictionary: `docs/VARIABLES.md`
- Product and OKR metrics: `docs/PRODUCT_METRICS.md`, `docs/METRICS_AND_OKRS.md`
- Design system and themes: `docs/DESIGN_GUIDELINES.md`
- Traceability matrix: `docs/TRACEABILITY_MATRIX.md`
- Guardrails and constraints: `docs/GUARDRAILS.md`
- API and architecture: `docs/API_CONTRACTS.md`, `docs/ARCHITECTURE.md`
- Deployment: `docs/DEPLOYMENT_VERCEL.md`
- Security model: `docs/SECURITY_MODEL.md`
- Test strategy: `docs/TEST_STRATEGY.md`
- Operations runbook: `docs/OPERATIONS_RUNBOOK.md`

## Local Setup

```bash
npm install
npm start
```

- App UI: `http://localhost:3011`
- Local API: `http://localhost:3010`

## Production Environment Variables

- `REDIS_URL` (required): Redis connection string for production persistence.
- `WORKHOURS_API_KEY` (optional): write protection key for POST requests.

## Business and Technical Guidelines

- Treat API POST payloads as full snapshots (supports deletion persistence).
- Never store raw passwords; only hashed values (`passwordHash` / `passwordEncrypted`).
- Keep all user-facing strings in i18n keys across manual language packs.
- Validate critical flows with smoke checks after deploy (`/` and `/api/working-hours-data`).

## Changelog

See `CHANGELOG.md` for historical development logs and release impacts.
