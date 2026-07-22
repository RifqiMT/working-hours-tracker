# Data Schema Examples

**Product:** Working Hours Tracker  
**Last updated:** 2026-07-22

Copy-paste-friendly JSON for validating imports, API responses, and merge behavior.

**Related:** `VARIABLES.md`, `API_CONTRACTS.md`, `lib/merge-working-hours.js`

---

## 1. Root Payload Example (export / API)

```json
{
  "exportedAt": "2026-07-07T10:45:00.000Z",
  "data": {
    "Engineering - A": [
      {
        "id": "f4a7f8df-0e9b-4dc0-b6d6-a2d8f85fb0c1",
        "date": "2026-07-07",
        "clockIn": "08:30",
        "clockOut": "17:45",
        "breakMinutes": 60,
        "dayStatus": "work",
        "location": "WFH",
        "description": "Sprint execution and review",
        "timezone": "Europe/Berlin",
        "createdAt": "2026-07-07T08:00:12.000Z",
        "updatedAt": "2026-07-07T17:45:35.000Z"
      }
    ],
    "profileMeta": {
      "Engineering - A": {
        "id": "profile-7a2b9c1d",
        "role": "Senior Engineer",
        "passwordHash": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
        "passwordEncrypted": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
      }
    },
    "vacationDaysByProfile": {
      "Engineering - A": {
        "2026": 24
      }
    },
    "lastClock_Engineering - A": {
      "action": "in",
      "time": "08:30",
      "date": "2026-07-07"
    }
  }
}
```

---

## 1a. Profile metadata notes

| Field | Notes |
|-------|-------|
| `passwordHash` | Canonical SHA-256 hex of password; never plaintext |
| `passwordEncrypted` | Legacy/normalized alias kept in sync with `passwordHash` by sync/normalize paths |

---

## 2. Entry Variants by Day Status

### Work day
Requires meaningful clock fields for duration/overtime.

```json
{
  "id": "entry-work-001",
  "date": "2026-07-07",
  "clockIn": "09:00",
  "clockOut": "18:00",
  "breakMinutes": 60,
  "dayStatus": "work",
  "location": "WFO",
  "description": "Office collaboration",
  "timezone": "Europe/Berlin",
  "createdAt": "2026-07-07T07:00:00.000Z",
  "updatedAt": "2026-07-07T18:05:00.000Z"
}
```

### Vacation day

```json
{
  "id": "entry-vacation-001",
  "date": "2026-08-01",
  "clockIn": "09:00",
  "clockOut": "18:00",
  "breakMinutes": 60,
  "dayStatus": "vacation",
  "location": "Anywhere",
  "description": "Annual leave",
  "timezone": "Europe/Berlin",
  "createdAt": "2026-07-01T10:00:00.000Z",
  "updatedAt": "2026-07-01T10:00:00.000Z"
}
```

### Sick day / holiday

```json
{
  "id": "entry-sick-001",
  "date": "2026-07-08",
  "clockIn": "09:00",
  "clockOut": "18:00",
  "breakMinutes": 60,
  "dayStatus": "sick",
  "location": "Anywhere",
  "description": "",
  "timezone": "Europe/Berlin",
  "createdAt": "2026-07-08T08:00:00.000Z",
  "updatedAt": "2026-07-08T08:00:00.000Z"
}
```

---

## 3. Validation and Enum Reference

| Field | Allowed values | Notes |
|-------|----------------|-------|
| `dayStatus` | `work`, `vacation`, `holiday`, `sick` | Default `work` |
| `location` | `WFO`, `WFH`, `Anywhere` | Import maps `AW` → `Anywhere` |
| `date` | `YYYY-MM-DD` | Canonical after merge |
| `clockIn` / `clockOut` | `HH:mm` or null | Normalized on merge |
| `breakMinutes` | Integer ≥ 0 | |
| `timezone` | IANA string | e.g. `Asia/Jakarta` |

---

## 4. Formula Example (entry → aggregates)

Given work entry `08:30`–`17:45`, break `60`:

```
grossMinutes = 17:45 − 08:30 = 555
netWorkMinutes = max(0, 555 − 60) = 495
overtimeMinutes = max(0, 495 − 480) = 15
```

Overtime applies only when `dayStatus === 'work'`.

---

## 5. CSV Export Column Order

```
Profile, Profile ID, Encrypted Password, Role, Year, Vacation quota (year),
Entry ID, Date, Clock In, Clock Out, Break (min), Duration (min),
Status, Location, Description, Timezone, Created At, Updated At
```

---

## 6. Infographic Period Keys (derived, not stored)

| Timeframe | Key format | Example |
|-----------|------------|---------|
| Annual | `YYYY` | `2026` |
| Quarterly | `YYYY-Qn` | `2026-Q2` |
| Monthly | `YYYY-MM` | `2026-07` |
| Weekly | `YYYY-Wnn` | `2026-W27` |

---

## 7. Merge Scenario Example

**Existing:** entry `date=2026-07-07`, `updatedAt=10:00`  
**Incoming:** same date, `updatedAt=12:00`  
**Result:** incoming row wins; single entry for `2026-07-07`.

---

## 8. Maintenance

When schema changes:
1. Update this file
2. Update `VARIABLES.md`
3. Update `CHANGELOG.md`
4. Add/adjust `tests/merge-working-hours.test.js` if merge rules change
