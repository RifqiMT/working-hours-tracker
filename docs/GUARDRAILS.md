# Guardrails

## Technical Guardrails

1. No plaintext secrets in source control.
2. No plaintext profile passwords in payload.
3. Snapshot POST semantics must be understood before merge/release.
4. All user-facing strings must use i18n manual packs.
5. No release without passing quality gate.

## Business Guardrails

1. Product is time-tracking support, not payroll authority.
2. Profile lock is practical UX protection, not enterprise IAM.
3. Reporting outputs support decisions, but policy interpretation remains organizational.

## Performance Guardrails

- Avoid >10% regressions in critical user workflows.
- Keep sync/autosave asynchronous and non-blocking.

## Release Guardrails

- Tests/lint/smoke/docs checks are mandatory.
- Changelog and traceability updates are mandatory.
