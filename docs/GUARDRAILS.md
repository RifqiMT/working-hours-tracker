# Guardrails

## 1. Business Guardrails

- Product changes must preserve trust in time records.
- Reporting outputs must remain schema-stable across releases.
- Localization must be complete for shipped features.

## 2. Technical Guardrails

- No plaintext password persistence.
- No hardcoded secrets in code or docs.
- Shared merge logic must remain the source of truth for conflict resolution.
- Server-side snapshot semantics must be clearly documented before release.

## 3. Performance Guardrails

- Do not ship changes with >10% regression on critical user paths without approval.
- Measure and compare before/after for save, load, and render paths.
- Large data operations should remain responsive via incremental rendering and batching.

## 4. Quality Guardrails

- Tests required for happy path, edge path, and error path.
- i18n key audits required for all new UI text.
- Docs and changelog updates are mandatory for behavior changes.

## 5. Operational Guardrails

- Production deployment only when explicitly requested.
- Rollback and incident runbook steps must be current.
- Release checklist must be completed before deploy approval.
