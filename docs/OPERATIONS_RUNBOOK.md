# Operations Runbook

## Deployment Procedure

1. Validate tests and diagnostics.
2. Verify docs and changelog updates.
3. Confirm environment variables in deployment target.
4. Deploy to Vercel only with explicit user approval.
5. Execute smoke checks (load, save, sync, export).

## Incident Response

### Save/Sync Failure

- Check API status and Redis connectivity.
- Confirm auth header behavior for protected writes.
- Inspect logs for merge/snapshot anomalies.

### Data Integrity Issue

- Reproduce with profile/date specific payload.
- Compare local snapshot vs remote snapshot.
- Use rollback snapshot and re-merge strategy.

## Rollback

- Roll back to last known healthy deployment.
- Verify restored behavior with core smoke tests.
- Document incident details and corrective actions.

## Post-Incident

- Update guardrails and test scenarios.
- Track issue in changelog and release notes.
