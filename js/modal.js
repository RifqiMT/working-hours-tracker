/**
 * Edit entry modal.
 * Depends: entries, time, constants, render.
 */
(function (W) {
  'use strict';
  var NON_WORK_STATUSES_EDIT = ['sick', 'holiday', 'vacation'];

  W.syncEditLocationForStatus = function syncEditLocationForStatus() {
    var statusEl = document.getElementById('editStatus');
    var locationEl = document.getElementById('editLocation');
    if (!statusEl || !locationEl) return;
    if (typeof W.syncLocationAndTimeFieldsForDayStatus === 'function') {
      W.syncLocationAndTimeFieldsForDayStatus({
        statusEl: statusEl,
        locationEl: locationEl,
        clockInEl: document.getElementById('editClockIn'),
        clockOutEl: document.getElementById('editClockOut'),
        breakEl: document.getElementById('editBreak'),
        breakUnitEl: document.getElementById('editBreakUnit')
      });
      if (typeof W.syncBreakInputLimits === 'function') {
        W.syncBreakInputLimits('editBreak', 'editBreakUnit');
      }
    } else {
      var status = statusEl.value;
      if (NON_WORK_STATUSES_EDIT.indexOf(status) !== -1) {
        locationEl.value = 'Anywhere';
        locationEl.disabled = true;
        locationEl.setAttribute('aria-readonly', 'true');
      } else {
        locationEl.disabled = false;
        locationEl.removeAttribute('aria-readonly');
      }
    }
  };

  W._editBatchOrderedIds = null;
  W._editBatchIndex = 0;

  W.clearEditEntryBatch = function clearEditEntryBatch() {
    W._editBatchOrderedIds = null;
    W._editBatchIndex = 0;
  };

  /** Update edit modal title + batch badge (oldest→newest progress). */
  W.updateEditModalBatchTitle = function updateEditModalBatchTitle() {
    var overlay = document.getElementById('editModal');
    var panel = overlay && overlay.querySelector('.edit-entry-modal-panel');
    var titleEl = document.getElementById('editModalTitle');
    var badge = document.getElementById('editModalBatchBadge');
    if (!titleEl) return;
    var t = W.I18N && W.I18N.t ? W.I18N.t : function (k, subs) {
      if (k === 'modals.editEntry.title') return 'Edit entry';
      if (k === 'modals.editEntry.titleWithBatch' && subs) {
        return 'Edit entry (' + subs.current + ' of ' + subs.total + ')';
      }
      return k;
    };
    var baseTitle = t('modals.editEntry.title') || 'Edit entry';
    var batch = W._editBatchOrderedIds;
    if (batch && batch.length > 1) {
      var cur = (W._editBatchIndex | 0) + 1;
      var tot = batch.length;
      titleEl.textContent = baseTitle;
      if (badge) {
        badge.textContent = cur + ' / ' + tot;
        badge.removeAttribute('hidden');
      }
      var full = t('modals.editEntry.titleWithBatch', { current: cur, total: tot });
      if (!full || full === 'modals.editEntry.titleWithBatch') {
        full = baseTitle + ' (' + cur + '/' + tot + ')';
      }
      if (panel) panel.setAttribute('aria-label', full);
    } else {
      titleEl.textContent = baseTitle;
      if (badge) {
        badge.textContent = '';
        badge.setAttribute('hidden', '');
      }
      if (panel) panel.removeAttribute('aria-label');
    }
  };

  /** Open edit for multiple entries in date order (oldest first); advance with Save changes. */
  W.startEditEntryBatch = function startEditEntryBatch(orderedIds) {
    if (!orderedIds || orderedIds.length === 0) return;
    if (orderedIds.length === 1) {
      var only = W.getEntries().find(function (e) { return e.id === orderedIds[0]; });
      if (only) W.openEditModal(only);
      return;
    }
    W._editBatchOrderedIds = orderedIds.slice();
    W._editBatchIndex = 0;
    var entry = W.getEntries().find(function (e) { return e.id === W._editBatchOrderedIds[0]; });
    if (!entry) {
      W.clearEditEntryBatch();
      return;
    }
    W.fillEditFormFromEntry(entry);
    W.syncEditLocationForStatus();
    W.updateEditModalBatchTitle();
    var editOvBatch = document.getElementById('editModal');
    if (editOvBatch) {
      editOvBatch.classList.add('open');
      editOvBatch.setAttribute('aria-hidden', 'false');
    }
  };

  W.fillEditFormFromEntry = function fillEditFormFromEntry(entry) {
    document.getElementById('editEntryId').value = entry.id;
    document.getElementById('editDate').value = entry.date || '';
    document.getElementById('editClockIn').value = W.normalizeTimeToHHmm(entry.clockIn) || '';
    document.getElementById('editClockOut').value = W.normalizeTimeToHHmm(entry.clockOut) || '';
    const breakMin = Number(entry.breakMinutes) || 0;
    var bmf =
      typeof W.breakMinutesToInputFields === 'function'
        ? W.breakMinutesToInputFields(breakMin)
        : { value: breakMin >= 60 && breakMin % 60 === 0 ? breakMin / 60 : breakMin, unit: breakMin >= 60 && breakMin % 60 === 0 ? 'hours' : 'minutes' };
    document.getElementById('editBreak').value = String(bmf.value);
    document.getElementById('editBreakUnit').value = bmf.unit;
    if (typeof W.syncBreakInputLimits === 'function') W.syncBreakInputLimits('editBreak', 'editBreakUnit');
    document.getElementById('editStatus').value = entry.dayStatus || 'work';
    var loc = entry.location || 'WFO';
    if ((entry.dayStatus || 'work') === 'work' && (loc === 'Anywhere' || loc === 'AW')) {
      loc = 'WFO';
    }
    document.getElementById('editLocation').value = (NON_WORK_STATUSES_EDIT.indexOf(entry.dayStatus) !== -1) ? 'Anywhere' : loc;
    var descEl = document.getElementById('editDescription');
    if (descEl) descEl.value = entry.description || '';
    var tzEl = document.getElementById('editTimezone');
    if (tzEl) tzEl.value = entry.timezone || W.DEFAULT_TIMEZONE;
    var editTzWrap = document.getElementById('editTimezoneWrap');
    if (editTzWrap) {
      var inp = editTzWrap.querySelector('.tz-picker-input');
      if (inp && typeof W.getTimeZoneLabel === 'function') inp.value = W.getTimeZoneLabel(entry.timezone || W.DEFAULT_TIMEZONE);
    }
  };
  W.openEditModal = function openEditModal(entry) {
    W.clearEditEntryBatch();
    W.fillEditFormFromEntry(entry);
    W.syncEditLocationForStatus();
    W.updateEditModalBatchTitle();
    var editOvOpen = document.getElementById('editModal');
    if (editOvOpen) {
      editOvOpen.classList.add('open');
      editOvOpen.setAttribute('aria-hidden', 'false');
    }
  };
  W.closeEditModal = function closeEditModal() {
    W.clearEditEntryBatch();
    var editOvClose = document.getElementById('editModal');
    if (editOvClose) {
      editOvClose.classList.remove('open');
      editOvClose.setAttribute('aria-hidden', 'true');
    }
  };
  W.getEditFormValues = function getEditFormValues() {
    var clockIn = (document.getElementById('editClockIn').value || '').trim();
    var clockOut = (document.getElementById('editClockOut').value || '').trim();
    clockIn = W.normalizeTimeToHHmm(clockIn) || clockIn;
    clockOut = W.normalizeTimeToHHmm(clockOut) || clockOut;
    var breakVal = Number(document.getElementById('editBreak').value) || 0;
    var breakUnit = document.getElementById('editBreakUnit').value;
    var location = document.getElementById('editLocation').value;
    const dayStatus = document.getElementById('editStatus').value;
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
      id: document.getElementById('editEntryId').value,
      date: document.getElementById('editDate').value,
      clockIn: clockIn,
      clockOut: clockOut,
      breakMinutes: W.parseBreakToMinutes(breakVal, breakUnit),
      dayStatus: dayStatus,
      location: location,
      description: (document.getElementById('editDescription') && document.getElementById('editDescription').value) || '',
      timezone: (document.getElementById('editTimezone') && document.getElementById('editTimezone').value) || W.DEFAULT_TIMEZONE
    };
  };
  W.saveEditEntry = function saveEditEntry() {
    const v = W.getEditFormValues();
    if (!v.date) { alert((W.I18N && W.I18N.t) ? W.I18N.t('toasts.pleaseSelectDate') : 'Please select a date.'); return; }
    const entries = W.getEntries();
    const idx = entries.findIndex(function (e) { return e.id === v.id; });
    if (idx === -1) return;
    entries[idx] = { id: v.id, date: v.date, clockIn: v.clockIn || null, clockOut: v.clockOut || null, breakMinutes: v.breakMinutes, dayStatus: v.dayStatus, location: v.location, description: v.description || '', timezone: v.timezone || W.DEFAULT_TIMEZONE };
    W.setEntries(entries);
    W.renderEntries();

    var batch = W._editBatchOrderedIds;
    if (batch && batch.length > 1) {
      var bi = W._editBatchIndex | 0;
      if (bi < batch.length - 1) {
        W._editBatchIndex = bi + 1;
        var nextId = batch[W._editBatchIndex];
        var nextEntry = W.getEntries().find(function (e) { return e.id === nextId; });
        if (nextEntry) {
          W.fillEditFormFromEntry(nextEntry);
          W.syncEditLocationForStatus();
          W.updateEditModalBatchTitle();
          return;
        }
      }
    }
    W.clearEditEntryBatch();
    W.closeEditModal();
  };
  W.applyNonWorkDefaultsToEditForm = function applyNonWorkDefaultsToEditForm() {
    document.getElementById('editBreak').value = '1';
    document.getElementById('editBreakUnit').value = 'hours';
    document.getElementById('editLocation').value = W.NON_WORK_DEFAULTS.location;
    document.getElementById('editClockIn').value = W.NON_WORK_DEFAULTS.clockIn;
    document.getElementById('editClockOut').value = W.NON_WORK_DEFAULTS.clockOut;
    W.syncEditLocationForStatus();
    if (typeof W.syncBreakInputLimits === 'function') W.syncBreakInputLimits('editBreak', 'editBreakUnit');
  };
  W.openDeleteConfirmModal = function openDeleteConfirmModal(onConfirm, count) {
    W._deleteConfirmCallback = onConfirm;
    var modal = document.getElementById('deleteConfirmModal');
    var titleEl = modal && modal.querySelector('h2');
    var msgEl = modal && modal.querySelector('.modal-confirm-message');
    var t = W.I18N && W.I18N.t ? W.I18N.t : function (k) { return k; };
    if (titleEl) titleEl.textContent = count === 1 ? t('modals.deleteEntry.title') : t('modals.deleteEntry.titleMany');
    if (msgEl) msgEl.textContent = count === 1 ? t('modals.deleteEntry.message') : t('modals.deleteEntry.messageMany', { count: count });
    if (modal) {
      modal.dataset.deleteCount = String(count);
      var cancelBtn = modal.querySelector('#deleteConfirmCancel');
      var okBtn = modal.querySelector('#deleteConfirmOk');
      if (cancelBtn) cancelBtn.textContent = t('modals.deleteEntry.cancel');
      if (okBtn) okBtn.textContent = t('modals.deleteEntry.delete');
    }
    if (modal) modal.classList.add('open');
  };
  W.closeDeleteConfirmModal = function closeDeleteConfirmModal() {
    document.getElementById('deleteConfirmModal').classList.remove('open');
    W._deleteConfirmCallback = null;
  };
  W.confirmDeleteEntry = function confirmDeleteEntry() {
    if (typeof W._deleteConfirmCallback === 'function') W._deleteConfirmCallback();
    W.closeDeleteConfirmModal();
  };

  function setLabelTextInContainer(container, selector, text) {
    if (!container) return;
    var el = selector ? container.querySelector(selector) : null;
    if (el && text != null) el.textContent = text;
  }

  function setInputAriaAndPlaceholder(el, ariaLabel, placeholder) {
    if (!el) return;
    if (ariaLabel) el.setAttribute('aria-label', ariaLabel);
    if (placeholder != null) el.setAttribute('placeholder', placeholder);
  }

  W.refreshEditEntryModalStaticText = function refreshEditEntryModalStaticText() {
    if (!W.I18N || !W.I18N.t) return;
    var t = W.I18N.t;
    var modal = document.getElementById('editModal');
    if (!modal) return;

    if (typeof W.updateEditModalBatchTitle === 'function') W.updateEditModalBatchTitle();
    else {
      var titleFallback = document.getElementById('editModalTitle');
      if (titleFallback) titleFallback.textContent = t('modals.editEntry.title');
    }

    // Action buttons (icon + label layout)
    var cancelBtn = document.getElementById('editModalCancel');
    var saveBtn = document.getElementById('editModalSave');
    if (cancelBtn) {
      var cancelLabel = cancelBtn.querySelector('.btn-profile-label');
      if (cancelLabel) cancelLabel.textContent = t('modals.editEntry.cancel');
      cancelBtn.setAttribute('title', t('modals.editEntry.cancel'));
      cancelBtn.setAttribute('aria-label', t('modals.editEntry.cancel'));
    }
    if (saveBtn) {
      var saveLabel = saveBtn.querySelector('.btn-profile-label');
      if (saveLabel) saveLabel.textContent = t('modals.editEntry.saveChanges');
      saveBtn.setAttribute('title', t('modals.editEntry.saveChanges'));
      saveBtn.setAttribute('aria-label', t('modals.editEntry.saveChanges'));
    }

    // Labels by input containers
    function setLabelForInput(inputId, labelText) {
      var input = document.getElementById(inputId);
      if (!input) return;
      var field = input.closest('.edit-entry-field');
      if (field) {
        var lab = field.querySelector('label');
        if (lab) lab.textContent = labelText;
        return;
      }
      var div = input.closest('div') || input.parentElement;
      if (!div) return;
      var label = div.querySelector('label');
      if (label) label.textContent = labelText;
    }

    setLabelForInput('editDate', t('modals.editEntry.dateLabel'));
    setLabelForInput('editClockIn', t('modals.editEntry.clockInLabel'));
    setLabelForInput('editClockOut', t('modals.editEntry.clockOutLabel'));
    setLabelForInput('editBreak', t('modals.editEntry.breakLabel'));
    setLabelForInput('editStatus', t('modals.editEntry.statusLabel'));
    setLabelForInput('editLocation', t('modals.editEntry.locationLabel'));

    var tzInput = document.getElementById('editTimezoneSearch');
    if (tzInput) {
      var tzField = tzInput.closest('.edit-entry-field');
      if (tzField) {
        var tzLab = tzField.querySelector('label');
        if (tzLab) tzLab.textContent = t('modals.editEntry.timezoneLabel');
      }
    }
    setInputAriaAndPlaceholder(tzInput, t('clockEntry.timezoneSearchAriaLabel'), t('clockEntry.timezoneSearchPlaceholder'));

    var descArea = document.getElementById('editDescription');
    if (descArea) {
      setLabelForInput('editDescription', t('modals.editEntry.descriptionLabel'));
      setInputAriaAndPlaceholder(descArea, t('modals.editEntry.descriptionLabel'), t('modals.editEntry.optionalNotesPlaceholder'));
    }

    // Select options (break units)
    var breakUnitSelect = document.getElementById('editBreakUnit');
    if (breakUnitSelect) {
      var optMin = breakUnitSelect.querySelector('option[value="minutes"]');
      var optHours = breakUnitSelect.querySelector('option[value="hours"]');
      if (optMin) optMin.textContent = t('modals.editEntry.breakMinutes');
      if (optHours) optHours.textContent = t('modals.editEntry.breakHours');
    }

    // Day status options
    var statusSelect = document.getElementById('editStatus');
    if (statusSelect) {
      Array.from(statusSelect.options).forEach(function (opt) {
        if (!opt) return;
        if (opt.value === 'work') opt.textContent = t('status.work');
        else if (opt.value === 'sick') opt.textContent = t('status.sick');
        else if (opt.value === 'holiday') opt.textContent = t('status.holiday');
        else if (opt.value === 'vacation') opt.textContent = t('status.vacation');
      });
    }

    // Location options
    var locSelect = document.getElementById('editLocation');
    if (locSelect) {
      Array.from(locSelect.options).forEach(function (opt) {
        if (!opt) return;
        if (opt.value === 'Anywhere') opt.textContent = t('location.anywhere');
        if (opt.value === 'WFH') opt.textContent = t('location.wfh');
        if (opt.value === 'WFO') opt.textContent = t('location.wfo');
      });
    }

    // Voice entry button
    var voiceBtn = document.getElementById('editModalVoiceBtn');
    if (voiceBtn) {
      voiceBtn.setAttribute('title', t('modals.editEntry.voiceEntryBtn.title'));
      voiceBtn.setAttribute('aria-label', t('modals.editEntry.voiceEntryBtn.aria'));
      voiceBtn.setAttribute('data-voice-aria-label', t('modals.editEntry.voiceEntryBtn.aria'));
      var voiceLabel = voiceBtn.querySelector('.btn-profile-label');
      if (voiceLabel) voiceLabel.textContent = t('modals.editEntry.voiceEntryBtn.text');
    }
  };

  W.refreshVoiceReviewModalStaticText = function refreshVoiceReviewModalStaticText() {
    if (!W.I18N || !W.I18N.t) return;
    var t = W.I18N.t;
    var modal = document.getElementById('voiceReviewModal');
    if (!modal) return;

    var title = modal.querySelector('h2');
    if (title) title.textContent = t('modals.voiceReview.title');

    var closeBtn = document.getElementById('voiceReviewModalClose');
    if (closeBtn) closeBtn.setAttribute('aria-label', t('modals.voiceReview.closeAria'));

    // Description with <strong> around "Apply to form"
    var descP = modal.querySelector('.voice-review-modal-desc');
    if (descP) {
      var desc = t('modals.voiceReview.description');
      var applyText = t('modals.voiceReview.apply');
      if (desc && applyText) desc = String(desc).replace(applyText, '<strong>' + applyText + '</strong>');
      descP.innerHTML = desc || '';
    }

    // Heard label
    var voiceSection = modal.querySelector('.voice-review-section');
    if (voiceSection) {
      var heardLabelEl = voiceSection.querySelector('.voice-review-label');
      if (heardLabelEl) heardLabelEl.textContent = t('modals.voiceReview.heardLabel');
    }

    // Field labels
    function setFieldLabel(forId, text) {
      var label = modal.querySelector('label[for="' + forId + '"]');
      if (label) label.textContent = text;
    }
    setFieldLabel('voiceReviewDate', t('modals.voiceReview.dateLabel'));
    setFieldLabel('voiceReviewClockIn', t('modals.voiceReview.clockInLabel'));
    setFieldLabel('voiceReviewClockOut', t('modals.voiceReview.clockOutLabel'));
    setFieldLabel('voiceReviewStatus', t('modals.voiceReview.statusLabel'));
    setFieldLabel('voiceReviewLocation', t('modals.voiceReview.locationLabel'));
    setFieldLabel('voiceReviewDescription', t('modals.voiceReview.descriptionLabel'));

    // Break label (span, not label)
    var breakRow = modal.querySelector('.voice-review-row--break');
    if (breakRow) {
      var breakLabelEl = breakRow.querySelector('.voice-review-label');
      if (breakLabelEl) breakLabelEl.textContent = t('modals.voiceReview.breakLabel');
    }

    // Break unit options
    var breakUnitSelect = document.getElementById('voiceReviewBreakUnit');
    if (breakUnitSelect) {
      var optMin = breakUnitSelect.querySelector('option[value="minutes"]');
      var optHours = breakUnitSelect.querySelector('option[value="hours"]');
      if (optMin) optMin.textContent = t('modals.voiceReview.breakUnitMinutes');
      if (optHours) optHours.textContent = t('modals.voiceReview.breakUnitHours');
    }

    // Status options
    var statusSelect = document.getElementById('voiceReviewStatus');
    if (statusSelect) {
      Array.from(statusSelect.options).forEach(function (opt) {
        if (!opt) return;
        if (opt.value === 'work') opt.textContent = t('status.work');
        else if (opt.value === 'sick') opt.textContent = t('status.sick');
        else if (opt.value === 'holiday') opt.textContent = t('status.holiday');
        else if (opt.value === 'vacation') opt.textContent = t('status.vacation');
      });
    }

    // Location options
    var locSelect = document.getElementById('voiceReviewLocation');
    if (locSelect) {
      Array.from(locSelect.options).forEach(function (opt) {
        if (!opt) return;
        if (opt.value === 'Anywhere') opt.textContent = t('location.anywhere');
        if (opt.value === 'WFH') opt.textContent = t('location.wfh');
        if (opt.value === 'WFO') opt.textContent = t('location.wfo');
      });
    }

    // Description placeholder/aria
    var descArea = document.getElementById('voiceReviewDescription');
    if (descArea) {
      setInputAriaAndPlaceholder(descArea, t('modals.voiceReview.descriptionLabel'), t('modals.voiceReview.optionalNotesPlaceholder'));
    }

    // Buttons
    var cancelBtn = document.getElementById('voiceReviewModalCancel');
    var applyBtn = document.getElementById('voiceReviewModalApply');
    if (cancelBtn) cancelBtn.textContent = t('modals.voiceReview.cancel');
    if (applyBtn) applyBtn.textContent = t('modals.voiceReview.apply');

    var retakeBtn = document.getElementById('voiceReviewRetakeBtn');
    if (retakeBtn) {
      retakeBtn.setAttribute('title', t('modals.voiceReview.retake.title'));
      retakeBtn.setAttribute('aria-label', t('modals.voiceReview.retake.aria'));
      retakeBtn.setAttribute('data-voice-aria-label', t('modals.voiceReview.retake.aria'));
      var textSpan = retakeBtn.querySelector('span:last-child');
      if (textSpan) textSpan.textContent = t('modals.voiceReview.retake.aria');
    }
  };

  W.refreshExportModalStaticText = function refreshExportModalStaticText() {
    if (!W.I18N || !W.I18N.t) return;
    var t = W.I18N.t;
    var modal = document.getElementById('exportModal');
    if (!modal) return;

    var title = document.getElementById('exportModalTitle');
    if (title) title.textContent = t('modals.exportData.title');

    var desc = modal.querySelector('.export-modal-desc');
    if (desc) desc.textContent = t('modals.exportData.description');

    var closeBtn = document.getElementById('exportModalClose');
    if (closeBtn) closeBtn.setAttribute('aria-label', t('modals.exportData.closeAria'));

    var csvBtn = document.getElementById('exportModalCsv');
    if (csvBtn) {
      var labelEl = csvBtn.querySelector('.export-format-label');
      var hintEl = csvBtn.querySelector('.export-format-hint');
      if (labelEl) labelEl.textContent = t('modals.exportData.exportCsv');
      if (hintEl) hintEl.textContent = t('modals.exportData.csvHint');
    }
    var jsonBtn = document.getElementById('exportModalJson');
    if (jsonBtn) {
      var labelEl2 = jsonBtn.querySelector('.export-format-label');
      var hintEl2 = jsonBtn.querySelector('.export-format-hint');
      if (labelEl2) labelEl2.textContent = t('modals.exportData.exportJson');
      if (hintEl2) hintEl2.textContent = t('modals.exportData.jsonHint');
    }
  };

  W.refreshDeleteConfirmModalStaticText = function refreshDeleteConfirmModalStaticText() {
    if (!W.I18N || !W.I18N.t) return;
    var modal = document.getElementById('deleteConfirmModal');
    if (!modal || !modal.classList.contains('open')) return;
    var count = parseInt(modal.dataset.deleteCount || '0', 10) || 0;
    if (!count) return;
    W.openDeleteConfirmModal(W._deleteConfirmCallback, count);
  };

  W.refreshVacationDaysModalStaticText = function refreshVacationDaysModalStaticText() {
    if (!W.I18N || !W.I18N.t) return;
    var modal = document.getElementById('vacationDaysModal');
    if (!modal) return;
    var t = W.I18N.t;
    var h2 = modal.querySelector('h2');
    var p = modal.querySelector('p');
    var cancelBtn = document.getElementById('vacationDaysModalCancel');
    var saveBtn = document.getElementById('vacationDaysModalSave');
    if (h2) h2.textContent = t('modals.vacationDaysModal.title');
    if (p) p.textContent = t('modals.vacationDaysModal.description');
    if (cancelBtn) cancelBtn.textContent = t('modals.vacationDaysModal.cancel');
    if (saveBtn) saveBtn.textContent = t('modals.vacationDaysModal.save');
  };

  W.refreshNewProfileModalStaticText = function refreshNewProfileModalStaticText() {
    if (!W.I18N || !W.I18N.t) return;
    var modal = document.getElementById('newProfileModal');
    if (!modal) return;
    var t = W.I18N.t;
    var h2 = modal.querySelector('h2');
    var p = modal.querySelector('p');
    var cancelBtn = document.getElementById('newProfileModalCancel');
    var saveBtn = document.getElementById('newProfileModalSave');
    var nameInput = document.getElementById('newProfileNameModal');
    var roleInput = document.getElementById('newProfileRoleModal');
    var labels = modal.querySelectorAll('label');
    if (h2) h2.textContent = t('modals.newProfileModal.title');
    if (p) p.textContent = t('modals.newProfileModal.description');
    if (cancelBtn) cancelBtn.textContent = t('modals.newProfileModal.cancel');
    if (saveBtn) saveBtn.textContent = t('modals.newProfileModal.create');
    if (nameInput) nameInput.setAttribute('placeholder', t('modals.newProfileModal.profileNamePlaceholder'));
    if (roleInput) roleInput.setAttribute('placeholder', t('modals.newProfileModal.rolePlaceholder'));
    if (labels && labels.length >= 2) {
      labels[0].textContent = t('modals.newProfileModal.profileNameLabel');
      labels[1].textContent = t('modals.newProfileModal.roleLabel');
    }
  };

  W.refreshEditProfileModalStaticText = function refreshEditProfileModalStaticText() {
    if (!W.I18N || !W.I18N.t) return;
    var modal = document.getElementById('editProfileModal');
    if (!modal) return;
    var t = W.I18N.t;
    var h2 = modal.querySelector('h2');
    var p = modal.querySelector('p');
    var cancelBtn = document.getElementById('editProfileModalCancel');
    var saveBtn = document.getElementById('editProfileModalSave');
    var nameInput = document.getElementById('editProfileNameModal');
    var roleInput = document.getElementById('editProfileRoleModal');
    var labels = modal.querySelectorAll('label');
    if (h2) h2.textContent = t('modals.editProfileModal.title');
    if (p) p.textContent = t('modals.editProfileModal.description');
    if (cancelBtn) cancelBtn.textContent = t('modals.editProfileModal.cancel');
    if (saveBtn) saveBtn.textContent = t('modals.editProfileModal.save');
    if (nameInput) nameInput.setAttribute('placeholder', t('modals.editProfileModal.profileNamePlaceholder'));
    if (roleInput) roleInput.setAttribute('placeholder', t('modals.editProfileModal.rolePlaceholder'));
    if (labels && labels.length >= 2) {
      labels[0].textContent = t('modals.editProfileModal.profileNameLabel');
      labels[1].textContent = t('modals.editProfileModal.roleLabel');
    }
  };

  W.refreshDeleteProfileModalStaticText = function refreshDeleteProfileModalStaticText() {
    if (!W.I18N || !W.I18N.t) return;
    var modal = document.getElementById('deleteProfileModal');
    if (!modal) return;
    var t = W.I18N.t;
    var h2 = modal.querySelector('h2');
    var p = modal.querySelector('p');
    var cancelBtn = document.getElementById('deleteProfileModalCancel');
    var okBtn = document.getElementById('deleteProfileModalOk');
    if (h2) h2.textContent = t('modals.deleteProfileModal.title');
    if (p) p.textContent = t('modals.deleteProfileModal.description');
    if (cancelBtn) cancelBtn.textContent = t('modals.deleteProfileModal.cancel');
    if (okBtn) okBtn.textContent = t('modals.deleteProfileModal.delete');
  };

  W.refreshStatsSummaryModalStaticText = function refreshStatsSummaryModalStaticText() {
    if (!W.I18N || !W.I18N.t) return;
    var modal = document.getElementById('statsSummaryModal');
    if (!modal) return;
    var t = W.I18N.t;
    var h2 = modal.querySelector('h2');
    var p = document.getElementById('statsSummaryIntro');
    var closeBtn = document.getElementById('statsSummaryModalClose');
    var colTotal = document.getElementById('statsSummaryColTotalLabel');
    var colAvg = document.getElementById('statsSummaryColAvgLabel');
    if (h2) h2.textContent = t('modals.statsSummaryModal.title');
    if (p) p.textContent = t('modals.statsSummaryModal.description');
    if (colTotal) colTotal.textContent = t('modals.statsSummaryModal.columnTotal');
    if (colAvg) colAvg.textContent = t('modals.statsSummaryModal.columnAverage');
    var colTotalDet = document.getElementById('statsSummaryColTotalLabelDetails');
    var colAvgDet = document.getElementById('statsSummaryColAvgLabelDetails');
    if (colTotalDet) colTotalDet.textContent = t('modals.statsSummaryModal.columnTotal');
    if (colAvgDet) colAvgDet.textContent = t('modals.statsSummaryModal.columnAverage');

    var catBar = modal.querySelector('.stats-summary-category-bar');
    if (catBar) {
      catBar.setAttribute('aria-label', t('modals.statsSummaryModal.categoryGeneral') + ', ' + t('modals.statsSummaryModal.categoryDetails'));
    }
    var btnCatGen = document.getElementById('statsSummaryCatGeneral');
    var btnCatDet = document.getElementById('statsSummaryCatDetails');
    var tipGen = t('modals.statsSummaryModal.categoryGeneralTooltip');
    var tipDet = t('modals.statsSummaryModal.categoryDetailsTooltip');
    var labGen = t('modals.statsSummaryModal.categoryGeneral');
    var labDet = t('modals.statsSummaryModal.categoryDetails');
    if (btnCatGen) {
      btnCatGen.setAttribute('title', tipGen);
      btnCatGen.setAttribute('aria-label', labGen + '. ' + tipGen);
      var srG = btnCatGen.querySelector('.sr-only');
      if (srG) srG.textContent = labGen;
    }
    if (btnCatDet) {
      btnCatDet.setAttribute('title', tipDet);
      btnCatDet.setAttribute('aria-label', labDet + '. ' + tipDet);
      var srD = btnCatDet.querySelector('.sr-only');
      if (srD) srD.textContent = labDet;
    }
    if (typeof W.syncStatsSummaryCategoryToolbar === 'function') W.syncStatsSummaryCategoryToolbar();

    // View label + dropdown options
    var viewLabel = modal.querySelector('label[for="statsSummaryView"]');
    if (viewLabel) viewLabel.textContent = t('modals.statsSummaryModal.viewLabel');
    var viewSelect = document.getElementById('statsSummaryView');
    if (viewSelect) {
      var optWeekly = viewSelect.querySelector('option[value="weekly"]');
      var optMonthly = viewSelect.querySelector('option[value="monthly"]');
      var optQuarterly = viewSelect.querySelector('option[value="quarterly"]');
      var optAnnually = viewSelect.querySelector('option[value="annually"]');
      if (optWeekly) optWeekly.textContent = t('modals.statsSummaryModal.viewWeekly');
      if (optMonthly) optMonthly.textContent = t('modals.statsSummaryModal.viewMonthly');
      if (optQuarterly) optQuarterly.textContent = t('modals.statsSummaryModal.viewQuarterly');
      if (optAnnually) optAnnually.textContent = t('modals.statsSummaryModal.viewAnnually');
    }

    var dateFromLab = modal.querySelector('label[for="statsSummaryDateFrom"]');
    var dateToLab = modal.querySelector('label[for="statsSummaryDateTo"]');
    if (dateFromLab) dateFromLab.textContent = t('modals.statsSummaryModal.dateFromLabel');
    if (dateToLab) dateToLab.textContent = t('modals.statsSummaryModal.dateToLabel');
    var dateHint = document.getElementById('statsSummaryDateHint');
    if (dateHint) dateHint.textContent = t('modals.statsSummaryModal.dateRangeHint');
    var dateClearBtn = document.getElementById('statsSummaryDateClear');
    if (dateClearBtn) {
      dateClearBtn.textContent = t('modals.statsSummaryModal.dateClear');
      dateClearBtn.setAttribute('title', t('modals.statsSummaryModal.dateClear'));
      dateClearBtn.setAttribute('aria-label', t('modals.statsSummaryModal.dateClear'));
    }

    // Chart blocks: titles + button labels.
    var titleKeyByChart = {
      barWork: 'statsSummary.fullscreenBarWork',
      lineOvertime: 'statsSummary.fullscreenLineOvertime',
      barAvgWork: 'statsSummary.fullscreenBarAvgWork',
      lineAvgOvertime: 'statsSummary.fullscreenLineAvgOvertime',
      detailTotalWork: 'statsSummary.detailTotalWorkTitle',
      detailAvgWork: 'statsSummary.detailAvgWorkTitle',
      detailTotalOvertime: 'statsSummary.detailTotalOvertimeTitle',
      detailAvgOvertime: 'statsSummary.detailAvgOvertimeTitle'
    };
    var fullTip = t('modals.statsSummaryModal.fullScreenTooltip');
    var downloadTip = t('modals.statsSummaryModal.downloadImageTooltip');

    modal.querySelectorAll('.stats-summary-chart-block').forEach(function (block) {
      var enlargeBtn = block.querySelector('button.stats-summary-enlarge[data-enlarge-chart]');
      var downloadBtn = block.querySelector('button.stats-summary-download[data-download-chart]');
      var chartKey = enlargeBtn ? enlargeBtn.getAttribute('data-enlarge-chart') : (downloadBtn ? downloadBtn.getAttribute('data-download-chart') : null);

      if (enlargeBtn) {
        enlargeBtn.setAttribute('title', fullTip);
        enlargeBtn.setAttribute('aria-label', fullTip);
      }
      if (downloadBtn) {
        downloadBtn.setAttribute('title', downloadTip);
        downloadBtn.setAttribute('aria-label', downloadTip);
      }

      // Update chart header title
      var titleEl = block.querySelector('h3.stats-summary-chart-title');
      if (titleEl && chartKey && titleKeyByChart[chartKey]) {
        titleEl.textContent = t(titleKeyByChart[chartKey]);
      }
    });
    if (closeBtn) {
      var closeLab = closeBtn.querySelector('.btn-profile-label');
      if (closeLab) closeLab.textContent = t('modals.statsSummaryModal.close');
      closeBtn.setAttribute('title', t('modals.statsSummaryModal.close'));
      closeBtn.setAttribute('aria-label', t('modals.statsSummaryModal.close'));
    }
  };

  W.refreshStatsSummaryEnlargeModalStaticText = function refreshStatsSummaryEnlargeModalStaticText() {
    if (!W.I18N || !W.I18N.t) return;
    var modal = document.getElementById('statsSummaryEnlargeModal');
    if (!modal) return;
    var t = W.I18N.t;
    var h2 = modal.querySelector('h2');
    var downloadBtn = document.getElementById('statsSummaryEnlargeDownload');
    var closeBtn = document.getElementById('statsSummaryEnlargeClose');
    var canvas = document.getElementById('statsSummaryEnlargeCanvas');
    if (h2 && !modal.getAttribute('data-enlarge-chart-key')) {
      h2.textContent = t('modals.statsSummaryEnlargeModal.title');
    }
    var downloadTip = t('modals.statsSummaryModal.downloadImageTooltip');
    var closeTip = t('modals.statsSummaryEnlargeModal.close');
    if (downloadBtn) {
      downloadBtn.setAttribute('title', downloadTip);
      downloadBtn.setAttribute('aria-label', downloadTip);
    }
    if (closeBtn) {
      closeBtn.setAttribute('title', closeTip);
      closeBtn.setAttribute('aria-label', closeTip);
    }
    if (canvas) canvas.setAttribute('aria-label', t('modals.statsSummaryEnlargeModal.canvasAriaLabel'));
    if (typeof W.syncStatsSummaryEnlargeModalNav === 'function') W.syncStatsSummaryEnlargeModalNav();
  };

  W.refreshInfographicModalStaticText = function refreshInfographicModalStaticText() {
    if (!W.I18N || !W.I18N.t) return;
    var modal = document.getElementById('infographicModal');
    if (!modal) return;
    var t = W.I18N.t;
    var h2 = modal.querySelector('h2');
    var closeBtn = document.getElementById('infographicModalClose');
    if (h2) h2.textContent = t('modals.infographicModal.title');
    if (closeBtn) closeBtn.textContent = t('modals.infographicModal.close');
  };

  W.refreshKeyHighlightsPptModalStaticText = function refreshKeyHighlightsPptModalStaticText() {
    if (!W.I18N || !W.I18N.t) return;
    var modal = document.getElementById('keyHighlightsPptModal');
    if (!modal) return;
    var t = W.I18N.t;

    var titleEl = document.getElementById('keyHighlightsPptModalTitle');
    if (titleEl) titleEl.textContent = t('modals.keyHighlightsPptModal.title');
    var subtitleEl = modal.querySelector('.ppt-options-modal-subtitle');
    if (subtitleEl) subtitleEl.textContent = t('modals.keyHighlightsPptModal.subtitle');
    var descEl = document.getElementById('keyHighlightsPptIntro') || modal.querySelector('.ppt-options-modal-desc');
    if (descEl) descEl.textContent = t('modals.keyHighlightsPptModal.description');

    var closeBtn = document.getElementById('keyHighlightsPptModalClose');
    if (closeBtn) closeBtn.setAttribute('aria-label', t('modals.keyHighlightsPptModal.closeAria'));

    // Section titles
    var sectionTitles = modal.querySelectorAll('h3.ppt-options-section-title');
    if (sectionTitles && sectionTitles.length >= 3) {
      sectionTitles[0].textContent = t('modals.keyHighlightsPptModal.yearsTitle');
      sectionTitles[1].textContent = t('modals.keyHighlightsPptModal.metricsTitle');
      sectionTitles[2].textContent = t('modals.keyHighlightsPptModal.trendTitle');
    }

    // Years trigger
    var yearsTrigger = document.getElementById('pptOptionsYearsTrigger');
    var yearsTriggerText = document.getElementById('pptOptionsYearsTriggerText');
    if (yearsTrigger) yearsTrigger.setAttribute('aria-label', t('modals.keyHighlightsPptModal.yearsTriggerAria'));
    if (yearsTriggerText) yearsTriggerText.textContent = t('modals.keyHighlightsPptModal.yearsTriggerText');

    var selectAllBtn = document.getElementById('pptOptionsSelectAllYears');
    var clearBtn = document.getElementById('pptOptionsClearYears');
    if (selectAllBtn) selectAllBtn.textContent = t('modals.keyHighlightsPptModal.selectAllYears');
    if (clearBtn) clearBtn.textContent = t('modals.keyHighlightsPptModal.clearYears');

    // Metrics group labels
    var groupLabels = modal.querySelectorAll('.ppt-options-metrics-group-label');
    if (groupLabels && groupLabels.length >= 2) {
      groupLabels[0].textContent = t('modals.keyHighlightsPptModal.daysGroupLabel');
      groupLabels[1].textContent = t('modals.keyHighlightsPptModal.hoursOvertimeGroupLabel');
    }

    function setTileLabel(checkboxId, labelTextKey, hintTextKey) {
      var cb = document.getElementById(checkboxId);
      if (!cb) return;
      var labelSpan = cb.closest('label') ? cb.closest('label').querySelector('.ppt-options-tile-label') : null;
      if (!labelSpan) return;
      var hintEl = labelSpan.querySelector('.ppt-options-tile-hint');
      if (hintTextKey && hintEl) {
        hintEl.textContent = t(hintTextKey);
        var firstTextNode = null;
        for (var i = 0; i < labelSpan.childNodes.length; i++) {
          if (labelSpan.childNodes[i] && labelSpan.childNodes[i].nodeType === 3) { firstTextNode = labelSpan.childNodes[i]; break; }
        }
        var prefix = t(labelTextKey) + ' ';
        if (firstTextNode) firstTextNode.textContent = prefix;
        else labelSpan.insertBefore(document.createTextNode(prefix), hintEl);
      } else {
        labelSpan.textContent = t(labelTextKey);
      }
    }

    setTileLabel('pptOptWorkingDays', 'modals.keyHighlightsPptModal.workingDaysLabel', 'modals.keyHighlightsPptModal.workingDaysHint');
    setTileLabel('pptOptVacation', 'modals.keyHighlightsPptModal.vacationDaysLabel');
    setTileLabel('pptOptVacationQuota', 'modals.keyHighlightsPptModal.vacationQuotaLabel');
    setTileLabel('pptOptVacationRemaining', 'modals.keyHighlightsPptModal.vacationRemainingLabel');
    setTileLabel('pptOptSick', 'modals.keyHighlightsPptModal.sickLeaveLabel');
    setTileLabel('pptOptHolidays', 'modals.keyHighlightsPptModal.holidaysLabel');
    setTileLabel('pptOptWorkingHours', 'modals.keyHighlightsPptModal.workingHoursLabel', 'modals.keyHighlightsPptModal.workingHoursHint');
    setTileLabel('pptOptOvertime', 'modals.keyHighlightsPptModal.overtimeLabel', 'modals.keyHighlightsPptModal.overtimeHint');
    setTileLabel('pptOptWfoWfhTrend', 'modals.keyHighlightsPptModal.wfoWfhTrendLabel', 'modals.keyHighlightsPptModal.wfoWfhTrendHint');

    // Trend hint block (supports <strong>)
    var hintBlock = modal.querySelector('.ppt-options-hint--block');
    if (hintBlock) {
      var noneLabel = t('modals.keyHighlightsPptModal.trendNoneLabel');
      hintBlock.innerHTML = t('modals.keyHighlightsPptModal.trendHintBlock', { none: noneLabel });
    }

    // Trend pills labels
    function setPillLabel(checkboxId, labelTextKey) {
      var cb = document.getElementById(checkboxId);
      if (!cb) return;
      var pillLabel = cb.closest('label') ? cb.closest('label').querySelector('.ppt-options-pill-label') : null;
      if (pillLabel) pillLabel.textContent = t(labelTextKey);
    }
    setPillLabel('pptOptTrendNone', 'modals.keyHighlightsPptModal.trendNoneLabel');
    setPillLabel('pptOptTrendWeekly', 'modals.keyHighlightsPptModal.trendWeeklyLabel');
    setPillLabel('pptOptTrendMonthly', 'modals.keyHighlightsPptModal.trendMonthlyLabel');
    setPillLabel('pptOptTrendQuarterly', 'modals.keyHighlightsPptModal.trendQuarterlyLabel');

    var basisHint = document.getElementById('pptOptTrendBasisHint');
    if (basisHint) basisHint.textContent = t('modals.keyHighlightsPptModal.trendBasisHint');

    var cancelBtn = document.getElementById('keyHighlightsPptModalCancel');
    var generateBtn = document.getElementById('keyHighlightsPptGenerateBtn');
    if (cancelBtn) {
      var pptCancelLab = cancelBtn.querySelector('.btn-profile-label');
      if (pptCancelLab) pptCancelLab.textContent = t('modals.keyHighlightsPptModal.cancel');
      cancelBtn.setAttribute('title', t('modals.keyHighlightsPptModal.cancel'));
      cancelBtn.setAttribute('aria-label', t('modals.keyHighlightsPptModal.cancel'));
    }
    if (generateBtn) {
      var genLab = generateBtn.querySelector('.btn-profile-label');
      if (genLab) genLab.textContent = t('modals.keyHighlightsPptModal.generatePowerPoint');
      generateBtn.setAttribute('title', t('modals.keyHighlightsPptModal.generatePowerPoint'));
      generateBtn.setAttribute('aria-label', t('modals.keyHighlightsPptModal.generatePowerPoint'));
    }
  };
})(window.WorkHours);
