/**
 * Infographic popup: vacation days and weekday working hours/overtime per year.
 * Depends: entries (getEntries), vacation-days (getVacationDaysByYear, getProfile), time, constants.
 */
(function (W) {
  'use strict';

  var currentInfographicData = null;
  var infographicFullscreenCards = [];
  var infographicFullscreenCurrentKey = null;
  /** Wrap class for weekday tables that respect the timeframe selector (scroll + sticky header in CSS). */
  var INFOGRAPHIC_TIMEFRAME_TABLE_WRAP_CLASS = 'infographic-table-wrap infographic-table-wrap--timeframe-scroll';

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

  // Per-year, per-weekday stats (Mon–Fri) for clock in/out times on work days.
  // byYear[year][dayOfWeek] = {
  //   in: { min, max, sum, count, avg },
  //   out: { min, max, sum, count, avg }
  // } (all in minutes since 00:00).
  function getClockInOutStatsByYearAndWeekday(entries) {
    var byYear = {};
    function ensureSlot(y, dayOfWeek) {
      if (!byYear[y]) byYear[y] = {};
      if (!byYear[y][dayOfWeek]) {
        byYear[y][dayOfWeek] = {
          in: { min: null, max: null, sum: 0, count: 0, avg: null },
          out: { min: null, max: null, sum: 0, count: 0, avg: null }
        };
      }
      return byYear[y][dayOfWeek];
    }
    function pushAgg(agg, minutes) {
      if (minutes == null || isNaN(minutes)) return;
      var m = Math.round(Number(minutes));
      if (m < 0 || m > 24 * 60 + 59) return;
      agg.min = agg.min == null ? m : Math.min(agg.min, m);
      agg.max = agg.max == null ? m : Math.max(agg.max, m);
      agg.sum += m;
      agg.count += 1;
    }
    entries.forEach(function (e) {
      if (!e || (e.dayStatus || 'work') !== 'work') return;
      var dateStr = e.date;
      if (!dateStr || dateStr.length < 4) return;
      var d = new Date(dateStr + 'T12:00:00');
      if (isNaN(d.getTime())) return;
      var dayOfWeek = d.getDay();
      if (dayOfWeek < 1 || dayOfWeek > 5) return; // Mon–Fri only
      var y = dateStr.slice(0, 4);
      var slot = ensureSlot(y, dayOfWeek);
      if (typeof W.parseTime === 'function') {
        pushAgg(slot.in, W.parseTime(e.clockIn));
        pushAgg(slot.out, W.parseTime(e.clockOut));
      }
    });
    Object.keys(byYear).forEach(function (y) {
      var perDay = byYear[y];
      Object.keys(perDay).forEach(function (d) {
        var s = perDay[d];
        s.in.avg = s.in.count > 0 ? Math.round(s.in.sum / s.in.count) : null;
        s.out.avg = s.out.count > 0 ? Math.round(s.out.sum / s.out.count) : null;
      });
    });
    return byYear;
  }

  function formatClockMinutesToHHmm(m) {
    if (m == null || m === '—' || isNaN(m)) return '—';
    var mm = Math.max(0, Math.min(23 * 60 + 59, Math.round(Number(m))));
    var h = Math.floor(mm / 60);
    var min = mm % 60;
    return String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0');
  }

  /** Working/overtime duration cells (minutes) — same short style as entries and stats. */
  function formatInfographicMinutes(m) {
    if (typeof W.formatMinutes === 'function') return W.formatMinutes(m);
    if (m == null || isNaN(m)) return '—';
    var minutes = Math.round(Number(m));
    var sign = minutes < 0 ? '-' : '';
    var totalAbs = Math.abs(minutes);
    var h = Math.floor(totalAbs / 60);
    var min = totalAbs % 60;
    if (h > 0 && min > 0) return sign + h + 'h ' + min + 'm';
    if (h > 0) return sign + h + 'h';
    return sign + min + 'm';
  }

  var INFOGRAPHIC_TIMEFRAME_STORAGE_KEY = 'workingHours.infographicTimeframe';
  var INFOGRAPHIC_TIMEFRAMES = ['annual', 'quarterly', 'monthly', 'weekly'];
  /** Panels where the timeframe selector applies (weekday tables, clock grid, WFO/WFH detail tables). */
  var INFOGRAPHIC_TIMEFRAME_PANEL_IDS = {
    infographicWorkPanel: true,
    infographicClockPanel: true,
    infographicLocationPanel: true
  };

  function normalizeInfographicTimeframe(raw) {
    if (INFOGRAPHIC_TIMEFRAMES.indexOf(raw) !== -1) return raw;
    return 'annual';
  }

  function getStoredInfographicTimeframe() {
    try {
      return normalizeInfographicTimeframe(localStorage.getItem(INFOGRAPHIC_TIMEFRAME_STORAGE_KEY));
    } catch (e) {
      return 'annual';
    }
  }

  /** ISO week-year and week number (Mon–Sun weeks, week 1 contains Jan 4). */
  function isoWeekYearAndNumber(d) {
    var date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    var week1 = new Date(date.getFullYear(), 0, 4);
    return {
      isoYear: date.getFullYear(),
      week: 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
    };
  }

  function periodSortKeyFromDateStr(dateStr, timeframe) {
    var d = new Date(dateStr + 'T12:00:00');
    if (isNaN(d.getTime()) || !dateStr || dateStr.length < 4) return null;
    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    if (timeframe === 'annual') return String(y);
    if (timeframe === 'quarterly') {
      var q = Math.floor((m - 1) / 3) + 1;
      return y + '-Q' + q;
    }
    if (timeframe === 'monthly') return y + '-' + String(m).padStart(2, '0');
    if (timeframe === 'weekly') {
      var iw = isoWeekYearAndNumber(d);
      return iw.isoYear + '-W' + String(iw.week).padStart(2, '0');
    }
    return String(y);
  }

  function formatInfographicPeriodLabel(periodKey, timeframe, tr, resolveCal) {
    if (timeframe === 'annual') return periodKey;
    if (INFOGRAPHIC_TIMEFRAMES.indexOf(timeframe) === -1) return periodKey;
    if (timeframe === 'quarterly') {
      var mq = String(periodKey).match(/^(\d{4})-Q([1-4])$/);
      if (mq) return tr('infographic.period.quarter', { year: mq[1], quarter: mq[2] });
      return periodKey;
    }
    if (timeframe === 'monthly') {
      var mm = String(periodKey).match(/^(\d{4})-(\d{2})$/);
      if (mm) {
        var mi = parseInt(mm[2], 10) - 1;
        var months = resolveCal ? resolveCal('calendarStats.months') : null;
        var name = months && months[mi] != null ? months[mi] : mm[2];
        return tr('infographic.period.monthYear', { month: name, year: mm[1] });
      }
      return periodKey;
    }
    if (timeframe === 'weekly') {
      var mw = String(periodKey).match(/^(\d{4})-W(\d{2})$/);
      if (mw) return tr('infographic.period.week', { year: mw[1], week: String(parseInt(mw[2], 10)) });
      return periodKey;
    }
    return periodKey;
  }

  function buildWeekdayPeriodOrder(timeframe, yearsNumeric, workMap, locMap, clockMap) {
    var set = {};
    function add(map) {
      if (!map) return;
      Object.keys(map).forEach(function (k) { set[k] = true; });
    }
    add(workMap);
    add(locMap);
    add(clockMap);
    if (timeframe === 'annual') {
      yearsNumeric.forEach(function (y) { set[String(y)] = true; });
    }
    var keys = Object.keys(set).sort();
    return keys.reverse();
  }

  function getWorkStatsByPeriodAndWeekday(entries, timeframe) {
    var byPeriod = {};
    var standardDay = W.STANDARD_WORK_MINUTES_PER_DAY || 480;
    entries.forEach(function (e) {
      if ((e.dayStatus || 'work') !== 'work') return;
      var dateStr = e.date;
      if (!dateStr || dateStr.length < 4) return;
      var d = new Date(dateStr + 'T12:00:00');
      if (isNaN(d.getTime())) return;
      var dayOfWeek = d.getDay();
      if (dayOfWeek < 1 || dayOfWeek > 5) return;
      var pk = periodSortKeyFromDateStr(dateStr, timeframe);
      if (!pk) return;
      var dur = W.workingMinutes(e.clockIn, e.clockOut, e.breakMinutes);
      if (dur == null) return;
      if (!byPeriod[pk]) byPeriod[pk] = {};
      if (!byPeriod[pk][dayOfWeek]) byPeriod[pk][dayOfWeek] = { totalWork: 0, days: 0, totalOvertime: 0 };
      var slot = byPeriod[pk][dayOfWeek];
      slot.totalWork += dur;
      slot.days += 1;
      slot.totalOvertime += Math.max(0, dur - standardDay);
    });
    Object.keys(byPeriod).forEach(function (pk) {
      var perDay = byPeriod[pk];
      Object.keys(perDay).forEach(function (d) {
        var s = perDay[d];
        s.avgWork = s.days > 0 ? Math.round(s.totalWork / s.days) : 0;
        s.avgOvertime = s.days > 0 ? Math.round(s.totalOvertime / s.days) : 0;
      });
    });
    return byPeriod;
  }

  function getWorkStatsByPeriodWeekdayAndLocation(entries, timeframe) {
    var byPeriod = {};
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
      var pk = periodSortKeyFromDateStr(dateStr, timeframe);
      if (!pk) return;
      if (!byPeriod[pk]) byPeriod[pk] = {};
      if (!byPeriod[pk][dayOfWeek]) {
        byPeriod[pk][dayOfWeek] = {
          WFO: { totalWork: 0, days: 0, totalOvertime: 0, avgWork: 0, avgOvertime: 0 },
          WFH: { totalWork: 0, days: 0, totalOvertime: 0, avgWork: 0, avgOvertime: 0 }
        };
      }
      var slot = byPeriod[pk][dayOfWeek][loc];
      slot.totalWork += dur;
      slot.days += 1;
      slot.totalOvertime += Math.max(0, dur - standardDay);
    });
    Object.keys(byPeriod).forEach(function (pk) {
      var perDay = byPeriod[pk];
      Object.keys(perDay).forEach(function (d) {
        ['WFO', 'WFH'].forEach(function (loc) {
          var s = perDay[d][loc];
          s.avgWork = s.days > 0 ? Math.round(s.totalWork / s.days) : 0;
          s.avgOvertime = s.days > 0 ? Math.round(s.totalOvertime / s.days) : 0;
        });
      });
    });
    return byPeriod;
  }

  function getClockInOutStatsByPeriodAndWeekday(entries, timeframe) {
    var byPeriod = {};
    function ensureSlot(pk, dayOfWeek) {
      if (!byPeriod[pk]) byPeriod[pk] = {};
      if (!byPeriod[pk][dayOfWeek]) {
        byPeriod[pk][dayOfWeek] = {
          in: { min: null, max: null, sum: 0, count: 0, avg: null },
          out: { min: null, max: null, sum: 0, count: 0, avg: null }
        };
      }
      return byPeriod[pk][dayOfWeek];
    }
    function pushAgg(agg, minutes) {
      if (minutes == null || isNaN(minutes)) return;
      var m = Math.round(Number(minutes));
      if (m < 0 || m > 24 * 60 + 59) return;
      agg.min = agg.min == null ? m : Math.min(agg.min, m);
      agg.max = agg.max == null ? m : Math.max(agg.max, m);
      agg.sum += m;
      agg.count += 1;
    }
    entries.forEach(function (e) {
      if (!e || (e.dayStatus || 'work') !== 'work') return;
      var dateStr = e.date;
      if (!dateStr || dateStr.length < 4) return;
      var d = new Date(dateStr + 'T12:00:00');
      if (isNaN(d.getTime())) return;
      var dayOfWeek = d.getDay();
      if (dayOfWeek < 1 || dayOfWeek > 5) return;
      var pk = periodSortKeyFromDateStr(dateStr, timeframe);
      if (!pk) return;
      var slot = ensureSlot(pk, dayOfWeek);
      if (typeof W.parseTime === 'function') {
        pushAgg(slot.in, W.parseTime(e.clockIn));
        pushAgg(slot.out, W.parseTime(e.clockOut));
      }
    });
    Object.keys(byPeriod).forEach(function (pk) {
      var perDay = byPeriod[pk];
      Object.keys(perDay).forEach(function (d) {
        var s = perDay[d];
        s.in.avg = s.in.count > 0 ? Math.round(s.in.sum / s.in.count) : null;
        s.out.avg = s.out.count > 0 ? Math.round(s.out.sum / s.out.count) : null;
      });
    });
    return byPeriod;
  }

  function cellLocInfographic(perDay, day, field) {
    var s = perDay[day];
    if (!s) return '—';
    var wfo = s.WFO || {};
    var wfh = s.WFH || {};
    var vWfo = wfo[field];
    var vWfh = wfh[field];
    var hasWfo = vWfo != null && (field.indexOf('avg') === 0 ? (wfo.days > 0) : true);
    var hasWfh = vWfh != null && (field.indexOf('avg') === 0 ? (wfh.days > 0) : true);
    if (!hasWfo && !hasWfh) return '—';
    var tLab = (W.I18N && typeof W.I18N.t === 'function') ? W.I18N.t : function (k) { return k; };
    var wfoL = tLab('statsSummary.datasetWfo');
    var wfhL = tLab('statsSummary.datasetWfh');
    var fWfo = hasWfo ? formatInfographicMinutes(vWfo) : '—';
    var fWfh = hasWfh ? formatInfographicMinutes(vWfh) : '—';
    return wfoL + ': ' + fWfo + ', ' + wfhL + ': ' + fWfh;
  }

  function clockCellInfographic(perDay, day, which, field) {
    var s = perDay[day];
    if (!s || !s[which]) return '—';
    var v = s[which][field];
    return v == null ? '—' : formatClockMinutesToHHmm(v);
  }

  function patchInfographicWeekdayTables(timeframe, periodOrder, workByPeriod, workByPeriodLoc, clockByPeriod) {
    var container = document.getElementById('infographicContent');
    if (!container) return;
    var tfn = (W.I18N && W.I18N.t) ? W.I18N.t : function (k) { return k; };
    var resolveCal = (W.I18N && W.I18N.resolve)
      ? function (path) { return W.I18N.resolve(path, W.currentLanguage); }
      : function () { return null; };
    var yearHeader = tfn('infographic.table.year');
    var periodHeader = tfn('infographic.table.period');
    var header = timeframe === 'annual' ? yearHeader : periodHeader;
    container.querySelectorAll('th.infographic-period-col-header').forEach(function (th) {
      th.textContent = header;
    });
    function label(pk) { return formatInfographicPeriodLabel(pk, timeframe, tfn, resolveCal); }
    function setTbody(sectionKey, inner) {
      var sec = container.querySelector('.infographic-section[data-section-key="' + sectionKey + '"] tbody');
      if (sec) sec.innerHTML = inner;
    }
    var rowsTotalWork = '';
    var rowsAvgWork = '';
    var rowsTotalOt = '';
    var rowsAvgOt = '';
    periodOrder.forEach(function (pk) {
      var perDay = workByPeriod[pk] || {};
      function cellTotal(day) {
        var s = perDay[day];
        return s ? formatInfographicMinutes(s.totalWork) : '—';
      }
      function cellAvg(day) {
        var s = perDay[day];
        return s && s.days > 0 ? formatInfographicMinutes(s.avgWork) : '—';
      }
      function cellOtT(day) {
        var s = perDay[day];
        return s ? formatInfographicMinutes(s.totalOvertime) : '—';
      }
      function cellOtA(day) {
        var s = perDay[day];
        return s && s.days > 0 ? formatInfographicMinutes(s.avgOvertime) : '—';
      }
      var lb = label(pk);
      rowsTotalWork += '<tr><td>' + lb + '</td><td>' + cellTotal(1) + '</td><td>' + cellTotal(2) + '</td><td>' + cellTotal(3) + '</td><td>' + cellTotal(4) + '</td><td>' + cellTotal(5) + '</td></tr>';
      rowsAvgWork += '<tr><td>' + lb + '</td><td>' + cellAvg(1) + '</td><td>' + cellAvg(2) + '</td><td>' + cellAvg(3) + '</td><td>' + cellAvg(4) + '</td><td>' + cellAvg(5) + '</td></tr>';
      rowsTotalOt += '<tr><td>' + lb + '</td><td>' + cellOtT(1) + '</td><td>' + cellOtT(2) + '</td><td>' + cellOtT(3) + '</td><td>' + cellOtT(4) + '</td><td>' + cellOtT(5) + '</td></tr>';
      rowsAvgOt += '<tr><td>' + lb + '</td><td>' + cellOtA(1) + '</td><td>' + cellOtA(2) + '</td><td>' + cellOtA(3) + '</td><td>' + cellOtA(4) + '</td><td>' + cellOtA(5) + '</td></tr>';
    });
    setTbody('total-work', rowsTotalWork);
    setTbody('avg-work', rowsAvgWork);
    setTbody('total-overtime', rowsTotalOt);
    setTbody('avg-overtime', rowsAvgOt);
    var rowsTwLoc = '';
    var rowsAwLoc = '';
    var rowsToLoc = '';
    var rowsAoLoc = '';
    periodOrder.forEach(function (pk) {
      var perDay = workByPeriodLoc[pk] || {};
      var lb = label(pk);
      rowsTwLoc += '<tr><td>' + lb + '</td><td>' + cellLocInfographic(perDay, 1, 'totalWork') + '</td><td>' + cellLocInfographic(perDay, 2, 'totalWork') + '</td><td>' + cellLocInfographic(perDay, 3, 'totalWork') + '</td><td>' + cellLocInfographic(perDay, 4, 'totalWork') + '</td><td>' + cellLocInfographic(perDay, 5, 'totalWork') + '</td></tr>';
      rowsAwLoc += '<tr><td>' + lb + '</td><td>' + cellLocInfographic(perDay, 1, 'avgWork') + '</td><td>' + cellLocInfographic(perDay, 2, 'avgWork') + '</td><td>' + cellLocInfographic(perDay, 3, 'avgWork') + '</td><td>' + cellLocInfographic(perDay, 4, 'avgWork') + '</td><td>' + cellLocInfographic(perDay, 5, 'avgWork') + '</td></tr>';
      rowsToLoc += '<tr><td>' + lb + '</td><td>' + cellLocInfographic(perDay, 1, 'totalOvertime') + '</td><td>' + cellLocInfographic(perDay, 2, 'totalOvertime') + '</td><td>' + cellLocInfographic(perDay, 3, 'totalOvertime') + '</td><td>' + cellLocInfographic(perDay, 4, 'totalOvertime') + '</td><td>' + cellLocInfographic(perDay, 5, 'totalOvertime') + '</td></tr>';
      rowsAoLoc += '<tr><td>' + lb + '</td><td>' + cellLocInfographic(perDay, 1, 'avgOvertime') + '</td><td>' + cellLocInfographic(perDay, 2, 'avgOvertime') + '</td><td>' + cellLocInfographic(perDay, 3, 'avgOvertime') + '</td><td>' + cellLocInfographic(perDay, 4, 'avgOvertime') + '</td><td>' + cellLocInfographic(perDay, 5, 'avgOvertime') + '</td></tr>';
    });
    setTbody('total-work-location', rowsTwLoc);
    setTbody('avg-work-location', rowsAwLoc);
    setTbody('total-overtime-location', rowsToLoc);
    setTbody('avg-overtime-location', rowsAoLoc);
    var clockKeys = ['clockin-earliest', 'clockin-latest', 'clockin-avg', 'clockout-earliest', 'clockout-latest', 'clockout-avg'];
    var clockFlds = [
      ['in', 'min'], ['in', 'max'], ['in', 'avg'],
      ['out', 'min'], ['out', 'max'], ['out', 'avg']
    ];
    for (var ci = 0; ci < clockKeys.length; ci++) {
      var rowsClock = '';
      var w = clockFlds[ci][0];
      var f = clockFlds[ci][1];
      periodOrder.forEach(function (pk) {
        var perDayC = clockByPeriod[pk] || {};
        var lbC = label(pk);
        rowsClock += '<tr><td>' + lbC + '</td><td>' + clockCellInfographic(perDayC, 1, w, f) + '</td><td>' + clockCellInfographic(perDayC, 2, w, f) + '</td><td>' + clockCellInfographic(perDayC, 3, w, f) + '</td><td>' + clockCellInfographic(perDayC, 4, w, f) + '</td><td>' + clockCellInfographic(perDayC, 5, w, f) + '</td></tr>';
      });
      setTbody(clockKeys[ci], rowsClock);
    }
  }

  function refreshInfographicModalTimeframe(timeframe) {
    if (!currentInfographicData) return;
    var profile = W.getProfile();
    var entries = W.getEntries();
    var byYearQuota = W.getVacationDaysByYear(profile);
    var usedByYear = getVacationUsedByYear(entries);
    var vacationByWeekday = getVacationUsedByYearAndWeekday(entries);
    var workByYearBaseline = getWorkStatsByYearAndWeekday(entries);
    var clockByYearBaseline = getClockInOutStatsByYearAndWeekday(entries);
    var curYear = new Date().getFullYear();
    var yearSet = new Set(
      Object.keys(byYearQuota)
        .concat(Object.keys(usedByYear))
        .concat(Object.keys(vacationByWeekday))
        .concat(Object.keys(workByYearBaseline))
        .concat(Object.keys(clockByYearBaseline))
    );
    var years = [];
    yearSet.forEach(function (y) { years.push(parseInt(y, 10)); });
    if (years.indexOf(curYear) === -1) years.push(curYear);
    years.sort(function (a, b) { return a - b; });
    var tf = normalizeInfographicTimeframe(timeframe);
    var workByPeriod = getWorkStatsByPeriodAndWeekday(entries, tf);
    var workByPeriodLoc = getWorkStatsByPeriodWeekdayAndLocation(entries, tf);
    var clockByPeriod = getClockInOutStatsByPeriodAndWeekday(entries, tf);
    var weekdayPeriodOrder = buildWeekdayPeriodOrder(tf, years, workByPeriod, workByPeriodLoc, clockByPeriod);
    currentInfographicData.timeframe = tf;
    currentInfographicData.weekdayPeriodOrder = weekdayPeriodOrder;
    currentInfographicData.workByPeriod = workByPeriod;
    currentInfographicData.workByYear = workByPeriod;
    currentInfographicData.workByPeriodLoc = workByPeriodLoc;
    currentInfographicData.workByYearLoc = workByPeriodLoc;
    currentInfographicData.clockByPeriod = clockByPeriod;
    currentInfographicData.clockByYear = clockByPeriod;
    patchInfographicWeekdayTables(tf, weekdayPeriodOrder, workByPeriod, workByPeriodLoc, clockByPeriod);
  }

  function bindInfographicTimeframeControl(timeframe) {
    var sel = document.getElementById('infographicTimeframe');
    if (!sel) return;
    var tfLab = (W.I18N && W.I18N.t) ? W.I18N.t('infographic.timeframe.label') : 'Timeframe';
    sel.setAttribute('aria-label', tfLab);
    if (!sel.dataset.infographicBound) {
      sel.dataset.infographicBound = '1';
      sel.addEventListener('change', function () {
        var v = normalizeInfographicTimeframe(sel.value);
        try { localStorage.setItem(INFOGRAPHIC_TIMEFRAME_STORAGE_KEY, v); } catch (e) {}
        refreshInfographicModalTimeframe(v);
      });
    }
    sel.value = normalizeInfographicTimeframe(timeframe);
  }

  function syncInfographicTimeframeForPanel(panelId) {
    var wrap = document.getElementById('infographicTimeframeWrap');
    var sel = document.getElementById('infographicTimeframe');
    var show = !!INFOGRAPHIC_TIMEFRAME_PANEL_IDS[panelId];
    if (wrap) {
      wrap.classList.toggle('is-hidden', !show);
      if (show) wrap.removeAttribute('hidden');
      else wrap.setAttribute('hidden', '');
    }
    if (sel) {
      sel.disabled = !show;
      if (show) {
        sel.removeAttribute('aria-hidden');
        var tfLab = (W.I18N && W.I18N.t) ? W.I18N.t('infographic.timeframe.label') : 'Timeframe';
        sel.setAttribute('aria-label', tfLab);
      } else {
        sel.setAttribute('aria-hidden', 'true');
        sel.removeAttribute('aria-label');
      }
    }
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
      var closeLab = closeBtn.querySelector('.btn-profile-label');
      if (closeLab) closeLab.textContent = closeLabel;
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
    if (modal.requestFullscreen || modal.webkitRequestFullscreen || modal.msRequestFullscreen) {
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
    var clockByYear = getClockInOutStatsByYearAndWeekday(entries);
    var yearSet = new Set(
      Object.keys(byYearQuota)
        .concat(Object.keys(usedByYear))
        .concat(Object.keys(vacationByWeekday))
        .concat(Object.keys(workByYear))
        .concat(Object.keys(clockByYear))
    );
    yearSet.forEach(function (y) { years.push(parseInt(y, 10)); });
    if (years.indexOf(curYear) === -1) years.push(curYear);
    years.sort(function (a, b) { return a - b; });

    var html = '';
    var t = (W.I18N && W.I18N.t) ? W.I18N.t : function (k) { return k; };
    var wds = (W.I18N && W.I18N.resolve && W.currentLanguage) ? W.I18N.resolve('calendarStats.weekdaysFull', W.currentLanguage) : null;
    if (!wds || !wds.length) wds = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var mon = wds[1], tue = wds[2], wed = wds[3], thu = wds[4], fri = wds[5];
    var metricLabel = t('infographic.table.metric');
    var valueLabel = t('infographic.table.value');
    var yearLabel = t('infographic.table.year');
    var resolveCal = (W.I18N && W.I18N.resolve)
      ? function (p) { return W.I18N.resolve(p, W.currentLanguage); }
      : function () { return null; };
    var timeframe = getStoredInfographicTimeframe();
    var workByPeriod = getWorkStatsByPeriodAndWeekday(entries, timeframe);
    var workByPeriodLoc = getWorkStatsByPeriodWeekdayAndLocation(entries, timeframe);
    var clockByPeriod = getClockInOutStatsByPeriodAndWeekday(entries, timeframe);
    var weekdayPeriodOrder = buildWeekdayPeriodOrder(timeframe, years, workByPeriod, workByPeriodLoc, clockByPeriod);
    var periodColHeader = timeframe === 'annual' ? yearLabel : t('infographic.table.period');
    var quotaLabel = t('infographic.table.quota');
    var usedLabel = t('infographic.table.used');
    var remainingLabel = t('infographic.table.remaining');
    var minutesSuffix = t('infographic.csv.minutesSuffix');
    var wfhLabel = t('statsSummary.datasetWfh');
    var wfoLabel = t('statsSummary.datasetWfo');
    var shortSummaryLabel = t('infographic.clusterGeneral');
    var shortVacationLabel = t('infographic.clusterVacation');
    var shortWorkLabel = t('infographic.clusterWorkWeekdays');

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
    html += '<tr><td>' + t('infographic.metrics.totalWorkingHours') + '</td><td>' + formatInfographicMinutes(summaryData.totalWorkingHours) + '</td></tr>';
    html += '<tr><td>' + t('infographic.metrics.avgWorkingHours') + '</td><td>' + formatInfographicMinutes(summaryData.avgWorkingHours) + '</td></tr>';
    html += '<tr><td>' + t('infographic.metrics.totalOvertime') + '</td><td>' + formatInfographicMinutes(summaryData.totalOvertime) + '</td></tr>';
    html += '<tr><td>' + t('infographic.metrics.avgOvertime') + '</td><td>' + formatInfographicMinutes(summaryData.avgOvertime) + '</td></tr>';
    html += '<tr><td>' + t('infographic.metrics.totalVacationQuota') + '</td><td>' + fmtNumber(summaryData.totalVacationQuota) + '</td></tr>';
    html += '<tr><td>' + t('infographic.metrics.totalVacationUsed') + '</td><td>' + fmtNumber(summaryData.totalVacationUsed) + '</td></tr>';
    html += '<tr><td>' + t('infographic.metrics.totalSick') + '</td><td>' + fmtNumber(summaryData.totalSick) + '</td></tr>';
    html += '<tr><td>' + t('infographic.metrics.totalPublicHolidays') + '</td><td>' + fmtNumber(summaryData.totalHoliday) + '</td></tr>';
    html += '</tbody></table></div></section>';
    html += sectionOpen(
      shortSummaryLabel + ' (' + wfhLabel + ', ' + wfoLabel + ')',
      '',
      'summary-totals-location',
      'summary-totals-location'
    );
    html += '<div class="infographic-table-wrap"><table class="infographic-table"><thead><tr><th>' + metricLabel + '</th><th>' + wfhLabel + '</th><th>' + wfoLabel + '</th></tr></thead><tbody>';
    html += '<tr><td>' + t('infographic.metrics.totalWorkingHours') + '</td><td>' + formatInfographicMinutes(summaryByLocationData.wfhTotalWorkingHours) + '</td><td>' + formatInfographicMinutes(summaryByLocationData.wfoTotalWorkingHours) + '</td></tr>';
    html += '<tr><td>' + t('infographic.metrics.avgWorkingHours') + '</td><td>' + formatInfographicMinutes(summaryByLocationData.wfhAvgWorkingHours) + '</td><td>' + formatInfographicMinutes(summaryByLocationData.wfoAvgWorkingHours) + '</td></tr>';
    html += '<tr><td>' + t('infographic.metrics.totalOvertime') + '</td><td>' + formatInfographicMinutes(summaryByLocationData.wfhTotalOvertime) + '</td><td>' + formatInfographicMinutes(summaryByLocationData.wfoTotalOvertime) + '</td></tr>';
    html += '<tr><td>' + t('infographic.metrics.avgOvertime') + '</td><td>' + formatInfographicMinutes(summaryByLocationData.wfhAvgOvertime) + '</td><td>' + formatInfographicMinutes(summaryByLocationData.wfoAvgOvertime) + '</td></tr>';
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
    html += '<div class="' + INFOGRAPHIC_TIMEFRAME_TABLE_WRAP_CLASS + '"><table class="infographic-table">';
    html += '<thead><tr><th class="infographic-period-col-header">' + periodColHeader + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    weekdayPeriodOrder.forEach(function (pk) {
      var perDay = workByPeriod[pk] || {};
      var rowLabel = formatInfographicPeriodLabel(pk, timeframe, t, resolveCal);
      function cellTotal(day) {
        var s = perDay[day];
        return s ? formatInfographicMinutes(s.totalWork) : '—';
      }
      html += '<tr><td>' + rowLabel + '</td><td>' + cellTotal(1) + '</td><td>' + cellTotal(2) + '</td><td>' + cellTotal(3) + '</td><td>' + cellTotal(4) + '</td><td>' + cellTotal(5) + '</td></tr>';
    });
    html += '</tbody></table></div></section>';

    html += sectionOpen(
      t('infographic.sectionAvgWorkByWeekday'),
      '',
      'avg-work',
      'avg-work'
    );
    html += '<div class="' + INFOGRAPHIC_TIMEFRAME_TABLE_WRAP_CLASS + '"><table class="infographic-table">';
    html += '<thead><tr><th class="infographic-period-col-header">' + periodColHeader + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    weekdayPeriodOrder.forEach(function (pk) {
      var perDay = workByPeriod[pk] || {};
      var rowLabel = formatInfographicPeriodLabel(pk, timeframe, t, resolveCal);
      function cellAvg(day) {
        var s = perDay[day];
        return s && s.days > 0 ? formatInfographicMinutes(s.avgWork) : '—';
      }
      html += '<tr><td>' + rowLabel + '</td><td>' + cellAvg(1) + '</td><td>' + cellAvg(2) + '</td><td>' + cellAvg(3) + '</td><td>' + cellAvg(4) + '</td><td>' + cellAvg(5) + '</td></tr>';
    });
    html += '</tbody></table></div></section>';

    html += sectionOpen(
      t('infographic.sectionTotalOvertimeByWeekday'),
      '',
      'total-overtime',
      'total-overtime'
    );
    html += '<div class="' + INFOGRAPHIC_TIMEFRAME_TABLE_WRAP_CLASS + '"><table class="infographic-table">';
    html += '<thead><tr><th class="infographic-period-col-header">' + periodColHeader + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    weekdayPeriodOrder.forEach(function (pk) {
      var perDay = workByPeriod[pk] || {};
      var rowLabel = formatInfographicPeriodLabel(pk, timeframe, t, resolveCal);
      function cellOtTotal(day) {
        var s = perDay[day];
        return s ? formatInfographicMinutes(s.totalOvertime) : '—';
      }
      html += '<tr><td>' + rowLabel + '</td><td>' + cellOtTotal(1) + '</td><td>' + cellOtTotal(2) + '</td><td>' + cellOtTotal(3) + '</td><td>' + cellOtTotal(4) + '</td><td>' + cellOtTotal(5) + '</td></tr>';
    });
    html += '</tbody></table></div></section>';

    html += sectionOpen(
      t('infographic.sectionAvgOvertimeByWeekday'),
      '',
      'avg-overtime',
      'avg-overtime'
    );
    html += '<div class="' + INFOGRAPHIC_TIMEFRAME_TABLE_WRAP_CLASS + '"><table class="infographic-table">';
    html += '<thead><tr><th class="infographic-period-col-header">' + periodColHeader + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    weekdayPeriodOrder.forEach(function (pk) {
      var perDay = workByPeriod[pk] || {};
      var rowLabel = formatInfographicPeriodLabel(pk, timeframe, t, resolveCal);
      function cellOtAvg(day) {
        var s = perDay[day];
        return s && s.days > 0 ? formatInfographicMinutes(s.avgOvertime) : '—';
      }
      html += '<tr><td>' + rowLabel + '</td><td>' + cellOtAvg(1) + '</td><td>' + cellOtAvg(2) + '</td><td>' + cellOtAvg(3) + '</td><td>' + cellOtAvg(4) + '</td><td>' + cellOtAvg(5) + '</td></tr>';
    });
    html += '</tbody></table></div></section>';
    html += '</div>';

    // Panel 4: Work/overtime weekdays by location (mirror of panel 3)
    html += '<div id="infographicLocationPanel" class="infographic-panels is-hidden" hidden>';
    html += sectionOpen(
      t('statsSummary.detailTotalWorkTitle'),
      '',
      'total-work-location',
      'total-work-location'
    );
    html += '<div class="' + INFOGRAPHIC_TIMEFRAME_TABLE_WRAP_CLASS + '"><table class="infographic-table">';
    html += '<thead><tr><th class="infographic-period-col-header">' + periodColHeader + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    weekdayPeriodOrder.forEach(function (pk) {
      var perDay = workByPeriodLoc[pk] || {};
      var rowLabel = formatInfographicPeriodLabel(pk, timeframe, t, resolveCal);
      html += '<tr><td>' + rowLabel + '</td><td>' + cellLocInfographic(perDay, 1, 'totalWork') + '</td><td>' + cellLocInfographic(perDay, 2, 'totalWork') + '</td><td>' + cellLocInfographic(perDay, 3, 'totalWork') + '</td><td>' + cellLocInfographic(perDay, 4, 'totalWork') + '</td><td>' + cellLocInfographic(perDay, 5, 'totalWork') + '</td></tr>';
    });
    html += '</tbody></table></div></section>';

    html += sectionOpen(
      t('statsSummary.detailAvgWorkTitle'),
      '',
      'avg-work-location',
      'avg-work-location'
    );
    html += '<div class="' + INFOGRAPHIC_TIMEFRAME_TABLE_WRAP_CLASS + '"><table class="infographic-table">';
    html += '<thead><tr><th class="infographic-period-col-header">' + periodColHeader + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    weekdayPeriodOrder.forEach(function (pk) {
      var perDay = workByPeriodLoc[pk] || {};
      var rowLabel = formatInfographicPeriodLabel(pk, timeframe, t, resolveCal);
      html += '<tr><td>' + rowLabel + '</td><td>' + cellLocInfographic(perDay, 1, 'avgWork') + '</td><td>' + cellLocInfographic(perDay, 2, 'avgWork') + '</td><td>' + cellLocInfographic(perDay, 3, 'avgWork') + '</td><td>' + cellLocInfographic(perDay, 4, 'avgWork') + '</td><td>' + cellLocInfographic(perDay, 5, 'avgWork') + '</td></tr>';
    });
    html += '</tbody></table></div></section>';

    html += sectionOpen(
      t('statsSummary.detailTotalOvertimeTitle'),
      '',
      'total-overtime-location',
      'total-overtime-location'
    );
    html += '<div class="' + INFOGRAPHIC_TIMEFRAME_TABLE_WRAP_CLASS + '"><table class="infographic-table">';
    html += '<thead><tr><th class="infographic-period-col-header">' + periodColHeader + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    weekdayPeriodOrder.forEach(function (pk) {
      var perDay = workByPeriodLoc[pk] || {};
      var rowLabel = formatInfographicPeriodLabel(pk, timeframe, t, resolveCal);
      html += '<tr><td>' + rowLabel + '</td><td>' + cellLocInfographic(perDay, 1, 'totalOvertime') + '</td><td>' + cellLocInfographic(perDay, 2, 'totalOvertime') + '</td><td>' + cellLocInfographic(perDay, 3, 'totalOvertime') + '</td><td>' + cellLocInfographic(perDay, 4, 'totalOvertime') + '</td><td>' + cellLocInfographic(perDay, 5, 'totalOvertime') + '</td></tr>';
    });
    html += '</tbody></table></div></section>';

    html += sectionOpen(
      t('statsSummary.detailAvgOvertimeTitle'),
      '',
      'avg-overtime-location',
      'avg-overtime-location'
    );
    html += '<div class="' + INFOGRAPHIC_TIMEFRAME_TABLE_WRAP_CLASS + '"><table class="infographic-table">';
    html += '<thead><tr><th class="infographic-period-col-header">' + periodColHeader + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
    weekdayPeriodOrder.forEach(function (pk) {
      var perDay = workByPeriodLoc[pk] || {};
      var rowLabel = formatInfographicPeriodLabel(pk, timeframe, t, resolveCal);
      html += '<tr><td>' + rowLabel + '</td><td>' + cellLocInfographic(perDay, 1, 'avgOvertime') + '</td><td>' + cellLocInfographic(perDay, 2, 'avgOvertime') + '</td><td>' + cellLocInfographic(perDay, 3, 'avgOvertime') + '</td><td>' + cellLocInfographic(perDay, 4, 'avgOvertime') + '</td><td>' + cellLocInfographic(perDay, 5, 'avgOvertime') + '</td></tr>';
    });
    html += '</tbody></table></div></section>';
    html += '</div>';

    // Panel 5: Clock in/out by weekday (3×2 grid: row1 in earliest/latest/avg, row2 out earliest/latest/avg)
    html += '<div id="infographicClockPanel" class="infographic-panels infographic-panels--clock is-hidden" hidden>';
    html += '<div class="infographic-clock-grid" role="group" aria-label="' + String(t('infographic.sectionClockInOutCluster')).replace(/"/g, '&quot;') + '">';

    function clockSection(sectionTitleKey, exportKey, sectionKey, which, field) {
      html += sectionOpen(t(sectionTitleKey), '', exportKey, sectionKey);
      html += '<div class="' + INFOGRAPHIC_TIMEFRAME_TABLE_WRAP_CLASS + '"><table class="infographic-table">';
      html += '<thead><tr><th class="infographic-period-col-header">' + periodColHeader + '</th><th>' + mon + '</th><th>' + tue + '</th><th>' + wed + '</th><th>' + thu + '</th><th>' + fri + '</th></tr></thead><tbody>';
      weekdayPeriodOrder.forEach(function (pk) {
        var perDay = clockByPeriod[pk] || {};
        var rowLabel = formatInfographicPeriodLabel(pk, timeframe, t, resolveCal);
        html += '<tr><td>' + rowLabel + '</td>' +
          '<td>' + clockCellInfographic(perDay, 1, which, field) + '</td>' +
          '<td>' + clockCellInfographic(perDay, 2, which, field) + '</td>' +
          '<td>' + clockCellInfographic(perDay, 3, which, field) + '</td>' +
          '<td>' + clockCellInfographic(perDay, 4, which, field) + '</td>' +
          '<td>' + clockCellInfographic(perDay, 5, which, field) + '</td>' +
          '</tr>';
      });
      html += '</tbody></table></div></section>';
    }

    clockSection('infographic.sectionEarliestClockInByWeekday', 'clockin-earliest', 'clockin-earliest', 'in', 'min');
    clockSection('infographic.sectionLatestClockInByWeekday', 'clockin-latest', 'clockin-latest', 'in', 'max');
    clockSection('infographic.sectionAvgClockInByWeekday', 'clockin-avg', 'clockin-avg', 'in', 'avg');
    clockSection('infographic.sectionEarliestClockOutByWeekday', 'clockout-earliest', 'clockout-earliest', 'out', 'min');
    clockSection('infographic.sectionLatestClockOutByWeekday', 'clockout-latest', 'clockout-latest', 'out', 'max');
    clockSection('infographic.sectionAvgClockOutByWeekday', 'clockout-avg', 'clockout-avg', 'out', 'avg');

    html += '</div></div>';

    var container = document.getElementById('infographicContent');
    var categoryBar = document.getElementById('infographicCategoryBar');
    var modal = document.getElementById('infographicModal');
    var intro = document.getElementById('infographicModalIntro');
    var title = document.getElementById('infographicModalTitle');
    if (container) container.innerHTML = html;
    if (title) title.textContent = t('modals.infographicModal.title');
    if (intro) intro.textContent = t('modals.statsSummaryModal.viewLabel') + ': ' + shortSummaryLabel + ', ' + shortVacationLabel + ', ' + shortWorkLabel + ', ' + t('infographic.clusterClockInOut') + ', ' + t('infographic.clusterDetails') + '.';
    if (categoryBar) {
      var summaryAria = shortSummaryLabel;
      var vacationAria = shortVacationLabel;
      var workAria = shortWorkLabel;
      var clockAria = t('infographic.clusterClockInOut');
      var detailsAria = t('infographic.clusterDetails');
      categoryBar.setAttribute('aria-label', t('modals.statsSummaryModal.viewLabel'));
      categoryBar.innerHTML =
        '<button type="button" class="stats-summary-cat-btn infographic-cat-btn is-active" data-target-panel="infographicSummaryPanel" aria-pressed="true" title="' + summaryAria + '" aria-label="' + summaryAria + '"><span class="btn-profile-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></span><span class="sr-only">' + summaryAria + '</span></button>' +
        '<button type="button" class="stats-summary-cat-btn infographic-cat-btn" data-target-panel="infographicVacationPanel" aria-pressed="false" title="' + vacationAria + '" aria-label="' + vacationAria + '"><span class="btn-profile-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h16"/><path d="M4 14h10"/><path d="M4 18h7"/><path d="M15 6h5"/><path d="M17.5 4v4"/></svg></span><span class="sr-only">' + vacationAria + '</span></button>' +
        '<button type="button" class="stats-summary-cat-btn infographic-cat-btn" data-target-panel="infographicWorkPanel" aria-pressed="false" title="' + workAria + '" aria-label="' + workAria + '"><span class="btn-profile-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l3-3 3 2 4-5"/></svg></span><span class="sr-only">' + workAria + '</span></button>' +
        '<button type="button" class="stats-summary-cat-btn infographic-cat-btn" data-target-panel="infographicClockPanel" aria-pressed="false" title="' + clockAria + '" aria-label="' + clockAria + '"><span class="btn-profile-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l3 2"/></svg></span><span class="sr-only">' + clockAria + '</span></button>' +
        '<button type="button" class="stats-summary-cat-btn infographic-cat-btn" data-target-panel="infographicLocationPanel" aria-pressed="false" title="' + detailsAria + '" aria-label="' + detailsAria + '"><span class="btn-profile-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg></span><span class="sr-only">' + detailsAria + '</span></button>';
    }
    if (modal) modal.classList.add('open');
    currentInfographicData = {
      years: years,
      timeframe: timeframe,
      weekdayPeriodOrder: weekdayPeriodOrder,
      workByPeriod: workByPeriod,
      workByYear: workByPeriod,
      workByPeriodLoc: workByPeriodLoc,
      workByYearLoc: workByPeriodLoc,
      clockByPeriod: clockByPeriod,
      clockByYear: clockByPeriod,
      byYearQuota: byYearQuota,
      usedByYear: usedByYear,
      vacationByWeekday: vacationByWeekday,
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
          syncInfographicTimeframeForPanel(targetId);
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
    bindInfographicTimeframeControl(timeframe);
    syncInfographicTimeframeForPanel('infographicSummaryPanel');
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
    var periodHeaderCol = (d.timeframe || 'annual') === 'annual' ? yearHeader : t('infographic.table.period');
    var periodOrderExport = d.weekdayPeriodOrder || years.slice().sort(function (a, b) { return b - a; }).map(String);
    var workMap = d.workByPeriod || d.workByYear || {};
    var locMap = d.workByPeriodLoc || d.workByYearLoc || {};
    var clockMap = d.clockByPeriod || d.clockByYear || {};
    var tfExport = d.timeframe || 'annual';
    var resolveCalExport = (W.I18N && W.I18N.resolve)
      ? function (p) { return W.I18N.resolve(p, W.currentLanguage); }
      : function () { return null; };
    function periodLabelExport(pk) { return formatInfographicPeriodLabel(pk, tfExport, t, resolveCalExport); }
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
      lines.push(csvRow([periodHeaderCol, dayMinutesHeader(mon), dayMinutesHeader(tue), dayMinutesHeader(wed), dayMinutesHeader(thu), dayMinutesHeader(fri)]));
      periodOrderExport.forEach(function (pk) {
        var perDay = workMap[pk] || {};
        function v(day) { var s = perDay[day]; return s ? s.totalWork : ''; }
        lines.push(csvRow([periodLabelExport(pk), v(1), v(2), v(3), v(4), v(5)]));
      });
    } else if (sectionKey === 'avg-work') {
      lines.push(csvRow([periodHeaderCol, dayMinutesHeader(mon), dayMinutesHeader(tue), dayMinutesHeader(wed), dayMinutesHeader(thu), dayMinutesHeader(fri)]));
      periodOrderExport.forEach(function (pk) {
        var perDay = workMap[pk] || {};
        function v(day) { var s = perDay[day]; return s && s.days > 0 ? s.avgWork : ''; }
        lines.push(csvRow([periodLabelExport(pk), v(1), v(2), v(3), v(4), v(5)]));
      });
    } else if (sectionKey === 'total-overtime') {
      lines.push(csvRow([periodHeaderCol, dayMinutesHeader(mon), dayMinutesHeader(tue), dayMinutesHeader(wed), dayMinutesHeader(thu), dayMinutesHeader(fri)]));
      periodOrderExport.forEach(function (pk) {
        var perDay = workMap[pk] || {};
        function v(day) { var s = perDay[day]; return s ? s.totalOvertime : ''; }
        lines.push(csvRow([periodLabelExport(pk), v(1), v(2), v(3), v(4), v(5)]));
      });
    } else if (sectionKey === 'avg-overtime') {
      lines.push(csvRow([periodHeaderCol, dayMinutesHeader(mon), dayMinutesHeader(tue), dayMinutesHeader(wed), dayMinutesHeader(thu), dayMinutesHeader(fri)]));
      periodOrderExport.forEach(function (pk) {
        var perDay = workMap[pk] || {};
        function v(day) { var s = perDay[day]; return s && s.days > 0 ? s.avgOvertime : ''; }
        lines.push(csvRow([periodLabelExport(pk), v(1), v(2), v(3), v(4), v(5)]));
      });
    } else if (sectionKey === 'total-work-location' || sectionKey === 'avg-work-location' || sectionKey === 'total-overtime-location' || sectionKey === 'avg-overtime-location') {
      lines.push(csvRow([
        periodHeaderCol,
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
      periodOrderExport.forEach(function (pk) {
        var perDay = locMap[pk] || {};
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
        lines.push(csvRow([periodLabelExport(pk), m[0], m[1], t2[0], t2[1], w[0], w[1], th2[0], th2[1], f[0], f[1]]));
      });
    } else if (
      sectionKey === 'clockin-earliest' ||
      sectionKey === 'clockin-avg' ||
      sectionKey === 'clockin-latest' ||
      sectionKey === 'clockout-earliest' ||
      sectionKey === 'clockout-avg' ||
      sectionKey === 'clockout-latest'
    ) {
      lines.push(csvRow([periodHeaderCol, mon, tue, wed, thu, fri]));
      function fmt(m) { return (m == null || isNaN(m)) ? '' : (String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.round(m % 60)).padStart(2, '0')); }
      var which = sectionKey.indexOf('clockout-') === 0 ? 'out' : 'in';
      var field = sectionKey.indexOf('-earliest') !== -1 ? 'min' : sectionKey.indexOf('-latest') !== -1 ? 'max' : 'avg';
      periodOrderExport.forEach(function (pk) {
        var perDay = clockMap[pk] || {};
        function v(day) {
          var s = perDay[day];
          if (!s || !s[which]) return '';
          var val = s[which][field];
          return val == null ? '' : fmt(val);
        }
        lines.push(csvRow([periodLabelExport(pk), v(1), v(2), v(3), v(4), v(5)]));
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
})(window.WorkHours);
