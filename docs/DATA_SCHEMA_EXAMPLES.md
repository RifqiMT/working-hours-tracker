# Data Schema Examples

This document provides practical payload examples used by the application.

## 1. Root Schema Example

```json
{
  "exportedAt": "2026-03-24T10:45:00.000Z",
  "data": {
    "Engineering - A": [
      {
        "id": "f4a7f8df-0e9b-4dc0-b6d6-a2d8f85fb0c1",
        "date": "2026-03-24",
        "clockIn": "08:30",
        "clockOut": "17:45",
        "breakMinutes": 60,
        "dayStatus": "work",
        "location": "WFH",
        "description": "Sprint execution and review",
        "timezone": "Europe/Berlin",
        "createdAt": "2026-03-24T08:00:12.000Z",
        "updatedAt": "2026-03-24T17:45:35.000Z"
      }
    ],
    "profileMeta": {
      "Engineering - A": {
        "role": "Senior Engineer",
        "createdAt": "2026-01-10T07:00:00.000Z",
        "updatedAt": "2026-03-01T07:00:00.000Z"
      }
    },
    "vacationDaysByProfile": {
      "Engineering - A": {
        "2026": 24
      }
    },
    "lastClock_Engineering - A": {
      "clockIn": "08:30",
      "clockOut": "17:45",
      "updatedAt": "2026-03-24T17:45:35.000Z"
    }
  }
}
```

## 2. Entry Variants by Day Status

### Work Day
- Requires meaningful clock fields for accurate aggregates.
```json
{
  "dayStatus": "work",
  "clockIn": "09:00",
  "clockOut": "18:00",
  "breakMinutes": 60,
  "location": "WFO"
}
```

### Vacation Day
- Time fields can still exist, but calculations treat status semantics accordingly.
```json
{
  "dayStatus": "vacation",
  "clockIn": "09:00",
  "clockOut": "18:00",
  "breakMinutes": 60,
  "location": "Anywhere"
}
```

### Sick Day / Holiday
```json
{
  "dayStatus": "sick",
  "location": "Anywhere"
}
```

## 3. Validation and Enum Reference

- `dayStatus`: `work`, `vacation`, `holiday`, `sick`
- `location`: `WFO`, `WFH`, `Anywhere`
- `timezone`: IANA timezone string (`Europe/Berlin`, `Asia/Singapore`, etc.)

## 4. Formula Example from Entry to Aggregates

- `grossMinutes = clockOut - clockIn`
- `netWorkMinutes = max(grossMinutes - breakMinutes, 0)`
- `overtimeMinutes = max(netWorkMinutes - 480, 0)`

Sample:
- `08:30` to `17:45` = `555`
- minus break `60` = `495` (`8h 15m`)
- overtime = `495 - 480 = 15`
