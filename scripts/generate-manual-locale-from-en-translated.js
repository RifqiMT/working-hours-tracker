#!/usr/bin/env node
'use strict';

/**
 * Generates a "full manual pack" locale file by translating:
 * - translations.en structure
 * - helpEn long-form help
 * using the same Google Translate endpoint the app uses at runtime.
 *
 * Output format:
 *   window.__WH_TRANSLATIONS_<LANG_UPPER> = { ...translated translations.en..., help: { ...translated helpEn... } };
 *
 * Usage:
 *   node scripts/generate-manual-locale-from-en-translated.js --lang=fr --var=FR
 *   node scripts/generate-manual-locale-from-en-translated.js --lang=de --var=DE
 *   node scripts/generate-manual-locale-from-en-translated.js --lang=el --var=EL
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const i18nPath = path.join(__dirname, '..', 'js', 'i18n.js');
const i18nText = fs.readFileSync(i18nPath, 'utf8');
const lines = i18nText.split(/\r?\n/);

function getArg(name) {
  const m = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (!m) return null;
  return m.slice(name.length + 3);
}

const lang = getArg('lang');
const varSuffix = getArg('var'); // used in window.__WH_TRANSLATIONS_<...>
if (!lang || !varSuffix) {
  console.error('Missing required args: --lang and --var');
  process.exit(1);
}

const outPath = path.join(__dirname, '..', 'js', `i18n-${String(lang).toLowerCase()}-locale.js`);

const DESCRIPTION_TRANSLATE_ENDPOINT = 'https://translate.googleapis.com/translate_a/single';

function decodeGoogleTranslatePayload(payload) {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) return null;
  const chunks = payload[0];
  let out = '';
  chunks.forEach((part) => {
    if (Array.isArray(part) && part[0]) out += String(part[0]);
  });
  return out || null;
}

function shouldTranslateUiString(text) {
  if (text == null) return false;
  const trimmed = String(text).trim();
  if (!trimmed) return false;
  if (!/[A-Za-z\u00C0-\u024F\u1E00-\u1EFF]/.test(trimmed)) return false;
  return true;
}

function extractEnTranslationsObject() {
  const start = lines.indexOf('    en: {');
  if (start === -1) throw new Error('en block not found');
  let end = -1;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i] === '    },' && lines[i + 1] && /^\s*id:\s*\{/.test(lines[i + 1])) {
      end = i;
      break;
    }
  }
  if (end === -1) throw new Error('en block end not found');

  const inner = lines.slice(start + 1, end).join('\n');
  return vm.runInNewContext('({' + inner + '})');
}

function extractHelpEnObject() {
  const helpStartLine = lines.findIndex((l) => l.trim() === 'var helpEn = {');
  if (helpStartLine === -1) throw new Error('helpEn start not found');
  let helpEnd = -1;
  for (let i = helpStartLine + 1; i < lines.length; i++) {
    if (lines[i].trim() === '};' && lines[i + 1] && lines[i + 1].trim().startsWith('var helpId')) {
      helpEnd = i;
      break;
    }
  }
  if (helpEnd === -1) throw new Error('helpEn end not found');

  const helpInner = lines.slice(helpStartLine + 1, helpEnd).join('\n');
  return vm.runInNewContext('({' + helpInner + '})');
}

function walkAndCollectStrings(root, outSet) {
  function rec(node) {
    if (typeof node === 'string') {
      if (shouldTranslateUiString(node)) outSet.add(node);
      return;
    }
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(rec);
      return;
    }
    Object.keys(node).forEach((k) => rec(node[k]));
  }
  rec(root);
}

function protectPlaceholders(input) {
  // Protect placeholders so Google Translate won't translate the tokens.
  //  - curly placeholders: {status}, {msg}, {n}, {dur}, etc.
  //  - newlines: preserve \n so UI/help formatting stays intact.
  const s = String(input);
  const placeholders = [];

  let out = s.replace(/\n/g, '__WH_NL__');

  out = out.replace(/\{[^}]+\}/g, (m) => {
    const idx = placeholders.length;
    placeholders.push(m);
    return '__WH_BRACE_' + idx + '__';
  });

  return { text: out, placeholders };
}

function restorePlaceholders(translated, placeholders) {
  let out = String(translated);
  out = out.replace(/__WH_NL__/g, '\n');
  out = out.replace(/__WH_BRACE_(\d+)__/g, (_m, g1) => placeholders[Number(g1)] || _m);
  return out;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateText(text, targetLang, cache, inflight) {
  if (!shouldTranslateUiString(text)) return text;
  if (cache.has(text)) return cache.get(text);
  const key = targetLang + '||' + text;
  if (inflight.has(key)) return inflight.get(key);

  const { text: protectedText, placeholders } = protectPlaceholders(text);
  const url =
    DESCRIPTION_TRANSLATE_ENDPOINT +
    '?client=gtx&sl=auto&tl=' +
    encodeURIComponent(targetLang) +
    '&dt=t&q=' +
    encodeURIComponent(protectedText);

  const p = fetch(url)
    .then((res) => {
      if (!res || !res.ok) throw new Error('translation_http_' + (res ? res.status : 'unknown'));
      return res.json();
    })
    .then((payload) => {
      let translated = decodeGoogleTranslatePayload(payload);
      if (!translated) translated = protectedText;
      translated = restorePlaceholders(translated, placeholders);
      cache.set(text, translated);
      return translated;
    })
    .catch(() => {
      cache.set(text, text);
      return text;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, p);
  return p;
}

async function main() {
  const enTranslations = extractEnTranslationsObject();
  const helpEn = extractHelpEnObject();

  const uniqueStrings = new Set();
  walkAndCollectStrings(enTranslations, uniqueStrings);
  walkAndCollectStrings(helpEn, uniqueStrings);

  console.log('[' + lang + '] unique translatable strings:', uniqueStrings.size);

  // Disk cache is optional. Default is OFF to avoid committing stale translation caches.
  // Enable explicitly during generation:
  //   node ... --lang=fr --var=FR --use-cache
  //   node ... --lang=fr --var=FR --cache-file=path/to/cache.json
  const cacheFileArg = getArg('cache-file');
  const useDiskCache = process.argv.indexOf('--use-cache') !== -1 || !!cacheFileArg;

  const cachePath = cacheFileArg
    ? String(cacheFileArg)
    : path.join(__dirname, '.i18n-translate-cache.json');

  let diskCache = {};
  if (useDiskCache) {
    try {
      diskCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } catch (_) {}
  }

  if (!diskCache[lang]) diskCache[lang] = {};
  const langCache = diskCache[lang];
  const cache = new Map(Object.entries(langCache));
  const inflight = new Map();

  // Translate deterministically in insertion order.
  const translatedMap = new Map();
  const arr = Array.from(uniqueStrings);
  for (let i = 0; i < arr.length; i++) {
    const src = arr[i];
    const translated = await translateText(src, lang, cache, inflight);
    translatedMap.set(src, translated);

    // Small delay to reduce rate-limit likelihood.
    if (i % 10 === 0 && i !== 0) {
      await delay(200);
    }
  }

  // Persist cache to disk (only when explicitly enabled).
  if (useDiskCache) {
    try {
      diskCache[lang] = {};
      for (const [k, v] of cache.entries()) diskCache[lang][k] = v;
      fs.writeFileSync(cachePath, JSON.stringify(diskCache, null, 2));
    } catch (_) {}
  }

  function deepTranslate(node) {
    if (typeof node === 'string') {
      if (!shouldTranslateUiString(node)) return node;
      return translatedMap.has(node) ? translatedMap.get(node) : node;
    }
    if (!node || typeof node !== 'object') return node;
    if (Array.isArray(node)) return node.map(deepTranslate);
    const out = {};
    Object.keys(node).forEach((k) => {
      out[k] = deepTranslate(node[k]);
    });
    return out;
  }

  const translatedTranslations = deepTranslate(enTranslations);
  const translatedHelp = deepTranslate(helpEn);

  // Put help inside the locale pack so i18n.js can clone it directly.
  const finalPack = Object.assign({}, translatedTranslations, { help: translatedHelp });

  const header =
    '/** Full manual ' +
    String(lang).toUpperCase() +
    ' UI pack (generated from en + helpEn via Google Translate). Load before `i18n.js`. */\n';

  const js = header + 'window.__WH_TRANSLATIONS_' + varSuffix + ' = ' + JSON.stringify(finalPack, null, 2) + ';\n';

  fs.writeFileSync(outPath, js);
  console.log('[' + lang + '] wrote:', outPath);
}

main().catch((e) => {
  console.error('Generation failed for ' + lang + ':', e);
  process.exit(1);
});

