/**
 * Statistics summary modal: General (totals/averages) and Details (WFO vs WFH line trends).
 * Uses the same filtered entries as the table (getFilteredEntries). Depends: entries, filters, time, constants. Requires Chart.js (global).
 */
(function (W) {
  'use strict';
  var barCharts = [];
  var lineCharts = [];
  var detailCharts = [];
  var chartMap = {};
  var currentView = 'monthly';
  /** @type {'general'|'details'} */
  W._statsSummaryCategory = 'general';
  var fullscreenChart = null;
  var fullscreenResizeObserver = null;
  /**
   * Rolling window only when there is no entry date span (e.g. sparse calendar / no bounds).
   * When entries have min/max dates, charts use the full inclusive span through latest entry or today.
   */
  var MAX_PERIODS = { weekly: 20, monthly: 18, quarterly: 14, annually: 12 };
  /** Hard cap so pathological ranges do not freeze the UI (~10y weekly, longer for coarser views). */
  var SAFETY_MAX_PERIODS = { weekly: 520, monthly: 240, quarterly: 100, annually: 40 };

  function isDetailChartKey(chartKey) {
    return chartKey && String(chartKey).indexOf('detail') === 0;
  }

  function getDownloadFilename(chartKey, view) {
    var base = {
      barWork: 'working-hours',
      lineOvertime: 'overtime',
      barAvgWork: 'avg-working-hours',
      lineAvgOvertime: 'avg-overtime',
      detailTotalWork: 'detail-total-work-wfo-wfh',
      detailAvgWork: 'detail-avg-work-wfo-wfh',
      detailTotalOvertime: 'detail-total-overtime-wfo-wfh',
      detailAvgOvertime: 'detail-avg-overtime-wfo-wfh'
    }[chartKey] || 'chart';
    return base + '-' + (view || currentView) + '.png';
  }

  function downloadChartAsImage(chart, filename) {
    if (!chart || !chart.canvas) return;
    var dataUrl = getChartAsHighQualityDataUrl(chart);
    if (!dataUrl) return;
    var a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }

  function cloneChartData(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function getChartAsHighQualityDataUrl(chart) {
    if (!chart || !chart.canvas) return null;
    var canvas = chart.canvas;
    var w = canvas.width;
    var h = canvas.height;
    var scale = 2;
    try {
      canvas.width = w * scale;
      canvas.height = h * scale;
      chart.resize();
      chart.render();
      return canvas.toDataURL('image/png');
    } finally {
      canvas.width = w;
      canvas.height = h;
      chart.resize();
      chart.render();
    }
  }

  function getPeriodKey(dateStr, view) {
    if (!dateStr) return '';
    var d = new Date(dateStr + 'T12:00:00');
    if (isNaN(d.getTime())) return '';
    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    if (view === 'annually') return String(y);
    if (view === 'monthly') return y + '-' + String(m).padStart(2, '0');
    if (view === 'quarterly') return y + '-Q' + Math.ceil(m / 3);
    if (view === 'weekly') {
      var isoWeek = W.getISOWeek(dateStr);
      var thursday = new Date(d);
      thursday.setDate(d.getDate() + 4 - (d.getDay() || 7));
      var isoYear = thursday.getFullYear();
      return isoYear + '-W' + String(isoWeek).padStart(2, '0');
    }
    return '';
  }

  function getPeriodLabel(key, view) {
    if (!key) return key;
    var tFn = (W.I18N && W.I18N.t) ? W.I18N.t : function (k) { return k; };
    if (view === 'annually') return key;
    if (view === 'monthly') {
      var parts = key.split('-');
      if (parts.length >= 2) {
        var months = null;
        if (W.I18N && typeof W.I18N.resolve === 'function') {
          months = W.I18N.resolve('calendarStats.months', W.currentLanguage || 'en');
        }
        var mName = (Array.isArray(months) ? months[parseInt(parts[1], 10) - 1] : null) || '';
        var short = mName.length > 3 ? mName.slice(0, 3) : mName;
        return short + ' ' + parts[0];
      }
    }
    if (view === 'quarterly') {
      if (typeof W.formatIsoQuarterPeriodLabel === 'function') return W.formatIsoQuarterPeriodLabel(key);
      var qm = key.match(/^(\d{4})-Q(\d)$/);
      if (qm) return qm[1] + ' ' + tFn('statsSummary.quarterPrefix') + qm[2];
      return key.replace('-', ' ');
    }
    if (view === 'weekly') {
      if (typeof W.formatIsoWeekPeriodLabel === 'function') return W.formatIsoWeekPeriodLabel(key);
      var wm = key.match(/^(\d{4})-W(\d{2})$/);
      if (wm) return (tFn('statsSummary.weekPrefix') || 'W') + wm[2] + ' ' + wm[1];
      return 'W' + key.split('W')[1] + ' ' + key.slice(0, 4);
    }
    return key;
  }

  function isCalendarSparseSelection() {
    return W._calendarSelectedDates && W._calendarSelectedDates.length > 0;
  }

  /**
   * Inclusive YYYY-MM-DD range implied by filter dropdowns (same rules as getFilteredEntries date scope).
   * Returns null when no year is set — caller falls back to entry min/max or sparse keys.
   */
  function getFilterDerivedDateRange() {
    if (isCalendarSparseSelection()) return null;
    if (typeof W.getFilterValues !== 'function') return null;
    var f = W.getFilterValues();
    var filtersPanel = typeof document !== 'undefined' ? document.querySelector('.filters-panel') : null;
    var isAdvanced = filtersPanel && String(filtersPanel.getAttribute('data-mode') || 'basic') === 'advanced';
    if (!f.year) return null;
    var y = parseInt(f.year, 10);
    if (isNaN(y)) return null;
    var start;
    var end;
    if (f.month) {
      var m = parseInt(f.month, 10);
      if (isNaN(m) || m < 1 || m > 12) return null;
      if (isAdvanced && f.day) {
        var day = parseInt(f.day, 10);
        if (isNaN(day)) return null;
        var lastD = new Date(y, m, 0).getDate();
        if (day < 1 || day > lastD) return null;
        start = end = y + '-' + String(m).padStart(2, '0') + '-' + String(day).padStart(2, '0');
      } else {
        start = y + '-' + String(m).padStart(2, '0') + '-01';
        var lastDay = new Date(y, m, 0).getDate();
        end = y + '-' + String(m).padStart(2, '0') + '-' + String(lastDay).padStart(2, '0');
      }
    } else {
      start = y + '-01-01';
      end = y + '-12-31';
    }
    return { start: start, end: end };
  }

  /**
   * Optional inclusive date range from the statistics modal (YYYY-MM-DD).
   * Highest priority for chart period keys. If only one field is set, the other uses filtered data bounds or today.
   */
  function getStatsSummaryModalDateRange(entries) {
    var fromEl = typeof document !== 'undefined' ? document.getElementById('statsSummaryDateFrom') : null;
    var toEl = typeof document !== 'undefined' ? document.getElementById('statsSummaryDateTo') : null;
    if (!fromEl || !toEl) return null;
    var fromV = (fromEl.value || '').trim();
    var toV = (toEl.value || '').trim();
    if (!fromV && !toV) return null;
    var iso = /^\d{4}-\d{2}-\d{2}$/;
    var bounds = getEntryDateBounds(entries);
    var todayStr = new Date().toISOString().slice(0, 10);
    var start = fromV;
    var end = toV;
    if (start && !iso.test(start)) return null;
    if (end && !iso.test(end)) return null;
    if (!start && end) {
      start = bounds && bounds.start ? bounds.start : end;
    }
    if (start && !end) {
      end = bounds && bounds.end ? bounds.end : todayStr;
    }
    if (!start || !end) return null;
    if (start > end) {
      var swap = start;
      start = end;
      end = swap;
    }
    return { start: start, end: end };
  }

  function getEntryDateBounds(entries) {
    var minD = null;
    var maxD = null;
    entries.forEach(function (e) {
      var d = e.date;
      if (!d || d.length < 10) return;
      if (!minD || d < minD) minD = d;
      if (!maxD || d > maxD) maxD = d;
    });
    if (!minD || !maxD) return null;
    return { start: minD, end: maxD };
  }

  /** Every period key of `view` that intersects [startStr, endStr] (inclusive calendar days). */
  function collectPeriodKeysInRange(view, startStr, endStr) {
    var set = {};
    var d0 = new Date(startStr + 'T12:00:00');
    var d1 = new Date(endStr + 'T12:00:00');
    if (isNaN(d0.getTime()) || isNaN(d1.getTime())) return [];
    if (d1 < d0) {
      var swap = d0;
      d0 = d1;
      d1 = swap;
    }
    var cur = new Date(d0);
    var guard = 0;
    var maxDays = Math.min(12000, Math.max(400, Math.ceil((d1 - d0) / 86400000) + 14));
    while (cur <= d1 && guard < maxDays) {
      var ds =
        cur.getFullYear() +
        '-' +
        String(cur.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(cur.getDate()).padStart(2, '0');
      var k = getPeriodKey(ds, view);
      if (k) set[k] = true;
      cur.setDate(cur.getDate() + 1);
      guard++;
    }
    return Object.keys(set).sort();
  }

  /** Unique period keys that appear on any filtered entry date (any status). */
  function collectPeriodKeysFromEntries(entries, view) {
    var set = {};
    entries.forEach(function (e) {
      if (!e.date) return;
      var k = getPeriodKey(e.date, view);
      if (k) set[k] = true;
    });
    return Object.keys(set).sort();
  }

  function aggregateByPeriod(entries, view) {
    var buckets = {};
    entries.forEach(function (e) {
      if ((e.dayStatus || 'work') !== 'work') return;
      var dur = W.workingMinutes(e.clockIn, e.clockOut, e.breakMinutes);
      if (dur == null) return;
      var key = getPeriodKey(e.date, view);
      if (!key) return;
      if (!buckets[key]) buckets[key] = { work: 0, overtime: 0, workDays: 0 };
      buckets[key].work += dur;
      buckets[key].workDays += 1;
      var ot = Math.max(0, dur - (W.STANDARD_WORK_MINUTES_PER_DAY || 480));
      buckets[key].overtime += ot;
    });

    var keys;
    var mr = getStatsSummaryModalDateRange(entries);
    var fr = mr ? null : getFilterDerivedDateRange();
    /** True when timeline is pinned by modal/filter range or full entry span — skip rolling MAX_PERIODS trim. */
    var fromExplicitFilterRange = !!(mr || fr);
    var maxWindow = MAX_PERIODS[view] || 12;
    var safetyMax = SAFETY_MAX_PERIODS[view] || 60;
    var todayStr = new Date().toISOString().slice(0, 10);

    if (mr) {
      keys = collectPeriodKeysInRange(view, mr.start, mr.end);
      if (keys.length > safetyMax) keys = keys.slice(-safetyMax);
    } else if (fr) {
      keys = collectPeriodKeysInRange(view, fr.start, fr.end);
      if (keys.length > safetyMax) keys = keys.slice(-safetyMax);
    } else if (!isCalendarSparseSelection()) {
      var bounds = getEntryDateBounds(entries);
      if (bounds) {
        var spanEnd = bounds.end < todayStr ? todayStr : bounds.end;
        keys = collectPeriodKeysInRange(view, bounds.start, spanEnd);
        fromExplicitFilterRange = true;
        if (keys.length > safetyMax) keys = keys.slice(-safetyMax);
      } else {
        keys = collectPeriodKeysFromEntries(entries, view);
        if (keys.length > maxWindow) keys = keys.slice(-maxWindow);
      }
    } else {
      keys = collectPeriodKeysFromEntries(entries, view);
      if (keys.length > maxWindow) keys = keys.slice(-maxWindow);
    }

    if (!keys.length) keys = Object.keys(buckets).sort();
    if (!fromExplicitFilterRange && keys.length > maxWindow) keys = keys.slice(-maxWindow);

    return keys.map(function (k) {
      var b = buckets[k] || { work: 0, overtime: 0, workDays: 0 };
      var days = b.workDays || 0;
      return {
        key: k,
        label: getPeriodLabel(k, view),
        totalWorkMinutes: b.work,
        totalOvertimeMinutes: b.overtime,
        workDays: days,
        avgWorkMinutes: days > 0 ? Math.round(b.work / days) : 0,
        avgOvertimeMinutes: days > 0 ? Math.round(b.overtime / days) : 0
      };
    });
  }

  /**
   * Same period timeline as aggregateByPeriod; splits minutes and overtime into WFO vs WFH only.
   * Work entries with other locations contribute 0 to both series in that period.
   */
  function aggregateByPeriodWithLocation(entries, view) {
    var std = W.STANDARD_WORK_MINUTES_PER_DAY || 480;
    var locBuckets = {};
    entries.forEach(function (e) {
      if ((e.dayStatus || 'work') !== 'work') return;
      var loc = e.location;
      if (loc !== 'WFO' && loc !== 'WFH') return;
      var dur = W.workingMinutes(e.clockIn, e.clockOut, e.breakMinutes);
      if (dur == null) return;
      var key = getPeriodKey(e.date, view);
      if (!key) return;
      if (!locBuckets[key]) {
        locBuckets[key] = { wfoWork: 0, wfhWork: 0, wfoDays: 0, wfhDays: 0, wfoOt: 0, wfhOt: 0 };
      }
      var ot = Math.max(0, dur - std);
      if (loc === 'WFO') {
        locBuckets[key].wfoWork += dur;
        locBuckets[key].wfoDays += 1;
        locBuckets[key].wfoOt += ot;
      } else {
        locBuckets[key].wfhWork += dur;
        locBuckets[key].wfhDays += 1;
        locBuckets[key].wfhOt += ot;
      }
    });
    var base = aggregateByPeriod(entries, view);
    return base.map(function (p) {
      var b = locBuckets[p.key] || { wfoWork: 0, wfhWork: 0, wfoDays: 0, wfhDays: 0, wfoOt: 0, wfhOt: 0 };
      return {
        key: p.key,
        label: p.label,
        wfoWork: b.wfoWork,
        wfhWork: b.wfhWork,
        avgWfoWork: b.wfoDays > 0 ? Math.round(b.wfoWork / b.wfoDays) : 0,
        avgWfhWork: b.wfhDays > 0 ? Math.round(b.wfhWork / b.wfhDays) : 0,
        wfoOt: b.wfoOt,
        wfhOt: b.wfhOt,
        avgWfoOt: b.wfoDays > 0 ? Math.round(b.wfoOt / b.wfoDays) : 0,
        avgWfhOt: b.wfhDays > 0 ? Math.round(b.wfhOt / b.wfhDays) : 0
      };
    });
  }

  function getCssVar(name) {
    if (typeof window === 'undefined' || !window.getComputedStyle) return '';
    try {
      return getComputedStyle(document.body).getPropertyValue(name).trim();
    } catch (_) {
      return '';
    }
  }

  /**
   * In-modal charts: auto-skip x labels and sane font sizes so axes stay readable.
   * Full-screen chart uses chartOptionsForFullscreen (can show more ticks on a wide canvas).
   */
  function chartOptions(labelCount) {
    var textColor = getCssVar('--chart-text') || getCssVar('--text') || '#1a1213';
    var mutedColor = getCssVar('--chart-muted') || getCssVar('--muted') || textColor;
    var gridColor = getCssVar('--chart-grid') || 'rgba(148, 163, 184, 0.35)';
    var tooltipBg = getCssVar('--chart-tooltip-bg') || getCssVar('--surface') || 'rgba(255, 255, 255, 0.98)';
    var tooltipBorder = getCssVar('--chart-tooltip-border') || getCssVar('--border') || '#e5e0e1';
    var n = typeof labelCount === 'number' && labelCount > 0 ? labelCount : 0;
    var xFont = n > 40 ? 10 : 11;
    var maxTicks = n > 56 ? 10 : n > 36 ? 12 : n > 20 ? 14 : 18;
    var bottomPad = n > 32 ? 12 : 8;
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          bottom: bottomPad,
          top: 4
        }
      },
      interaction: { mode: 'nearest', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          position: 'nearest',
          backgroundColor: tooltipBg,
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: tooltipBorder,
          borderWidth: 1,
          callbacks: {
            label: function (ctx) {
              var v = ctx.raw;
              var ds = ctx.dataset && ctx.dataset.label ? ctx.dataset.label + ': ' : '';
              if (W.formatMinutes && typeof W.formatMinutes === 'function') return ds + W.formatMinutes(v);
              return ds + String(v);
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: {
            color: mutedColor,
            maxRotation: n > 18 ? 40 : 0,
            minRotation: 0,
            autoSkip: true,
            autoSkipPadding: 10,
            maxTicksLimit: maxTicks,
            includeBounds: true,
            font: { size: xFont, weight: '500' }
          }
        },
        y: {
          min: 0,
          grid: { color: gridColor },
          ticks: {
            color: mutedColor,
            font: { size: 11 },
            callback: function (v) {
              if (W.formatMinutes && typeof W.formatMinutes === 'function') return W.formatMinutes(v);
              return String(v);
            }
          }
        }
      }
    };
  }

  function chartOptionsMultiLine(labelCount) {
    var textColor = getCssVar('--chart-text') || getCssVar('--text') || '#1a1213';
    var mutedColor = getCssVar('--chart-muted') || getCssVar('--muted') || textColor;
    var gridColor = getCssVar('--chart-grid') || 'rgba(148, 163, 184, 0.35)';
    var tooltipBg = getCssVar('--chart-tooltip-bg') || getCssVar('--surface') || 'rgba(255, 255, 255, 0.98)';
    var tooltipBorder = getCssVar('--chart-tooltip-border') || getCssVar('--border') || '#e5e0e1';
    var o = chartOptions(labelCount);
    o.plugins.legend = {
      display: true,
      position: 'top',
      labels: {
        color: mutedColor,
        boxWidth: 10,
        boxHeight: 10,
        padding: 12,
        font: { size: 11, weight: '500' }
      }
    };
    o.plugins.tooltip.callbacks.label = function (ctx) {
      var v = ctx.raw;
      var ds = ctx.dataset && ctx.dataset.label ? ctx.dataset.label + ': ' : '';
      if (W.formatMinutes && typeof W.formatMinutes === 'function') return ds + W.formatMinutes(v);
      return ds + String(v);
    };
    return o;
  }

  function getFullscreenTitle(chartKey) {
    if (!chartKey) return '';
    var t = (W.I18N && W.I18N.t) ? W.I18N.t : function (k) { return k; };
    var map = {
      barWork: 'statsSummary.fullscreenBarWork',
      lineOvertime: 'statsSummary.fullscreenLineOvertime',
      barAvgWork: 'statsSummary.fullscreenBarAvgWork',
      lineAvgOvertime: 'statsSummary.fullscreenLineAvgOvertime',
      detailTotalWork: 'statsSummary.fullscreenDetailTotalWork',
      detailAvgWork: 'statsSummary.fullscreenDetailAvgWork',
      detailTotalOvertime: 'statsSummary.fullscreenDetailTotalOvertime',
      detailAvgOvertime: 'statsSummary.fullscreenDetailAvgOvertime'
    };
    var key = map[chartKey];
    return key ? (t(key) || '') : '';
  }

  /** Order matches the statistics summary grid (General vs Details). */
  var ENLARGE_ORDER_GENERAL = ['barWork', 'lineOvertime', 'barAvgWork', 'lineAvgOvertime'];
  var ENLARGE_ORDER_DETAILS = ['detailTotalWork', 'detailTotalOvertime', 'detailAvgWork', 'detailAvgOvertime'];

  function getEnlargeNavOrder() {
    var order =
      W.getStatsSummaryCategory && W.getStatsSummaryCategory() === 'details'
        ? ENLARGE_ORDER_DETAILS
        : ENLARGE_ORDER_GENERAL;
    return order.filter(function (k) {
      return !!chartMap[k];
    });
  }

  W.syncStatsSummaryEnlargeModalNav = function syncStatsSummaryEnlargeModalNav() {
    var modal = document.getElementById('statsSummaryEnlargeModal');
    if (!modal || !modal.classList.contains('open')) return;
    var t = W.I18N && W.I18N.t ? W.I18N.t : function (k) { return k; };
    var cur = modal.getAttribute('data-enlarge-chart-key');
    var h2 = modal.querySelector('h2');
    if (h2 && cur) {
      var ct = getFullscreenTitle(cur);
      h2.textContent = ct || t('modals.statsSummaryEnlargeModal.title');
    }
    var order = getEnlargeNavOrder();
    var idx = cur ? order.indexOf(cur) : -1;
    var prevKey = idx > 0 ? order[idx - 1] : null;
    var nextKey = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
    var prevName = prevKey ? getFullscreenTitle(prevKey) : '';
    var nextName = nextKey ? getFullscreenTitle(nextKey) : '';
    var nav = document.getElementById('statsSummaryEnlargeNav');
    if (nav) nav.setAttribute('aria-label', t('modals.statsSummaryEnlargeModal.chartsNavAria'));
    var prevBtn = document.getElementById('statsSummaryEnlargePrev');
    var nextBtn = document.getElementById('statsSummaryEnlargeNext');
    var prevDesc = document.getElementById('statsSummaryEnlargePrevDesc');
    var nextDesc = document.getElementById('statsSummaryEnlargeNextDesc');
    if (prevBtn) {
      prevBtn.disabled = !prevKey;
      prevBtn.setAttribute(
        'aria-label',
        prevKey ? t('modals.statsSummaryEnlargeModal.prevChartShows', { name: prevName }) : t('modals.statsSummaryEnlargeModal.navNoPrevious')
      );
      var pm = prevBtn.querySelector('.stats-summary-enlarge-nav-main');
      if (pm) pm.textContent = t('modals.statsSummaryEnlargeModal.prevChart');
    }
    if (prevDesc) {
      prevDesc.textContent = prevKey ? prevName : t('modals.statsSummaryEnlargeModal.navNoPrevious');
    }
    if (nextBtn) {
      nextBtn.disabled = !nextKey;
      nextBtn.setAttribute(
        'aria-label',
        nextKey ? t('modals.statsSummaryEnlargeModal.nextChartShows', { name: nextName }) : t('modals.statsSummaryEnlargeModal.navNoNext')
      );
      var nm = nextBtn.querySelector('.stats-summary-enlarge-nav-main');
      if (nm) nm.textContent = t('modals.statsSummaryEnlargeModal.nextChart');
    }
    if (nextDesc) {
      nextDesc.textContent = nextKey ? nextName : t('modals.statsSummaryEnlargeModal.navNoNext');
    }
  };

  W.statsSummaryEnlargeGoAdjacent = function statsSummaryEnlargeGoAdjacent(delta) {
    var modal = document.getElementById('statsSummaryEnlargeModal');
    if (!modal || !modal.classList.contains('open')) return;
    var cur = modal.getAttribute('data-enlarge-chart-key');
    var order = getEnlargeNavOrder();
    var idx = order.indexOf(cur);
    if (idx < 0) return;
    var ni = idx + delta;
    if (ni < 0 || ni >= order.length) return;
    var nk = order[ni];
    modal.setAttribute('data-enlarge-chart-key', nk);
    W.syncStatsSummaryEnlargeModalNav();
    renderFullscreenChart(nk);
  };

  function chartOptionsForFullscreen(fontScale, chartKey, labelCount) {
    var textColor = getCssVar('--chart-text') || getCssVar('--text') || '#1a1213';
    var mutedColor = getCssVar('--chart-muted') || getCssVar('--muted') || textColor;
    var gridColor = getCssVar('--chart-grid') || 'rgba(148, 163, 184, 0.35)';
    var tooltipBg = getCssVar('--chart-tooltip-bg') || getCssVar('--surface') || 'rgba(255, 255, 255, 0.98)';
    var tooltipBorder = getCssVar('--chart-tooltip-border') || getCssVar('--border') || '#e5e0e1';
    var scale = Math.max(0.8, Math.min(4, fontScale));
    var n = typeof labelCount === 'number' && labelCount > 0 ? labelCount : 0;
    var baseTick = n > 56 ? 9 : n > 36 ? 10 : 11;
    var tickSize = Math.round(baseTick * scale);
    var fsMaxTicks = n > 96 ? 40 : n > 64 ? 32 : n > 40 ? 24 : n > 24 ? 20 : Math.max(1, n);
    var tooltipTitleSize = Math.round(12 * scale);
    var tooltipBodySize = Math.round(11 * scale);
    var legendSize = Math.round(11 * scale);
    var showLegend = isDetailChartKey(chartKey);
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          bottom: Math.round((n > 40 ? 18 : n > 24 ? 14 : 10) * scale),
          top: Math.round(8 * scale)
        }
      },
      plugins: {
        legend: showLegend ? {
          display: true,
          position: 'top',
          labels: { color: mutedColor, boxWidth: Math.round(12 * scale), font: { size: legendSize } }
        } : { display: false },
        title: {
          display: !!getFullscreenTitle(chartKey),
          text: getFullscreenTitle(chartKey),
          color: textColor,
          padding: { top: 8, bottom: 12 },
          font: { size: Math.round(12 * scale), weight: '600' }
        },
        tooltip: {
          position: 'nearest',
          backgroundColor: tooltipBg,
          titleColor: textColor,
          bodyColor: textColor,
          titleFont: { size: tooltipTitleSize },
          bodyFont: { size: tooltipBodySize },
          borderColor: tooltipBorder,
          borderWidth: 1,
          callbacks: {
            label: function (ctx) {
              var v = ctx.raw;
              var ds = ctx.dataset && ctx.dataset.label ? ctx.dataset.label + ': ' : '';
              if (W.formatMinutes && typeof W.formatMinutes === 'function') return ds + W.formatMinutes(v);
              return ds + String(v);
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: {
            color: mutedColor,
            maxRotation: n > 28 ? 45 : 0,
            minRotation: 0,
            autoSkip: true,
            autoSkipPadding: Math.round(8 * scale),
            maxTicksLimit: fsMaxTicks,
            includeBounds: true,
            font: { size: tickSize, weight: '500' }
          }
        },
        y: {
          min: 0,
          grid: { color: gridColor },
          ticks: {
            color: mutedColor,
            font: { size: tickSize },
            callback: function (v) {
              if (W.formatMinutes && typeof W.formatMinutes === 'function') return W.formatMinutes(v);
              return String(v);
            }
          }
        }
      }
    };
  }

  function getFullscreenFontScale(canvasEl) {
    var container = canvasEl && canvasEl.parentElement;
    if (!container) return 1;
    var w = container.clientWidth || canvasEl.clientWidth || 400;
    var h = container.clientHeight || canvasEl.clientHeight || 300;
    var refW = 400;
    var refH = 300;
    return Math.min(w / refW, h / refH);
  }

  function buildChartData(periods) {
    var labels = periods.map(function (p) { return p.label; });
    return {
      labels: labels,
      totalWorkData: periods.map(function (p) { return p.totalWorkMinutes; }),
      totalOvertimeData: periods.map(function (p) { return p.totalOvertimeMinutes; }),
      avgWorkData: periods.map(function (p) { return p.avgWorkMinutes; }),
      avgOvertimeData: periods.map(function (p) { return p.avgOvertimeMinutes; })
    };
  }

  function destroyCharts() {
    barCharts.forEach(function (ch) { if (ch) ch.destroy(); });
    lineCharts.forEach(function (ch) { if (ch) ch.destroy(); });
    detailCharts.forEach(function (ch) { if (ch) ch.destroy(); });
    barCharts = [];
    lineCharts = [];
    detailCharts = [];
    chartMap = {};
  }

  function syncCategoryPanels() {
    var gen = document.getElementById('statsSummaryGeneralPanel');
    var det = document.getElementById('statsSummaryDetailsPanel');
    var cat = W._statsSummaryCategory || 'general';
    if (gen) {
      gen.classList.toggle('is-hidden', cat !== 'general');
      gen.toggleAttribute('hidden', cat !== 'general');
    }
    if (det) {
      det.classList.toggle('is-hidden', cat !== 'details');
      det.toggleAttribute('hidden', cat !== 'details');
    }
    var btnG = document.getElementById('statsSummaryCatGeneral');
    var btnD = document.getElementById('statsSummaryCatDetails');
    if (btnG) {
      btnG.classList.toggle('is-active', cat === 'general');
      btnG.setAttribute('aria-pressed', cat === 'general' ? 'true' : 'false');
    }
    if (btnD) {
      btnD.classList.toggle('is-active', cat === 'details');
      btnD.setAttribute('aria-pressed', cat === 'details' ? 'true' : 'false');
    }
  }

  W.getStatsSummaryCategory = function getStatsSummaryCategory() {
    return W._statsSummaryCategory || 'general';
  };

  W.setStatsSummaryCategory = function setStatsSummaryCategory(cat) {
    if (cat !== 'general' && cat !== 'details') return;
    W._statsSummaryCategory = cat;
    syncCategoryPanels();
    var viewEl = document.getElementById('statsSummaryView');
    var view = (viewEl && viewEl.value) || currentView || 'monthly';
    renderCharts(view);
  };

  W.syncStatsSummaryCategoryToolbar = function syncStatsSummaryCategoryToolbar() {
    syncCategoryPanels();
  };

  function renderGeneralCharts(view, data, t) {
    var barWorkEl = document.getElementById('statsSummaryBarWork');
    var lineOvertimeEl = document.getElementById('statsSummaryLineOvertime');
    var barAvgWorkEl = document.getElementById('statsSummaryBarAvgWork');
    var lineAvgOvertimeEl = document.getElementById('statsSummaryLineAvgOvertime');
    if (!barWorkEl || !lineOvertimeEl || !barAvgWorkEl || !lineAvgOvertimeEl || typeof Chart === 'undefined') return;

    var success = getCssVar('--success') || '#16a34a';
    var warning = getCssVar('--warning') || '#CA8A04';
    var nLab = data.labels.length;
    var opts = chartOptions(nLab);

    barCharts.push(new Chart(barWorkEl, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: t('statsSummary.chartWorkingHours') || 'Working hours',
          data: data.totalWorkData,
          backgroundColor: success,
          borderColor: success,
          borderWidth: 1
        }]
      },
      options: opts
    }));

    lineCharts.push(new Chart(lineOvertimeEl, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: t('statsSummary.chartOvertime') || 'Overtime',
          data: data.totalOvertimeData,
          borderColor: warning,
          backgroundColor: warning,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: warning,
          pointBorderColor: '#ffffff'
        }]
      },
      options: opts
    }));

    barCharts.push(new Chart(barAvgWorkEl, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: t('statsSummary.chartAvgWork') || 'Avg working hours (per work day)',
          data: data.avgWorkData,
          backgroundColor: success,
          borderColor: success,
          borderWidth: 1
        }]
      },
      options: opts
    }));

    lineCharts.push(new Chart(lineAvgOvertimeEl, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: t('statsSummary.chartAvgOvertime') || 'Avg overtime (per work day)',
          data: data.avgOvertimeData,
          borderColor: warning,
          backgroundColor: warning,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: warning,
          pointBorderColor: '#ffffff'
        }]
      },
      options: opts
    }));

    chartMap = {
      barWork: barCharts[0],
      lineOvertime: lineCharts[0],
      barAvgWork: barCharts[1],
      lineAvgOvertime: lineCharts[1]
    };
  }

  function renderDetailCharts(view, periods, t) {
    var accent = getCssVar('--accent') || '#CE1126';
    var success = getCssVar('--success') || '#16a34a';
    var c1 = document.getElementById('statsSummaryDetailTotalWork');
    var c2 = document.getElementById('statsSummaryDetailAvgWork');
    var c3 = document.getElementById('statsSummaryDetailTotalOvertime');
    var c4 = document.getElementById('statsSummaryDetailAvgOvertime');
    if (!c1 || !c2 || !c3 || !c4 || typeof Chart === 'undefined') return;

    var labels = periods.map(function (p) { return p.label; });
    var wfoLabel = t('statsSummary.datasetWfo') || 'WFO';
    var wfhLabel = t('statsSummary.datasetWfh') || 'WFH';
    var lineOpts = chartOptionsMultiLine(labels.length);

    function lineDataset(label, data, color) {
      return {
        label: label,
        data: data,
        borderColor: color,
        backgroundColor: color,
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: color,
        pointBorderColor: '#ffffff',
        borderWidth: 2
      };
    }

    detailCharts.push(new Chart(c1, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          lineDataset(wfoLabel, periods.map(function (p) { return p.wfoWork; }), accent),
          lineDataset(wfhLabel, periods.map(function (p) { return p.wfhWork; }), success)
        ]
      },
      options: lineOpts
    }));

    detailCharts.push(new Chart(c2, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          lineDataset(wfoLabel, periods.map(function (p) { return p.avgWfoWork; }), accent),
          lineDataset(wfhLabel, periods.map(function (p) { return p.avgWfhWork; }), success)
        ]
      },
      options: lineOpts
    }));

    detailCharts.push(new Chart(c3, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          lineDataset(wfoLabel, periods.map(function (p) { return p.wfoOt; }), accent),
          lineDataset(wfhLabel, periods.map(function (p) { return p.wfhOt; }), success)
        ]
      },
      options: lineOpts
    }));

    detailCharts.push(new Chart(c4, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          lineDataset(wfoLabel, periods.map(function (p) { return p.avgWfoOt; }), accent),
          lineDataset(wfhLabel, periods.map(function (p) { return p.avgWfhOt; }), success)
        ]
      },
      options: lineOpts
    }));

    chartMap = {
      detailTotalWork: detailCharts[0],
      detailAvgWork: detailCharts[1],
      detailTotalOvertime: detailCharts[2],
      detailAvgOvertime: detailCharts[3]
    };
  }

  function renderCharts(view) {
    var t = (W.I18N && W.I18N.t) ? W.I18N.t : function (k) { return k; };
    var entries = (typeof W.getFilteredEntries === 'function' ? W.getFilteredEntries() : W.getEntries()).slice();
    destroyCharts();
    syncCategoryPanels();

    currentView = view;
    var cat = W._statsSummaryCategory || 'general';

    if (cat === 'details') {
      var locPeriods = aggregateByPeriodWithLocation(entries, view);
      renderDetailCharts(view, locPeriods, t);
    } else {
      var periods = aggregateByPeriod(entries, view);
      var data = buildChartData(periods);
      renderGeneralCharts(view, data, t);
    }
  }

  W.openStatsSummaryModal = function openStatsSummaryModal() {
    if (typeof W.refreshStatsSummaryModalStaticText === 'function') W.refreshStatsSummaryModalStaticText();
    W._statsSummaryCategory = 'general';
    if (typeof W.syncStatsSummaryCategoryToolbar === 'function') W.syncStatsSummaryCategoryToolbar();
    var viewEl = document.getElementById('statsSummaryView');
    var view = (viewEl && viewEl.value) || 'monthly';
    if (viewEl) viewEl.value = view;
    renderCharts(view);
    document.getElementById('statsSummaryModal').classList.add('open');
  };

  W.closeStatsSummaryModal = function closeStatsSummaryModal() {
    document.getElementById('statsSummaryModal').classList.remove('open');
    destroyCharts();
  };

  W.statsSummaryViewChange = function statsSummaryViewChange() {
    var viewEl = document.getElementById('statsSummaryView');
    if (viewEl && viewEl.value) renderCharts(viewEl.value);
  };

  /** Re-render charts when filters change while the modal stays open (same source as stats box). */
  W.refreshStatsSummaryChartsIfOpen = function refreshStatsSummaryChartsIfOpen() {
    var modal = document.getElementById('statsSummaryModal');
    if (!modal || !modal.classList.contains('open')) return;
    if (typeof W.statsSummaryViewChange === 'function') W.statsSummaryViewChange();
  };

  W.downloadStatsChart = function downloadStatsChart(chartKey) {
    var chart = chartMap[chartKey];
    if (!chart) return;
    var filename = getDownloadFilename(chartKey, currentView);
    downloadChartAsImage(chart, filename);
  };

  W.openEnlargeChart = function openEnlargeChart(chartKey) {
    var chart = chartMap[chartKey];
    if (!chart || typeof Chart === 'undefined') return;
    var modal = document.getElementById('statsSummaryEnlargeModal');
    var canvasEl = document.getElementById('statsSummaryEnlargeCanvas');
    if (!modal || !canvasEl) return;
    modal.setAttribute('data-enlarge-chart-key', chartKey);
    modal.classList.add('open');
    W.syncStatsSummaryEnlargeModalNav();
    var navEl = document.getElementById('statsSummaryEnlargeNav');
    if (navEl && typeof navEl.focus === 'function') {
      try {
        navEl.setAttribute('tabindex', '-1');
        setTimeout(function () {
          try {
            navEl.focus();
          } catch (_) {}
        }, 0);
      } catch (_) {}
    }
    function enterFullscreen() {
      if (modal.requestFullscreen) modal.requestFullscreen();
      else if (modal.webkitRequestFullscreen) modal.webkitRequestFullscreen();
      else if (modal.msRequestFullscreen) modal.msRequestFullscreen();
    }
    if (document.body.requestFullscreen || document.documentElement.requestFullscreen) {
      enterFullscreen();
    } else {
      renderFullscreenChart(chartKey);
    }
  };

  function renderFullscreenChart(chartKey) {
    var chart = chartMap[chartKey];
    var canvasEl = document.getElementById('statsSummaryEnlargeCanvas');
    if (!chart || !canvasEl || typeof Chart === 'undefined') return;
    if (fullscreenChart) {
      fullscreenChart.destroy();
      fullscreenChart = null;
    }
    if (fullscreenResizeObserver && canvasEl.parentElement) {
      fullscreenResizeObserver.disconnect();
      fullscreenResizeObserver = null;
    }
    var fontScale = getFullscreenFontScale(canvasEl);
    var nLab = chart.data.labels ? chart.data.labels.length : 0;
    var config = {
      type: chart.config.type,
      data: cloneChartData(chart.data),
      options: chartOptionsForFullscreen(fontScale, chartKey, nLab)
    };
    fullscreenChart = new Chart(canvasEl, config);
    var container = canvasEl.parentElement;
    if (container && typeof ResizeObserver !== 'undefined') {
      fullscreenResizeObserver = new ResizeObserver(function () {
        if (!fullscreenChart || fullscreenChart.canvas !== canvasEl) return;
        var m = document.getElementById('statsSummaryEnlargeModal');
        var ck = m ? m.getAttribute('data-enlarge-chart-key') : null;
        if (!ck) return;
        var newScale = getFullscreenFontScale(canvasEl);
        var nl = fullscreenChart.data.labels ? fullscreenChart.data.labels.length : 0;
        fullscreenChart.options = chartOptionsForFullscreen(newScale, ck, nl);
        fullscreenChart.update('resize');
      });
      fullscreenResizeObserver.observe(container);
    }
  }

  W.onEnlargeFullscreenEnter = function onEnlargeFullscreenEnter() {
    var modal = document.getElementById('statsSummaryEnlargeModal');
    if (!modal || document.fullscreenElement !== modal && document.webkitFullscreenElement !== modal && document.msFullscreenElement !== modal) return;
    var chartKey = modal.getAttribute('data-enlarge-chart-key');
    if (!chartKey) return;
    var canvasEl = document.getElementById('statsSummaryEnlargeCanvas');
    if (!canvasEl) return;
    function run() {
      if (document.fullscreenElement !== modal && document.webkitFullscreenElement !== modal && document.msFullscreenElement !== modal) return;
      renderFullscreenChart(chartKey);
    }
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(function () { requestAnimationFrame(run); });
    } else {
      setTimeout(run, 50);
    }
  };

  W.closeEnlargeChart = function closeEnlargeChart() {
    if (fullscreenResizeObserver) {
      fullscreenResizeObserver.disconnect();
      fullscreenResizeObserver = null;
    }
    if (fullscreenChart) {
      fullscreenChart.destroy();
      fullscreenChart = null;
    }
    var modal = document.getElementById('statsSummaryEnlargeModal');
    if (document.fullscreenElement === modal || document.webkitFullscreenElement === modal || document.msFullscreenElement === modal) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
    if (modal) {
      modal.classList.remove('open');
      modal.removeAttribute('data-enlarge-chart-key');
      var h2r = modal.querySelector('h2');
      if (h2r && W.I18N && W.I18N.t) h2r.textContent = W.I18N.t('modals.statsSummaryEnlargeModal.title');
    }
    var canvasEl = document.getElementById('statsSummaryEnlargeCanvas');
    if (canvasEl) {
      var ctx = canvasEl.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    }
  };

  W.downloadEnlargedChart = function downloadEnlargedChart() {
    var modal = document.getElementById('statsSummaryEnlargeModal');
    var chartKey = modal ? modal.getAttribute('data-enlarge-chart-key') : null;
    if (!chartKey) return;
    var filename = getDownloadFilename(chartKey, currentView);
    if (fullscreenChart && fullscreenChart.canvas) {
      var dataUrl = getChartAsHighQualityDataUrl(fullscreenChart);
      if (dataUrl) {
        var a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        a.click();
      }
      return;
    }
    var chart = chartMap[chartKey];
    if (chart) {
      downloadChartAsImage(chart, filename);
    }
  };
})(window.WorkHours);
