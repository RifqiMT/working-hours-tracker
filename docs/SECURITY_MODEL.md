# Security Model

## Security Scope

- Client-side profile protection via password hash verification.
- Server-side write protection via optional API key (`WORKHOURS_API_KEY`).
- Secure transport and hardened headers through Vercel configuration.

## Controls

- Password hashing in `js/profile.js` (`SHA-256` with runtime fallback).
- API POST auth gate in `api/working-hours-data.js`.
- Security headers in `vercel.json` (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).

## Known Limitations

- Profile password lock is UX-level access control and not a full server identity system.
- Browser speech features depend on browser support and permission policies.

## Secret Handling

- Store secrets only in deployment environment settings.
- Do not commit tokens/keys/passwords to repository.
