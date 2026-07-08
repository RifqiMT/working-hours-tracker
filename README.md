# Working Hours Tracker

**Working Hours Tracker** is a production-ready, browser-based platform for recording, analyzing, and reporting daily work time across multiple profiles. It combines low-friction data capture (single entry, bulk rows, voice-assisted input), canonical normalization, resilient persistence with startup synchronization, and management-ready exports (CSV, JSON, infographic views, and PowerPoint highlights).

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [Product Benefits](#product-benefits)
3. [Core Features](#core-features)
4. [How It Works (Logic Summary)](#how-it-works-logic-summary)
5. [Tech Stack](#tech-stack)
6. [Project Structure](#project-structure)
7. [Local Development](#local-development)
8. [Production Deployment](#production-deployment)
9. [Testing](#testing)
10. [Documentation Hub](#documentation-hub)
11. [Governance and Release Standards](#governance-and-release-standards)
12. [Changelog](#changelog)

---

## Product Overview

Organizations and individuals often track working hours in spreadsheets or ad-hoc tools. That approach creates recurring problems:

| Problem | Impact |
|---------|--------|
| Inconsistent date/time formats | Broken filters, incorrect overtime, failed imports |
| High friction for daily updates | Skipped days, incomplete records |
| Weak portability | Difficult handoffs to managers, payroll, or analytics |
| No profile isolation on shared devices | Accidental edits under the wrong identity |

Working Hours Tracker addresses these gaps with a **single-page application** that stores structured entries per profile, normalizes all values to a canonical schema, synchronizes with a server snapshot on startup, and exposes analytics and export pipelines suitable for operational and management reporting.

The product is designed for **knowledge workers**, **team leads**, and **operations analysts** who need trustworthy time records without enterprise SSO complexity.

---

## Product Benefits

| Benefit | Description |
|---------|-------------|
| **Operational speed** | Log time via single-entry form, bulk multi-day rows, clock in/out shortcuts, or voice-assisted parsing with a review step before save. |
| **Data reliability** | Autosave with retry, startup cloud merge, and shared merge logic (`lib/merge-working-hours.js`) keep local and remote snapshots aligned. |
| **Global usability** | 25+ UI locales with manual locale packs, timezone-aware entry storage, and view-timezone conversion for the entries table. |
| **Profile governance** | Multi-profile isolation, optional per-profile password lock, and role metadata for context. |
| **Reporting readiness** | CSV/JSON export, stats summary charts (Chart.js), infographic dashboard, and Key Highlights PPT (PptxGenJS). |
| **Enterprise documentation** | Full PRD, personas, user stories, variables dictionary, metrics/OKRs, traceability matrix, guardrails, and operational runbooks. |

---

## Core Features

### Profile Management
- Create, edit, rename, and delete profiles.
- Store role label per profile (display-only in main UI; editable via Edit Profile modal).
- Optional profile password (SHA-256 hash stored; never plaintext).
- Vacation allowance per profile and calendar year.
- Last-selected profile restored on startup with optional access enforcement.

### Entry Workflows
- **Single entry:** date, clock in/out, break (minutes or hours), day status, location, description, timezone.
- **Bulk entry:** multi-row panel with navigation, duplicate-date hints, and example fill.
- **Clock in / clock out:** quick actions tied to current profile and date.
- **Edit / delete:** single or batch operations with confirmation modals.
- **Filters:** Basic (year, month, day status, location, duration) and Advanced (week, day name, day number, overtime, description).
- **Calendar:** month grid with multi-date selection synced to filters.
- **Entries search:** typeahead query bar with natural-language intent parsing.

### Voice-Assisted Input
- Browser speech recognition with multilingual phrase parsing.
- Review modal before applying parsed fields to single, bulk, or edit forms.
- Persisted values always follow canonical schema regardless of spoken language.

### Data Portability and Sync
- Export to CSV or JSON (profile metadata, vacation quotas, entry fields).
- Import from CSV or JSON with merge into local dataset.
- Manual save to file and startup auto-sync from `/api/working-hours-data`.
- **Autosave status badge** (`#saveDataStatus`) shows Saving, Saved, Retrying, or error states with i18n-aware labels (`sync-status.js`).
- Autosave queue with debounce (800 ms), retry (up to 3 attempts), and status indicators.

### Analytics and Reporting
- Live statistics box (work/vacation/holiday/sick day counts, hours, overtime).
- Stats Summary modal with Chart.js visualizations and enlarge/download.
- Infographic modal with timeframe selector (annual / quarterly / monthly / weekly).
- Key Highlights PowerPoint generation with configurable sections.

### Personalization
- **36 country/region themes** with persisted preference (`workingHoursTheme`).
- **25+ languages** plus browser auto-detect.
- Connectivity and location status indicators (best-effort, non-blocking).

---

## How It Works (Logic Summary)

```
User action → in-memory model (WorkHours namespace)
           → normalize (date, time, enums, timezone)
           → localStorage (workingHoursData)
           → autosave queue → POST /api/working-hours-data
Startup    → GET /api/working-hours-data → merge with local → render UI
```

**Net work minutes** (work days only for overtime):

```
spanMinutes = clockOut − clockIn  (null if negative)
netWorkMinutes = max(0, spanMinutes − breakMinutes)
overtimeMinutes = max(0, netWorkMinutes − 480)   // 480 = 8 hours
```

**Merge rules:** Latest `updatedAt` wins per entry id or canonical date; one entry per date after collapse; production POST is full snapshot replace.

See `docs/FEATURE_LOGIC_CATALOG.md` and `docs/VARIABLES.md` for exhaustive detail.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | HTML5, CSS3 (CSS variables, `data-theme`), vanilla JavaScript modules |
| Charts | Chart.js 4.4.1 (CDN) |
| Date/time | Luxon 3.4.4 (CDN), `Intl` APIs |
| PPT export | PptxGenJS 3.12.0 → `vendor/pptxgen.bundle.js` |
| Local API | Node.js, Express 4.x (`dev/server.js`, port 3010) |
| Frontend proxy | Node.js HTTP server (`frontend-server.js`, port 3011) |
| Production API | Vercel serverless (`api/working-hours-data.js`) |
| Production store | Redis 5.x (`REDIS_URL`) |
| Tests | Node built-in test runner (`node --test`) |

---

## Project Structure

```
working-hours-tracker/
├── index.html              # SPA shell, inline CSS, script load order
├── js/                     # Feature modules (WorkHours namespace)
│   ├── constants.js          # Storage keys, defaults, enums
│   ├── … (28 feature modules)
│   ├── i18n.js + i18n-*-locale.js (24 manual packs)
│   └── init.js               # Bootstrap, themes, listeners
├── lib/merge-working-hours.js   # Shared server/client merge
├── api/working-hours-data.js    # Vercel Redis handler
├── dev/server.js           # Local API + static files
├── tests/                  # Automated tests (6 cases)
├── docs/                   # Enterprise documentation suite
├── scripts/                # i18n maintenance tooling
├── data/                   # Local JSON snapshot (gitignored)
└── vendor/                 # PptxGen bundle (postinstall)
```

---

## Local Development

### Prerequisites
- Node.js 18+ recommended
- npm

### Setup and run

```bash
cd working-hours-tracker
npm install
npm start
```

| Service | URL | Notes |
|---------|-----|-------|
| Full stack (API + static) | http://localhost:3010 | `npm start` → `dev/server.js` |
| Static + API proxy | http://localhost:3011 | `npm run start:frontend` |

Data file (created on first POST): `data/Working Hours Data.json`

### Useful scripts

| Command | Purpose |
|---------|---------|
| `npm test` | Run merge + API tests |
| `npm run verify:i18n` | Validate locale pack structure |
| `npm run qa:i18n:quick` | Quick i18n QA pass |
| `node scripts/remove-dead-i18n-keys.js` | Remove verified orphaned i18n keys (maintenance) |

---

## Production Deployment

Hosted on **Vercel** with configuration in `vercel.json`.

### Required environment variables

| Variable | Purpose |
|----------|---------|
| `REDIS_URL` | Redis connection string for snapshot persistence |

### Optional environment variables

| Variable | Purpose |
|----------|---------|
| `WORKHOURS_API_KEY` | Enables `X-API-Key` auth on POST (and optionally GET) |
| `WORKHOURS_REDIS_KEY` | Override Redis key (default `workingHoursData:v1`) |

See `docs/DEPLOYMENT_VERCEL.md` and `docs/OPERATIONS_RUNBOOK.md` for full procedures.

---

## Testing

```bash
npm test
```

Current automated coverage (6 tests):
- `tests/merge-working-hours.test.js` — merge by id, date collapse, normalization
- `tests/api-working-hours-data.test.js` — GET/POST, snapshot semantics, auth mode

Frontend modules, voice parsing, and export flows rely on manual regression per `docs/TEST_STRATEGY.md`.

---

## Documentation Hub

All enterprise documentation lives under `docs/`. Start at **[docs/README.md](docs/README.md)**.

| Category | Key files |
|----------|-----------|
| Product | `PRD.md`, `USER_PERSONAS.md`, `USER_STORIES.md` |
| Data | `VARIABLES.md`, `DATA_SCHEMA_EXAMPLES.md`, `FEATURE_LOGIC_CATALOG.md` |
| Engineering | `MODULE_REFERENCE.md`, `ARCHITECTURE.md`, `API_CONTRACTS.md` |
| Metrics | `PRODUCT_METRICS.md`, `METRICS_AND_OKRS.md` |
| Design | `DESIGN_GUIDELINES.md` |
| Governance | `GUARDRAILS.md`, `TRACEABILITY_MATRIX.md`, `SECURITY_MODEL.md` |
| Engineering norms | `TECHNICAL_GUIDELINES.md`, `BUSINESS_GUIDELINES.md` |
| Operations | `DEPLOYMENT_VERCEL.md`, `OPERATIONS_RUNBOOK.md`, `TEST_STRATEGY.md` |

Meta-standard: **[PRODUCT_DOCUMENTATION_STANDARD.md](PRODUCT_DOCUMENTATION_STANDARD.md)** (v2.3)

---

## Governance and Release Standards

Every behavior change should include:

1. Updated code and matching documentation in the same change set.
2. Passing `npm test` and clean diagnostics on touched files.
3. `CHANGELOG.md` entry with date, author context, and impact summary.
4. Traceability matrix and variables doc updates when schema or FRs change.
5. i18n key additions propagated to manual locale packs before release.

Release sign-off templates: `docs/RELEASE_SIGNOFF_TEMPLATES.md`

---

## Changelog

See **[CHANGELOG.md](CHANGELOG.md)** for historical development logs.

**Latest (2026-07-08):** Documentation v2.3 — full codebase audit; new `docs/MODULE_REFERENCE.md`; expanded runtime variables in `VARIABLES.md`.

**Previous (2026-07-08):** Documentation v2.2 refresh; dead-code and orphaned i18n cleanup (`app-tooltip.js`, 21 removed translation keys, `remove-dead-i18n-keys.js`).

---

## License and Usage

Private project (`package.json`: `"private": true`). Do not commit secrets, local data files, or credentials. See `docs/SECURITY_MODEL.md` and `docs/GUARDRAILS.md`.
