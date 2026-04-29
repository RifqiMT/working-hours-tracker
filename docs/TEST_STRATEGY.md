# Test Strategy

## Objectives

- Prevent regressions in save/sync logic.
- Validate profile access controls.
- Preserve export/import schema integrity.
- Ensure voice parsing remains functionally safe.

## Automated Coverage

- Merge behavior and conflict handling tests.
- API route behavior and auth tests.
- Profile access/password checks.
- i18n and export/import contract checks.

## Manual Regression Coverage

- Profile lifecycle and lock/unlock UX.
- Entry create/edit/delete/bulk workflows.
- Startup sync and autosave failure handling.
- Voice parse review and apply flow.
- Export/import and reporting generation.

## Quality Gate

- No critical failing tests.
- Diagnostics clean for changed files.
- Manual smoke scenarios completed for release scope.
