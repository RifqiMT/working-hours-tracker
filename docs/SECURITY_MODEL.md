# Security Model

## Scope

The product secures profile-level access, write operations, and deployment configuration while preserving data portability.

## Security Controls

- Profile access lock with hash-only password storage.
- Optional API write authentication via `WORKHOURS_API_KEY`.
- Transport and header hardening via `vercel.json`.
- Environment variable isolation for Redis credentials.

## Data Protection Rules

- No plaintext password persistence.
- No secret values in committed docs or source files.
- Exported data follows explicit user-initiated actions.

## Threat and Limitation Notes

- Profile lock is app-level protection, not full identity federation.
- Shared devices require operational discipline (logout/lock profile use).
- Snapshot writes require strong client-side conflict awareness.

## Operational Practices

- Rotate secrets when exposure risk is detected.
- Validate auth headers and API logs during incident triage.
- Keep guardrails and runbook aligned with actual controls.
