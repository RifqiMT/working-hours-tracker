# Test Strategy

**Product:** Working Hours Tracker  
**Last updated:** 2026-07-07

---

## 1. Objectives

| Objective | Rationale |
|-----------|-----------|
| Prevent merge/sync regressions | Core data integrity |
| Validate API contract | Production persistence |
| Preserve export schema | Downstream consumers |
| Guide manual UX coverage | No E2E suite yet |

---

## 2. Test Pyramid (current state)

```
        ┌─────────────┐
        │ Manual E2E  │  Primary today
        │ smoke       │
        ├─────────────┤
        │ API + merge │  6 automated tests
        │ unit tests  │
        └─────────────┘
```

---

## 3. Automated Coverage

**Command:** `npm test` (Node built-in test runner)

| File | Tests | Validates |
|------|-------|-----------|
| `tests/merge-working-hours.test.js` | 2 | Id/`updatedAt` merge; one entry per date; time normalization |
| `tests/api-working-hours-data.test.js` | 4 | GET 404; POST 204; snapshot deletion; auth write mode |

### 3.1 i18n scripts (not in `npm test`)

| Script | Purpose |
|--------|---------|
| `npm run verify:i18n` | Locale pack structure |
| `npm run qa:i18n:quick` | Quick translation QA |

---

## 4. Manual Regression Checklist

Run before each release:

### Profile
- [ ] Create profile with role and password
- [ ] Edit profile rename + password change (verify current password)
- [ ] Delete profile (not last)
- [ ] Lock blocks entries until unlock

### Entries
- [ ] Single save new + update same date
- [ ] Bulk save 3 rows
- [ ] Edit/delete selection
- [ ] Clock in / clock out

### Sync / IO
- [ ] Startup sync (local + API)
- [ ] Export CSV and JSON
- [ ] Import CSV round-trip sample

### Reporting
- [ ] Stats summary opens and charts render
- [ ] Infographic timeframe switch
- [ ] PPT generates download

### i18n / theme
- [ ] Switch language (e.g. DE, ID)
- [ ] Switch theme (dark + one country theme)

---

## 5. Test Data Fixtures

- Use `docs/DATA_SCHEMA_EXAMPLES.md` for import tests.
- Local API writes to `data/Working Hours Data.json` (gitignored).

---

## 6. Coverage Gaps and Roadmap

| Area | Gap | Recommendation |
|------|-----|----------------|
| Profile password | No unit tests | Add `profile.js` hash/verify tests |
| Voice parser | Manual only | Phrase fixture unit tests |
| Export CSV | Manual only | Snapshot column test |
| Frontend render | None | Optional Playwright smoke |
| E2E sync | None | Staging Vercel + Redis test instance |

---

## 7. CI Recommendations

```yaml
# Suggested pipeline steps
- npm install
- npm test
- npm run verify:i18n  # optional gate
```

No coverage percentage tooling configured today.

---

## 8. Defect Severity

| Level | Definition | Blocks release? |
|-------|------------|-----------------|
| P0 | Data loss, security bypass | Yes |
| P1 | Cannot save/sync/export | Yes |
| P2 | Wrong calculation, broken filter | Usually |
| P3 | Cosmetic, non-critical i18n | No |

---

## 9. Related Documents

- `TRACEABILITY_MATRIX.md`
- `GUARDRAILS.md` QG-*
- `RELEASE_SIGNOFF_TEMPLATES.md`
