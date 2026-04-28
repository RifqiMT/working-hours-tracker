# Operations Runbook

## Deployment Steps

1. `npm test`
2. `npx vercel --prod --yes`
3. Verify deployment URL and alias
4. Smoke checks: `/` and `/api/working-hours-data`

## Incident Handling

### Save/Sync Failures

- Inspect browser network logs and sync status
- Verify API health and Redis environment variables
- Validate auth header behavior if API key is enabled

### Data Integrity Issues

- Reproduce with exported snapshots
- Validate merge behavior in `lib/merge-working-hours.js`
- Determine whether issue is client merge or server snapshot overwrite

## Rollback

- Promote previous healthy Vercel deployment
- Re-run smoke checks
- Publish incident summary and follow-up actions
