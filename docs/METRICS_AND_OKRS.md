# Metrics and OKRs

**Last updated:** 2026-03-20

Strategic layer connecting product metrics to team objectives.

## Objective 1 - Improve Logging Reliability

**Intent:** increase consistency and correctness of entry data.

**Key Results**

- KR1.1: Raise daily logging coverage to >= 85% for active profiles.
- KR1.2: Keep invalid duration rate below 1.5%.
- KR1.3: Achieve >= 95% entry completeness.

## Objective 2 - Strengthen Insight and Reporting Usage

**Intent:** ensure users can extract actionable insights from the product.

**Key Results**

- KR2.1: >= 60% of active profiles generate at least one advanced output monthly (stats summary, infographic export, or PPT highlights). (Requires lightweight instrumentation or support-ticket tagging.)
- KR2.2: Reduce time-to-generate management-ready output by 30%.
- KR2.3: Reach >= 4.2/5 user satisfaction for reporting clarity.

## Objective 3 - Sustain Professional UX at Scale

**Intent:** maintain usability and scalability while feature set grows.

**Key Results**

- KR3.1: Keep critical UI regressions at zero in release validation.
- KR3.2: Maintain responsive layout quality across standard breakpoints.
- KR3.3: Ensure new locale/theme additions require no critical refactor.
- KR3.4: Keep localization pipeline correctness and quality: locale UI completion >= 95% for active locales delivered via file-based packs, with `npm run verify:i18n` and `node scripts/verify-manual-locale-packs-offline.js` as gating checks.

## Operating Model

- Weekly: monitor operational product metrics.
- Monthly: review objective progress and blockers.
- Quarterly: recalibrate KR thresholds and roadmap implications.

## Dependencies

- Metric definitions: `PRODUCT_METRICS.md`
- Variable formulas: `VARIABLES.md`
- Product requirements context: `PRD.md`
