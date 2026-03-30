# User Stories

**Purpose:** Capture user-valued behavior in a testable form. Each story below ties to requirements in `PRD.md` and rows in `TRACEABILITY_MATRIX.md`.

**Current state:** Stories cover entry lifecycle, filters, analytics, infographic timeframe and layout, localization, tooltips, connectivity telemetry, and exports.

**Operational guidance:** When adding a story, assign a stable **US-xxx** ID, list acceptance criteria as verifiable bullets, and add or update a traceability row before marking the feature done.

---

## Story Format

- **ID**
- **As a**
- **I want**
- **So that**
- **Acceptance Criteria**

## Entry and Profile Stories

### US-001 Create Daily Entry
- As an Individual Contributor, I want to add a daily entry with date/time/status/location, so that my workday is properly recorded.
- Acceptance Criteria:
  - Required fields are validated.
  - Entry persists and appears in entries table.
  - Statistics refresh immediately after save.

### US-002 Edit Existing Entry
- As an Individual Contributor, I want to edit existing entries, so that corrections are reflected accurately.
- Acceptance Criteria:
  - Edit modal preloads current data.
  - Timezone defaults resolve intelligently for legacy and missing values.
  - Updated record is shown with refreshed aggregates.

### US-003 Multi-Entry Input
- As an Individual Contributor, I want to submit multiple entries in one flow, so that I can backfill data faster.
- Acceptance Criteria:
  - Multi-entry form supports sequential or bulk submission.
  - Validation feedback identifies invalid rows clearly.

## Filtering and Review Stories

### US-004 Basic and Advanced Filters
- As a Team Lead, I want to filter entries by date/status/location and advanced criteria, so that I can isolate meaningful slices.
- Acceptance Criteria:
  - Basic filters are always available.
  - Advanced controls are visible and disabled when advanced mode is off.
  - Filter results update table and analytics together.

### US-005 Search and Quick Review
- As an Operations Analyst, I want to search entry descriptions and metadata, so that I can quickly investigate specific patterns.
- Acceptance Criteria:
  - Search applies without breaking existing filter states.
  - Empty result states are clearly represented.

## Analytics Stories

### US-006 Statistics Summary Insight
- As a Team Lead, I want summary cards and charts, so that I can assess productivity and overtime trends quickly.
- Acceptance Criteria:
  - Cards show compact values and full-value tooltips.
  - Days-by-type distribution is clear and readable.

### US-007 Infographic Exploration
- As an Operations Analyst, I want clustered infographic tables with fullscreen navigation, so that I can compare detailed breakdowns.
- Acceptance Criteria:
  - Cards are grouped by defined business clusters (**General**, **Vacation**, **Weekdays**, **Clock In & Clock Out**, **Details**).
  - Timeframe selection re-aggregates weekday-centric tables; rows show newest periods first; long tables scroll with sticky headers.
  - Fullscreen mode allows table-to-table navigation within the active cluster panel.
  - Modal remains fluid across target breakpoints.

## Localization and Timezone Stories

### US-008 Full Localization Coverage
- As a Global User, I want all UI text localized, so that I can use the product in my preferred language without mixed strings.
- Acceptance Criteria:
  - No user-visible hardcoded English fallback in localized mode.
  - Tooltips and status labels are localized.

### US-009 Timezone and Location Context
- As an Individual Contributor, I want timezone auto-detection with source context, so that my entries align with my real location.
- Acceptance Criteria:
  - Browser timezone is detected and used.
  - IP-derived location metadata appears in a tooltip icon.
  - Browser fallback is used when offline.

## Reporting Stories

### US-010 Export to CSV/JSON/PPT
- As an Analyst, I want to export operational and presentation-friendly outputs, so that reporting can be shared externally.
- Acceptance Criteria:
  - CSV and JSON exports are complete and valid.
  - PPT highlights reflect the same source stats and language intent.

## Tooltip, Localization, and Language Selection Stories

### US-011 Professional Statistics Tooltips
- As a Team Lead, I want Statistics tooltips to be readable, modern, and consistent across devices, so that I can quickly understand compact values without confusion.
- Acceptance Criteria:
  - Statistics tooltips render via the custom tooltip system (no duplicate browser-native `title` tooltips).
  - Tooltip text supports multiline display and wraps correctly on narrow screens.
  - Weekday icons in "Days by type" show localized weekday abbreviations and accurate counts/percentages in tooltip content.

### US-012 Language Selection Synchronization
- As a Global User, I want language selection to update the UI immediately and consistently, so that I never see a mix of languages after switching.
- Acceptance Criteria:
  - Changing the language updates both native `<select>` content and any enhanced UI wrappers (e.g., smart-select).
  - Statistics and other dynamically rendered UI elements refresh with the selected manual language pack.

### US-013 Semantic Filter Ordering
- As a Team Lead, I want date-related filters sorted in logical calendar order, so that I can apply filters quickly without scanning alphabetically mixed options.
- Acceptance Criteria:
  - Month filter order is `All, Jan..Dec`.
  - Weekday filter order is `All, Monday..Sunday`.
  - Day filter order is `All, 1..31`.
  - Week filter order is `All, 1..53`.

### US-014 Structured Statistics Tooltip Readability
- As an Operations Analyst, I want structured and visually grouped tooltips in the Statistics section, so that I can read dense breakdowns easily.
- Acceptance Criteria:
  - Tooltips render grouped sections (title, location block, weekday block, indented detail lines).
  - Combo card average sub-sections have dedicated tooltips with weekday and location breakdowns.
  - Tooltip style remains responsive and readable on desktop/tablet/mobile.

### US-015 Real-Time Internet Speed Context
- As an Individual Contributor, I want internet status to include seamless real-time speed and a daily min/max/avg summary, so that I can understand connectivity quality during usage.
- Acceptance Criteria:
  - Online status can show current speed in Mbps when browser telemetry is available.
  - Tooltip shows daily min/max/avg values for the local day.
  - Updates are silent, smooth, and do not cause visible UI jitter.

## Infographic Stories

### US-016 Infographic Timeframe and Period Tables
- As an Operations Analyst, I want to change the Infographic **timeframe** between annual, quarterly, monthly, and weekly views, so that weekday work, overtime, clock, and WFO/WFH detail tables match the reporting period I care about.
- Acceptance Criteria:
  - Timeframe control offers **Annually**, **Quarterly**, **Monthly**, and **Weekly** and persists the selection when browser storage is available.
  - The timeframe **toolbar** (label + select) is **visible and enabled** only on **Weekdays**, **Clock In & Clock Out**, and **Details** clusters; on **General** and **Vacation** it is **hidden** and the select is **disabled** (stored preference is not cleared when switching away).
  - Weekday-centric tables show a **Year** or **Period** column consistent with the selection; period labels use localized templates (`infographic.period.*`).
  - Row order lists periods **newest first** (descending sort of period keys).
  - Affected tables are inside a scrollable region with a **sticky** header when content exceeds the viewport cap.
  - CSV export for those sections uses the same period ordering and semantics as the on-screen table.

### US-017 Infographic Clock Cluster Layout
- As a Team Lead, I want **Clock In & Clock Out** metrics in a **3×2** layout, so that I can compare earliest, latest, and average times for **in** and **out** at a glance.
- Acceptance Criteria:
  - First row: **Earliest clock in**, **Latest clock in**, **Average clock in** (each by weekday and period).
  - Second row: **Earliest clock out**, **Latest clock out**, **Average clock out** (each by weekday and period).
  - Desktop CSS uses a three-column grid; narrower breakpoints may reflow while preserving semantic order.

### US-018 Infographic Cluster Naming
- As a Reporting Presenter, I want Infographic cluster names to **match the information** inside each panel (**General**, **Vacation**, **Weekdays**, **Clock In & Clock Out**, **Details**), so that navigation feels obvious when sharing my screen.
- Acceptance Criteria:
  - Cluster labels come from i18n keys (`infographic.clusterGeneral`, `infographic.clusterVacation`, `infographic.clusterWorkWeekdays`, `infographic.clusterClockInOut`, `infographic.clusterDetails`) and stay aligned with PRD naming.
  - Tooltips and `aria-label` attributes on category buttons reflect the same names.

### US-019 Readable Durations in Infographic
- As a Global User, I want **full hour and minute words** in Infographic duration cells (not abbreviated unit letters), so that reports read clearly in my language; large numbers may still use compact numeric scales where the app already uses them.
- Acceptance Criteria:
  - Modal duration cells use long unit style from shared time formatters with compact numeric option where appropriate.
  - Behavior matches `VARIABLES.md` definition for `formatInfographicMinutes` and `GUARDRAILS` for infographic display.

### US-020 Infographic Timeframe Control Scoped to Relevant Clusters
- As a Team Lead, I want the **timeframe selector** to appear **only** when it applies to the tables I am viewing, so that I am not confused by controls that do not change **General** or **Vacation** layouts.
- Acceptance Criteria:
  - On **General** and **Vacation**, `#infographicTimeframeWrap` is not visible (hidden via CSS class and `hidden` attribute) and `#infographicTimeframe` is `disabled` with `aria-hidden="true"` where appropriate.
  - On **Weekdays**, **Clock In & Clock Out**, and **Details**, the wrap is visible, the select is enabled, and `aria-label` reflects the localized timeframe label.
  - Switching clusters updates visibility immediately without reloading the modal; changing timeframe still re-aggregates weekday-centric data as in US-016.
