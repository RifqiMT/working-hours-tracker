/**
 * Infographic popup: vacation days and weekday working hours/overtime per year.
 * Depends: entries (getEntries), vacation-days (getVacationDaysByYear, getProfile), time, constants.
 */
(function (W) {
  'use strict';

  var currentInfographicData = null;
  var infographicFullscreenCards = [];
  var infographicFullscreenCurrentKey = null;

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

  // Per-year, per-weekday stats (Mon-Fri) split by location (WFO/WFH) for work days.
  function getWorkStatsByYearWeekdayAndLocation(entries) {
    var byYear = {};
    var standardDay = W.STANDARD_WORK_MINUTES_PER_DAY || 480;
    entries.forEach(function (e) {
      if ((e.dayStatus || 'work') !== 'work') return;
      var loc = e.location;
      if (loc !== 'WFO' && loc !== 'WFH') return;
      var dateStr = e.date;
      if (!dateStr || dateStr.length < 4) return;
      var d = new Date(dateStr + 'T12:00:00');
      if (isNaN(d.getTime())) return;
      var dayOfWeek = d.getDay();
      if (dayOfWeek < 1 || dayOfWeek > 5) return;
      var dur = W.workingMinutes(e.clockIn, e.clockOut, e.breakMinutes);
      if (dur == null) return;
      var y = dateStr.slice(0, 4);
      if (!byYear[y]) byYear[y] = {};
      if (!byYear[y][dayOfWeek]) {
        byYear[y][dayOfWeek] = {
          WFO: { totalWork: 0, days: 0, totalOvertime: 0, avgWork: 0, avgOvertime: 0 },
          WFH: { totalWork: 0, days: 0, totalOvertime: 0, avgWork: 0, avgOvertime: 0 }
        };
      }
      var slot = byYear[y][dayOfWeek][loc];
      slot.totalWork += dur;
      slot.days += 1;
      slot.totalOvertime += Math.max(0, dur - standardDay);
    });
    Object.keys(byYear).forEach(function (y) {
      var perDay = byYear[y];
      Object.keys(perDay).forEach(function (d) {
        ['WFO', 'WFH'].forEach(function (loc) {
          var s = perDay[d][loc];
          s.avgWork = s.days > 0 ? Math.round(s.totalWork / s.days) : 0;
          s.avgOvertime = s.days > 0 ? Math.round(s.totalOvertime / s.days) : 0;
        });
      });
    });
    return byYear;
  }

  function getInfographicFullscreenOrder() {
    var container = document.getElementById('infographicContent');
    if (!container) return [];
    var visiblePanel = null;
    container.querySelectorAll('.infographic-panels').forEach(function (panel) {
      if (visiblePanel) return;
      if (panel.hasAttribute('hidden') || panel.classList.contains('is-hidden')) return;
      visiblePanel = panel;
    });
    if (!visiblePanel) return [];
    var cards = [];
    visiblePanel.querySelectorAll('.infographic-section[data-section-key]').forEach(function (sec) {
      cards.push({
        key: sec.getAttribute('data-section-key'),
        title: sec.getAttribute('data-section-title') || '',
        node: sec
      });
    });
    return cards;
  }

  function renderInfographicFullscreenCard(sectionKey) {
    var modal = document.getElementById('infographicFullscreenModal');
    var title = document.getElementById('infographicFullscreenTitle');
    var body = document.getElementById('infographicFullscreenBody');
    if (!modal || !body) return;
    var current = null;
    infographicFullscreenCards.forEach(function (c) {
      if (!current && c.key === sectionKey) current = c;
    });
    if (!current || !current.node) return;
    infographicFullscreenCurrentKey = sectionKey;
    body.innerHTML = '';
    var clone = current.node.cloneNode(true);
    clone.classList.add('is-fullscreen');
    clone.querySelectorAll('.infographic-card-fullscreen').forEach(function (btn) {
      btn.remove();
    });
    body.appendChild(clone);
    if (title) title.textContent = current.title || '';
    if (typeof W.syncInfographicFullscreenNav === 'function') W.syncInfographicFullscreenNav();
  }

  W.syncInfographicFullscreenNav = function syncInfographicFullscreenNav() {
    var modal = document.getElementById('infographicFullscreenModal');
    if (!modal || !modal.classList.contains('open')) return;
    var t = W.I18N && W.I18N.t ? W.I18N.t : function (k) { return k; };
    var idx = -1;
    for (var i = 0; i < infographicFullscreenCards.length; i++) {
      if (infographicFullscreenCards[i].key === infographicFullscreenCurrentKey) {
        idx = i;
        break;
      }
    }
    var prev = idx > 0 ? infographicFullscreenCards[idx - 1] : null;
    var next = idx >= 0 && idx < infographicFullscreenCards.length - 1 ? infographicFullscreenCards[idx + 1] : null;
    var nav = document.getElementById('infographicFullscreenNav');
    if (nav) nav.setAttribute('aria-label', t('modals.statsSummaryEnlargeModal.chartsNavAria'));
    var prevBtn = document.getElementById('infographicFullscreenPrev');
    var nextBtn = document.getElementById('infographicFullscreenNext');
    var prevDesc = document.getElementById('infographicFullscreenPrevDesc');
    var nextDesc = document.getElementById('infographicFullscreenNextDesc');
    if (prevBtn) {
      prevBtn.disabled = !prev;
      prevBtn.setAttribute('aria-label', prev ? t('modals.statsSummaryEnlargeModal.prevChartShows', { name: prev.title }) : t('modals.statsSummaryEnlargeModal.navNoPrevious'));
      var pm = prevBtn.querySelector('.stats-summary-enlarge-nav-main');
      if (pm) pm.textContent = t('modals.statsSummaryEnlargeModal.prevChart');
    }
    if (nextBtn) {
      nextBtn.disabled = !next;
      nextBtn.setAttribute('aria-label', next ? t('modals.statsSummaryEnlargeModal.nextChartShows', { name: next.title }) : t('modals.statsSummaryEnlargeModal.navNoNext'));
      var nm = nextBtn.querySelector('.stats-summary-enlarge-nav-main');
      if (nm) nm.textContent = t('modals.statsSummaryEnlargeModal.nextChart');
    }
    if (prevDesc) prevDesc.textContent = prev ? prev.title : t('modals.statsSummaryEnlargeModal.navNoPrevious');
    if (nextDesc) nextDesc.textContent = next ? next.title : t('modals.statsSummaryEnlargeModal.navNoNext');
  };

  W.infographicFullscreenGoAdjacent = function infographicFullscreenGoAdjacent(delta) {
    var modal = document.getElementById('infographicFullscreenModal');
    if (!modal || !modal.classList.contains('open')) return;
    var idx = -1;
    for (var i = 0; i < infographicFullscreenCards.length; i++) {
      if (infographicFullscreenCards[i].key === infographicFullscreenCurrentKey) {
        idx = i;
        break;
      }
    }
    if (idx < 0) return;
    var ni = idx + delta;
    if (ni < 0 || ni >= infographicFullscreenCards.length) return;
    renderInfographicFullscreenCard(infographicFullscreenCards[ni].key);
  };

  W.openInfographicSectionFullscreen = function openInfographicSectionFullscreen(sectionKey) {
    var modal = document.getElementById('infographicFullscreenModal');
    var closeBtn = document.getElementById('infographicFullscreenClose');
    if (!modal) return;
    if (closeBtn) {
      var t = W.I18N && W.I18N.t ? W.I18N.t : function (k) { return k; };
      var closeLabel = t('modals.statsSummaryEnlargeModal.close');
      closeBtn.setAttribute('title', closeLabel);
      closeBtn.setAttribute('aria-label', closeLabel);
    }
    infographicFullscreenCards = getInfographicFullscreenOrder();
    if (!infographicFullscreenCards.length) return;
    modal.classList.add('open');
    renderInfographicFullscreenCard(sectionKey);
    function enterFullscreen() {
      if (modal.requestFullscreen) modal.requestFullscreen();
      else if (modal.webkitRequestFullscreen) modal.webkitRequestFullscreen();
      else if (modal.msRequestFullscreen) modal.msRequestFullscreen();
    }
    if (document.body.requestFullscreen || document.documentElement.requestFullscreen) {
      enterFullscreen();
    }
  };

  W.closeInfographicFullscreen = function closeInfographicFullscreen() {
    var modal = document.getElementById('infographicFullscreenModal');
    var body = document.getElementById('infographicFullscreenBody');
    if (document.fullscreenElement === modal || document.webkitFullscreenElement === modal || document.msFullscreenElement === modal) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
    if (modal) modal.classList.remove('open');
    if (body) body.innerHTML = '';
    infographicFullscreenCards = [];
    infographicFullscreenCurrentKey = null;
  };

  function openInfographicModal() {
    var profile = W.getProfile();
    var byYearQuota = W.getVacationDaysByYear(profile);
    var entries = W.getEntries();
    var filteredEntries = W.getFilteredEntries();
    var usedByYear = getVacationUsedByYear(entries);
    var vacationByWeekday = getVacationUsedByYearAndWeekday(entries);
    var workByYear = getWorkStatsByYearAndWeekday(entries);
    var workByYearLoc = getWorkStatsByYearWeekdayAndLocation(entries);

    var standardDay = W.STANDARD_WORK_MINUTES_PER_DAY || 480;
    var totalWorkMinutes = 0, totalOvertimeMinutes = 0, workDaysCount = 0;
    var wfhTotalWorkMinutes = 0, wfhTotalOvertimeMinutes = 0, wfhWorkDaysCount = 0;
    var wfoTotalWorkMinutes = 0, wfoTotalOvertimeMinutes = 0, wfoWorkDaysCount = 0;
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
          if (e.location === 'WFH') {
            wfhTotalWorkMinutes += dur;
            wfhWorkDaysCount += 1;
            wfhTotalOvertimeMinutes += Math.max(0, dur - standardDay);
          } else if (e.location === 'WFO') {
            wfoTotalWorkMinutes += dur;
            wfoWorkDaysCount += 1;
            wfoTotalOvertimeMinutes += Math.max(0, dur - standardDay);
          }
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
    var summaryByLocationData = {
      wfhTotalWorkingHours: wfhTotalWorkMinutes,
      wfhAvgWorkingHours: wfhWorkDaysCount > 0 ? Math.round(wfhTotalWorkMinutes / wfhWorkDaysCount) : 0,
      wfhTotalOvertime: wfhTotalOvertimeMinutes,
      wfhAvgOvertime: wfhWorkDaysCount > 0 ? Math.round(wfhTotalOvertimeMinutes / wfhWorkDaysCount) : 0,
      wfoTotalWorkingHours: wfoTotalWorkMinutes,
      wfoAvgWorkingHours: wfoWorkDaysCount > 0 ? Math.round(wfoTotalWorkMinutes / wfoWorkDaysCount) : 0,
      wfoTotalOvertime: wfoTotalOvertimeMinutes,
      wfoAvgOvertime: wfoWorkDaysCount > 0 ? Math.round(wfoTotalOvertimeMinutes / wfoWorkDaysCount) : 0
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
    var exportCsvLabel = t('infographic.exportCsv');
    var metricLabel = t('infographic.table.metric');
    var valueLabel = t('infographic.table.value');
    var yearLabel = t('infographic.table.year');
    var quotaLabel = t('infographic.table.quota');
    var usedLabel = t('infographic.table.used');
    var remainingLabel = t('infographic.table.remaining');
    var minutesSuffix = t('infographic.csv.minutesSuffix');
    var wfhLabel = t('statsSummary.datasetWfh');
    var wfoLabel = t('statsSummary.datasetWfo');
    var shortSummaryLabel = t('modals.statsSummaryModal.categoryGeneral');
    var shortVacationLabel = t('infographic.sectionVacationDays');
    var shortWorkLabel = t('infographic.sectionTotalWorkByWeekday');
    var shortOvertimeLabel = t('infographic.sectionTotalOvertimeByWeekday');

    var fullscreenTitle = t('modals.statsSummaryModal.fullScreenTooltip');
    var exportTitle = t('infographic.exportCsv');
    var fmtNumber = (typeof W.formatDisplayNumber === 'function') ? W.formatDisplayNumber : function (v) { return String(v); };
    function fmtCellNumber(v) {
      return (v == null || v === '—') ? '—' : fmtNumber(v);
    }
    function sectionOpen(title, desc, exportKey, sectionKey) {
      var hasDesc = !!(desc && String(desc).trim());
      return '<section class="infographic-section" data-section-key="' + sectionKey + '" data-section-title="' + String(title).replace(/"/g, '&quot;') + '"><div class="infographic-section-header"><h3 class="infographic-heading">' + title + '</h3><div class="infographic-section-actions"><button type="button" class="stats-summary-icon-btn infographic-card-fullscreen" data-infographic-fullscreen="' + sectionKey + '" title="' + fullscreenTitle + '" aria-label="' + fullscreenTitle + '"><span class="btn-profile-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><line x1="21" y1="3" x2="14" y2="10"/><polyline points="9 21 3 21 3 15"/><line x1="3" y1="21" x2="10" y2="14"/></svg></span></button><button type="button" class="stats-summary-icon-btn infographic-export-csv" data-export="' + exportKey + '" title="' + exportTitle + '" aria-label="' + exportTitle + '"><span class="btn-profile-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></span></button></div></div>' + (hasDesc ? ('<p class="infographic-desc">' + desc + '</p>') : '');
    }

    // Panel 1: Summary
    html += '<div id="infographicSummaryPanel" class="infographic-panels">';
    html += sectionOpen(
      shortSummaryLabel,
      '',
      'summary-totals',
      'summary-totals'
    );
    html += '<div class="infographic-table-wrap"><table class="infographic-table"><thead><tr><th>' + metricLabel + '</th><th>' + valueLabel + '</th></tr></thead><tbody>';
    html += '<tr><td>' + t('infographic.metrics.totalWorkingHours') + '</td><td>' + W.formatMinutes(summaryData.totalWorkingHours) + '</td></tr>';
    html += '<tr><td>' + t('infographic.metrics.avgWorkingHours') + '</td><td>' + W.formatMinutes(summaryData.avgWorkingHours) + '</td></tr>';
    html += '<tr><td>' + t('infographic.metrics.totalOvertime') + '</td><td>' + W.formatMinutes(summaryData.totalOvertime) + '</td></tr>';
    html += '<tr><td>' + t('infographic.metrics.avgOvertime') + '</td><td>' + W.formatMinutes(summaryData.avgOvertime) + '</td></tr>';
    html += '<tr><td>' + t('infographic.metrics.totalVacationQuota') + '</td><td>' + fmtNumber(summaryData.totalVacationQuota) + '</td></tr>';
    html += '<tr><td>' + t('infographic.metrics.totalVacationUsed') + '</td><td>' + fmtNumber(summaryData.totalVacationUsed) + '</td></tr>';
    html += '<tr><td>' + t('infographic.metrics.totalSick') + '</td><td>' + fmtNumber(summaryData.totalSick) + '</td></tr>';
    html += '<tr><td>' + t('infographic.metrics.totalPublicHolidays') + '</td><td>' + fmtNumber(summaryData.totalHoliday) + '</td></tr>';
    html += '</tbody></table></div></section>';
    html += sectionOpen(
      shortSummaryLabel + ' (' + wfhLabel + ' / ' + wfoLabel + ')',
      '',
      'summary-totals-location',
      'summary-totals-location'
    );
    html += '<div class="infographic-table-wrap"><table class="infographic-table"><thead><tr><th>' + metricLabel + '</th><th>' + wfhLabel + '</th><th>' + wfoLabel + '</th></tr></thead><tbody>';
    html += '<tr><td>' + t('infographic.metrics.totalWorkingHours') + '</td><td>' + W.formatMinutes(summaryByLocationData.wfhTotalWorkingHours) + '</td><td>' + W.formatMinutes(summaryByLocationData.wfoTotalWorkingHours) + '</td></tr>';
    html += '<tr><td>' + t('infographic.metrics.avgWorkingHours') + '</td><td>' + W.formatMinutes(summaryByLocationData.wfhAvgWorkingHours) + '</td><td>' + W.formatMinutes(summaryByLocationData.wfoAvgWorkingHours) + '</td></tr>';
    html += '<tr><td>' + t('infographic.metrics.totalOvertime') + '</td><td>' + W.formatMinutes(summaryByLocationData.wfhTotalOvertime) + '</td><td>' + W.formatMinutes(summaryByLocationData.wfoTotalOvertime) + '</td></tr>';
    html += '<tr><td>' + t('infographic.metrics.avgOvertime') + '</td><td>' + W.formatMinutes(summaryByLocationData.wfhAvgOvertime) + '</td><td>' + W.formatMinutes(summaryByLocationData.wfoAvgOvertime) + '</td></tr>';
    html += '</tbody></table></div></section>';
    html += '</div>';

    // Panel 2: Vacation
    html += '<div id="infographicVacationPanel" class="infographic-panels is-hidden" hidden>';
    html += sectionOpen(
      shortVacationLabel,
      '',
      'vacation-days',
      'vacation-days'
    );
    html += '<div class="infographic-table-wrap"><table class="infographic-table"><thead><tr><th>' + yearLabel + '</th><th>' + quotaLabel + '</th><th>' + usedLabel + '</th><th>' + remainingLabel + '</th></tr></thead><tbody>';
    years.forEach(function (y) {
      var yStr = String(y);
      var quota = byYearQuota[yStr] !== undefined ? parseInt(byYearQuota[yStr], 10) : null;
      var used = usedByYear[yStr] || 0;
      var quotaNum = quota !== null && !isNaN(quota) ? quota : '—';
      var remaining = quota !== null && !isNaN(quota) ? Math.max(0, quota - used) : '—';
      html += '<tr><td>' + y + '</td><td>' + fmtCellNumber(quotaNum) + '</td><td>' + fmtNumber(used) + '</td><td>' + fmtCellNumber(remaining) + '</td></tr>';
    });
    html += '</tbody></table></div></section>';

    html += sectionOpen(
      t('infographic.sectionVacationByWeekday'),
      '',
      'vacation-by-weekday',
      'vacation-by-weekday'
    );
    html += '<div class="infographic-table-wrap"><table class="infographic-table">';
    html += '<thead><tr><th>' + yearLabel + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    years.forEach(function (y) {
      var yStr = String(y);
      var perDay = vacationByWeekday[yStr] || {};
      function cell(day) {
        var n = perDay[day];
        return n !== undefined ? fmtNumber(n) : '—';
      }
      html += '<tr><td>' + y + '</td><td>' + cell(1) + '</td><td>' + cell(2) + '</td><td>' + cell(3) + '</td><td>' + cell(4) + '</td><td>' + cell(5) + '</td></tr>';
    });
    html += '</tbody></table></div></section>';
    html += '</div>';

    // Panel 3: Work and overtime weekdays
    html += '<div id="infographicWorkPanel" class="infographic-panels is-hidden" hidden>';
    html += sectionOpen(
      t('infographic.sectionTotalWorkByWeekday'),
      '',
      'total-work',
      'total-work'
    );
    html += '<div class="infographic-table-wrap"><table class="infographic-table">';
    html += '<thead><tr><th>' + yearLabel + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    years.forEach(function (y) {
      var yStr = String(y);
      var perDay = workByYear[yStr] || {};
      function cellTotal(day) {
        var s = perDay[day];
        return s ? W.formatMinutes(s.totalWork) : '—';
      }
      html += '<tr><td>' + y + '</td><td>' + cellTotal(1) + '</td><td>' + cellTotal(2) + '</td><td>' + cellTotal(3) + '</td><td>' + cellTotal(4) + '</td><td>' + cellTotal(5) + '</td></tr>';
    });
    html += '</tbody></table></div></section>';

    html += sectionOpen(
      t('infographic.sectionAvgWorkByWeekday'),
      '',
      'avg-work',
      'avg-work'
    );
    html += '<div class="infographic-table-wrap"><table class="infographic-table">';
    html += '<thead><tr><th>' + yearLabel + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    years.forEach(function (y) {
      var yStr = String(y);
      var perDay = workByYear[yStr] || {};
      function cellAvg(day) {
        var s = perDay[day];
        return s && s.days > 0 ? W.formatMinutes(s.avgWork) : '—';
      }
      html += '<tr><td>' + y + '</td><td>' + cellAvg(1) + '</td><td>' + cellAvg(2) + '</td><td>' + cellAvg(3) + '</td><td>' + cellAvg(4) + '</td><td>' + cellAvg(5) + '</td></tr>';
    });
    html += '</tbody></table></div></section>';

    html += sectionOpen(
      t('infographic.sectionTotalOvertimeByWeekday'),
      '',
      'total-overtime',
      'total-overtime'
    );
    html += '<div class="infographic-table-wrap"><table class="infographic-table">';
    html += '<thead><tr><th>' + yearLabel + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    years.forEach(function (y) {
      var yStr = String(y);
      var perDay = workByYear[yStr] || {};
      function cellOtTotal(day) {
        var s = perDay[day];
        return s ? W.formatMinutes(s.totalOvertime) : '—';
      }
      html += '<tr><td>' + y + '</td><td>' + cellOtTotal(1) + '</td><td>' + cellOtTotal(2) + '</td><td>' + cellOtTotal(3) + '</td><td>' + cellOtTotal(4) + '</td><td>' + cellOtTotal(5) + '</td></tr>';
    });
    html += '</tbody></table></div></section>';

    html += sectionOpen(
      t('infographic.sectionAvgOvertimeByWeekday'),
      '',
      'avg-overtime',
      'avg-overtime'
    );
    html += '<div class="infographic-table-wrap"><table class="infographic-table">';
    html += '<thead><tr><th>' + yearLabel + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    years.forEach(function (y) {
      var yStr = String(y);
      var perDay = workByYear[yStr] || {};
      function cellOtAvg(day) {
        var s = perDay[day];
        return s && s.days > 0 ? W.formatMinutes(s.avgOvertime) : '—';
      }
      html += '<tr><td>' + y + '</td><td>' + cellOtAvg(1) + '</td><td>' + cellOtAvg(2) + '</td><td>' + cellOtAvg(3) + '</td><td>' + cellOtAvg(4) + '</td><td>' + cellOtAvg(5) + '</td></tr>';
    });
    html += '</tbody></table></div></section>';
    html += '</div>';

    function cellLoc(perDay, day, field, fmt) {
      var s = perDay[day];
      if (!s) return '—';
      var wfo = s.WFO || {};
      var wfh = s.WFH || {};
      var vWfo = wfo[field];
      var vWfh = wfh[field];
      var hasWfo = vWfo != null && (field.indexOf('avg') === 0 ? (wfo.days > 0) : true);
      var hasWfh = vWfh != null && (field.indexOf('avg') === 0 ? (wfh.days > 0) : true);
      if (!hasWfo && !hasWfh) return '—';
      var fWfo = hasWfo ? fmt(vWfo) : '—';
      var fWfh = hasWfh ? fmt(vWfh) : '—';
      // Compact format to reduce card noise. Order is always WFO / WFH.
      return fWfo + ' / ' + fWfh;
    }

    // Panel 4: Work/overtime weekdays by location (mirror of panel 3)
    html += '<div id="infographicLocationPanel" class="infographic-panels is-hidden" hidden>';
    html += sectionOpen(
      t('statsSummary.detailTotalWorkTitle'),
      '',
      'total-work-location',
      'total-work-location'
    );
    html += '<div class="infographic-table-wrap"><table class="infographic-table">';
    html += '<thead><tr><th>' + yearLabel + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    years.forEach(function (y) {
      var yStr = String(y);
      var perDay = workByYearLoc[yStr] || {};
      html += '<tr><td>' + y + '</td><td>' + cellLoc(perDay, 1, 'totalWork', W.formatMinutes) + '</td><td>' + cellLoc(perDay, 2, 'totalWork', W.formatMinutes) + '</td><td>' + cellLoc(perDay, 3, 'totalWork', W.formatMinutes) + '</td><td>' + cellLoc(perDay, 4, 'totalWork', W.formatMinutes) + '</td><td>' + cellLoc(perDay, 5, 'totalWork', W.formatMinutes) + '</td></tr>';
    });
    html += '</tbody></table></div></section>';

    html += sectionOpen(
      t('statsSummary.detailAvgWorkTitle'),
      '',
      'avg-work-location',
      'avg-work-location'
    );
    html += '<div class="infographic-table-wrap"><table class="infographic-table">';
    html += '<thead><tr><th>' + yearLabel + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    years.forEach(function (y) {
      var yStr = String(y);
      var perDay = workByYearLoc[yStr] || {};
      html += '<tr><td>' + y + '</td><td>' + cellLoc(perDay, 1, 'avgWork', W.formatMinutes) + '</td><td>' + cellLoc(perDay, 2, 'avgWork', W.formatMinutes) + '</td><td>' + cellLoc(perDay, 3, 'avgWork', W.formatMinutes) + '</td><td>' + cellLoc(perDay, 4, 'avgWork', W.formatMinutes) + '</td><td>' + cellLoc(perDay, 5, 'avgWork', W.formatMinutes) + '</td></tr>';
    });
    html += '</tbody></table></div></section>';

    html += sectionOpen(
      t('statsSummary.detailTotalOvertimeTitle'),
      '',
      'total-overtime-location',
      'total-overtime-location'
    );
    html += '<div class="infographic-table-wrap"><table class="infographic-table">';
    html += '<thead><tr><th>' + yearLabel + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    years.forEach(function (y) {
      var yStr = String(y);
      var perDay = workByYearLoc[yStr] || {};
      html += '<tr><td>' + y + '</td><td>' + cellLoc(perDay, 1, 'totalOvertime', W.formatMinutes) + '</td><td>' + cellLoc(perDay, 2, 'totalOvertime', W.formatMinutes) + '</td><td>' + cellLoc(perDay, 3, 'totalOvertime', W.formatMinutes) + '</td><td>' + cellLoc(perDay, 4, 'totalOvertime', W.formatMinutes) + '</td><td>' + cellLoc(perDay, 5, 'totalOvertime', W.formatMinutes) + '</td></tr>';
    });
    html += '</tbody></table></div></section>';

    html += sectionOpen(
      t('statsSummary.detailAvgOvertimeTitle'),
      '',
      'avg-overtime-location',
      'avg-overtime-location'
    );
    html += '<div class="infographic-table-wrap"><table class="infographic-table">';
    html += '<thead><tr><th>' + yearLabel + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    years.forEach(function (y) {
      var yStr = String(y);
      var perDay = workByYearLoc[yStr] || {};
      html += '<tr><td>' + y + '</td><td>' + cellLoc(perDay, 1, 'avgOvertime', W.formatMinutes) + '</td><td>' + cellLoc(perDay, 2, 'avgOvertime', W.formatMinutes) + '</td><td>' + cellLoc(perDay, 3, 'avgOvertime', W.formatMinutes) + '</td><td>' + cellLoc(perDay, 4, 'avgOvertime', W.formatMinutes) + '</td><td>' + cellLoc(perDay, 5, 'avgOvertime', W.formatMinutes) + '</td></tr>';
    });
    html += '</tbody></table></div></section>';
    html += '</div>';

    var container = document.getElementById('infographicContent');
    var categoryBar = document.getElementById('infographicCategoryBar');
    var modal = document.getElementById('infographicModal');
    var intro = document.getElementById('infographicModalIntro');
    var title = document.getElementById('infographicModalTitle');
    if (container) container.innerHTML = html;
    if (title) title.textContent = t('modals.infographicModal.title');
    if (intro) intro.textContent = t('modals.statsSummaryModal.viewLabel') + ': ' + shortSummaryLabel + ', ' + shortVacationLabel + ', ' + shortWorkLabel + ', ' + t('modals.statsSummaryModal.categoryDetails') + '.';
    if (categoryBar) {
      var summaryAria = shortSummaryLabel;
      var vacationAria = shortVacationLabel;
      var workAria = t('modals.statsSummaryModal.categoryGeneral');
      var detailsAria = t('modals.statsSummaryModal.categoryDetails');
      categoryBar.setAttribute('aria-label', t('modals.statsSummaryModal.viewLabel'));
      categoryBar.innerHTML =
        '<button type="button" class="stats-summary-cat-btn infographic-cat-btn is-active" data-target-panel="infographicSummaryPanel" aria-pressed="true" title="' + summaryAria + '" aria-label="' + summaryAria + '"><span class="btn-profile-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></span><span class="sr-only">' + summaryAria + '</span></button>' +
        '<button type="button" class="stats-summary-cat-btn infographic-cat-btn" data-target-panel="infographicVacationPanel" aria-pressed="false" title="' + vacationAria + '" aria-label="' + vacationAria + '"><span class="btn-profile-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h16"/><path d="M4 14h10"/><path d="M4 18h7"/><path d="M15 6h5"/><path d="M17.5 4v4"/></svg></span><span class="sr-only">' + vacationAria + '</span></button>' +
        '<button type="button" class="stats-summary-cat-btn infographic-cat-btn" data-target-panel="infographicWorkPanel" aria-pressed="false" title="' + workAria + '" aria-label="' + workAria + '"><span class="btn-profile-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l3-3 3 2 4-5"/></svg></span><span class="sr-only">' + workAria + '</span></button>' +
        '<button type="button" class="stats-summary-cat-btn infographic-cat-btn" data-target-panel="infographicLocationPanel" aria-pressed="false" title="' + detailsAria + '" aria-label="' + detailsAria + '"><span class="btn-profile-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg></span><span class="sr-only">' + detailsAria + '</span></button>';
    }
    if (modal) modal.classList.add('open');
    currentInfographicData = {
      years: years,
      byYearQuota: byYearQuota,
      usedByYear: usedByYear,
      vacationByWeekday: vacationByWeekday,
      workByYear: workByYear,
      workByYearLoc: workByYearLoc,
      summaryData: summaryData,
      summaryByLocationData: summaryByLocationData
    };
    if (categoryBar) {
      categoryBar.querySelectorAll('.infographic-cat-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var targetId = btn.getAttribute('data-target-panel');
          if (!targetId) return;
          categoryBar.querySelectorAll('.infographic-cat-btn').forEach(function (b) {
            var active = b === btn;
            b.classList.toggle('is-active', active);
            b.setAttribute('aria-pressed', active ? 'true' : 'false');
          });
          if (!container) return;
          container.querySelectorAll('.infographic-panels').forEach(function (panel) {
            var isTarget = panel.id === targetId;
            panel.classList.toggle('is-hidden', !isTarget);
            if (isTarget) panel.removeAttribute('hidden');
            else panel.setAttribute('hidden', '');
          });
        });
      });
    }
    if (container) {
      container.querySelectorAll('.infographic-export-csv').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var key = this.getAttribute('data-export');
          if (key) exportInfographicTable(key);
        });
      });
      container.querySelectorAll('.infographic-card-fullscreen').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var key = btn.getAttribute('data-infographic-fullscreen');
          if (key && typeof W.openInfographicSectionFullscreen === 'function') W.openInfographicSectionFullscreen(key);
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
    var minutesSuffix = t('infographic.csv.minutesSuffix');
    var metricHeader = [t('infographic.table.metric'), t('infographic.table.value')];
    var yearHeader = t('infographic.table.year');
    var quotaHeader = t('infographic.table.quota');
    var usedHeader = t('infographic.table.used');
    var remainingHeader = t('infographic.table.remaining');
    var metrics = {
      totalWorkingHours: t('infographic.metrics.totalWorkingHours'),
      avgWorkingHours: t('infographic.metrics.avgWorkingHours'),
      totalOvertime: t('infographic.metrics.totalOvertime'),
      avgOvertime: t('infographic.metrics.avgOvertime'),
      totalVacationQuota: t('infographic.metrics.totalVacationQuota'),
      totalVacationUsed: t('infographic.metrics.totalVacationUsed'),
      totalSick: t('infographic.metrics.totalSick'),
      totalPublicHolidays: t('infographic.metrics.totalPublicHolidays')
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
    } else if (sectionKey === 'summary-totals-location') {
      var sl = d.summaryByLocationData;
      if (!sl) return;
      lines.push(csvRow([
        t('infographic.table.metric'),
        t('statsSummary.datasetWfh'),
        t('statsSummary.datasetWfo')
      ]));
      lines.push(csvRow([metrics.totalWorkingHours + ' (' + minutesSuffix + ')', sl.wfhTotalWorkingHours, sl.wfoTotalWorkingHours]));
      lines.push(csvRow([metrics.avgWorkingHours + ' (' + minutesSuffix + ')', sl.wfhAvgWorkingHours, sl.wfoAvgWorkingHours]));
      lines.push(csvRow([metrics.totalOvertime + ' (' + minutesSuffix + ')', sl.wfhTotalOvertime, sl.wfoTotalOvertime]));
      lines.push(csvRow([metrics.avgOvertime + ' (' + minutesSuffix + ')', sl.wfhAvgOvertime, sl.wfoAvgOvertime]));
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
    } else if (sectionKey === 'total-work-location' || sectionKey === 'avg-work-location' || sectionKey === 'total-overtime-location' || sectionKey === 'avg-overtime-location') {
      lines.push(csvRow([
        yearHeader,
        mon + ' ' + t('statsSummary.datasetWfo'),
        mon + ' ' + t('statsSummary.datasetWfh'),
        tue + ' ' + t('statsSummary.datasetWfo'),
        tue + ' ' + t('statsSummary.datasetWfh'),
        wed + ' ' + t('statsSummary.datasetWfo'),
        wed + ' ' + t('statsSummary.datasetWfh'),
        thu + ' ' + t('statsSummary.datasetWfo'),
        thu + ' ' + t('statsSummary.datasetWfh'),
        fri + ' ' + t('statsSummary.datasetWfo'),
        fri + ' ' + t('statsSummary.datasetWfh')
      ]));
      years.forEach(function (y) {
        var yStr = String(y);
        var perDay = d.workByYearLoc[yStr] || {};
        function locVals(day, field) {
          var s = perDay[day] || {};
          var wfo = s.WFO || {};
          var wfh = s.WFH || {};
          var a = wfo[field];
          var b = wfh[field];
          if (field.indexOf('avg') === 0) {
            a = (wfo.days > 0) ? a : '';
            b = (wfh.days > 0) ? b : '';
          }
          return [a == null ? '' : a, b == null ? '' : b];
        }
        var fieldName = sectionKey === 'total-work-location' ? 'totalWork'
          : sectionKey === 'avg-work-location' ? 'avgWork'
          : sectionKey === 'total-overtime-location' ? 'totalOvertime'
          : 'avgOvertime';
        var m = locVals(1, fieldName);
        var t2 = locVals(2, fieldName);
        var w = locVals(3, fieldName);
        var th2 = locVals(4, fieldName);
        var f = locVals(5, fieldName);
        lines.push(csvRow([y, m[0], m[1], t2[0], t2[1], w[0], w[1], th2[0], th2[1], f[0], f[1]]));
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
    if (typeof W.closeInfographicFullscreen === 'function') W.closeInfographicFullscreen();
  }

  W.openInfographicModal = openInfographicModal;
  W.closeInfographicModal = closeInfographicModal;
  W.exportInfographicTable = exportInfographicTable;
})(window.WorkHours);
