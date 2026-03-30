# Working Hours Tracker

Working Hours Tracker is a multi-profile web application for recording workdays, leave types, and time-based productivity insights.  
It is designed for daily operations, management reporting, and presentation-ready exports.

## Product Overview

- Manage multiple user profiles with role metadata.
- Capture daily entries with date, in/out time, break, status, location, timezone, and optional notes.
- Filter and inspect entries with calendar-aware views and advanced search.
- Analyze performance through summary statistics, charts, and the **Infographic** modal: clustered tables for summaries, vacation, weekday work and overtime, clock-in and clock-out patterns, and WFO versus WFH detail splits.
- **Infographic timeframe**: choose **Annually**, **Quarterly**, **Monthly**, or **Weekly** to re-bucket weekday tables (work, overtime, location-split, and clock statistics). Rows are ordered with **newest period first**. Tables that respect the timeframe use vertical scroll with a **sticky header** for long histories.
- **Clock cluster** presents six sections in a **3×2 grid** (row 1: earliest, latest, average clock-in; row 2: earliest, latest, average clock-out), each broken down by weekday and period.
- Statistics cards use a custom responsive tooltip system (replacing native `title`) to keep multiline and localized details readable.
- Export operational and reporting artifacts (CSV, JSON, PowerPoint highlights). Infographic sections can export CSV aligned with the active timeframe and column labels.
- Run fully in browser-first mode, with optional backend sync APIs.

## Core Benefits

- Standardizes time tracking across WFO, WFH, and non-work statuses.
- Improves decision quality with trend, average, and overtime visibility.
- Supports localization and international teams via manual language packs.
- Language selection stays synchronized across enhanced UI components after translations are applied.
- Reduces reporting cycle time through built-in export and presentation tooling.

## Key Features

### Profile, Clock, and Entry
- Multi-profile selection and role display.
- Quick clock-in and clock-out shortcuts.
- Single-entry and multi-entry (bulk) input flows.
- Voice-assisted entry parsing and review.
- Auto timezone detection (browser + IP fallback).

### Filters and Entries
- Basic and advanced filters with mode toggles.
- Date, week, month, day-name, status, location, overtime, and description filtering.
- Smart-select filter ordering preserves semantic sequences: `All -> Month (Jan..Dec)`, `All -> Weekday (Mon..Sun)`, `All -> Day (1..31)`, and `All -> Week (1..53)`.
- Sortable entries table with timezone-aware display option.
- Row selection, edit/delete batch operations, fullscreen entries mode.

### Calendar and Statistics
- Calendar heat-style status visualization.
- Statistics cards (totals, averages, days by type).
- Structured modern tooltips for Statistics cards with clear section grouping (title, location block, weekday block, indented detail lines).
- Dedicated average-subsection tooltips in Total Working Hours and Total Overtime cards, including weekday and location breakdowns.
- Statistics Summary modal with chart views and enlarge/fullscreen.
- Infographic modal with category clusters and table-level fullscreen navigation.

### Data and Reporting
- JSON sync and merge APIs.
- CSV export for tabular analysis.
- PowerPoint key highlights generation for executive updates.
- PPT generator modal uses the same dynamic size envelope as Statistics Summary and Infographic modals for consistent responsiveness.

### Connectivity and Runtime Context
- Internet status indicator shows live connectivity state with real-time estimated downlink speed (Mbps) when available.
- Daily speed analytics are tracked per local calendar day (min/max/avg) and displayed in tooltip context without disrupting core workflows.

## Technology Stack

- Frontend: Vanilla HTML, CSS, JavaScript (modular IIFE pattern under `js/`).
- Backend: Node.js + Express (`server.js`) for data read/write endpoints.
- Static frontend server/proxy: `frontend-server.js`.
- Presentation export: `pptxgenjs`.
- Localization: manual locale packs + runtime i18n resolver.

## Repository Structure

- `index.html`: main UI shell and most style definitions.
- `js/`: functional modules (form, render, filters, calendar, stats, infographic, i18n, etc.).
- `docs/`: product, design, architecture, metrics, persona, stories, variables, guardrails, traceability.
- `data/`: persisted JSON dataset (`Working Hours Data.json`).
- `server.js`: backend API service on port `3010`.
- `frontend-server.js`: frontend static server/proxy on port `3011`.

## Runtime and Setup

### Prerequisites
- Node.js 18+ recommended.

### Install
```bash
npm install
```

### Start backend API
```bash
npm start
```

### Start frontend app
```bash
npm run start:frontend
```

Open `http://localhost:3011`.

## API Summary

- `GET /api/working-hours-data`  
  Reads persisted working-hours JSON.
- `POST /api/working-hours-data`  
  Merges incoming payload with normalization and writes updated JSON.

## Documentation Map

See `docs/README.md` for complete documentation navigation and ownership scope.

## Versioning and Change History

Project-level history is tracked in `CHANGELOG.md`.  
Feature-level and requirement-level coverage is tracked in `docs/TRACEABILITY_MATRIX.md`.
