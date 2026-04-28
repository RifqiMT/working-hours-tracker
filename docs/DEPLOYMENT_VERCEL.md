# Vercel Deployment (Production)

This project supports a **Vercel-first** production deployment:

- **Frontend**: static site (served from the repository root).
- **Backend**: Vercel Serverless Function at `GET/POST /api/working-hours-data`.
- **Persistence**: Redis (via a managed provider) storing one JSON blob key.

> Important: the legacy `server.js` writes to `data/Working Hours Data.json` and is intended for **local development only**. On Vercel, persistence must use Redis (or another managed store).

---

## 1) Prerequisites

- Vercel account
- A managed Redis instance (e.g. Redis Cloud / Redis Enterprise / Upstash)

---

## 2) Environment variables

### Required (Redis)

Set via Vercel Project → Settings → Environment Variables:

- `REDIS_URL` (example: `redis://user:pass@host:port` or `rediss://...` for TLS)

### Optional (recommended) auth

- `WORKHOURS_API_KEY`: when set, the API requires header `X-API-Key` for **POST** requests (writes).

### Optional (advanced)

- `WORKHOURS_KV_KEY`: overrides the default KV key (`workingHoursData:v1`)
- `WORKHOURS_REDIS_KEY`: overrides the default Redis key (`workingHoursData:v1`)

---

## 3) How the API works

### Endpoint

- `GET /api/working-hours-data`
  - `200`: returns JSON root payload
  - `404`: no stored data exists yet
  - (no auth by default)
- `POST /api/working-hours-data`
  - merges incoming payload into stored payload (latest timestamps win)
  - normalizes clocks and enums
  - `204`: persisted successfully
  - `400`: invalid JSON
  - `401`: missing/invalid API key (if enabled)

### Storage model

- Stores one JSON document at a single Redis key (default: `workingHoursData:v1`).
- Suitable for single-user / single-team usage. For multi-tenant usage, introduce per-tenant keys + auth.
- Profile passwords are persisted only as encrypted hashes inside `data.profileMeta`:
  - `passwordHash` (primary compatibility field)
  - `passwordEncrypted` (alias field containing the same hash)
- CSV exports include `Encrypted Password` (hash) so imports can restore profile lock settings.

---

## 4) Deploy steps

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Provision Redis and set `REDIS_URL` in Vercel (Production).
4. (Recommended) set `WORKHOURS_API_KEY`.
5. Deploy.

After deploy:

- Open the site: `https://<your-vercel-domain>/`
- API is available at: `https://<your-vercel-domain>/api/working-hours-data`

---

## 5) Local development

### Classic local dev (file persistence)

```bash
npm install
npm start              # http://localhost:3010 (Express + file persistence)
npm run start:frontend # http://localhost:3011 (static + proxy)
```

### Vercel-like local dev (serverless)

Use the Vercel CLI if you want local parity with serverless functions + KV:

```bash
vercel dev
```

---

## 6) Operational notes / guardrails

- Do not rely on filesystem writes in serverless environments.
- KV stores a single blob; treat the payload as potentially sensitive.
- If you enable `WORKHOURS_API_KEY`, do not embed it in the frontend—use trusted admin clients or a separate auth layer for writes.
- Never store or transport raw profile passwords; only hashed values are supported in save/export/import flows.

