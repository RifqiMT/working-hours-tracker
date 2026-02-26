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
      day: (document.getElementById('filterDay') && document.getElementById('filterDay').value) || '',
      week: (document.getElementById('filterWeek') && document.getElementById('filterWeek').value) || '',
      dayName: (document.getElementById('filterDayName') && document.getElementById('filterDayName').value) || '',
      dayStatus: (document.getElementById('filterDayStatus') && document.getElementById('filterDayStatus').value) || '',
      location: (document.getElementById('filterLocation') && document.getElementById('filterLocation').value) || '',
      overtime: (document.getElementById('filterOvertime') && document.getElementById('filterOvertime').value) || '',
      description: (document.getElementById('filterDescription') && document.getElementById('filterDescription').value) || '',
      duration: (document.getElementById('filterDuration') && document.getElementById('filterDuration').value) || ''
    };
  };
  W.getFilteredEntries = function getFilteredEntries() {
    var entries = W.getEntries();
    const f = W.getFilterValues();
    if (W._calendarSelectedDates && W._calendarSelectedDates.length > 0) {
      var set = {};
      W._calendarSelectedDates.forEach(function (d) { set[d] = true; });
      entries = entries.filter(function (e) { return set[e.date]; });
    } else {
      if (f.year) entries = entries.filter(function (e) { return (e.date || '').slice(0, 4) === f.year; });
      if (f.month) {
        entries = entries.filter(function (e) {
          const d = new Date((e.date || '') + 'T12:00:00');
          return !isNaN(d.getTime()) && String(d.getMonth() + 1) === f.month;
        });
      }
      if (f.day) {
        entries = entries.filter(function (e) {
          var dateStr = e.date || '';
          if (dateStr.length < 10) return false;
          var dayNum = parseInt(dateStr.slice(8, 10), 10);
          return !isNaN(dayNum) && dayNum === parseInt(f.day, 10);
        });
      }
    }
    if (f.week) entries = entries.filter(function (e) { return String(W.getISOWeek(e.date)) === f.week; });
    if (f.dayName) {
      entries = entries.filter(function (e) {
        const d = new Date((e.date || '') + 'T12:00:00');
        return !isNaN(d.getTime()) && String(d.getDay()) === f.dayName;
      });
    }
    if (f.dayStatus) entries = entries.filter(function (e) { return (e.dayStatus || 'work') === f.dayStatus; });
    if (f.location) entries = entries.filter(function (e) {
        var loc = e.location || '';
        return loc === f.location || (loc === 'AW' && f.location === 'Anywhere');
      });
    if (f.overtime) {
      var standard = W.STANDARD_WORK_MINUTES_PER_DAY || 480;
      if (f.overtime === 'overtime') {
        entries = entries.filter(function (e) {
          if ((e.dayStatus || 'work') !== 'work') return false;
          var dur = W.workingMinutes(e.clockIn, e.clockOut, e.breakMinutes);
          return dur != null && dur > standard;
        });
      } else if (f.overtime === 'no-overtime') {
        entries = entries.filter(function (e) {
          if ((e.dayStatus || 'work') !== 'work') return true;
          var dur = W.workingMinutes(e.clockIn, e.clockOut, e.breakMinutes);
          return dur == null || dur <= standard;
        });
      }
    }
    if (f.description === 'available') {
      entries = entries.filter(function (e) { return ((e.description || '').trim()).length > 0; });
    } else if (f.description === 'not-available') {
      entries = entries.filter(function (e) { return ((e.description || '').trim()).length === 0; });
    }
    if (f.duration === 'has-duration') {
      entries = entries.filter(function (e) { return W.workingMinutes(e.clockIn, e.clockOut, e.breakMinutes) != null; });
    } else if (f.duration === 'no-duration') {
      entries = entries.filter(function (e) { return W.workingMinutes(e.clockIn, e.clockOut, e.breakMinutes) == null; });
    }
    if (!W._entriesShowAllDates) {
      var todayStr = new Date().toISOString().slice(0, 10);
      entries = entries.filter(function (e) { return (e.date || '') <= todayStr; });
    }
    return entries;
  };
  /** Set all filter dropdowns to "All" and refresh entries and calendar. */
  W.resetAllFilters = function resetAllFilters() {
    var ids = ['filterYear', 'filterMonth', 'filterDay', 'filterWeek', 'filterDayName', 'filterDayStatus', 'filterLocation', 'filterOvertime', 'filterDescription', 'filterDuration'];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });
    if (typeof W.clearCalendarSelection === 'function') W.clearCalendarSelection();
    if (typeof W.syncCalendarFromFilters === 'function') W.syncCalendarFromFilters();
    if (typeof W.renderEntries === 'function') W.renderEntries();
    if (typeof W.renderCalendar === 'function') W.renderCalendar();
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
