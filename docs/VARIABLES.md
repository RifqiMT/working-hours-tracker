# Variables Dictionary

## Scope

This document defines core product variables used in persistence, calculations, rendering, and analytics.

## Canonical Variables

| Variable Name | Friendly Name | Definition | Formula / Rule | App Location | Example |
|---|---|---|---|---|---|
| profileName | Profile Name | Unique profile key under `data` root. | String key; non-empty; unique among profiles. | `js/profile.js`, `js/handlers.js` | `Engineering-A` |
| profileMeta[profile].role | Profile Role | Human-readable role attached to a profile. | Free text; trimmed. | `js/profile.js` | `Senior Developer` |
| profileMeta[profile].passwordHash | Profile Password Hash | Hashed password for profile access lock. | SHA-256 hash of password (fallback hash for older runtimes). | `js/profile.js` | `9d4e1e...` |
| id | Entry ID | Unique ID for an entry. | Generated once on create. | `js/form.js`, `js/modal.js` | `entry-abc123` |
| date | Entry Date | Working day date in ISO format. | `YYYY-MM-DD`; canonicalized by merge logic. | `js/form.js`, `lib/merge-working-hours.js` | `2026-05-06` |
| clockIn | Clock In Time | Start time of work period. | `HH:mm` normalized. | `js/form.js`, `js/time.js` | `09:00` |
| clockOut | Clock Out Time | End time of work period. | `HH:mm` normalized. | `js/form.js`, `js/time.js` | `18:00` |
| breakMinutes | Break Duration (min) | Break duration in minutes. | Parsed from value + unit, stored as integer minutes. | `js/form.js`, `js/modal.js` | `60` |
| dayStatus | Day Status | Workday classification. | Enum: `work`, `sick`, `holiday`, `vacation`. | `js/constants.js`, `js/form.js` | `work` |
| location | Work Location | Physical/remote location state. | Enum: `WFO`, `WFH`, `Anywhere`. | `js/constants.js`, `js/form.js` | `WFH` |
| timezone | Entry Timezone | IANA timezone for storage and conversion. | Valid timezone string; default `Europe/Berlin`. | `js/timezone-picker.js`, `js/form.js` | `Asia/Jakarta` |
| description | Entry Description | Optional notes for context. | Free text; may be dynamically translated for view. | `js/form.js`, `js/render.js` | `Client handover meeting` |
| createdAt | Created Timestamp | First creation timestamp. | ISO-8601. | `js/form.js`, `lib/merge-working-hours.js` | `2026-04-28T12:00:00.000Z` |
| updatedAt | Updated Timestamp | Last modified timestamp. | ISO-8601; latest wins in merge. | `js/form.js`, `lib/merge-working-hours.js` | `2026-04-28T12:15:00.000Z` |
| netWorkMinutes | Net Work Minutes | Effective worked minutes after break. | `max((clockOut - clockIn) - breakMinutes, 0)` | `js/time.js`, `js/render.js` | `480` |
| overtimeMinutes | Overtime Minutes | Extra minutes above standard day. | `max(netWorkMinutes - 480, 0)` | `js/time.js`, `js/stats-summary.js` | `30` |
| exportedAt | Export Timestamp | Timestamp when snapshot/export generated. | ISO-8601 at export time. | `js/data-sync.js`, `js/export.js` | `2026-04-28T12:16:00.000Z` |

## Variable Relationship Chart

```mermaid
flowchart TD
  A[profileName] --> B[profileMeta.role]
  A --> C[profileMeta.passwordHash]
  A --> D[entries[]]
  D --> E[date]
  D --> F[clockIn]
  D --> G[clockOut]
  D --> H[breakMinutes]
  D --> I[dayStatus]
  D --> J[location]
  D --> K[timezone]
  D --> L[description]
  F --> M[netWorkMinutes]
  G --> M
  H --> M
  M --> N[overtimeMinutes]
  D --> O[createdAt]
  D --> P[updatedAt]
```

## Notes

- Canonical merge and normalization are implemented in `lib/merge-working-hours.js` and mirrored by client merge helpers.
- Snapshot writes in production treat missing records as deletions by design.
