# Variables Dictionary

**Purpose:** Define product and derived variables with stable names, plain-language definitions, formulas, where they surface in the app, and examples. Analytics, QA, and engineering should treat this file as the canonical dictionary for metrics in `PRODUCT_METRICS.md`.

**Current state:** Sections cover entry fields, derived duration and overtime, aggregates, statistics tooltip breakdowns, connectivity telemetry, infographic period logic, UI state for the timeframe control, formatting helpers, and relationship diagrams (Mermaid).

**Operational guidance:** When you add a field to persisted data, a new card metric, or a new aggregation path, add or update a row here in the same change set. Link metrics to variables; link variables to code paths where non-obvious.

**Change notes:** Record structural changes in `CHANGELOG.md` and map major additions in `TRACEABILITY_MATRIX.md`.

---

## 1. Core Entry Variables

| Variable Name | Friendly Name | Definition | Formula / Rule | Location in App | Example |
|---|---|---|---|---|---|
| `profileName` | Active Profile | Profile key for current working context. | Selected profile identifier from profile controls. | Profile section, storage, API payload keys | `Engineering - A` |
| `date` | Entry Date | Calendar day represented by an entry. | `YYYY-MM-DD` normalized date. | Entry form, table, calendar, stats | `2026-03-24` |
| `clockIn` | Start Time | Entry start time. | `HH:mm` normalized to `00:00..23:59`. | Entry form, table, calculations | `08:45` |
| `clockOut` | End Time | Entry end time. | `HH:mm` normalized to `00:00..23:59`. | Entry form, table, calculations | `18:10` |
| `breakMinutes` | Break Duration | Non-working minutes deducted from worked duration. | Integer minutes, min `0`. | Entry form, calculations, analytics | `60` |
| `dayStatus` | Day Type | Semantic category of the day. | One of: `work`, `vacation`, `holiday`, `sick`. | Entry form, table, calendar, stats cards | `work` |
| `location` | Work Location | Work location classification. | One of: `WFO`, `WFH`, `Anywhere`. | Entry form, filters, infographic tables | `WFH` |
| `description` | Work Description | Optional free-text context for the entry. | Trimmed text; empty allowed. | Entry form, search, table | `Client planning and code review` |
| `timezone` | Entry Timezone | IANA timezone associated with entry timing. | Selected or auto-detected timezone string. | Entry form, edit modal, table timezone display | `Europe/Berlin` |
| `createdAt` | Created Timestamp | Entry creation timestamp in ISO format. | Set when entry is first persisted. | Data storage, merge logic | `2026-03-24T08:01:15.000Z` |
| `updatedAt` | Updated Timestamp | Last modified timestamp in ISO format. | Updated during save/edit and merge winner logic. | Data storage, merge conflict resolution | `2026-03-24T17:45:41.000Z` |

## 2. Derived Duration and Day Variables

| Variable Name | Friendly Name | Definition | Formula / Rule | Location in App | Example |
|---|---|---|---|---|---|
| `grossMinutes` | Gross Duration | Raw minutes between clock-out and clock-in. | `clockOutMinutes - clockInMinutes` | Time utility and per-entry calculations | `565` |
| `netWorkMinutes` | Net Work Duration | Actual worked minutes after break. | `max(grossMinutes - breakMinutes, 0)` | Entries summary, stats | `505` |
| `standardWorkMinutes` | Standard Daily Target | Baseline expected daily working minutes. | Constant `8 * 60` | Constants and overtime formulas | `480` |
| `overtimeMinutes` | Overtime Duration | Minutes worked above standard target. | `max(netWorkMinutes - standardWorkMinutes, 0)` | Stats summary and overtime views | `25` |
| `isWorkDay` | Workday Flag | Indicates entry contributes to work-time aggregates. | `dayStatus === 'work'` | Aggregation logic and charts | `true` |

## 3. Aggregated Product Variables

| Variable Name | Friendly Name | Definition | Formula / Rule | Location in App | Example |
|---|---|---|---|---|---|
| `totalWorkMinutes` | Total Work Time | Sum of net worked minutes for workdays. | `sum(netWorkMinutes where dayStatus='work')` | Statistics cards and modals | `9620` |
| `totalOvertimeMinutes` | Total Overtime | Sum of positive overtime minutes. | `sum(overtimeMinutes)` | Statistics cards and charts | `540` |
| `avgWorkMinutes` | Average Daily Work Time | Average work minutes per workday. | `totalWorkMinutes / workDaysCount` | Statistics summary | `481` |
| `avgOvertimeMinutes` | Average Daily Overtime | Average overtime per workday. | `totalOvertimeMinutes / workDaysCount` | Statistics summary | `27` |
| `workDaysCount` | Work Days | Number of entries with `dayStatus='work'`. | Count rule | Days-by-type cards and filters | `20` |
| `vacationDaysCount` | Vacation Days | Number of entries with `dayStatus='vacation'`. | Count rule | Days-by-type cards | `2` |
| `holidayDaysCount` | Holidays | Number of entries with `dayStatus='holiday'`. | Count rule | Days-by-type cards | `1` |
| `sickDaysCount` | Sick Days | Number of entries with `dayStatus='sick'`. | Count rule | Days-by-type cards | `1` |
| `vacationQuota` | Vacation Quota | Allowed vacation days for profile period. | Configured per profile metadata | Infographic summary tables | `24` |
| `vacationUsed` | Vacation Used | Consumed vacation days in period. | Count of vacation entries in range | Infographic summary tables | `7` |
| `vacationRemaining` | Vacation Remaining | Unused vacation balance. | `max(vacationQuota - vacationUsed, 0)` | Infographic vacation tables | `17` |

## 3b. Weekday Breakdown and Tooltip Share Variables (Mon-Fri)

These variables power the "Days by type" weekday icon tooltips and the Work Days card location breakdown.

| Variable Name | Friendly Name | Definition | Formula / Rule | Location in App | Example |
|---|---|---|---|---|---|
| `workDaysByWeekdayCount` | Work days by weekday | Count of entries where `dayStatus='work'` and the entry date falls on the target weekday (Mon-Fri). Only counted when computed working duration is valid. | `count(entries where dayStatus='work' AND weekday(date)=w AND workingMinutes(...) != null)` | `Statistics` "Days by type" tooltips | `MON=218` |
| `vacationDaysByWeekdayCount` | Vacation days by weekday | Count of entries where `dayStatus='vacation'` and `weekday(date)=w` (Mon-Fri). | `count(entries where dayStatus='vacation' AND weekday(date)=w)` | `Statistics` "Days by type" tooltips | `WED=27` |
| `holidayDaysByWeekdayCount` | Holiday days by weekday | Count of entries where `dayStatus='holiday'` and `weekday(date)=w` (Mon-Fri). | `count(entries where dayStatus='holiday' AND weekday(date)=w)` | `Statistics` "Days by type" tooltips | `THU=10` |
| `sickDaysByWeekdayCount` | Sick days by weekday | Count of entries where `dayStatus='sick'` and `weekday(date)=w` (Mon-Fri). | `count(entries where dayStatus='sick' AND weekday(date)=w)` | `Statistics` "Days by type" tooltips | `FRI=3` |
| `dayTypeDaysByWeekdayShare` | Day-type share by weekday | Percentage for each weekday within the chosen day type (Mon-Fri). | `count(dayType,w) / totalDaysForType` | Weekday icon tooltips | `MON work: 18.9%` |
| `workDaysByWeekdayLocationCount` | Work days by weekday & location | For work entries on weekday `w`, count by location bucket: `WFO`, `WFH`, `Anywhere`. Only counted when computed working duration is valid. | `count(entries where dayStatus='work' AND weekday(date)=w AND location=... AND workingMinutes(...) != null)` | Work Days card + weekday icon tooltips | `WED WFO=73` |
| `workDaysByWeekdayLocationShareOfWeekday` | Location share within weekday | Location percentage within the weekday's work-day count (Mon-Fri). | `workDaysByWeekdayLocationCount(w,loc) / workDaysByWeekdayCount(w)` | Work Days weekday icon tooltips | `WED WFO: 30.5%` |
| `workDaysTotalByLocationCount` | Total work-days by location (Mon-Fri) | Aggregated work-day counts for each location bucket across Mon-Fri. | `sum_w workDaysByWeekdayLocationCount(w,loc)` | Work Days main-card tooltip "Total locations" line | `WFH=1,245` |
| `workDaysTotalByLocationShareOfDayType` | Location share within Work Days | Aggregated location percentages across Mon-Fri where denominator is total Work Days. | `sum_w workDaysByWeekdayLocationCount(w,loc) / workDaysCount` | Work Days main-card tooltip "Total locations" line | `WFH: 71.4%` |

## 3c. Work and Overtime Minutes Breakdown Variables (Mon-Fri)

These variables power the enhanced tooltips for Total Working Hours, Total Overtime, and their dedicated average sub-sections.

| Variable Name | Friendly Name | Definition | Formula / Rule | Location in App | Example |
|---|---|---|---|---|---|
| `workMinutesByWeekday` | Work minutes by weekday | Total net work minutes grouped by weekday (Mon-Fri). | `sum(netWorkMinutes where weekday(date)=w and dayStatus='work')` | Statistics combo card tooltips | `MON=104,640` |
| `overtimeMinutesByWeekday` | Overtime minutes by weekday | Total overtime minutes grouped by weekday (Mon-Fri). | `sum(overtimeMinutes where weekday(date)=w and dayStatus='work')` | Statistics combo card tooltips | `WED=8,230` |
| `workMinutesByWeekdayLocation` | Work minutes by weekday and location | Work minutes bucketed by weekday and location (`WFO`,`WFH`,`Anywhere`). | `sum(netWorkMinutes where weekday(date)=w and location=loc)` | Statistics combo card tooltips | `THU/WFO=39,520` |
| `overtimeMinutesByWeekdayLocation` | Overtime minutes by weekday and location | Overtime minutes bucketed by weekday and location (`WFO`,`WFH`,`Anywhere`). | `sum(overtimeMinutes where weekday(date)=w and location=loc)` | Statistics combo card tooltips | `FRI/WFH=2,340` |
| `avgWorkMinutesByWeekday` | Average work minutes by weekday | Average work minutes for weekday `w` over counted workdays on `w`. | `workMinutesByWeekday(w) / workDaysByWeekdayCount(w)` | Avg-per-work-day dedicated tooltip | `TUE=8h 56m` |
| `avgOvertimeMinutesByWeekday` | Average overtime by weekday | Average overtime minutes for weekday `w` over counted workdays on `w`. | `overtimeMinutesByWeekday(w) / workDaysByWeekdayCount(w)` | Avg-overtime dedicated tooltip | `THU=1h 07m` |
| `avgWorkMinutesByLocation` | Average work minutes by location | Average work minutes for location `loc` over counted workdays at `loc` (Mon-Fri). | `sum_w workMinutesByWeekdayLocation(w,loc) / sum_w workDaysByWeekdayLocationCount(w,loc)` | Avg-per-work-day dedicated tooltip | `WFH=9h 11m` |
| `avgOvertimeMinutesByLocation` | Average overtime by location | Average overtime minutes for location `loc` over counted workdays at `loc` (Mon-Fri). | `sum_w overtimeMinutesByWeekdayLocation(w,loc) / sum_w workDaysByWeekdayLocationCount(w,loc)` | Avg-overtime dedicated tooltip | `WFO=1h 03m` |

## 3d. Connectivity and Internet Speed Variables

| Variable Name | Friendly Name | Definition | Formula / Rule | Location in App | Example |
|---|---|---|---|---|---|
| `internetOnlineState` | Online State | Browser online/offline status flag. | `navigator.onLine === true` | Header internet status indicator | `true` |
| `internetDownlinkMbps` | Live Downlink Estimate | Best-effort browser-reported downlink speed estimate in Mbps. | `navigator.connection.downlink` (when available) | Internet status tooltip | `72.4` |
| `internetSpeedDailyDateKey` | Daily Speed Date Key | Local-calendar date key for daily speed aggregation. | `YYYY-MM-DD` (local time) | Internet speed daily storage | `2026-03-26` |
| `internetSpeedDailyMinMbps` | Daily Min Speed | Minimum sampled downlink speed for current local day. | `min(sampledDownlinkMbps)` | Internet status tooltip | `18.5` |
| `internetSpeedDailyMaxMbps` | Daily Max Speed | Maximum sampled downlink speed for current local day. | `max(sampledDownlinkMbps)` | Internet status tooltip | `94.0` |
| `internetSpeedDailyAvgMbps` | Daily Avg Speed | Average sampled downlink speed for current local day. | `sum(sampledDownlinkMbps) / sampleCount` | Internet status tooltip | `54.2` |
| `internetSpeedDailySampleCount` | Daily Speed Sample Count | Number of sampled downlink observations for current day. | `count(sampledDownlinkMbps)` | Internet status tooltip and diagnostics | `126` |

## 3e. Infographic Timeframe and Period Variables

These variables describe how entries are grouped for **Weekdays**, **Clock In & Clock Out**, and **Details** clusters in the Infographic modal. They are implemented primarily in `js/infographic.js`.

| Variable Name | Friendly Name | Definition | Formula / Rule | Location in App | Example |
|---|---|---|---|---|---|
| `infographicTimeframe` | Infographic time grain | User-selected aggregation period for weekday-centric infographic tables. | One of: `annual`, `quarterly`, `monthly`, `weekly`. Normalized by `normalizeInfographicTimeframe`; persisted under storage key `workingHours.infographicTimeframe` when `localStorage` is available. | Infographic toolbar `#infographicTimeframe` | `monthly` |
| `periodSortKey` | Period bucket key | Canonical string key for an entry’s bucket under the active timeframe. | **Annual**: `String(fullYear)`. **Quarterly**: `YYYY-Qq` where `q` is 1–4. **Monthly**: `YYYY-MM`. **Weekly**: `YYYY-Www` ISO week-year and week (Monday-based week 1 contains Jan 4). | Internal aggregation only; displayed via `formatInfographicPeriodLabel` | `2026-03` |
| `weekdayPeriodOrder` | Period row order | Ordered list of period keys shown in infographic weekday tables and CSV. | Union of keys from work, location, and clock maps; for annual mode ensure calendar years from data appear; `sort()` then **reverse** for **newest first**. | `patchInfographicWeekdayTables`, `exportInfographicTable` | `['2026-03','2026-02','2026-01',…]` |
| `workByPeriod` | Work stats by period and weekday | Nested map: period key → weekday (1–5) → totals, day counts, averages. | Same inclusion rules as yearly weekday work stats, but bucketed by `periodSortKey`. | Infographic Weekdays sections | Per-cell total or average minutes |
| `workByPeriodLoc` | Work stats by period, weekday, and location | Same as `workByPeriod` but split for `WFO` and `WFH` only. | Entries with other `location` values are omitted from this split. | Infographic **Details** sections | Labeled cell: office versus home |
| `clockByPeriod` | Clock in/out by period and weekday | Per period and weekday: min, max, sum, count, and average of clock-in and clock-out times in **minutes since midnight**. | Built only for `dayStatus='work'` weekdays; invalid spans excluded. | Infographic **Clock In & Clock Out** grid | `08:30` display from minutes |
| `formatInfographicMinutes` | Infographic duration display | User-facing duration string for work and overtime cells in the Infographic modal. | Implemented in `js/infographic.js`: delegates to `W.formatMinutes(m)` from `js/time.js` (short default style, locale-aware units). If `formatMinutes` is unavailable, falls back to a neutral `Xh Ym` style with sign handling. | Infographic **General** summary tables, **Weekdays**, **Details** (WFO/WFH cells use the same formatter on minute totals and averages). | Locale-dependent, for example `8h 30m` (compact short style) or spelled-out units when long style is selected in shared formatters. |

### Infographic variable relationships (add-on)

```mermaid
flowchart LR
  TF[infographicTimeframe] --> PK[periodSortKey from entry date]
  PK --> WB[workByPeriod]
  PK --> WL[workByPeriodLoc]
  PK --> CK[clockByPeriod]
  WB --> PO[weekdayPeriodOrder]
  WL --> PO
  CK --> PO
  PO --> UI[Table rows and CSV order]
  WB --> FM[formatInfographicMinutes on cell values]
  WL --> FM
```

## 3f. Infographic UI state variables (timeframe toolbar)

These describe **presentation and input state** for the Infographic modal toolbar. Logic lives in `syncInfographicTimeframeForPanel` and related open/render paths in `js/infographic.js`. Markup: `#infographicTimeframeWrap`, `#infographicTimeframe`, `index.html` (`.infographic-timeframe-wrap.is-hidden`).

| Variable name | Friendly name | Definition | Formula / rule | Location in app | Example |
|---|---|---|---|---|---|
| `infographicActiveClusterPanelId` | Active infographic cluster | Which panel container is currently visible (`infographicSummaryPanel`, `infographicVacationPanel`, `infographicWorkPanel`, `infographicClockPanel`, `infographicLocationPanel`). | Exactly one panel has neither `hidden` nor `is-hidden`; driven by category bar `data-target-panel`. | Infographic category toolbar and `#infographicContent` children | `infographicWorkPanel` |
| `infographicTimeframeToolbarVisible` | Timeframe toolbar visibility | Whether the timeframe label and `<select>` are shown. | `true` if `infographicActiveClusterPanelId` is one of `infographicWorkPanel`, `infographicClockPanel`, `infographicLocationPanel`; otherwise `false`. | `#infographicTimeframeWrap` | `false` on **General** |
| `infographicTimeframeSelectEnabled` | Timeframe input enabled | Whether the user can change the timeframe. | Mirrors toolbar visibility: `disabled` when toolbar hidden; `aria-hidden` and `aria-label` updated for assistive tech. | `#infographicTimeframe` | `disabled` on **Vacation** |
| `INFOGRAPHIC_TIMEFRAME_PANEL_IDS` | Timeframe-applicable panels (code constant) | Set of panel IDs that participate in period bucketing. | Object keys in code: `infographicWorkPanel`, `infographicClockPanel`, `infographicLocationPanel`. | `js/infographic.js` | Used by `syncInfographicTimeframeForPanel` |

### Relationship: active cluster → timeframe UI → aggregates

```mermaid
flowchart TD
  CAT[Category bar click] --> PANEL[infographicActiveClusterPanelId]
  PANEL --> SYNC[syncInfographicTimeframeForPanel]
  SYNC --> VIS[infographicTimeframeToolbarVisible]
  SYNC --> EN[infographicTimeframeSelectEnabled]
  EN -->|on change| TF[infographicTimeframe value]
  TF --> REF[refreshInfographicModalTimeframe]
  REF --> PO[weekdayPeriodOrder + patchInfographicWeekdayTables]
```

### Relationship: filters → Infographic General summary

The **General** cluster summary metrics use **filtered entries** (`getFilteredEntries`) for quota-scoped years and status counts, while period-bucketed tables use the full entry list for aggregation keys. This split prevents misleading period rows while keeping summary aligned with the visible table slice.

```mermaid
flowchart LR
  F[Filter controls + calendar selection] --> GF[getFilteredEntries]
  GF --> GS[Infographic General summary metrics]
  E[getEntries - profile scope] --> PERIOD[periodSortKey + workByPeriod / clockByPeriod / workByPeriodLoc]
  PERIOD --> WT[Weekdays / Clock / Details tables]
```

## 4. Formatting Variables and Display Helpers

| Variable Name | Friendly Name | Definition | Formula / Rule | Location in App | Example |
|---|---|---|---|---|---|
| `displayNumber` | Display Number | Locale-aware compact or full numeric representation. | `formatDisplayNumber(value, options)` | Stats, infographic, table labels | `1.2K` |
| `displayMinutes` | Display Duration | Locale-aware long/short minute formatting. | `formatMinutes(value, options)` | Cards, tooltips, summary text | `8h 25m` |
| `timezoneLabel` | Timezone Label | Human-readable timezone city-country label. | `getTimeZoneLabel(tz, language)` | Form selectors and info badges | `Germany, Berlin` |

## 5. Variable Relationship Chart

```mermaid
flowchart TD
  A[clockIn / clockOut] --> B[grossMinutes]
  C[breakMinutes] --> D[netWorkMinutes]
  B --> D
  D --> E[totalWorkMinutes]
  F[standardWorkMinutes] --> G[overtimeMinutes]
  D --> G
  G --> H[totalOvertimeMinutes]
  E --> I[avgWorkMinutes]
  H --> J[avgOvertimeMinutes]
  K[dayStatus] --> L[workDaysCount]
  K --> M[vacationDaysCount]
  K --> N[holidayDaysCount]
  K --> O[sickDaysCount]
  M --> P[vacationUsed]
  Q[vacationQuota] --> R[vacationRemaining]
  P --> R
  E --> S[displayMinutes]
  H --> S
  L --> T[displayNumber]
  M --> T
  N --> T
  O --> T

  Z[date] --> AA[weekdayIndexMonFri]
  AA --> AB[dayTypeDaysByWeekdayCount]
  AB --> AC[dayTypeDaysByWeekdayShare]

  K --> AD[workDaysByWeekdayLocationCount]
  AA --> AD
  AD --> AE[workDaysByWeekdayLocationShareOfWeekday]
  AD --> AF[workDaysTotalByLocationCount]
  AF --> AG[workDaysTotalByLocationShareOfDayType]

  D --> AH[workMinutesByWeekday]
  G --> AI[overtimeMinutesByWeekday]
  AH --> AJ[workMinutesByWeekdayLocation]
  AI --> AK[overtimeMinutesByWeekdayLocation]
  AH --> AL[avgWorkMinutesByWeekday]
  AI --> AM[avgOvertimeMinutesByWeekday]
  AJ --> AN[avgWorkMinutesByLocation]
  AK --> AO[avgOvertimeMinutesByLocation]

  AP[navigator.connection.downlink] --> AQ[internetDownlinkMbps]
  AQ --> AR[internetSpeedDailyMinMbps]
  AQ --> AS[internetSpeedDailyMaxMbps]
  AQ --> AT[internetSpeedDailyAvgMbps]
  AQ --> AU[internetSpeedDailySampleCount]
```

## 6. Governance Notes

- Update this dictionary whenever new fields, formulas, display helpers, or **UI state variables** (for example Infographic toolbar visibility in §3f) are introduced.
- Every metric in `PRODUCT_METRICS.md` must reference source variables from this file.
