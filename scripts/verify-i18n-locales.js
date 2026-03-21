#!/usr/bin/env node
/**
 * Verifies that every language in LANGUAGE_OPTION_DEFS (except auto/en) is listed
 * as a file-based full manual pack locale.
 *
 * Run: npm run verify:i18n
 * Source of truth: js/i18n.js
 */
'use strict';

var fs = require('fs');
var path = require('path');

var i18nPath = path.join(__dirname, '..', 'js', 'i18n.js');
var text = fs.readFileSync(i18nPath, 'utf8');

function extractManualFilePackCodes() {
  var needle = 'var MANUAL_FILE_PACK_LOCALE_CODES = [';
  var start = text.indexOf(needle);
  if (start === -1) throw new Error('Could not find MANUAL_FILE_PACK_LOCALE_CODES');
  start += needle.length;
  var depth = 1;
  var i = start;
  while (i < text.length && depth > 0) {
    var ch = text[i];
    if (ch === '[') depth++;
    else if (ch === ']') depth--;
    i++;
  }
  var inner = text.slice(start, i - 1);
  var out = [];
  var re = /'([^']+)'/g;
  var m;
  while ((m = re.exec(inner)) !== null) out.push(m[1]);
  return out;
}

function extractLanguageOptionValues() {
  var needle = 'var LANGUAGE_OPTION_DEFS = [';
  var start = text.indexOf(needle);
  if (start === -1) throw new Error('Could not find LANGUAGE_OPTION_DEFS');
  start += needle.length;
  var depth = 1;
  var i = start;
  while (i < text.length && depth > 0) {
    var ch = text[i];
    if (ch === '[') depth++;
    else if (ch === ']') depth--;
    i++;
  }
  var inner = text.slice(start, i - 1);
  var out = [];
  var re = /\{\s*value:\s*'([^']+)'/g;
  var m;
  while ((m = re.exec(inner)) !== null) out.push(m[1]);
  return out;
}

function sortUnique(arr) {
  return arr.slice().sort();
}

var manual = sortUnique(extractManualFilePackCodes());
var manualSet = {};
manual.forEach(function (c) {
  manualSet[c] = true;
});

var langValues = extractLanguageOptionValues();
var errors = [];

langValues.forEach(function (v) {
  if (v === 'auto' || v === 'en') return;
  if (!manualSet[v]) {
    errors.push(
      "LANGUAGE_OPTION_DEFS value '" + v + "' must appear in MANUAL_FILE_PACK_LOCALE_CODES (file-based full pack)."
    );
  }
});

manual.forEach(function (c) {
  if (langValues.indexOf(c) === -1) {
    errors.push(
      "MANUAL_FILE_PACK_LOCALE_CODES entry '" + c + "' is missing from LANGUAGE_OPTION_DEFS."
    );
  }
});

if (errors.length) {
  console.error('verify-i18n-locales: FAILED\n');
  errors.forEach(function (e) {
    console.error('- ' + e + '\n');
  });
  process.exit(1);
}

console.log(
  'verify-i18n-locales: OK (' +
    manual.length +
    ' file-based packs; ' +
    langValues.length +
    ' language selector options including auto)'
);
