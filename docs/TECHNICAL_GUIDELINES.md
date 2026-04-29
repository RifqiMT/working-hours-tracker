# Technical Guidelines

## Engineering Principles

- Maintain modular JS boundaries with shared utility ownership.
- Keep data normalization deterministic.
- Prefer explicit error paths and actionable user feedback.

## Security and Secrets

- Never commit credentials or tokens.
- Keep runtime secrets in environment variables only.
- Validate secret exposure risk in pre-release checks.

## Performance Guidance

- Benchmark critical flows before and after impactful changes.
- Avoid introducing >10% regressions without approval.

## Quality Guidance

- Cover happy path, edge path, and error path with tests.
- Keep i18n parity for all shipped strings.
