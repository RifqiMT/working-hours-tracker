/**
 * Statistics summary modal: working hours & overtime (total and average) by period.
 * Uses all entries (not filters). Depends: entries (getEntries), time, constants. Requires Chart.js (global).
 */
(function (W) {
  'use strict';
  var barCharts = [];
  var lineCharts = [];
  var chartMap = {};
  var currentView = 'monthly';
  var MAX_PERIODS = { weekly: 16, monthly: 14, quarterly: 12, annually: 10 };

  function getDownloadFilename(chartKey, view) {
    var base = {
      barWork: 'working-hours',
      lineOvertime: 'overtime',
      barAvgWork: 'avg-working-hours',
      lineAvgOvertime: 'avg-overtime'
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
    if (view === 'annually') return key;
    if (view === 'monthly') {
      var parts = key.split('-');
      if (parts.length >= 2) {
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return (months[parseInt(parts[1], 10) - 1] || '') + ' ' + parts[0];
      }
    }
    if (view === 'quarterly') return key.replace('-', ' ');
    if (view === 'weekly') return 'W' + key.split('W')[1] + ' ' + key.slice(0, 4);
    return key;
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
    var keys = Object.keys(buckets).sort();
    var max = MAX_PERIODS[view] || 12;
    if (keys.length > max) keys = keys.slice(-max);
    return keys.map(function (k) {
      var b = buckets[k];
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

  function chartOptions() {
    var textColor = '#e8e8ec';
    var gridColor = 'rgba(45, 45, 53, 0.8)';
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(26, 26, 31, 0.95)',
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: '#2d2d35',
          borderWidth: 1,
          callbacks: {
            label: function (ctx) {
              var v = ctx.raw;
              var h = Math.floor(v / 60);
              var m = Math.round(v % 60);
              return (h ? h + 'h ' : '') + (m ? m + 'm' : '0m');
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor, maxRotation: 45, font: { size: 11 } }
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            callback: function (v) {
              var h = Math.floor(v / 60);
              var m = Math.round(v % 60);
              return (h ? h + 'h' : '') + (m ? m + 'm' : '0');
            }
          }
        }
      }
    };
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
    barCharts = [];
    lineCharts = [];
  }

  function renderCharts(view) {
    var entries = W.getEntries();
    var periods = aggregateByPeriod(entries, view);
    var data = buildChartData(periods);

    var barWorkEl = document.getElementById('statsSummaryBarWork');
    var lineOvertimeEl = document.getElementById('statsSummaryLineOvertime');
    var barAvgWorkEl = document.getElementById('statsSummaryBarAvgWork');
    var lineAvgOvertimeEl = document.getElementById('statsSummaryLineAvgOvertime');
    if (!barWorkEl || !lineOvertimeEl || !barAvgWorkEl || !lineAvgOvertimeEl || typeof Chart === 'undefined') return;

    destroyCharts();

    barCharts.push(new Chart(barWorkEl, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Working hours',
          data: data.totalWorkData,
          backgroundColor: 'rgba(99, 102, 241, 0.75)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1
        }]
      },
      options: chartOptions()
    }));

    lineCharts.push(new Chart(lineOvertimeEl, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Overtime',
          data: data.totalOvertimeData,
          borderColor: 'rgba(234, 179, 8, 1)',
          backgroundColor: 'rgba(234, 179, 8, 0.15)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: 'rgba(234, 179, 8, 1)',
          pointBorderColor: '#0f0f12'
        }]
      },
      options: chartOptions()
    }));

    barCharts.push(new Chart(barAvgWorkEl, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Avg working hours (per work day)',
          data: data.avgWorkData,
          backgroundColor: 'rgba(34, 197, 94, 0.75)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1
        }]
      },
      options: chartOptions()
    }));

    lineCharts.push(new Chart(lineAvgOvertimeEl, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Avg overtime (per work day)',
          data: data.avgOvertimeData,
          borderColor: 'rgba(236, 72, 153, 1)',
          backgroundColor: 'rgba(236, 72, 153, 0.15)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: 'rgba(236, 72, 153, 1)',
          pointBorderColor: '#0f0f12'
        }]
      },
      options: chartOptions()
    }));

    currentView = view;
    chartMap = {
      barWork: barCharts[0],
      lineOvertime: lineCharts[0],
      barAvgWork: barCharts[1],
      lineAvgOvertime: lineCharts[1]
    };
  }

  W.openStatsSummaryModal = function openStatsSummaryModal() {
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

  W.downloadStatsChart = function downloadStatsChart(chartKey) {
    var chart = chartMap[chartKey];
    if (!chart) return;
    var filename = getDownloadFilename(chartKey, currentView);
    downloadChartAsImage(chart, filename);
  };

  W.openEnlargeChart = function openEnlargeChart(chartKey) {
    var chart = chartMap[chartKey];
    if (!chart) return;
    var dataUrl = getChartAsHighQualityDataUrl(chart);
    if (!dataUrl) return;
    var imgEl = document.getElementById('statsSummaryEnlargeImg');
    var modal = document.getElementById('statsSummaryEnlargeModal');
    if (!imgEl || !modal) return;
    imgEl.src = dataUrl;
    imgEl.setAttribute('data-enlarge-chart-key', chartKey);
    modal.classList.add('open');
  };

  W.closeEnlargeChart = function closeEnlargeChart() {
    var modal = document.getElementById('statsSummaryEnlargeModal');
    if (modal) modal.classList.remove('open');
    var imgEl = document.getElementById('statsSummaryEnlargeImg');
    if (imgEl) imgEl.removeAttribute('src');
  };

  W.downloadEnlargedChart = function downloadEnlargedChart() {
    var imgEl = document.getElementById('statsSummaryEnlargeImg');
    if (!imgEl || !imgEl.src) return;
    var chartKey = imgEl.getAttribute('data-enlarge-chart-key');
    var filename = getDownloadFilename(chartKey, currentView);
    var a = document.createElement('a');
    a.href = imgEl.src;
    a.download = filename;
    a.click();
  };
})(window.WorkHours);
