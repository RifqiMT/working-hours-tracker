# Test Strategy

## Goals

- Protect data integrity for merge/sync/save flows.
- Prevent regression in production API behavior.
- Validate high-risk user workflows before release.

## Automated Tests

- `tests/merge-working-hours.test.js`
  - Merge precedence, normalization, canonical date collapse.
- `tests/api-working-hours-data.test.js`
  - GET/POST behavior, auth mode, snapshot replacement semantics.

## Manual Regression Checklist

- Profile create/edit/delete with and without password.
- Unlock flow and protected-action gating.
- Single and bulk entry save/edit/delete.
- Voice parse -> review -> apply path.
- CSV/JSON import/export and PPT generation.
- Language switching and translated text coverage.
- Startup sync and autosave status transitions.

## Release Gate

- Automated tests pass.
- Lint diagnostics clean for changed files.
- Production smoke checks:
  - `/` => HTTP 200
  - `/api/working-hours-data` => HTTP 200
