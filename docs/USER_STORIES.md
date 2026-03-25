# User Stories

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
  - Cards are grouped by defined business clusters.
  - Fullscreen mode allows table-to-table navigation.
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
