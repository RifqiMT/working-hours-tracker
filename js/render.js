/**
 * Rendering: entries table and statistics box.
 * Depends: entries, filters, time, constants.
 */
(function (W) {
  'use strict';
  W.buildEntryRowHtml = function buildEntryRowHtml(entry) {
    const dur = W.workingMinutes(entry.clockIn, entry.clockOut, entry.breakMinutes);
    var standard = W.STANDARD_WORK_MINUTES_PER_DAY || 480;
    var overtimeMinutes = null;
    if ((entry.dayStatus || 'work') === 'work' && dur != null) overtimeMinutes = Math.max(0, dur - standard);
    var desc = (entry.description || '').trim();
    var descTitle = desc.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    var descCell = descTitle
      ? '<td class="entry-desc-hover" title="' + descTitle + '" aria-label="Description">&#8505;</td>'
      : '<td class="entry-desc-hover" aria-label="No description"></td>';
    var status = (entry.dayStatus || 'work');
    var statusLabel = status.replace(/^./, function (c) { return c.toUpperCase(); });
    var durStr = dur != null ? W.formatMinutes(dur) : '—';
    var hasOvertime = overtimeMinutes != null && overtimeMinutes > 0;
    var otStr = hasOvertime ? W.formatMinutes(overtimeMinutes) : '';
    var breakMin = Number(entry.breakMinutes) || 0;
    var breakStr = breakMin > 0 ? W.formatMinutes(breakMin) : '—';
    var durationTitleParts = [
      'Working hours: ' + durStr,
      'Break: ' + breakStr,
      hasOvertime ? 'Overtime: +' + otStr : ''
    ].filter(Boolean);
    var durationTitle = durationTitleParts.join('\n\n');
    var combinedDurOt = '<td class="entry-cell-duration-overtime" title="' + durationTitle.replace(/"/g, '&quot;') + '" aria-label="' + durationTitle.replace(/"/g, '&quot;') + '">' +
      '<span class="entry-dur-main duration">' + durStr + '</span>' +
      (hasOvertime ? '<span class="entry-ot-badge" title="Overtime">+' + otStr + ' OT</span>' : '') +
      '</td>';
    var loc = entry.location || '';
    var locLabel = loc === 'AW' ? 'Anywhere' : (loc || '—');
    var locClass = 'entry-location';
    var locIconEntity = '';
    if (loc === 'WFH') { locClass += ' entry-location--wfh'; locIconEntity = '&#127968;'; }
    else if (loc === 'WFO') { locClass += ' entry-location--wfo'; locIconEntity = '&#127970;'; }
    else if (loc === 'Anywhere' || loc === 'AW') { locClass += ' entry-location--anywhere'; locIconEntity = '&#127760;'; }
    var locationCell = '<td class="entry-cell-location"><span class="' + locClass + '" title="' + (locLabel !== '—' ? locLabel.replace(/"/g, '&quot;') : '') + '">' +
      (locIconEntity ? '<span class="entry-location-icon" aria-hidden="true">' + locIconEntity + '</span>' : '') +
      '<span class="entry-location-label">' + locLabel + '</span></span></td>';
    var entryTz = entry.timezone || W.DEFAULT_TIMEZONE;
    var viewTz = (W._entriesViewTimezone || '').trim();
    var viewConverted = viewTz && typeof W.formatEntryInViewZone === 'function' ? W.formatEntryInViewZone(entry, viewTz) : null;
    var dateDisplay = viewConverted ? W.formatDateWithDay(viewConverted.viewDate) : W.formatDateWithDay(entry.date);
    var timeDisplay = typeof W.formatClockInOutInZone === 'function'
      ? W.formatClockInOutInZone(entry, viewTz)
      : ((entry.clockIn || '—') + ' – ' + (entry.clockOut || '—'));
    var entryTzLabel = W.getTimeZoneLabel ? W.getTimeZoneLabel(entryTz) : entryTz;
    var dateTooltip = 'Original timezone: ' + entryTzLabel + '\n' +
      'Date: ' + (W.formatDateWithDay(entry.date) || '—');
    if (viewConverted && viewTz) {
      var viewTzLabel = W.getTimeZoneLabel ? W.getTimeZoneLabel(viewTz) : viewTz;
      dateTooltip += '\n\nConverted timezone: ' + viewTzLabel + '\n' +
        'Date: ' + (W.formatDateWithDay(viewConverted.viewDate) || '—');
    }
    var timeTooltip = 'Original timezone: ' + entryTzLabel + '\n' +
      'Clock In – Clock Out: ' + (entry.clockIn || '—') + ' – ' + (entry.clockOut || '—');
    if (viewTz && viewConverted) {
      var viewTzLabelTime = W.getTimeZoneLabel ? W.getTimeZoneLabel(viewTz) : viewTz;
      timeTooltip += '\n\nConverted timezone: ' + viewTzLabelTime + '\n' +
        'Clock In – Clock Out: ' + (viewConverted.viewClockIn || '—') + ' – ' + (viewConverted.viewClockOut || '—');
      if (viewConverted.clockOutNextDay) timeTooltip += ' (+1 day)';
    }
    var dateTooltipEsc = dateTooltip.replace(/"/g, '&quot;').replace(/</g, '&lt;');
    var timeTooltipEsc = timeTooltip.replace(/"/g, '&quot;').replace(/</g, '&lt;');
    return '<td class="entry-cell-checkbox"><input type="checkbox" class="entry-select-cb" data-id="' + entry.id + '" aria-label="Select row"></td>' +
      '<td class="entry-cell-date" title="' + dateTooltipEsc + '">' + dateDisplay + '</td>' +
      '<td class="entry-cell-time entry-time" title="' + timeTooltipEsc + '">' + timeDisplay + '</td>' +
      combinedDurOt +
      '<td class="entry-cell-status"><span class="entry-status-pill entry-status-pill--' + status + '">' + statusLabel + '</span></td>' +
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
    thead.querySelectorAll('th[data-sort]').forEach(function (th) {
      var col = th.getAttribute('data-sort');
      var label = th.getAttribute('data-label') || th.getAttribute('data-sort');
      var indicator = (sortBy === col) ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';
      th.textContent = label + indicator;
      th.setAttribute('data-sort', col);
    });
  };
  W.updateEntryButtonsState = function updateEntryButtonsState() {
    var editBtn = document.getElementById('editEntryBtn');
    var deleteBtn = document.getElementById('deleteEntryBtn');
    var ids = W._selectedEntryIds || [];
    var hasOne = ids.length === 1;
    var hasAny = ids.length > 0;
    if (editBtn) editBtn.disabled = !hasOne;
    if (deleteBtn) deleteBtn.disabled = !hasAny;
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
    var ids = W._selectedEntryIds || [];
    if (ids.length !== 1) return;
    var entry = W.getEntries().find(function (e) { return e.id === ids[0]; });
    if (entry) W.openEditModal(entry);
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
    grid.innerHTML =
      '<div class="stats-combo-row">' +
        '<div class="stat-combo stat-combo--work">' +
          '<div class="stat-combo-header">' +
            '<div class="stat-combo-icon stat-combo-icon--work" aria-hidden="true"><span>⏱</span></div>' +
            '<div class="stat-combo-main">' +
              '<span class="stat-combo-value">' + W.formatMinutes(stats.totalWorkMinutes) + '</span>' +
              '<span class="stat-combo-label">Total working hours</span>' +
            '</div>' +
          '</div>' +
          '<div class="stat-combo-divider" aria-hidden="true"></div>' +
          '<div class="stat-combo-sub">' +
            '<span class="stat-combo-sub-label">Avg per work day</span>' +
            '<span class="stat-combo-sub-value">' + W.formatMinutes(stats.avgWorkMinutes) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="stat-combo stat-combo--overtime">' +
          '<div class="stat-combo-header">' +
            '<div class="stat-combo-icon stat-combo-icon--overtime" aria-hidden="true"><span>⏰</span></div>' +
            '<div class="stat-combo-main">' +
              '<span class="stat-combo-value">' + W.formatMinutes(stats.totalOvertimeMinutes) + '</span>' +
              '<span class="stat-combo-label">Total overtime</span>' +
            '</div>' +
          '</div>' +
          '<div class="stat-combo-divider" aria-hidden="true"></div>' +
          '<div class="stat-combo-sub">' +
            '<span class="stat-combo-sub-label">Avg overtime</span>' +
            '<span class="stat-combo-sub-value">' + W.formatMinutes(stats.avgOvertimeMinutes) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="stats-section-label">Days by type</div>' +
      '<div class="stats-days-by-type">' +
        '<div class="stat-day stat-day--work"><div class="stat-day-icon" aria-hidden="true"><span>✓</span></div><div class="stat-day-body"><span class="stat-day-value">' + stats.workDays + '</span><span class="stat-day-label">Work days</span></div></div>' +
        '<div class="stat-day stat-day--vacation"><div class="stat-day-icon" aria-hidden="true"><span>☀</span></div><div class="stat-day-body"><span class="stat-day-value">' + stats.vacationDays + '</span><span class="stat-day-label">Vacation</span></div></div>' +
        '<div class="stat-day stat-day--holiday"><div class="stat-day-icon" aria-hidden="true"><span>📅</span></div><div class="stat-day-body"><span class="stat-day-value">' + stats.holidayDays + '</span><span class="stat-day-label">Holiday</span></div></div>' +
        '<div class="stat-day stat-day--sick"><div class="stat-day-icon" aria-hidden="true"><span>🩹</span></div><div class="stat-day-body"><span class="stat-day-value">' + stats.sickDays + '</span><span class="stat-day-label">Sick</span></div></div>' +
      '</div>';
  };
})(window.WorkHours);
