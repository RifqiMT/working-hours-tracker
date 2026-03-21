#!/usr/bin/env node
'use strict';

/**
 * Standardize formatting for existing offline "full manual pack" locale files.
 *
 * Some locale files were produced with older templates (different indentation/quotes),
 * which makes them look "non-standard" (different line counts) even when their
 * translated structure is complete.
 *
 * This script:
 * - Loads the existing `window.__WH_TRANSLATIONS_<SUFFIX>` object from each locale file
 * - Rewrites the file using a consistent JSON.stringify(indent=2) format
 * - Preserves the pack content exactly (no re-translation / no network)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const jsDir = path.join(ROOT, 'js');

function getArg(name) {
  var prefix = '--' + name + '=';
  for (var i = 0; i < process.argv.length; i++) {
    var a = process.argv[i];
    if (a.indexOf(prefix) === 0) return a.slice(prefix.length);
  }
  return null;
}

function parseLocalesFromArg() {
  var raw = getArg('locales');
  if (!raw) return null;
  return raw
    .split(',')
    .map(function (s) { return String(s).trim(); })
    .filter(Boolean);
}

function defaultLocales() {
  // Standardize every file-based manual pack (i18n-*-locale.js).
  // This includes `id` because it is now also a dedicated file-based pack.
  var files = fs.readdirSync(jsDir);
  var out = [];
  files.forEach(function (f) {
    var m = /^i18n-(.+)-locale\.js$/i.exec(f);
    if (!m) return;
    out.push(m[1]);
  });
  return out;
}

var localesToStandardize = parseLocalesFromArg() || defaultLocales();

function canonicalSuffix(localeCode) {
  return String(localeCode || '')
    .toUpperCase()
    .replace(/-/g, '_');
}

function loadPackFromLocaleFile(localeCode) {
  const filePath = path.join(jsDir, `i18n-${String(localeCode).toLowerCase()}-locale.js`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing locale file: ${filePath}`);
  }
  const code = fs.readFileSync(filePath, 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox, { timeout: 15000 });
  const suffix = canonicalSuffix(localeCode);
  const globalKey = `__WH_TRANSLATIONS_${suffix}`;
  const pack = sandbox.window[globalKey];
  if (!pack) throw new Error(`Missing ${globalKey} in ${filePath}`);
  return { filePath, pack };
}

for (const localeCode of localesToStandardize) {
  const { filePath, pack } = loadPackFromLocaleFile(localeCode);
  const suffix = canonicalSuffix(localeCode);
  const header =
    `/** Full manual ${suffix} UI pack (standardized formatting; content preserved). ` +
    'Load before `i18n.js`. */\n';

  const out =
    header +
    `window.__WH_TRANSLATIONS_${suffix} = ` +
    `${JSON.stringify(pack, null, 2)};\n`;

  fs.writeFileSync(filePath, out);
  console.log('Standardized:', path.basename(filePath));
}

console.log('Done.');

