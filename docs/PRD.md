# Product Requirements Document (PRD)

**Purpose:** Define what Working Hours Tracker must deliver, for whom, and under which constraints, so engineering, design, QA, and stakeholders align on scope and acceptance.

**Current state:** The application ships as a browser-first multi-profile time tracker with calendar and statistics, Infographic analytics, exports (CSV, JSON, PowerPoint), optional Express API sync, manual localization packs, and enterprise documentation under `docs/`.

**Definitions:** **WFO** = work from office; **WFH** = work from home; **Infographic cluster** = one of the five category panels (General, Vacation, Weekdays, Clock In & Clock Out, Details). **Timeframe** = annual, quarterly, monthly, or weekly bucketing of weekday-centric tables.

**Change notes:** Cross-reference `CHANGELOG.md` and `docs/TRACEABILITY_MATRIX.md` for requirement IDs and release mapping.

---

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
- Provide **Infographic** modal clusters aligned to their content:
  - **General**: filter-scoped summary totals (working hours, overtime, vacation quota and usage, sick and public-holiday counts) plus a WFO versus WFH hours summary.
  - **Vacation**: yearly quota, used, and remaining; vacation use by weekday (Monday–Friday).
  - **Weekdays**: total and average working hours and overtime by weekday, with a **Period** or **Year** column depending on timeframe.
  - **Clock In & Clock Out**: six tables in a **3×2 grid**—row one: earliest, latest, and average **clock in** by weekday; row two: earliest, latest, and average **clock out** by weekday.
  - **Details**: the same weekday work and overtime metrics split by **office (WFO)** and **home (WFH)** in each cell (other locations excluded from this split).
- **Timeframe control**: user-selectable **Annually**, **Quarterly**, **Monthly**, or **Weekly** aggregation for weekday-centric infographic tables in the **Weekdays**, **Clock In & Clock Out**, and **Details** clusters. The first column reflects calendar **year** or the computed **period** label. Period keys sort **descending** so the most recent period appears first. Tables that grow with many periods use **vertical scroll** and a **sticky** table header.
- **Timeframe control visibility**: The timeframe **label and select** are **visible and enabled** only when the active cluster is **Weekdays**, **Clock In & Clock Out**, or **Details**. On **General** and **Vacation**, the control is **hidden** (including from visual layout) and the `<select>` is **disabled** with appropriate accessibility attributes, because those clusters do not use period bucket aggregation in the same way. The stored timeframe preference is preserved when switching clusters.
- Selection is persisted in browser storage (`localStorage`) where supported.
- Provide per-section **CSV export** that matches the active timeframe and column semantics.
- Provide card/table clusters with **fullscreen** navigation within the visible cluster panel.
- Ensure responsive behavior and visual consistency with the main design system.
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

## 13. Documentation and engineering references

| Topic | Authoritative document |
|-------|-------------------------|
| User segments and journeys | `docs/USER_PERSONAS.md` |
| Acceptance-level stories | `docs/USER_STORIES.md` |
| Variables, formulas, examples | `docs/VARIABLES.md` |
| KPIs and measurement | `docs/PRODUCT_METRICS.md`, `docs/METRICS_AND_OKRS.md` |
| UX, themes, components | `docs/DESIGN_GUIDELINES.md` |
| Constraints | `docs/GUARDRAILS.md` |
| Requirement mapping | `docs/TRACEABILITY_MATRIX.md` |
| System design | `docs/ARCHITECTURE.md` |
| HTTP API | `docs/API_CONTRACTS.md` |
| Documentation index | `docs/README.md` |
| Repo overview and setup | `README.md` |
| Governance standard | `PRODUCT_DOCUMENTATION_STANDARD.md` |
