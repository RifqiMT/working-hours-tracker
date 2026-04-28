# Product Metrics

## KPI Framework

| Metric | Definition | Formula | Target | Owner | Source |
|---|---|---|---|---|---|
| Daily Active Profiles | Profiles with at least one interaction/day | Count(unique active profileName/day) | Growth trend +15% QoQ | Product | Client telemetry/events |
| Entry Save Success Rate | Ratio of successful entry saves | successful saves / save attempts | >= 99% | Engineering | Save pipeline logs/status |
| Autosave Reliability | Success rate including retries | autosave success / autosave attempts | >= 98.5% | Engineering | `js/storage.js` status metrics |
| Sync Success Rate | Startup/manual sync success ratio | successful syncs / sync attempts | >= 99% | Engineering | `js/data-sync.js` events |
| Export Completion Rate | Successful export ratio | completed exports / export starts | >= 97% | Product | Export handlers |
| Voice Apply Accuracy Proxy | Voice review apply without correction | direct apply count / voice sessions | >= 70% | Product | Voice review interactions |
| Translation Coverage Completeness | Strings resolved by manual packs | resolved i18n keys / required keys | 100% | Product Ops | i18n audit scripts |

## Operational Health Metrics

- API availability (`/api/working-hours-data` HTTP 2xx rate).
- Redis write latency (p50/p95).
- Error budget consumption for sync/save failures.

## Review Cadence

- Weekly: engineering reliability metrics.
- Bi-weekly: product adoption and workflow friction.
- Monthly: KPI and roadmap alignment.
