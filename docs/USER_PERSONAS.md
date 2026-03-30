# User Personas

## Persona 1: Individual Contributor

- **Friendly Name**: Daily Executor
- **Primary Goals**:
  - Log daily work entries quickly and accurately.
  - Track overtime and personal work pattern.
  - Avoid repetitive manual reporting.
- **Pain Points**:
  - Time-consuming manual logs.
  - Inconsistent timezone interpretation.
  - Hard-to-read summary data.
- **Success Definition**:
  - Can complete an entry in under one minute.
  - Can review weekly status distribution instantly.

## Persona 2: Team Lead

- **Friendly Name**: Delivery Coordinator
- **Primary Goals**:
  - Monitor team workload consistency.
  - Validate leave distribution and overtime trend.
  - Prepare status reporting for management.
- **Pain Points**:
  - Scattered or non-standard reporting input.
  - Missing context in simple totals-only reports.
- **Success Definition**:
  - Can identify risk patterns (overtime spikes, leave concentration) with minimal manual analysis.

## Persona 3: Operations/PM Analyst

- **Friendly Name**: Insights Integrator
- **Primary Goals**:
  - Generate structured product and process insights.
  - Track KPI and OKR progress over time.
  - Ensure consistency across profiles and reporting periods.
- **Pain Points**:
  - Metric definitions are often unclear or inconsistent.
  - Source-to-metric traceability is difficult without documentation.
- **Success Definition**:
  - Can map raw variables to KPI outcomes confidently and auditably.

## Persona 4: Product and Engineering Maintainer

- **Friendly Name**: Platform Steward
- **Primary Goals**:
  - Keep features stable across desktop/tablet/mobile.
  - Protect data integrity and merge behavior.
  - Ship changes with clear guardrails and traceability.
- **Pain Points**:
  - UX regressions from responsive complexity.
  - Drifting documentation after rapid UI updates.
- **Success Definition**:
  - Can ship features with measurable quality and full documentation parity.

## Persona 5: UX Expert Reviewer

- **Friendly Name**: Interface Quality Auditor
- **Primary Goals**:
  - Validate tooltip UX: clarity, readability, positioning, and single-tooltip stability.
  - Confirm responsive reflow: no clipped labels, no overlap, and usable interactions at all breakpoints.
  - Ensure localization parity: no mixed-language output and localized weekday/location micro-labels.
- **Pain Points**:
  - Tooltip duplication (native + custom) causing confusion.
  - Truncated or unreadable tooltip content in dense layouts.
  - Missing locale tokens that disable language selection or leave partial English literals.
- **Success Definition**:
  - Can verify that UI/UX and localization are consistently aligned with the documented standard for the release.

## Persona 6: Reporting Presenter

- **Friendly Name**: Slide-Ready Communicator
- **Primary Goals**:
  - Generate presentation-ready PPT exports with predictable option flows.
  - Use modal-based reporting tools with consistent sizing and interaction patterns.
  - Review structured breakdowns in tooltips quickly before exporting insights.
- **Pain Points**:
  - Inconsistent modal dimensions across analytics/export dialogs.
  - Dense statistical breakdowns that are hard to read without visual grouping.
- **Success Definition**:
  - Can move between Statistics, Infographic, and PPT generator workflows with consistent modal behavior and readable detail context.

## Persona-to-Feature Mapping

- Daily Executor -> Entry form, quick actions, timezone assist, personal stats.
- Delivery Coordinator -> Filters, entries table, statistics summary, infographic clusters (**General** through **Details**), timeframe switching for operational reviews.
- Insights Integrator -> Variables dictionary, product metrics, exports, Infographic CSV and period semantics.
- Platform Steward -> Architecture docs, guardrails, traceability matrix, changelog discipline, Infographic aggregation logic in `js/infographic.js`.
- Interface Quality Auditor -> Tooltip/UX QA, localization parity checks, responsive stability review, Infographic sticky headers and clock-grid reflow.
- Slide-Ready Communicator -> PPT generator workflow, modal consistency checks, export-readiness validation, Infographic fullscreen section flow.
