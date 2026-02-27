# Working Hours Tracker

A modular, client-side web application for tracking working hours, overtime, vacation, sick leave, and holidays. It runs entirely in the browser with **no backend**: open **index.html** or run a local server. All data is stored in **localStorage** per profile.

---

## Table of contents

- [Product overview](#product-overview)
- [Product benefits](#product-benefits)
- [How to run](#how-to-run)
- [App layout](#app-layout)
- [Features](#features)
- [Core logic and calculations](#core-logic-and-calculations)
- [Business guidelines](#business-guidelines)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Technical guidelines](#technical-guidelines)
- [Data and storage](#data-and-storage)
- [Browser support](#browser-support)
- [.gitignore](#gitignore)

---

## Product overview

| Aspect | Description |
|--------|-------------|
| **Purpose** | Record and analyze daily work entries (clock in/out, break, location, day type) with support for multiple profiles, timezones, and reporting. |
| **Deployment** | Client-side only; no server or build step required for core use. Optional `npm install` for PowerPoint export. |
| **Data ownership** | All data stays in the user's browser (localStorage). No cloud sync or third-party analytics. |
| **Audience** | Individuals and small teams who need a simple, private way to track hours, overtime, vacation, and leave. |
| **Differentiators** | Per-profile data, IANA timezone support with Luxon, searchable timezone pickers, Infographic and Statistics modals, Key highlights PowerPoint export. |

---

## Product benefits

- **Privacy-first** — No backend; data never leaves the device.
- **Multi-profile** — Separate entries and settings per profile (e.g. personal vs contract).
- **Timezone-aware** — Each entry has an IANA timezone; table and reports can show times in another timezone.
- **Flexible input** — Quick Clock In/Out or full manual entry with day status (work, sick, holiday, vacation) and location (WFO, WFH, Anywhere).
- **Rich filtering** — Basic and advanced filters (year, month, week, day, status, location, overtime, description, duration); calendar multi-select.
- **Reporting** — Statistics card, Statistics summary (charts), Infographic (tables with CSV export), Key highlights PowerPoint.
- **Portable data** — Export/import CSV and JSON; merge on import by date + clock in.

---

## How to run

### Basic use (no install)

1. Open **index.html** in a browser (double-click or **File → Open File**).
2. If the app is blank or scripts fail (e.g. CORS or `file://` restrictions), use a local server:
   - **Node:** `npx serve .` → open http://localhost:3000  
   - **Python:** `python3 -m http.server 8000` → open http://localhost:8000
3. Select a **Profile** from the dropdown. Each profile has its own entries and settings.
4. Use **Clock In** / **Clock Out** for the date in the entry form, or add/edit entries manually, then click **Save entry**.

### Key highlights (PowerPoint)

- Requires **npm** and a **local server** (not `file://`).
- In the project folder: `npm install` (postinstall copies PptxGenJS into `vendor/`).
- Run the app via a server (e.g. `npx serve .`). Opening **index.html** with `file://` may block the vendor script.

---

## App layout

The UI is split into three sections (each has a **ⓘ** help button):

| Section | Contents |
|--------|----------|
| **1. Profile, clock & entry** | Profile dropdown, Role, Edit/Add/Delete profile, Vacation days; **Clock In** / **Clock Out**; Add-or-edit entry form: Date, Clock In/Out, Break, Day status, Location, **Timezone** (searchable), Description, **Save entry**. |
| **2. Filters & entries** | **Basic** / **Advanced** filters; **Show all dates**, **Reset filters**, **Reset selection**; **View times in** (searchable timezone); Entries table (checkbox, Date, Time, Duration, Status, Location, Description); toolbar: Edit, Delete, **Import** (CSV/JSON), **Export** (CSV/JSON), **Infographic**, **Statistics summary**, **Key highlights (PPT)**. |
| **3. Calendar & statistics** | Month calendar (day-status colors, location dots, overtime indicator); Statistics card (total/average hours and overtime, days by type). |

---

## Features

### Profile

- **Switch profile** — Dropdown; data is stored per profile in the browser.
- **Role** — Optional label; editable via **Edit profile**.
- **Edit profile** — Rename profile and set role (renaming keeps all entries and migrates last-clock, vacation quota, profile meta).
- **Add profile** — Create a new profile (name and role).
- **Vacation days** — Set **allowed vacation days per year** for the current profile (used in Infographic and Key highlights PPT).
- **Delete profile** — Remove current profile and its data. At least one profile is required.

### Clock & entry

- **Clock In** / **Clock Out** — Apply to the **date selected** in the entry form. Current time is filled in; user can adjust, then **Save entry** to store. No entry is created until **Save entry** is clicked.
- **Manual entry** — Date, Clock In, Clock Out, Break (minutes or hours), **Day status** (Work, Sick, Holiday, Vacation), **Location** (WFO, WFH, Anywhere), **Timezone** (searchable; default Europe/Berlin), optional Description. For non-work days, default times are applied when changing Day status.

### Filters

- **Basic** — Year, Month, Day status, Location, Duration. **Advanced** — adds Week, Day number, Day name, Overtime, Description.
- **Show all dates** — Unchecked (default): only entries on or before today; checked: include future entries.
- **Reset filters** — Set all filter dropdowns to **All** and clear calendar selection. **Reset selection** — Clear selected rows in the table.
- **Calendar selection** — Clicking a day in the calendar toggles it for filtering; entries list shows only selected dates when any are selected.

### Entries table

- **Columns:** Checkbox, Date, Time, Duration, Status, Location, Description (ⓘ). Date and Time can be shown in a chosen timezone via **View times in**.
- **Duration** — Tooltip: Working hours, Break, Overtime. Sortable by Date, Duration, Status, Location (click header).
- **Row colors:** Work = green, Sick = red, Holiday = purple, Vacation = cyan. Location icons: WFH, WFO, Anywhere.
- **Edit** / **Delete** — Select rows with checkbox; Edit requires exactly one selection; Delete asks for confirmation.
- **Export** — Download filtered entries as **CSV** or **JSON** (chosen in modal).
- **Import** — Merge from **CSV** or **JSON** (chosen in modal); deduplication by date + clock in; incoming wins on conflict.
- **Infographic** — Modal with tables (summary totals, vacation days quota/used/remaining, vacation by weekday, hours/overtime by weekday); each section has Export CSV.
- **Statistics summary** — Modal with charts (working hours, overtime, averages) by Weekly/Monthly/Quarterly/Annually; enlarge and download PNG.
- **Key highlights (PPT)** — Configure years, metrics (days and hours), and trend slides; generate and download a PowerPoint deck (requires npm install and local server).

### Key highlights (PowerPoint)

- **Years** — Select one or more years (at least one required).
- **Metrics — Days:** Working days (with WFO/WFH), vacation used, vacation quota, vacation remaining, sick, holidays.
- **Metrics — Hours:** Total and average working hours, total and average overtime.
- **Trend slides** — None, or one or more of Weekly, Monthly, Quarterly. Each basis adds two slides per year (working hours trend, overtime trend) with min/max/median.
- Click **Generate PowerPoint** to build and download. Requires PptxGenJS (see [How to run](#key-highlights-powerpoint)).

### Statistics summary (modal)

- Uses **all entries** for the current profile (ignores filters). View by **Weekly**, **Monthly**, **Quarterly**, or **Annually**.
- Four charts: Total working hours, Total overtime, Average working hours per work day, Average overtime per work day. **Enlarge** and **Download** (PNG) per chart.

### Infographic (modal)

- Uses **all entries** for the current profile; summary and tables respect **current filters**. Tables with **Export CSV**: summary totals, vacation days (quota, used, remaining), vacation by weekday (Mon–Fri), total/avg working hours and overtime by weekday (Mon–Fri).

### Calendar

- **Month view**; cells colored by day status. Location dots: one = WFH, two = WFO, three = Anywhere. Overtime bar on work days with overtime. Arrows change month. Aligns with filter Year/Month; if both are "All", shows current month. Clicking a day toggles it for filtering.

### Statistics (card)

- Summary of **filtered** entries: total and average working hours and overtime; days by type (work, vacation, holiday, sick). All values computed from entries matching the current filters.

---

## Core logic and calculations

### Duration and overtime

- **Working minutes** = Clock Out − Clock In − Break (minutes). If Clock Out < Clock In or result < 0, duration is treated as invalid (`null`).
- **Standard work day** = 480 minutes (8 h), from `STANDARD_WORK_MINUTES_PER_DAY` in `js/constants.js`.
- **Overtime** (for work days only) = max(0, working minutes − 480). Non-work days (sick, holiday, vacation) do not contribute to overtime.
- **Break** can be entered in minutes or hours; converted to minutes via `parseBreakToMinutes`.

### Date and time

- **Entry date** stored as `YYYY-MM-DD`. **Times** as `HH:mm` (24h).
- **ISO week** (for filters and stats): week containing Thursday; `getISOWeek(dateStr)` in `time.js`.
- **Clock out past midnight:** Import normalizes early-morning clock out (e.g. 0:00, 0:30) to same-day 24:00 / 24:30 when clock in is same day so duration computes correctly.

### Timezone

- Each entry has **timezone** (IANA, e.g. `Europe/Berlin`). Default from `DEFAULT_TIMEZONE` (Europe/Berlin).
- **View times in:** Table Date and Time can be converted to another timezone via Luxon; tooltips show both original and converted. Cross-day clock out is indicated (e.g. "+1").
- **Timezone list:** From `Intl.supportedValuesOf('timeZone')` when available, else a fixed fallback list. Searchable pickers in entry form, edit modal, and "View times in".

### Filters

- **Order:** If calendar has selected dates, only those dates are used; else Year → Month → Day → Week → Day name → Day status → Location → Overtime → Description → Duration. **Show all dates** false restricts to `date ≤ today`.
- **Location:** "Anywhere" matches stored value `Anywhere` or legacy `AW`.
- **Overtime:** "Overtime" = work days with working minutes > 480; "No overtime" = work days with duration ≤ 480 or null, plus all non-work days.

### Import and merge

- **CSV:** Requires columns Date, Clock In, Clock Out; optional Break, Status, Location, Description, Timezone. Date parsed as M/D/YY or M/D/YYYY → YYYY-MM-DD.
- **JSON:** Expects `entries` array (or root array) of objects with `date`, `clockIn`, `clockOut`, etc.
- **Merge key:** `date + '|' + clockIn`. Incoming entry overwrites existing for same key. New entries get a generated `id`.

### Vacation

- **Quota** is per profile, per year (`vacationDaysByProfile` in storage). Set in Vacation days modal (years 2021 to current+3).
- **Used** = count of entries with `dayStatus === 'vacation'` for that year. **Remaining** = max(0, quota − used). Quota/used/remaining appear in Infographic and Key highlights PPT.

---

## Business guidelines

- **Use for compliance:** Track work, sick, holiday, and vacation per day; set vacation quota per year and compare with used/remaining in Infographic or PPT. Export CSV/JSON for external audits.
- **Overtime:** Standard day is 8 h (480 min). Overtime is any work-day duration above that; filter by "Overtime" or "No overtime" and use Statistics summary or PPT for totals and trends.
- **Multiple roles:** Use one profile per role or contract; each has its own entries and vacation quota. Export or PPT per profile.
- **Data retention:** All data is local. Back up by exporting CSV/JSON periodically. Clearing site data or switching browsers removes data unless re-imported.
- **Key highlights PPT:** Use for yearly reviews: select years and metrics (days and hours), add trend slides (weekly/monthly/quarterly) for working hours and overtime min/max/median.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Browser only; no build step for core app |
| **Language** | Vanilla JavaScript (ES5-friendly; `const`/`let` where used) |
| **Global namespace** | `window.WorkHours`; all modules attach to it |
| **Charts** | **Chart.js** (CDN, v4.4.1) — Statistics summary modal |
| **Date/time** | **Luxon** (CDN, v3.4.4) — timezone conversion for "View times in" and entry display |
| **PowerPoint** | **PptxGenJS** (local `vendor/pptxgen.bundle.js`, from npm `pptxgenjs@^3.12.0`) — Key highlights PPT |
| **Storage** | `localStorage` (single key `workingHoursData`) |
| **UI** | Single `index.html` (HTML, embedded CSS), no framework |

- **Node/npm** is required only for the Key highlights (PPT) feature (postinstall copies PptxGenJS into `vendor/`).

---

## Project structure

```
working-hours-tracker/
├── index.html          # UI, styles, modals, script load order
├── package.json        # npm deps (pptxgenjs) + postinstall for vendor bundle
├── package-lock.json
├── README.md
├── .gitignore
├── vendor/             # Created by npm install (gitignored)
│   └── pptxgen.bundle.js
└── js/
    ├── constants.js    # Config (storage key, standard work minutes, default timezone)
    ├── storage.js      # localStorage get/set
    ├── profile.js      # Profile list and role
    ├── vacation-days.js # Vacation quota per year and modal
    ├── entries.js      # Entries array and last-clock state
    ├── infographic.js  # Infographic modal
    ├── time.js         # Time/duration/date helpers, timezone labels, Luxon formatting
    ├── timezone-picker.js # Searchable timezone picker (entry, edit, view table)
    ├── filters.js      # Filter state and getFilteredEntries
    ├── calendar.js     # Month calendar
    ├── render.js       # Entries table, stats box, sort, selection
    ├── modal.js        # Edit-entry and delete-confirm modals
    ├── clock.js        # Clock In / Clock Out
    ├── form.js         # Add/save entry form
    ├── export.js       # CSV/JSON export (filtered entries)
    ├── highlights-ppt.js # Key highlights PPT (modal, generate deck)
    ├── seed-csv.js     # Optional sample CSV (window.WorkHoursSeedCsv)
    ├── import.js       # CSV/JSON import and merge
    ├── stats-summary.js # Statistics summary modal and Chart.js charts
    ├── help.js         # Help modal content (HELP by section)
    ├── handlers.js    # Profile and modal handlers
    └── init.js         # Startup, bind events, init timezone pickers
```

**Script load order (in index.html):**  
Chart.js, Luxon, PptxGenJS (vendor) → constants → storage → profile → vacation-days → entries → infographic → time → **timezone-picker** → filters → calendar → render → stats-summary → help → modal → clock → form → export → highlights-ppt → seed-csv → import → handlers → **init**.

---

## Technical guidelines

For developers modifying or extending the app.

### Architecture

- **Single global:** All code attaches to `window.WorkHours` (created in `constants.js`). Modules are IIFEs: `(function (W) { ... })(window.WorkHours);`.
- **No bundler:** Scripts loaded in order via `<script src="...">`. Load order must respect dependencies (see Project structure).
- **Dependencies:** Documented in each file header (e.g. `Depends: entries, time, render.`). Use `typeof W.fn === 'function' && W.fn()` when a dependency may be missing.

### Naming and patterns

- **Accessors:** `getX` / `setX`
- **Handlers:** `handleX` (user action), `openX` / `closeX` (modals)
- **Rendering:** `renderX` for DOM updates
- **IDs:** camelCase (e.g. `profileSelect`, `keyHighlightsPptModal`)
- **Help:** Buttons use `data-help="sectionKey"`; content in `js/help.js` under `HELP[sectionKey]`.

### Constants (`js/constants.js`)

- `STORAGE_KEY` — localStorage key (`'workingHoursData'`)
- `DAY_NAMES` — Short weekday names
- `NON_WORK_DEFAULTS` — Default break, location, clock in/out for non-work days
- `STANDARD_WORK_MINUTES_PER_DAY` — 480 (8 h) for overtime calculation
- `DEFAULT_TIMEZONE` — IANA timezone (e.g. `'Europe/Berlin'`)
- `TIMEZONE_LABELS` — Optional human-readable labels for specific zones

### DOM and events

- Critical elements use `id` and `document.getElementById(...)`.
- Event listeners are bound in `init.js` after DOM is ready.
- Modals: overlay has unique `id` and `class="modal-overlay"`. Add class `open` to show; do not set `display` on the overlay so `.modal-overlay { display: none }` keeps it hidden until `open`.

### Timezone and Luxon

- **Entry timezone** — Each entry has `timezone` (IANA string); default `DEFAULT_TIMEZONE`. Used when converting "View times in" and in tooltips.
- **Luxon** — Used in `time.js` for `formatTimeInZone`, `formatClockInOutInZone`, `formatEntryInViewZone`. Check for `window.luxon` or global `luxon` before use.
- **Timezone picker** — `timezone-picker.js` provides searchable dropdowns; initialised in `init.js` via `W.initTimezonePickers()`.

### CSS

- **Variables** (in `index.html`): `--bg`, `--surface`, `--border`, `--text`, `--muted`, `--accent`, `--accent-hover`, `--success`, `--warning`. Use these for consistency.
- **Responsive:** Filters and entries toolbar use media queries (e.g. 768px, 640px, 420px) for layout and spacing.

### Adding a feature

1. **New JS module:** Create `js/yourmodule.js` (IIFE, attach to `W`). Add `Depends: ...` in the header. Insert `<script src="js/yourmodule.js"></script>` after its dependencies and before `init.js`.
2. **New modal:** Add overlay HTML with `class="modal-overlay"` and unique `id`. In `init.js` (or your module), bind open (add `open`) and close/backdrop (remove `open`). Do not set `display` on the overlay.
3. **New help section:** Add a help button with `data-help="yourKey"`. In `help.js`, add `HELP.yourKey = { title: '...', body: '...' };` (use `\n\n` for paragraphs, `•` for bullets).

---

## Data and storage

- **Storage:** All data in **localStorage** under one key (`workingHoursData`). No server or database.
- **Root object:**
  - `data[profileName]` — Array of entry objects.
  - `data['lastClock_' + profileName]` — `{ action: 'in'|'out', time: string, date: string }` for last clock in/out.
  - `data.vacationDaysByProfile` — `{ [profileName]: { [year]: number } }` (quota per year).
  - `data.profileMeta` — `{ [profileName]: { role: string } }`.
- **Entry object:**  
  `id`, `date` (YYYY-MM-DD), `clockIn`, `clockOut` (time strings or null), `breakMinutes` (number), `dayStatus` ('work' | 'sick' | 'holiday' | 'vacation'), `location` ('WFO' | 'WFH' | 'Anywhere'), `description` (string), **`timezone`** (IANA string, e.g. 'Europe/Berlin').
- **Last profile:** Stored in `localStorage` key `workingHoursLastProfile` for restoration on reload.
- **Export/Import:** CSV and JSON use the same logical fields (including timezone). Format is chosen in the Export/Import modal.

---

## Browser support

- **Required:** Modern browser with localStorage, ES5+ (and support for `const`/`let` where used), and standard DOM APIs (querySelector, classList, addEventListener). Tested on current Chrome, Firefox, Safari, Edge.
- **Optional:** Chart.js (CDN) for Statistics summary; Luxon (CDN) for timezone conversion; PptxGenJS (vendor) for Key highlights PPT. If the vendor script is blocked (e.g. `file://`), run the app from a local server.

---

## .gitignore

- `node_modules/`
- `vendor/` (generated by npm postinstall)
- `.DS_Store`, `*.log`

---

*Working Hours Tracker — client-side, no backend, per-profile data in the browser.*
