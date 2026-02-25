/**
 * Calendar view: month grid with entries, colored by day status, dots by location.
 * Depends: filters (getFilteredEntries).
 */
(function (W) {
  'use strict';
  var MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /** 1 dot = WFH, 2 = WFO, 3 = AW */
  function locationToDots(loc) {
    if (loc === 'WFH') return 1;
    if (loc === 'WFO') return 2;
    if (loc === 'AW') return 3;
    return 0;
  }

  W.getCalendarMonth = function getCalendarMonth() {
    var y = W._calendarYear;
    var m = W._calendarMonth;
    if (y == null || m == null) {
      var d = new Date();
      W._calendarYear = d.getFullYear();
      W._calendarMonth = d.getMonth() + 1;
      return { year: W._calendarYear, month: W._calendarMonth };
    }
    return { year: y, month: m };
  };

  W.setCalendarMonth = function setCalendarMonth(year, month) {
    W._calendarYear = year;
    W._calendarMonth = month;
  };

  /** Set year/month filter dropdowns to match the calendar's displayed month. */
  W.syncFiltersFromCalendar = function syncFiltersFromCalendar() {
    var cal = W.getCalendarMonth();
    var yearEl = document.getElementById('filterYear');
    var monthEl = document.getElementById('filterMonth');
    if (yearEl) yearEl.value = String(cal.year);
    if (monthEl) monthEl.value = String(cal.month);
  };

  /** Set calendar to match year/month filters; if either is "All", show current month. */
  W.syncCalendarFromFilters = function syncCalendarFromFilters() {
    var yearEl = document.getElementById('filterYear');
    var monthEl = document.getElementById('filterMonth');
    var y = yearEl && yearEl.value;
    var m = monthEl && monthEl.value;
    if (y && m) {
      W.setCalendarMonth(parseInt(y, 10), parseInt(m, 10));
    } else {
      var d = new Date();
      W.setCalendarMonth(d.getFullYear(), d.getMonth() + 1);
    }
  };

  /** Returns map of date string (YYYY-MM-DD) -> { dayStatus, location } for the given month (uses first entry per day). */
  function getEntriesByDateForMonth(year, month) {
    var entries = W.getFilteredEntries();
    var monthStr = month < 10 ? '0' + month : '' + month;
    var prefix = year + '-' + monthStr + '-';
    var map = {};
    entries.forEach(function (e) {
      if (!e.date || e.date.indexOf(prefix) !== 0) return;
      if (!map[e.date]) map[e.date] = { dayStatus: e.dayStatus || 'work', location: e.location || '' };
    });
    return map;
  }

  W.renderCalendar = function renderCalendar() {
    var grid = document.getElementById('calendarGrid');
    var titleEl = document.getElementById('calendarTitle');
    if (!grid || !titleEl) return;
    var cal = W.getCalendarMonth();
    var year = cal.year;
    var month = cal.month;
    var entriesByDate = getEntriesByDateForMonth(year, month);
    titleEl.textContent = MONTH_NAMES[month - 1] + ' ' + year;
    var firstDay = new Date(year, month - 1, 1);
    var startWeekday = firstDay.getDay();
    var daysInMonth = new Date(year, month, 0).getDate();
    var html = '';
    var i;
    for (i = 0; i < 7; i++) html += '<div class="calendar-weekday">' + WEEKDAYS[i] + '</div>';
    for (i = 0; i < startWeekday; i++) html += '<div class="calendar-day"></div>';
    for (i = 1; i <= daysInMonth; i++) {
      var dayStr = i < 10 ? '0' + i : '' + i;
      var dateStr = year + '-' + (month < 10 ? '0' + month : '' + month) + '-' + dayStr;
      var info = entriesByDate[dateStr];
      var dayClass = 'calendar-day';
      var dotsHtml = '';
      if (info) {
        dayClass += ' has-entry status-' + (info.dayStatus || 'work');
        var n = locationToDots(info.location);
        for (var d = 0; d < n; d++) dotsHtml += '<span class="calendar-dot"></span>';
      }
      html += '<div class="' + dayClass + '"><span>' + i + '</span>' + (dotsHtml ? '<div class="calendar-dots">' + dotsHtml + '</div>' : '') + '</div>';
    }
    grid.innerHTML = html;
  };
})(window.WorkHours);
