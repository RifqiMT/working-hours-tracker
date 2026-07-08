# User Stories

**Product:** Working Hours Tracker  
**Last updated:** 2026-07-08  
**Format:** Epic → User story → Acceptance criteria → Links

---

## Epic E1 — Profile Lifecycle and Access

**Personas:** Jordan, Alex, Riley  
**FRs:** FR-01, FR-02

### US-101 — Create profile

**As a** user, **I want** to create a named profile **so that** my entries are isolated from other profiles.

**Acceptance criteria**
- [ ] Add Profile modal accepts non-empty unique name.
- [ ] Optional role and password can be set at creation.
- [ ] New profile appears in selector immediately after save.
- [ ] `profileMeta[name].id` is generated via `ensureProfileId`.
- [ ] At least one profile always remains (delete blocked when only one).

**Code:** `handlers.js`, `profile.js`, `modal.js`

---

### US-102 — Edit profile name, role, and password

**As a** user, **I want** to edit profile details **so that** metadata stays accurate.

**Acceptance criteria**
- [ ] Edit Profile requires unlock if profile is password-protected.
- [ ] Rename updates data keys and preserves entries.
- [ ] Role stored in `profileMeta[profile].role`.
- [ ] Password change requires current password when one exists.
- [ ] Confirmation password must match new password.

**Code:** `handlers.js`, `profile.js`

---

### US-103 — Delete profile

**As a** user, **I want** to delete a profile **so that** obsolete data is removed.

**Acceptance criteria**
- [ ] Confirmation modal warns permanent data loss.
- [ ] Unlock required for protected profile.
- [ ] Entries, vacation settings, and meta removed for profile.
- [ ] Selector switches to remaining profile.

**Code:** `handlers.js`, `profile.js`

---

### US-104 — Lock profile with password

**As a** shared-device user, **I want** to password-protect my profile **so that** others cannot view or edit my entries.

**Acceptance criteria**
- [ ] Only `passwordHash` persisted (SHA-256 hex); never plaintext.
- [ ] Locked profile blocks entry view/edit until `requireProfileAccess` succeeds.
- [ ] Unlock session stored in memory only (`_profileAuthSession`).
- [ ] Incorrect password shows toast; no data mutation.

**Code:** `profile.js`, `entries.js`, `export.js`

---

### US-105 — Vacation allowance per year

**As a** user, **I want** to set vacation days per calendar year **so that** infographic and exports show quota context.

**Acceptance criteria**
- [ ] Modal lists years with editable day counts (0–365).
- [ ] Expand before/after adds 10 years to range.
- [ ] Saved to `vacationDaysByProfile[profile][year]`.
- [ ] Included in CSV export columns.

**Code:** `vacation-days.js`, `export.js`

---

## Epic E2 — Entry Operations

**Personas:** Alex, Jordan  
**FRs:** FR-03, FR-08, FR-09

### US-201 — Save single entry

**As a** user, **I want** to save one day’s entry **so that** my work record is complete.

**Acceptance criteria**
- [ ] Fields: date, clock in/out, break, status, location, description, timezone.
- [ ] Date canonicalized to `YYYY-MM-DD`.
- [ ] Times normalized to `HH:mm`.
- [ ] Duplicate date updates existing entry (by id/date merge rules).
- [ ] Real-time duplicate hint on date field.
- [ ] Autosave triggered after persist.

**Code:** `form.js`, `entries.js`, `storage.js`

---

### US-202 — Bulk save multiple entries

**As a** user, **I want** to enter multiple days at once **so that** I catch up after leave or travel.

**Acceptance criteria**
- [ ] Bulk modal supports add/remove rows and prev/next navigation.
- [ ] Per-row validation blocks malformed dates/times.
- [ ] Duplicate-date hints per row.
- [ ] Save applies all valid rows; shows status message.

**Code:** `form.js`

---

### US-203 — Edit and delete selected entries

**As a** user, **I want** to edit or delete table selections **so that** I can fix mistakes efficiently.

**Acceptance criteria**
- [ ] Checkbox selection; Edit opens modal (batch when multiple).
- [ ] Delete requires confirmation with count.
- [ ] Fullscreen entries mode defers modals until exit.
- [ ] Locked profile requires unlock before mutate.

**Code:** `modal.js`, `render.js`, `init.js`

---

### US-204 — Clock in and clock out

**As a** user, **I want** one-click clock actions **so that** I log time without typing.

**Acceptance criteria**
- [ ] Clock In sets current time on today’s entry or creates draft.
- [ ] Clock Out completes open interval.
- [ ] `lastClock_<profile>` updated for quick reference.

**Code:** `clock.js`, `form.js`

---

### US-205 — Filter and sort entries

**As a** user, **I want** powerful filters **so that** I focus on relevant records.

**Acceptance criteria**
- [ ] Basic mode: year, month, day status, location, duration.
- [ ] Advanced mode: week, day name, day, overtime, description.
- [ ] Reset filters clears all dropdowns and calendar selection.
- [ ] Column sort via table headers.
- [ ] “Show all dates” toggles future-dated entries.

**Code:** `filters.js`, `render.js`, `calendar.js`

---

### US-206 — View times in selected timezone

**As a** user, **I want** to choose a view timezone **so that** I read clock times in my context.

**Acceptance criteria**
- [ ] Dropdown: Entry timezone or any IANA zone.
- [ ] Date and clock in/out converted via Luxon.
- [ ] `(+1)` shown when clock-out crosses midnight in view zone.

**Code:** `render.js`, `time.js`, `timezone-picker.js`

---

## Epic E3 — Voice-Assisted Entry

**Personas:** Alex, Sam  
**FRs:** FR-04

### US-301 — Voice capture

**As a** user, **I want** to dictate entry details **so that** I log hands-free.

**Acceptance criteria**
- [ ] Speech recognition starts from voice button (single/bulk/edit).
- [ ] Parser extracts date, times, break, status, location, description.
- [ ] Multilingual number words and AM/PM patterns supported.

**Code:** `voice-entry.js`

---

### US-302 — Review before apply

**As a** user, **I want** to review parsed voice data **so that** errors are caught before save.

**Acceptance criteria**
- [ ] Review modal shows all parsed fields editable.
- [ ] Apply writes to target form (single/bulk/edit).
- [ ] Retake restarts recognition.
- [ ] Cancel discards without mutation.

**Code:** `voice-entry.js`, `modal.js`

---

## Epic E4 — Data Reliability and Sync

**Personas:** Alex, Riley  
**FRs:** FR-05, FR-14

### US-401 — Autosave with retry

**As a** user, **I want** background save **so that** I do not lose work.

**Acceptance criteria**
- [ ] Changes queue autosave to localStorage immediately.
- [ ] Remote POST retried on transient failure (up to 3 times, 4 s interval).
- [ ] Status badge (`#saveDataStatus`) shows Saving, Saved, Retrying, or error via `sync-status.js`.
- [ ] Badge text updates when UI language changes (`refreshSyncStatusDisplay`).

**Code:** `storage.js`, `sync-status.js`, `data-sync.js`

---

### US-402 — Startup cloud sync

**As a** user, **I want** latest server data on load **so that** I continue where I left off.

**Acceptance criteria**
- [ ] On init, GET `/api/working-hours-data` when available.
- [ ] Remote merged with local via `mergeWorkingHoursData`.
- [ ] Silent mode avoids blocking toasts on empty 404.
- [ ] Profile restore runs after sync completes.

**Code:** `init.js`, `data-sync.js`

---

### US-403 — Manual save and file sync

**As a** user, **I want** to save or load a JSON file **so that** I have offline backup.

**Acceptance criteria**
- [ ] Save Data writes `Working Hours Data.json` structure.
- [ ] Sync button loads file or triggers API sync.
- [ ] File import uses same merge rules as API.

**Code:** `data-sync.js`, `import.js`

---

## Epic E5 — Reporting and Analytics

**Personas:** Morgan  
**FRs:** FR-06, FR-10, FR-11

### US-501 — Export CSV and JSON

**As a** manager, **I want** portable exports **so that** I use data in Excel or BI tools.

**Acceptance criteria**
- [ ] CSV includes UTF-8 BOM, profile metadata, vacation quota, all entry fields.
- [ ] JSON exports full payload with `exportedAt`.
- [ ] Locked profiles excluded unless unlocked; user warned.
- [ ] Export toast shows duration and counts.

**Code:** `export.js`

---

### US-502 — Import CSV and JSON

**As a** user, **I want** to import files **so that** I migrate or restore data.

**Acceptance criteria**
- [ ] Parser normalizes enums and dates.
- [ ] Merge preserves latest `updatedAt` per entry.
- [ ] Partial row errors reported via toast (first 3 messages).

**Code:** `import.js`

---

### US-503 — Stats summary charts

**As a** manager, **I want** visual analytics **so that** I spot trends quickly.

**Acceptance criteria**
- [ ] Modal categories: General and Details.
- [ ] Date range filter; view selector (yearly/monthly/etc.).
- [ ] Enlarge, download, keyboard navigation between charts.

**Code:** `stats-summary.js`, `modal.js`

---

### US-504 — Infographic dashboard

**As a** manager, **I want** a structured infographic **so that** I see quota vs usage and weekday patterns.

**Acceptance criteria**
- [ ] Timeframe: annual, quarterly, monthly, weekly.
- [ ] Sections exportable to CSV per block.
- [ ] Fullscreen section view with prev/next.

**Code:** `infographic.js`

---

### US-505 — Key Highlights PPT

**As a** manager, **I want** a PowerPoint deck **so that** I present highlights without manual slides.

**Acceptance criteria**
- [ ] Modal options for sections and date range.
- [ ] Generates `.pptx` via PptxGenJS.
- [ ] Filename includes profile and date stamp.

**Code:** `highlights-ppt.js`

---

## Epic E6 — Localization and Personalization

**Personas:** Sam, Alex  
**FRs:** FR-07, FR-13

### US-601 — Switch UI language

**As a** global user, **I want** full UI translation **so that** I work in my language.

**Acceptance criteria**
- [ ] Language selector includes auto + 25 locales.
- [ ] Manual packs loaded for supported locales.
- [ ] Dynamic labels refresh (entries, modals, stats) on change.
- [ ] `npm run verify:i18n` passes for pack structure.

**Code:** `i18n.js`, `i18n-*-locale.js`, `init.js`

---

### US-602 — Select UI theme

**As a** user, **I want** country/region themes **so that** the UI matches my preference.

**Acceptance criteria**
- [ ] 36 themes in `themeSelect`; persisted to `workingHoursTheme`.
- [ ] `body[data-theme]` applies CSS variable overrides.
- [ ] Theme survives reload.

**Code:** `init.js`, `index.html` (CSS)

---

## Story → Requirement Traceability (quick reference)

| Story | FR |
|-------|-----|
| US-101–105 | FR-01, FR-02, FR-12 |
| US-201–206 | FR-03, FR-08, FR-09 |
| US-301–302 | FR-04 |
| US-401–403 | FR-05, FR-14 |
| US-501–505 | FR-06, FR-10, FR-11 |
| US-601–602 | FR-07, FR-13 |

See `TRACEABILITY_MATRIX.md` for code and test mapping.
