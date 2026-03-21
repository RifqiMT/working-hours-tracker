#!/usr/bin/env node
/**
 * Applies fully translated stats summary strings (statsSummary detail keys +
 * modals.statsSummaryModal description + category labels/tooltips) to all manual locale packs.
 * Run from repo root: node scripts/apply-stats-summary-translations.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'js');
const DATA = path.join(__dirname, 'stats-summary-translations.json');
const T = JSON.parse(fs.readFileSync(DATA, 'utf8'));

function buildStatsBlock(row) {
  const keys = [
    'datasetWfo',
    'datasetWfh',
    'detailTotalWorkTitle',
    'detailAvgWorkTitle',
    'detailTotalOvertimeTitle',
    'detailAvgOvertimeTitle',
    'fullscreenDetailTotalWork',
    'fullscreenDetailAvgWork',
    'fullscreenDetailTotalOvertime',
    'fullscreenDetailAvgOvertime'
  ];
  return (
    keys
      .map(function (k) {
        return '        "' + k + '": ' + JSON.stringify(row[k]) + ',';
      })
      .join('\n') + '\n'
  );
}

function buildCategoryBlock(row) {
  return (
    '          "categoryGeneral": ' +
    JSON.stringify(row.categoryGeneral) +
    ',\n          "categoryDetails": ' +
    JSON.stringify(row.categoryDetails) +
    ',\n          "categoryGeneralTooltip": ' +
    JSON.stringify(row.categoryGeneralTooltip) +
    ',\n          "categoryDetailsTooltip": ' +
    JSON.stringify(row.categoryDetailsTooltip) +
    ',\n'
  );
}

function patchFile(filePath, langKey) {
  const row = T[langKey];
  if (!row) {
    console.warn('skip unknown lang', langKey);
    return false;
  }
  let s = fs.readFileSync(filePath, 'utf8');

  const statsRe = /\n        "datasetWfo":[\s\S]*?\n    "box":/;
  if (!statsRe.test(s)) {
    console.warn('stats block not found', path.basename(filePath));
    return false;
  }
  s = s.replace(statsRe, '\n' + buildStatsBlock(row) + '    "box":');

  const catRe = /\n          "categoryGeneral":[^\n]+\n          "categoryDetails":[^\n]+\n          "categoryGeneralTooltip":[^\n]+\n          "categoryDetailsTooltip":[^\n]+\n/;
  if (!catRe.test(s)) {
    console.warn('category block not found', path.basename(filePath));
    return false;
  }
  s = s.replace(catRe, '\n' + buildCategoryBlock(row));

  var descOk = false;
  s = s.replace(
    /"statsSummaryModal"\s*:\s*\{([\s\S]*?)\n    \},\n    "statsSummaryEnlargeModal"/,
    function (_full, body) {
      const nb = body.replace(
        /("description"\s*:\s*)("(?:[^"\\]|\\.)*")/,
        function (_m, pre) {
          descOk = true;
          return pre + JSON.stringify(row.statsSummaryModalDescription);
        }
      );
      return '"statsSummaryModal": {' + nb + '\n    },\n    "statsSummaryEnlargeModal"';
    }
  );
  if (!descOk) {
    console.warn('description not patched', path.basename(filePath));
    return false;
  }

  fs.writeFileSync(filePath, s);
  return true;
}

const files = fs.readdirSync(ROOT).filter(function (f) {
  return /^i18n-.+-locale\.js$/.test(f);
});

let ok = 0;
for (const f of files) {
  const stem = f.replace(/^i18n-/, '').replace(/-locale\.js$/, '');
  const useKey = stem.replace(/-/g, '_');
  if (!T[useKey]) {
    console.warn('no translations for', f, 'key', useKey);
    continue;
  }
  if (patchFile(path.join(ROOT, f), useKey)) ok++;
}
console.log('apply-stats-summary-translations:', ok, '/', files.length);
process.exit(ok === files.length ? 0 : 1);
