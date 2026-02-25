/**
 * Filter values and filtered entries.
 * Depends: entries, time (getISOWeek).
 */
(function (W) {
  'use strict';
  W.getFilterValues = function getFilterValues() {
    return {
      year: (document.getElementById('filterYear') && document.getElementById('filterYear').value) || '',
      month: (document.getElementById('filterMonth') && document.getElementById('filterMonth').value) || '',
      week: (document.getElementById('filterWeek') && document.getElementById('filterWeek').value) || '',
      dayName: (document.getElementById('filterDayName') && document.getElementById('filterDayName').value) || '',
      dayStatus: (document.getElementById('filterDayStatus') && document.getElementById('filterDayStatus').value) || '',
      location: (document.getElementById('filterLocation') && document.getElementById('filterLocation').value) || ''
    };
  };
  W.getFilteredEntries = function getFilteredEntries() {
    var entries = W.getEntries();
    const f = W.getFilterValues();
    if (f.year) entries = entries.filter(function (e) { return (e.date || '').slice(0, 4) === f.year; });
    if (f.month) {
      entries = entries.filter(function (e) {
        const d = new Date((e.date || '') + 'T12:00:00');
        return !isNaN(d.getTime()) && String(d.getMonth() + 1) === f.month;
      });
    }
    if (f.week) entries = entries.filter(function (e) { return String(W.getISOWeek(e.date)) === f.week; });
    if (f.dayName) {
      entries = entries.filter(function (e) {
        const d = new Date((e.date || '') + 'T12:00:00');
        return !isNaN(d.getTime()) && String(d.getDay()) === f.dayName;
      });
    }
    if (f.dayStatus) entries = entries.filter(function (e) { return (e.dayStatus || 'work') === f.dayStatus; });
    if (f.location) entries = entries.filter(function (e) { return (e.location || '') === f.location; });
    return entries;
  };
  W.refreshFilterYearWeek = function refreshFilterYearWeek() {
    const entries = W.getEntries();
    const years = new Set();
    entries.forEach(function (e) {
      if (e.date && e.date.length >= 4) years.add(e.date.slice(0, 4));
    });
    const currentYear = new Date().getFullYear();
    for (var y = currentYear - 2; y <= currentYear + 1; y++) years.add(String(y));
    const yearEl = document.getElementById('filterYear');
    if (yearEl) {
      const cur = yearEl.value;
      yearEl.innerHTML = '<option value="">All</option>' + Array.from(years).sort().reverse().map(function (y) { return '<option value="' + y + '">' + y + '</option>'; }).join('');
      if (years.has(cur)) yearEl.value = cur;
    }
    const weekEl = document.getElementById('filterWeek');
    if (weekEl && weekEl.options.length <= 1) {
      weekEl.innerHTML = '<option value="">All</option>' + Array.from({ length: 53 }, function (_, i) { return i + 1; }).map(function (w) { return '<option value="' + w + '">' + w + '</option>'; }).join('');
    }
  };
})(window.WorkHours);
