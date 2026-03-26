# Product Requirements Document (PRD)

## 1. Product Summary

Working Hours Tracker is a web application for recording daily work activity, non-work statuses, and operational productivity insights across profiles and timezones.

## 2. Problem Statement

Teams need a reliable and structured method to:

- Track workday activity (time in/out, breaks, status, location).
- Monitor overtime and utilization patterns.
- Report outcomes to managers and stakeholders quickly.
- Operate across languages, devices, and timezone contexts.

## 3. Goals

- Deliver accurate, fast daily time-entry workflows.
- Provide high-clarity analytics for individual and team trend monitoring.
- Ensure responsive and fluid UX across desktop, tablet, and mobile.
- Maintain strong documentation and traceability for enterprise governance.

## 4. In Scope

- Multi-profile time entry, edit, delete, and bulk entry.
- Day status and location tracking.
- Calendar + statistics + infographic analytics.
- Localized UI and timezone-aware behavior.
- Data import/export and API persistence.
- Documentation and guardrail governance.

## 5. Out of Scope (Current Release)

- Enterprise SSO and RBAC.
- Multi-tenant cloud deployment orchestration.
- Native mobile apps.
- Payroll integration and accounting workflows.

## 6. User Segments

- Individual contributors
- Team leads
- Operations and reporting analysts
- Product and engineering stakeholders

See `USER_PERSONAS.md` for full persona detail.

## 7. Functional Requirements

### FR-01 Entry Lifecycle
- Create, edit, delete, and review entries.
- Validate date/time consistency and required fields.
- Support timezone-aware timestamps.

### FR-02 Multi-profile Handling
- Maintain separate entry collections by profile.
- Preserve profile metadata and vacation quota mappings.

### FR-03 Filters and Search
- Provide basic and advanced filter controls.
- Support structured filtering and text-based search.
- Preserve semantic sort order in smart-select filters:
  - Month: `All -> 1..12`
  - Weekday: `All -> Monday..Sunday`
  - Day: `All -> 1..31`
  - Week: `All -> 1..53`

### FR-04 Analytics
- Show totals, averages, status distributions, and overtime indicators.
- Support both compact and full-value display formats.

### FR-05 Infographic and Statistics Modals
- Provide card/table clusters with fullscreen navigation support.
- Ensure responsive behavior and visual consistency with main design system.
- Keep PPT generator modal size envelope dynamically aligned with Statistics Summary and Infographic modals.

### FR-06 Localization
- UI strings, labels, tooltips, and status text must be localizable.
- Remove hardcoded fallback literals from user-facing views.
- Statistics micro-labels (weekday icons, location segments) and all tooltip content must remain fully localized across manual language packs.
- Language selection must update the enhanced UI wrapper (smart-select) so users see the correct localized labels immediately.
- Structured tooltip sections (titles, headers, grouped lines) must remain localization-safe and avoid mixed-language rendering.

### FR-09 Connectivity Indicator and Internet Speed Telemetry
- Show online/offline status with real-time estimated internet speed (Mbps) when browser telemetry is available.
- Display daily internet speed summary (min/max/avg) in tooltip context for the current local calendar day.
- Update speed info silently and seamlessly (no disruptive UI behavior).

### FR-07 Export and Reporting
- Export data for operational use (CSV/JSON).
- Export presentation highlights (PPT).

### FR-08 API Sync
- Read and write persistent data through backend APIs.
- Merge payload updates safely and preserve latest records.

## 8. Non-Functional Requirements

- **NFR-01 Performance**: UI interactions should remain responsive for typical single-team datasets.
- **NFR-02 Reliability**: No data loss under expected save/edit flows.
- **NFR-03 Usability**: No clipped critical controls across supported breakpoints.
- **NFR-04 Accessibility**: Tooltip and control labels should include screen-reader-compatible attributes.
- Tooltip systems in Statistics must be keyboard- and screen-reader-friendly (`role="tooltip"`, `aria-label`/`aria-hidden` behavior).
- **NFR-05 Maintainability**: Feature modules and docs remain traceable and updateable.

## 9. Success Criteria

- High completion rate for entry creation/edit workflows.
- Reduced time to produce weekly/monthly summaries.
- Improved quality of localized UX.
- Stable render behavior in tablet/mobile layouts.

## 10. Risks

- Layout regressions from complex responsive rule interactions.
- Incomplete i18n coverage when new strings are introduced.
- Data merge edge cases in concurrent edits.

## 11. Dependencies

- Node.js runtime
- Express API availability for sync mode
- Browser support for `Intl` formatting and modern JS APIs

## 12. Acceptance Strategy

- Requirement validation through the traceability matrix.
- Regression checks for entry flow, filtering, analytics, and export.
- Documentation parity checks before release sign-off.
