/**
 * Rendering: entries table and statistics box.
 * Depends: entries, filters, time, constants.
 */
(function (W) {
  'use strict';
  W.buildEntryRowHtml = function buildEntryRowHtml(entry) {
    const dur = W.workingMinutes(entry.clockIn, entry.clockOut, entry.breakMinutes);
    return '<td><input type="checkbox" class="entry-select-cb" data-id="' + entry.id + '" aria-label="Select row"></td>' +
      '<td>' + W.formatDateWithDay(entry.date) + '</td>' +
      '<td>' + (entry.clockIn || '—') + '</td>' +
      '<td>' + (entry.clockOut || '—') + '</td>' +
      '<td>' + (entry.breakMinutes || 0) + 'm</td>' +
      '<td class="duration">' + (dur != null ? W.formatMinutes(dur) : '—') + '</td>' +
      '<td>' + (entry.dayStatus || 'work') + '</td>' +
      '<td>' + (entry.location || '—') + '</td>';
  };
  W.updateEntryButtonsState = function updateEntryButtonsState() {
    var editBtn = document.getElementById('editEntryBtn');
    var deleteBtn = document.getElementById('deleteEntryBtn');
    var hasSelection = !!W._selectedEntryId;
    if (editBtn) editBtn.disabled = !hasSelection;
    if (deleteBtn) deleteBtn.disabled = !hasSelection;
  };
  W.bindEntryRowActions = function bindEntryRowActions(tbody) {
    var self = W;
    tbody.querySelectorAll('.entry-select-cb').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var id = cb.getAttribute('data-id');
        if (cb.checked) {
          tbody.querySelectorAll('.entry-select-cb').forEach(function (other) { other.checked = false; });
          tbody.querySelectorAll('tr').forEach(function (r) { r.classList.remove('selected'); });
          cb.checked = true;
          var tr = cb.closest('tr');
          if (tr) tr.classList.add('selected');
          self._selectedEntryId = id;
        } else {
          self._selectedEntryId = null;
        }
        self.updateEntryButtonsState();
      });
    });
  };
  W.editSelectedEntry = function editSelectedEntry() {
    if (!W._selectedEntryId) return;
    var entry = W.getEntries().find(function (e) { return e.id === W._selectedEntryId; });
    if (entry) W.openEditModal(entry);
  };
  W.deleteSelectedEntry = function deleteSelectedEntry() {
    if (!W._selectedEntryId) return;
    W.openDeleteConfirmModal(function () {
      W.setEntries(W.getEntries().filter(function (e) { return e.id !== W._selectedEntryId; }));
      W._selectedEntryId = null;
      W.renderEntries();
    });
  };
  W.renderEntries = function renderEntries() {
    const entries = W.getFilteredEntries().slice().sort(function (a, b) { return (a.date || '').localeCompare(b.date || ''); });
    const tbody = document.getElementById('entriesBody');
    const emptyEl = document.getElementById('entriesEmpty');
    tbody.innerHTML = '';
    if (entries.length === 0) {
      emptyEl.style.display = 'block';
      W._selectedEntryId = null;
      W.updateEntryButtonsState();
      W.renderStatsBox();
      if (typeof W.renderCalendar === 'function') W.renderCalendar();
      return;
    }
    emptyEl.style.display = 'none';
    entries.forEach(function (entry) {
      const tr = document.createElement('tr');
      tr.setAttribute('data-id', entry.id);
      var status = entry.dayStatus || 'work';
      tr.className = 'entry-row entry-row--' + status;
      tr.innerHTML = W.buildEntryRowHtml(entry);
      tbody.appendChild(tr);
    });
    W._selectedEntryId = null;
    W.updateEntryButtonsState();
    W.bindEntryRowActions(tbody);
    W.renderStatsBox();
    if (typeof W.renderCalendar === 'function') W.renderCalendar();
  };
  W.computeStats = function computeStats(entries) {
    var totalWorkMinutes = 0, totalOvertimeMinutes = 0, workDays = 0, vacationDays = 0, holidayDays = 0, sickDays = 0;
    entries.forEach(function (e) {
      const status = e.dayStatus || 'work';
      if (status === 'work') {
        workDays++;
        const dur = W.workingMinutes(e.clockIn, e.clockOut, e.breakMinutes);
        if (dur != null) {
          totalWorkMinutes += dur;
          if (dur > W.STANDARD_WORK_MINUTES_PER_DAY) totalOvertimeMinutes += dur - W.STANDARD_WORK_MINUTES_PER_DAY;
        }
      } else if (status === 'vacation') vacationDays++;
      else if (status === 'holiday') holidayDays++;
      else if (status === 'sick') sickDays++;
    });
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
      '<div class="stats-primary">' +
        '<div class="stat-hero"><div class="stat-value">' + W.formatMinutes(stats.totalWorkMinutes) + '</div><div class="stat-label">Total working hours</div></div>' +
        '<div class="stat-hero stat-hero--overtime"><div class="stat-value">' + W.formatMinutes(stats.totalOvertimeMinutes) + '</div><div class="stat-label">Total overtime</div></div>' +
      '</div>' +
      '<div class="stats-section-label">Time & work</div>' +
      '<div class="stats-secondary">' +
        '<div class="stat-tile"><div class="stat-tile-icon stat-tile-icon--avg" aria-hidden="true"><span>Ø</span></div><div class="stat-tile-body"><div class="stat-value">' + W.formatMinutes(stats.avgWorkMinutes) + '</div><div class="stat-label">Avg per work day</div></div></div>' +
        '<div class="stat-tile"><div class="stat-tile-icon stat-tile-icon--overtime" aria-hidden="true"><span>+</span></div><div class="stat-tile-body"><div class="stat-value">' + W.formatMinutes(stats.avgOvertimeMinutes) + '</div><div class="stat-label">Avg overtime</div></div></div>' +
      '</div>' +
      '<div class="stats-section-label">Days by type</div>' +
      '<div class="stats-days-by-type">' +
        '<div class="stat-day stat-day--work"><div class="stat-day-icon" aria-hidden="true"><span>✓</span></div><div class="stat-day-body"><span class="stat-day-value">' + stats.workDays + '</span><span class="stat-day-label">Work days</span></div></div>' +
        '<div class="stat-day stat-day--vacation"><div class="stat-day-icon" aria-hidden="true"><span>☀</span></div><div class="stat-day-body"><span class="stat-day-value">' + stats.vacationDays + (function () { var y = document.getElementById('filterYear') && document.getElementById('filterYear').value; var allow = y && typeof W.getVacationAllowance === 'function' ? W.getVacationAllowance(y) : null; return allow !== null ? ' / ' + allow : ''; }()) + '</span><span class="stat-day-label">Vacation</span></div></div>' +
        '<div class="stat-day stat-day--holiday"><div class="stat-day-icon" aria-hidden="true"><span>📅</span></div><div class="stat-day-body"><span class="stat-day-value">' + stats.holidayDays + '</span><span class="stat-day-label">Holiday</span></div></div>' +
        '<div class="stat-day stat-day--sick"><div class="stat-day-icon" aria-hidden="true"><span>🩹</span></div><div class="stat-day-body"><span class="stat-day-value">' + stats.sickDays + '</span><span class="stat-day-label">Sick</span></div></div>' +
      '</div>';
  };
})(window.WorkHours);
