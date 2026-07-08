#!/usr/bin/env node
/**
 * Removes verified orphaned i18n keys from i18n.js (en) and all manual locale packs.
 * Run: node scripts/remove-dead-i18n-keys.js
 */
'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var ROOT = path.join(__dirname, '..');
var JS_DIR = path.join(ROOT, 'js');

var DEAD_PATHS = [
  'layout.category3',
  'profile.language.rolloutGroup',
  'clockEntry.entryExistsHint',
  'clockEntry.clockInQuick',
  'clockEntry.clockOutQuick',
  'clockEntry.clockInQuickTitle',
  'clockEntry.clockOutQuickTitle',
  'clockEntry.clockInQuickAria',
  'clockEntry.clockOutQuickAria',
  'clockEntry.quickClockHint',
  'filters.overtime',
  'filters.duration',
  'filters.description',
  'filters.options.duration',
  'render.descriptionAria',
  'render.workingHoursLabel',
  'render.breakLabel',
  'common.saving',
  'common.saved',
  'ppt.selectYears',
  'toasts.profilePasswordUpdated'
];

function deletePath(obj, dotPath) {
  var parts = dotPath.split('.');
  var cur = obj;
  for (var i = 0; i < parts.length - 1; i++) {
    if (!cur || typeof cur !== 'object') return false;
    cur = cur[parts[i]];
  }
  if (!cur || typeof cur !== 'object') return false;
  if (!(parts[parts.length - 1] in cur)) return false;
  delete cur[parts[parts.length - 1]];
  return true;
}

function processLocaleFile(filePath) {
  var text = fs.readFileSync(filePath, 'utf8');
  var m = text.match(/^window\.(__WH_TRANSLATIONS_\w+)\s*=\s*[\s\S]*;\s*$/);
  if (!m) throw new Error('Could not parse locale file: ' + filePath);
  var varName = m[1];
  var sandbox = { window: {} };
  vm.runInNewContext(text, sandbox);
  var obj = sandbox.window[varName];
  if (!obj || typeof obj !== 'object') throw new Error('Could not load locale object: ' + filePath);
  var removed = 0;
  DEAD_PATHS.forEach(function (p) {
    if (deletePath(obj, p)) removed++;
  });
  var out = 'window.' + varName + ' = ' + JSON.stringify(obj, null, 2) + ';\n';
  fs.writeFileSync(filePath, out, 'utf8');
  return removed;
}

function processI18nJs() {
  var filePath = path.join(JS_DIR, 'i18n.js');
  var text = fs.readFileSync(filePath, 'utf8');

  // Remove seed line for profilePasswordUpdated
  text = text.replace(
    /\n        profilePasswordUpdated: enToasts\.profilePasswordUpdated \|\| 'Profile password updated\.'/
    , ''
  );

  var blocks = [
    ["        category3: '3. Calendar & statistics'\n", ''],
    [
      "          rolloutGroup: {\n            g3: 'G3',\n            g5: 'G5',\n            g10: 'G10',\n            g20: 'G20',\n            all: 'All'\n          }\n",
      ''
    ],
    ["        entryExistsHint: 'An entry already exists for {date}. Saving will update it.',\n", ''],
    ["        clockInQuick: 'Clock In',\n        clockOutQuick: 'Clock Out',\n        clockInQuickTitle: 'Clock in now and fill the form with the current time.',\n        clockOutQuickTitle: 'Set clock out to the current time and fill the form.',\n        clockInQuickAria: 'Clock in now',\n        clockOutQuickAria: 'Clock out now',\n        quickClockHint: 'Fills the form with the current time. Adjust if needed, then save.',\n", ''],
    ["        overtime: 'Overtime',\n        duration: 'Duration',\n        description: 'Description',\n", ''],
    [
      "          duration: {\n            'has-duration': 'Has duration',\n            'no-duration': 'No duration'\n          },\n",
      ''
    ],
    ["        descriptionAria: 'Description',\n", ''],
    ["        workingHoursLabel: 'Working hours',\n", ''],
    ["        breakLabel: 'Break',\n", ''],
    ["        saving: 'Saving…',\n        saved: 'Saved',\n", ''],
    ["        selectYears: 'Select years...',\n", ''],
    ["        profilePasswordUpdated: 'Profile password updated.'\n", '']
  ];

  blocks.forEach(function (pair) {
    if (!text.includes(pair[0])) {
      console.warn('WARN: block not found in i18n.js:', pair[0].slice(0, 40).replace(/\n/g, ' '));
    } else {
      text = text.replace(pair[0], pair[1]);
    }
  });

  fs.writeFileSync(filePath, text, 'utf8');
}

processI18nJs();

var localeFiles = fs.readdirSync(JS_DIR).filter(function (f) {
  return /^i18n-.+-locale\.js$/.test(f);
});

var totalRemoved = 0;
localeFiles.forEach(function (f) {
  var n = processLocaleFile(path.join(JS_DIR, f));
  totalRemoved += n;
  console.log(f + ': removed ' + n + ' key paths');
});

console.log('Done. Locale files processed:', localeFiles.length, 'total paths removed:', totalRemoved);
