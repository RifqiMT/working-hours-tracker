# Guardrails (Technical + Business Limitations)

**Last updated:** 2026-03-20

This document records non-negotiable constraints and “safe boundaries” for product development of `working-hours-tracker`.

## 1) Localization / i18n Guardrails (Offline-first)

1. Runtime must remain **offline-first** for UI/help:
   - Static UI/help strings come from manual locale packs; no network is required for them.
   - Bulk **UI-pack prewarm** (optional developer mode) is gated by `ALLOW_NETWORK_TRANSLATION` / `window.__WH_ALLOW_NETWORK_TRANSLATION__` (disabled by default).
2. Full manual packs are **authoritative**:
   - File-based manual packs loaded in `index.html` before `js/i18n.js` must not be overwritten by shell merges.
   - `js/i18n.js` uses manual-pack authority detection (`isManualFullUiPackLocale`) to skip shell merges for those locales.
3. Indonesian (`id`) must follow the same standard:
   - `js/i18n-id-locale.js` is loaded before `js/i18n.js`.
   - `id` is treated as a manual full-pack locale so its UI/help remains stable.
4. Quality gates for i18n updates:
   - After any change to `js/i18n.js` locale lists or shell structure:
     - `npm run verify:i18n`
     - `node scripts/verify-manual-locale-packs-offline.js`
5. Generation caching:
   - `scripts/.i18n-translate-cache.json` is ignored by git and is **optional** (disabled by default) in `scripts/generate-manual-locale-from-en-translated.js`.
   - Do not rely on the cache for runtime correctness.

6. Dynamic translation for user-entered text (Google Translate, on demand)
   - User-entered values (profile `role`, entry `description` / “day description” tooltips, search) are translated via the public Google `translate_a/single` endpoint when **online**.
   - Translation is **context-aware** and cached separately for different fields via:
     - `W.translateDynamicUserText(text, targetLang, contextKey)`
     - `W.getTranslatedDynamicUserTextCached(text, targetLang, contextKey)`
   - Results are keyed by target language and cached in memory and `localStorage` (`workingHoursUserTextTranslationCache`).
   - This pipeline targets **`W.currentLanguage`** (resolved locale, not the literal `auto` selector value).
   - It is **enabled by default**. Opt out globally with `window.__WH_DISABLE_DYNAMIC_USER_TEXT_TRANSLATION__ = true` (see `js/i18n.js`). This is independent of UI-pack prewarm (`ALLOW_NETWORK_TRANSLATION`).

7. Non-text indicator tooltips/ARIA (e.g., internet connectivity badge)
   - Tooltip/ARIA text must be sourced from manual full i18n packs (e.g., `common.internetStatus.*`), not hardcoded strings.
   - When the active language changes, dynamic tooltip/ARIA labels must be re-synchronized (implementation: `W.updateInternetStatusIndicator()` is invoked from `W.refreshDynamicTranslations()`).
   - Visible network status text is intentionally omitted; the icon-only UI must remain unambiguous and accessible.

## 2) Script Load Order Guardrails

1. `index.html` script order is a dependency contract.
2. All i18n locale packs (`js/i18n-*-locale.js` and `js/i18n-id-locale.js`) must load before `js/i18n.js`.
3. Theme tokens and UI token overrides defined in `index.html` must remain loaded before `js/init.js` applies the theme.

## 3) Data Persistence + Integrity Guardrails

1. Data is persisted locally (browser storage). Root dataset key is `workingHoursData`.
2. Import merge semantics:
   - Stable entry identity uses `id`.
   - Merge favors newest record updates (per import logic), while preserving data integrity for profile/vacation/accounting.
3. Derived values must not be persisted:
   - Computed fields (e.g., net working minutes, overtime minutes) are recalculated from entry primitives to prevent drift.

## 4) Reporting / Calculation Guardrails

1. Overtime rules must stay consistent:
   - Overtime applies only when `dayStatus === 'work'`.
   - Standard work threshold is `480 minutes/day` (see `js/constants.js`).
2. Reporting projections must update coherently:
   - Entries table, calendar, stats card, charts, infographic, and PPT must share the same underlying derived calculations.

## 4b) Break Input and Persistence Guardrails

1. The break **number field** must not accept values above **60** when the unit is **minutes**, or above **24** when the unit is **hours** (`W.BREAK_INPUT_MAX_MINUTES`, `W.BREAK_INPUT_MAX_HOURS` in `js/time.js`).
2. Total break stored as `breakMinutes` must not exceed **24 hours** (1,440 minutes). `W.parseBreakToMinutes` enforces caps; `W.breakMinutesToInputFields` maps stored minutes back to the number + unit controls for edit modals.
3. Any change to these limits requires synchronized updates to `docs/VARIABLES.md`, `docs/PRD.md`, user stories, and QA checks on entry form, edit modal, and voice review fields (`js/init.js` bindings).

## 5) Security + Privacy Guardrails

1. No auth/RBAC is implemented.
2. No external data syncing is required for core workflows.
3. Avoid introducing credentials/secrets in repo-tracked files.

## 6) Delivery + Quality Guardrails

1. There is no automated test harness in `package.json` today.
2. Use quick QA + verification scripts and manual QA checklist for releases:
   - Locale selector correctness and pack presence
   - Export/import round-trips
   - Theme switching across breakpoints
   - Timezone picker correctness
   - Quick automated gate: `npm run qa:i18n:quick`

3. No automatic repository publishing:
   - The project does not perform any auto-commit/push/release actions during app runtime or install.
   - Generated artifacts and doc updates must only be committed/pushed when the development team explicitly requests it.

