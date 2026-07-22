# Release Notes (Draft)

**Target release:** Documentation v2.4 + code hygiene  
**Date:** 2026-07-22  
**Status:** Draft

---

## Summary

Documentation suite **v2.4** aligns the full enterprise doc set with the live codebase after 2026-07-22 hygiene (dead code, unused CSS tokens, orphaned i18n keys, obsolete one-shot scripts). No intentional user-facing feature changes.

---

## For users

- **No workflow changes** to entry, export, sync, or reporting features.
- **Smaller translation payloads** from removed unused strings (cumulative with prior hygiene).
- Save status badge, stats tooltips, themes, and multilingual UI continue as before.

---

## For developers

### Code hygiene (2026-07-22)
- Removed unused exports/helpers: `W.buildAppTooltipText`, `parseTimeToMinutes`, `setLabelTextInContainer`, `applyTooltipTemplate`.
- Removed unused CSS custom properties from `index.html` (entry-row / shadow / tip panel tokens no longer referenced).
- Removed 39 verified orphaned i18n key paths from `translations.en` + 24 locale packs.
- Deleted obsolete one-shot i18n patch scripts; **7** maintenance scripts remain under `scripts/`.
- Extended `scripts/remove-dead-i18n-keys.js`.

### Documentation (v2.4)
- Full suite freshness bump to **2026-07-22**.
- `MODULE_REFERENCE.md`: maintenance scripts count corrected **14 → 7**; `LEGACY_DEFAULT_TIMEZONE` in constants exports.
- `DATA_SCHEMA_EXAMPLES.md`: `passwordEncrypted` alias documented.
- `SECURITY_MODEL.md` / `DEPLOYMENT_VERCEL.md` / `GUARDRAILS.md`: production `Permissions-Policy: microphone=()` vs voice entry (FR-04) called out.
- Language precision: **25 UI languages** (English embedded + 24 manual packs).
- `PRODUCT_DOCUMENTATION_STANDARD.md` → **v2.4**.

### Tests
- `npm test`: 6/6 pass
- `npm run verify:i18n`: OK

---

## Upgrade notes

- No data migration required.
- Do not re-add i18n keys listed as removed in `docs/VARIABLES.md` / CHANGELOG hygiene entries.
- If custom integrations referenced `W.buildAppTooltipText`, use `W.buildAppTooltipAttr` / `W.buildAppTooltipData`.
- Production voice entry may be blocked by Vercel `Permissions-Policy` until microphone is explicitly allowed (see `SECURITY_MODEL.md`).

---

## Known issues

- Client does not send `X-API-Key` when `WORKHOURS_API_KEY` is set (`API_CONTRACTS.md`).
- Frontend automated tests limited to merge + API (manual regression per `TEST_STRATEGY.md`).
- Offline locale pack completeness check may still report pre-existing incomplete packs (improved vs prior baseline).

---

## Sign-off

Use `RELEASE_SIGNOFF_TEMPLATES.md` before production promotion.
