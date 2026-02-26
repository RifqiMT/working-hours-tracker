# Working Hours Tracker

A modular web app that runs in your browser. Track working hours, overtime, vacation, sick leave, and holidays. No install required for basic use: open **index.html** in a browser. Data is stored locally (localStorage) per profile.

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
   - Use **Clock In** / **Clock Out** for the date selected in **Add or edit entry**, or add and edit entries manually in the form.

---

## App layout

The app has three main areas (each with a **ⓘ** help button next to the section title):

| Section | Contents |
|--------|----------|
| **1. Profile, clock & entry** | Profile dropdown, role, Edit profile, Add profile, Vacation days, Delete profile; Clock In / Clock Out; Add or edit entry form (date, times, break, day status, location, optional description, Save entry). |
| **2. Filters & entries** | Filters with **Basic** / **Advanced** mode (year, month, week, day name, day status, location, duration, overtime, description); Show all dates, Reset filters, Reset selection; Entries table with checkboxes, Edit, Delete; toolbar: Import (CSV/JSON), Export (CSV/JSON), Infographic, Statistics summary, **Key highlights (PPT)**. |
| **3. Calendar & statistics** | Month calendar with day-status colors and location dots; Statistics card (total hours, overtime, averages, days by type). |

---

## Features and instructions

### Profile

- **Switch profile** — Use the dropdown; data is stored per profile in the browser.
- **Role** — Optional label for the current profile; change it via **Edit profile**.
- **Edit profile** — Change the current profile’s name and role (renaming keeps all entries).
- **Add profile** — Create a new profile (name and role) in a popup.
- **Vacation days** — Set the number of vacation days **allowed per year** for the current profile. Used in Statistics and Infographic for quota vs used.
- **Delete profile** — Remove the current profile and all its data. At least one profile is required.

### Clock & entry

- **Clock In** — Start the day for the **date currently selected** in “Add or edit entry”.
- **Clock Out** — End the day for that same date. Select the date first, then use Clock In / Clock Out; the form is filled with the current time (editable). Click **Save entry** to store the entry; no entry is created until you click Save entry.
- **Manual entry** — Enter date, Clock In, Clock Out, Break (working duration = Clock Out − Clock In − Break), **Day status** (Work, Sick, Holiday, Vacation), **Location** (WFO, WFH, Anywhere), and optional Description. For non-work days, default times are applied when you change Day status.

### Filters

- **Basic** — Year, Month, Day status, Location, Duration. **Advanced** — adds Week, Day name, Day number, Overtime, Description.
- Choose **All** in any dropdown to show everything. The calendar and statistics respect these filters.
- **Show all dates** — when unchecked (default), only entries on or before today are shown; when checked, future entries are included.
- **Reset filters** — set all filter dropdowns to **All**. **Reset selection** — clear selected rows in the table.

### Entries table

- Lists entries matching the current filters. **Select rows** with the checkbox, then **Edit** (opens edit modal) or **Delete** (with confirmation).
- **Export** — Download filtered entries as **CSV** or **JSON** (format chosen in export modal).
- **Import** — Merge data from **CSV** or **JSON** (format chosen in import modal).
- **Infographic** — Opens a modal with tables (vacation days, hours/overtime by weekday, etc.; each table has Export CSV).
- **Statistics summary** — Opens a modal with charts (working hours, overtime, averages) by Weekly / Monthly / Quarterly / Annually; enlarge and download images.
- **Key highlights (PPT)** — Opens a configuration modal and generates a PowerPoint (see below). Requires `npm install` and a local server for the vendor script.
- Row colors: work = green, sick = red, holiday = purple, vacation = cyan. Location icons: WFH, WFO, Anywhere.

### Key highlights (PowerPoint)

- Click **Key highlights (PPT)** in the Entries toolbar to open the options modal.
- **Section 1 — Years to include:** Choose one or more years from the dropdown (Select all / Clear). At least one year is required.
- **Section 2 — Metrics to include:** Select which metrics to include using the tile checkboxes:
  - **Days:** Working days (WFO/WFH), Vacation days, Vacation quota, Vacation remaining, Sick leave, Holidays.
  - **Hours & overtime:** Working hours (total & avg), Overtime (total & avg).
- **Section 3 — Trend slides (x-axis):** Choose **None** (no trend slides) or one or more of **Weekly**, **Monthly**, **Quarterly**. None is exclusive; you can select multiple bases for trend slides. Each selected basis adds two slides per year (working hours trend + overtime trend) with min/max/median highlights.
- Click **Generate PowerPoint** to build and download the file. The deck includes a title slide and, per year: days summary (including vacation quota and remaining when set), hours and overtime summary, and for each selected trend basis the two trend slides. You must select at least one year and at least one metric.

### Statistics summary (modal)

- Opens from **Statistics summary** in the Entries toolbar. Uses **all entries** (ignores filters).
- **View** — Aggregate by **Weekly**, **Monthly**, **Quarterly**, or **Annually**.
- **Four charts:** Working hours (total per period), Overtime (total per period), Average working hours (per work day), Average overtime (per work day). For each: **Enlarge** and **Download image** (PNG).

### Infographic (modal)

- Opens from **Infographic** in the Entries toolbar. Uses **all entries** for the current profile.
- **Tables (each with Export CSV):** Vacation days (year, quota, used, remaining); vacation days used by weekday; total/average working hours by weekday; total/average overtime by weekday.

### Calendar

- **Month view** of entries; cells colored by day status (work, sick, holiday, vacation). **Dots:** one = WFH, two = WFO, three = Anywhere. Use the arrows to change month. Calendar aligns with Filters year and month; if both are “All”, it shows the current month.

### Statistics (card)

- Summary of **filtered** entries: total working hours and overtime; avg per work day and avg overtime; days by type (work, vacation, holiday, sick). Vacation shows “used / quota” when year filter is set.

---

## Tech stack

- **Vanilla JavaScript** (ES5-friendly) in separate modules; no build step.
- **Single global** `window.WorkHours`; scripts loaded in order via `<script src="...">`.
- **Chart.js** (CDN) for Statistics summary charts.
- **PptxGenJS** (local bundle) for Key highlights PowerPoint: run `npm install` in the project folder so `vendor/pptxgen.bundle.js` is created (postinstall script copies it from `node_modules/pptxgenjs`). Serve the app (e.g. `npx serve .`) so the vendor script loads; opening **index.html** via `file://` may block the script.
- **No Node/npm** required for basic use; **npm install** is required for the Key highlights (PPT) feature.

---

## Project structure

```
working-hours-tracker/
├── index.html          # UI, styles, modals, script load order
├── package.json        # npm deps (pptxgenjs) and postinstall to copy bundle
├── README.md
├── vendor/
│   └── pptxgen.bundle.js  # PptxGenJS bundle (created by npm install)
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
    ├── calendar.js     # Month calendar (day status, location dots)
    ├── render.js       # Entries table and statistics box
    ├── modal.js        # Edit-entry modal
    ├── clock.js        # Clock In / Clock Out
    ├── form.js         # Add/save entry form
    ├── export.js       # CSV/JSON export (filtered entries)
    ├── highlights-ppt.js # Key highlights PowerPoint (modal, years, metrics, trend slides)
    ├── import.js       # CSV/JSON import
    ├── seed-csv.js     # Sample data (if used)
    ├── stats-summary.js # Statistics summary modal and charts
    ├── infographic.js  # Infographic modal and table export
    ├── help.js         # Help modal content (per-section help)
    ├── handlers.js     # Profile change, add profile, etc.
    └── init.js         # Startup and event binding
```

**Script load order:** constants → storage → profile → vacation-days → entries → infographic → time → filters → calendar → render → stats-summary → help → modal → clock → form → export → **highlights-ppt** → seed-csv → import → handlers → init.

---

## Technical aspects and guidelines

This section describes architecture, data shapes, and conventions for developers who modify or extend the app.

### Architecture and module system

- **Single global namespace:** All app code attaches to `window.WorkHours` (created in `constants.js` as `window.WorkHours = window.WorkHours || {}`). Other modules use `(function (W) { ... })(window.WorkHours);` and add functions to `W`.
- **No build step:** Scripts are loaded in order via `<script src="...">` in `index.html`. Load order must respect dependencies (see Project structure).
- **Module pattern:** Each file in `js/` is an IIFE that receives `W` and attaches public API (e.g. `W.getEntries`, `W.openHelpModal`). Dependencies are documented in the file header comment (e.g. `Depends: entries, profile, time.`). Modules do not use `import`/`export`; they rely on the global and load order.
- **Optional globals:** Chart.js and PptxGenJS are loaded from CDN/vendor and used when present; the app checks for their existence before use (e.g. Key highlights PPT checks for PptxGenJS).

### Coding guidelines

- **JavaScript:** ES5-friendly style where possible (no transpilation). Some modules use `const`/`let`; target modern browsers that support them or avoid in shared code. Use `'use strict';` at the top of each module.
- **Naming:** `getX` / `setX` for data accessors; `handleX` for user-action handlers; `openX` / `closeX` for modals; `renderX` for DOM updates. IDs in HTML are camelCase (e.g. `profileSelect`, `keyHighlightsPptModal`).
- **DOM access:** Critical elements are identified by `id` and accessed via `document.getElementById(...)`. Help sections are keyed by `data-help` on the help button (e.g. `data-help="profile"`). Event listeners are bound in `init.js` after DOM is ready.
- **Defensive checks:** Before calling a function from another module, use `typeof W.fn === 'function' && W.fn()` when the module might not be loaded or the function might be missing.

### Data and storage

- All data is stored in the browser’s **localStorage** under a single key (`W.STORAGE_KEY` = `'workingHoursData'`). No server or database.
- **Root object shape:** One JSON object with the following structure:
  - **Profile entries:** `data[profileName]` = array of entry objects (see below).
  - **Last clock state:** `data['lastClock_' + profileName]` = `{ date, clockIn, clockOut }` or null.
  - **Vacation quota:** `data.vacationDaysByProfile` = `{ [profileName]: { [year]: number } }`.
  - **Profile metadata:** `data.profileMeta` = `{ [profileName]: { role: string } }`.
- **Entry object shape:** Each entry in `data[profileName]` has:
  - `id` (string, unique), `date` (YYYY-MM-DD), `clockIn`, `clockOut` (time strings or null), `breakMinutes` (number), `dayStatus` ('work' | 'sick' | 'holiday' | 'vacation'), `location` ('WFO' | 'WFH' | 'Anywhere'), `description` (string, optional).
- **Per profile:** Entries and vacation quota are stored per profile name. The last selected profile is stored in a separate key `workingHoursLastProfile` for restoration on reload.
- **Export / Import:** CSV and JSON use the same logical fields (date, clock in/out, break, status, location, description). Format is chosen in the Export/Import modal.

### UI and modals

- **Modals:** Each modal is a `.modal-overlay` with a unique `id`. By default overlays are hidden (`display: none`). Opening is done by adding the class `open` to the overlay (e.g. `element.classList.add('open')`). Closing removes `open`. Do not add `display: flex` (or similar) on the overlay’s base class, or the modal will appear always visible.
- **Modal behavior:** Clicking the overlay backdrop (the element with the modal’s `id`) or the close/cancel button removes `open`. Panel content uses `onclick="event.stopPropagation()"` so clicks inside the panel do not close the modal.
- **Help modal:** Content is in `js/help.js` under the `HELP` object (keys: `profile`, `clockEntry`, `filtersEntries`, `calendar`, `statistics`). Body text uses `\n\n` for paragraphs and `•` for list items; `formatHelpBody()` converts them to HTML.
- **CSS variables:** Theme colors and spacing are in `:root`: `--bg`, `--surface`, `--border`, `--text`, `--muted`, `--accent`, `--accent-hover`, `--success`, `--warning`. Use these for consistency.

### Adding a new module or feature

1. **New JS module:** Create `js/yourmodule.js` with an IIFE that attaches to `window.WorkHours`. Document dependencies in the top comment (`Depends: entries, filters.`). Add `<script src="js/yourmodule.js"></script>` in `index.html` after its dependencies and before `init.js`.
2. **New modal:** Add the overlay HTML in `index.html` (with `class="modal-overlay"` and a unique `id`). In `init.js` (or your module), bind the button that opens it (`classList.add('open')`) and the close/backdrop logic (`classList.remove('open')`). Do not set `display` on the overlay so the base `.modal-overlay { display: none }` keeps it hidden until `.open` is added.
3. **New help section:** Add a section title and a help button with `data-help="yourKey"`. In `help.js`, add an entry to `HELP.yourKey` with `title` and `body` (use `\n\n` for paragraph breaks and `•` for bullets).

### Browser support and requirements

- **Required:** Modern browser with localStorage, ES5+, and support for the DOM APIs used (querySelector, classList, addEventListener, etc.). The app is tested with current Chrome, Firefox, Safari, Edge.
- **Optional:** Chart.js (CDN) for Statistics summary; PptxGenJS (vendor bundle) for Key highlights PPT. If the vendor script is blocked (e.g. via `file://`), the PPT feature will not work; run the app from a local server (e.g. `npx serve .`).

---

## Data and storage

- All data is stored in the browser’s **localStorage** under a single key; no server or database.
- **Per profile:** entries and vacation quota are stored per profile name.
- **Export** and **Import** support **CSV** and **JSON** for portability. Format is chosen in the respective modal (Export data / Import data).
- For the exact localStorage shape and entry object format, see **Technical aspects and guidelines** above.
