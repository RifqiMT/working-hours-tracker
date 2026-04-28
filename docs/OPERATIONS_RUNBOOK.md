# Operations Runbook

## Deployment

1. Run tests: `npm test`
2. Deploy production: `npx vercel --prod --yes`
3. Verify alias and deployment URL.
4. Smoke check homepage and API endpoint.

## Incident Response

### Save/Sync Failure

- Check browser console/network errors.
- Verify API endpoint status.
- Validate `REDIS_URL` and optional `WORKHOURS_API_KEY` configuration.
- Confirm CORS/header behavior in `vercel.json`.

### Data Integrity Issue

- Reproduce with export snapshot.
- Verify merge behavior with `lib/merge-working-hours.js`.
- Validate whether issue originates client merge or server snapshot overwrite.

## Rollback Procedure

- Use Vercel deployment history and promote previous healthy deployment.
- Re-run smoke checks and communicate impact window.

## Backups

- Use periodic JSON export as an operational backup artifact.
- Keep retention policy aligned with organizational data governance.
