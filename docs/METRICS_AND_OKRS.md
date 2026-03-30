# Metrics and OKRs

**Purpose:** Align product team outcomes with measurable key results and link them to KPIs in `PRODUCT_METRICS.md`.

**Current state:** Three objectives cover tracking workflows, insight adoption, and enterprise UX quality (including localization, responsive stability, tooltips, filters, connectivity telemetry, and Infographic UX).

**Operational guidance:** Review OKRs weekly or bi-weekly per the operating rhythm in Section 3; adjust targets quarterly.

---

## 1. Product Team OKRs

### Objective O1: Deliver high-confidence daily tracking workflows
- **KR1**: Raise Entry Completion Rate (PM-01) to >= 97%.
- **KR2**: Reduce Median Entry Time (PM-02) by 20% from baseline.
- **KR3**: Keep Data Integrity Pass Rate (PM-10) >= 99.5%.

### Objective O2: Improve insight adoption for team-level decisions
- **KR1**: Increase Statistics Engagement (PM-05) by 30%.
- **KR2**: Increase Infographic Engagement (PM-06) by 30%.
- **KR2b**: Increase Infographic **timeframe exploration** (PM-15) in line with PM-06 growth once event tracking is live (directional KPI).
- **KR3**: Increase Export Adoption (PM-07) by 20%.

### Objective O3: Maintain enterprise-ready UX quality
- **KR1**: Keep Localization Quality Index (PM-08) >= 99%.
- **KR2**: Keep Responsive Stability Index (PM-09) >= 98%.
- **KR3**: Reduce high-severity UX defects per release to <= 1.
- **KR4**: Keep Statistics Tooltip Single-Instance Rate (PM-11) >= 99.5%.
- **KR5**: Keep Localization Synchronization After Language Change (PM-12) >= 99%.
- **KR6**: Keep Semantic Filter Order Compliance (PM-13) at 100% for month/weekday/day/week filters.
- **KR7**: Keep Connectivity Telemetry Visibility Rate (PM-14) >= 98% in eligible online sessions.
- **KR8**: Keep Infographic Timeframe Toolbar Scope Compliance (PM-16) at **100%** on release audits (no incorrect visibility of the timeframe control per cluster).

## 2. Supporting Team Metrics

| Area | Metric | Definition | Target |
|---|---|---|---|
| Delivery | Lead Time to Documentation Parity | Time from feature completion to doc completion. | <= 2 business days |
| Quality | Requirement Traceability Coverage | Share of PRD items mapped in matrix. | 100% |
| Localization | Locale Pack Completeness | Share of required keys present across supported locales. | 100% required keys |
| UX | Breakpoint Regression Escape Rate | Defects found after release vs pre-release. | < 5% |

## 3. Operating Rhythm

- Weekly: KPI pulse review (PM-01, PM-02, PM-10).
- Bi-weekly: feature-value review (PM-05, PM-06, PM-07).
- Release gate: quality compliance (PM-08, PM-09 + traceability).
- Quarterly: target recalibration and roadmap alignment.

## 4. Ownership

- Product Lead: objectives and business targets.
- Engineering Lead: data integrity and implementation quality.
- Design Lead: responsive and usability outcomes.
- QA Lead: release-gate verification and audit evidence.
