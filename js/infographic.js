/**
 * Infographic popup: vacation days and weekday working hours/overtime per year.
 * Depends: entries (getEntries), vacation-days (getVacationDaysByYear, getProfile), time, constants.
 */
(function (W) {
  'use strict';

  var currentInfographicData = null;

  function escapeCsvCell(val) {
    var s = String(val == null ? '' : val);
    if (/[",\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  function csvRow(arr) {
    return arr.map(escapeCsvCell).join(',');
  }

  function getVacationUsedByYear(entries) {
    var byYear = {};
    entries.forEach(function (e) {
      if ((e.dayStatus || '') !== 'vacation') return;
      var dateStr = e.date;
      if (!dateStr || dateStr.length < 4) return;
      var y = dateStr.slice(0, 4);
      byYear[y] = (byYear[y] || 0) + 1;
    });
    return byYear;
  }

  /** Vacation days used per year, per weekday (Mon–Fri only). byYear[year][dayOfWeek] = count. */
  function getVacationUsedByYearAndWeekday(entries) {
    var byYear = {};
    entries.forEach(function (e) {
      if ((e.dayStatus || '') !== 'vacation') return;
      var dateStr = e.date;
      if (!dateStr || dateStr.length < 4) return;
      var d = new Date(dateStr + 'T12:00:00');
      if (isNaN(d.getTime())) return;
      var dayOfWeek = d.getDay();
      if (dayOfWeek < 1 || dayOfWeek > 5) return; // Mon–Fri only
      var y = dateStr.slice(0, 4);
      if (!byYear[y]) byYear[y] = {};
      if (!byYear[y][dayOfWeek]) byYear[y][dayOfWeek] = 0;
      byYear[y][dayOfWeek] += 1;
    });
    return byYear;
  }

  // Per-year, per-weekday stats (Mon–Fri) for work days:
  // totalWork, days, totalOvertime, avgWork, avgOvertime (all minutes).
  function getWorkStatsByYearAndWeekday(entries) {
    var byYear = {};
    var standardDay = W.STANDARD_WORK_MINUTES_PER_DAY || 480;
    entries.forEach(function (e) {
      if ((e.dayStatus || 'work') !== 'work') return;
      var dateStr = e.date;
      if (!dateStr || dateStr.length < 4) return;
      var d = new Date(dateStr + 'T12:00:00');
      if (isNaN(d.getTime())) return;
      var dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
      if (dayOfWeek < 1 || dayOfWeek > 5) return; // Mon–Fri only
      var dur = W.workingMinutes(e.clockIn, e.clockOut, e.breakMinutes);
      if (dur == null) return;
      var y = dateStr.slice(0, 4);
      if (!byYear[y]) byYear[y] = {};
      if (!byYear[y][dayOfWeek]) byYear[y][dayOfWeek] = { totalWork: 0, days: 0, totalOvertime: 0 };
      var slot = byYear[y][dayOfWeek];
      slot.totalWork += dur;
      slot.days += 1;
      slot.totalOvertime += Math.max(0, dur - standardDay);
    });
    Object.keys(byYear).forEach(function (y) {
      var perDay = byYear[y];
      Object.keys(perDay).forEach(function (d) {
        var s = perDay[d];
        s.avgWork = s.days > 0 ? Math.round(s.totalWork / s.days) : 0;
        s.avgOvertime = s.days > 0 ? Math.round(s.totalOvertime / s.days) : 0;
      });
    });
    return byYear;
  }

  function openInfographicModal() {
    var profile = W.getProfile();
    var byYearQuota = W.getVacationDaysByYear(profile);
    var entries = W.getEntries();
    var filteredEntries = W.getFilteredEntries();
    var usedByYear = getVacationUsedByYear(entries);
    var vacationByWeekday = getVacationUsedByYearAndWeekday(entries);
    var workByYear = getWorkStatsByYearAndWeekday(entries);

    var standardDay = W.STANDARD_WORK_MINUTES_PER_DAY || 480;
    var totalWorkMinutes = 0, totalOvertimeMinutes = 0, workDaysCount = 0;
    var totalVacationQuota = 0, totalVacationUsed = 0, totalSick = 0, totalHoliday = 0;
    var yearsInFilter = {};
    filteredEntries.forEach(function (e) {
      var y = (e.date || '').slice(0, 4);
      if (y.length === 4) yearsInFilter[y] = true;
    });
    Object.keys(yearsInFilter).forEach(function (y) {
      var q = byYearQuota[y] !== undefined ? parseInt(byYearQuota[y], 10) : NaN;
      if (!isNaN(q)) totalVacationQuota += q;
    });
    filteredEntries.forEach(function (e) {
      var status = e.dayStatus || 'work';
      if (status === 'work') {
        var dur = W.workingMinutes(e.clockIn, e.clockOut, e.breakMinutes);
        if (dur != null) {
          totalWorkMinutes += dur;
          workDaysCount += 1;
          totalOvertimeMinutes += Math.max(0, dur - standardDay);
        }
      } else if (status === 'vacation') totalVacationUsed++;
      else if (status === 'sick') totalSick++;
      else if (status === 'holiday') totalHoliday++;
    });
    var avgWorkMinutes = workDaysCount > 0 ? Math.round(totalWorkMinutes / workDaysCount) : 0;
    var avgOvertimeMinutes = workDaysCount > 0 ? Math.round(totalOvertimeMinutes / workDaysCount) : 0;
    // Summary averages: only over days with status "work"

    var summaryData = {
      totalWorkingHours: totalWorkMinutes,
      avgWorkingHours: avgWorkMinutes,
      totalOvertime: totalOvertimeMinutes,
      avgOvertime: avgOvertimeMinutes,
      totalVacationQuota: totalVacationQuota,
      totalVacationUsed: totalVacationUsed,
      totalSick: totalSick,
      totalHoliday: totalHoliday
    };

    var curYear = new Date().getFullYear();
    var years = [];
    var yearSet = new Set(
      Object.keys(byYearQuota).concat(Object.keys(usedByYear)).concat(Object.keys(vacationByWeekday)).concat(Object.keys(workByYear))
    );
    yearSet.forEach(function (y) { years.push(parseInt(y, 10)); });
    if (years.indexOf(curYear) === -1) years.push(curYear);
    years.sort(function (a, b) { return a - b; });

    var html = '';
    var t = (W.I18N && W.I18N.t) ? W.I18N.t : function (k) { return k; };
    var wds = (W.I18N && W.I18N.resolve && W.currentLanguage) ? W.I18N.resolve('calendarStats.weekdaysFull', W.currentLanguage) : null;
    if (!wds || !wds.length) wds = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var mon = wds[1], tue = wds[2], wed = wds[3], thu = wds[4], fri = wds[5];
    var exportCsvLabel = t('infographic.exportCsv') || 'Export CSV';
    var metricLabel = t('infographic.table.metric') || 'Metric';
    var valueLabel = t('infographic.table.value') || 'Value';
    var yearLabel = t('infographic.table.year') || 'Year';
    var quotaLabel = t('infographic.table.quota') || 'Quota';
    var usedLabel = t('infographic.table.used') || 'Used';
    var remainingLabel = t('infographic.table.remaining') || 'Remaining';
    var minutesSuffix = t('infographic.csv.minutesSuffix') || 'minutes';

    // Summary totals (filtered entries)
    html += '<div class="infographic-section"><div class="infographic-section-header"><h3 class="infographic-heading">' + (t('infographic.sectionSummaryTotals') || 'Summary totals') + '</h3><button type="button" class="secondary infographic-export-csv" data-export="summary-totals">' + exportCsvLabel + '</button></div>';
    html += '<p class="infographic-desc">' + (t('infographic.descSummaryTotals') || 'Aggregated from entries matching the current filters (year, month, week, day, status, location).') + '</p>';
    html += '<div class="infographic-table-wrap"><table class="infographic-table"><thead><tr><th>' + metricLabel + '</th><th>' + valueLabel + '</th></tr></thead><tbody>';
    html += '<tr><td>' + (t('infographic.metrics.totalWorkingHours') || 'Total working hours') + '</td><td>' + W.formatMinutes(summaryData.totalWorkingHours) + '</td></tr>';
    html += '<tr><td>' + (t('infographic.metrics.avgWorkingHours') || 'Average working hours') + '</td><td>' + W.formatMinutes(summaryData.avgWorkingHours) + '</td></tr>';
    html += '<tr><td>' + (t('infographic.metrics.totalOvertime') || 'Total overtime') + '</td><td>' + W.formatMinutes(summaryData.totalOvertime) + '</td></tr>';
    html += '<tr><td>' + (t('infographic.metrics.avgOvertime') || 'Average overtime') + '</td><td>' + W.formatMinutes(summaryData.avgOvertime) + '</td></tr>';
    html += '<tr><td>' + (t('infographic.metrics.totalVacationQuota') || 'Total vacation quota') + '</td><td>' + summaryData.totalVacationQuota + '</td></tr>';
    html += '<tr><td>' + (t('infographic.metrics.totalVacationUsed') || 'Total vacation used') + '</td><td>' + summaryData.totalVacationUsed + '</td></tr>';
    html += '<tr><td>' + (t('infographic.metrics.totalSick') || 'Total sick') + '</td><td>' + summaryData.totalSick + '</td></tr>';
    html += '<tr><td>' + (t('infographic.metrics.totalPublicHolidays') || 'Total public holidays') + '</td><td>' + summaryData.totalHoliday + '</td></tr>';
    html += '</tbody></table></div></div>';

    // Vacation days section
    html += '<div class="infographic-section"><div class="infographic-section-header"><h3 class="infographic-heading">' + (t('infographic.sectionVacationDays') || 'Vacation days') + '</h3><button type="button" class="secondary infographic-export-csv" data-export="vacation-days">' + exportCsvLabel + '</button></div>';
    html += '<p class="infographic-desc">' + (t('infographic.descVacationDays') || 'Quota (allowed per year) vs used (entries with status Vacation).') + '</p>';
    html += '<div class="infographic-table-wrap"><table class="infographic-table"><thead><tr><th>' + yearLabel + '</th><th>' + quotaLabel + '</th><th>' + usedLabel + '</th><th>' + remainingLabel + '</th></tr></thead><tbody>';
    years.forEach(function (y) {
      var yStr = String(y);
      var quota = byYearQuota[yStr] !== undefined ? parseInt(byYearQuota[yStr], 10) : null;
      var used = usedByYear[yStr] || 0;
      var quotaNum = quota !== null && !isNaN(quota) ? quota : '—';
      var remaining = quota !== null && !isNaN(quota) ? Math.max(0, quota - used) : '—';
      html += '<tr><td>' + y + '</td><td>' + quotaNum + '</td><td>' + used + '</td><td>' + remaining + '</td></tr>';
    });
    html += '</tbody></table></div></div>';

    // Vacation days used by weekday (Mon–Fri)
    html += '<div class="infographic-section"><div class="infographic-section-header"><h3 class="infographic-heading">' + (t('infographic.sectionVacationByWeekday') || 'Vacation days used by weekday (Monday–Friday)') + '</h3><button type="button" class="secondary infographic-export-csv" data-export="vacation-by-weekday">' + exportCsvLabel + '</button></div>';
    html += '<p class="infographic-desc">' + (t('infographic.descVacationByWeekday') || 'Number of vacation days used per weekday per year (status Vacation, weekdays only).') + '</p>';
    html += '<div class="infographic-table-wrap"><table class="infographic-table">';
    html += '<thead><tr><th>' + yearLabel + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    years.forEach(function (y) {
      var yStr = String(y);
      var perDay = vacationByWeekday[yStr] || {};
      function cell(day) {
        var n = perDay[day];
        return n !== undefined ? n : '—';
      }
      html += '<tr><td>' + y + '</td>' +
        '<td>' + cell(1) + '</td><td>' + cell(2) + '</td><td>' + cell(3) + '</td>' +
        '<td>' + cell(4) + '</td><td>' + cell(5) + '</td></tr>';
    });
    html += '</tbody></table></div></div>';

    // Total working hours by weekday (Mon–Fri)
    html += '<div class="infographic-section"><div class="infographic-section-header"><h3 class="infographic-heading">' + (t('infographic.sectionTotalWorkByWeekday') || 'Total working hours by weekday (Monday–Friday)') + '</h3><button type="button" class="secondary infographic-export-csv" data-export="total-work">' + exportCsvLabel + '</button></div>';
    html += '<p class="infographic-desc">' + (t('infographic.descTotalWorkByWeekday') || 'Sum of working hours per weekday per year (status Work only).') + '</p>';
    html += '<div class="infographic-table-wrap"><table class="infographic-table">';
    html += '<thead><tr><th>' + yearLabel + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    years.forEach(function (y) {
      var yStr = String(y);
      var perDay = workByYear[yStr] || {};
      function cellTotal(day) {
        var s = perDay[day];
        return s ? W.formatMinutes(s.totalWork) : '—';
      }
      html += '<tr><td>' + y + '</td>' +
        '<td>' + cellTotal(1) + '</td><td>' + cellTotal(2) + '</td><td>' + cellTotal(3) + '</td>' +
        '<td>' + cellTotal(4) + '</td><td>' + cellTotal(5) + '</td></tr>';
    });
    html += '</tbody></table></div></div>';

    // Average working hours by weekday (Mon–Fri)
    html += '<div class="infographic-section"><div class="infographic-section-header"><h3 class="infographic-heading">' + (t('infographic.sectionAvgWorkByWeekday') || 'Average working hours by weekday (Monday–Friday)') + '</h3><button type="button" class="secondary infographic-export-csv" data-export="avg-work">' + exportCsvLabel + '</button></div>';
    html += '<p class="infographic-desc">' + (t('infographic.descAvgWorkByWeekday') || 'Average working hours per work day, per weekday per year (status Work only).') + '</p>';
    html += '<div class="infographic-table-wrap"><table class="infographic-table">';
    html += '<thead><tr><th>' + yearLabel + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    years.forEach(function (y) {
      var yStr = String(y);
      var perDay = workByYear[yStr] || {};
      function cellAvg(day) {
        var s = perDay[day];
        return s && s.days > 0 ? W.formatMinutes(s.avgWork) : '—';
      }
      html += '<tr><td>' + y + '</td>' +
        '<td>' + cellAvg(1) + '</td><td>' + cellAvg(2) + '</td><td>' + cellAvg(3) + '</td>' +
        '<td>' + cellAvg(4) + '</td><td>' + cellAvg(5) + '</td></tr>';
    });
    html += '</tbody></table></div></div>';

    // Total overtime by weekday (Mon–Fri)
    html += '<div class="infographic-section"><div class="infographic-section-header"><h3 class="infographic-heading">' + (t('infographic.sectionTotalOvertimeByWeekday') || 'Total overtime by weekday (Monday–Friday)') + '</h3><button type="button" class="secondary infographic-export-csv" data-export="total-overtime">' + exportCsvLabel + '</button></div>';
    html += '<p class="infographic-desc">' + (t('infographic.descTotalOvertimeByWeekday') || 'Sum of overtime per weekday per year (status Work only).') + '</p>';
    html += '<div class="infographic-table-wrap"><table class="infographic-table">';
    html += '<thead><tr><th>' + yearLabel + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    years.forEach(function (y) {
      var yStr = String(y);
      var perDay = workByYear[yStr] || {};
      function cellOtTotal(day) {
        var s = perDay[day];
        return s ? W.formatMinutes(s.totalOvertime) : '—';
      }
      html += '<tr><td>' + y + '</td>' +
        '<td>' + cellOtTotal(1) + '</td><td>' + cellOtTotal(2) + '</td><td>' + cellOtTotal(3) + '</td>' +
        '<td>' + cellOtTotal(4) + '</td><td>' + cellOtTotal(5) + '</td></tr>';
    });
    html += '</tbody></table></div></div>';

    // Average overtime by weekday (Mon–Fri)
    html += '<div class="infographic-section"><div class="infographic-section-header"><h3 class="infographic-heading">' + (t('infographic.sectionAvgOvertimeByWeekday') || 'Average overtime by weekday (Monday–Friday)') + '</h3><button type="button" class="secondary infographic-export-csv" data-export="avg-overtime">' + exportCsvLabel + '</button></div>';
    html += '<p class="infographic-desc">' + (t('infographic.descAvgOvertimeByWeekday') || 'Average overtime per work day, per weekday per year (status Work only).') + '</p>';
    html += '<div class="infographic-table-wrap"><table class="infographic-table">';
    html += '<thead><tr><th>' + yearLabel + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    years.forEach(function (y) {
      var yStr = String(y);
      var perDay = workByYear[yStr] || {};
      function cellOtAvg(day) {
        var s = perDay[day];
        return s && s.days > 0 ? W.formatMinutes(s.avgOvertime) : '—';
      }
      html += '<tr><td>' + y + '</td>' +
        '<td>' + cellOtAvg(1) + '</td><td>' + cellOtAvg(2) + '</td><td>' + cellOtAvg(3) + '</td>' +
        '<td>' + cellOtAvg(4) + '</td><td>' + cellOtAvg(5) + '</td></tr>';
    });
    html += '</tbody></table></div></div>';

    var container = document.getElementById('infographicContent');
    var modal = document.getElementById('infographicModal');
    if (container) container.innerHTML = html;
    if (modal) modal.classList.add('open');
    currentInfographicData = { years: years, byYearQuota: byYearQuota, usedByYear: usedByYear, vacationByWeekday: vacationByWeekday, workByYear: workByYear, summaryData: summaryData };
    if (container) {
      container.querySelectorAll('.infographic-export-csv').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var key = this.getAttribute('data-export');
          if (key) exportInfographicTable(key);
        });
      });
    }
  }

  function exportInfographicTable(sectionKey) {
    if (!currentInfographicData) return;
    var d = currentInfographicData;
    var years = d.years;
    var lines = [];
    var filename = 'infographic-' + sectionKey + '.csv';
    var t = (W.I18N && W.I18N.t) ? W.I18N.t : function (k) { return k; };
    var wds = (W.I18N && W.I18N.resolve && W.currentLanguage) ? W.I18N.resolve('calendarStats.weekdaysFull', W.currentLanguage) : null;
    if (!wds || !wds.length) wds = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var mon = wds[1], tue = wds[2], wed = wds[3], thu = wds[4], fri = wds[5];
    var minutesSuffix = t('infographic.csv.minutesSuffix') || 'minutes';
    var metricHeader = [t('infographic.table.metric') || 'Metric', t('infographic.table.value') || 'Value'];
    var yearHeader = t('infographic.table.year') || 'Year';
    var quotaHeader = t('infographic.table.quota') || 'Quota';
    var usedHeader = t('infographic.table.used') || 'Used';
    var remainingHeader = t('infographic.table.remaining') || 'Remaining';
    var metrics = {
      totalWorkingHours: t('infographic.metrics.totalWorkingHours') || 'Total working hours',
      avgWorkingHours: t('infographic.metrics.avgWorkingHours') || 'Average working hours',
      totalOvertime: t('infographic.metrics.totalOvertime') || 'Total overtime',
      avgOvertime: t('infographic.metrics.avgOvertime') || 'Average overtime',
      totalVacationQuota: t('infographic.metrics.totalVacationQuota') || 'Total vacation quota',
      totalVacationUsed: t('infographic.metrics.totalVacationUsed') || 'Total vacation used',
      totalSick: t('infographic.metrics.totalSick') || 'Total sick',
      totalPublicHolidays: t('infographic.metrics.totalPublicHolidays') || 'Total public holidays'
    };
    function dayMinutesHeader(dayName) {
      return dayName + ' (' + minutesSuffix + ')';
    }
    if (sectionKey === 'summary-totals') {
      var s = d.summaryData;
      if (!s) return;
      lines.push(csvRow(metricHeader));
      lines.push(csvRow([metrics.totalWorkingHours + ' (' + minutesSuffix + ')', s.totalWorkingHours]));
      lines.push(csvRow([metrics.avgWorkingHours + ' (' + minutesSuffix + ')', s.avgWorkingHours]));
      lines.push(csvRow([metrics.totalOvertime + ' (' + minutesSuffix + ')', s.totalOvertime]));
      lines.push(csvRow([metrics.avgOvertime + ' (' + minutesSuffix + ')', s.avgOvertime]));
      lines.push(csvRow([metrics.totalVacationQuota, s.totalVacationQuota]));
      lines.push(csvRow([metrics.totalVacationUsed, s.totalVacationUsed]));
      lines.push(csvRow([metrics.totalSick, s.totalSick]));
      lines.push(csvRow([metrics.totalPublicHolidays, s.totalHoliday]));
    } else if (sectionKey === 'vacation-days') {
      lines.push(csvRow([yearHeader, quotaHeader, usedHeader, remainingHeader]));
      years.forEach(function (y) {
        var yStr = String(y);
        var quota = d.byYearQuota[yStr] !== undefined ? parseInt(d.byYearQuota[yStr], 10) : '';
        var used = d.usedByYear[yStr] || 0;
        var remaining = quota !== '' && !isNaN(quota) ? Math.max(0, quota - used) : '';
        if (quota === '' || isNaN(quota)) quota = '';
        lines.push(csvRow([y, quota, used, remaining]));
      });
    } else if (sectionKey === 'vacation-by-weekday') {
      lines.push(csvRow([yearHeader, mon, tue, wed, thu, fri]));
      years.forEach(function (y) {
        var yStr = String(y);
        var perDay = d.vacationByWeekday[yStr] || {};
        lines.push(csvRow([y, perDay[1] !== undefined ? perDay[1] : '', perDay[2] !== undefined ? perDay[2] : '', perDay[3] !== undefined ? perDay[3] : '', perDay[4] !== undefined ? perDay[4] : '', perDay[5] !== undefined ? perDay[5] : '']));
      });
    } else if (sectionKey === 'total-work') {
      lines.push(csvRow([yearHeader, dayMinutesHeader(mon), dayMinutesHeader(tue), dayMinutesHeader(wed), dayMinutesHeader(thu), dayMinutesHeader(fri)]));
      years.forEach(function (y) {
        var yStr = String(y);
        var perDay = d.workByYear[yStr] || {};
        function v(day) { var s = perDay[day]; return s ? s.totalWork : ''; }
        lines.push(csvRow([y, v(1), v(2), v(3), v(4), v(5)]));
      });
    } else if (sectionKey === 'avg-work') {
      lines.push(csvRow([yearHeader, dayMinutesHeader(mon), dayMinutesHeader(tue), dayMinutesHeader(wed), dayMinutesHeader(thu), dayMinutesHeader(fri)]));
      years.forEach(function (y) {
        var yStr = String(y);
        var perDay = d.workByYear[yStr] || {};
        function v(day) { var s = perDay[day]; return s && s.days > 0 ? s.avgWork : ''; }
        lines.push(csvRow([y, v(1), v(2), v(3), v(4), v(5)]));
      });
    } else if (sectionKey === 'total-overtime') {
      lines.push(csvRow([yearHeader, dayMinutesHeader(mon), dayMinutesHeader(tue), dayMinutesHeader(wed), dayMinutesHeader(thu), dayMinutesHeader(fri)]));
      years.forEach(function (y) {
        var yStr = String(y);
        var perDay = d.workByYear[yStr] || {};
        function v(day) { var s = perDay[day]; return s ? s.totalOvertime : ''; }
        lines.push(csvRow([y, v(1), v(2), v(3), v(4), v(5)]));
      });
    } else if (sectionKey === 'avg-overtime') {
      lines.push(csvRow([yearHeader, dayMinutesHeader(mon), dayMinutesHeader(tue), dayMinutesHeader(wed), dayMinutesHeader(thu), dayMinutesHeader(fri)]));
      years.forEach(function (y) {
        var yStr = String(y);
        var perDay = d.workByYear[yStr] || {};
        function v(day) { var s = perDay[day]; return s && s.days > 0 ? s.avgOvertime : ''; }
        lines.push(csvRow([y, v(1), v(2), v(3), v(4), v(5)]));
      });
    } else {
      return;
    }
    var csv = lines.join('\r\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 200);
  }

  function closeInfographicModal() {
    var modal = document.getElementById('infographicModal');
    if (modal) modal.classList.remove('open');
  }

  W.openInfographicModal = openInfographicModal;
  W.closeInfographicModal = closeInfographicModal;
  W.exportInfographicTable = exportInfographicTable;
})(window.WorkHours);
