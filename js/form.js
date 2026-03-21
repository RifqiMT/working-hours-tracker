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
  W.handleSaveEntry = function handleSaveEntry() {
    const v = W.getEntryFormValues();
    if (!v.date) { alert((W.I18N && W.I18N.t) ? W.I18N.t('toasts.pleaseSelectDate') : 'Please select a date.'); return; }
    const entries = W.getEntries();
    const existing = entries.find(function (e) { return e.date === v.date && e.clockIn === v.clockIn; });
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
    W.setEntries(entries);
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
    if (tzHint) tzHint.textContent = ft('clockEntry.timezoneHint');

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

    syncClockEntryActionButtonMinWidths();
  };
})(window.WorkHours);
