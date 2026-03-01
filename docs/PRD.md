# Product Requirements Document (PRD)  
## Working Hours Tracker

**Version:** 1.0  
**Last updated:** Aligned with README and product documentation standard.

---

## 1. Product overview

### 1.1 Purpose

A **client-side, no-backend** web application for tracking working hours, overtime, vacation, sick leave, and holidays. Users record daily entries (clock in/out, break, day status, location, timezone) with optional quick Clock In/Clock Out. All data is stored in the browser per profile. Target: individuals and small teams who need a simple, private way to track hours and leave with reporting (Statistics summary, Infographic, Key highlights PowerPoint).

### 1.2 Goals

- Provide a single place to record work entries with date, times, break, day status (work, sick, holiday, vacation), location (WFO, WFH, Anywhere), and IANA timezone.
- Support multiple profiles; each profile has its own entries, vacation quota, and role.
- Support quick Clock In/Clock Out for the selected date and full manual entry form.
- Rich filtering (basic/advanced, calendar selection) and sortable entries table; view times in another timezone via Luxon.
- Reporting: Statistics card (filtered), Statistics summary (charts by period), Infographic (tables with CSV export), Key highlights PowerPoint (years, metrics, trend slides).
- Data ownership: export/import CSV and JSON; merge on import by date + clock in; no vendor lock-in.
- No sign-up or backend; runs from index.html or static server; npm only for PPT export.

### 1.3 Target users

- Individuals tracking personal or contract work hours and leave.
- Contractors and freelancers managing multiple roles (profiles).
- Small teams or team leads reviewing hours and overtime.
- Anyone needing compliance-friendly records (work, sick, holiday, vacation) with optional export and PowerPoint summaries.

---

## 2. User needs and problems

| Need | Problem addressed |
|------|-------------------|
| Record work hours and leave in one place | Single app for clock in/out, break, day status, location; no spreadsheets. |
| Separate data by role or contract | Multiple profiles; each has its own entries and vacation quota. |
| Track overtime and standard day | Working minutes = clock out − clock in − break; standard 8 h; overtime filter and stats. |
| Set and track vacation allowance | Vacation days per profile per year; used/remaining in Infographic and PPT. |
| Filter and view by period, status, location | Basic and advanced filters; calendar selection; View times in (timezone). |
| Export for audits or backup | CSV and JSON export of filtered entries; import with merge. |
| Present summaries (e.g. yearly review) | Key highlights PowerPoint: years, days/hours metrics, trend slides (weekly/monthly/quarterly). |
| Use without sign-up or server | No backend; open index.html or run local server; data in localStorage. |

---

## 3. Functional requirements

### 3.1 Profiles

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-P1 | User can create a profile with name (required) and optional role. | Must |
| FR-P2 | User can switch active profile; entries, filters, calendar, and statistics apply to that profile. | Must |
| FR-P3 | User can edit profile (name, role); renaming migrates entries, last-clock, vacation quota, and profile meta. | Must |
| FR-P4 | User can set vacation days per year (quota) for the current profile (e.g. 2021 to current+3). | Must |
| FR-P5 | User can delete profile with confirmation; at least one profile must remain. | Must |

### 3.2 Clock and entry

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-C1 | User can use Clock In / Clock Out for the date selected in the entry form; current time is filled; no entry is created until Save entry. | Must |
| FR-C2 | User can add or edit an entry with date, clock in, clock out, break (minutes or hours), day status (work, sick, holiday, vacation), location (WFO, WFH, Anywhere), timezone (searchable, default Europe/Berlin), optional description. | Must |
| FR-C3 | For non-work day status, default times (and break/location) are applied when changing day status. | Must |
| FR-C4 | Entry date stored as YYYY-MM-DD; times as HH:mm; timezone as IANA string. | Must |

### 3.3 Filters and entries table

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-F1 | Basic filters: Year, Month, Day status, Location, Duration. Advanced adds Week, Day, Day name, Overtime, Description. | Must |
| FR-F2 | Show all dates: when unchecked, only entries on or before today; when checked, include future entries. | Must |
| FR-F3 | Reset filters sets all dropdowns to All and clears calendar selection. Reset selection clears table row selection. | Must |
| FR-F4 | Calendar: clicking a day toggles it for filtering; when any dates selected, entries list shows only those dates. | Must |
| FR-F5 | View times in: table Date and Time (and tooltips) can be shown in a chosen timezone (searchable); "Entry timezone" shows each entry in its own timezone. | Must |
| FR-F6 | Entries table: checkbox, Date, Time, Duration, Status, Location, Description; sortable by Date, Duration, Status, Location; row colors by status; location icons. | Must |
| FR-F7 | Edit requires exactly one selected row; Delete requires confirmation. | Must |

### 3.4 Export and import

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-X1 | User can export filtered entries as CSV or JSON; format chosen in modal. | Must |
| FR-X2 | User can import CSV or JSON; merge key = date + clock in; incoming overwrites on conflict; new entries get generated id; toast with imported count and optional errors. | Must |
| FR-X3 | CSV: required columns Date, Clock In, Clock Out; optional Break, Status, Location, Description, Timezone. Date parsed as M/D/YY or M/D/YYYY. | Must |

### 3.5 Reporting

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-R1 | Statistics card: total and average working hours and overtime; days by type (work, vacation, holiday, sick) for filtered entries. | Must |
| FR-R2 | Statistics summary modal: all entries for profile; view by Weekly/Monthly/Quarterly/Annually; four charts (total hours, total overtime, avg hours per work day, avg overtime per work day); Enlarge and Download PNG per chart. | Must |
| FR-R3 | Infographic modal: all entries; summary and tables respect current filters; tables with Export CSV: summary totals, vacation quota/used/remaining, vacation by weekday, hours/overtime by weekday. | Must |
| FR-R4 | Key highlights PPT: select years; select metrics (days: working, vacation used/quota/remaining, sick, holidays; hours: total/avg working, total/avg overtime); select trend slides (None or Weekly/Monthly/Quarterly); Generate PowerPoint to download. Requires npm install and local server. | Must |

### 3.6 Calendar

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-Cal1 | Month calendar; cells colored by day status; location dots (one=WFH, two=WFO, three=Anywhere); overtime bar on work days with overtime. | Must |
| FR-Cal2 | Arrows change month; calendar aligns with filter Year/Month; if both All, show current month. | Must |
| FR-Cal3 | Scroll-to-calendar button from profile section. | Should |

### 3.7 Help and feedback

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-H1 | Help button (ⓘ) per section; opens modal with section-specific title and body. | Must |
| FR-H2 | Toasts for success/warning/info (e.g. import result); auto-dismiss. | Must |

---

## 4. Non-functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-1 | Runs in modern browsers with JavaScript and localStorage; no backend for core use. | Must |
| NFR-2 | Data persisted in localStorage (key `workingHoursData`); last profile in `workingHoursLastProfile`. | Must |
| NFR-3 | Chart.js and Luxon loaded from CDN; PptxGenJS from local vendor/ (postinstall); PPT may require local server if file:// blocks script. | Must |
| NFR-4 | Accessibility: semantic HTML, ARIA where needed, keyboard support; help modal and form labels. | Should |
| NFR-5 | Responsive layout; CSS variables for theming; media queries for filters and toolbar. | Should |

---

## 5. Data model (summary)

- **Root object (workingHoursData):** `data[profileName]` = array of entry objects; `data['lastClock_' + profileName]` = { action, time, date }; `data.vacationDaysByProfile` = { [profileName]: { [year]: number } }; `data.profileMeta` = { [profileName]: { role } }.
- **Entry:** id, date (YYYY-MM-DD), clockIn, clockOut (HH:mm or null), breakMinutes, dayStatus ('work'|'sick'|'holiday'|'vacation'), location ('WFO'|'WFH'|'Anywhere'), description, timezone (IANA).
- **Constants:** STORAGE_KEY, STANDARD_WORK_MINUTES_PER_DAY (480), DEFAULT_TIMEZONE (Europe/Berlin), NON_WORK_DEFAULTS, DAY_NAMES, TIMEZONE_LABELS.

Full schemas and formulas: [README §6 – Logics and data model](../README.md#6-logics-and-data-model) and [README §6.2 Data and storage](../README.md#62-data-and-storage).

---

## 6. Success criteria

- Users can create and switch profiles, add/edit/delete entries (clock or manual), set vacation quota per year.
- Filters (basic/advanced, calendar, Show all dates) and View times in work correctly; table is sortable; Edit/Delete with confirmation.
- Export/import CSV and JSON with merge by date + clock in; toasts show result.
- Statistics card, Statistics summary, Infographic, and Key highlights PPT (when vendor available) produce correct numbers from profile data.
- No backend or sign-up; runs from file or static server; data stays in browser.

---

## 7. Out of scope

- User accounts, authentication, or cloud sync.
- Real-time collaboration or multi-device sync (beyond export/import).
- Native mobile app; web only.
- Built-in version history or undo (export for backups).
- Automatic clock in/out by geolocation or system idle.

---

## 8. References

- Full product documentation: [README.md](../README.md)
- Product documentation standard: [PRODUCT_DOCUMENTATION_STANDARD.md](../PRODUCT_DOCUMENTATION_STANDARD.md)
- User personas: [USER_PERSONAS.md](USER_PERSONAS.md)
- User stories: [USER_STORIES.md](USER_STORIES.md)
