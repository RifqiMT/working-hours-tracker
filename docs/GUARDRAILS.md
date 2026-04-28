# Guardrails

## Technical Guardrails

1. **No plaintext secrets in source control.**
   - API keys and Redis credentials must be environment variables only.
2. **No plaintext profile passwords.**
   - Only hashed values in `profileMeta`.
3. **Server writes use snapshot semantics.**
   - Incoming payload represents source of truth; missing data may imply deletion.
4. **All user-facing strings must be i18n-backed.**
   - New features must update manual locale packs.
5. **No release without quality gates.**
   - Tests pass, lint clean, production smoke checks pass.

## Business Guardrails

1. The app is a time-tracking utility, not payroll/legal adjudication software.
2. Profile lock is for practical shared-device protection, not enterprise identity management.
3. Reporting outputs support decision-making but require organizational policy interpretation.

## Performance Guardrails

- Critical interaction regressions above 10% must be investigated before release.
- Keep autosave and sync non-blocking for user interaction.

## Documentation Guardrails

- Update PRD, stories, variables, metrics, traceability, and changelog for every meaningful feature change.
