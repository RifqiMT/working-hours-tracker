#!/usr/bin/env node
'use strict';

/**
 * Offline manual-pack verification.
 *
 * Goals:
 * 1) Ensure every language from LANGUAGE_OPTION_DEFS (except `auto`, `en`, `id`) has a
 *    file-based full manual pack with complete structure vs `translations.en` (+ helpEn).
 * 2) Provide a quick signal if a locale is "effectively untranslated" (too many strings
 *    identical to English).
 *
 * Exit code:
 * - 0: all locales pass
 * - 1: one or more locales are missing keys or look untranslated
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const i18nPath = path.join(ROOT, 'js', 'i18n.js');
const i18nText = fs.readFileSync(i18nPath, 'utf8');

function extractBraceObjectFromVar(text, varName) {
  const marker = `var ${varName} = {`;
  const start = text.indexOf(marker);
  if (start === -1) throw new Error(`Could not find ${marker}`);
  const firstBrace = text.indexOf('{', start + marker.length - 1);
  if (firstBrace === -1) throw new Error(`Could not find opening brace for ${varName}`);

  let braceDepth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let escaped = false;
  for (let i = firstBrace; i < text.length; i++) {
    const ch = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }

    if (!inDouble && !inTemplate && ch === "'" && !inSingle) {
      inSingle = true;
      continue;
    }
    if (inSingle && ch === "'") {
      inSingle = false;
      continue;
    }
    if (!inSingle && !inTemplate && ch === '"' && !inDouble) {
      inDouble = true;
      continue;
    }
    if (inDouble && ch === '"') {
      inDouble = false;
      continue;
    }
    if (!inSingle && !inDouble && ch === '`' && !inTemplate) {
      inTemplate = true;
      continue;
    }
    if (inTemplate && ch === '`') {
      inTemplate = false;
      continue;
    }

    if (inSingle || inDouble || inTemplate) continue;

    if (ch === '{') braceDepth++;
    else if (ch === '}') {
      braceDepth--;
      if (braceDepth === 0) {
        const end = i + 1; // inclusive
        const objLiteral = text.slice(firstBrace, end);
        return vm.runInNewContext('(' + objLiteral + ')');
      }
    }
  }
  throw new Error(`Could not extract object for ${varName}`);
}

function extractTranslationsEn() {
  const start = i18nText.indexOf('\n    en: {');
  if (start === -1) throw new Error('Could not find translations.en start');
  const firstBrace = i18nText.indexOf('{', start);
  if (firstBrace === -1) throw new Error('Could not find en opening brace');

  let braceDepth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let escaped = false;
  for (let i = firstBrace; i < i18nText.length; i++) {
    const ch = i18nText[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }

    if (!inDouble && !inTemplate && ch === "'" && !inSingle) {
      inSingle = true;
      continue;
    }
    if (inSingle && ch === "'") {
      inSingle = false;
      continue;
    }
    if (!inSingle && !inTemplate && ch === '"' && !inDouble) {
      inDouble = true;
      continue;
    }
    if (inDouble && ch === '"') {
      inDouble = false;
      continue;
    }
    if (!inSingle && !inDouble && ch === '`' && !inTemplate) {
      inTemplate = true;
      continue;
    }
    if (inTemplate && ch === '`') {
      inTemplate = false;
      continue;
    }

    if (inSingle || inDouble || inTemplate) continue;

    if (ch === '{') braceDepth++;
    else if (ch === '}') {
      braceDepth--;
      if (braceDepth === 0) {
        const end = i + 1;
        const objLiteral = i18nText.slice(firstBrace, end);
        return vm.runInNewContext('(' + objLiteral + ')');
      }
    }
  }
  throw new Error('Could not extract translations.en object');
}

function extractLanguageOptionDefsValues() {
  const needle = 'var LANGUAGE_OPTION_DEFS = [';
  const start = i18nText.indexOf(needle);
  if (start === -1) throw new Error('Could not find LANGUAGE_OPTION_DEFS');
  const after = start + needle.length;
  let depth = 1;
  let i = after;
  for (; i < i18nText.length && depth > 0; i++) {
    const ch = i18nText[i];
    if (ch === '[') depth++;
    else if (ch === ']') depth--;
  }
  const inner = i18nText.slice(after, i - 1);
  const out = [];
  const re = /\{\s*value:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(inner)) !== null) out.push(m[1]);
  return out;
}

function canonicalLocaleSuffix(locale) {
  return String(locale || '')
    .toUpperCase()
    .replace(/-/g, '_');
}

function loadLocalePackFromFile(localeCode) {
  const fileName = `i18n-${String(localeCode).toLowerCase()}-locale.js`;
  const filePath = path.join(ROOT, 'js', fileName);
  if (!fs.existsSync(filePath)) return { missingFile: true, filePath };
  const code = fs.readFileSync(filePath, 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox, { timeout: 15000 });
  const suffix = canonicalLocaleSuffix(localeCode);
  const globalKey = `__WH_TRANSLATIONS_${suffix}`;
  const pack = sandbox.window[globalKey];
  if (!pack) return { missingGlobal: true, filePath, globalKey };
  return { pack };
}

function shouldTranslateUiString(text) {
  if (text == null) return false;
  const trimmed = String(text).trim();
  if (!trimmed) return false;
  if (!/[A-Za-z\u00C0-\u024F\u1E00-\u1EFF]/.test(trimmed)) return false;
  return true;
}

function collectMissingPaths(baseObj, candidateObj, prefix, outMissing) {
  if (!baseObj || typeof baseObj !== 'object') return;
  Object.keys(baseObj).forEach((k) => {
    const pathKey = prefix ? `${prefix}.${k}` : k;
    const baseVal = baseObj[k];
    const candVal = candidateObj ? candidateObj[k] : undefined;

    if (baseVal && typeof baseVal === 'object' && !Array.isArray(baseVal)) {
      if (candVal && typeof candVal === 'object') {
        collectMissingPaths(baseVal, candVal, pathKey, outMissing);
      } else {
        // Entire subtree missing
        outMissing.push(pathKey);
      }
      return;
    }

    if (typeof baseVal === 'string') {
      if (typeof candVal !== 'string' || !String(candVal).trim()) outMissing.push(pathKey);
      return;
    }

    // Arrays/other leafs: only validate existence.
    if (candVal === undefined) outMissing.push(pathKey);
  });
}

function walkLeafStrings(baseNode, candNode, opts) {
  // opts: { path, identicalCount, eligibleCount, missingCount, excludePrefixes }
  if (typeof baseNode === 'string') {
    if (!opts.eligiblePathsOk) return;
    if (!shouldTranslateUiString(baseNode)) return;
    opts.eligibleCount++;
    const candStr = typeof candNode === 'string' ? candNode : '';
    if (candNode !== baseNode) opts.identicalCount += 0; // keep identicalCount semantics below
    else opts.identicalCount++;
    return;
  }

  if (!baseNode || typeof baseNode !== 'object') return;

  if (Array.isArray(baseNode)) {
    if (!Array.isArray(candNode)) return;
    // Compare string elements by index.
    for (let i = 0; i < baseNode.length; i++) {
      const b = baseNode[i];
      const c = candNode[i];
      if (typeof b === 'string') {
        if (!shouldTranslateUiString(b)) continue;
        opts.eligibleCount++;
        if (c === b) opts.identicalCount++;
      }
    }
    return;
  }

  Object.keys(baseNode).forEach((k) => {
    const nextBase = baseNode[k];
    const nextCand = candNode ? candNode[k] : undefined;
    const nextPath = opts.path ? `${opts.path}.${k}` : k;
    if (opts.excludePrefixes && opts.excludePrefixes.some((p) => nextPath.startsWith(p))) return;
    walkLeafStrings(nextBase, nextCand, { ...opts, path: nextPath });
  });
}

const langOptions = extractLanguageOptionDefsValues();
const localeCodes = langOptions.filter((v) => v !== 'auto' && v !== 'en');

// Evaluate `i18n.js` in a sandbox with ALL locale pack globals pre-loaded.
// This ensures our "expected" structure matches what the runtime uses (including
// any shell merges for non-manual locales).
const sandbox = { window: { WorkHours: {} } };

for (const localeCode of langOptions) {
  if (localeCode === 'auto' || localeCode === 'en') continue;

  const fileName = `i18n-${String(localeCode).toLowerCase()}-locale.js`;
  const filePath = path.join(ROOT, 'js', fileName);
  if (!fs.existsSync(filePath)) continue;

  const code = fs.readFileSync(filePath, 'utf8');
  vm.runInNewContext(code, sandbox, { timeout: 15000 });
}

vm.runInNewContext(i18nText, sandbox, { timeout: 30000 });

const translationsRuntime = sandbox.window.WorkHours && sandbox.window.WorkHours.I18N
  ? sandbox.window.WorkHours.I18N.translations
  : null;

if (!translationsRuntime) {
  console.error('verify-manual-locale-packs-offline: FAILED (could not evaluate i18n.js)');
  process.exit(1);
}

const expectedBase = translationsRuntime.en;

let anyFail = false;
const failures = [];

for (const localeCode of localeCodes) {
  const candidate = translationsRuntime[localeCode];
  if (!candidate) {
    anyFail = true;
    failures.push(`${localeCode}: missing runtime translations[${localeCode}]`);
    continue;
  }

  const missing = [];
  collectMissingPaths(expectedBase, candidate, '', missing);
  const missingCount = missing.length;

  const stats = {
    eligibleCount: 0,
    identicalCount: 0,
    missingCount: 0,
    path: '',
    excludePrefixes: ['help'] // help text can be very long; structure parity is more important than exact lexical equality
  };
  walkLeafStrings(expectedBase, candidate, stats);
  const identicalRatio = stats.eligibleCount ? stats.identicalCount / stats.eligibleCount : 0;

  const likelyUntranslated = missingCount === 0 && identicalRatio >= 0.85;

  if (missingCount !== 0 || likelyUntranslated) {
    anyFail = true;
    failures.push(
      `${localeCode}: missingCount=${missingCount}, identicalRatio=${identicalRatio.toFixed(3)}${likelyUntranslated ? ' (likely untranslated)' : ''}`
    );
  }

  console.log(`${localeCode}: missing=${missingCount}, identicalRatio=${identicalRatio.toFixed(3)}`);
}

if (anyFail) {
  console.error('\nverify-manual-locale-packs-offline: FAILED\n' + failures.map((f) => '- ' + f).join('\n'));
  process.exit(1);
}

console.log('\nverify-manual-locale-packs-offline: OK');

