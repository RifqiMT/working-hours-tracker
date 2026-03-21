# i18n Tools (Offline-first manual packs)

This folder contains helper scripts for the app’s *full manual pack* i18n approach:

- Runtime translation is **offline-first** (no network warmup).
- Full locale packs are file-based: `js/i18n-<locale>-locale.js` loaded **before** `js/i18n.js`.
- Verification scripts ensure locale packs match the canonical `translations.en` structure.

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

## Extract Indonesian (`id`) from embedded `js/i18n.js`

Indonesian is authored inside `js/i18n.js`, but for consistency it is exported as a file-based full manual pack:

```bash
node scripts/extract-manual-id-locale-from-i18n.js
```

Outputs:

- `js/i18n-id-locale.js`

## Standardize formatting (content preserved)

Rewrites locale files using a consistent `JSON.stringify(..., null, 2)` format.

```bash
# Standardize all file-based packs:
node scripts/standardize-manual-locale-pack-format.js

# Or only some locales:
node scripts/standardize-manual-locale-pack-format.js --locales=af,ar,fi,nl
```

## Verify locale completeness (offline / structural)

```bash
# Deep structural verification across all selector locales:
node scripts/verify-manual-locale-packs-offline.js

# Lightweight verification (selector + shell coverage):
npm run verify:i18n
```

