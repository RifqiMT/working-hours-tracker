# Security Model

## Security Scope

- Profile-level client gating via password hash verification.
- Server-side optional write protection via API key.
- Security headers and deployment policy hardening.

## Controls

- Password hashing in `js/profile.js`.
- Optional `X-API-Key` validation in `api/working-hours-data.js`.
- Edge headers in `vercel.json`.
- Environment-based secret management.

## Limitations

- Profile lock is UX-level security control, not enterprise identity.
- Browser voice permission support varies by browser and policy.

## Secret Handling Policy

- Never commit credentials.
- Rotate any exposed token/password immediately.
