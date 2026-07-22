# User Personas

**Product:** Working Hours Tracker  
**Last updated:** 2026-07-22

Personas represent primary user archetypes. Use them for PRD scoping, story writing, design reviews, and metrics interpretation.

---

## Persona 1 — Alex, Individual Contributor

| Attribute | Detail |
|-----------|--------|
| **Role** | Software engineer / consultant / analyst |
| **Age range** | 25–45 |
| **Tech comfort** | High |
| **Primary device** | Laptop browser (Chrome/Edge/Safari) |
| **Locale** | Often multilingual; may use voice entry in native language |

### Goals
- Log start/end times and breaks with minimal clicks each day.
- Correct mistakes same-day without breaking historical data.
- See overtime and work-day totals at a glance.

### Pain points
- Spreadsheets require too many manual steps.
- Date formats and time zones cause calculation errors.
- Re-entering a full week after vacation is tedious.

### Needs in the app
- Single-entry form with smart defaults (browser timezone, today’s date).
- Bulk entry panel and “fill example” for upcoming workdays.
- Clock in / clock out buttons.
- Voice entry with review step.
- Clear duplicate-date hints.

### Primary workflows
1. Morning: Clock In → continue work.
2. Evening: Clock Out or edit entry with break.
3. Friday: glance at stats box for weekly hours.

### Success criteria
- Daily update completed in **under 2 minutes**.
- Same-day correction without support.
- ≥ 92% of entries need no same-day re-edit (Entry Accuracy Rate KPI).

### Quotes (illustrative)
> “I just want to tap clock in and forget about it until Friday.”

---

## Persona 2 — Morgan, Team Lead / Manager

| Attribute | Detail |
|-----------|--------|
| **Role** | Engineering manager, project lead, practice lead |
| **Reporting cadence** | Weekly standups, monthly stakeholder reviews |
| **Tech comfort** | Medium–high |

### Goals
- Trust aggregated hours, overtime, and leave counts.
- Produce slide decks and CSV extracts for leadership.
- Compare patterns by month, location (WFO/WFH), and weekday.

### Pain points
- Team members use inconsistent templates.
- Ad-hoc Excel work before every review meeting.
- Uncertainty whether data is complete through today.

### Needs in the app
- Filters (year/month/status/location) + “show all dates” toggle.
- Stats Summary modal with downloadable charts.
- Infographic with annual/quarterly/monthly/weekly views.
- Key Highlights PPT export.
- CSV export with profile metadata.

### Primary workflows
1. Select team member’s profile (or own consolidated profile).
2. Filter to reporting month → open Stats Summary.
3. Export PPT for leadership meeting.

### Success criteria
- Monthly report package prepared in **under 30 minutes** (40% reduction vs spreadsheet baseline per OKR KR2.1).
- Export success rate ≥ 98%.

### Quotes (illustrative)
> “I need numbers I can put on a slide without reformatting everything.”

---

## Persona 3 — Riley, Operations Analyst

| Attribute | Detail |
|-----------|--------|
| **Role** | Data steward, compliance analyst, internal tools owner |
| **Consumers** | BI pipelines, audit, HR systems (read-only) |

### Goals
- Predictable JSON/CSV schema across releases.
- Documented field meanings and merge behavior.
- Changelog and traceability for every schema change.

### Pain points
- Undocumented new fields break downstream jobs.
- Merge conflicts produce duplicate dates.
- Password or metadata fields handled inconsistently in exports.

### Needs in the app
- `VARIABLES.md` and `DATA_SCHEMA_EXAMPLES.md` accuracy.
- Export columns: Profile, Profile ID, Role, Vacation quota, Entry ID, timestamps.
- Merge library shared between client and server.
- API contract stability.

### Primary workflows
1. Pull JSON export or GET `/api/working-hours-data`.
2. Validate against schema examples and enum reference.
3. File change request if `CHANGELOG.md` shows breaking changes.

### Success criteria
- **Zero** schema rejection incidents in downstream pipelines per quarter (KR2.3).
- 100% traceability matrix coverage for FRs.

### Quotes (illustrative)
> “If it’s not in VARIABLES.md, it doesn’t exist for my pipeline.”

---

## Persona 4 — Jordan, Shared Device User

| Attribute | Detail |
|-----------|--------|
| **Role** | Contractor, shift worker, hot-desk user |
| **Environment** | Shared workstation, kiosk, or family computer |
| **Security expectation** | Profile-level privacy, not OS-level |

### Goals
- Keep personal time records separate from others on same browser.
- Prevent accidental edits to another person’s profile.
- Quick lock when walking away.

### Pain points
- Forgot to switch profile before saving.
- No password on sensitive profile.
- Browser localStorage visible to same-machine users.

### Needs in the app
- Clear active profile in selector and role display.
- Profile password on create/edit.
- Unlock prompt before view/edit/export on locked profiles.
- Session unlock in memory (cleared on refresh).

### Primary workflows
1. Select own profile → unlock with password if locked.
2. Log entries → switch profile only after closing sensitive views.
3. Set password via Edit Profile when leaving shared desk.

### Success criteria
- No unauthorized profile modifications reported per quarter.
- Password lock used on ≥ 80% of shared-device profiles (target metric).

### Quotes (illustrative)
> “Someone else uses this laptop—I need my hours locked.”

---

## Persona 5 — Sam, Localization Champion (secondary)

| Attribute | Detail |
|-----------|--------|
| **Role** | Internal localization reviewer or bilingual power user |
| **Focus** | UI completeness in non-English locales |

### Goals
- Every visible string translated in manual locale packs.
- Voice and dynamic text handled predictably.

### Needs
- `npm run verify:i18n` clean.
- Language selector with rollout stages documented.
- No raw i18n keys in production UX.

### Success criteria
- 100% translation coverage for shipped keys (KR3.1).

---

## Persona Usage Matrix

| Feature area | Alex | Morgan | Riley | Jordan | Sam |
|--------------|:----:|:------:|:-----:|:------:|:---:|
| Single/bulk entry | ● | ○ | ○ | ● | ○ |
| Voice entry | ● | ○ | ○ | ● | ○ |
| Stats / infographic | ○ | ● | ○ | ○ | ○ |
| Export / import | ○ | ● | ● | ○ | ○ |
| Profile password | ○ | ○ | ● | ● | ○ |
| i18n / themes | ● | ○ | ○ | ● | ● |

● = primary  ○ = secondary

---

## Related documents

- `USER_STORIES.md` — epics and acceptance criteria per persona needs
- `PRD.md` — formal requirements (v2.4)
- `PRODUCT_METRICS.md` — KPIs per persona success criteria
- `DESIGN_GUIDELINES.md` — themes and accessibility for Sam/Alex locales
- `docs/README.md` — documentation hub (standard v2.4)
