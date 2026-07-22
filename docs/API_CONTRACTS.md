# API Contracts

**Product:** Working Hours Tracker  
**Base path:** `/api/working-hours-data`  
**Last updated:** 2026-07-22

---

## 1. Overview

Single REST-style endpoint for reading and writing the full application dataset snapshot. Implemented in:

- **Production:** `api/working-hours-data.js` (Vercel serverless + Redis)
- **Local:** `dev/server.js` (Express + `data/Working Hours Data.json`)

---

## 2. Endpoint Summary

| Method | Path | Auth (prod) | Success | Body |
|--------|------|-------------|---------|------|
| `OPTIONS` | `/api/working-hours-data` | None | `204` | — |
| `GET` | `/api/working-hours-data` | None* | `200` JSON | Full snapshot |
| `HEAD` | `/api/working-hours-data` | None* | `200` / `404` | — |
| `POST` | `/api/working-hours-data` | Optional write key | `204` | JSON snapshot |

\* When `WORKHOURS_API_KEY` is set and `authMode === 'all'`, GET also requires key.

---

## 3. Request and Response Semantics

### 3.1 GET — Fetch snapshot

**Response `200`:** JSON object matching localStorage structure (may include `exportedAt` wrapper depending on client normalization).

**Response `404`:** `{ "error": "Working Hours Data not found" }` when store empty.

**Response `500`:** Corrupt or unreadable store.

### 3.2 POST — Persist snapshot

**Request body:** JSON object, max **25 MB**.

```json
{
  "exportedAt": "2026-07-07T12:00:00.000Z",
  "data": {
    "Default": [ /* entries */ ],
    "profileMeta": { },
    "vacationDaysByProfile": { }
  }
}
```

**Processing:**
1. Parse JSON; reject malformed with `400`.
2. `mergeAndNormalizeWorkingHoursPayload({}, incoming)` — **full snapshot replace**.
3. Persist to Redis (prod) or file (local).
4. Return `204 No Content` on success.

**Deletion semantics:** Profiles or entries **not present** in posted `data` are **removed** from server store after normalize.

### 3.3 CORS

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS, HEAD
Access-Control-Allow-Headers: Content-Type, X-API-Key
```

---

## 4. Authentication

Enabled when environment variable `WORKHOURS_API_KEY` is non-empty.

| Header | Value |
|--------|-------|
| `X-API-Key` | Must match `WORKHOURS_API_KEY` |

| authMode | GET | POST |
|----------|-----|------|
| `write` (default) | Open | Requires key |
| `all` | Requires key | Requires key |

**Client note:** `js/data-sync.js` does not currently attach `X-API-Key`. Production writes with key enabled require client update or open POST.

**Local dev:** No API key enforcement on `dev/server.js`.

---

## 5. Error Model

| Status | Condition | Response body |
|--------|-----------|---------------|
| `400` | Invalid JSON body | `{ "error": "..." }` |
| `401` | Missing/invalid API key when required | `{ "error": "Unauthorized" }` |
| `404` | GET/HEAD when no data | `{ "error": "Working Hours Data not found" }` |
| `413` | Body too large | Error message |
| `500` | Redis/file failure | `{ "error": "..." }` |
| `502` | Frontend proxy cannot reach backend | `{ "error": "Backend unreachable..." }` |

---

## 6. Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `REDIS_URL` | Yes (prod) | — | Redis connection |
| `WORKHOURS_API_KEY` | No | — | Enables auth |
| `WORKHOURS_REDIS_KEY` | No | `workingHoursData:v1` | Blob key |
| `WORKHOURS_KV_KEY` | No | Same as redis key | Legacy alias |

---

## 7. Merge Normalization (shared)

See `lib/merge-working-hours.js` and `VARIABLES.md` §13.

- Entry times → `HH:mm`
- Dates → `YYYY-MM-DD`
- One entry per date per profile
- Latest `updatedAt` wins

---

## 8. Client Integration

| File | Behavior |
|------|----------|
| `js/data-sync.js` | `syncWorkingHoursData`, `saveWorkingHoursDataToFile` |
| `js/init.js` | Startup silent sync |
| `js/storage.js` | Triggers autosave after `setData` |

---

## 9. Related Documents

- `ARCHITECTURE.md`
- `DATA_SCHEMA_EXAMPLES.md`
- `SECURITY_MODEL.md`
- `tests/api-working-hours-data.test.js`
