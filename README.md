# Working Hours Tracker

A modular web app that runs in your browser. No install required for end users: open **index.html** in a browser. Data is stored locally (localStorage).

## How to run

1. Open **index.html** in any modern browser (Chrome, Firefox, Safari, Edge).
   - Double-click the file, or **File → Open File** and select `index.html`.
   - If the app does not load (blank or errors), run a local server in the project folder, e.g.:
     - `npx serve .` then open http://localhost:3000
     - or `python3 -m http.server 8000` then open http://localhost:8000

2. Select your **profile** from the dropdown (or add a new one and click **Add**). Data is stored per profile.

3. Use **Clock In** / **Clock Out**, or **Add or edit entry** to enter times manually.

## Tech stack

- **Vanilla JavaScript (ES5-friendly)** in separate modules, no build step.
- **Single global namespace** (`window.WorkHours`) so all scripts work when loaded in order via `<script src="...">`.
- **No frameworks**, no Node/npm required to run; open the HTML file (or use any static server).

## Project structure

```
working-hours-tracker/
├── index.html          # UI and styles; loads scripts in order
└── js/
    ├── constants.js   # Config and constants
    ├── storage.js     # localStorage get/set
    ├── profile.js     # Profile dropdown and names
    ├── entries.js     # Entries and last-clock state
    ├── time.js        # Time/duration parsing and formatting
    ├── filters.js     # Filter values and getFilteredEntries
    ├── calendar.js    # Month calendar view (day status colors, location dots)
    ├── render.js      # Entries table and statistics box
    ├── modal.js       # Edit-entry modal
    ├── clock.js       # Clock in/out
    ├── form.js        # Add/save entry form
    ├── export.js      # CSV export
    ├── handlers.js    # Profile change / add profile
    └── init.js        # Startup and event binding
```

Load order matters: constants → storage → profile → entries → time → filters → calendar → render → modal → clock → form → export → handlers → init.

## Features

- **Multi-user**: Switch by profile; each profile has its own data.
- **Clock in / out**: One-click for current time; optional break and location.
- **Manual date**: Date picker and form for any day.
- **Working duration**: Clock out − Clock in − Break (minutes or hours).
- **Day status**: Work, Sick, Holiday, Vacation (non-work defaults: 09:00–18:00, 1h break, AW).
- **Filters**: Year, month, week, day name, day status, location.
- **Statistics**: Total working hours, overtime, average, work/vacation/holiday/sick counts.
- **Calendar**: Month view with entries; color by day status (Work, Sick, Holiday, Vacation); dots by location (1=WFH, 2=WFO, 3=AW).
- **Export**: Download filtered entries as CSV.
