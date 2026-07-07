#!/usr/bin/env node
/**
 * Keeps sync.autoSave* strings aligned with sync.saving / sync.saved in every manual locale file.
 * Also adds toolbar.exportBtnAria / importBtnAria / exportMenuAria / importMenuAria when missing.
 *
 * Run: node scripts/sync-locale-sync-keys.js
 */
'use strict';

var fs = require('fs');
var path = require('path');

var dir = path.join(__dirname, '..', 'js');
var files = fs.readdirSync(dir).filter(function (f) {
  return /^i18n-.+-locale\.js$/.test(f);
});

var DEFAULT_TOOLBAR = {
  exportBtnAria: 'Export data',
  importBtnAria: 'Import from file',
  exportMenuAria: 'Export options',
  importMenuAria: 'Import options'
};

var patched = 0;
files.forEach(function (file) {
  var fp = path.join(dir, file);
  var text = fs.readFileSync(fp, 'utf8');
  var orig = text;
  var savingM = text.match(/"saving":\s*"([^"]*)"/);
  var savedM = text.match(/"saved":\s*"([^"]*)"/);
  var saving = savingM ? savingM[1] : 'Saving…';
  var saved = savedM ? savedM[1] : 'Saved';
  text = text.replace(/"autoSaveSaving":\s*"[^"]*"/, '"autoSaveSaving": ' + JSON.stringify(saving));
  text = text.replace(/"autoSaveSaved":\s*"[^"]*"/, '"autoSaveSaved": ' + JSON.stringify(saved));
  if (!text.includes('exportBtnAria')) {
    text = text.replace(
      /("exportJsonTitle":\s*"[^"]*")(\s*\n\s*\})/,
      '$1,\n    "exportBtnAria": ' + JSON.stringify(DEFAULT_TOOLBAR.exportBtnAria) +
        ',\n    "importBtnAria": ' + JSON.stringify(DEFAULT_TOOLBAR.importBtnAria) +
        ',\n    "exportMenuAria": ' + JSON.stringify(DEFAULT_TOOLBAR.exportMenuAria) +
        ',\n    "importMenuAria": ' + JSON.stringify(DEFAULT_TOOLBAR.importMenuAria) + '$2'
    );
  }
  if (text !== orig) {
    fs.writeFileSync(fp, text);
    patched += 1;
    console.log('patched', file);
  }
});
console.log('done —', patched, 'file(s) updated');
