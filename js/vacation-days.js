/**
 * Vacation days allowance per year (per profile).
 * Depends: storage, profile.
 */
(function (W) {
  'use strict';
  var KEY = 'vacationDaysByProfile';
  function getExpandedVacationRange() {
    var minY = Number(W.SUPPORTED_YEAR_MIN) || 1970;
    var maxY = Number(W.SUPPORTED_YEAR_MAX) || 2070;
    if (maxY < 2070) maxY = 2070;
    var before = Number(W._vacationRangeExpandBefore) || 0;
    var after = Number(W._vacationRangeExpandAfter) || 0;
    var start = 2021 - before;
    var end = 2030 + after;
    if (start < minY) start = minY;
    if (end > maxY) end = maxY;
    return { start: start, end: end, min: minY, max: maxY };
  }

  function collectVisibleDraft() {
    var container = document.getElementById('vacationDaysModalRows');
    var draft = {};
    if (!container) return draft;
    container.querySelectorAll('.vacation-days-row').forEach(function (row) {
      var y = row.getAttribute('data-year');
      var input = row.querySelector('input[type="number"]');
      if (!y || !input) return;
      var val = parseInt(input.value, 10);
      draft[y] = isNaN(val) || val < 0 ? 0 : Math.min(365, val);
    });
    return draft;
  }

  function renderVacationDaysModalRows(options) {
    options = options || {};
    var container = document.getElementById('vacationDaysModalRows');
    var profile = W.getProfile();
    if (!container) return;
    var range = getExpandedVacationRange();
    var existing = W.getVacationDaysByYear(profile);
    var draft = W._vacationDaysModalDraft && typeof W._vacationDaysModalDraft === 'object' ? W._vacationDaysModalDraft : {};
    var firstEmpty = null;
    container.innerHTML = '';

    for (var y = range.start; y <= range.end; y++) {
      var row = document.createElement('div');
      row.className = 'vacation-days-row';
      row.setAttribute('data-year', y);
      var inputId = 'vacationDaysYear' + y;
      var label = document.createElement('label');
      label.className = 'vacation-days-year';
      label.setAttribute('for', inputId);
      label.textContent = y;
      var input = document.createElement('input');
      input.id = inputId;
      input.className = 'vacation-days-input';
      input.type = 'number';
      input.min = 0;
      input.max = 365;
      input.step = 1;
      var existingVal = existing[String(y)];
      var draftVal = draft[String(y)];
      input.value = draftVal !== undefined ? draftVal : (existingVal !== undefined ? existingVal : '');
      input.placeholder = '0';
      var aria = (W.I18N && W.I18N.t) ? W.I18N.t('vacationDays.ariaLabel', { year: y }) : ('Vacation days ' + y);
      input.setAttribute('aria-label', aria);
      if (!input.value && firstEmpty == null) firstEmpty = input;
      row.appendChild(label);
      var inputWrap = document.createElement('div');
      inputWrap.className = 'vacation-days-input-wrap';
      inputWrap.appendChild(input);
      var suffix = document.createElement('span');
      suffix.className = 'vacation-days-input-suffix';
      suffix.textContent = (W.I18N && W.I18N.t) ? W.I18N.t('modals.vacationDaysModal.daysUnit') : 'days';
      inputWrap.appendChild(suffix);
      row.appendChild(inputWrap);
      container.appendChild(row);
    }

    var rangeEl = document.getElementById('vacationDaysRangeIndicator');
    if (rangeEl) rangeEl.textContent = String(range.start) + '-' + String(range.end);

    var beforeBtn = document.getElementById('vacationDaysExpandBeforeBtn');
    if (beforeBtn) beforeBtn.disabled = range.start <= range.min;
    var afterBtn = document.getElementById('vacationDaysExpandAfterBtn');
    if (afterBtn) afterBtn.disabled = range.end >= range.max;

    if (options.focusFirstEmpty && firstEmpty && typeof firstEmpty.focus === 'function') firstEmpty.focus();
  }

  W.getVacationDaysByYear = function getVacationDaysByYear(profile) {
    var data = W.getData();
    var byProfile = data[KEY];
    if (!byProfile || typeof byProfile !== 'object') return {};
    return byProfile[profile] && typeof byProfile[profile] === 'object' ? byProfile[profile] : {};
  };

  W.setVacationDaysBulk = function setVacationDaysBulk(profile, yearToDays) {
    var data = W.getData();
    if (!data[KEY]) data[KEY] = {};
    data[KEY][profile] = yearToDays && typeof yearToDays === 'object' ? yearToDays : {};
    W.setData(data);
  };

  /** Get vacation allowance for a given year (for current profile). */
  W.getVacationAllowance = function getVacationAllowance(year) {
    var byYear = W.getVacationDaysByYear(W.getProfile());
    var y = String(year);
    return byYear[y] !== undefined ? parseInt(byYear[y], 10) : null;
  };

  W.openVacationDaysModal = function openVacationDaysModal() {
    W._vacationRangeExpandBefore = 0;
    W._vacationRangeExpandAfter = 0;
    W._vacationDaysModalDraft = {};
    renderVacationDaysModalRows({ focusFirstEmpty: true });
    var modal = document.getElementById('vacationDaysModal');
    if (modal) {
      modal.classList.add('open');
      if (typeof modal.focus === 'function') modal.focus();
    }
  };

  W.closeVacationDaysModal = function closeVacationDaysModal() {
    W._vacationDaysModalDraft = {};
    document.getElementById('vacationDaysModal').classList.remove('open');
  };

  W.expandVacationDaysRangeBefore = function expandVacationDaysRangeBefore() {
    var range = getExpandedVacationRange();
    if (range.start <= range.min) return;
    W._vacationDaysModalDraft = collectVisibleDraft();
    W._vacationRangeExpandBefore = (Number(W._vacationRangeExpandBefore) || 0) + 10;
    renderVacationDaysModalRows();
  };

  W.expandVacationDaysRangeAfter = function expandVacationDaysRangeAfter() {
    var range = getExpandedVacationRange();
    if (range.end >= range.max) return;
    W._vacationDaysModalDraft = collectVisibleDraft();
    W._vacationRangeExpandAfter = (Number(W._vacationRangeExpandAfter) || 0) + 10;
    renderVacationDaysModalRows();
  };

  W.saveVacationDaysModal = function saveVacationDaysModal() {
    var profile = W.getProfile();
    var existing = W.getVacationDaysByYear(profile);
    var yearToDays = {};
    Object.keys(existing || {}).forEach(function (y) {
      var val = parseInt(existing[y], 10);
      yearToDays[y] = isNaN(val) || val < 0 ? 0 : Math.min(365, val);
    });
    var visibleDraft = collectVisibleDraft();
    Object.keys(visibleDraft).forEach(function (y) {
      yearToDays[y] = visibleDraft[y];
    });
    W.setVacationDaysBulk(profile, yearToDays);
    W.closeVacationDaysModal();
  };
})(window.WorkHours);
