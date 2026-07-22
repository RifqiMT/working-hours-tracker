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
    var descTooltipData = typeof W.buildAppTooltipData === 'function'
      ? W.buildAppTooltipData([
          trOrFallback('clockEntry.descriptionLabel', 'Description') + ':',
          translatedDesc
        ])
      : '';
    var descTooltipAttr = typeof W.buildAppTooltipAttr === 'function'
      ? W.buildAppTooltipAttr([
          trOrFallback('clockEntry.descriptionLabel', 'Description') + ':',
          translatedDesc
        ])
      : descTitle;
    var descCell = descTitle
      ? '<td class="entry-desc-hover" data-app-tooltip="' + descTooltipData + '" data-desc-original="' + encodedDescOriginal + '" aria-label="' + descTooltipAttr + '">' +
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
    var statusTooltipData = typeof W.buildAppTooltipData === 'function'
      ? W.buildAppTooltipData([trOrFallback('clockEntry.statusLabel', 'Day status') + ': ' + statusLabel])
      : '';
    var statusCell = '<td class="entry-cell-status"><span class="entry-status-pill entry-status-pill--' + status + '" data-app-tooltip="' + statusTooltipData + '" aria-label="' + statusLabel.replace(/"/g, '&quot;') + '">' + getStatusIcon(status) + '</span></td>';
    var durStr = dur != null ? W.formatMinutes(dur) : '—';
    var durStrLong = dur != null ? W.formatMinutes(dur, { style: 'long', compactNumbers: false }) : '—';
    var hasOvertime = overtimeMinutes != null && overtimeMinutes > 0;
    var otStr = hasOvertime ? W.formatMinutes(overtimeMinutes) : '';
    var otStrLong = hasOvertime ? W.formatMinutes(overtimeMinutes, { style: 'long', compactNumbers: false }) : '';
    var breakMin = Number(entry.breakMinutes) || 0;
    var breakStrLong = breakMin > 0 ? W.formatMinutes(breakMin, { style: 'long', compactNumbers: false }) : '—';
    var durationTitleParts = [];
    // Tooltips: avoid abbreviated time units for readability.
    durationTitleParts.push(trOrFallback('render.durationWorkingHours', 'Working hours: {dur}').replace('{dur}', durStrLong));
    durationTitleParts.push(trOrFallback('render.durationBreak', 'Break: {break}').replace('{break}', breakStrLong));
    if (hasOvertime) durationTitleParts.push(trOrFallback('render.durationOvertime', 'Overtime: +{ot}').replace('{ot}', otStrLong));
    var durationTitle = durationTitleParts.join('\n\n');
    var durationTooltipLines = [trOrFallback('render.durationLabel', 'Duration') + ':'].concat(durationTitleParts);
    var durationTooltipData = typeof W.buildAppTooltipData === 'function'
      ? W.buildAppTooltipData(durationTooltipLines)
      : '';
    var durationTooltipAttr = typeof W.buildAppTooltipAttr === 'function'
      ? W.buildAppTooltipAttr(durationTooltipLines)
      : durationTitle.replace(/"/g, '&quot;');

    var overtimeBadgeTitle = trOrFallback('render.overtimeBadgeTitle', 'Overtime');
    var otSuffix = trOrFallback('render.otSuffix', 'OT');
    var combinedDurOt = '<td class="entry-cell-duration-overtime" data-app-tooltip="' + durationTooltipData + '" aria-label="' + durationTooltipAttr + '">' +
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
    var locationTooltipData = typeof W.buildAppTooltipData === 'function' && locLabel !== '—'
      ? W.buildAppTooltipData([trOrFallback('clockEntry.locationLabel', 'Location') + ': ' + locLabel])
      : '';
    var locationCell = '<td class="entry-cell-location"><span class="' + locClass + '"' + (locationTooltipData ? ' data-app-tooltip="' + locationTooltipData + '"' : '') + '>' +
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
    var dateTooltipLines = [
      trOrFallback('render.dateLabel', 'Date') + ': ' + (W.formatDateWithDay(entry.date) || '—'),
      '',
      trOrFallback('render.originalTimezoneLabel', 'Original timezone') + ':',
      entryTzLabel
    ];
    if (viewConverted && viewTz) {
      var viewTzLabel = W.getTimeZoneLabel ? W.getTimeZoneLabel(viewTz) : viewTz;
      dateTooltipLines.push('');
      dateTooltipLines.push(trOrFallback('render.convertedTimezoneLabel', 'Converted timezone') + ':');
      dateTooltipLines.push(viewTzLabel);
      dateTooltipLines.push(trOrFallback('render.dateLabel', 'Date') + ': ' + (W.formatDateWithDay(viewConverted.viewDate) || '—'));
    }
    var timeTooltipLines = [
      trOrFallback('render.clockInOutRangeLabel', 'Clock In – Clock Out') + ': ' + (entry.clockIn || '—') + ' – ' + (entry.clockOut || '—'),
      '',
      trOrFallback('render.originalTimezoneLabel', 'Original timezone') + ':',
      entryTzLabel
    ];
    if (viewTz && viewConverted) {
      var viewTzLabelTime = W.getTimeZoneLabel ? W.getTimeZoneLabel(viewTz) : viewTz;
      var convertedRange = (viewConverted.viewClockIn || '—') + ' – ' + (viewConverted.viewClockOut || '—');
      if (viewConverted.clockOutNextDay) convertedRange += ' ' + trOrFallback('render.nextDaySuffix', '(+1 day)');
      timeTooltipLines.push('');
      timeTooltipLines.push(trOrFallback('render.convertedTimezoneLabel', 'Converted timezone') + ':');
      timeTooltipLines.push(viewTzLabelTime);
      timeTooltipLines.push(trOrFallback('render.clockInOutRangeLabel', 'Clock In – Clock Out') + ': ' + convertedRange);
    }
    var dateTooltipData = typeof W.buildAppTooltipData === 'function' ? W.buildAppTooltipData(dateTooltipLines) : '';
    var timeTooltipData = typeof W.buildAppTooltipData === 'function' ? W.buildAppTooltipData(timeTooltipLines) : '';
    var dateTooltipAttr = typeof W.buildAppTooltipAttr === 'function' ? W.buildAppTooltipAttr(dateTooltipLines) : '';
    var timeTooltipAttr = typeof W.buildAppTooltipAttr === 'function' ? W.buildAppTooltipAttr(timeTooltipLines) : '';
    return '<td class="entry-cell-checkbox"><input type="checkbox" class="entry-select-cb" data-id="' + entry.id + '" aria-label="' + trOrFallback('render.selectRowAria', 'Select row') + '"></td>' +
      '<td class="entry-cell-date" data-app-tooltip="' + dateTooltipData + '" aria-label="' + dateTooltipAttr + '">' + dateDisplay + '</td>' +
      '<td class="entry-cell-time entry-time" data-app-tooltip="' + timeTooltipData + '" aria-label="' + timeTooltipAttr + '">' + timeDisplay + '</td>' +
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
        summaryEl.setAttribute('data-selection-count', String(n));
        summaryEl.removeAttribute('hidden');
        summaryEl.setAttribute('aria-label', msg);
      } else {
        summaryEl.textContent = '';
        summaryEl.removeAttribute('data-selection-count');
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
  W.editSelectedEntry = async function editSelectedEntry() {
    if (typeof W.requireProfileAccess === 'function') {
      var canEdit = await W.requireProfileAccess(W.getProfile(), { actionKey: 'profileAuth.actions.editSelectedTaskEntries', action: 'Edit selected task entries' });
      if (!canEdit) return;
    }
    var orderedIds = W.getSelectedEntryIdsSortedForEdit();
    if (orderedIds.length === 0) return;
    if (orderedIds.length === 1) {
      var entry = W.getEntries().find(function (e) { return e.id === orderedIds[0]; });
      if (entry) W.openEditModal(entry);
      return;
    }
    if (typeof W.startEditEntryBatch === 'function') W.startEditEntryBatch(orderedIds);
  };
  W.deleteSelectedEntry = async function deleteSelectedEntry() {
    if (typeof W.requireProfileAccess === 'function') {
      var canDelete = await W.requireProfileAccess(W.getProfile(), { actionKey: 'profileAuth.actions.deleteSelectedTaskEntries', action: 'Delete selected task entries' });
      if (!canDelete) return;
    }
    var ids = W._selectedEntryIds || [];
    if (ids.length === 0) return;
    var idSet = {};
    ids.forEach(function (id) { idSet[id] = true; });
    W.openDeleteConfirmModal(function () {
      W.setEntries(W.getEntries().filter(function (e) { return !idSet[e.id]; }));
      W._selectedEntryIds = [];
      W.renderEntries();
      if (typeof W.updateEntryDateDuplicateHint === 'function') W.updateEntryDateDuplicateHint();
      if (typeof W.updateBulkEntryDateDuplicateHint === 'function') W.updateBulkEntryDateDuplicateHint();
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
      if (typeof W.syncEntriesScrollViewport === 'function') {
        requestAnimationFrame(function () {
          W.syncEntriesScrollViewport();
          if (typeof W.syncMainSectionsBottomEdge === 'function') W.syncMainSectionsBottomEdge();
        });
      }
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
    if (typeof W.syncEntriesScrollViewport === 'function') {
      requestAnimationFrame(function () {
        W.syncEntriesScrollViewport();
        if (typeof W.syncMainSectionsBottomEdge === 'function') W.syncMainSectionsBottomEdge();
      });
    }
  };
  W.computeStats = function computeStats(entries) {
    var totalWorkMinutes = 0, totalOvertimeMinutes = 0, workDays = 0, workOvertimeDays = 0, workNoOvertimeDays = 0, vacationDays = 0, holidayDays = 0, sickDays = 0;
    var weekdaysByStatus = {
      work: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      vacation: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      holiday: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      sick: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
    // For Work (and Overtime) minutes, keep per-weekday totals and per-weekday per-location totals (Mon–Fri).
    var weekdaysWorkMinutes = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    var weekdaysOvertimeMinutes = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    var weekdaysWorkMinutesByLocation = {
      1: { WFO: 0, WFH: 0, Anywhere: 0 },
      2: { WFO: 0, WFH: 0, Anywhere: 0 },
      3: { WFO: 0, WFH: 0, Anywhere: 0 },
      4: { WFO: 0, WFH: 0, Anywhere: 0 },
      5: { WFO: 0, WFH: 0, Anywhere: 0 }
    };
    var weekdaysOvertimeMinutesByLocation = {
      1: { WFO: 0, WFH: 0, Anywhere: 0 },
      2: { WFO: 0, WFH: 0, Anywhere: 0 },
      3: { WFO: 0, WFH: 0, Anywhere: 0 },
      4: { WFO: 0, WFH: 0, Anywhere: 0 },
      5: { WFO: 0, WFH: 0, Anywhere: 0 }
    };
    // For Work days only, keep per-weekday location breakdown (Mon–Fri).
    var weekdaysWorkByLocation = {
      1: { WFO: 0, WFH: 0, Anywhere: 0 },
      2: { WFO: 0, WFH: 0, Anywhere: 0 },
      3: { WFO: 0, WFH: 0, Anywhere: 0 },
      4: { WFO: 0, WFH: 0, Anywhere: 0 },
      5: { WFO: 0, WFH: 0, Anywhere: 0 }
    };
    var weekdaysWorkByLocationOvertime = {
      1: { WFO: 0, WFH: 0, Anywhere: 0 },
      2: { WFO: 0, WFH: 0, Anywhere: 0 },
      3: { WFO: 0, WFH: 0, Anywhere: 0 },
      4: { WFO: 0, WFH: 0, Anywhere: 0 },
      5: { WFO: 0, WFH: 0, Anywhere: 0 }
    };
    var weekdaysWorkByLocationNoOvertime = {
      1: { WFO: 0, WFH: 0, Anywhere: 0 },
      2: { WFO: 0, WFH: 0, Anywhere: 0 },
      3: { WFO: 0, WFH: 0, Anywhere: 0 },
      4: { WFO: 0, WFH: 0, Anywhere: 0 },
      5: { WFO: 0, WFH: 0, Anywhere: 0 }
    };
    function getWeekdayIndexFromDate(rawDate) {
      if (!rawDate && rawDate !== 0) return -1;
      var s = String(rawDate).trim();
      var m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (!m) return -1;
      var y = parseInt(m[1], 10);
      var mo = parseInt(m[2], 10);
      var d = parseInt(m[3], 10);
      if (isNaN(y) || isNaN(mo) || isNaN(d)) return -1;
      if (mo < 1 || mo > 12 || d < 1 || d > 31) return -1;
      return new Date(y, mo - 1, d).getDay();
    }
    entries.forEach(function (e) {
      const status = e.dayStatus || 'work';
      var weekdayIdx = getWeekdayIndexFromDate(e.date);
      if (status === 'work') {
        const dur = W.workingMinutes(e.clockIn, e.clockOut, e.breakMinutes);
        if (dur != null) {
          totalWorkMinutes += dur;
          workDays++;
          var ot = dur > W.STANDARD_WORK_MINUTES_PER_DAY ? (dur - W.STANDARD_WORK_MINUTES_PER_DAY) : 0;
          if (ot > 0) {
            totalOvertimeMinutes += ot;
            workOvertimeDays++;
          } else {
            workNoOvertimeDays++;
          }
          if (weekdayIdx >= 1 && weekdayIdx <= 5 && weekdaysByStatus.work) {
            weekdaysByStatus.work[weekdayIdx] = (weekdaysByStatus.work[weekdayIdx] || 0) + 1;
            // Also increment per-location counts only for entries that are counted as "work days".
            var loc = e.location || 'WFO';
            if (loc === 'AW') loc = 'Anywhere';
            if (!weekdaysWorkByLocation[weekdayIdx]) {
              weekdaysWorkByLocation[weekdayIdx] = { WFO: 0, WFH: 0, Anywhere: 0 };
            }
            if (!weekdaysWorkByLocationOvertime[weekdayIdx]) {
              weekdaysWorkByLocationOvertime[weekdayIdx] = { WFO: 0, WFH: 0, Anywhere: 0 };
            }
            if (!weekdaysWorkByLocationNoOvertime[weekdayIdx]) {
              weekdaysWorkByLocationNoOvertime[weekdayIdx] = { WFO: 0, WFH: 0, Anywhere: 0 };
            }
            if (loc === 'WFO') {
              weekdaysWorkByLocation[weekdayIdx].WFO += 1;
              if (ot > 0) weekdaysWorkByLocationOvertime[weekdayIdx].WFO += 1;
              else weekdaysWorkByLocationNoOvertime[weekdayIdx].WFO += 1;
            } else if (loc === 'WFH') {
              weekdaysWorkByLocation[weekdayIdx].WFH += 1;
              if (ot > 0) weekdaysWorkByLocationOvertime[weekdayIdx].WFH += 1;
              else weekdaysWorkByLocationNoOvertime[weekdayIdx].WFH += 1;
            } else {
              weekdaysWorkByLocation[weekdayIdx].Anywhere += 1;
              if (ot > 0) weekdaysWorkByLocationOvertime[weekdayIdx].Anywhere += 1;
              else weekdaysWorkByLocationNoOvertime[weekdayIdx].Anywhere += 1;
            }

            // Minutes breakdowns (Mon–Fri).
            weekdaysWorkMinutes[weekdayIdx] = (weekdaysWorkMinutes[weekdayIdx] || 0) + dur;
            if (ot > 0) weekdaysOvertimeMinutes[weekdayIdx] = (weekdaysOvertimeMinutes[weekdayIdx] || 0) + ot;
            if (!weekdaysWorkMinutesByLocation[weekdayIdx]) {
              weekdaysWorkMinutesByLocation[weekdayIdx] = { WFO: 0, WFH: 0, Anywhere: 0 };
            }
            if (!weekdaysOvertimeMinutesByLocation[weekdayIdx]) {
              weekdaysOvertimeMinutesByLocation[weekdayIdx] = { WFO: 0, WFH: 0, Anywhere: 0 };
            }
            if (loc === 'WFO') weekdaysWorkMinutesByLocation[weekdayIdx].WFO += dur;
            else if (loc === 'WFH') weekdaysWorkMinutesByLocation[weekdayIdx].WFH += dur;
            else weekdaysWorkMinutesByLocation[weekdayIdx].Anywhere += dur;

            if (ot > 0) {
              if (loc === 'WFO') weekdaysOvertimeMinutesByLocation[weekdayIdx].WFO += ot;
              else if (loc === 'WFH') weekdaysOvertimeMinutesByLocation[weekdayIdx].WFH += ot;
              else weekdaysOvertimeMinutesByLocation[weekdayIdx].Anywhere += ot;
            }
          }
        }
      } else if (status === 'vacation') {
        vacationDays++;
        if (weekdayIdx >= 1 && weekdayIdx <= 5 && weekdaysByStatus.vacation) {
          weekdaysByStatus.vacation[weekdayIdx] = (weekdaysByStatus.vacation[weekdayIdx] || 0) + 1;
        }
      } else if (status === 'holiday') {
        holidayDays++;
        if (weekdayIdx >= 1 && weekdayIdx <= 5 && weekdaysByStatus.holiday) {
          weekdaysByStatus.holiday[weekdayIdx] = (weekdaysByStatus.holiday[weekdayIdx] || 0) + 1;
        }
      } else if (status === 'sick') {
        sickDays++;
        if (weekdayIdx >= 1 && weekdayIdx <= 5 && weekdaysByStatus.sick) {
          weekdaysByStatus.sick[weekdayIdx] = (weekdaysByStatus.sick[weekdayIdx] || 0) + 1;
        }
      }
    });
    // Averages are only over days with status "work" that have valid duration
    const avgWorkMinutes = workDays > 0 ? Math.round(totalWorkMinutes / workDays) : 0;
    const avgOvertimeMinutes = workDays > 0 ? Math.round(totalOvertimeMinutes / workDays) : 0;
    return {
      totalWorkMinutes: totalWorkMinutes,
      totalOvertimeMinutes: totalOvertimeMinutes,
      avgWorkMinutes: avgWorkMinutes,
      avgOvertimeMinutes: avgOvertimeMinutes,
      workDays: workDays,
      workOvertimeDays: workOvertimeDays,
      workNoOvertimeDays: workNoOvertimeDays,
      vacationDays: vacationDays,
      holidayDays: holidayDays,
      sickDays: sickDays,
      weekdaysByStatus: weekdaysByStatus,
      weekdaysWorkByLocation: weekdaysWorkByLocation,
      weekdaysWorkByLocationOvertime: weekdaysWorkByLocationOvertime,
      weekdaysWorkByLocationNoOvertime: weekdaysWorkByLocationNoOvertime,
      weekdaysWorkMinutes: weekdaysWorkMinutes,
      weekdaysOvertimeMinutes: weekdaysOvertimeMinutes,
      weekdaysWorkMinutesByLocation: weekdaysWorkMinutesByLocation,
      weekdaysOvertimeMinutesByLocation: weekdaysOvertimeMinutesByLocation
    };
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
    var fmtNumber = (typeof W.formatDisplayNumber === 'function') ? W.formatDisplayNumber : function (v) { return String(v); };
    var fmtNumberFull = (typeof W.formatDisplayNumber === 'function')
      ? function (v) { return W.formatDisplayNumber(v, { compact: false }); }
      : function (v) { return String(v); };
    var fmtMinutesFull = (typeof W.formatMinutes === 'function')
      ? function (v) { return W.formatMinutes(v, { style: 'long', compactNumbers: false }); }
      : function (v) { return String(v); };
    function getDaysUnitLabel(count) {
      var n = Math.abs(Number(count));
      if (!isNaN(n) && n === 1) {
        return trOrFallback('statsSummary.box.dayUnit', 'day');
      }
      return trOrFallback('statsSummary.box.daysUnit', trOrFallback('modals.vacationDaysModal.daysUnit', 'days'));
    }
    function formatDaysCount(count) {
      return fmtNumberFull(count) + ' ' + getDaysUnitLabel(count);
    }
    function escAttr(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
    function pushLocationSectionLines(targetLines, header, detailLines) {
      if (!detailLines.length) return;
      targetLines.push('');
      targetLines.push(header + ':');
      detailLines.forEach(function (line) {
        targetLines.push('  ' + line);
      });
    }
    var overtimeDaysLabel = trOrFallback('filters.options.overtime.overtime', 'Overtime');
    var noOvertimeDaysLabel = trOrFallback('filters.options.overtime.no-overtime', 'No Overtime');
    function getLocationOvertimeDayCounts(dayIdx, locKey) {
      var otMap = (stats.weekdaysWorkByLocationOvertime && stats.weekdaysWorkByLocationOvertime[dayIdx])
        ? stats.weekdaysWorkByLocationOvertime[dayIdx] : null;
      var noOtMap = (stats.weekdaysWorkByLocationNoOvertime && stats.weekdaysWorkByLocationNoOvertime[dayIdx])
        ? stats.weekdaysWorkByLocationNoOvertime[dayIdx] : null;
      return {
        ot: otMap ? (otMap[locKey] || 0) : 0,
        noOt: noOtMap ? (noOtMap[locKey] || 0) : 0
      };
    }
    function formatOvertimeDayDetail(otDays, noOtDays) {
      var locTotal = otDays + noOtDays;
      if (locTotal <= 0) return '';
      var parts = [];
      if (otDays > 0) {
        parts.push(
          fmtNumberFull(otDays) + ' ' + overtimeDaysLabel + ' (' + formatPercentOfTotal(otDays, locTotal) + ')'
        );
      }
      if (noOtDays > 0) {
        parts.push(
          fmtNumberFull(noOtDays) + ' ' + noOvertimeDaysLabel + ' (' + formatPercentOfTotal(noOtDays, locTotal) + ')'
        );
      }
      return parts.join(' / ');
    }
    function appendOvertimeDayDetail(line, otDays, noOtDays) {
      var detail = formatOvertimeDayDetail(otDays, noOtDays);
      return detail ? line + ' · ' + detail : line;
    }
    function getWeekdayOvertimeDayCounts(dayIdx) {
      var ot = 0;
      var noOt = 0;
      ['WFO', 'WFH', 'Anywhere'].forEach(function (locKey) {
        var counts = getLocationOvertimeDayCounts(dayIdx, locKey);
        ot += counts.ot;
        noOt += counts.noOt;
      });
      return { ot: ot, noOt: noOt };
    }
    function buildWeekdayDayLine(fullLabel, count, totalForPercent, dayIdx) {
      if (count <= 0) return '';
      var dayOt = getWeekdayOvertimeDayCounts(dayIdx);
      return appendOvertimeDayDetail(
        fullLabel + ': ' + fmtNumberFull(count) + ' (' + formatPercentOfTotal(count, totalForPercent) + ')',
        dayOt.ot,
        dayOt.noOt
      );
    }
    function buildWeekdayMinutesLine(fullLabel, minutes, totalMinutes, dayIdx) {
      if (!minutes || minutes <= 0) return '';
      var dayOt = getWeekdayOvertimeDayCounts(dayIdx);
      return appendOvertimeDayDetail(
        fullLabel + ': ' + fmtMinutesFull(minutes) + ' (' + formatPercentOfTotal(minutes, totalMinutes) + ')',
        dayOt.ot,
        dayOt.noOt
      );
    }
    function buildWeekdayAvgMinutesLine(fullLabel, avgMinutes, dayIdx) {
      if (avgMinutes == null || avgMinutes <= 0) return '';
      var dayOt = getWeekdayOvertimeDayCounts(dayIdx);
      return appendOvertimeDayDetail(
        fullLabel + ': ' + fmtMinutesFull(avgMinutes),
        dayOt.ot,
        dayOt.noOt
      );
    }
    function buildLocationDayLine(locLabel, dayCount, totalForPercent, otDays, noOtDays) {
      if (dayCount <= 0) return '';
      return appendOvertimeDayDetail(
        locLabel + ': ' + fmtNumberFull(dayCount) + ' (' + formatPercentOfTotal(dayCount, totalForPercent) + ')',
        otDays,
        noOtDays
      );
    }
    function buildLocationMinutesLine(locLabel, minutes, totalMinutes, otDays, noOtDays) {
      if (minutes <= 0) return '';
      return appendOvertimeDayDetail(
        locLabel + ': ' + fmtMinutesFull(minutes) + ' (' + formatPercentOfTotal(minutes, totalMinutes) + ')',
        otDays,
        noOtDays
      );
    }
    function buildLocationAvgMinutesLine(locLabel, avgMinutes, otDays, noOtDays) {
      if (avgMinutes == null || avgMinutes <= 0) return '';
      return appendOvertimeDayDetail(
        locLabel + ': ' + fmtMinutesFull(avgMinutes),
        otDays,
        noOtDays
      );
    }
    function aggregateLocationDayCounts(idxs) {
      var totals = {
        WFO: { days: 0, ot: 0, noOt: 0 },
        WFH: { days: 0, ot: 0, noOt: 0 },
        Anywhere: { days: 0, ot: 0, noOt: 0 }
      };
      idxs.forEach(function (dayIdx) {
        ['WFO', 'WFH', 'Anywhere'].forEach(function (locKey) {
          var locMap = (stats.weekdaysWorkByLocation && stats.weekdaysWorkByLocation[dayIdx])
            ? stats.weekdaysWorkByLocation[dayIdx] : null;
          var counts = getLocationOvertimeDayCounts(dayIdx, locKey);
          totals[locKey].days += locMap ? (locMap[locKey] || 0) : 0;
          totals[locKey].ot += counts.ot;
          totals[locKey].noOt += counts.noOt;
        });
      });
      return totals;
    }
    function buildWorkDaysHeaderLine(statusLabel, totalForType) {
      var line = statusLabel + ': ' + formatDaysCount(totalForType);
      if (totalForType > 0) {
        line = appendOvertimeDayDetail(line, stats.workOvertimeDays || 0, stats.workNoOvertimeDays || 0);
      }
      return line;
    }
    function buildTooltipText(lines) {
      // Join lines with real newline characters for consistent tooltip rendering.
      // Keep intentional blank lines (''), but drop null/undefined.
      return lines.filter(function (l) { return l !== null && l !== undefined; }).join('\n');
    }
    function buildCardTooltip(lines) {
      return typeof W.buildAppTooltipAttr === 'function'
        ? W.buildAppTooltipAttr(lines)
        : escAttr(buildTooltipText(lines));
    }
    function buildCardTooltipData(lines) {
      return typeof W.buildAppTooltipData === 'function'
        ? W.buildAppTooltipData(lines)
        : escAttr(buildTooltipText(lines).replace(/\n/g, '\\n'));
    }
    function formatPercentOfTotal(count, total) {
      if (total <= 0) return '0%';
      var pct = (count / total) * 100;
      var rounded = Math.round(pct * 10) / 10;
      if (rounded % 1 === 0) return String(Math.round(rounded)) + '%';
      return rounded.toFixed(1) + '%';
    }
    function buildDayTypeTooltip(statusKey, statusLabel, totalForType, dataMode) {
      var weekdaysFull = (W.I18N && typeof W.I18N.resolve === 'function')
        ? W.I18N.resolve('calendarStats.weekdaysFull', W.currentLanguage)
        : null;
      var weekdaysShort = (W.I18N && typeof W.I18N.resolve === 'function')
        ? W.I18N.resolve('calendarStats.weekdaysShort', W.currentLanguage)
        : null;
      var fullNames = (Array.isArray(weekdaysFull) && weekdaysFull.length >= 7)
        ? weekdaysFull
        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var weekdayTokens = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
      var shortNames = (Array.isArray(weekdaysShort) && weekdaysShort.length >= 7)
        ? weekdaysShort
        : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      var weekdayIndexes = [1, 2, 3, 4, 5];
      var byWeekday = (stats.weekdaysByStatus && stats.weekdaysByStatus[statusKey]) ? stats.weekdaysByStatus[statusKey] : {};
      // Avoid new i18n key dependencies for tooltips.
      // Tooltip lines use only already-localized tokens (weekday full names + location labels + status labels).
      var showLocation = statusKey === 'work' && stats.weekdaysWorkByLocation;
      var wfoLabel = trOrFallback('statsSummary.datasetWfo', 'Office (WFO)');
      var wfhLabel = trOrFallback('statsSummary.datasetWfh', 'Home (WFH)');
      var anywhereLabel = trOrFallback('render.locationAnywhereLabel', 'Anywhere');
      var locationHeader = trOrFallback('clockEntry.locationLabel', 'Location');
      var weekdayHeader = trOrFallback('filters.dayName', 'Day name');

      // Card-level tooltip: show aggregated location totals across Mon–Fri for Work Days.
      var locTotals = aggregateLocationDayCounts(weekdayIndexes);

      var lines = [showLocation && totalForType > 0
        ? buildWorkDaysHeaderLine(statusLabel, totalForType)
        : (statusLabel + ': ' + formatDaysCount(totalForType))];

      if (showLocation && totalForType > 0) {
        var locSummaryLines = [];
        var wfoLine = buildLocationDayLine(wfoLabel, locTotals.WFO.days, totalForType, locTotals.WFO.ot, locTotals.WFO.noOt);
        var wfhLine = buildLocationDayLine(wfhLabel, locTotals.WFH.days, totalForType, locTotals.WFH.ot, locTotals.WFH.noOt);
        var anyLine = buildLocationDayLine(anywhereLabel, locTotals.Anywhere.days, totalForType, locTotals.Anywhere.ot, locTotals.Anywhere.noOt);
        if (wfoLine) locSummaryLines.push(wfoLine);
        if (wfhLine) locSummaryLines.push(wfhLine);
        if (anyLine) locSummaryLines.push(anyLine);
        pushLocationSectionLines(lines, locationHeader, locSummaryLines);
      }

      lines.push('');
      lines.push(weekdayHeader + ':');

      weekdayIndexes.forEach(function (dayIdx, i) {
        var count = byWeekday[dayIdx] || 0;
        var shortLabel = shortNames[dayIdx] != null ? shortNames[dayIdx] : weekdayTokens[i];
        var fullLabel = fullNames[dayIdx] != null ? fullNames[dayIdx] : shortLabel;
        var percent = formatPercentOfTotal(count, totalForType);
        if (showLocation && count > 0) {
          lines.push(buildWeekdayDayLine(fullLabel, count, totalForType, dayIdx));
        } else {
          lines.push(fullLabel + ': ' + fmtNumberFull(count) + ' (' + percent + ')');
        }
        if (showLocation && count > 0) {
          var locMap = (stats.weekdaysWorkByLocation && stats.weekdaysWorkByLocation[dayIdx]) ? stats.weekdaysWorkByLocation[dayIdx] : null;
          var wfoCount = locMap ? (locMap.WFO || 0) : 0;
          var wfhCount = locMap ? (locMap.WFH || 0) : 0;
          var anyCount = locMap ? (locMap.Anywhere || 0) : 0;
          var wfoOt = getLocationOvertimeDayCounts(dayIdx, 'WFO');
          var wfhOt = getLocationOvertimeDayCounts(dayIdx, 'WFH');
          var anyOt = getLocationOvertimeDayCounts(dayIdx, 'Anywhere');

          var wfoDayLine = buildLocationDayLine(wfoLabel, wfoCount, count, wfoOt.ot, wfoOt.noOt);
          var wfhDayLine = buildLocationDayLine(wfhLabel, wfhCount, count, wfhOt.ot, wfhOt.noOt);
          var anyDayLine = buildLocationDayLine(anywhereLabel, anyCount, count, anyOt.ot, anyOt.noOt);
          if (wfoDayLine) lines.push('  ' + wfoDayLine);
          if (wfhDayLine) lines.push('  ' + wfhDayLine);
          if (anyDayLine) lines.push('  ' + anyDayLine);
        }
      });

      // No extra hint line (prevents missing-i18n fallbacks).
      return dataMode ? buildCardTooltipData(lines) : buildCardTooltip(lines);
    }
    function buildWeekdayChipsInline(statusKey, statusLabel, totalForType) {
      var weekdaysFull = (W.I18N && typeof W.I18N.resolve === 'function')
        ? W.I18N.resolve('calendarStats.weekdaysFull', W.currentLanguage)
        : null;
      var weekdaysShort = (W.I18N && typeof W.I18N.resolve === 'function')
        ? W.I18N.resolve('calendarStats.weekdaysShort', W.currentLanguage)
        : null;
      var fullNames = (Array.isArray(weekdaysFull) && weekdaysFull.length >= 7)
        ? weekdaysFull
        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var weekdayTokens = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
      var shortNames = (Array.isArray(weekdaysShort) && weekdaysShort.length >= 7)
        ? weekdaysShort
        : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      var weekdayIndexes = [1, 2, 3, 4, 5];
      var byWeekday = (stats.weekdaysByStatus && stats.weekdaysByStatus[statusKey]) ? stats.weekdaysByStatus[statusKey] : {};
      var chips = '';
      var wfoLabel = trOrFallback('statsSummary.datasetWfo', 'Office (WFO)');
      var wfhLabel = trOrFallback('statsSummary.datasetWfh', 'Home (WFH)');
      var anywhereLabel = trOrFallback('render.locationAnywhereLabel', 'Anywhere');
      weekdayIndexes.forEach(function (dayIdx, i) {
        var count = byWeekday[dayIdx] || 0;
        var percent = formatPercentOfTotal(count, totalForType);
        var shortLabel = shortNames[dayIdx] != null ? shortNames[dayIdx] : weekdayTokens[i];
        var fullDay = fullNames[dayIdx] != null ? fullNames[dayIdx] : shortLabel;
        var tooltipLines = [];
        if (statusKey === 'work') {
          tooltipLines.push(buildWorkDaysHeaderLine(statusLabel, totalForType));
        } else {
          tooltipLines.push(statusLabel + ': ' + formatDaysCount(totalForType));
        }
        if (statusKey === 'work' && count > 0) {
          tooltipLines.push(buildWeekdayDayLine(fullDay, count, totalForType, dayIdx));
        } else {
          tooltipLines.push(fullDay + ': ' + fmtNumberFull(count) + ' (' + percent + ')');
        }
        // Include location breakdown only for the Work Days card.
        if (statusKey === 'work') {
          var locMap = (stats.weekdaysWorkByLocation && stats.weekdaysWorkByLocation[dayIdx]) ? stats.weekdaysWorkByLocation[dayIdx] : null;
          var wfoCount = locMap ? (locMap.WFO || 0) : 0;
          var wfhCount = locMap ? (locMap.WFH || 0) : 0;
          var anyCount = locMap ? (locMap.Anywhere || 0) : 0;
          if (count > 0) {
            var wfoOt = getLocationOvertimeDayCounts(dayIdx, 'WFO');
            var wfhOt = getLocationOvertimeDayCounts(dayIdx, 'WFH');
            var anyOt = getLocationOvertimeDayCounts(dayIdx, 'Anywhere');
            var wfoDayLine = buildLocationDayLine(wfoLabel, wfoCount, count, wfoOt.ot, wfoOt.noOt);
            var wfhDayLine = buildLocationDayLine(wfhLabel, wfhCount, count, wfhOt.ot, wfhOt.noOt);
            var anyDayLine = buildLocationDayLine(anywhereLabel, anyCount, count, anyOt.ot, anyOt.noOt);
            if (wfoDayLine) tooltipLines.push('  ' + wfoDayLine);
            if (wfhDayLine) tooltipLines.push('  ' + wfhDayLine);
            if (anyDayLine) tooltipLines.push('  ' + anyDayLine);
          }
        }
        var tooltipAttr = buildCardTooltip(tooltipLines);
        var tooltipData = buildCardTooltipData(tooltipLines);
        var emptyClass = count > 0 ? '' : ' stat-weekday-chip--empty';
        chips += '<button type="button" class="stat-weekday-chip' + emptyClass + '" data-stats-tooltip="' + tooltipData + '" aria-label="' + tooltipAttr + '">' +
          '<span class="stat-weekday-chip-day">' +
            '<span class="stat-weekday-chip-token">' + shortLabel + '</span>' +
            '<span class="stat-weekday-chip-name">' + fullDay + '</span>' +
          '</span>' +
          '<span class="stat-weekday-chip-count">' + fmtNumber(count) + '</span>' +
        '</button>';
      });
      return '<div class="stat-day-weekdays" aria-label="' + escAttr(statusLabel + ' weekday breakdown') + '">' + chips + '</div>';
    }

    function buildWorkMinutesComboTooltipLines() {
      var lines = [
        totalWorkingHoursLabel + ': ' + fmtMinutesFull(stats.totalWorkMinutes),
        avgPerWorkDayLabel + ': ' + fmtMinutesFull(stats.avgWorkMinutes)
      ];

      if (!stats.totalWorkMinutes || stats.totalWorkMinutes <= 0) return lines;

      var weekdaysFull = (W.I18N && typeof W.I18N.resolve === 'function')
        ? W.I18N.resolve('calendarStats.weekdaysFull', W.currentLanguage)
        : null;
      var weekdaysShort = (W.I18N && typeof W.I18N.resolve === 'function')
        ? W.I18N.resolve('calendarStats.weekdaysShort', W.currentLanguage)
        : null;
      var fullNames = (Array.isArray(weekdaysFull) && weekdaysFull.length >= 7)
        ? weekdaysFull
        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var shortNames = (Array.isArray(weekdaysShort) && weekdaysShort.length >= 7)
        ? weekdaysShort
        : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

      var wfoLabel = trOrFallback('statsSummary.datasetWfo', 'Office (WFO)');
      var wfhLabel = trOrFallback('statsSummary.datasetWfh', 'Home (WFH)');
      var anywhereLabel = trOrFallback('render.locationAnywhereLabel', 'Anywhere');
      var locationHeader = trOrFallback('clockEntry.locationLabel', 'Location');
      var weekdayHeader = trOrFallback('filters.dayName', 'Day name');

      var idxs = [1, 2, 3, 4, 5];
      var wfoTotal = 0, wfhTotal = 0, anyTotal = 0;
      idxs.forEach(function (dayIdx) {
        var locMap = (stats.weekdaysWorkMinutesByLocation && stats.weekdaysWorkMinutesByLocation[dayIdx]) ? stats.weekdaysWorkMinutesByLocation[dayIdx] : null;
        wfoTotal += locMap ? (locMap.WFO || 0) : 0;
        wfhTotal += locMap ? (locMap.WFH || 0) : 0;
        anyTotal += locMap ? (locMap.Anywhere || 0) : 0;
      });
      var locTotals = aggregateLocationDayCounts(idxs);

      var locSummaryLines = [];
      var wfoWorkLine = buildLocationMinutesLine(wfoLabel, wfoTotal, stats.totalWorkMinutes, locTotals.WFO.ot, locTotals.WFO.noOt);
      var wfhWorkLine = buildLocationMinutesLine(wfhLabel, wfhTotal, stats.totalWorkMinutes, locTotals.WFH.ot, locTotals.WFH.noOt);
      var anyWorkLine = buildLocationMinutesLine(anywhereLabel, anyTotal, stats.totalWorkMinutes, locTotals.Anywhere.ot, locTotals.Anywhere.noOt);
      if (wfoWorkLine) locSummaryLines.push(wfoWorkLine);
      if (wfhWorkLine) locSummaryLines.push(wfhWorkLine);
      if (anyWorkLine) locSummaryLines.push(anyWorkLine);
      pushLocationSectionLines(lines, locationHeader, locSummaryLines);

      lines.push('');
      lines.push(weekdayHeader + ':');

      idxs.forEach(function (dayIdx) {
        var minutes = (stats.weekdaysWorkMinutes && stats.weekdaysWorkMinutes[dayIdx]) ? stats.weekdaysWorkMinutes[dayIdx] : 0;
        if (!minutes || minutes <= 0) return;
        lines.push(buildWeekdayMinutesLine(fullNames[dayIdx] || shortNames[dayIdx] || '', minutes, stats.totalWorkMinutes, dayIdx));

        var locMap = (stats.weekdaysWorkMinutesByLocation && stats.weekdaysWorkMinutesByLocation[dayIdx]) ? stats.weekdaysWorkMinutesByLocation[dayIdx] : null;
        if (!locMap) return;
        var wfo = locMap.WFO || 0;
        var wfh = locMap.WFH || 0;
        var any = locMap.Anywhere || 0;
        var wfoOt = getLocationOvertimeDayCounts(dayIdx, 'WFO');
        var wfhOt = getLocationOvertimeDayCounts(dayIdx, 'WFH');
        var anyOt = getLocationOvertimeDayCounts(dayIdx, 'Anywhere');
        var wfoMinLine = buildLocationMinutesLine(wfoLabel, wfo, minutes, wfoOt.ot, wfoOt.noOt);
        var wfhMinLine = buildLocationMinutesLine(wfhLabel, wfh, minutes, wfhOt.ot, wfhOt.noOt);
        var anyMinLine = buildLocationMinutesLine(anywhereLabel, any, minutes, anyOt.ot, anyOt.noOt);
        if (wfoMinLine) lines.push('  ' + wfoMinLine);
        if (wfhMinLine) lines.push('  ' + wfhMinLine);
        if (anyMinLine) lines.push('  ' + anyMinLine);
      });

      return lines;
    }

    function buildOvertimeMinutesComboTooltipLines() {
      var lines = [
        totalOvertimeLabel + ': ' + fmtMinutesFull(stats.totalOvertimeMinutes),
        avgOvertimeLabel + ': ' + fmtMinutesFull(stats.avgOvertimeMinutes)
      ];

      if (!stats.totalOvertimeMinutes || stats.totalOvertimeMinutes <= 0) return lines;

      var weekdaysFull = (W.I18N && typeof W.I18N.resolve === 'function')
        ? W.I18N.resolve('calendarStats.weekdaysFull', W.currentLanguage)
        : null;
      var weekdaysShort = (W.I18N && typeof W.I18N.resolve === 'function')
        ? W.I18N.resolve('calendarStats.weekdaysShort', W.currentLanguage)
        : null;
      var fullNames = (Array.isArray(weekdaysFull) && weekdaysFull.length >= 7)
        ? weekdaysFull
        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var shortNames = (Array.isArray(weekdaysShort) && weekdaysShort.length >= 7)
        ? weekdaysShort
        : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

      var wfoLabel = trOrFallback('statsSummary.datasetWfo', 'Office (WFO)');
      var wfhLabel = trOrFallback('statsSummary.datasetWfh', 'Home (WFH)');
      var anywhereLabel = trOrFallback('render.locationAnywhereLabel', 'Anywhere');
      var locationHeader = trOrFallback('clockEntry.locationLabel', 'Location');
      var weekdayHeader = trOrFallback('filters.dayName', 'Day name');

      var idxs = [1, 2, 3, 4, 5];
      var wfoTotal = 0, wfhTotal = 0, anyTotal = 0;
      idxs.forEach(function (dayIdx) {
        var locMap = (stats.weekdaysOvertimeMinutesByLocation && stats.weekdaysOvertimeMinutesByLocation[dayIdx]) ? stats.weekdaysOvertimeMinutesByLocation[dayIdx] : null;
        wfoTotal += locMap ? (locMap.WFO || 0) : 0;
        wfhTotal += locMap ? (locMap.WFH || 0) : 0;
        anyTotal += locMap ? (locMap.Anywhere || 0) : 0;
      });
      var locTotals = aggregateLocationDayCounts(idxs);

      var locSummaryLines = [];
      var wfoOtLine = buildLocationMinutesLine(wfoLabel, wfoTotal, stats.totalOvertimeMinutes, locTotals.WFO.ot, locTotals.WFO.noOt);
      var wfhOtLine = buildLocationMinutesLine(wfhLabel, wfhTotal, stats.totalOvertimeMinutes, locTotals.WFH.ot, locTotals.WFH.noOt);
      var anyOtLine = buildLocationMinutesLine(anywhereLabel, anyTotal, stats.totalOvertimeMinutes, locTotals.Anywhere.ot, locTotals.Anywhere.noOt);
      if (wfoOtLine) locSummaryLines.push(wfoOtLine);
      if (wfhOtLine) locSummaryLines.push(wfhOtLine);
      if (anyOtLine) locSummaryLines.push(anyOtLine);
      pushLocationSectionLines(lines, locationHeader, locSummaryLines);

      lines.push('');
      lines.push(weekdayHeader + ':');

      idxs.forEach(function (dayIdx) {
        var minutes = (stats.weekdaysOvertimeMinutes && stats.weekdaysOvertimeMinutes[dayIdx]) ? stats.weekdaysOvertimeMinutes[dayIdx] : 0;
        if (!minutes || minutes <= 0) return;
        lines.push(buildWeekdayMinutesLine(fullNames[dayIdx] || '', minutes, stats.totalOvertimeMinutes, dayIdx));

        var locMap = (stats.weekdaysOvertimeMinutesByLocation && stats.weekdaysOvertimeMinutesByLocation[dayIdx]) ? stats.weekdaysOvertimeMinutesByLocation[dayIdx] : null;
        if (!locMap) return;
        var wfo = locMap.WFO || 0;
        var wfh = locMap.WFH || 0;
        var any = locMap.Anywhere || 0;
        var wfoOt = getLocationOvertimeDayCounts(dayIdx, 'WFO');
        var wfhOt = getLocationOvertimeDayCounts(dayIdx, 'WFH');
        var anyOt = getLocationOvertimeDayCounts(dayIdx, 'Anywhere');
        var wfoOtMinLine = buildLocationMinutesLine(wfoLabel, wfo, minutes, wfoOt.ot, wfoOt.noOt);
        var wfhOtMinLine = buildLocationMinutesLine(wfhLabel, wfh, minutes, wfhOt.ot, wfhOt.noOt);
        var anyOtMinLine = buildLocationMinutesLine(anywhereLabel, any, minutes, anyOt.ot, anyOt.noOt);
        if (wfoOtMinLine) lines.push('  ' + wfoOtMinLine);
        if (wfhOtMinLine) lines.push('  ' + wfhOtMinLine);
        if (anyOtMinLine) lines.push('  ' + anyOtMinLine);
      });

      return lines;
    }

    function buildAvgWorkMinutesComboTooltipLines() {
      var lines = [
        avgPerWorkDayLabel + ': ' + fmtMinutesFull(stats.avgWorkMinutes)
      ];

      if (!stats.totalWorkMinutes || stats.totalWorkMinutes <= 0) return lines;

      var weekdaysFull = (W.I18N && typeof W.I18N.resolve === 'function')
        ? W.I18N.resolve('calendarStats.weekdaysFull', W.currentLanguage)
        : null;
      var weekdaysShort = (W.I18N && typeof W.I18N.resolve === 'function')
        ? W.I18N.resolve('calendarStats.weekdaysShort', W.currentLanguage)
        : null;
      var fullNames = (Array.isArray(weekdaysFull) && weekdaysFull.length >= 7)
        ? weekdaysFull
        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var shortNames = (Array.isArray(weekdaysShort) && weekdaysShort.length >= 7)
        ? weekdaysShort
        : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

      var wfoLabel = trOrFallback('statsSummary.datasetWfo', 'Office (WFO)');
      var wfhLabel = trOrFallback('statsSummary.datasetWfh', 'Home (WFH)');
      var anywhereLabel = trOrFallback('render.locationAnywhereLabel', 'Anywhere');
      var locationHeader = trOrFallback('clockEntry.locationLabel', 'Location');
      var weekdayHeader = trOrFallback('filters.dayName', 'Day name');

      var idxs = [1, 2, 3, 4, 5];

      // Totals for average-by-location use: total minutes for location / total workdays for location.
      var wfoMin = 0, wfhMin = 0, anyMin = 0;
      var wfoDays = 0, wfhDays = 0, anyDays = 0;
      idxs.forEach(function (dayIdx) {
        var mLoc = (stats.weekdaysWorkMinutesByLocation && stats.weekdaysWorkMinutesByLocation[dayIdx]) ? stats.weekdaysWorkMinutesByLocation[dayIdx] : null;
        var cLoc = (stats.weekdaysWorkByLocation && stats.weekdaysWorkByLocation[dayIdx]) ? stats.weekdaysWorkByLocation[dayIdx] : null;
        if (mLoc) {
          wfoMin += (mLoc.WFO || 0);
          wfhMin += (mLoc.WFH || 0);
          anyMin += (mLoc.Anywhere || 0);
        }
        if (cLoc) {
          wfoDays += (cLoc.WFO || 0);
          wfhDays += (cLoc.WFH || 0);
          anyDays += (cLoc.Anywhere || 0);
        }
      });
      var locTotals = aggregateLocationDayCounts(idxs);

      var locSummaryLines = [];
      if (wfoDays > 0) {
        var wfoAvgLine = buildLocationAvgMinutesLine(wfoLabel, Math.round(wfoMin / wfoDays), locTotals.WFO.ot, locTotals.WFO.noOt);
        if (wfoAvgLine) locSummaryLines.push(wfoAvgLine);
      }
      if (wfhDays > 0) {
        var wfhAvgLine = buildLocationAvgMinutesLine(wfhLabel, Math.round(wfhMin / wfhDays), locTotals.WFH.ot, locTotals.WFH.noOt);
        if (wfhAvgLine) locSummaryLines.push(wfhAvgLine);
      }
      if (anyDays > 0) {
        var anyAvgLine = buildLocationAvgMinutesLine(anywhereLabel, Math.round(anyMin / anyDays), locTotals.Anywhere.ot, locTotals.Anywhere.noOt);
        if (anyAvgLine) locSummaryLines.push(anyAvgLine);
      }
      pushLocationSectionLines(lines, locationHeader, locSummaryLines);

      lines.push('');
      lines.push(weekdayHeader + ':');
      idxs.forEach(function (dayIdx) {
        var minutes = (stats.weekdaysWorkMinutes && stats.weekdaysWorkMinutes[dayIdx]) ? stats.weekdaysWorkMinutes[dayIdx] : 0;
        var days = (stats.weekdaysByStatus && stats.weekdaysByStatus.work && stats.weekdaysByStatus.work[dayIdx]) ? stats.weekdaysByStatus.work[dayIdx] : 0;
        if (!minutes || minutes <= 0 || !days || days <= 0) return;
        var avg = Math.round(minutes / days);
        lines.push(buildWeekdayAvgMinutesLine(fullNames[dayIdx] || '', avg, dayIdx));

        var mLoc = (stats.weekdaysWorkMinutesByLocation && stats.weekdaysWorkMinutesByLocation[dayIdx]) ? stats.weekdaysWorkMinutesByLocation[dayIdx] : null;
        var cLoc = (stats.weekdaysWorkByLocation && stats.weekdaysWorkByLocation[dayIdx]) ? stats.weekdaysWorkByLocation[dayIdx] : null;
        if (!mLoc || !cLoc) return;
        var wfoD = cLoc.WFO || 0;
        var wfhD = cLoc.WFH || 0;
        var anyD = cLoc.Anywhere || 0;
        var wfoOt = getLocationOvertimeDayCounts(dayIdx, 'WFO');
        var wfhOt = getLocationOvertimeDayCounts(dayIdx, 'WFH');
        var anyOt = getLocationOvertimeDayCounts(dayIdx, 'Anywhere');
        var wfoAvgDayLine = buildLocationAvgMinutesLine(wfoLabel, wfoD > 0 ? Math.round((mLoc.WFO || 0) / wfoD) : 0, wfoOt.ot, wfoOt.noOt);
        var wfhAvgDayLine = buildLocationAvgMinutesLine(wfhLabel, wfhD > 0 ? Math.round((mLoc.WFH || 0) / wfhD) : 0, wfhOt.ot, wfhOt.noOt);
        var anyAvgDayLine = buildLocationAvgMinutesLine(anywhereLabel, anyD > 0 ? Math.round((mLoc.Anywhere || 0) / anyD) : 0, anyOt.ot, anyOt.noOt);
        if (wfoAvgDayLine) lines.push('  ' + wfoAvgDayLine);
        if (wfhAvgDayLine) lines.push('  ' + wfhAvgDayLine);
        if (anyAvgDayLine) lines.push('  ' + anyAvgDayLine);
      });

      return lines;
    }

    function buildAvgOvertimeMinutesComboTooltipLines() {
      var lines = [
        avgOvertimeLabel + ': ' + fmtMinutesFull(stats.avgOvertimeMinutes)
      ];

      if (!stats.totalOvertimeMinutes || stats.totalOvertimeMinutes <= 0) return lines;

      var weekdaysFull = (W.I18N && typeof W.I18N.resolve === 'function')
        ? W.I18N.resolve('calendarStats.weekdaysFull', W.currentLanguage)
        : null;
      var weekdaysShort = (W.I18N && typeof W.I18N.resolve === 'function')
        ? W.I18N.resolve('calendarStats.weekdaysShort', W.currentLanguage)
        : null;
      var fullNames = (Array.isArray(weekdaysFull) && weekdaysFull.length >= 7)
        ? weekdaysFull
        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var shortNames = (Array.isArray(weekdaysShort) && weekdaysShort.length >= 7)
        ? weekdaysShort
        : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

      var wfoLabel = trOrFallback('statsSummary.datasetWfo', 'Office (WFO)');
      var wfhLabel = trOrFallback('statsSummary.datasetWfh', 'Home (WFH)');
      var anywhereLabel = trOrFallback('render.locationAnywhereLabel', 'Anywhere');
      var locationHeader = trOrFallback('clockEntry.locationLabel', 'Location');
      var weekdayHeader = trOrFallback('filters.dayName', 'Day name');

      var idxs = [1, 2, 3, 4, 5];

      var wfoMin = 0, wfhMin = 0, anyMin = 0;
      var wfoDays = 0, wfhDays = 0, anyDays = 0;
      idxs.forEach(function (dayIdx) {
        var mLoc = (stats.weekdaysOvertimeMinutesByLocation && stats.weekdaysOvertimeMinutesByLocation[dayIdx]) ? stats.weekdaysOvertimeMinutesByLocation[dayIdx] : null;
        var cLoc = (stats.weekdaysWorkByLocation && stats.weekdaysWorkByLocation[dayIdx]) ? stats.weekdaysWorkByLocation[dayIdx] : null;
        if (mLoc) {
          wfoMin += (mLoc.WFO || 0);
          wfhMin += (mLoc.WFH || 0);
          anyMin += (mLoc.Anywhere || 0);
        }
        if (cLoc) {
          wfoDays += (cLoc.WFO || 0);
          wfhDays += (cLoc.WFH || 0);
          anyDays += (cLoc.Anywhere || 0);
        }
      });
      var locTotals = aggregateLocationDayCounts(idxs);

      var locSummaryLines = [];
      if (wfoDays > 0) {
        var wfoAvgOtLine = buildLocationAvgMinutesLine(wfoLabel, Math.round(wfoMin / wfoDays), locTotals.WFO.ot, locTotals.WFO.noOt);
        if (wfoAvgOtLine) locSummaryLines.push(wfoAvgOtLine);
      }
      if (wfhDays > 0) {
        var wfhAvgOtLine = buildLocationAvgMinutesLine(wfhLabel, Math.round(wfhMin / wfhDays), locTotals.WFH.ot, locTotals.WFH.noOt);
        if (wfhAvgOtLine) locSummaryLines.push(wfhAvgOtLine);
      }
      if (anyDays > 0) {
        var anyAvgOtLine = buildLocationAvgMinutesLine(anywhereLabel, Math.round(anyMin / anyDays), locTotals.Anywhere.ot, locTotals.Anywhere.noOt);
        if (anyAvgOtLine) locSummaryLines.push(anyAvgOtLine);
      }
      pushLocationSectionLines(lines, locationHeader, locSummaryLines);

      lines.push('');
      lines.push(weekdayHeader + ':');
      idxs.forEach(function (dayIdx) {
        var minutes = (stats.weekdaysOvertimeMinutes && stats.weekdaysOvertimeMinutes[dayIdx]) ? stats.weekdaysOvertimeMinutes[dayIdx] : 0;
        var days = (stats.weekdaysByStatus && stats.weekdaysByStatus.work && stats.weekdaysByStatus.work[dayIdx]) ? stats.weekdaysByStatus.work[dayIdx] : 0;
        if (!minutes || minutes <= 0 || !days || days <= 0) return;
        var avg = Math.round(minutes / days);
        lines.push(buildWeekdayAvgMinutesLine(fullNames[dayIdx] || '', avg, dayIdx));

        var mLoc = (stats.weekdaysOvertimeMinutesByLocation && stats.weekdaysOvertimeMinutesByLocation[dayIdx]) ? stats.weekdaysOvertimeMinutesByLocation[dayIdx] : null;
        var cLoc = (stats.weekdaysWorkByLocation && stats.weekdaysWorkByLocation[dayIdx]) ? stats.weekdaysWorkByLocation[dayIdx] : null;
        if (!mLoc || !cLoc) return;
        var wfoD = cLoc.WFO || 0;
        var wfhD = cLoc.WFH || 0;
        var anyD = cLoc.Anywhere || 0;
        var wfoOt = getLocationOvertimeDayCounts(dayIdx, 'WFO');
        var wfhOt = getLocationOvertimeDayCounts(dayIdx, 'WFH');
        var anyOt = getLocationOvertimeDayCounts(dayIdx, 'Anywhere');
        var wfoAvgOtDayLine = buildLocationAvgMinutesLine(wfoLabel, wfoD > 0 ? Math.round((mLoc.WFO || 0) / wfoD) : 0, wfoOt.ot, wfoOt.noOt);
        var wfhAvgOtDayLine = buildLocationAvgMinutesLine(wfhLabel, wfhD > 0 ? Math.round((mLoc.WFH || 0) / wfhD) : 0, wfhOt.ot, wfhOt.noOt);
        var anyAvgOtDayLine = buildLocationAvgMinutesLine(anywhereLabel, anyD > 0 ? Math.round((mLoc.Anywhere || 0) / anyD) : 0, anyOt.ot, anyOt.noOt);
        if (wfoAvgOtDayLine) lines.push('  ' + wfoAvgOtDayLine);
        if (wfhAvgOtDayLine) lines.push('  ' + wfhAvgOtDayLine);
        if (anyAvgOtDayLine) lines.push('  ' + anyAvgOtDayLine);
      });

      return lines;
    }
    var workComboTooltipLines = buildWorkMinutesComboTooltipLines();
    var workComboTooltip = buildCardTooltip(workComboTooltipLines);
    var workComboTooltipData = buildCardTooltipData(workComboTooltipLines);

    var overtimeComboTooltipLines = buildOvertimeMinutesComboTooltipLines();
    var overtimeComboTooltip = buildCardTooltip(overtimeComboTooltipLines);
    var overtimeComboTooltipData = buildCardTooltipData(overtimeComboTooltipLines);

    var avgWorkComboTooltipLines = buildAvgWorkMinutesComboTooltipLines();
    var avgWorkComboTooltip = buildCardTooltip(avgWorkComboTooltipLines);
    var avgWorkComboTooltipData = buildCardTooltipData(avgWorkComboTooltipLines);

    var avgOvertimeComboTooltipLines = buildAvgOvertimeMinutesComboTooltipLines();
    var avgOvertimeComboTooltip = buildCardTooltip(avgOvertimeComboTooltipLines);
    var avgOvertimeComboTooltipData = buildCardTooltipData(avgOvertimeComboTooltipLines);

    var workDaysTooltip = buildDayTypeTooltip('work', workDaysLabel, stats.workDays, false);
    var workDaysTooltipData = buildDayTypeTooltip('work', workDaysLabel, stats.workDays, true);
    var vacationDaysTooltip = buildDayTypeTooltip('vacation', vacationDaysLabel, stats.vacationDays, false);
    var vacationDaysTooltipData = buildDayTypeTooltip('vacation', vacationDaysLabel, stats.vacationDays, true);
    var holidayDaysTooltip = buildDayTypeTooltip('holiday', holidayDaysLabel, stats.holidayDays, false);
    var holidayDaysTooltipData = buildDayTypeTooltip('holiday', holidayDaysLabel, stats.holidayDays, true);
    var sickDaysTooltip = buildDayTypeTooltip('sick', sickDaysLabel, stats.sickDays, false);
    var sickDaysTooltipData = buildDayTypeTooltip('sick', sickDaysLabel, stats.sickDays, true);

    grid.innerHTML =
      '<div class="stats-combo-row">' +
        '<div class="stat-combo stat-combo--work" aria-label="' + workComboTooltip + '" data-stats-tooltip="' + workComboTooltipData + '">' +
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
          '<div class="stat-combo-sub" aria-label="' + avgWorkComboTooltip + '" data-stats-tooltip="' + avgWorkComboTooltipData + '">' +
            '<span class="stat-combo-sub-label">' + avgPerWorkDayLabel + '</span>' +
            '<span class="stat-combo-sub-value">' + W.formatMinutes(stats.avgWorkMinutes) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="stat-combo stat-combo--overtime" aria-label="' + overtimeComboTooltip + '" data-stats-tooltip="' + overtimeComboTooltipData + '">' +
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
          '<div class="stat-combo-sub" aria-label="' + avgOvertimeComboTooltip + '" data-stats-tooltip="' + avgOvertimeComboTooltipData + '">' +
            '<span class="stat-combo-sub-label">' + avgOvertimeLabel + '</span>' +
            '<span class="stat-combo-sub-value">' + W.formatMinutes(stats.avgOvertimeMinutes) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="stats-section-label">' + daysByTypeLabel + '</div>' +
      '<div class="stats-days-by-type">' +
        '<div class="stat-day stat-day--work" aria-label="' + workDaysTooltip + '" data-stats-tooltip="' + workDaysTooltipData + '"><div class="stat-day-head"><div class="stat-day-icon" aria-hidden="true">' + getStatusIcon('work') + '</div><div class="stat-day-main"><span class="stat-day-value">' + fmtNumber(stats.workDays) + '</span><span class="stat-day-label">' + workDaysLabel + '</span></div></div>' + buildWeekdayChipsInline('work', workDaysLabel, stats.workDays) + '</div>' +
        '<div class="stat-day stat-day--vacation" aria-label="' + vacationDaysTooltip + '" data-stats-tooltip="' + vacationDaysTooltipData + '"><div class="stat-day-head"><div class="stat-day-icon" aria-hidden="true">' + getStatusIcon('vacation') + '</div><div class="stat-day-main"><span class="stat-day-value">' + fmtNumber(stats.vacationDays) + '</span><span class="stat-day-label">' + vacationDaysLabel + '</span></div></div>' + buildWeekdayChipsInline('vacation', vacationDaysLabel, stats.vacationDays) + '</div>' +
        '<div class="stat-day stat-day--holiday" aria-label="' + holidayDaysTooltip + '" data-stats-tooltip="' + holidayDaysTooltipData + '"><div class="stat-day-head"><div class="stat-day-icon" aria-hidden="true">' + getStatusIcon('holiday') + '</div><div class="stat-day-main"><span class="stat-day-value">' + fmtNumber(stats.holidayDays) + '</span><span class="stat-day-label">' + holidayDaysLabel + '</span></div></div>' + buildWeekdayChipsInline('holiday', holidayDaysLabel, stats.holidayDays) + '</div>' +
        '<div class="stat-day stat-day--sick" aria-label="' + sickDaysTooltip + '" data-stats-tooltip="' + sickDaysTooltipData + '"><div class="stat-day-head"><div class="stat-day-icon" aria-hidden="true">' + getStatusIcon('sick') + '</div><div class="stat-day-main"><span class="stat-day-value">' + fmtNumber(stats.sickDays) + '</span><span class="stat-day-label">' + sickDaysLabel + '</span></div></div>' + buildWeekdayChipsInline('sick', sickDaysLabel, stats.sickDays) + '</div>' +
      '</div>';

    if (typeof W.refreshStatsSummaryChartsIfOpen === 'function') W.refreshStatsSummaryChartsIfOpen();
  };
})(window.WorkHours);
