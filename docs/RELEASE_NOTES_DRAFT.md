# Release Notes (Draft)

**Target release:** Documentation & hygiene v2.0  
**Date:** 2026-07-06  
**Status:** Draft

---

## Summary

Major documentation refresh aligning all enterprise artifacts with the live codebase, plus client bundle hygiene (removed unused seed CSV module and dead exports).

---

## For users

- **No feature removals** — all workflows unchanged.
- **Faster initial load** — removed unused ~53 KB seed CSV script from page load.
- **Documentation** — product team and developers now have expanded guides for variables, themes, metrics, and guardrails.

---

## For developers

### Removed (dead code)
- `js/seed-csv.js` and `index.html` script reference
- Unused exports: `configureProfilePassword`, `getProfileId`, `setVacationDaysForYear`, `updateBulkRowDuplicateHint`, `buildCsvRows`, `formatTimeInZone`, `selectCalendarDate`
- Duplicate `refreshVacationDaysModalStaticText` in `vacation-days.js`

### Documentation added/updated
- Full README, PRD, personas (5), user stories (20+), variables dictionary with relationship chart
- Design guidelines with **36 theme palettes**
- Product metrics, OKRs, traceability matrix (accurate test refs), guardrails
- Architecture, API, security, test strategy, operations, deployment guides

### Tests
- `npm test`: 6/6 pass (unchanged)

---

## Upgrade notes

- No migration required.
- If you referenced removed APIs in external scripts, use alternatives documented in `CHANGELOG.md`.

---

## Known issues

- Client does not send `X-API-Key` when `WORKHOURS_API_KEY` is set (documented in `API_CONTRACTS.md`).
- Frontend automated tests not yet implemented (manual regression per `TEST_STRATEGY.md`).

---

## Sign-off

Use `RELEASE_SIGNOFF_TEMPLATES.md` before production promotion.
