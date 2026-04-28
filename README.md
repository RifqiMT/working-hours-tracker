# Working Hours Tracker

Working Hours Tracker is a production-oriented web application for logging and analyzing working hours across multiple user profiles. It combines fast daily entry workflows, multilingual UX, profile-level access control, analytics/reporting, and resilient cloud synchronization into a single deployable product.

## Product Overview

The application is designed for professionals, team leads, and operations stakeholders who need consistent, auditable time records without heavyweight enterprise tooling. It supports both local development persistence and production persistence with serverless APIs and Redis.

## Product Benefits

- Speed: single-entry, bulk-entry, and voice-assisted input reduce manual effort.
- Reliability: autosave queue with retries and startup sync reduce data-loss risk.
- Consistency: canonical merge/normalization rules enforce a stable data model.
- Reporting readiness: stats, infographic, and PPT highlights are built in.
- Global usability: broad language and timezone support.
- Deployment flexibility: local file mode and cloud serverless mode.

## Core Features

- Multi-profile lifecycle: create/edit/delete, role metadata, vacation settings.
- Profile lock/unlock with hashed password validation.
- Single and bulk entry workflows.
- Voice input parsing with editable review modal.
- Calendar and statistics analytics view.
- CSV/JSON/PPT reporting and import/export.
- Full manual i18n locale-pack approach.
- Auto-save, startup sync, and Redis-backed production persistence.

## Technical Stack

- Frontend: HTML/CSS/Vanilla JavaScript modules (`js/`)
- Local backend: Express (`dev/server.js`)
- Production backend: Vercel Functions (`api/working-hours-data.js`)
- Persistence: local JSON (dev), Redis via `REDIS_URL` (prod)
- Test runner: Node `--test`
- Presentation export: PptxGenJS

## Architecture Summary

- UI shell and script orchestration in `index.html`
- Shared merge/canonicalization logic in `lib/merge-working-hours.js`
- Local save path in `dev/server.js`
- Production save path in `api/working-hours-data.js`
- Edge routing/security in `vercel.json`

## Setup

```bash
npm install
npm start
```

- UI: `http://localhost:3011`
- API: `http://localhost:3010`

## Production Variables

- `REDIS_URL` (required)
- `WORKHOURS_API_KEY` (optional write protection)

## Documentation Map

See `docs/README.md` for the full documentation hub and standards.

## Changelog

See `CHANGELOG.md`.
