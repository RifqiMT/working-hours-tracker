# Deployment to Vercel

## Prerequisites

- Vercel project connected to repository.
- Environment variable `REDIS_URL` configured.
- Optional `WORKHOURS_API_KEY` configured if write auth is desired.

## Deployment Steps

1. Validate tests and docs.
2. Confirm production deployment approval.
3. Deploy using Vercel workflow.
4. Run smoke tests for load/save/sync/export flows.

## Smoke Checklist

- App loads and profile selector works.
- Save and autosave queue complete successfully.
- Startup sync merges expected data.
- Export actions produce valid output.

## Guardrail

Production deployment must never happen automatically without explicit user request.
