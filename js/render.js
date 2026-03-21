/**
 * Rendering: entries table and statistics box.
 * Depends: entries, filters, time, constants.
 */
(function (W) {
  'use strict';

  /** Return inline SVG icon for day status (professional outline icons, inherit color). Shared for entries table, statistics card, and calendar legend. */
  function getStatusIcon(status) {
    var s = (status || 'work').toLowerCase();
    var icons = {
      work: '<svg class="entry-status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
      sick: '<svg class="entry-status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
      holiday: '<svg class="entry-status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M12 14v4M10 18h4"/></svg>',
      vacation: '<svg class="entry-status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
    };
    return icons[s] || icons.work;
  }
  W.getStatusIcon = getStatusIcon;

  W.buildEntryRowHtml = function buildEntryRowHtml(entry) {
    var tr = (W.I18N && W.I18N.t) ? W.I18N.t : function (k) { return k; };
    function trOrFallback(key, fallback) {
      try {
        var v = tr(key);
        return v == null || v === key ? fallback : v;
      } catch (_) {
        return fallback;
      }
    }

    const dur = W.workingMinutes(entry.clockIn, entry.clockOut, entry.breakMinutes);
    var standard = W.STANDARD_WORK_MINUTES_PER_DAY || 480;
    var overtimeMinutes = null;
    if ((entry.dayStatus || 'work') === 'work' && dur != null) overtimeMinutes = Math.max(0, dur - standard);
    var desc = (entry.description || '').trim();
    var translatedDesc = desc;
    if (desc && typeof W.getTranslatedDescriptionCached === 'function') {
      var cachedDesc = W.getTranslatedDescriptionCached(desc, W.currentLanguage || 'en');
      if (cachedDesc) translatedDesc = cachedDesc;
    }
    var descTitle = translatedDesc.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    var encodedDescOriginal = encodeURIComponent(desc);
    var descCell = descTitle
      ? '<td class="entry-desc-hover" title="' + descTitle + '" data-desc-original="' + encodedDescOriginal + '" aria-label="' + trOrFallback('render.descriptionAria', 'Description') + '">' +
          '<span class="btn-profile-icon" aria-hidden="true">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
              '<circle cx="12" cy="12" r="10"></circle>' +
              '<line x1="12" y1="16" x2="12" y2="12"></line>' +
              '<circle cx="12" cy="8" r="1"></circle>' +
            '</svg>' +
          '</span>' +
        '</td>'
      : '<td class="entry-desc-hover" aria-label="' + trOrFallback('render.noDescriptionAria', 'No description') + '"></td>';
    var status = (entry.dayStatus || 'work');
    var statusLabel = trOrFallback('status.' + status, status.replace(/^./, function (c) { return c.toUpperCase(); }));
    var statusCell = '<td class="entry-cell-status"><span class="entry-status-pill entry-status-pill--' + status + '" title="' + statusLabel.replace(/"/g, '&quot;') + '" aria-label="' + statusLabel.replace(/"/g, '&quot;') + '">' + getStatusIcon(status) + '</span></td>';
    var durStr = dur != null ? W.formatMinutes(dur) : '—';
    var hasOvertime = overtimeMinutes != null && overtimeMinutes > 0;
    var otStr = hasOvertime ? W.formatMinutes(overtimeMinutes) : '';
    var breakMin = Number(entry.breakMinutes) || 0;
    var breakStr = breakMin > 0 ? W.formatMinutes(breakMin) : '—';
    var durationTitleParts = [];
    durationTitleParts.push(trOrFallback('render.durationWorkingHours', 'Working hours: {dur}').replace('{dur}', durStr));
    durationTitleParts.push(trOrFallback('render.durationBreak', 'Break: {break}').replace('{break}', breakStr));
    if (hasOvertime) durationTitleParts.push(trOrFallback('render.durationOvertime', 'Overtime: +{ot}').replace('{ot}', otStr));
    var durationTitle = durationTitleParts.join('\n\n');

    var overtimeBadgeTitle = trOrFallback('render.overtimeBadgeTitle', 'Overtime');
    var otSuffix = trOrFallback('render.otSuffix', 'OT');
    var combinedDurOt = '<td class="entry-cell-duration-overtime" title="' + durationTitle.replace(/"/g, '&quot;') + '" aria-label="' + durationTitle.replace(/"/g, '&quot;') + '">' +
      '<span class="entry-dur-main duration">' + durStr + '</span>' +
      (hasOvertime ? '<span class="entry-ot-badge" title="' + overtimeBadgeTitle.replace(/"/g, '&quot;') + '">+' + otStr + ' ' + otSuffix + '</span>' : '') +
      '</td>';
    var loc = entry.location || '';
    var locLabel = '—';
    if (loc === 'AW' || loc === 'Anywhere') {
      locLabel = trOrFallback('location.anywhere', 'Anywhere');
    } else if (loc === 'WFH') {
      locLabel = trOrFallback('location.wfh', 'Home');
    } else if (loc === 'WFO') {
      locLabel = trOrFallback('location.wfo', 'Office');
    } else {
      locLabel = (loc || '—');
    }
    var locClass = 'entry-location';
    var locIconSvg = '';
    if (loc === 'WFH') {
      locClass += ' entry-location--wfh';
      locIconSvg = '<svg class="entry-location-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M3 11L12 4l9 7"/><path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9"/>' +
        '<path d="M9 20v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5"/>' +
      '</svg>';
    } else if (loc === 'WFO') {
      locClass += ' entry-location--wfo';
      locIconSvg = '<svg class="entry-location-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>' +
        '<path d="M9 3v18"/><path d="M15 3v18"/>' +
      '</svg>';
    } else if (loc === 'Anywhere' || loc === 'AW') {
      locClass += ' entry-location--anywhere';
      locIconSvg = '<svg class="entry-location-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="12" r="10"/>' +
        '<path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10"/>' +
      '</svg>';
    }
    var locationCell = '<td class="entry-cell-location"><span class="' + locClass + '" title="' + (locLabel !== '—' ? locLabel.replace(/"/g, '&quot;') : '') + '">' +
      (locIconSvg ? locIconSvg : '') +
      '<span class="entry-location-label">' + locLabel + '</span></span></td>';
    var entryTz = entry.timezone || W.DEFAULT_TIMEZONE;
    var viewTz = (W._entriesViewTimezone || '').trim();
    var viewConverted = viewTz && typeof W.formatEntryInViewZone === 'function' ? W.formatEntryInViewZone(entry, viewTz) : null;
    var dateDisplay = viewConverted ? W.formatDateWithDay(viewConverted.viewDate) : W.formatDateWithDay(entry.date);
    var timeDisplay = typeof W.formatClockInOutInZone === 'function'
      ? W.formatClockInOutInZone(entry, viewTz)
      : ((entry.clockIn || '—') + ' – ' + (entry.clockOut || '—'));
    var entryTzLabel = W.getTimeZoneLabel ? W.getTimeZoneLabel(entryTz) : entryTz;
    var dateTooltip = trOrFallback('render.originalTimezoneLabel', 'Original timezone') + ': ' + entryTzLabel + '\n' +
      trOrFallback('render.dateLabel', 'Date') + ': ' + (W.formatDateWithDay(entry.date) || '—');
    if (viewConverted && viewTz) {
      var viewTzLabel = W.getTimeZoneLabel ? W.getTimeZoneLabel(viewTz) : viewTz;
      dateTooltip += '\n\n' + trOrFallback('render.convertedTimezoneLabel', 'Converted timezone') + ': ' + viewTzLabel + '\n' +
        trOrFallback('render.dateLabel', 'Date') + ': ' + (W.formatDateWithDay(viewConverted.viewDate) || '—');
    }
    var timeTooltip = trOrFallback('render.originalTimezoneLabel', 'Original timezone') + ': ' + entryTzLabel + '\n' +
      trOrFallback('render.clockInOutRangeLabel', 'Clock In – Clock Out') + ': ' + (entry.clockIn || '—') + ' – ' + (entry.clockOut || '—');
    if (viewTz && viewConverted) {
      var viewTzLabelTime = W.getTimeZoneLabel ? W.getTimeZoneLabel(viewTz) : viewTz;
      timeTooltip += '\n\n' + trOrFallback('render.convertedTimezoneLabel', 'Converted timezone') + ': ' + viewTzLabelTime + '\n' +
        trOrFallback('render.clockInOutRangeLabel', 'Clock In – Clock Out') + ': ' + (viewConverted.viewClockIn || '—') + ' – ' + (viewConverted.viewClockOut || '—');
      if (viewConverted.clockOutNextDay) timeTooltip += ' ' + trOrFallback('render.nextDaySuffix', '(+1 day)');
    }
    var dateTooltipEsc = dateTooltip.replace(/"/g, '&quot;').replace(/</g, '&lt;');
    var timeTooltipEsc = timeTooltip.replace(/"/g, '&quot;').replace(/</g, '&lt;');
    return '<td class="entry-cell-checkbox"><input type="checkbox" class="entry-select-cb" data-id="' + entry.id + '" aria-label="' + trOrFallback('render.selectRowAria', 'Select row') + '"></td>' +
      '<td class="entry-cell-date" title="' + dateTooltipEsc + '">' + dateDisplay + '</td>' +
      '<td class="entry-cell-time entry-time" title="' + timeTooltipEsc + '">' + timeDisplay + '</td>' +
      combinedDurOt +
      statusCell +
      locationCell +
      descCell;
  };

  W.getEntrySortValue = function getEntrySortValue(entry, key) {
    if (key === 'date') return entry.date || '';
    if (key === 'duration') {
      var d = W.workingMinutes(entry.clockIn, entry.clockOut, entry.breakMinutes);
      return d != null ? d : -1;
    }
    if (key === 'overtime') {
      if ((entry.dayStatus || 'work') !== 'work') return -1;
      var dur = W.workingMinutes(entry.clockIn, entry.clockOut, entry.breakMinutes);
      if (dur == null) return -1;
      return Math.max(0, dur - (W.STANDARD_WORK_MINUTES_PER_DAY || 480));
    }
    if (key === 'status') return entry.dayStatus || 'work';
    if (key === 'location') return entry.location || '';
    return '';
  };

  W.setEntriesSort = function setEntriesSort(column) {
    if (W._entriesSortBy === column) {
      W._entriesSortDir = W._entriesSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      W._entriesSortBy = column;
      W._entriesSortDir = 'asc';
    }
    W.renderEntries();
  };

  W.renderEntriesTableSortHeaders = function renderEntriesTableSortHeaders() {
    var thead = document.querySelector('.entries-scroll thead');
    if (!thead) return;
    var sortBy = W._entriesSortBy || 'date';
    var sortDir = W._entriesSortDir || 'desc';
    var lang = W.currentLanguage || 'en';
    thead.querySelectorAll('th[data-sort]').forEach(function (th) {
      var col = th.getAttribute('data-sort');
      var label = null;
      if (col && W.I18N && typeof W.I18N.resolve === 'function') {
        var resolved = W.I18N.resolve('filtersEntries.columns.' + col, lang);
        if (typeof resolved === 'string' && resolved.length) label = resolved;
      }
      if (!label) label = th.getAttribute('data-label') || col;
      var indicator = (sortBy === col) ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';
      th.textContent = label + indicator;
      th.setAttribute('data-sort', col);
    });
  };
  /** Selected entry ids sorted by date ascending (oldest first), then clock in, then id — for batch edit. */
  W.getSelectedEntryIdsSortedForEdit = function getSelectedEntryIdsSortedForEdit() {
    var ids = W._selectedEntryIds || [];
    if (ids.length === 0) return [];
    var entryById = {};
    W.getEntries().forEach(function (e) { entryById[e.id] = e; });
    var list = ids.map(function (id) { return entryById[id]; }).filter(Boolean);
    list.sort(function (a, b) {
      var da = a.date || '';
      var db = b.date || '';
      if (da !== db) return da < db ? -1 : da > db ? 1 : 0;
      var ca = (typeof W.normalizeTimeToHHmm === 'function' ? W.normalizeTimeToHHmm(a.clockIn) : a.clockIn) || '';
      var cb = (typeof W.normalizeTimeToHHmm === 'function' ? W.normalizeTimeToHHmm(b.clockIn) : b.clockIn) || '';
      if (ca !== cb) return ca < cb ? -1 : ca > cb ? 1 : 0;
      return String(a.id).localeCompare(String(b.id));
    });
    return list.map(function (e) { return e.id; });
  };

  W.updateEntryButtonsState = function updateEntryButtonsState() {
    var editBtn = document.getElementById('editEntryBtn');
    var deleteBtn = document.getElementById('deleteEntryBtn');
    var ids = W._selectedEntryIds || [];
    var hasAny = ids.length > 0;
    if (editBtn) editBtn.disabled = !hasAny;
    if (deleteBtn) deleteBtn.disabled = !hasAny;
    var summaryEl = document.getElementById('entriesSelectionSummary');
    if (summaryEl) {
      var n = ids.length;
      if (n >= 2) {
        var msg = (W.I18N && W.I18N.t)
          ? W.I18N.t('filtersEntries.entriesSelectedSummaryMany', { count: n })
          : (n + ' entries selected');
        summaryEl.textContent = msg;
        summaryEl.removeAttribute('hidden');
        summaryEl.setAttribute('aria-label', msg);
      } else {
        summaryEl.textContent = '';
        summaryEl.setAttribute('hidden', '');
        summaryEl.removeAttribute('aria-label');
      }
    }
    W.updateSelectAllState();
  };
  /** Sync the "Select all" header checkbox to current selection. */
  W.updateSelectAllState = function updateSelectAllState() {
    var sel = document.getElementById('entriesSelectAll');
    if (!sel) return;
    var tbody = document.getElementById('entriesBody');
    var rows = tbody ? tbody.querySelectorAll('tr[data-id]') : [];
    var visibleIds = [];
    rows.forEach(function (r) { visibleIds.push(r.getAttribute('data-id')); });
    if (visibleIds.length === 0) {
      sel.checked = false;
      sel.indeterminate = false;
      sel.disabled = true;
      return;
    }
    sel.disabled = false;
    var selected = W._selectedEntryIds || [];
    var selectedSet = {};
    selected.forEach(function (id) { selectedSet[id] = true; });
    var selectedVisible = 0;
    visibleIds.forEach(function (id) { if (selectedSet[id]) selectedVisible++; });
    if (selectedVisible === 0) {
      sel.checked = false;
      sel.indeterminate = false;
    } else if (selectedVisible === visibleIds.length) {
      sel.checked = true;
      sel.indeterminate = false;
    } else {
      sel.checked = false;
      sel.indeterminate = true;
    }
  };
  /** Bind "Select all" header checkbox once. */
  W.bindSelectAllCheckbox = function bindSelectAllCheckbox() {
    var sel = document.getElementById('entriesSelectAll');
    if (!sel || sel.getAttribute('data-bound') === '1') return;
    sel.setAttribute('data-bound', '1');
    var self = W;
    sel.addEventListener('change', function () {
      var tbody = document.getElementById('entriesBody');
      var rows = tbody ? tbody.querySelectorAll('tr[data-id]') : [];
      var visibleIds = [];
      rows.forEach(function (r) { visibleIds.push(r.getAttribute('data-id')); });
      if (!self._selectedEntryIds) self._selectedEntryIds = [];
      var visibleSet = {};
      visibleIds.forEach(function (id) { visibleSet[id] = true; });
      if (sel.checked) {
        visibleIds.forEach(function (id) {
          if (self._selectedEntryIds.indexOf(id) === -1) self._selectedEntryIds.push(id);
        });
      } else {
        self._selectedEntryIds = self._selectedEntryIds.filter(function (id) { return !visibleSet[id]; });
      }
      rows.forEach(function (tr) {
        var id = tr.getAttribute('data-id');
        var cb = tr.querySelector('.entry-select-cb');
        var isSelected = self._selectedEntryIds.indexOf(id) !== -1;
        if (cb) cb.checked = isSelected;
        if (isSelected) tr.classList.add('selected'); else tr.classList.remove('selected');
      });
      self.updateEntryButtonsState();
    });
  };
  /** Clear all row selections in the entries table and update button state. */
  W.clearEntrySelection = function clearEntrySelection() {
    W._selectedEntryIds = [];
    var tbody = document.getElementById('entriesBody');
    if (tbody) {
      tbody.querySelectorAll('.entry-select-cb').forEach(function (cb) { cb.checked = false; });
      tbody.querySelectorAll('tr.selected').forEach(function (tr) { tr.classList.remove('selected'); });
    }
    W.updateEntryButtonsState();
  };
  W.bindEntryRowActions = function bindEntryRowActions(tbody) {
    var self = W;
    tbody.querySelectorAll('.entry-select-cb').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var id = cb.getAttribute('data-id');
        if (!self._selectedEntryIds) self._selectedEntryIds = [];
        if (cb.checked) {
          if (self._selectedEntryIds.indexOf(id) === -1) self._selectedEntryIds.push(id);
          var tr = cb.closest('tr');
          if (tr) tr.classList.add('selected');
        } else {
          var idx = self._selectedEntryIds.indexOf(id);
          if (idx !== -1) self._selectedEntryIds.splice(idx, 1);
          var tr = cb.closest('tr');
          if (tr) tr.classList.remove('selected');
        }
        self.updateEntryButtonsState();
      });
    });
  };
  W.editSelectedEntry = function editSelectedEntry() {
    var orderedIds = W.getSelectedEntryIdsSortedForEdit();
    if (orderedIds.length === 0) return;
    if (orderedIds.length === 1) {
      var entry = W.getEntries().find(function (e) { return e.id === orderedIds[0]; });
      if (entry) W.openEditModal(entry);
      return;
    }
    if (typeof W.startEditEntryBatch === 'function') W.startEditEntryBatch(orderedIds);
  };
  W.deleteSelectedEntry = function deleteSelectedEntry() {
    var ids = W._selectedEntryIds || [];
    if (ids.length === 0) return;
    var idSet = {};
    ids.forEach(function (id) { idSet[id] = true; });
    W.openDeleteConfirmModal(function () {
      W.setEntries(W.getEntries().filter(function (e) { return !idSet[e.id]; }));
      W._selectedEntryIds = [];
      W.renderEntries();
    }, ids.length);
  };
  W.renderEntries = function renderEntries() {
    var viewTzEl = document.getElementById('entriesViewTimezone');
    if (viewTzEl) W._entriesViewTimezone = (viewTzEl.value || '').trim();
    var entries = W.getFilteredEntries().slice();
    var sortBy = W._entriesSortBy || 'date';
    var sortDir = W._entriesSortDir || 'desc';
    entries.sort(function (a, b) {
      var va = W.getEntrySortValue(a, sortBy);
      var vb = W.getEntrySortValue(b, sortBy);
      var c = 0;
      if (typeof va === 'number' && typeof vb === 'number') c = va - vb;
      else c = String(va).localeCompare(String(vb), undefined, { numeric: true });
      return sortDir === 'asc' ? c : -c;
    });
    const tbody = document.getElementById('entriesBody');
    const emptyEl = document.getElementById('entriesEmpty');
    tbody.innerHTML = '';
    if (entries.length === 0) {
      emptyEl.style.display = 'block';
      W._selectedEntryIds = [];
      W.updateEntryButtonsState();
      W.renderEntriesTableSortHeaders();
      W.renderStatsBox();
      if (typeof W.renderCalendar === 'function') W.renderCalendar();
      return;
    }
    emptyEl.style.display = 'none';
    if (!W._selectedEntryIds) W._selectedEntryIds = [];
    var selectedSet = {};
    W._selectedEntryIds.forEach(function (id) { selectedSet[id] = true; });
    entries.forEach(function (entry) {
      const tr = document.createElement('tr');
      tr.setAttribute('data-id', entry.id);
      var status = entry.dayStatus || 'work';
      tr.className = 'entry-row entry-row--' + status;
      if (selectedSet[entry.id]) tr.classList.add('selected');
      tr.innerHTML = W.buildEntryRowHtml(entry);
      tbody.appendChild(tr);
      if (selectedSet[entry.id]) {
        var cb = tr.querySelector('.entry-select-cb');
        if (cb) cb.checked = true;
      }
    });
    W.updateEntryButtonsState();
    W.bindEntryRowActions(tbody);
    W.bindSelectAllCheckbox();
    W.updateSelectAllState();
    W.renderEntriesTableSortHeaders();
    if (typeof W.translateVisibleDescriptionCells === 'function') W.translateVisibleDescriptionCells(tbody);
    W.renderStatsBox();
    if (typeof W.renderCalendar === 'function') W.renderCalendar();
  };
  W.computeStats = function computeStats(entries) {
    var totalWorkMinutes = 0, totalOvertimeMinutes = 0, workDays = 0, vacationDays = 0, holidayDays = 0, sickDays = 0;
    entries.forEach(function (e) {
      const status = e.dayStatus || 'work';
      if (status === 'work') {
        const dur = W.workingMinutes(e.clockIn, e.clockOut, e.breakMinutes);
        if (dur != null) {
          totalWorkMinutes += dur;
          workDays++;
          if (dur > W.STANDARD_WORK_MINUTES_PER_DAY) totalOvertimeMinutes += dur - W.STANDARD_WORK_MINUTES_PER_DAY;
        }
      } else if (status === 'vacation') vacationDays++;
      else if (status === 'holiday') holidayDays++;
      else if (status === 'sick') sickDays++;
    });
    // Averages are only over days with status "work" that have valid duration
    const avgWorkMinutes = workDays > 0 ? Math.round(totalWorkMinutes / workDays) : 0;
    const avgOvertimeMinutes = workDays > 0 ? Math.round(totalOvertimeMinutes / workDays) : 0;
    return { totalWorkMinutes: totalWorkMinutes, totalOvertimeMinutes: totalOvertimeMinutes, avgWorkMinutes: avgWorkMinutes, avgOvertimeMinutes: avgOvertimeMinutes, workDays: workDays, vacationDays: vacationDays, holidayDays: holidayDays, sickDays: sickDays };
  };
  W.renderStatsBox = function renderStatsBox() {
    const entries = W.getFilteredEntries();
    const stats = W.computeStats(entries);
    const grid = document.getElementById('statsGrid');
    if (!grid) return;
    var tr = (W.I18N && W.I18N.t) ? W.I18N.t : function (k) { return k; };
    function trOrFallback(key, fallback) {
      var v = tr(key);
      return v == null || v === key ? fallback : v;
    }
    var totalWorkingHoursLabel = trOrFallback('statsSummary.box.totalWorkingHours', 'Total working hours');
    var avgPerWorkDayLabel = trOrFallback('statsSummary.box.avgPerWorkDay', 'Avg per work day');
    var totalOvertimeLabel = trOrFallback('statsSummary.box.totalOvertime', 'Total overtime');
    var avgOvertimeLabel = trOrFallback('statsSummary.box.avgOvertime', 'Avg overtime');
    var daysByTypeLabel = trOrFallback('statsSummary.box.daysByType', 'Days by type');
    var workDaysLabel = trOrFallback('statsSummary.box.workDays', 'Work days');
    var vacationDaysLabel = trOrFallback('statsSummary.box.vacationDays', 'Vacation');
    var holidayDaysLabel = trOrFallback('statsSummary.box.holidayDays', 'Holiday');
    var sickDaysLabel = trOrFallback('statsSummary.box.sickDays', 'Sick');

    grid.innerHTML =
      '<div class="stats-combo-row">' +
        '<div class="stat-combo stat-combo--work">' +
          '<div class="stat-combo-header">' +
            '<div class="stat-combo-icon stat-combo-icon--work" aria-hidden="true">' +
              '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<circle cx="12" cy="12" r="10"></circle>' +
                '<polyline points="12 6 12 12 16 14"></polyline>' +
              '</svg>' +
            '</div>' +
            '<div class="stat-combo-main">' +
              '<span class="stat-combo-value">' + W.formatMinutes(stats.totalWorkMinutes) + '</span>' +
              '<span class="stat-combo-label">' + totalWorkingHoursLabel + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="stat-combo-divider" aria-hidden="true"></div>' +
          '<div class="stat-combo-sub">' +
            '<span class="stat-combo-sub-label">' + avgPerWorkDayLabel + '</span>' +
            '<span class="stat-combo-sub-value">' + W.formatMinutes(stats.avgWorkMinutes) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="stat-combo stat-combo--overtime">' +
          '<div class="stat-combo-header">' +
            '<div class="stat-combo-icon stat-combo-icon--overtime" aria-hidden="true">' +
              '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<circle cx="12" cy="12" r="10"></circle>' +
                '<polyline points="12 6 12 12 16 16"></polyline>' +
              '</svg>' +
            '</div>' +
            '<div class="stat-combo-main">' +
              '<span class="stat-combo-value">' + W.formatMinutes(stats.totalOvertimeMinutes) + '</span>' +
              '<span class="stat-combo-label">' + totalOvertimeLabel + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="stat-combo-divider" aria-hidden="true"></div>' +
          '<div class="stat-combo-sub">' +
            '<span class="stat-combo-sub-label">' + avgOvertimeLabel + '</span>' +
            '<span class="stat-combo-sub-value">' + W.formatMinutes(stats.avgOvertimeMinutes) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="stats-section-label">' + daysByTypeLabel + '</div>' +
      '<div class="stats-days-by-type">' +
        '<div class="stat-day stat-day--work"><div class="stat-day-icon" aria-hidden="true">' + getStatusIcon('work') + '</div><div class="stat-day-body"><span class="stat-day-value">' + stats.workDays + '</span><span class="stat-day-label">' + workDaysLabel + '</span></div></div>' +
        '<div class="stat-day stat-day--vacation"><div class="stat-day-icon" aria-hidden="true">' + getStatusIcon('vacation') + '</div><div class="stat-day-body"><span class="stat-day-value">' + stats.vacationDays + '</span><span class="stat-day-label">' + vacationDaysLabel + '</span></div></div>' +
        '<div class="stat-day stat-day--holiday"><div class="stat-day-icon" aria-hidden="true">' + getStatusIcon('holiday') + '</div><div class="stat-day-body"><span class="stat-day-value">' + stats.holidayDays + '</span><span class="stat-day-label">' + holidayDaysLabel + '</span></div></div>' +
        '<div class="stat-day stat-day--sick"><div class="stat-day-icon" aria-hidden="true">' + getStatusIcon('sick') + '</div><div class="stat-day-body"><span class="stat-day-value">' + stats.sickDays + '</span><span class="stat-day-label">' + sickDaysLabel + '</span></div></div>' +
      '</div>';

    if (typeof W.refreshStatsSummaryChartsIfOpen === 'function') W.refreshStatsSummaryChartsIfOpen();
  };
})(window.WorkHours);
