/**
 * Key highlights PowerPoint: configurable modal + 2 slides per year
 * (1) Days summary: working days with WFO/WFH, vacation, sick, holidays
 * (2) Hours summary: total/avg working hours, total/avg overtime with charts
 * Depends: entries, profile, time, constants. Requires PptxGenJS (vendor/pptxgen.bundle.js).
 */
(function (W) {
  'use strict';

  function getPptxGen() {
    if (typeof window === 'undefined') return null;
    return window.PptxGenJS || window.pptxgen || (typeof PptxGenJS !== 'undefined' ? PptxGenJS : null);
  }

  var STANDARD = 480; // fallback if W.STANDARD_WORK_MINUTES_PER_DAY missing

  /**
   * Compute per-year stats: days (work/WFO/WFH, vacation, sick, holiday) and hours (total/avg work, total/avg overtime).
   * Returns { year: { workDays, workWFO, workWFH, vacation, sick, holiday, totalWorkMinutes, workDaysWithDuration, totalOvertimeMinutes, avgWorkMinutes, avgOvertimeMinutes }, ... }
   */
  function computePerYearStats(entries) {
    var byYear = {};
    entries.forEach(function (e) {
      var dateStr = e.date || '';
      if (dateStr.length < 4) return;
      var year = dateStr.slice(0, 4);
      var status = (e.dayStatus || 'work').toLowerCase();
      var loc = (e.location || '').toUpperCase();
      var breakMin = e.breakMinutes != null ? e.breakMinutes : (e.break != null && typeof W.parseBreakToMinutes === 'function' ? W.parseBreakToMinutes(e.break, e.breakUnit || 'minutes') : 0);

      if (!byYear[year]) {
        byYear[year] = {
          workDays: 0, workWFO: 0, workWFH: 0, vacation: 0, sick: 0, holiday: 0,
          totalWorkMinutes: 0, workDaysWithDuration: 0, totalOvertimeMinutes: 0
        };
      }
      var y = byYear[year];

      if (status === 'work') {
        y.workDays++;
        if (loc === 'WFO') y.workWFO++;
        else if (loc === 'WFH') y.workWFH++;
        var dur = W.workingMinutes(e.clockIn, e.clockOut, breakMin);
        if (dur != null) {
          y.workDaysWithDuration++;
          y.totalWorkMinutes += dur;
          y.totalOvertimeMinutes += Math.max(0, dur - (W.STANDARD_WORK_MINUTES_PER_DAY || STANDARD));
        }
      } else if (status === 'vacation') y.vacation++;
      else if (status === 'sick') y.sick++;
      else if (status === 'holiday') y.holiday++;
    });

    Object.keys(byYear).forEach(function (year) {
      var y = byYear[year];
      var n = y.workDaysWithDuration || 0;
      y.avgWorkMinutes = n > 0 ? Math.round(y.totalWorkMinutes / n) : 0;
      y.avgOvertimeMinutes = n > 0 ? Math.round(y.totalOvertimeMinutes / n) : 0;
    });
    return byYear;
  }

  function formatHours(minutes) {
    if (minutes == null || isNaN(minutes)) return '0h';
    var h = Math.floor(minutes / 60);
    var m = Math.round(minutes % 60);
    return h + 'h' + (m > 0 ? ' ' + m + 'm' : '');
  }

  function getPeriodKey(dateStr, basis) {
    if (!dateStr || !basis) return '';
    var d = new Date(dateStr + 'T12:00:00');
    if (isNaN(d.getTime())) return '';
    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    if (basis === 'monthly') return y + '-' + String(m).padStart(2, '0');
    if (basis === 'quarterly') return y + '-Q' + Math.ceil(m / 3);
    if (basis === 'weekly') {
      var isoWeek = W.getISOWeek(dateStr);
      var thursday = new Date(d);
      thursday.setDate(d.getDate() + 4 - (d.getDay() || 7));
      var isoYear = thursday.getFullYear();
      return isoYear + '-W' + String(isoWeek).padStart(2, '0');
    }
    return '';
  }

  function getPeriodLabel(key, basis) {
    if (!key) return key;
    if (basis === 'monthly') {
      var parts = key.split('-');
      if (parts.length >= 2) {
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return (months[parseInt(parts[1], 10) - 1] || '') + ' ' + parts[0];
      }
    }
    if (basis === 'quarterly') return key.replace('-', ' ');
    if (basis === 'weekly') return 'W' + key.split('W')[1] + ' ' + key.slice(0, 4);
    return key;
  }

  /** Compute min, max, median and their period labels from values and labels arrays. */
  function minMaxMedian(values, labels) {
    if (!values || !values.length) return { minVal: 0, minPeriod: '—', maxVal: 0, maxPeriod: '—', medianVal: 0, medianPeriod: '—' };
    var indexed = values.map(function (v, i) { return { v: v, label: labels[i] || '—' }; });
    indexed.sort(function (a, b) { return a.v - b.v; });
    var minVal = indexed[0].v;
    var minPeriod = indexed[0].label;
    var maxVal = indexed[indexed.length - 1].v;
    var maxPeriod = indexed[indexed.length - 1].label;
    var mid = Math.floor(indexed.length / 2);
    var medianVal = indexed.length % 2 === 1 ? indexed[mid].v : (indexed[mid - 1].v + indexed[mid].v) / 2;
    var medianPeriod = indexed.length % 2 === 1 ? indexed[mid].label : indexed[mid - 1].label + ' / ' + indexed[mid].label;
    return { minVal: minVal, minPeriod: minPeriod, maxVal: maxVal, maxPeriod: maxPeriod, medianVal: medianVal, medianPeriod: medianPeriod };
  }

  function formatHoursForChart(hours) {
    if (hours == null || isNaN(hours)) return '0h';
    if (hours < 1) return (Math.round(hours * 60) || 0) + 'm';
    var h = Math.floor(hours);
    var m = Math.round((hours - h) * 60);
    return h + 'h' + (m > 0 ? ' ' + m + 'm' : '');
  }

  function aggregateByPeriodForYear(entries, year, basis) {
    var standard = W.STANDARD_WORK_MINUTES_PER_DAY || STANDARD;
    var buckets = {};
    entries.forEach(function (e) {
      if ((e.dayStatus || 'work').toLowerCase() !== 'work') return;
      var dateStr = e.date || '';
      if (dateStr.slice(0, 4) !== year) return;
      var breakMin = e.breakMinutes != null ? e.breakMinutes : (e.break != null && typeof W.parseBreakToMinutes === 'function' ? W.parseBreakToMinutes(e.break, e.breakUnit || 'minutes') : 0);
      var dur = W.workingMinutes(e.clockIn, e.clockOut, breakMin);
      if (dur == null) return;
      var key = getPeriodKey(dateStr, basis);
      if (!key) return;
      if (basis === 'weekly' && key.slice(0, 4) !== year) return;
      if (!buckets[key]) buckets[key] = { work: 0, overtime: 0, workDays: 0 };
      buckets[key].work += dur;
      buckets[key].workDays += 1;
      buckets[key].overtime += Math.max(0, dur - standard);
    });
    var keys = Object.keys(buckets).sort();
    var max = basis === 'weekly' ? 52 : basis === 'monthly' ? 12 : 4;
    if (keys.length > max) keys = keys.slice(-max);
    return keys.map(function (k) {
      var b = buckets[k];
      var days = b.workDays || 0;
      return {
        key: k,
        label: getPeriodLabel(k, basis),
        totalWorkMinutes: b.work,
        totalOvertimeMinutes: b.overtime,
        workDays: days,
        avgWorkMinutes: days > 0 ? Math.round(b.work / days) : 0,
        avgOvertimeMinutes: days > 0 ? Math.round(b.overtime / days) : 0
      };
    });
  }

  /** Populate year checkboxes and open modal. */
  W.openKeyHighlightsPptModal = function openKeyHighlightsPptModal() {
    var entries = (typeof W.getEntries === 'function') ? W.getEntries() : [];
    var byYear = computePerYearStats(entries);
    var years = Object.keys(byYear).sort().reverse();
    var listEl = document.getElementById('pptOptionsYearsList');
    var triggerEl = document.getElementById('pptOptionsYearsTrigger');
    var triggerTextEl = document.getElementById('pptOptionsYearsTriggerText');
    var panelEl = document.getElementById('pptOptionsYearsPanel');
    if (!listEl) return;
    listEl.innerHTML = '';
    if (years.length === 0) {
      var empty = document.createElement('p');
      empty.className = 'ppt-options-no-years';
      empty.style.cssText = 'margin:0;font-size:0.875rem;color:var(--muted);';
      empty.textContent = 'No entries found. Add entries first.';
      listEl.appendChild(empty);
      if (triggerTextEl) { triggerTextEl.textContent = 'No years available'; triggerTextEl.classList.add('is-placeholder'); }
      if (panelEl) panelEl.setAttribute('hidden', '');
    } else {
      years.forEach(function (year) {
        var label = document.createElement('label');
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = year;
        cb.className = 'ppt-option-year-cb';
        label.appendChild(cb);
        label.appendChild(document.createTextNode(year));
        listEl.appendChild(label);
      });
      if (triggerTextEl) { triggerTextEl.textContent = 'Select years...'; triggerTextEl.classList.add('is-placeholder'); }
      if (panelEl) panelEl.setAttribute('hidden', '');
    }

    function updateYearsTriggerText() {
      if (!triggerTextEl || years.length === 0) return;
      var checked = listEl.querySelectorAll('.ppt-option-year-cb:checked');
      var n = checked.length;
      if (n === 0) {
        triggerTextEl.textContent = 'Select years...';
        triggerTextEl.classList.add('is-placeholder');
      } else if (n === years.length) {
        triggerTextEl.textContent = 'All years (' + n + ')';
        triggerTextEl.classList.remove('is-placeholder');
      } else {
        var arr = [];
        checked.forEach(function (c) { arr.push(c.value); });
        triggerTextEl.textContent = arr.sort().join(', ');
        triggerTextEl.classList.remove('is-placeholder');
      }
    }

    function closeYearsPanel() {
      if (panelEl) { panelEl.setAttribute('hidden', ''); }
      if (triggerEl) triggerEl.setAttribute('aria-expanded', 'false');
    }

    if (triggerEl && panelEl) {
      triggerEl.onclick = function (e) {
        e.stopPropagation();
        if (years.length === 0) return;
        var expanded = triggerEl.getAttribute('aria-expanded') === 'true';
        if (expanded) {
          closeYearsPanel();
        } else {
          panelEl.removeAttribute('hidden');
          triggerEl.setAttribute('aria-expanded', 'true');
        }
      };
    }
    document.addEventListener('click', function onClickOutside(e) {
      var dd = document.getElementById('pptOptionsYearsDropdown');
      if (dd && panelEl && !dd.contains(e.target)) {
        closeYearsPanel();
        document.removeEventListener('click', onClickOutside);
      }
    });

    listEl.querySelectorAll('.ppt-option-year-cb').forEach(function (cb) {
      cb.addEventListener('change', updateYearsTriggerText);
    });

    var selectAllBtn = document.getElementById('pptOptionsSelectAllYears');
    var clearBtn = document.getElementById('pptOptionsClearYears');
    if (selectAllBtn) {
      selectAllBtn.onclick = function () {
        listEl.querySelectorAll('.ppt-option-year-cb').forEach(function (c) { c.checked = true; });
        updateYearsTriggerText();
      };
    }
    if (clearBtn) {
      clearBtn.onclick = function () {
        listEl.querySelectorAll('.ppt-option-year-cb').forEach(function (c) { c.checked = false; });
        updateYearsTriggerText();
      };
    }

    var trendNoneEl = document.getElementById('pptOptTrendNone');
    var trendBasisEls = document.querySelectorAll('.ppt-option-trend-basis');
    if (trendNoneEl) {
      trendNoneEl.onchange = function () {
        if (trendNoneEl.checked) trendBasisEls.forEach(function (el) { el.checked = false; });
      };
    }
    trendBasisEls.forEach(function (el) {
      el.onchange = function () {
        if (el.checked && trendNoneEl) trendNoneEl.checked = false;
      };
    });

    var modal = document.getElementById('keyHighlightsPptModal');
    if (modal) modal.classList.add('open');
  };

  W.closeKeyHighlightsPptModal = function closeKeyHighlightsPptModal() {
    var modal = document.getElementById('keyHighlightsPptModal');
    if (modal) modal.classList.remove('open');
  };

  /** Read selected years and metric checkboxes from the modal. */
  function getKeyHighlightsPptOptions() {
    var years = [];
    document.querySelectorAll('#pptOptionsYearsList .ppt-option-year-cb:checked').forEach(function (c) {
      years.push(c.value);
    });
    years.sort();
    var trendBasisList = [];
    var noneEl = document.getElementById('pptOptTrendNone');
    if (noneEl && noneEl.checked) trendBasisList = [];
    else {
      document.querySelectorAll('.ppt-option-trend-basis:checked').forEach(function (c) {
        if (c.value) trendBasisList.push(c.value);
      });
    }
    return {
      years: years,
      workingDays: document.getElementById('pptOptWorkingDays') && document.getElementById('pptOptWorkingDays').checked,
      vacation: document.getElementById('pptOptVacation') && document.getElementById('pptOptVacation').checked,
      vacationQuota: document.getElementById('pptOptVacationQuota') && document.getElementById('pptOptVacationQuota').checked,
      vacationRemaining: document.getElementById('pptOptVacationRemaining') && document.getElementById('pptOptVacationRemaining').checked,
      sick: document.getElementById('pptOptSick') && document.getElementById('pptOptSick').checked,
      holidays: document.getElementById('pptOptHolidays') && document.getElementById('pptOptHolidays').checked,
      workingHours: document.getElementById('pptOptWorkingHours') && document.getElementById('pptOptWorkingHours').checked,
      overtime: document.getElementById('pptOptOvertime') && document.getElementById('pptOptOvertime').checked,
      trendBasis: trendBasisList
    };
  }

  /** Build and download the PPT from current modal options. */
  W.generateKeyHighlightsPpt = function generateKeyHighlightsPpt(options) {
    if (!options) options = getKeyHighlightsPptOptions();
    var PptxGen = getPptxGen();
    if (!PptxGen) {
      alert('PowerPoint export requires PptxGenJS. Run npm install and load the app from a server.');
      return;
    }
    var entries = (typeof W.getEntries === 'function') ? W.getEntries() : [];
    var byYear = computePerYearStats(entries);
    var years = options.years || [];
    if (years.length === 0) {
      if (typeof W.showToast === 'function') W.showToast('Select at least one year.', 'warning');
      else alert('Select at least one year.');
      return;
    }
    var anyDays = options.workingDays || options.vacation || options.vacationQuota || options.vacationRemaining || options.sick || options.holidays;
    var anyHours = options.workingHours || options.overtime;
    if (!anyDays && !anyHours) {
      if (typeof W.showToast === 'function') W.showToast('Select at least one metric to include.', 'warning');
      else alert('Select at least one metric to include.');
      return;
    }

    try {
      var pres = new PptxGen();
      try {
        pres.defineLayout({ name: 'CUSTOM', width: 10, height: 7.5 });
        pres.layout = 'CUSTOM';
      } catch (e) {
        if (pres.LayoutType) pres.layout = pres.LayoutType.LAYOUT_4x3;
      }
      pres.author = 'Working Hours Tracker';

      var profileName = (W.getProfile() || 'Default').replace(/[^\w\s-]/g, '');
      var dateStr = new Date().toISOString().slice(0, 10);

      // Color palette: high contrast, readable, accessible (works on screen and print)
      // Backgrounds
      var bgSlide = 'F8FAFC';        // Soft off-white (reduces glare, easy on eyes)
      var bgCard = 'FFFFFF';         // Pure white for cards/tables
      var borderCard = 'E2E8F0';     // Light border for cards
      var headerBarBg = '1E3A5F';    // Deep blue header strip
      var headerAccent = '2563EB';   // Vivid blue accent strip
      // Text (WCAG AA compliant on light bg)
      var textPrimary = '0F172A';    // Near-black for headings and primary text
      var textSecondary = '475569';  // Slate for secondary/muted text
      var textOnDark = 'FFFFFF';      // White text on header/dark areas
      // Table
      var tableBorder = 'CBD5E1';    // Soft gray border
      // Chart: distinct, colorblind-friendly series colors (blue, emerald, amber)
      var chartColorWork = '2563EB';   // Blue – working hours
      var chartColorOvertime = '059669'; // Emerald – overtime
      var chartLabelColor = '334155';   // Dark slate for axis labels
      var chartTitleColor = '475569';   // Muted for chart title

      // Title slide
      var titleSlide = pres.addSlide();
      titleSlide.background = { color: bgSlide };
      titleSlide.addShape('roundRect', {
        x: 0.5, y: 2.0, w: 9, h: 2.8,
        fill: { color: bgCard },
        rectRadius: 0.08,
        line: { color: borderCard, pt: 1 }
      });
      titleSlide.addText('Key Highlights', {
        x: 0.5, y: 2.35, w: 9, h: 0.9,
        fontSize: 40, bold: true, color: textPrimary, align: 'center'
      });
      titleSlide.addText('Working days · Vacation · Sick · Holidays · Hours & Overtime', {
        x: 0.5, y: 3.0, w: 9, h: 0.45,
        fontSize: 16, color: textSecondary, align: 'center'
      });
      titleSlide.addText(profileName + '  ·  Generated ' + dateStr, {
        x: 0.5, y: 6.4, w: 9, h: 0.35,
        fontSize: 11, color: textSecondary, align: 'center'
      });

      years.forEach(function (year) {
        var y = byYear[year] || {};
        if (anyDays) {
          var slide = pres.addSlide();
          slide.background = { color: bgSlide };
          slide.addShape('rect', {
            x: 0, y: 0, w: 10, h: 1.0,
            fill: { color: headerBarBg }
          });
          slide.addShape('rect', {
            x: 0, y: 0, w: 0.12, h: 1.0,
            fill: { color: headerAccent }
          });
          slide.addText(year + '  —  Days summary', {
            x: 0.6, y: 0.32, w: 8.8, h: 0.5,
            fontSize: 24, bold: true, color: textOnDark
          });

          var rows = [];
          rows.push([
            { text: 'Metric', options: { bold: true, color: textPrimary } },
            { text: 'Value', options: { bold: true, color: textPrimary } }
          ]);
          if (options.workingDays) {
            rows.push(['Working days (total)', String(y.workDays || 0)]);
            rows.push(['  — WFO', String(y.workWFO || 0)]);
            rows.push(['  — WFH', String(y.workWFH || 0)]);
          }
          if (options.vacation) rows.push(['Vacation days', String(y.vacation || 0)]);
          if (options.vacationQuota) {
            var quota = typeof W.getVacationAllowance === 'function' ? W.getVacationAllowance(year) : null;
            rows.push(['Vacation days quota', quota != null ? String(quota) : '—']);
          }
          if (options.vacationRemaining) {
            var quotaR = typeof W.getVacationAllowance === 'function' ? W.getVacationAllowance(year) : null;
            var used = y.vacation || 0;
            var remaining = quotaR != null ? Math.max(0, quotaR - used) : null;
            rows.push(['Vacation days remaining', remaining != null ? String(remaining) : '—']);
          }
          if (options.sick) rows.push(['Sick leave', String(y.sick || 0)]);
          if (options.holidays) rows.push(['Holidays', String(y.holiday || 0)]);

          slide.addTable(rows, {
            x: 0.6, y: 1.4, w: 8.8, colW: [4.5, 2],
            border: { pt: 0.5, color: tableBorder },
            fill: { color: bgCard },
            fontSize: 12,
            color: textPrimary,
            align: 'left',
            valign: 'middle',
            margin: 0.08
          });
        }

        if (anyHours) {
          var slide2 = pres.addSlide();
          slide2.background = { color: bgSlide };
          slide2.addShape('rect', {
            x: 0, y: 0, w: 10, h: 1.0,
            fill: { color: headerBarBg }
          });
          slide2.addShape('rect', {
            x: 0, y: 0, w: 0.12, h: 1.0,
            fill: { color: headerAccent }
          });
          slide2.addText(year + '  —  Working hours & Overtime', {
            x: 0.6, y: 0.32, w: 8.8, h: 0.5,
            fontSize: 24, bold: true, color: textOnDark
          });

          var chartData = [];
          if (options.workingHours) {
            chartData.push({
              name: 'Working hours',
              labels: ['Total', 'Avg per work day'],
              values: [(y.totalWorkMinutes || 0) / 60, (y.avgWorkMinutes || 0) / 60]
            });
          }
          if (options.overtime) {
            chartData.push({
              name: 'Overtime',
              labels: ['Total', 'Avg per work day'],
              values: [(y.totalOvertimeMinutes || 0) / 60, (y.avgOvertimeMinutes || 0) / 60]
            });
          }

          var chartType = (pres.ChartType && pres.ChartType.bar) ? pres.ChartType.bar : 'bar';
          var cw = 4.15;
          var ch = 2.65;
          var gap = 0.25;
          var left1 = 0.6;
          var left2 = left1 + cw + gap;
          var top1 = 1.45;
          var top2 = top1 + ch + 0.2;
          var chartOptsBase = {
            showLabel: true,
            barDir: 'col',
            catAxisLabelFontSize: 10,
            catAxisLabelColor: chartLabelColor,
            valAxisLabelFontSize: 9,
            valAxisLabelColor: chartLabelColor,
            showLegend: false,
            dataLabelColor: textPrimary,
            dataLabelFontSize: 10,
            chartArea: { fill: { color: bgCard }, roundedCorners: true },
            plotArea: { fill: { color: bgCard } },
            titleFontSize: 11,
            titleColor: chartTitleColor,
            showTitle: true
          };

          if (chartData.length > 0) {
            try {
              var otY = options.workingHours ? top2 : top1;
              if (options.workingHours) {
                slide2.addChart(chartType, [{ name: 'Total', labels: [year], values: [(y.totalWorkMinutes || 0) / 60] }], Object.assign({ x: left1, y: top1, w: cw, h: ch, chartColors: [chartColorWork], title: 'Total working hours (hours)' }, chartOptsBase));
                slide2.addChart(chartType, [{ name: 'Avg', labels: [year], values: [(y.avgWorkMinutes || 0) / 60] }], Object.assign({ x: left2, y: top1, w: cw, h: ch, chartColors: [chartColorWork], title: 'Average working hours (per work day)' }, chartOptsBase));
              }
              if (options.overtime) {
                slide2.addChart(chartType, [{ name: 'Total', labels: [year], values: [(y.totalOvertimeMinutes || 0) / 60] }], Object.assign({ x: left1, y: otY, w: cw, h: ch, chartColors: [chartColorOvertime], title: 'Total overtime (hours)' }, chartOptsBase));
                slide2.addChart(chartType, [{ name: 'Avg', labels: [year], values: [(y.avgOvertimeMinutes || 0) / 60] }], Object.assign({ x: left2, y: otY, w: cw, h: ch, chartColors: [chartColorOvertime], title: 'Average overtime (per work day)' }, chartOptsBase));
              }
            } catch (chartErr) {
              var chartY = 1.5;
              var tblRows = [
                [{ text: 'Metric', options: { bold: true, color: textPrimary } }, { text: 'Value', options: { bold: true, color: textPrimary } }]
              ];
              if (options.workingHours) {
                tblRows.push(['Total working hours', formatHours(y.totalWorkMinutes)]);
                tblRows.push(['Avg working hours (per work day)', formatHours(y.avgWorkMinutes)]);
              }
              if (options.overtime) {
                tblRows.push(['Total overtime', formatHours(y.totalOvertimeMinutes)]);
                tblRows.push(['Avg overtime (per work day)', formatHours(y.avgOvertimeMinutes)]);
              }
              slide2.addTable(tblRows, {
                x: 0.6, y: chartY, w: 8.8, colW: [4.5, 2.5],
                border: { pt: 0.5, color: tableBorder },
                fill: { color: bgCard },
                fontSize: 12,
                color: textPrimary,
                align: 'left',
                valign: 'middle',
                margin: 0.08
              });
            }
          }
        }

        if (options.trendBasis && options.trendBasis.length > 0 && (options.workingHours || options.overtime)) {
          var trendChartType = (pres.ChartType && pres.ChartType.bar) ? pres.ChartType.bar : 'bar';
          var trendCw = 4.2;
          var trendCh = 2.35;
          var trendGap = 0.25;
          var trendLeft1 = 0.6;
          var trendLeft2 = trendLeft1 + trendCw + trendGap;
          var trendTop1 = 1.45;
          var trendHighlightH = 0.35;
          var trendOpts = {
            showLabel: true,
            barDir: 'col',
            catAxisLabelFontSize: 9,
            catAxisLabelColor: chartLabelColor,
            valAxisLabelFontSize: 9,
            valAxisLabelColor: chartLabelColor,
            showLegend: false,
            dataLabelColor: textPrimary,
            dataLabelFontSize: 9,
            chartArea: { fill: { color: bgCard }, roundedCorners: true },
            plotArea: { fill: { color: bgCard } },
            titleFontSize: 11,
            titleColor: chartTitleColor,
            showTitle: true
          };
          options.trendBasis.forEach(function (basis) {
            var periodData = aggregateByPeriodForYear(entries, year, basis);
            var basisLabel = basis === 'weekly' ? 'Weekly' : basis === 'monthly' ? 'Monthly' : 'Quarterly';
            if (periodData.length === 0) return;
            var labels = periodData.map(function (p) { return p.label; });
            var totalWorkVals = periodData.map(function (p) { return p.totalWorkMinutes / 60; });
            var avgWorkVals = periodData.map(function (p) { return p.workDays > 0 ? p.avgWorkMinutes / 60 : 0; });
            var totalOtVals = periodData.map(function (p) { return p.totalOvertimeMinutes / 60; });
            var avgOtVals = periodData.map(function (p) { return p.workDays > 0 ? p.avgOvertimeMinutes / 60 : 0; });

            if (options.workingHours) {
              var slideWork = pres.addSlide();
              slideWork.background = { color: bgSlide };
              slideWork.addShape('rect', { x: 0, y: 0, w: 10, h: 1.0, fill: { color: headerBarBg } });
              slideWork.addShape('rect', { x: 0, y: 0, w: 0.12, h: 1.0, fill: { color: headerAccent } });
              slideWork.addText(year + '  —  Working hours trend (' + basisLabel + ')', { x: 0.6, y: 0.32, w: 8.8, h: 0.5, fontSize: 24, bold: true, color: textOnDark });
              try {
                slideWork.addChart(trendChartType, [{ name: 'Total', labels: labels, values: totalWorkVals }], Object.assign({ x: trendLeft1, y: trendTop1, w: trendCw, h: trendCh, chartColors: [chartColorWork], title: 'Total working hours by ' + basis }, trendOpts));
                var totalStats = minMaxMedian(totalWorkVals, labels);
                slideWork.addText('Min: ' + formatHoursForChart(totalStats.minVal) + ' (' + totalStats.minPeriod + ')  |  Max: ' + formatHoursForChart(totalStats.maxVal) + ' (' + totalStats.maxPeriod + ')  |  Median: ' + formatHoursForChart(totalStats.medianVal) + ' (' + totalStats.medianPeriod + ')', { x: trendLeft1, y: trendTop1 + trendCh + 0.05, w: trendCw, h: trendHighlightH, fontSize: 9, color: chartLabelColor });

                slideWork.addChart(trendChartType, [{ name: 'Avg', labels: labels, values: avgWorkVals }], Object.assign({ x: trendLeft2, y: trendTop1, w: trendCw, h: trendCh, chartColors: [chartColorWork], title: 'Average working hours (per work day) by ' + basis }, trendOpts));
                var avgStats = minMaxMedian(avgWorkVals, labels);
                slideWork.addText('Min: ' + formatHoursForChart(avgStats.minVal) + ' (' + avgStats.minPeriod + ')  |  Max: ' + formatHoursForChart(avgStats.maxVal) + ' (' + avgStats.maxPeriod + ')  |  Median: ' + formatHoursForChart(avgStats.medianVal) + ' (' + avgStats.medianPeriod + ')', { x: trendLeft2, y: trendTop1 + trendCh + 0.05, w: trendCw, h: trendHighlightH, fontSize: 9, color: chartLabelColor });
              } catch (errTrend) { console.warn('Trend chart error:', errTrend); }
            }
            if (options.overtime) {
              var slideOt = pres.addSlide();
              slideOt.background = { color: bgSlide };
              slideOt.addShape('rect', { x: 0, y: 0, w: 10, h: 1.0, fill: { color: headerBarBg } });
              slideOt.addShape('rect', { x: 0, y: 0, w: 0.12, h: 1.0, fill: { color: headerAccent } });
              slideOt.addText(year + '  —  Overtime trend (' + basisLabel + ')', { x: 0.6, y: 0.32, w: 8.8, h: 0.5, fontSize: 24, bold: true, color: textOnDark });
              try {
                slideOt.addChart(trendChartType, [{ name: 'Total', labels: labels, values: totalOtVals }], Object.assign({ x: trendLeft1, y: trendTop1, w: trendCw, h: trendCh, chartColors: [chartColorOvertime], title: 'Total overtime by ' + basis }, trendOpts));
                var totalOtStats = minMaxMedian(totalOtVals, labels);
                slideOt.addText('Min: ' + formatHoursForChart(totalOtStats.minVal) + ' (' + totalOtStats.minPeriod + ')  |  Max: ' + formatHoursForChart(totalOtStats.maxVal) + ' (' + totalOtStats.maxPeriod + ')  |  Median: ' + formatHoursForChart(totalOtStats.medianVal) + ' (' + totalOtStats.medianPeriod + ')', { x: trendLeft1, y: trendTop1 + trendCh + 0.05, w: trendCw, h: trendHighlightH, fontSize: 9, color: chartLabelColor });

                slideOt.addChart(trendChartType, [{ name: 'Avg', labels: labels, values: avgOtVals }], Object.assign({ x: trendLeft2, y: trendTop1, w: trendCw, h: trendCh, chartColors: [chartColorOvertime], title: 'Average overtime (per work day) by ' + basis }, trendOpts));
                var avgOtStats = minMaxMedian(avgOtVals, labels);
                slideOt.addText('Min: ' + formatHoursForChart(avgOtStats.minVal) + ' (' + avgOtStats.minPeriod + ')  |  Max: ' + formatHoursForChart(avgOtStats.maxVal) + ' (' + avgOtStats.maxPeriod + ')  |  Median: ' + formatHoursForChart(avgOtStats.medianVal) + ' (' + avgOtStats.medianPeriod + ')', { x: trendLeft2, y: trendTop1 + trendCh + 0.05, w: trendCw, h: trendHighlightH, fontSize: 9, color: chartLabelColor });
              } catch (errTrend) { console.warn('Trend chart error:', errTrend); }
            }
          });
        }
      });

      var fileName = 'key-highlights-' + profileName.replace(/\s+/g, '-') + '-' + dateStr + '.pptx';
      var p = pres.writeFile({ fileName: fileName });
      if (p && typeof p.then === 'function') {
        p.then(function () {
          W.closeKeyHighlightsPptModal();
          if (typeof W.showToast === 'function') W.showToast('Key highlights PowerPoint downloaded.', 'success');
          else alert('Key highlights PowerPoint downloaded.');
        }).catch(function (err) {
          var msg = (err && err.message) ? err.message : String(err);
          if (typeof W.showToast === 'function') W.showToast('Download failed: ' + msg, 'error');
          else alert('Download failed: ' + msg);
          console.error('Key highlights PPT error:', err);
        });
      } else {
        W.closeKeyHighlightsPptModal();
        if (typeof W.showToast === 'function') W.showToast('Key highlights PowerPoint downloaded.', 'success');
        else alert('Key highlights PowerPoint downloaded.');
      }
    } catch (err) {
      var msg = (err && err.message) ? err.message : String(err);
      if (typeof W.showToast === 'function') W.showToast('PPT generation failed: ' + msg, 'error');
      else alert('PPT generation failed: ' + msg);
      console.error('Key highlights PPT error:', err);
    }
  };
})(window.WorkHours);
