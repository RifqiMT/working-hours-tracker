# API Contracts

**Purpose:** Specify the HTTP interface for reading and merging working-hours data so frontend (`js/data-sync.js`), `server.js`, and operators share one contract.

**Current state:** `GET` and `POST /api/working-hours-data` on port **3010** (proxied from **3011**). Payload shape matches `DATA_SCHEMA_EXAMPLES.md`.

**Operational guidance:** Breaking changes require version discussion, `CHANGELOG.md` migration notes, and traceability updates.

---

## 1. Base Runtime

- Backend service: `server.js`
- Default port: `3010`
- Frontend proxy: `frontend-server.js` on `3011`, forwarding `/api/*`

## 2. Endpoint: Get Working Hours Data

- **Method**: `GET`
- **Path**: `/api/working-hours-data`
- **Purpose**: Return persisted working-hours root payload.

### Success Response
- **Status**: `200`
- **Content-Type**: `application/json`
- **Body shape**:
```json
{
  "exportedAt": "2026-03-24T10:45:00.000Z",
  "data": {
    "Profile A": [],
    "profileMeta": {},
    "vacationDaysByProfile": {}
  }
}
```

### Error Responses
- `404`: data file does not exist.
- `500`: read or parse failure.

## 3. Endpoint: Save Working Hours Data

- **Method**: `POST`
- **Path**: `/api/working-hours-data`
- **Purpose**: Merge incoming payload with persisted payload and save normalized result.
- **Request Content-Type**: `application/json`

### Request Body (High-Level)
```json
{
  "exportedAt": "2026-03-24T10:45:00.000Z",
  "data": {
    "Profile A": [
      {
        "id": "uuid-123",
        "date": "2026-03-24",
        "clockIn": "08:30",
        "clockOut": "17:45",
        "breakMinutes": 60,
        "dayStatus": "work",
        "location": "WFH",
        "description": "Daily execution",
        "timezone": "Europe/Berlin",
        "createdAt": "2026-03-24T08:00:00.000Z",
        "updatedAt": "2026-03-24T17:45:00.000Z"
      }
    ],
    "profileMeta": {},
    "vacationDaysByProfile": {}
  }
}
```

### Success Response
- **Status**: `204 No Content`

### Error Responses
- `500`: write failure or merge processing failure.

## 4. Server Merge and Normalization Rules

- Canonical date identity is used to merge duplicate records.
- `updatedAt`/`createdAt` decide winner on conflicting updates (latest wins).
- `clockIn`/`clockOut` are normalized to bounded `HH:mm`.
- `dayStatus` constrained to known enum values.
- `location` constrained to `WFO`, `WFH`, `Anywhere` (legacy `AW` normalized).
- Stable `id` is enforced; generated if missing.
- Entry arrays are sorted ascending by date before persistence.

## 5. CORS and Network Notes

- `/api` routes include permissive CORS headers for local multi-port use.
- Intended for trusted/local environments unless auth hardening is added.
