# Product Documentation Standard

This document defines the **product documentation standard** for the Working Hours Tracker. The full content for each section lives in [README.md](README.md) or in the linked docs. Use this as a checklist and index.

---

## Documentation index

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Main product documentation: overview, benefits, features, logics, business/tech guidelines, tech stack, folder directory, screens, limitations. |
| [docs/PRD.md](docs/PRD.md) | Product Requirements Document: goals, user needs, functional/non-functional requirements, data model summary, success criteria, out of scope. |
| [docs/USER_PERSONAS.md](docs/USER_PERSONAS.md) | User personas: Individual worker, Contractor, Team lead, HR/Compliance, Solo freelancer; goals, pain points, needs. |
| [docs/USER_STORIES.md](docs/USER_STORIES.md) | User stories by epic (profiles, clock & entry, filters, entries table, export/import, infographic, statistics summary, key highlights PPT, calendar, vacation). |

---

## 1. Overview

**Location:** [README §1 – Product overview](README.md#1-product-overview)

| Element | Description |
|--------|--------------|
| **Purpose** | Record and analyze daily work entries (clock in/out, break, location, day type) with support for multiple profiles, IANA timezones, and reporting. Client-side only; no backend. |
| **Target users** | Individuals and small teams who need a simple, private way to track hours, overtime, vacation, and leave. |
| **Key concepts** | Profile, Clock In/Out, Day status (work, sick, holiday, vacation), Location (WFO, WFH, Anywhere), Timezone (IANA), Vacation quota, Infographic, Statistics summary, Key highlights PPT. |
| **High-level flow** | Select profile → Clock In/Out or manual entry → Save entry → Filter/sort entries → Export/Import → Infographic / Statistics summary / Key highlights PPT. |

---

## 2. Product benefits

**Location:** [README §4 – Product benefits](README.md#4-product-benefits)

Value proposition and user benefits: privacy-first (no backend), multi-profile, timezone-aware entries and view, flexible input (quick clock or full form), rich filtering (basic/advanced, calendar selection), reporting (Statistics card, Statistics summary charts, Infographic tables, Key highlights PowerPoint), portable data (CSV/JSON export and import with merge).

---

## 3. Features

**Location:** [README §5 – Features](README.md#5-features)

| Area | Contents |
|------|----------|
| **Profile** | Switch, Role, Edit (name, role), Add, Vacation days (quota per year), Delete (with confirmation). |
| **Clock & entry** | Clock In / Clock Out (for selected date), manual entry (date, clock in/out, break, day status, location, timezone, description), Save entry; non-work defaults. |
| **Filters** | Basic (Year, Month, Day status, Location, Duration); Advanced (+ Week, Day, Day name, Overtime, Description); Show all dates; Reset filters; Reset selection; Calendar selection; View times in (timezone). |
| **Entries table** | Checkbox, Date, Time, Duration, Status, Location, Description; sortable; row colors and location icons; Edit / Delete (with confirmation); Export CSV/JSON; Import CSV/JSON; Infographic; Statistics summary; Key highlights (PPT). |
| **Key highlights (PPT)** | Years, metrics (days and hours), trend slides (Weekly/Monthly/Quarterly); Generate PowerPoint. |
| **Statistics summary** | Weekly/Monthly/Quarterly/Annually; four charts; Enlarge and Download PNG. |
| **Infographic** | Summary totals, vacation quota/used/remaining, vacation by weekday, hours/overtime by weekday; Export CSV per section. |
| **Calendar** | Month view; day-status colors; location dots; overtime bar; click to filter; arrows to change month. |
| **Statistics (card)** | Total/average working hours and overtime; days by type (filtered). |
| **Help** | ⓘ per section; modal with title and body. |
| **Toasts** | Success/warning/info; auto-dismiss. |

---

## 4. Logics (and data model)

**Location:** [README §6 – Logics and data model](README.md#6-logics-and-data-model)

| Element | Description |
|--------|--------------|
| **Duration** | Working minutes = Clock Out − Clock In − Break; invalid if clock out &lt; clock in or result &lt; 0. |
| **Overtime** | Standard day = 480 min (8 h); overtime = max(0, working minutes − 480) for work days only. |
| **Break** | Entered in minutes or hours; converted via parseBreakToMinutes. |
| **Date/time** | Entry date YYYY-MM-DD; times HH:mm; ISO week (week containing Thursday). |
| **Timezone** | Each entry has IANA timezone; default Europe/Berlin; View times in uses Luxon; list from Intl.supportedValuesOf('timeZone') or fallback. |
| **Filters** | Order: calendar selection (if any) else Year → Month → Day → Week → Day name → Day status → Location → Overtime → Description → Duration; Show all dates restricts to date ≤ today. |
| **Import merge** | Key: date + '|' + clockIn; incoming overwrites; new entries get generated id. |
| **Vacation** | Quota per profile per year; used = count of vacation-day entries; remaining = max(0, quota − used). |
| **Storage** | Single key `workingHoursData`; data[profileName] = entries; lastClock_*, vacationDaysByProfile, profileMeta; last profile in `workingHoursLastProfile`. |
| **Entry schema** | id, date, clockIn, clockOut, breakMinutes, dayStatus, location, description, timezone. |

---

## 5. Business guidelines

**Location:** [README §7 – Business guidelines](README.md#7-business-guidelines)

Recommended usage: compliance (track work, sick, holiday, vacation; set vacation quota; use Infographic or PPT for used/remaining); overtime (8 h standard; filter and use Statistics summary or PPT); multiple roles (one profile per role/contract; export or PPT per profile); data retention (local only; back up via export); Key highlights PPT for yearly reviews (years, metrics, trend slides).

---

## 6. Tech guidelines

**Location:** [README §8 – Tech stack and technical guidelines](README.md#8-tech-stack-and-technical-guidelines)

| Element | Description |
|--------|--------------|
| **Tech stack** | HTML5, CSS3, Vanilla JavaScript (ES5-friendly), Chart.js (CDN), Luxon (CDN), PptxGenJS (vendor), localStorage, single index.html, no framework. |
| **Script load order** | Chart.js, Luxon, PptxGenJS (vendor) → constants → storage → profile → vacation-days → entries → infographic → time → timezone-picker → filters → calendar → render → stats-summary → help → modal → clock → form → export → highlights-ppt → seed-csv → import → handlers → init. |
| **Technical guidelines** | Single global `window.WorkHours`; IIFE modules; no bundler; getX/setX, handleX, renderX; constants in constants.js; DOM by id; modals with .modal-overlay and .open; help via data-help and help.js HELP; timezone and Luxon in time.js; CSS variables; add feature steps. |
| **Global namespace** | All modules attach to `window.WorkHours`. |

---

## 7. Tech stack (summary)

**Location:** [README §8.1 – Tech stack](README.md#81-tech-stack)

Runtime (browser only), language (Vanilla JS), Chart.js, Luxon, PptxGenJS, localStorage, UI (single HTML, embedded CSS), Node/npm only for PPT (postinstall copies bundle to vendor/).

---

## 8. Other important elements

| Element | Location |
|--------|----------|
| **Prerequisites and requirements** | README §2 – Browser, localStorage, optional npm/server for PPT. |
| **Getting started** | README §3 – Open index.html or local server; select profile; Clock In/Out or manual entry; Save entry; Key highlights (npm install + server). |
| **Folder directory and file roles** | README §9 – Directory tree, file roles (index.html, js/*, vendor/, docs/). |
| **Screens and key UI** | README §10 – Profile/clock/entry, Filters & entries, Calendar & statistics; modals; toast. |
| **Limitations and considerations** | README §11 – Single browser, no auth, storage quota, CORS/file:// for vendor, no versioning. |
| **Help sections** | Section keys in `js/help.js`: `profile`, `clockEntry`, `filtersEntries`, `filters`, `entries`, `calendar`, `statistics`. Buttons use `data-help="sectionKey"`. |
| **Toast** | `W.showToast(message, kind)` in `init.js`; container `toastContainer`; classes `toast--success`, `toast--warning`, `toast--info`. |
| **PRD** | [docs/PRD.md](docs/PRD.md) – Functional/non-functional requirements, success criteria, out of scope. |
| **User personas** | [docs/USER_PERSONAS.md](docs/USER_PERSONAS.md) – Personas with goals, pain points, needs. |
| **User stories** | [docs/USER_STORIES.md](docs/USER_STORIES.md) – Stories by epic with persona and benefit. |

---

## Quick reference: README table of contents

1. Product overview  
2. Prerequisites and requirements  
3. Getting started  
4. Product benefits  
5. Features  
6. Logics and data model  
7. Business guidelines  
8. Tech stack and technical guidelines  
9. Folder directory and file roles (includes **docs/**: PRD, USER_PERSONAS, USER_STORIES)  
10. Screens and key UI  
11. Limitations and considerations  
12. License (if applicable)

**Related docs:** [README.md](README.md) · [PRD.md](docs/PRD.md) · [USER_PERSONAS.md](docs/USER_PERSONAS.md) · [USER_STORIES.md](docs/USER_STORIES.md)

---

*This standard is aligned with the Working Hours Tracker codebase and README. Keep docs in sync when adding features or changing storage/script order.*
