#!/usr/bin/env node
'use strict';

/**
 * Updates `common.internetStatus.{label,on,off}` across all file-based manual packs.
 *
 * Why:
 * - `js/i18n.js` (translations.en) added new keys for the Theme header internet status tooltip.
 * - File-based manual locale packs must be structurally complete (offline-first parity), so we
 *   patch every `js/i18n-<locale>-locale.js` file.
 *
 * Network usage:
 * - Uses the same public Google Translate endpoint as other generation scripts.
 * - Only translates 3 short strings per locale (so it's lightweight).
 */

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var ROOT = path.join(__dirname, '..');
var jsDir = path.join(ROOT, 'js');
var i18nPath = path.join(jsDir, 'i18n.js');

var i18nText = fs.readFileSync(i18nPath, 'utf8');

function canonicalSuffix(localeCode) {
  return String(localeCode || '')
    .toUpperCase()
    .replace(/-/g, '_');
}

function translateTargetLang(localeCode) {
  var lc = String(localeCode || '').toLowerCase();
  if (!lc) return 'en';
  if (lc === 'pt-br') return 'pt';
  if (lc === 'zh-cn' || lc === 'zh-tw' || lc === 'zh') return 'zh';
  return lc.split('-')[0] || 'en';
}

function decodeGoogleTranslatePayload(payload) {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) return null;
  var chunks = payload[0];
  var out = '';
  chunks.forEach(function (part) {
    if (Array.isArray(part) && part[0]) out += String(part[0]);
  });
  return out || null;
}

function delay(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function globLocaleFiles() {
  return fs.readdirSync(jsDir).filter(function (f) {
    return /^i18n-[a-z]{2}(-[a-z]{2})?-locale\.js$/.test(f) || /^i18n-[a-z]{2}-locale\.js$/.test(f) || /^i18n-[a-z]{2,3}(-[a-z]{2})?-locale\.js$/.test(f);
  });
}

async function translateText(text, targetLang) {
  var DESCRIPTION_TRANSLATE_ENDPOINT = 'https://translate.googleapis.com/translate_a/single';
  var url =
    DESCRIPTION_TRANSLATE_ENDPOINT +
    '?client=gtx&sl=auto&tl=' + encodeURIComponent(targetLang) +
    '&dt=t&q=' + encodeURIComponent(text);

  var res = await fetch(url);
  if (!res || !res.ok) throw new Error('translation_http_' + (res ? res.status : 'unknown'));
  var payload = await res.json();
  var translated = decodeGoogleTranslatePayload(payload);
  return translated || text;
}

(async function main() {
  // Extract new source strings from translations.en.
  var sandbox = { window: { WorkHours: {} } };
  vm.runInNewContext(i18nText, sandbox, { timeout: 30000 });
  var W = sandbox.window.WorkHours;
  if (!W || !W.I18N || !W.I18N.translations || !W.I18N.translations.en) {
    throw new Error('Could not evaluate translations.en from js/i18n.js');
  }
  var status = W.I18N.translations.en.common && W.I18N.translations.en.common.internetStatus;
  if (!status) throw new Error('Missing translations.en.common.internetStatus in js/i18n.js');

  var srcLabel = status.label;
  var srcOn = status.on;
  var srcOff = status.off;

  var cache = {};
  function keyFor(text, targetLang) { return targetLang + '||' + text; }

  var localeFiles = globLocaleFiles();
  // Exclude the runtime i18n itself.
  localeFiles = localeFiles.filter(function (f) { return f !== 'i18n.js'; });

  // Sequentialize to reduce risk of rate limiting.
  for (var i = 0; i < localeFiles.length; i++) {
    var file = localeFiles[i];
    var match = /^i18n-(.+)-locale\.js$/i.exec(file);
    if (!match) continue;
    var fileBase = match[1];
    var localeCode =
      fileBase.toLowerCase() === 'pt-br' ? 'pt-BR' : fileBase.toLowerCase() === 'zh' ? 'zh' : fileBase;

    var suffix = canonicalSuffix(localeCode);
    var globalKey = '__WH_TRANSLATIONS_' + suffix;
    var filePath = path.join(jsDir, file);
    var code = fs.readFileSync(filePath, 'utf8');

    var packSandbox = { window: {} };
    vm.runInNewContext(code, packSandbox, { timeout: 15000 });
    var pack = packSandbox.window[globalKey];
    if (!pack) {
      console.warn('[skip] missing ' + globalKey + ' in ' + file);
      continue;
    }

    var targetLang = translateTargetLang(localeCode);
    cache[targetLang] = cache[targetLang] || {};

    async function tr(text, kind) {
      var k = keyFor(text, targetLang);
      if (cache[k]) return cache[k];
      if (!cache[targetLang]) cache[targetLang] = {};
      var out = await translateText(text, targetLang);
      cache[k] = out;
      return out;
    }

    // Translate only 3 short strings.
    var outLabel = await tr(srcLabel);
    var outOn = await tr(srcOn);
    var outOff = await tr(srcOff);

    if (!pack.common) pack.common = {};
    if (!pack.common.internetStatus) pack.common.internetStatus = {};
    pack.common.internetStatus.label = outLabel;
    pack.common.internetStatus.on = outOn;
    pack.common.internetStatus.off = outOff;

    // Preserve first header line for readability.
    var lines = code.split(/\r?\n/);
    var header = lines[0] && lines[0].indexOf('/**') === 0 ? lines[0] : '/** Manual locale pack */';
    var js =
      header +
      '\nwindow.__WH_TRANSLATIONS_' +
      suffix +
      ' = ' +
      JSON.stringify(pack, null, 2) +
      ';\n';
    fs.writeFileSync(filePath, js);

    console.log('[patched] ' + file + ' (' + localeCode + ')');
    if (i % 8 === 0 && i !== 0) await delay(250);
  }

  console.log('update-internet-status-i18n-keys: OK');
})().catch(function (e) {
  console.error('update-internet-status-i18n-keys: FAILED', e);
  process.exit(1);
});

