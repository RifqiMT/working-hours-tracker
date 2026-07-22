# i18n Tools (Offline-first manual packs)

**Related docs:** `../PRODUCT_DOCUMENTATION_STANDARD.md`, `../docs/GUARDRAILS.md`, `../docs/VARIABLES.md` (pptExport keys).  
**Last updated:** 2026-07-22

This folder contains helper scripts for the app’s *full manual pack* i18n approach:

- Runtime translation is **offline-first** (no network warmup).
- Full locale packs are file-based: `js/i18n-<locale>-locale.js` loaded **before** `js/i18n.js`.
- Verification scripts ensure locale packs match the canonical `translations.en` structure.
- Indonesian (`id`) is maintained only in `js/i18n-id-locale.js` (edit that file directly).

## Generate a new full manual pack (network during generation)

Uses the same Google Translate endpoint as the app’s historical generation pipeline.

```bash
node scripts/generate-manual-locale-from-en-translated.js --lang=fr --var=FR
```

Optional: disk translation cache (speeds repeated generations)

```bash
node scripts/generate-manual-locale-from-en-translated.js --lang=fr --var=FR --use-cache
# or custom cache location:
node scripts/generate-manual-locale-from-en-translated.js --lang=fr --var=FR --cache-file=./.i18n-cache.json
```

Outputs:

- `js/i18n-fr-locale.js`
- includes `help` inside the pack (so it works offline).

## Standardize formatting (content preserved)

Rewrites locale files using a consistent `JSON.stringify(..., null, 2)` format.

```bash
# Standardize all file-based packs:
node scripts/standardize-manual-locale-pack-format.js

# Or only some locales:
node scripts/standardize-manual-locale-pack-format.js --locales=af,ar,fi,nl
```

## Keep sync / toolbar aria keys aligned

```bash
node scripts/sync-locale-sync-keys.js
```

## Remove verified orphaned i18n keys

After confirming keys are unused in app code/HTML, remove them from `translations.en` and all locale packs:

```bash
node scripts/remove-dead-i18n-keys.js
```

Edit `DEAD_PATHS` inside that script before running.

## Verify locale completeness (offline / structural)

```bash
# Deep structural verification across all selector locales:
node scripts/verify-manual-locale-packs-offline.js

# Lightweight verification (selector + shell coverage):
npm run verify:i18n

# Quick QA wrapper:
npm run qa:i18n:quick
```
