# Product Metrics

## KPI Definitions

| Metric | Definition | Formula | Target | Owner |
|---|---|---|---|---|
| Daily Active Profiles | Unique active profiles/day | Count unique profile interactions | Growth trend | Product |
| Entry Save Success Rate | Successful save ratio | successful saves / save attempts | >= 99% | Engineering |
| Autosave Reliability | Background save reliability | autosave success / autosave attempts | >= 98.5% | Engineering |
| Sync Success Rate | Sync success ratio | successful syncs / sync attempts | >= 99% | Engineering |
| Export Completion Rate | Successful export ratio | completed exports / export starts | >= 97% | Product |
| Voice Apply Rate | Voice usability proxy | direct apply / voice sessions | >= 70% | Product |
| Translation Completeness | Manual pack coverage | resolved manual keys / required keys | 100% | Product Ops |

## Operational Metrics

- API 2xx availability (`/api/working-hours-data`)
- Redis write latency p50/p95
- Save/sync unresolved failure rate
