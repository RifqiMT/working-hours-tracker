# Release Notes (Draft)

**Target release:** Documentation v2.1 + hygiene  
**Date:** 2026-07-07  
**Status:** Draft

---

## Summary

Documentation suite aligned with the live codebase including the **sync-status** module, autosave status badge, and post-cleanup i18n state. No breaking user-facing feature changes.

---

## For users

- **Save status visibility:** Profile toolbar shows real-time Saving / Saved / Retrying / error states next to save actions.
- **No workflow changes** to entry, export, or reporting features.
- **Faster page load** (cumulative): unused seed CSV script removed in prior release.

---

## For developers

### New / documented modules
- **`js/sync-status.js`** — `#saveDataStatus` badge; `setSyncStatusDisplay`, `clearSyncStatusDisplay`, `refreshSyncStatusDisplay`
- Loaded after `constants.js`, before `storage.js` in `index.html`

### Code hygiene (2026-07-07)
- Removed orphaned `profileAuth.configure*` and `profile.prewarmUiPack` i18n keys (24 locale packs + `i18n.js`)
- Internalized exports: `exportInfographicTable`, `getStatusIcon`, `moveEntriesModalsToCard`

### Code hygiene (2026-07-06)
- Removed `js/seed-csv.js`, unused API exports (`configureProfilePassword`, `formatTimeInZone`, etc.)

### Documentation (v2.1)
- All enterprise docs updated: README, PRD, personas, stories, variables (incl. sync status), metrics, OKRs, design guidelines, traceability, guardrails, architecture, API, ops, test strategy

### Tests
- `npm test`: 6/6 pass
- `npm run verify:i18n`: OK

---

## Upgrade notes

- No migration required.
- If custom integrations referenced removed `W.*` exports, use internal patterns documented in `CHANGELOG.md`.

---

## Known issues

- Client does not send `X-API-Key` when `WORKHOURS_API_KEY` is set (`API_CONTRACTS.md`).
- Frontend automated tests limited to merge + API (manual regression per `TEST_STRATEGY.md`).

---

## Sign-off

Use `RELEASE_SIGNOFF_TEMPLATES.md` before production promotion.
