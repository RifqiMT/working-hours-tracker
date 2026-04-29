# Variables Documentation

## 1. Scope and Purpose

This document catalogs product variables used in storage, calculations, rendering, synchronization, and exports.

## 2. Variable Dictionary

| Variable Name | Friendly Name | Definition | Formula / Rule | App Location | Example |
|---|---|---|---|---|---|
| `profileName` | Profile Name | Unique key for profile data grouping. | Non-empty unique key under root `data`. | `js/profile.js`, `js/handlers.js` | `Engineering-A` |
| `profileMeta[profile].role` | Profile Role | Role label for profile context. | Trimmed user text. | `js/profile.js` | `Senior Engineer` |
| `profileMeta[profile].passwordHash` | Profile Password Hash | Hash for profile unlock checks. | SHA-256 or fallback hash only. | `js/profile.js` | `9d4e1e...` |
| `id` | Entry ID | Unique entry identifier. | Generated on create, immutable logical ID. | `js/form.js`, `js/modal.js` | `entry-abc123` |
| `date` | Entry Date | Canonical date key for entry. | `YYYY-MM-DD` canonicalized. | `js/form.js`, `lib/merge-working-hours.js` | `2026-05-06` |
| `clockIn` | Clock In | Start time of work period. | Normalize to `HH:mm`. | `js/time.js`, `js/form.js` | `09:00` |
| `clockOut` | Clock Out | End time of work period. | Normalize to `HH:mm`. | `js/time.js`, `js/form.js` | `18:00` |
| `breakMinutes` | Break Duration | Break persisted in minutes. | Parse value+unit to integer minutes. | `js/form.js`, `js/modal.js` | `60` |
| `dayStatus` | Day Status | Workday type classification. | Enum: `work/sick/holiday/vacation`. | `js/constants.js`, `js/form.js` | `work` |
| `location` | Work Location | Work location classification. | Enum: `WFO/WFH/Anywhere`. | `js/constants.js`, `js/form.js` | `WFH` |
| `timezone` | Entry Timezone | IANA timezone for entry. | Must be valid timezone string. | `js/timezone-picker.js`, `js/form.js` | `Asia/Jakarta` |
| `description` | Entry Description | Optional contextual text. | Optional string field. | `js/form.js`, `js/render.js` | `Client sync meeting` |
| `createdAt` | Created At | Entry creation timestamp. | ISO-8601 timestamp. | create flow + merge | `2026-04-28T12:00:00.000Z` |
| `updatedAt` | Updated At | Entry update timestamp. | ISO-8601 timestamp; latest wins. | edit flow + merge | `2026-04-28T12:15:00.000Z` |
| `netWorkMinutes` | Net Work Minutes | Effective worked minutes after break. | `max((clockOut-clockIn)-breakMinutes,0)` | `js/time.js`, `js/render.js` | `480` |
| `overtimeMinutes` | Overtime Minutes | Minutes above baseline workday. | `max(netWorkMinutes-480,0)` | `js/time.js`, `js/stats-summary.js` | `30` |
| `exportedAt` | Export Timestamp | Snapshot generation timestamp. | ISO-8601 timestamp at export. | `js/data-sync.js`, `js/export.js` | `2026-04-28T12:16:00.000Z` |
| `workingHoursData` | Local Storage Snapshot Key | Root localStorage key for app data. | JSON string payload. | `js/constants.js`, `js/storage.js` | `{...}` |
| `workingHoursLastProfile` | Last Profile Key | Last selected profile key. | String profile name. | `js/init.js` | `Engineering-A` |

## 3. Variable Relationship Chart

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
  D --> M[createdAt]
  D --> N[updatedAt]
  F --> O[netWorkMinutes]
  G --> O
  H --> O
  O --> P[overtimeMinutes]
  Q[exportedAt] --> R[payload snapshot]
  R --> S[localStorage and Redis persistence]
```

## 4. Integrity Rules

- Canonical merge logic prefers latest valid `updatedAt`.
- Date/time strings are normalized before persistence.
- Password values are hash-only.
- Snapshot POST semantics in production can remove absent records.
