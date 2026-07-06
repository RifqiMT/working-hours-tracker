# Feature Logic Catalog

**Product:** Working Hours Tracker  
**Last updated:** 2026-07-06

Behavioral reference for implementers and QA. Each section states **trigger → processing → outcome**.

---

## 1. Profile Access Logic

| Action | Unlock required? | Module |
|--------|------------------|--------|
| View entries table | Yes, if `passwordHash` set | `entries.js` |
| Save/edit/delete entry | Yes | `form.js`, `modal.js` |
| Export CSV/JSON | Yes (profile skipped if locked) | `export.js` |
| Edit profile / delete profile | Yes | `handlers.js` |
| Switch profile | Prompt if target locked | `handlers.js` |

**Password flow:** `requireProfileAccess` → modal → `verifyProfilePassword` → `grantProfileAccessSession` (in-memory).

**Password change:** Current password required when hash exists (`handleSaveEditProfile`).

---

## 2. Entry Save Logic (single)

1. Read form via `getEntryFormValues()`.
2. Normalize date (`YYYY-MM-DD`), times (`HH:mm`), break to minutes.
3. If entry exists for date → update by id; else push new with `generateId()`.
4. Set `createdAt` / `updatedAt` timestamps.
5. `setEntries` → `setData` → autosave.

**Non-work status:** Applying sick/holiday/vacation sets `NON_WORK_DEFAULTS` and locks location to `Anywhere`.

---

## 3. Bulk Entry Logic

1. Rows in `#bulkEntryRows`; active index `_bulkActiveIndex`.
2. `updateBulkEntryDateDuplicateHint` scans all row dates.
3. Save iterates valid rows; same merge rules as single.
4. Voice can target single row or batch fill.

---

## 4. Merge Logic (client + server)

**Key construction:**
- `id:<entryId>` if id present
- else `date:<canonicalDate>`

**Winner:** Higher `updatedAt` (ISO compare).

**Post-merge collapse:** One entry per `YYYY-MM-DD` per profile.

**Root merge (`mergeWorkingHoursData`):**
- `profileMeta`, `vacationDaysByProfile`: shallow merge
- Profile arrays: `mergeEntriesArrays`
- `lastClock_*`: incoming replaces

---

## 5. Filter Logic

**Basic mode:** Year, month, day status, location, duration — advanced filters ignored for matching.

**Advanced mode:** All filters active including week, day name, day, overtime, description.

**NL query (`entries-search.js`):** Parses intents (e.g. overtime, location) into filter predicates.

**Show all dates:** When unchecked, hides entries with `date > today`.

---

## 6. Calendar Logic

- Month navigation updates `_calendarYear` / `_calendarMonth`.
- Click date toggles multi-select list `_calendarSelectedDates`.
- Sync bidirectional with year/month/day filters.

---

## 7. Timezone Logic

**Entry timezone:** Stored per entry; default from browser/IP detection (`time.js`).

**View timezone:** `entriesViewTimezone` converts display via Luxon (`formatEntryInViewZone`, `formatClockInOutInZone`).

**Legacy migration:** Edit modal upgrades `Europe/Berlin` legacy stored value to detected timezone when appropriate (`modal.js`).

---

## 8. Voice Parsing Logic

1. `SpeechRecognition` captures transcript.
2. Regex + word-number maps extract date, times, break, status, location, description.
3. Review modal allows edit.
4. Apply merges into active form context.

**Canonical output:** English enum values for status/location regardless of spoken language.

---

## 9. Export Logic

1. `getFullExportPayload` or `getData`.
2. `resolveExportDataByAccess` removes locked profiles.
3. CSV: UTF-8 BOM, quoted fields, columns per `VARIABLES.md`.
4. JSON: pretty-printed with `exportedAt`.
5. Toast with timing and counts; warn skipped locked profiles.

---

## 10. Import Logic

1. Parse CSV or JSON.
2. Normalize enums, dates, times.
3. Merge into current data via same rules as API.
4. Re-render entries, calendar, stats.

---

## 11. Autosave and Sync Logic

| Event | Behavior |
|-------|----------|
| `setData` | Write localStorage; queue remote save |
| Save failure | Retry with backoff; status indicator |
| Startup | GET merge; `onComplete` callback for profile restore |
| Manual sync | File picker or API; user-triggered |

---

## 12. Stats and Infographic Logic

**Stats summary:** Filtered entries → aggregate by view (yearly/monthly/…) → Chart.js datasets.

**Infographic:** `workingHours.infographicTimeframe` selects period key format (annual/quarterly/monthly/weekly).

**Overtime:** Only `dayStatus === 'work'` contributes to overtime totals.

---

## 13. i18n Logic

1. Resolve language: `auto` → `navigator.language` → pack.
2. `applyTranslations` updates DOM `data-i18n-*` elements.
3. `refreshDynamicTranslations` re-renders entries, stats, modals.
4. Manual packs override embedded English for 24 locales.

**Network translation:** Off by default; opt-in via `window.__WH_ALLOW_NETWORK_TRANSLATION__`.

---

## 14. Theme Logic

1. `initTheme` reads `workingHoursTheme` from localStorage.
2. `applyTheme` sets `body[data-theme]` and syncs `#themeSelect`.
3. CSS variables cascade to components and charts.

---

## 15. Related Documents

- `VARIABLES.md` — field definitions
- `USER_STORIES.md` — acceptance criteria
- `GUARDRAILS.md` — constraints
