# Test Strategy

## Objectives

- Validate merge/persistence correctness.
- Prevent API contract regressions.
- Ensure high-risk user flows remain stable.

## Automated Tests

- `tests/merge-working-hours.test.js`
- `tests/api-working-hours-data.test.js`

## Manual Regression Suite

- Profile lock/unlock and protected actions
- Entry single/bulk CRUD
- Voice parse/review/apply
- Import/export compatibility
- Language coverage and UI translation checks
- Startup sync + autosave reliability

## Release Gate

- Tests pass
- Lint clean for changed files
- Production smoke checks pass (`/` and `/api/working-hours-data`)
