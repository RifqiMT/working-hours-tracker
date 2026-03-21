#!/usr/bin/env node
'use strict';

/**
 * Quick QA guardrail for i18n/manual packs.
 *
 * Runs fast, offline structural checks + basic syntax checks so changes to
 * i18n/manual-pack logic do not silently regress.
 */

var execSync = require('child_process').execSync;

function run(cmd) {
  console.log('\n> ' + cmd);
  execSync(cmd, { stdio: 'inherit' });
}

// From repo root (working-hours-tracker/)
run('node scripts/verify-manual-locale-packs-offline.js');
run('node scripts/verify-i18n-locales.js');

// Syntax guardrails (fast JS parse).
run('node --check js/i18n.js');
run('node --check js/profile.js');
run('node --check js/render.js');

console.log('\nqa:i18n:quick: OK');

