# Product Metrics

## KPI Framework

| Metric | Definition | Formula | Target | Owner | Source |
|---|---|---|---|---|---|
| Daily Active Profiles | Number of distinct profiles with at least one logged action per day. | count(distinct active profile/day) | >=85% of expected users | Product | app events + data snapshots |
| Save Reliability | Success rate for save attempts including retries. | successful saves / total save attempts | >=99.0% | Engineering | client save status + API logs |
| Entry Accuracy Rate | Share of entries that need no same-day correction. | entries without same-day edit / total entries | >=92% | Product Ops | entry revision timestamps |
| Export Success Rate | Share of successful export actions. | successful exports / export attempts | >=98% | Product Ops | export action events |
| Voice Parse Acceptance | Share of voice parses accepted without manual correction. | accepted parses / total parses | >=80% | Product | voice review outcomes |
| Translation Coverage | Coverage of shipped UI keys in manual locale packs. | translated keys / required keys | 100% release gate | Localization | i18n key audit |

## Supporting Operational Metrics

- Startup sync completion rate.
- Merge conflict fallback rate.
- API error rate by status code family.
- Average save queue drain duration.

## Review Cadence

- Weekly KPI review by product + engineering.
- Monthly trend review against OKRs.
- Release gate audit prior to production deployment.
