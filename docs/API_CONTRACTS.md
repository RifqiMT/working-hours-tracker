# API Contracts

## Endpoint

- `GET /api/working-hours-data` -> returns full snapshot payload.
- `POST /api/working-hours-data` -> persists full snapshot payload.

## Request/Response Semantics

### GET

- Response body is canonical app dataset.

### POST

- Body must be a valid snapshot object.
- Server persists provided snapshot (authoritative semantics).

## Authentication

- Optional header `X-API-Key` enforced when `WORKHOURS_API_KEY` is configured.

## Error Model

- `400` for malformed payload.
- `401` for missing/invalid API key when required.
- `500` for persistence/runtime failures.
