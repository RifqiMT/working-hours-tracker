# API Contracts

## Endpoint

- `GET /api/working-hours-data` — fetch persisted snapshot.
- `POST /api/working-hours-data` — save full snapshot payload.
- `HEAD /api/working-hours-data` — health/probe support.
- `OPTIONS /api/working-hours-data` — CORS preflight.

## Authentication

- Optional for writes only.
- If configured, POST requires `X-API-Key` header matching `WORKHOURS_API_KEY`.

## Request Body (POST)

```json
{
  "exportedAt": "2026-04-28T12:00:00.000Z",
  "data": {
    "Default": [],
    "profileMeta": {
      "Default": {
        "role": "Developer",
        "passwordHash": "<hash>",
        "passwordEncrypted": "<hash>"
      }
    },
    "vacationDaysByProfile": {
      "Default": { "2026": 24 }
    }
  }
}
```

## Response

- GET: `200` with JSON snapshot or `404` when no data exists.
- POST: `204` on successful persistence.

## Behavior Notes

- POST uses **full snapshot semantics** in production API.
- Missing entities in incoming payload are treated as removed records.
- Merge/normalization rules are applied before persistence.
