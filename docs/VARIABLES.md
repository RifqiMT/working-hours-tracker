# Variables Documentation

## Purpose

Defines canonical variables used by persistence, calculations, rendering, and reporting.

## Variable Catalog

| Variable Name | Friendly Name | Definition | Formula / Rule | Location in App | Example |
|---|---|---|---|---|---|
| `profileName` | Profile Name | Unique profile identifier under `data` root. | Non-empty unique key. | `js/profile.js`, `js/handlers.js` | `Engineering-A` |
| `profileMeta[profile].role` | Profile Role | Human-readable role metadata. | Trimmed text. | `js/profile.js` | `Senior Engineer` |
| `profileMeta[profile].passwordHash` | Profile Password Hash | Hashed profile password for unlock checks. | SHA-256/fallback hash only. | `js/profile.js` | `9d4e1e...` |
| `id` | Entry ID | Unique entry identifier. | Generated once on create. | `js/form.js`, `js/modal.js` | `entry-123` |
| `date` | Entry Date | Entry date in canonical format. | `YYYY-MM-DD` normalized. | `js/form.js`, `lib/merge-working-hours.js` | `2026-05-06` |
| `clockIn` | Clock In Time | Work start time. | `HH:mm` normalized. | `js/form.js`, `js/time.js` | `09:00` |
| `clockOut` | Clock Out Time | Work end time. | `HH:mm` normalized. | `js/form.js`, `js/time.js` | `18:00` |
| `breakMinutes` | Break Minutes | Break duration in minutes. | Parsed value/unit to integer minutes. | `js/form.js`, `js/modal.js` | `60` |
| `dayStatus` | Day Status | Workday classification. | Enum: `work/sick/holiday/vacation`. | `js/constants.js`, `js/form.js` | `work` |
| `location` | Work Location | Work location state. | Enum: `WFO/WFH/Anywhere`. | `js/constants.js`, `js/form.js` | `WFH` |
| `timezone` | Entry Timezone | IANA timezone reference. | Valid IANA value. | `js/timezone-picker.js`, `js/form.js` | `Asia/Jakarta` |
| `description` | Description | Optional contextual notes. | Optional string. | `js/form.js`, `js/render.js` | `Client sync` |
| `createdAt` | Created Timestamp | Creation datetime. | ISO timestamp. | entry create flow | `2026-04-28T12:00:00.000Z` |
| `updatedAt` | Updated Timestamp | Last update datetime. | ISO timestamp; latest wins. | edit/merge flow | `2026-04-28T12:15:00.000Z` |
| `netWorkMinutes` | Net Worked Minutes | Effective worked minutes after break. | `max((clockOut-clockIn)-breakMinutes,0)` | `js/time.js`, `js/render.js` | `480` |
| `overtimeMinutes` | Overtime Minutes | Minutes above baseline workday. | `max(netWorkMinutes-480,0)` | `js/time.js`, `js/stats-summary.js` | `30` |
| `exportedAt` | Snapshot Timestamp | Snapshot generation timestamp. | ISO timestamp. | `js/data-sync.js`, `js/export.js` | `2026-04-28T12:16:00.000Z` |

## Relationship Chart

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
```
