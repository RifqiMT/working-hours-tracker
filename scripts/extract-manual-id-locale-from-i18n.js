#!/usr/bin/env node
'use strict';

/**
 * Indonesian (`id`) is maintained only in `js/i18n-id-locale.js` (full manual pack).
 * It is no longer embedded in `js/i18n.js`; edit that file directly.
 *
 * Historical note: this script used to copy `translations.id` out of i18n.js.
 */

console.log(
  'Indonesian UI/help: edit js/i18n-id-locale.js (window.__WH_TRANSLATIONS_ID). ' +
    'No extraction from i18n.js is needed.'
);
process.exit(0);
