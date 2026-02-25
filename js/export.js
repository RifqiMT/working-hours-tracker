/**
 * CSV export.
 * Depends: filters, time, profile.
 */
(function (W) {
  'use strict';
  W.buildCsvRows = function buildCsvRows(entries) {
    return entries.map(function (e) {
      const dur = W.workingMinutes(e.clockIn, e.clockOut, e.breakMinutes);
      const dateStr = W.formatDateMDY ? W.formatDateMDY(e.date) : e.date;
      return [dateStr, e.clockIn || '', e.clockOut || '', e.breakMinutes || 0, dur != null ? dur : '', e.dayStatus || 'work', e.location || ''];
    });
  };
  W.exportToCsv = function exportToCsv() {
    const entries = W.getFilteredEntries().slice().sort(function (a, b) { return (a.date || '').localeCompare(b.date || ''); });
    const headers = ['Date', 'Clock In', 'Clock Out', 'Break (min)', 'Duration (min)', 'Status', 'Location'];
    const rows = W.buildCsvRows(entries);
    const csv = [headers.join(','), ...rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); })].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'working-hours-' + W.getProfile().replace(/\s+/g, '-') + '-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };
})(window.WorkHours);
