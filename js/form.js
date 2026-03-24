/**
 * Add/save entry form.
 * Depends: entries, time, constants, render.
 */
(function (W) {
  'use strict';
  W.getEntryFormValues = function getEntryFormValues() {
    var clockIn = document.getElementById('entryClockIn').value;
    var clockOut = document.getElementById('entryClockOut').value;
    var breakVal = Number(document.getElementById('entryBreak').value) || 0;
    var breakUnit = document.getElementById('entryBreakUnit').value;
    var location = document.getElementById('entryLocation').value;
    const dayStatus = document.getElementById('entryStatus').value;
    if (dayStatus !== 'work') {
      clockIn = W.NON_WORK_DEFAULTS.clockIn;
      clockOut = W.NON_WORK_DEFAULTS.clockOut;
      breakVal = 1;
      breakUnit = 'hours';
      location = W.NON_WORK_DEFAULTS.location;
    } else if (location !== 'WFO' && location !== 'WFH') {
      location = 'WFO';
    }
    return {
      date: document.getElementById('entryDate').value,
      clockIn: clockIn,
      clockOut: clockOut,
      breakMinutes: W.parseBreakToMinutes(breakVal, breakUnit),
      dayStatus: dayStatus,
      location: location,
      description: (document.getElementById('entryDescription') && document.getElementById('entryDescription').value) || '',
      timezone: (document.getElementById('entryTimezone') && document.getElementById('entryTimezone').value) || W.DEFAULT_TIMEZONE
    };
  };
  var NON_WORK_STATUSES = ['sick', 'holiday', 'vacation'];

  /** Matches language dropdown + Auto (browser) so entry form strings follow manual packs, not a stale W.currentLanguage. */
  function getActiveUiLanguageForI18n() {
    try {
      var sel = document.getElementById('languageSelect');
      if (sel && sel.value && sel.value !== 'auto') return String(sel.value).trim();
      if (sel && sel.value === 'auto' && W.I18N && typeof W.I18N.getBrowserLanguage === 'function') {
        return W.I18N.getBrowserLanguage();
      }
    } catch (_) {}
    var cur = W.currentLanguage && String(W.currentLanguage).trim();
    if (cur) return cur;
    if (W.I18N && typeof W.I18N.getBrowserLanguage === 'function') return W.I18N.getBrowserLanguage();
    return 'en';
  }

  function resolveEntryFormString(path) {
    if (!W.I18N || typeof W.I18N.resolve !== 'function') return null;
    var v = W.I18N.resolve(path, getActiveUiLanguageForI18n());
    return typeof v === 'string' && v.length ? v : null;
  }

  /**
   * Size Voice / Save pills so every string from a complete manual locale pack fits (no ellipsis).
   * Uses --wh-entry-btn-min + CSS min(100%, var(...)) so narrow viewports can still shrink.
   */
  function syncClockEntryActionButtonMinWidths() {
    if (!document.getElementById('clockCard')) return;
    var voiceBtn = document.getElementById('voiceEntryBtn');
    var saveBtn = document.getElementById('saveEntry');
    var voiceLabel = voiceBtn && voiceBtn.querySelector('.btn-profile-label');
    var saveLabel = saveBtn && saveBtn.querySelector('.btn-profile-label');
    if (!W.I18N || !W.I18N.translations || !W.I18N.resolve || !voiceBtn || !saveBtn || !voiceLabel || !saveLabel) return;
    var translations = W.I18N.translations;
    var resolve = W.I18N.resolve;
    var isComplete = W.I18N.isManualLanguagePackComplete;
    if (typeof isComplete !== 'function') return;

    var voiceCandidates = [];
    var saveCandidates = [];
    Object.keys(translations).forEach(function (code) {
      if (!isComplete(code)) return;
      var vs = resolve('clockEntry.voiceEntryBtn.text', code);
      var se = resolve('clockEntry.saveEntry', code);
      if (typeof vs === 'string' && vs.trim()) voiceCandidates.push(vs);
      if (typeof se === 'string' && se.trim()) saveCandidates.push(se);
    });

    function measureAndSetMin(btn, label, strings) {
      if (!strings.length) {
        btn.style.removeProperty('--wh-entry-btn-min');
        return;
      }
      var restore = label.textContent;
      var max = 0;
      strings.forEach(function (s) {
        label.textContent = s;
        max = Math.max(max, btn.scrollWidth);
      });
      label.textContent = restore;
      if (max > 0) btn.style.setProperty('--wh-entry-btn-min', Math.ceil(max) + 'px');
      else btn.style.removeProperty('--wh-entry-btn-min');
    }

    measureAndSetMin(voiceBtn, voiceLabel, voiceCandidates);
    measureAndSetMin(saveBtn, saveLabel, saveCandidates);
  }

  /**
   * Entry form, edit modal, and voice review: work → WFO/WFH only (Anywhere disabled); non-work → 09:00–18:00, 1h break, Anywhere; clocks, location, and break disabled.
   */
  W.syncLocationAndTimeFieldsForDayStatus = function syncLocationAndTimeFieldsForDayStatus(cfg) {
    if (!cfg || !cfg.statusEl || !cfg.locationEl) return;
    var status = cfg.statusEl.value;
    var locationEl = cfg.locationEl;
    var clockInEl = cfg.clockInEl;
    var clockOutEl = cfg.clockOutEl;
    var breakEl = cfg.breakEl;
    var breakUnitEl = cfg.breakUnitEl;
    var optAny = locationEl.querySelector('option[value="Anywhere"]');
    var nonWork = NON_WORK_STATUSES.indexOf(status) !== -1;
    var t = (W.I18N && W.I18N.t) ? W.I18N.t : function (k, subs) {
      if (k === 'form.locationFixedTitle' && subs) return 'Location is fixed to Anywhere for ' + subs.status + ' days.';
      if (k === 'form.locationWorkTitle') return 'Work location: office (WFO) or home (WFH) only.';
      if (k === 'form.clockFixedNonWorkTitle') return 'Clock in (09:00) and clock out (18:00) are fixed for sick, holiday, and vacation days.';
      if (k === 'form.breakFixedNonWorkTitle') return 'Break is fixed to 1 hour for sick, holiday, and vacation days.';
      return k;
    };

    if (nonWork) {
      locationEl.value = 'Anywhere';
      locationEl.disabled = true;
      locationEl.setAttribute('aria-readonly', 'true');
      locationEl.title = t('form.locationFixedTitle', { status: status });
      if (optAny) optAny.disabled = false;
      if (clockInEl) {
        clockInEl.value = W.NON_WORK_DEFAULTS.clockIn;
        clockInEl.disabled = true;
        clockInEl.setAttribute('aria-readonly', 'true');
        clockInEl.title = t('form.clockFixedNonWorkTitle');
      }
      if (clockOutEl) {
        clockOutEl.value = W.NON_WORK_DEFAULTS.clockOut;
        clockOutEl.disabled = true;
        clockOutEl.setAttribute('aria-readonly', 'true');
        clockOutEl.title = t('form.clockFixedNonWorkTitle');
      }
      if (breakEl) {
        breakEl.value = '1';
        breakEl.disabled = true;
        breakEl.setAttribute('aria-readonly', 'true');
        breakEl.title = t('form.breakFixedNonWorkTitle');
      }
      if (breakUnitEl) {
        breakUnitEl.value = 'hours';
        breakUnitEl.disabled = true;
        breakUnitEl.setAttribute('aria-readonly', 'true');
        breakUnitEl.title = t('form.breakFixedNonWorkTitle');
      }
    } else {
      if (optAny) optAny.disabled = true;
      if (locationEl.value === 'Anywhere' || locationEl.value === 'AW') {
        locationEl.value = 'WFO';
      }
      locationEl.disabled = false;
      locationEl.removeAttribute('aria-readonly');
      locationEl.title = t('form.locationWorkTitle');
      if (clockInEl) {
        clockInEl.disabled = false;
        clockInEl.removeAttribute('aria-readonly');
        clockInEl.removeAttribute('title');
      }
      if (clockOutEl) {
        clockOutEl.disabled = false;
        clockOutEl.removeAttribute('aria-readonly');
        clockOutEl.removeAttribute('title');
      }
      if (breakEl) {
        breakEl.disabled = false;
        breakEl.removeAttribute('aria-readonly');
        breakEl.removeAttribute('title');
      }
      if (breakUnitEl) {
        breakUnitEl.disabled = false;
        breakUnitEl.removeAttribute('aria-readonly');
        breakUnitEl.removeAttribute('title');
      }
    }
  };

  W.syncEntryLocationForStatus = function syncEntryLocationForStatus() {
    var statusEl = document.getElementById('entryStatus');
    var locationEl = document.getElementById('entryLocation');
    if (!statusEl || !locationEl) return;
    W.syncLocationAndTimeFieldsForDayStatus({
      statusEl: statusEl,
      locationEl: locationEl,
      clockInEl: document.getElementById('entryClockIn'),
      clockOutEl: document.getElementById('entryClockOut'),
      breakEl: document.getElementById('entryBreak'),
      breakUnitEl: document.getElementById('entryBreakUnit')
    });
    if (typeof W.syncBreakInputLimits === 'function') {
      W.syncBreakInputLimits('entryBreak', 'entryBreakUnit');
    }
  };

  W.applyNonWorkDefaultsToEntryForm = function applyNonWorkDefaultsToEntryForm() {
    document.getElementById('entryBreak').value = '1';
    document.getElementById('entryBreakUnit').value = 'hours';
    document.getElementById('entryLocation').value = W.NON_WORK_DEFAULTS.location;
    document.getElementById('entryClockIn').value = W.NON_WORK_DEFAULTS.clockIn;
    document.getElementById('entryClockOut').value = W.NON_WORK_DEFAULTS.clockOut;
    W.syncEntryLocationForStatus();
    if (typeof W.syncBreakInputLimits === 'function') W.syncBreakInputLimits('entryBreak', 'entryBreakUnit');
  };


  function normalizeBulkDate(raw) {
    var s = String(raw == null ? '' : raw).trim();
    if (!s) return '';
    var m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) {
      var y = m[1];
      var mo = String(Math.max(1, Math.min(12, parseInt(m[2], 10) || 1))).padStart(2, '0');
      var d = String(Math.max(1, Math.min(31, parseInt(m[3], 10) || 1))).padStart(2, '0');
      return y + '-' + mo + '-' + d;
    }
    return '';
  }

  function normalizeBulkTime(raw, fallback) {
    if (typeof W.normalizeTimeToHHmm === 'function') {
      var t = W.normalizeTimeToHHmm(raw);
      if (t) return t;
      var fb = W.normalizeTimeToHHmm(fallback);
      return fb || fallback || '';
    }
    return String(raw || fallback || '').trim();
  }

  function setBulkStatus(kind, message) {
    var el = document.getElementById('entryBulkStatus');
    if (!el) return;
    el.className = 'entry-bulk-status';
    if (kind === 'success') el.classList.add('is-success');
    else if (kind === 'warning') el.classList.add('is-warning');
    else if (kind === 'error') el.classList.add('is-error');
    el.textContent = message || '';
  }
  function getBulkText(path, subs) {
    var t = (W.I18N && W.I18N.t) ? W.I18N.t : null;
    if (!t) return '';
    return t(path, subs || {});
  }

  W.setBulkEntriesPanelVisible = function setBulkEntriesPanelVisible(visible) {
    var modal = document.getElementById('bulkEntryModal');
    var toggleBtn = document.getElementById('toggleBulkEntriesBtn');
    if (!modal) return;
    var show = !!visible;
    var t = (W.I18N && W.I18N.t) ? W.I18N.t : function (k) { return k; };
    modal.classList.toggle('open', show);
    if (typeof W.setBulkVoiceMenuOpen === 'function') W.setBulkVoiceMenuOpen(false);
    if (show && typeof W.setBulkVoiceMenuOpen === 'function') {
      setTimeout(function () { W.setBulkVoiceMenuOpen(false); }, 0);
    }
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', show ? 'true' : 'false');
      var label = toggleBtn.querySelector('.btn-profile-label');
      if (label) label.textContent = show ? t('clockEntry.bulk.hideButton') : t('clockEntry.bulk.openButton');
      toggleBtn.setAttribute('title', show ? t('clockEntry.bulk.hideTitle') : t('clockEntry.bulk.openTitle'));
      toggleBtn.setAttribute('aria-label', show ? t('clockEntry.bulk.hideAria') : t('clockEntry.bulk.openAria'));
    }
    if (show) {
      if (typeof W.resetBulkEntryRows === 'function') {
        var rowsWrap = document.getElementById('bulkEntryRows');
        if (rowsWrap && rowsWrap.children.length === 0) W.resetBulkEntryRows(false);
      }
      syncBulkEditorUi();
      setBulkStatus('', getBulkText('clockEntry.bulk.tipReview'));
      var firstDate = document.querySelector('#bulkEntryRows .bulk-entry-row.is-active .bulk-entry-row-date');
      if (firstDate) firstDate.focus();
    }
  };

  function mergeAndPersistEntries(incomingEntries) {
    var entries = W.getEntries();
    var merged = (typeof W.mergeProfileEntriesArrays === 'function')
      ? W.mergeProfileEntriesArrays(entries, incomingEntries || [])
      : entries.concat(incomingEntries || []);
    W.setEntries(merged);
    return merged;
  }

  function getBulkTimezoneValue() {
    return (document.getElementById('entryTimezone') && document.getElementById('entryTimezone').value) || W.DEFAULT_TIMEZONE;
  }

  function normalizeStatus(raw) {
    var status = String(raw || 'work').toLowerCase();
    if (['work', 'sick', 'holiday', 'vacation'].indexOf(status) < 0) status = 'work';
    return status;
  }

  function normalizeLocation(raw, status) {
    var location = String(raw || 'WFO');
    if (location.toUpperCase() === 'WFO') location = 'WFO';
    else if (location.toUpperCase() === 'WFH') location = 'WFH';
    else if (location.toUpperCase() === 'AW' || location.toLowerCase() === 'anywhere') location = 'Anywhere';
    if (status !== 'work') return 'Anywhere';
    if (location !== 'WFO' && location !== 'WFH') return 'WFO';
    return location;
  }

  W._bulkActiveIndex = 0;
  function getBulkRows() {
    return Array.prototype.slice.call(document.querySelectorAll('#bulkEntryRows .bulk-entry-row'));
  }
  function syncBulkEditorUi() {
    var rows = getBulkRows();
    if (!rows.length) return;
    if (W._bulkActiveIndex < 0) W._bulkActiveIndex = 0;
    if (W._bulkActiveIndex >= rows.length) W._bulkActiveIndex = rows.length - 1;
    rows.forEach(function (row, i) { row.classList.toggle('is-active', i === W._bulkActiveIndex); });
    var badge = document.getElementById('bulkEntryBatchBadge');
    if (badge) badge.textContent = (W._bulkActiveIndex + 1) + ' / ' + rows.length;
    var prevBtn = document.getElementById('bulkPrevBtn');
    var nextBtn = document.getElementById('bulkNextBtn');
    var removeCurrentBtn = document.getElementById('bulkRemoveCurrentBtn');
    if (prevBtn) prevBtn.disabled = W._bulkActiveIndex <= 0;
    if (nextBtn) nextBtn.disabled = W._bulkActiveIndex >= rows.length - 1;
    if (removeCurrentBtn) removeCurrentBtn.disabled = rows.length <= 1;
  }
  W.setActiveBulkRowIndex = function setActiveBulkRowIndex(index) {
    W._bulkActiveIndex = Number(index) || 0;
    syncBulkEditorUi();
    var activeDate = document.querySelector('#bulkEntryRows .bulk-entry-row.is-active .bulk-entry-row-date');
    if (activeDate) activeDate.focus();
  };

  function applyBulkRowRules(row) {
    if (!row) return;
    var statusEl = row.querySelector('.bulk-entry-row-status');
    var locationEl = row.querySelector('.bulk-entry-row-location');
    if (!statusEl || !locationEl) return;
    if (typeof W.syncLocationAndTimeFieldsForDayStatus === 'function') {
      W.syncLocationAndTimeFieldsForDayStatus({
        statusEl: statusEl,
        locationEl: locationEl,
        clockInEl: row.querySelector('.bulk-entry-row-clockin'),
        clockOutEl: row.querySelector('.bulk-entry-row-clockout'),
        breakEl: row.querySelector('.bulk-entry-row-break'),
        breakUnitEl: row.querySelector('.bulk-entry-row-breakunit')
      });
    }
  }

  function createBulkRowElement(seed) {
    var defaults = seed || W.getEntryFormValues();
    var status = normalizeStatus(defaults.dayStatus);
    var location = normalizeLocation(defaults.location, status);
    var date = normalizeBulkDate(defaults.date);
    var clockIn = normalizeBulkTime(defaults.clockIn, '09:00');
    var clockOut = normalizeBulkTime(defaults.clockOut, '18:00');
    var breakVal = 0;
    var breakUnit = 'minutes';
    if (typeof W.breakMinutesToInputFields === 'function') {
      var b = W.breakMinutesToInputFields(Number(defaults.breakMinutes) || 0);
      breakVal = b.value;
      breakUnit = b.unit;
    }
    var t = (W.I18N && W.I18N.t) ? W.I18N.t : function (k) { return k; };
    var row = document.createElement('div');
    row.className = 'bulk-entry-row';
    row.innerHTML = '' +
      '<div class="bulk-entry-row-grid">' +
        '<div class="bulk-entry-row-field"><label>' + t('clockEntry.dateLabel') + '</label><input type="date" class="bulk-entry-row-date" value="' + (date || '') + '"></div>' +
        '<div class="bulk-entry-row-field"><label>' + t('clockEntry.clockInLabel') + '</label><input type="time" class="bulk-entry-row-clockin" value="' + (clockIn || '') + '"></div>' +
        '<div class="bulk-entry-row-field"><label>' + t('clockEntry.clockOutLabel') + '</label><input type="time" class="bulk-entry-row-clockout" value="' + (clockOut || '') + '"></div>' +
        '<div class="bulk-entry-row-field"><label>' + t('clockEntry.breakLabel') + '</label><div class="bulk-entry-break-inline"><input type="number" min="0" step="any" class="bulk-entry-row-break" value="' + String(breakVal) + '"><select class="bulk-entry-row-breakunit"><option value="minutes">' + t('clockEntry.breakUnitMinutes') + '</option><option value="hours">' + t('clockEntry.breakUnitHours') + '</option></select></div></div>' +
        '<div class="bulk-entry-row-field"><label>' + t('clockEntry.statusLabel') + '</label><select class="bulk-entry-row-status"><option value="work">' + t('status.work') + '</option><option value="sick">' + t('status.sick') + '</option><option value="holiday">' + t('status.holiday') + '</option><option value="vacation">' + t('status.vacation') + '</option></select></div>' +
        '<div class="bulk-entry-row-field"><label>' + t('clockEntry.locationLabel') + '</label><select class="bulk-entry-row-location"><option value="WFO">WFO</option><option value="WFH">WFH</option><option value="Anywhere">' + t('location.anywhere') + '</option></select></div>' +
        '<div class="bulk-entry-row-field"><label>' + t('clockEntry.descriptionLabel') + '</label><textarea class="bulk-entry-row-desc" rows="2" placeholder="' + t('clockEntry.optionalNotesPlaceholder') + '"></textarea></div>' +
      '</div>';
    row.querySelector('.bulk-entry-row-breakunit').value = breakUnit;
    row.querySelector('.bulk-entry-row-status').value = status;
    row.querySelector('.bulk-entry-row-location').value = location;
    row.querySelector('.bulk-entry-row-desc').value = defaults.description || '';
    var statusEl = row.querySelector('.bulk-entry-row-status');
    if (statusEl) statusEl.addEventListener('change', function () { applyBulkRowRules(row); });
    applyBulkRowRules(row);
    return row;
  }

  W.addBulkEntryRow = function addBulkEntryRow(seed) {
    var wrap = document.getElementById('bulkEntryRows');
    if (!wrap) return;
    var row = createBulkRowElement(seed);
    wrap.appendChild(row);
    W._bulkActiveIndex = wrap.children.length - 1;
    syncBulkEditorUi();
  };

  W.removeActiveBulkEntryRow = function removeActiveBulkEntryRow() {
    var rows = getBulkRows();
    if (!rows.length) return;
    if (rows.length === 1) {
      rows[0].querySelector('.bulk-entry-row-date').value = '';
      rows[0].querySelector('.bulk-entry-row-clockin').value = '';
      rows[0].querySelector('.bulk-entry-row-clockout').value = '';
      rows[0].querySelector('.bulk-entry-row-break').value = '0';
      rows[0].querySelector('.bulk-entry-row-breakunit').value = 'minutes';
      rows[0].querySelector('.bulk-entry-row-status').value = 'work';
      rows[0].querySelector('.bulk-entry-row-location').value = 'WFO';
      rows[0].querySelector('.bulk-entry-row-desc').value = '';
      applyBulkRowRules(rows[0]);
      syncBulkEditorUi();
      return;
    }
    rows[W._bulkActiveIndex].remove();
    syncBulkEditorUi();
  };

  W.resetBulkEntryRows = function resetBulkEntryRows(includeExamples) {
    var wrap = document.getElementById('bulkEntryRows');
    if (!wrap) return;
    wrap.innerHTML = '';
    if (includeExamples) {
      var v = W.getEntryFormValues();
      var base = new Date((v.date || new Date().toISOString().slice(0, 10)) + 'T12:00:00');
      function nextDate(offset) { var d = new Date(base); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); }
      W.addBulkEntryRow({ date: nextDate(0), clockIn: v.clockIn || '09:00', clockOut: v.clockOut || '18:00', breakMinutes: 30, dayStatus: 'work', location: v.location || 'WFO', description: v.description || '' });
      W.addBulkEntryRow({ date: nextDate(1), clockIn: '09:00', clockOut: '18:00', breakMinutes: 45, dayStatus: 'work', location: 'WFH', description: '' });
      W.addBulkEntryRow({ date: nextDate(2), clockIn: W.NON_WORK_DEFAULTS.clockIn, clockOut: W.NON_WORK_DEFAULTS.clockOut, breakMinutes: 60, dayStatus: 'holiday', location: 'Anywhere', description: '' });
    } else {
      W.addBulkEntryRow(W.getEntryFormValues());
    }
    W._bulkActiveIndex = 0;
    syncBulkEditorUi();
    setBulkStatus('', '');
  };

  W.populateBulkRowsFromParsedBatch = function populateBulkRowsFromParsedBatch(parsedBatch, options) {
    var wrap = document.getElementById('bulkEntryRows');
    if (!wrap) return { added: 0 };
    var items = Array.isArray(parsedBatch) ? parsedBatch : [];
    var append = !!(options && options.append);
    if (!append) wrap.innerHTML = '';
    var added = 0;
    items.forEach(function (p) {
      if (!p) return;
      var status = normalizeStatus(p.dayStatus || 'work');
      var location = normalizeLocation(p.location || 'WFO', status);
      var breakMin = status !== 'work'
        ? W.parseBreakToMinutes(1, 'hours')
        : W.parseBreakToMinutes((p.breakVal != null ? p.breakVal : 0), p.breakUnit || 'minutes');
      W.addBulkEntryRow({
        date: normalizeBulkDate(p.date),
        clockIn: status !== 'work' ? W.NON_WORK_DEFAULTS.clockIn : normalizeBulkTime(p.clockIn, '09:00'),
        clockOut: status !== 'work' ? W.NON_WORK_DEFAULTS.clockOut : normalizeBulkTime(p.clockOut, '18:00'),
        breakMinutes: breakMin,
        dayStatus: status,
        location: location,
        description: String(p.description || '').trim()
      });
      added++;
    });
    if (!added && !append) W.addBulkEntryRow(W.getEntryFormValues());
    if (added > 0) {
      var rows = getBulkRows();
      W._bulkActiveIndex = Math.max(0, rows.length - 1);
      syncBulkEditorUi();
    }
    return { added: added };
  };

  W.addMultipleEntriesFromParsedBatch = function addMultipleEntriesFromParsedBatch(parsedBatch) {
    if (!Array.isArray(parsedBatch) || parsedBatch.length === 0) return { added: 0 };
    var nowIso = new Date().toISOString();
    var incoming = parsedBatch.map(function (p) {
      var status = p && p.dayStatus ? p.dayStatus : 'work';
      var loc = p && p.location ? p.location : 'WFO';
      if (loc === 'AW') loc = 'Anywhere';
      if (status !== 'work') loc = 'Anywhere';
      return {
        id: typeof W.generateId === 'function' ? W.generateId() : undefined,
        date: normalizeBulkDate(p && p.date) || (p && p.date) || '',
        clockIn: status !== 'work' ? W.NON_WORK_DEFAULTS.clockIn : normalizeBulkTime(p && p.clockIn, '09:00'),
        clockOut: status !== 'work' ? W.NON_WORK_DEFAULTS.clockOut : normalizeBulkTime(p && p.clockOut, '18:00'),
        breakMinutes: status !== 'work' ? W.parseBreakToMinutes(1, 'hours') : W.parseBreakToMinutes((p && p.breakVal) != null ? p.breakVal : 0, (p && p.breakUnit) || 'minutes'),
        dayStatus: status,
        location: loc,
        description: (p && p.description) ? String(p.description).trim() : '',
        timezone: (document.getElementById('entryTimezone') && document.getElementById('entryTimezone').value) || W.DEFAULT_TIMEZONE,
        createdAt: nowIso,
        updatedAt: nowIso
      };
    }).filter(function (e) { return e.date; });
    if (incoming.length > 0) mergeAndPersistEntries(incoming);
    return { added: incoming.length };
  };

  W.handleAddMultipleEntries = function handleAddMultipleEntries() {
    var wrap = document.getElementById('bulkEntryRows');
    if (!wrap) return;
    var rows = Array.prototype.slice.call(wrap.querySelectorAll('.bulk-entry-row'));
    if (!rows.length) {
      setBulkStatus('warning', getBulkText('clockEntry.bulk.noRowsWarning', 'Please add at least one row.'));
      return;
    }
    var nowIso = new Date().toISOString();
    var timezone = getBulkTimezoneValue();
    var incoming = [];
    var errors = [];
    rows.forEach(function (row, idx) {
      var date = normalizeBulkDate(row.querySelector('.bulk-entry-row-date').value);
      if (!date) {
        errors.push('Row ' + (idx + 1) + ': invalid or missing date.');
        return;
      }
      var status = normalizeStatus(row.querySelector('.bulk-entry-row-status').value);
      var location = normalizeLocation(row.querySelector('.bulk-entry-row-location').value, status);
      var breakVal = Number(row.querySelector('.bulk-entry-row-break').value) || 0;
      var breakUnit = row.querySelector('.bulk-entry-row-breakunit').value || 'minutes';
      var clockIn = status !== 'work' ? W.NON_WORK_DEFAULTS.clockIn : normalizeBulkTime(row.querySelector('.bulk-entry-row-clockin').value, '09:00');
      var clockOut = status !== 'work' ? W.NON_WORK_DEFAULTS.clockOut : normalizeBulkTime(row.querySelector('.bulk-entry-row-clockout').value, '18:00');
      incoming.push({
        id: typeof W.generateId === 'function' ? W.generateId() : undefined,
        date: date,
        clockIn: clockIn,
        clockOut: clockOut,
        breakMinutes: status !== 'work' ? W.parseBreakToMinutes(1, 'hours') : W.parseBreakToMinutes(breakVal, breakUnit),
        dayStatus: status,
        location: location,
        description: String((row.querySelector('.bulk-entry-row-desc').value || '')).trim(),
        timezone: timezone,
        createdAt: nowIso,
        updatedAt: nowIso
      });
    });
    if (incoming.length > 0) {
      mergeAndPersistEntries(incoming);
      W.renderEntries();
      setBulkStatus('success', getBulkText('clockEntry.bulk.saveSuccessTemplate', 'Saved {count} entries.', { count: incoming.length }));
      if (typeof W.showToast === 'function') W.showToast(getBulkText('clockEntry.bulk.saveSuccessTemplate', 'Saved {count} entries.', { count: incoming.length }), 'success');
      if (typeof W.setBulkEntriesPanelVisible === 'function') W.setBulkEntriesPanelVisible(false);
    } else {
      setBulkStatus('error', getBulkText('clockEntry.bulk.noEntriesError', 'No entries saved. Fix highlighted issues.'));
    }
    if (errors.length) {
      setBulkStatus(incoming.length ? 'warning' : 'error', errors.slice(0, 2).join(' '));
      if (typeof W.showToast === 'function') W.showToast(errors.slice(0, 2).join(' '), incoming.length ? 'info' : 'warning');
    }
  };

  W.fillBulkEntriesExample = function fillBulkEntriesExample() {
    if (typeof W.setBulkEntriesPanelVisible === 'function') W.setBulkEntriesPanelVisible(true);
    if (typeof W.resetBulkEntryRows === 'function') {
      var wrap = document.getElementById('bulkEntryRows');
      var existing = W.getEntries ? W.getEntries() : [];
      var hasEntryByDate = {};
      (existing || []).forEach(function (e) {
        if (!e || !e.date) return;
        var d = normalizeBulkDate(e.date);
        if (d) hasEntryByDate[d] = true;
      });

      function toYmd(d) {
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      }
      function isWeekday(d) {
        var wd = d.getDay();
        return wd >= 1 && wd <= 5;
      }

      function findUpcomingWorkingDaysWithoutInput(count) {
        var out = [];
        var cur = new Date();
        cur.setHours(12, 0, 0, 0);
        // Start from tomorrow.
        cur.setDate(cur.getDate() + 1);
        var guard = 0;
        while (out.length < count && guard < 730) {
          guard++;
          var ymd = toYmd(cur);
          if (isWeekday(cur) && !hasEntryByDate[ymd]) {
            out.push(ymd);
          }
          cur.setDate(cur.getDate() + 1);
        }
        return out;
      }

      function findUpcomingHolidayWeekdayWithoutInput(monthIndex, dayOfMonth) {
        var now = new Date();
        var year = now.getFullYear();
        var guard = 0;
        while (guard < 30) {
          guard++;
          var d = new Date(year, monthIndex, dayOfMonth, 12, 0, 0, 0);
          if (d < now) {
            year++;
            continue;
          }
          var ymd = toYmd(d);
          if (isWeekday(d) && !hasEntryByDate[ymd]) return ymd;
          year++;
        }
        return null;
      }

      var values = W.getEntryFormValues();
      var workingDays = findUpcomingWorkingDaysWithoutInput(2);
      var christmas = findUpcomingHolidayWeekdayWithoutInput(11, 25); // December is 11
      var newYear = findUpcomingHolidayWeekdayWithoutInput(0, 1); // January is 0

      wrap.innerHTML = '';

      workingDays.forEach(function (ymd) {
        W.addBulkEntryRow({
          date: ymd,
          clockIn: values.clockIn || '09:00',
          clockOut: values.clockOut || '18:00',
          breakMinutes: 60,
          dayStatus: 'work',
          location: 'WFH',
          description: ''
        });
      });

      if (christmas) {
        W.addBulkEntryRow({
          date: christmas,
          clockIn: W.NON_WORK_DEFAULTS.clockIn,
          clockOut: W.NON_WORK_DEFAULTS.clockOut,
          breakMinutes: 60,
          dayStatus: 'holiday',
          location: 'Anywhere',
          description: 'Christmas Day'
        });
      }

      if (newYear) {
        W.addBulkEntryRow({
          date: newYear,
          clockIn: W.NON_WORK_DEFAULTS.clockIn,
          clockOut: W.NON_WORK_DEFAULTS.clockOut,
          breakMinutes: 60,
          dayStatus: 'holiday',
          location: 'Anywhere',
          description: "New Year's Day"
        });
      }

      if (typeof W.setActiveBulkRowIndex === 'function') W.setActiveBulkRowIndex(0);
    }
    setBulkStatus('', getBulkText('clockEntry.bulk.exampleInserted', 'Example rows inserted. Adjust any field, then save entries.'));
  };
  W.handleSaveEntry = function handleSaveEntry() {
    const v = W.getEntryFormValues();
    if (!v.date) { alert((W.I18N && W.I18N.t) ? W.I18N.t('toasts.pleaseSelectDate') : 'Please select a date.'); return; }
    const entries = W.getEntries();
    function sameClockInForDedupe(a, b) {
      if (typeof W.normalizeTimeToHHmm === 'function') {
        var na = W.normalizeTimeToHHmm(a);
        var nb = W.normalizeTimeToHHmm(b);
        if (na && nb) return na === nb;
      }
      return String(a || '') === String(b || '');
    }
    var sameDateEntries = entries.filter(function (e) { return e && e.date === v.date; });
    var existing = null;
    if (sameDateEntries.length > 0) {
      existing = sameDateEntries.reduce(function (best, cur) {
        if (!best) return cur;
        var bt = new Date(best.updatedAt || best.createdAt || 0).getTime();
        var ct = new Date(cur.updatedAt || cur.createdAt || 0).getTime();
        if ((isNaN(bt) ? 0 : bt) < (isNaN(ct) ? 0 : ct)) return cur;
        if ((isNaN(bt) ? 0 : bt) === (isNaN(ct) ? 0 : ct) && sameClockInForDedupe(cur.clockIn, v.clockIn)) return cur;
        return best;
      }, null);
    }
    var nowIso = new Date().toISOString();
    if (existing) {
      existing.clockOut = v.clockOut;
      existing.breakMinutes = v.breakMinutes;
      existing.dayStatus = v.dayStatus;
      existing.location = v.location;
      existing.description = v.description || '';
      existing.timezone = v.timezone || W.DEFAULT_TIMEZONE;
       existing.updatedAt = nowIso;
    } else {
      entries.push({
        id: W.generateId(),
        date: v.date,
        clockIn: v.clockIn || null,
        clockOut: v.clockOut || null,
        breakMinutes: v.breakMinutes,
        dayStatus: v.dayStatus,
        location: v.location,
        description: v.description || '',
        timezone: v.timezone || W.DEFAULT_TIMEZONE,
        createdAt: nowIso,
        updatedAt: nowIso
      });
    }
    mergeAndPersistEntries([]);
    W.renderEntries();
    W.setToday();
    document.getElementById('entryClockIn').value = '';
    document.getElementById('entryClockOut').value = '';
    document.getElementById('entryBreak').value = '0';
    document.getElementById('entryBreakUnit').value = 'minutes';
    if (typeof W.syncBreakInputLimits === 'function') W.syncBreakInputLimits('entryBreak', 'entryBreakUnit');
    var descEl = document.getElementById('entryDescription');
    if (descEl) descEl.value = '';
  };

  W.refreshEntryFormStaticText = function refreshEntryFormStaticText() {
    if (!W.I18N || !W.I18N.t) return;
    var t = W.I18N.t;
    function ft(path) {
      var r = resolveEntryFormString(path);
      return r != null ? r : t(path);
    }

    // Status select option text (options are static in HTML, so we refresh them here)
    var statusSelect = document.getElementById('entryStatus');
    if (statusSelect) {
      Array.from(statusSelect.options).forEach(function (opt) {
        if (!opt) return;
        if (opt.value === 'work') opt.textContent = ft('status.work');
        else if (opt.value === 'sick') opt.textContent = ft('status.sick');
        else if (opt.value === 'holiday') opt.textContent = ft('status.holiday');
        else if (opt.value === 'vacation') opt.textContent = ft('status.vacation');
      });
    }

    // Location select option text (only "Anywhere" needs translation)
    var locSelect = document.getElementById('entryLocation');
    if (locSelect) {
      Array.from(locSelect.options).forEach(function (opt) {
        if (!opt) return;
        if (opt.value === 'Anywhere') opt.textContent = ft('location.anywhere');
        if (opt.value === 'WFH') opt.textContent = ft('location.wfh');
        if (opt.value === 'WFO') opt.textContent = ft('location.wfo');
      });
    }

    // Timezone search input (placeholder/aria are static in HTML)
    var tzInput = document.getElementById('entryTimezoneSearch');
    if (tzInput) {
      tzInput.setAttribute('placeholder', ft('clockEntry.timezoneSearchPlaceholder'));
      tzInput.setAttribute('aria-label', ft('clockEntry.timezoneSearchAriaLabel'));
    }
    var tzHint = document.getElementById('entryTimezoneHint');
    if (tzHint) {
      var hint = ft('clockEntry.timezoneHint');
      var source = W._resolvedEntryTimezoneSource === 'ip'
        ? 'IP'
        : (W._resolvedEntryTimezoneSource === 'browser' ? 'Browser' : '');
      var tzNow = (document.getElementById('entryTimezone') && document.getElementById('entryTimezone').value) || W.DEFAULT_TIMEZONE || '';
      if (source && tzNow) hint += ' Auto-detected (' + source + '): ' + tzNow + '.';
      tzHint.textContent = hint;
    }

    // Description textarea placeholder/aria/title
    var descArea = document.getElementById('entryDescription');
    if (descArea) {
      descArea.setAttribute('placeholder', ft('clockEntry.optionalNotesPlaceholder'));
      descArea.setAttribute('aria-label', ft('clockEntry.optionalNotesPlaceholder'));
      descArea.setAttribute('title', ft('clockEntry.optionalNotesTitle'));
    }

    // Voice / Save: resolve via active language + manual packs; keep data-voice-aria-label for recognition re-enable
    var voiceBtn = document.getElementById('voiceEntryBtn');
    if (voiceBtn) {
      voiceBtn.setAttribute('title', ft('clockEntry.voiceEntryBtn.title'));
      voiceBtn.setAttribute('aria-label', ft('clockEntry.voiceEntryBtn.aria'));
      voiceBtn.setAttribute('data-voice-aria-label', ft('clockEntry.voiceEntryBtn.aria'));
      var voiceLabel = voiceBtn.querySelector('.btn-profile-label');
      if (voiceLabel) voiceLabel.textContent = ft('clockEntry.voiceEntryBtn.text');
    }

    var saveBtn = document.getElementById('saveEntry');
    if (saveBtn) {
      var saveLabel = saveBtn.querySelector('.btn-profile-label');
      if (saveLabel) saveLabel.textContent = ft('clockEntry.saveEntry');
      var saveTip = resolveEntryFormString('clockEntry.saveEntryTitle') || resolveEntryFormString('clockEntry.saveEntry') || ft('clockEntry.saveEntry');
      saveBtn.setAttribute('title', saveTip);
      saveBtn.setAttribute('aria-label', ft('clockEntry.saveEntry'));
    }

    var bulkBtn = document.getElementById('addMultipleEntriesBtn');
    if (bulkBtn) {
      bulkBtn.setAttribute('aria-label', ft('clockEntry.bulk.saveAria'));
      bulkBtn.setAttribute('title', ft('clockEntry.bulk.saveTitle'));
      var bulkBtnLabel = bulkBtn.querySelector('.btn-profile-label');
      if (bulkBtnLabel) bulkBtnLabel.textContent = ft('clockEntry.bulk.saveLabel');
    }
    var bulkTitle = document.getElementById('bulkEntryModalTitle');
    if (bulkTitle) bulkTitle.textContent = ft('clockEntry.bulk.modalTitle');
    var bulkHint = document.getElementById('entryBulkHint');
    if (bulkHint) {
      bulkHint.textContent = ft('clockEntry.bulk.hint');
    }
    var bulkExampleBtn = document.getElementById('entryBulkExampleBtn');
    if (bulkExampleBtn) {
      bulkExampleBtn.textContent = ft('clockEntry.bulk.useExample');
      bulkExampleBtn.setAttribute('title', ft('clockEntry.bulk.useExampleTitle'));
      bulkExampleBtn.setAttribute('aria-label', ft('clockEntry.bulk.useExampleAria'));
    }
    var bulkClearBtn = document.getElementById('entryBulkClearBtn');
    if (bulkClearBtn) {
      bulkClearBtn.textContent = ft('clockEntry.bulk.reset');
      bulkClearBtn.setAttribute('title', ft('clockEntry.bulk.resetTitle'));
      bulkClearBtn.setAttribute('aria-label', ft('clockEntry.bulk.resetAria'));
    }
    var bulkAddRowBtn = document.getElementById('bulkAddRowBtn');
    if (bulkAddRowBtn) {
      bulkAddRowBtn.textContent = ft('clockEntry.bulk.addRow');
      bulkAddRowBtn.setAttribute('title', ft('clockEntry.bulk.addRowTitle'));
      bulkAddRowBtn.setAttribute('aria-label', ft('clockEntry.bulk.addRowAria'));
    }
    var bulkRemoveCurrentBtn = document.getElementById('bulkRemoveCurrentBtn');
    if (bulkRemoveCurrentBtn) {
      bulkRemoveCurrentBtn.textContent = ft('clockEntry.bulk.removeCurrent');
      bulkRemoveCurrentBtn.setAttribute('title', ft('clockEntry.bulk.removeCurrentTitle'));
      bulkRemoveCurrentBtn.setAttribute('aria-label', ft('clockEntry.bulk.removeCurrentAria'));
    }
    var bulkPrevBtn = document.getElementById('bulkPrevBtn');
    if (bulkPrevBtn) {
      bulkPrevBtn.textContent = ft('clockEntry.bulk.prev');
      bulkPrevBtn.setAttribute('title', ft('clockEntry.bulk.prevTitle'));
      bulkPrevBtn.setAttribute('aria-label', ft('clockEntry.bulk.prevAria'));
    }
    var bulkNextBtn = document.getElementById('bulkNextBtn');
    if (bulkNextBtn) {
      bulkNextBtn.textContent = ft('clockEntry.bulk.next');
      bulkNextBtn.setAttribute('title', ft('clockEntry.bulk.nextTitle'));
      bulkNextBtn.setAttribute('aria-label', ft('clockEntry.bulk.nextAria'));
    }
    var bulkVoiceSingleBtn = document.getElementById('bulkVoiceSingleBtn');
    if (bulkVoiceSingleBtn) {
      bulkVoiceSingleBtn.textContent = ft('clockEntry.bulk.voiceAddRow');
      bulkVoiceSingleBtn.setAttribute('title', ft('clockEntry.bulk.voiceAddRowTitle'));
      bulkVoiceSingleBtn.setAttribute('aria-label', ft('clockEntry.bulk.voiceAddRowAria'));
      bulkVoiceSingleBtn.setAttribute('data-voice-aria-label', ft('clockEntry.bulk.voiceAddRowAria'));
    }
    var bulkVoiceBatchBtn = document.getElementById('bulkVoiceBatchBtn');
    if (bulkVoiceBatchBtn) {
      bulkVoiceBatchBtn.textContent = ft('clockEntry.bulk.voiceAddBatch');
      bulkVoiceBatchBtn.setAttribute('title', ft('clockEntry.bulk.voiceAddBatchTitle'));
      bulkVoiceBatchBtn.setAttribute('aria-label', ft('clockEntry.bulk.voiceAddBatchAria'));
      bulkVoiceBatchBtn.setAttribute('data-voice-aria-label', ft('clockEntry.bulk.voiceAddBatchAria'));
    }
    var bulkVoiceMenuBtn = document.getElementById('bulkVoiceMenuBtn');
    if (bulkVoiceMenuBtn) {
      var menuParts = bulkVoiceMenuBtn.querySelectorAll('span');
      if (menuParts && menuParts[1]) menuParts[1].textContent = ft('clockEntry.voiceEntryBtn.text');
      bulkVoiceMenuBtn.setAttribute('title', ft('clockEntry.voiceEntryBtn.title'));
      bulkVoiceMenuBtn.setAttribute('aria-label', ft('clockEntry.voiceEntryBtn.aria'));
    }
    var bulkCloseBtn = document.getElementById('bulkEntryModalClose');
    if (bulkCloseBtn) {
      bulkCloseBtn.setAttribute('aria-label', ft('modals.voiceReview.closeAria'));
      bulkCloseBtn.setAttribute('title', ft('modals.voiceReview.closeAria'));
    }
    var bulkRows = document.querySelectorAll('#bulkEntryRows .bulk-entry-row');
    bulkRows.forEach(function (row) {
      var labels = row.querySelectorAll('.bulk-entry-row-field > label');
      if (labels[0]) labels[0].textContent = ft('clockEntry.dateLabel');
      if (labels[1]) labels[1].textContent = ft('clockEntry.clockInLabel');
      if (labels[2]) labels[2].textContent = ft('clockEntry.clockOutLabel');
      if (labels[3]) labels[3].textContent = ft('clockEntry.breakLabel');
      if (labels[4]) labels[4].textContent = ft('clockEntry.statusLabel');
      if (labels[5]) labels[5].textContent = ft('clockEntry.locationLabel');
      if (labels[6]) labels[6].textContent = ft('clockEntry.descriptionLabel');
      var bu = row.querySelector('.bulk-entry-row-breakunit');
      if (bu) {
        var oMin = bu.querySelector('option[value="minutes"]');
        var oHour = bu.querySelector('option[value="hours"]');
        if (oMin) oMin.textContent = ft('clockEntry.breakUnitMinutes');
        if (oHour) oHour.textContent = ft('clockEntry.breakUnitHours');
      }
      var st = row.querySelector('.bulk-entry-row-status');
      if (st) {
        var oWork = st.querySelector('option[value="work"]');
        var oSick = st.querySelector('option[value="sick"]');
        var oHoliday = st.querySelector('option[value="holiday"]');
        var oVacation = st.querySelector('option[value="vacation"]');
        if (oWork) oWork.textContent = ft('status.work');
        if (oSick) oSick.textContent = ft('status.sick');
        if (oHoliday) oHoliday.textContent = ft('status.holiday');
        if (oVacation) oVacation.textContent = ft('status.vacation');
      }
      var loc = row.querySelector('.bulk-entry-row-location');
      if (loc) {
        var oWfo = loc.querySelector('option[value="WFO"]');
        var oWfh = loc.querySelector('option[value="WFH"]');
        var oAny = loc.querySelector('option[value="Anywhere"]');
        if (oWfo) oWfo.textContent = ft('location.wfo');
        if (oWfh) oWfh.textContent = ft('location.wfh');
        if (oAny) oAny.textContent = ft('location.anywhere');
      }
      var removeBtn = row.querySelector('.bulk-entry-row-remove');
      if (removeBtn) {
        removeBtn.textContent = ft('clockEntry.bulk.removeRow');
        removeBtn.setAttribute('aria-label', ft('clockEntry.bulk.removeRowAria'));
        removeBtn.setAttribute('title', ft('clockEntry.bulk.removeRowTitle'));
      }
      var desc = row.querySelector('.bulk-entry-row-desc');
      if (desc) desc.setAttribute('placeholder', ft('clockEntry.optionalNotesPlaceholder'));
    });
    syncBulkEditorUi();
    var modal = document.getElementById('bulkEntryModal');
    if (modal && typeof W.setBulkEntriesPanelVisible === 'function') {
      var isOpen = modal.classList.contains('open');
      var toggleBtnNow = document.getElementById('toggleBulkEntriesBtn');
      if (toggleBtnNow) {
        toggleBtnNow.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }
    }
    var bulkToggleBtn = document.getElementById('toggleBulkEntriesBtn');
    if (bulkToggleBtn) {
      var isBulkOpen = !!(document.getElementById('bulkEntryModal') && document.getElementById('bulkEntryModal').classList.contains('open'));
      var bulkToggleLabel = bulkToggleBtn.querySelector('.btn-profile-label');
      if (bulkToggleLabel) {
        bulkToggleLabel.textContent = isBulkOpen
          ? ft('clockEntry.bulk.hideButton')
          : ft('clockEntry.bulk.openButton');
      }
      bulkToggleBtn.setAttribute('title', ft('clockEntry.bulk.openTitle'));
      bulkToggleBtn.setAttribute('aria-label', ft('clockEntry.bulk.openAria'));
      bulkToggleBtn.setAttribute('aria-expanded', isBulkOpen ? 'true' : 'false');
    }

    syncClockEntryActionButtonMinWidths();
  };
})(window.WorkHours);
