#!/usr/bin/env node
/**
 * Inserts statsSummary detail + statsSummaryModal category keys into manual locale packs.
 * Run: node scripts/patch-stats-summary-details-i18n.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', 'js');

const STATS_BLOCK = `
        "datasetWfo": "Office (WFO)",
        "datasetWfh": "Home (WFH)",
        "detailTotalWorkTitle": "Total working hours (WFO & WFH)",
        "detailAvgWorkTitle": "Average working hours per day (WFO & WFH)",
        "detailTotalOvertimeTitle": "Total overtime (WFO & WFH)",
        "detailAvgOvertimeTitle": "Average overtime per day (WFO & WFH)",
        "fullscreenDetailTotalWork": "Total working hours by location (WFO vs WFH)",
        "fullscreenDetailAvgWork": "Average working hours by location (WFO vs WFH)",
        "fullscreenDetailTotalOvertime": "Total overtime by location (WFO vs WFH)",
        "fullscreenDetailAvgOvertime": "Average overtime by location (WFO vs WFH)",`;

const MODAL_BLOCK = `
          "categoryGeneral": "General",
          "categoryDetails": "Details",
          "categoryGeneralTooltip": "Overview charts: total and average hours and overtime by period",
          "categoryDetailsTooltip": "Line charts: WFO vs WFH over time for totals and averages",`;

function patchStatsSummary(text) {
  const re = /("fullscreenLineAvgOvertime":\s*"[^"]*",)(\s*\n\s*"box":)/;
  if (!re.test(text)) return { text, ok: false };
  return { text: text.replace(re, '$1' + STATS_BLOCK + '$2'), ok: true };
}

function patchModal(text) {
  const re = /("downloadImageTooltip":\s*"[^"]*",)(\s*\n\s*"close":)/;
  if (!re.test(text)) return { text, ok: false };
  return { text: text.replace(re, '$1' + MODAL_BLOCK + '$2'), ok: true };
}

function patchDescription(text) {
  const re = /(\s*"statsSummaryModal"\s*:\s*\{[\s\S]*?"description"\s*:\s*)"[^"]*"/;
  const newDesc =
    'Charts use all work entries with WFO or WFH. In Details, only office and home days are split; other locations are omitted from the breakdown. Choose a category and period view.';
  if (!re.test(text)) return { text, ok: false };
  return { text: text.replace(re, '$1"' + newDesc.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'), ok: true };
}

const files = [
  'i18n-id-locale.js',
  'i18n-af-locale.js',
  'i18n-ar-locale.js',
  'i18n-pt-br-locale.js',
  'i18n-zh-locale.js',
  'i18n-cs-locale.js',
  'i18n-da-locale.js',
  'i18n-nl-locale.js',
  'i18n-fi-locale.js',
  'i18n-it-locale.js',
  'i18n-de-locale.js',
  'i18n-fr-locale.js',
  'i18n-el-locale.js',
  'i18n-hi-locale.js',
  'i18n-ja-locale.js',
  'i18n-ko-locale.js',
  'i18n-no-locale.js',
  'i18n-pl-locale.js',
  'i18n-pt-locale.js',
  'i18n-ru-locale.js',
  'i18n-es-locale.js',
  'i18n-sv-locale.js',
  'i18n-tr-locale.js',
  'i18n-uk-locale.js'
];

let n = 0;
for (const f of files) {
  const p = path.join(ROOT, f);
  let t = fs.readFileSync(p, 'utf8');
  const a = patchStatsSummary(t);
  const b = patchModal(a.text);
  const c = patchDescription(b.text);
  if (!a.ok || !b.ok || !c.ok) {
    console.error('FAILED', f, { stats: a.ok, modal: b.ok, desc: c.ok });
    process.exit(1);
  }
  fs.writeFileSync(p, c.text, 'utf8');
  n++;
  console.log('Patched', f);
}
console.log('Done', n);
