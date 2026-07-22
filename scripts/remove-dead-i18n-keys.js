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
  'toasts.profilePasswordUpdated',
  'infographic.sectionSummaryTotals',
  'infographic.sectionVacationDays',
  'infographic.descSummaryTotals',
  'infographic.descVacationDays',
  'infographic.descVacationByWeekday',
  'infographic.descTotalWorkByWeekday',
  'infographic.descAvgWorkByWeekday',
  'infographic.descTotalOvertimeByWeekday',
  'infographic.descAvgOvertimeByWeekday',
  'infographic.csv.metricMinutesValue',
  'modals.voiceReview.retake.text',
  'modals.help.title',
  'modals.statsSummaryModal.fullScreen',
  'modals.statsSummaryModal.downloadImage',
  'modals.statsSummaryEnlargeModal.downloadImage',
  'profileAuth.passwordPrompt',
  'profileAuth.saveAction',
  'profileAuth.passwordRequired'
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

function replaceOnce(text, needle, replacement, label) {
  if (!text.includes(needle)) {
    console.warn('WARN: block not found in i18n.js:', label || needle.slice(0, 50).replace(/\n/g, ' '));
    return text;
  }
  return text.replace(needle, replacement);
}

function processI18nJs() {
  var filePath = path.join(JS_DIR, 'i18n.js');
  var text = fs.readFileSync(filePath, 'utf8');

  var blocks = [
    ["        category3: '3. Calendar & statistics'\n", '', 'layout.category3'],
    [
      "          rolloutGroup: {\n            g3: 'G3',\n            g5: 'G5',\n            g10: 'G10',\n            g20: 'G20',\n            all: 'All'\n          }\n",
      '',
      'profile.language.rolloutGroup'
    ],
    ["        entryExistsHint: 'An entry already exists for {date}. Saving will update it.',\n", '', 'clockEntry.entryExistsHint'],
    [
      "        clockInQuick: 'Clock In',\n        clockOutQuick: 'Clock Out',\n        clockInQuickTitle: 'Clock in now and fill the form with the current time.',\n        clockOutQuickTitle: 'Set clock out to the current time and fill the form.',\n        clockInQuickAria: 'Clock in now',\n        clockOutQuickAria: 'Clock out now',\n        quickClockHint: 'Fills the form with the current time. Adjust if needed, then save.',\n",
      '',
      'clockEntry.clockInQuick*'
    ],
    [
      "        overtime: 'Overtime',\n        duration: 'Duration',\n        description: 'Description',\n        options: {\n          duration: {\n            'has-duration': 'Has duration',\n            'no-duration': 'No duration'\n          },\n",
      "        options: {\n",
      'filters.overtime/duration/description + options.duration'
    ],
    [
      "      render: {\n        selectRowAria: 'Select row',\n        descriptionAria: 'Description',\n        noDescriptionAria: 'No description',\n",
      "      render: {\n        selectRowAria: 'Select row',\n        noDescriptionAria: 'No description',\n",
      'render.descriptionAria'
    ],
    [
      "        dateLabel: 'Date',\n        workingHoursLabel: 'Working hours',\n        breakLabel: 'Break',\n        overtimeLabel: 'Overtime',\n",
      "        dateLabel: 'Date',\n        overtimeLabel: 'Overtime',\n",
      'render.workingHoursLabel + render.breakLabel'
    ],
    [
      "      common: {\n        all: 'All',\n        saving: 'Saving…',\n        saved: 'Saved',\n        profileLabel: 'profile',\n",
      "      common: {\n        all: 'All',\n        profileLabel: 'profile',\n",
      'common.saving + common.saved'
    ],
    ["        selectYears: 'Select years...',\n", '', 'ppt.selectYears'],
    [
      "        currentPasswordIncorrect: 'Current password is incorrect.',\n        profilePasswordUpdated: 'Profile password updated.'\n",
      "        currentPasswordIncorrect: 'Current password is incorrect.'\n",
      'toasts.profilePasswordUpdated'
    ],
    ["        sectionSummaryTotals: 'Summary totals',\n", '', 'infographic.sectionSummaryTotals'],
    ["        sectionVacationDays: 'Vacation days',\n", '', 'infographic.sectionVacationDays'],
    ["        descSummaryTotals: 'Aggregated from entries matching the current filters (year, month, week, day, status, location).',\n", '', 'infographic.descSummaryTotals'],
    ["        descVacationDays: 'Quota (allowed per year) vs used (entries with status Vacation).',\n", '', 'infographic.descVacationDays'],
    ["        descVacationByWeekday: 'Number of vacation days used per weekday per year (status Vacation, weekdays only).',\n", '', 'infographic.descVacationByWeekday'],
    ["        descTotalWorkByWeekday: 'Sum of working hours per weekday per year (status Work only).',\n", '', 'infographic.descTotalWorkByWeekday'],
    ["        descAvgWorkByWeekday: 'Average working hours per work day, per weekday per year (status Work only).',\n", '', 'infographic.descAvgWorkByWeekday'],
    ["        descTotalOvertimeByWeekday: 'Sum of overtime per weekday per year (status Work only).',\n", '', 'infographic.descTotalOvertimeByWeekday'],
    ["        descAvgOvertimeByWeekday: 'Average overtime per work day, per weekday per year (status Work only).',\n", '', 'infographic.descAvgOvertimeByWeekday'],
    [
      "        csv: {\n          minutesSuffix: 'minutes',\n          metricMinutesValue: '{day} (minutes)'\n        },\n",
      "        csv: {\n          minutesSuffix: 'minutes'\n        },\n",
      'infographic.csv.metricMinutesValue'
    ],
    [
      "          retake: {\n            text: 'Voice entry',\n            title: 'Listen again and replace with new voice input',\n            aria: 'Retake voice'\n          },\n",
      "          retake: {\n            title: 'Listen again and replace with new voice input',\n            aria: 'Retake voice'\n          },\n",
      'modals.voiceReview.retake.text'
    ],
    [
      "        help: {\n          title: 'Help',\n          closeAria: 'Close help'\n        },\n",
      "        help: {\n          closeAria: 'Close help'\n        },\n",
      'modals.help.title'
    ],
    ["          fullScreen: 'Full screen',\n          downloadImage: 'Download image',\n", '', 'modals.statsSummaryModal.fullScreen/downloadImage'],
    [
      "        statsSummaryEnlargeModal: {\n          title: 'Chart',\n          downloadImage: 'Download image',\n          close: 'Close',\n",
      "        statsSummaryEnlargeModal: {\n          title: 'Chart',\n          close: 'Close',\n",
      'modals.statsSummaryEnlargeModal.downloadImage'
    ],
    ["        passwordPrompt: 'Enter password for profile \"{profile}\"',\n", '', 'profileAuth.passwordPrompt'],
    ["        saveAction: 'Save password',\n", '', 'profileAuth.saveAction'],
    ["        passwordRequired: 'Password cannot be empty.',\n", '', 'profileAuth.passwordRequired'],
    // Seed maps for dead profileAuth / toast keys
    ["        passwordPrompt: enProfileAuth.passwordPrompt || 'Enter password for profile \"{profile}\"',\n", '', 'seed passwordPrompt'],
    ["        saveAction: enProfileAuth.saveAction || 'Save password',\n", '', 'seed saveAction'],
    ["        passwordRequired: enProfileAuth.passwordRequired || 'Password cannot be empty.',\n", '', 'seed passwordRequired'],
    [
      "\n        profilePasswordUpdated: enToasts.profilePasswordUpdated || 'Profile password updated.'",
      '',
      'seed profilePasswordUpdated'
    ]
  ];

  blocks.forEach(function (pair) {
    text = replaceOnce(text, pair[0], pair[1], pair[2]);
  });

  // Clean trailing commas that may remain after removals in object literals
  text = text.replace(/,(\s*\n\s*\})/g, '$1');

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
