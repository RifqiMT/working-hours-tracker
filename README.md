# Working Hours Tracker

A modular web app that runs in your browser. Track working hours, overtime, vacation, and more. No install required: open **index.html** in a browser. Data is stored locally (localStorage) per profile.

---

## How to run

1. **Open the app**
   - Double-click **index.html**, or use **File → Open File** and select `index.html`.
   - If the app does not load (blank or errors), run a local server in the project folder:
     - `npx serve .` then open http://localhost:3000
     - or `python3 -m http.server 8000` then open http://localhost:8000

2. **Select a profile**
   - Use the **Profile** dropdown (left column). Each profile has its own entries and settings.
   - Optionally set **Role** (e.g. Developer, Manager); it is saved when you leave the field or switch profile.

3. **Log time**
   - Use **Clock In** / **Clock Out** for the date selected in **Add or edit entry**, or add/edit entries manually in the form.

---

## App layout

The app has three main areas:

| Section | Contents |
|--------|----------|
| **1. Profile, clock & entry** | Profile dropdown, role, Edit profile, Add profile, Vacation days; Clock In / Clock Out; Add or edit entry form (date, times, break, day status, location, Save entry). |
| **2. Filters & entries** | Filters (year, month, week, day name, day status, location); Entries table with row actions (Edit, Delete) and toolbar (Import CSV, Load sample data, Statistics summary, Infographic, Export CSV). |
| **3. Calendar & statistics** | Month calendar with day-status colors and location dots; Statistics card (total hours, overtime, averages, days by type). |

Use the **ⓘ** help button next to each section title for inline help.

---

## Features and instructions

### Profile

- **Switch profile** — Use the dropdown; data is stored per profile in the browser.
- **Role** — Optional label for the current profile; saved on blur or when switching profile.
- **Edit profile** — Change the current profile’s name and role (renaming keeps all entries).
- **Add profile** — Create a new profile (name and role) in a popup.
- **Vacation days** — Set the number of vacation days **allowed per year** for the current profile. Used in Statistics and Infographic for quota vs used.

### Clock

- **Clock In** — Start the day for the **date currently selected** in “Add or edit entry”.
- **Clock Out** — End the day for that same date.
- Select the date in the entry form first, then use Clock In / Clock Out.

### Add or edit entry

- **Working duration** = Clock Out − Clock In − Break.
- **Date** — Pick the day.
- **Clock In / Clock Out** — Time inputs.
- **Break duration** — In minutes or hours.
- **Day status** — Work, Sick, Holiday, Vacation. For non-work days, default times (e.g. 09:00–18:00, 1h break) are applied.
- **Location** — WFO, WFH, AW.
- Click **Save entry** to add or update the day.

### Filters

- Filter the **entries table** and **calendar** by:
  - **Year**, **Month**, **Week**, **Day name**
  - **Day status** (work, sick, holiday, vacation)
  - **Location** (WFO, WFH, AW)
- Use **All** to show everything. The calendar month stays in sync with the selected year and month.

### Entries table

- Lists all entries matching the current filters.
- **Select a row** with the checkbox, then:
  - **Edit** — Open the entry in the edit modal.
  - **Delete** — Remove the entry (with confirmation).
- **Import CSV** — Load entries from a CSV file (date, clock in/out, break, status, location).
- **Load sample data** — Insert sample entries if available.
- **Statistics summary** — Open a modal with charts (see below).
- **Infographic** — Open a modal with tables (see below).
- **Export CSV** — Download the **filtered** entries as CSV.

Row colors: green = work, red = sick, purple = holiday, cyan = vacation.

### Statistics summary (modal)

- Opens from the **Statistics summary** button in the Entries toolbar.
- Uses **all entries** (ignores filters).
- **View** — Aggregate by **Weekly**, **Monthly**, **Quarterly**, or **Annually**.
- **Four charts:**
  1. **Working hours (total per period)** — Bar chart.
  2. **Overtime (total per period)** — Line chart.
  3. **Average working hours (per work day in period)** — Bar chart.
  4. **Average overtime (per work day in period)** — Line chart.
- For each chart: **Enlarge** (high-quality image in a popup) and **Download image** (PNG).
- **Close** to dismiss the modal.

### Infographic (modal)

- Opens from the **Infographic** button in the Entries toolbar.
- Uses **all entries** for the current profile.
- **Tables (each with Export CSV):**
  1. **Vacation days** — Year, Quota, Used, Remaining.
  2. **Vacation days used by weekday (Mon–Fri)** — Count per year per weekday.
  3. **Total working hours by weekday (Mon–Fri)** — Sum per year per weekday (work days only).
  4. **Average working hours by weekday (Mon–Fri)** — Average per work day per year per weekday.
  5. **Total overtime by weekday (Mon–Fri)** — Sum per year per weekday.
  6. **Average overtime by weekday (Mon–Fri)** — Average per work day per year per weekday.
- Click **Export CSV** on a table to download that table as a CSV file.

### Calendar

- **Month view** of entries; cells colored by day status (work, sick, holiday, vacation).
- **Dots** indicate location: one = WFH, two = WFO, three = AW.
- Use **arrows** to change month. Calendar aligns with Filters year and month; if both are “All”, it shows the current month.

### Statistics (card)

- Summary of **filtered** entries:
  - **Total working hours** and **Total overtime**
  - **Avg per work day** and **Avg overtime**
  - **Days by type**: Work days, Vacation (with quota “used / quota” if year filter is set), Holiday, Sick

---

## Tech stack

- **Vanilla JavaScript** (ES5-friendly) in separate modules; no build step.
- **Single global** `window.WorkHours`; scripts loaded in order via `<script src="...">`.
- **Chart.js** (CDN) for Statistics summary charts.
- **No Node/npm** required to run; open the HTML file or use any static server.

---

## Project structure

```
working-hours-tracker/
├── index.html          # UI, styles, and script load order
├── README.md
├── data/
│   └── input.csv       # Optional sample/data file
└── js/
    ├── constants.js    # Config (e.g. standard work minutes per day)
    ├── storage.js      # localStorage get/set
    ├── profile.js      # Profile dropdown and names
    ├── vacation-days.js # Vacation days per year (quota) and modal
    ├── entries.js      # Entries and last-clock state
    ├── time.js         # Time/duration parsing and formatting
    ├── filters.js      # Filter values and getFilteredEntries
    ├── calendar.js    # Month calendar (day status, location dots)
    ├── render.js       # Entries table and statistics box
    ├── modal.js        # Edit-entry modal
    ├── clock.js        # Clock In / Clock Out
    ├── form.js         # Add/save entry form
    ├── export.js       # CSV export (filtered entries)
    ├── import.js       # CSV import
    ├── seed-csv.js     # Sample data (if used)
    ├── stats-summary.js # Statistics summary modal and charts
    ├── infographic.js  # Infographic modal and table export
    ├── help.js         # Help modal content
    ├── handlers.js     # Profile change, add profile, etc.
    └── init.js         # Startup and event binding
```

Script load order: constants → storage → profile → vacation-days → entries → infographic → time → filters → calendar → render → stats-summary → help → modal → clock → form → export → seed-csv → import → handlers → init.

---

## Data and storage

- All data is stored in the browser’s **localStorage** under a single key; no server or database.
- **Per profile**: entries and vacation quota are stored per profile name.
- **Export CSV** and **Import CSV** use a simple format (date, clock in, clock out, break, status, location) for portability.
