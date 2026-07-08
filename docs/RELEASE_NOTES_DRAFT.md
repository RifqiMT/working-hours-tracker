# Release Notes (Draft)

**Target release:** Documentation v2.2 + hygiene  
**Date:** 2026-07-08  
**Status:** Draft

---

## Summary

Documentation suite v2.2 aligned with the live codebase after dead-code and orphaned i18n cleanup. No breaking user-facing feature changes.

---

## For users

- **No workflow changes** to entry, export, sync, or reporting features.
- **Smaller translation payloads** (cumulative) from removed unused strings.
- **Save status badge** continues to show Saving / Saved / Retrying / error states (`sync-status.js`).

---

## For developers

### Code hygiene (2026-07-08)
- Removed unused export `W.buildAppTooltipText`; tooltips use `buildAppTooltipAttr` / `buildAppTooltipData`.
- Removed unused `W._mainSectionsBottomEdgeObserver` assignment (`init.js`).
- Deduplicated tooltip helpers in `render.js` `renderStatsBox`.
- Removed 21 verified orphaned i18n keys from `i18n.js` + 24 locale packs.
- Added `scripts/remove-dead-i18n-keys.js`.

### Documented modules (v2.2)
- **`js/app-tooltip.js`** — shared custom tooltips for stats and entries
- **`js/smart-select.js`** — enhanced filter/form dropdowns
- **`js/entries-search.js`** — typeahead search
- **`js/sync-status.js`** — autosave status badge

### Prior hygiene (2026-07-07 / 2026-07-06)
- Sync-status module, internalized exports, `seed-csv.js` removal — see `CHANGELOG.md`.

### Documentation (v2.2)
- Full enterprise doc suite updated: README, PRD, personas, stories, variables (§12 tooltips, §17 removed keys), metrics, OKRs, design, traceability, guardrails, architecture, API, ops, test strategy.

### Tests
- `npm test`: 6/6 pass
- `npm run verify:i18n`: OK

---

## Upgrade notes

- No migration required.
- Do not re-add i18n keys listed in `docs/VARIABLES.md` §17.
- If custom integrations referenced `W.buildAppTooltipText`, use `W.buildAppTooltipAttr` instead.

---

## Known issues

- Client does not send `X-API-Key` when `WORKHOURS_API_KEY` is set (`API_CONTRACTS.md`).
- Frontend automated tests limited to merge + API (manual regression per `TEST_STRATEGY.md`).

---

## Sign-off

Use `RELEASE_SIGNOFF_TEMPLATES.md` before production promotion.
