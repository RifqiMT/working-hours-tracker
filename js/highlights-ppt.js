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

  function pptT(key, subs) {
    return (W.I18N && typeof W.I18N.t === 'function') ? W.I18N.t(key, subs) : key;
  }

  function pptAbbrevMonthName(name) {
    if (!name) return name;
    return name.length <= 3 ? name : name.slice(0, 3);
  }

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
    if (minutes == null || isNaN(minutes)) return '0';
    var mm = Math.round(Number(minutes));
    return (typeof W.formatMinutes === 'function') ? W.formatMinutes(mm) : String(mm);
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
        var months = (W.I18N && typeof W.I18N.resolve === 'function')
          ? W.I18N.resolve('calendarStats.months', W.currentLanguage || 'en')
          : null;
        var mName = (Array.isArray(months) ? months[parseInt(parts[1], 10) - 1] : null) || '';
        return pptAbbrevMonthName(mName) + ' ' + parts[0];
      }
    }
    if (basis === 'quarterly') {
      if (typeof W.formatIsoQuarterPeriodLabel === 'function') return W.formatIsoQuarterPeriodLabel(key);
      return key.replace('-', ' ');
    }
    if (basis === 'weekly') {
      if (typeof W.formatIsoWeekPeriodLabel === 'function') return W.formatIsoWeekPeriodLabel(key);
      return 'W' + key.split('W')[1] + ' ' + key.slice(0, 4);
    }
    return key;
  }

  /** Compute min, max, median and their period labels from values and labels arrays. */
  function minMaxMedian(values, labels) {
    if (!values || !values.length) return { minVal: 0, minPeriod: '—', maxVal: 0, maxPeriod: '—', medianVal: 0, medianPeriod: '—' };
    var between = pptT('pptExport.medianPeriodSeparator') || ' / ';
    var indexed = values.map(function (v, i) { return { v: v, label: labels[i] || '—' }; });
    indexed.sort(function (a, b) { return a.v - b.v; });
    var minVal = indexed[0].v;
    var minPeriod = indexed[0].label;
    var maxVal = indexed[indexed.length - 1].v;
    var maxPeriod = indexed[indexed.length - 1].label;
    var mid = Math.floor(indexed.length / 2);
    var medianVal = indexed.length % 2 === 1 ? indexed[mid].v : (indexed[mid - 1].v + indexed[mid].v) / 2;
    var medianPeriod = indexed.length % 2 === 1 ? indexed[mid].label : indexed[mid - 1].label + between + indexed[mid].label;
    return { minVal: minVal, minPeriod: minPeriod, maxVal: maxVal, maxPeriod: maxPeriod, medianVal: medianVal, medianPeriod: medianPeriod };
  }

  function formatHoursForChart(hours) {
    if (hours == null || isNaN(hours)) return '0';
    var hFloat = Number(hours);
    var mm = Math.round(hFloat * 60);
    return (typeof W.formatMinutes === 'function') ? W.formatMinutes(mm) : String(mm);
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

  /**
   * Same periods as aggregateByPeriodForYear, but only WFO/WFH work rows; splits minutes and overtime by location.
   * Other locations are omitted (same rules as statistics summary Details charts).
   */
  function aggregateByPeriodForYearWithLocation(entries, year, basis) {
    var standard = W.STANDARD_WORK_MINUTES_PER_DAY || STANDARD;
    var buckets = {};
    entries.forEach(function (e) {
      if ((e.dayStatus || 'work').toLowerCase() !== 'work') return;
      var loc = (e.location || '').toUpperCase();
      if (loc !== 'WFO' && loc !== 'WFH') return;
      var dateStr = e.date || '';
      if (dateStr.slice(0, 4) !== year) return;
      var breakMin =
        e.breakMinutes != null
          ? e.breakMinutes
          : e.break != null && typeof W.parseBreakToMinutes === 'function'
            ? W.parseBreakToMinutes(e.break, e.breakUnit || 'minutes')
            : 0;
      var dur = W.workingMinutes(e.clockIn, e.clockOut, breakMin);
      if (dur == null) return;
      var key = getPeriodKey(dateStr, basis);
      if (!key) return;
      if (basis === 'weekly' && key.slice(0, 4) !== year) return;
      if (!buckets[key]) {
        buckets[key] = { wfoWork: 0, wfhWork: 0, wfoDays: 0, wfhDays: 0, wfoOt: 0, wfhOt: 0 };
      }
      var b = buckets[key];
      var ot = Math.max(0, dur - standard);
      if (loc === 'WFO') {
        b.wfoWork += dur;
        b.wfoDays += 1;
        b.wfoOt += ot;
      } else {
        b.wfhWork += dur;
        b.wfhDays += 1;
        b.wfhOt += ot;
      }
    });
    var keys = Object.keys(buckets).sort();
    var max = basis === 'weekly' ? 52 : basis === 'monthly' ? 12 : 4;
    if (keys.length > max) keys = keys.slice(-max);
    return keys.map(function (k) {
      var b = buckets[k];
      return {
        key: k,
        label: getPeriodLabel(k, basis),
        wfoWork: b.wfoWork,
        wfhWork: b.wfhWork,
        wfoDays: b.wfoDays,
        wfhDays: b.wfhDays,
        wfoOt: b.wfoOt,
        wfhOt: b.wfhOt,
        avgWfoWork: b.wfoDays > 0 ? Math.round(b.wfoWork / b.wfoDays) : 0,
        avgWfhWork: b.wfhDays > 0 ? Math.round(b.wfhWork / b.wfhDays) : 0,
        avgWfoOt: b.wfoDays > 0 ? Math.round(b.wfoOt / b.wfoDays) : 0,
        avgWfhOt: b.wfhDays > 0 ? Math.round(b.wfhOt / b.wfhDays) : 0
      };
    });
  }

  /** Populate year checkboxes and open modal. */
  W.openKeyHighlightsPptModal = function openKeyHighlightsPptModal() {
    if (typeof W.refreshKeyHighlightsPptModalStaticText === 'function') W.refreshKeyHighlightsPptModalStaticText();
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
      empty.textContent = (W.I18N && W.I18N.t) ? W.I18N.t('ppt.noEntries') : 'No entries found. Add entries first.';
      listEl.appendChild(empty);
      if (triggerTextEl) { triggerTextEl.textContent = (W.I18N && W.I18N.t) ? W.I18N.t('ppt.noYears') : 'No years available'; triggerTextEl.classList.add('is-placeholder'); }
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
      if (triggerTextEl) {
        triggerTextEl.textContent = (W.I18N && W.I18N.t)
          ? W.I18N.t('modals.keyHighlightsPptModal.yearsTriggerText')
          : 'Select years...';
        triggerTextEl.classList.add('is-placeholder');
      }
      if (panelEl) panelEl.setAttribute('hidden', '');
    }

    function updateYearsTriggerText() {
      if (!triggerTextEl || years.length === 0) return;
      var checked = listEl.querySelectorAll('.ppt-option-year-cb:checked');
      var n = checked.length;
      if (n === 0) {
        triggerTextEl.textContent = (W.I18N && W.I18N.t)
          ? W.I18N.t('modals.keyHighlightsPptModal.yearsTriggerText')
          : 'Select years...';
        triggerTextEl.classList.add('is-placeholder');
      } else if (n === years.length) {
        triggerTextEl.textContent = (W.I18N && W.I18N.t) ? W.I18N.t('ppt.allYears', { n: n }) : ('All years (' + n + ')');
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
      wfoWfhTrend: document.getElementById('pptOptWfoWfhTrend') && document.getElementById('pptOptWfoWfhTrend').checked,
      trendBasis: trendBasisList
    };
  }

  /** Build and download the PPT from current modal options. */
  W.generateKeyHighlightsPpt = function generateKeyHighlightsPpt(options) {
    if (!options) options = getKeyHighlightsPptOptions();
    var PptxGen = getPptxGen();
    if (!PptxGen) {
      var msg = (W.I18N && W.I18N.t) ? W.I18N.t('ppt.pptxRequired') : 'PowerPoint export requires PptxGenJS. Run npm install and load the app from a server.';
      alert(msg);
      return;
    }
    var entries = (typeof W.getEntries === 'function') ? W.getEntries() : [];
    var byYear = computePerYearStats(entries);
    var years = options.years || [];
    if (years.length === 0) {
      if (typeof W.showToast === 'function') W.showToast((W.I18N && W.I18N.t) ? W.I18N.t('toasts.selectOneYear') : 'Select at least one year.', 'warning');
      else alert((W.I18N && W.I18N.t) ? W.I18N.t('toasts.selectOneYear') : 'Select at least one year.');
      return;
    }
    if (options.wfoWfhTrend) {
      if (!options.trendBasis || options.trendBasis.length === 0) {
        var msgTrend = (W.I18N && W.I18N.t) ? W.I18N.t('toasts.pptWfoWfhNeedsTrend') : 'WFO vs WFH line trends need at least one trend basis.';
        if (typeof W.showToast === 'function') W.showToast(msgTrend, 'warning');
        else alert(msgTrend);
        return;
      }
      if (!options.workingHours && !options.overtime) {
        var msgH = (W.I18N && W.I18N.t) ? W.I18N.t('toasts.pptWfoWfhNeedsHours') : 'Select Working hours and/or Overtime for WFO vs WFH trends.';
        if (typeof W.showToast === 'function') W.showToast(msgH, 'warning');
        else alert(msgH);
        return;
      }
    }
    var anyDays = options.workingDays || options.vacation || options.vacationQuota || options.vacationRemaining || options.sick || options.holidays;
    var anyHours = options.workingHours || options.overtime;
    if (!anyDays && !anyHours) {
      if (typeof W.showToast === 'function') W.showToast((W.I18N && W.I18N.t) ? W.I18N.t('toasts.selectOneMetric') : 'Select at least one metric to include.', 'warning');
      else alert((W.I18N && W.I18N.t) ? W.I18N.t('toasts.selectOneMetric') : 'Select at least one metric to include.');
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
      pres.author = pptT('app.title') || 'Working Hours Tracker';

      var profileName = (W.getProfile() || 'Default').replace(/[^\w\s-]/g, '');
      var dateStr = new Date().toISOString().slice(0, 10);

      // Color palette: Indonesia (Merah Putih) – red accent on white
      // Backgrounds
      var bgSlide = 'F8FAFC';        // Soft off-white
      var bgCard = 'FFFFFF';         // Pure white for cards/tables
      var borderCard = 'E2E8F0';     // Light border for cards
      var headerBarBg = '9A0E1A';    // Dark Indonesia red header strip
      var headerAccent = 'CE1126';   // Indonesia red accent strip
      // Text (WCAG AA on light bg)
      var textPrimary = '1A1213';    // Near-black (align with --text)
      var textSecondary = '6B5C5E';  // Muted (align with --muted)
      var textOnDark = 'FFFFFF';     // White text on header
      // Table
      var tableBorder = 'E5E0E1';    // Soft border (align with --border)
      // Chart: red = working hours, golden = overtime (consistent across app)
      var chartColorWork = 'CE1126';     // Indonesia red – working hours
      var chartColorOvertime = 'CA8A04'; // Golden/amber – overtime (matches --warning)
      var chartColorWfhWorkLine = '16A34A'; // WFH series for working-hours line charts (align with app success)
      var chartColorWfhOtLine = 'EA580C'; // WFH series for overtime line charts (distinct from WFO gold)
      var chartLabelColor = '1A1213';   // Axis labels
      var chartTitleColor = '6B5C5E';   // Chart title (muted)

      // Title slide
      var titleSlide = pres.addSlide();
      titleSlide.background = { color: bgSlide };
      titleSlide.addShape('roundRect', {
        x: 0.5, y: 2.0, w: 9, h: 2.8,
        fill: { color: bgCard },
        rectRadius: 0.08,
        line: { color: borderCard, pt: 1 }
      });
      titleSlide.addText(pptT('pptExport.keyHighlightsTitle'), {
        x: 0.5, y: 2.35, w: 9, h: 0.9,
        fontSize: 40, bold: true, color: textPrimary, align: 'center'
      });
      titleSlide.addText(pptT('pptExport.keyHighlightsSubtitle'), {
        x: 0.5, y: 3.0, w: 9, h: 0.45,
        fontSize: 16, color: textSecondary, align: 'center'
      });
      titleSlide.addText(profileName + '  ·  ' + pptT('pptExport.generated') + ' ' + dateStr, {
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
          slide.addText(year + '  —  ' + pptT('pptExport.daysSummaryTitle'), {
            x: 0.6, y: 0.32, w: 8.8, h: 0.5,
            fontSize: 24, bold: true, color: textOnDark
          });

          var rows = [];
          rows.push([
            { text: pptT('pptExport.metric'), options: { bold: true, color: textPrimary } },
            { text: pptT('pptExport.value'), options: { bold: true, color: textPrimary } }
          ]);
          if (options.workingDays) {
            rows.push([pptT('pptExport.workingDaysTotal'), String(y.workDays || 0)]);
            rows.push([pptT('pptExport.workWfo'), String(y.workWFO || 0)]);
            rows.push([pptT('pptExport.workWfh'), String(y.workWFH || 0)]);
          }
          if (options.vacation) rows.push([pptT('pptExport.vacationDays'), String(y.vacation || 0)]);
          if (options.vacationQuota) {
            var quota = typeof W.getVacationAllowance === 'function' ? W.getVacationAllowance(year) : null;
            rows.push([pptT('pptExport.vacationQuota'), quota != null ? String(quota) : '—']);
          }
          if (options.vacationRemaining) {
            var quotaR = typeof W.getVacationAllowance === 'function' ? W.getVacationAllowance(year) : null;
            var used = y.vacation || 0;
            var remaining = quotaR != null ? Math.max(0, quotaR - used) : null;
            rows.push([pptT('pptExport.vacationRemaining'), remaining != null ? String(remaining) : '—']);
          }
          if (options.sick) rows.push([pptT('pptExport.sickLeave'), String(y.sick || 0)]);
          if (options.holidays) rows.push([pptT('pptExport.holidays'), String(y.holiday || 0)]);

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
          slide2.addText(year + '  —  ' + pptT('pptExport.workingHoursSummaryTitle'), {
            x: 0.6, y: 0.32, w: 8.8, h: 0.5,
            fontSize: 24, bold: true, color: textOnDark
          });

          var chartData = [];
          if (options.workingHours) {
            chartData.push({
              name: pptT('pptExport.seriesWorkingHours'),
              labels: [pptT('pptExport.chartLabelTotal'), pptT('pptExport.chartLabelAvgPerWorkDay')],
              values: [(y.totalWorkMinutes || 0) / 60, (y.avgWorkMinutes || 0) / 60]
            });
          }
          if (options.overtime) {
            chartData.push({
              name: pptT('pptExport.seriesOvertime'),
              labels: [pptT('pptExport.chartLabelTotal'), pptT('pptExport.chartLabelAvgPerWorkDay')],
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
                slide2.addChart(chartType, [{ name: pptT('pptExport.trendSeriesTotal'), labels: [year], values: [(y.totalWorkMinutes || 0) / 60] }], Object.assign({ x: left1, y: top1, w: cw, h: ch, chartColors: [chartColorWork], title: pptT('pptExport.chartTitleTotalWorkingHoursHours') }, chartOptsBase));
                slide2.addChart(chartType, [{ name: pptT('pptExport.trendSeriesAvg'), labels: [year], values: [(y.avgWorkMinutes || 0) / 60] }], Object.assign({ x: left2, y: top1, w: cw, h: ch, chartColors: [chartColorWork], title: pptT('pptExport.chartTitleAvgWorkingHoursPerWorkDay') }, chartOptsBase));
              }
              if (options.overtime) {
                slide2.addChart(chartType, [{ name: pptT('pptExport.trendSeriesTotal'), labels: [year], values: [(y.totalOvertimeMinutes || 0) / 60] }], Object.assign({ x: left1, y: otY, w: cw, h: ch, chartColors: [chartColorOvertime], title: pptT('pptExport.chartTitleTotalOvertimeHours') }, chartOptsBase));
                slide2.addChart(chartType, [{ name: pptT('pptExport.trendSeriesAvg'), labels: [year], values: [(y.avgOvertimeMinutes || 0) / 60] }], Object.assign({ x: left2, y: otY, w: cw, h: ch, chartColors: [chartColorOvertime], title: pptT('pptExport.chartTitleAvgOvertimePerWorkDay') }, chartOptsBase));
              }
            } catch (chartErr) {
              var chartY = 1.5;
              var tblRows = [
                [{ text: pptT('pptExport.metric'), options: { bold: true, color: textPrimary } }, { text: pptT('pptExport.value'), options: { bold: true, color: textPrimary } }]
              ];
              if (options.workingHours) {
                tblRows.push([pptT('pptExport.totalWorkingHours'), formatHours(y.totalWorkMinutes)]);
                tblRows.push([pptT('pptExport.avgWorkHoursPerWorkDay'), formatHours(y.avgWorkMinutes)]);
              }
              if (options.overtime) {
                tblRows.push([pptT('pptExport.totalOvertime'), formatHours(y.totalOvertimeMinutes)]);
                tblRows.push([pptT('pptExport.avgOvertimePerWorkDay'), formatHours(y.avgOvertimeMinutes)]);
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
            valAxisTitle: pptT('pptExport.chartAxisValueTitle'),
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
            var basisLabel = basis === 'weekly'
              ? pptT('modals.keyHighlightsPptModal.trendWeeklyLabel')
              : basis === 'monthly'
                ? pptT('modals.keyHighlightsPptModal.trendMonthlyLabel')
                : pptT('modals.keyHighlightsPptModal.trendQuarterlyLabel');
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
              slideWork.addText(year + '  —  ' + pptT('pptExport.workingHoursTrendTitle', { basis: basisLabel }), { x: 0.6, y: 0.32, w: 8.8, h: 0.5, fontSize: 24, bold: true, color: textOnDark });
              try {
                slideWork.addChart(trendChartType, [{ name: pptT('pptExport.trendSeriesTotal'), labels: labels, values: totalWorkVals }], Object.assign({ x: trendLeft1, y: trendTop1, w: trendCw, h: trendCh, chartColors: [chartColorWork], title: pptT('pptExport.totalWorkingHoursByPeriod', { basis: basisLabel }) }, trendOpts));
                var totalStats = minMaxMedian(totalWorkVals, labels);
                slideWork.addText(pptT('pptExport.minLabel') + ' ' + formatHoursForChart(totalStats.minVal) + ' (' + totalStats.minPeriod + ')  |  ' + pptT('pptExport.maxLabel') + ' ' + formatHoursForChart(totalStats.maxVal) + ' (' + totalStats.maxPeriod + ')  |  ' + pptT('pptExport.medianLabel') + ' ' + formatHoursForChart(totalStats.medianVal) + ' (' + totalStats.medianPeriod + ')', { x: trendLeft1, y: trendTop1 + trendCh + 0.05, w: trendCw, h: trendHighlightH, fontSize: 9, color: chartLabelColor });

                slideWork.addChart(trendChartType, [{ name: pptT('pptExport.trendSeriesAvg'), labels: labels, values: avgWorkVals }], Object.assign({ x: trendLeft2, y: trendTop1, w: trendCw, h: trendCh, chartColors: [chartColorWork], title: pptT('pptExport.avgWorkingHoursByPeriod', { basis: basisLabel }) }, trendOpts));
                var avgStats = minMaxMedian(avgWorkVals, labels);
                slideWork.addText(pptT('pptExport.minLabel') + ' ' + formatHoursForChart(avgStats.minVal) + ' (' + avgStats.minPeriod + ')  |  ' + pptT('pptExport.maxLabel') + ' ' + formatHoursForChart(avgStats.maxVal) + ' (' + avgStats.maxPeriod + ')  |  ' + pptT('pptExport.medianLabel') + ' ' + formatHoursForChart(avgStats.medianVal) + ' (' + avgStats.medianPeriod + ')', { x: trendLeft2, y: trendTop1 + trendCh + 0.05, w: trendCw, h: trendHighlightH, fontSize: 9, color: chartLabelColor });
              } catch (errTrend) { console.warn('Trend chart error:', errTrend); }
            }
            if (options.overtime) {
              var slideOt = pres.addSlide();
              slideOt.background = { color: bgSlide };
              slideOt.addShape('rect', { x: 0, y: 0, w: 10, h: 1.0, fill: { color: headerBarBg } });
              slideOt.addShape('rect', { x: 0, y: 0, w: 0.12, h: 1.0, fill: { color: headerAccent } });
              slideOt.addText(year + '  —  ' + pptT('pptExport.overtimeTrendTitle', { basis: basisLabel }), { x: 0.6, y: 0.32, w: 8.8, h: 0.5, fontSize: 24, bold: true, color: textOnDark });
              try {
                slideOt.addChart(trendChartType, [{ name: pptT('pptExport.trendSeriesTotal'), labels: labels, values: totalOtVals }], Object.assign({ x: trendLeft1, y: trendTop1, w: trendCw, h: trendCh, chartColors: [chartColorOvertime], title: pptT('pptExport.totalOvertimeByPeriod', { basis: basisLabel }) }, trendOpts));
                var totalOtStats = minMaxMedian(totalOtVals, labels);
                slideOt.addText(pptT('pptExport.minLabel') + ' ' + formatHoursForChart(totalOtStats.minVal) + ' (' + totalOtStats.minPeriod + ')  |  ' + pptT('pptExport.maxLabel') + ' ' + formatHoursForChart(totalOtStats.maxVal) + ' (' + totalOtStats.maxPeriod + ')  |  ' + pptT('pptExport.medianLabel') + ' ' + formatHoursForChart(totalOtStats.medianVal) + ' (' + totalOtStats.medianPeriod + ')', { x: trendLeft1, y: trendTop1 + trendCh + 0.05, w: trendCw, h: trendHighlightH, fontSize: 9, color: chartLabelColor });

                slideOt.addChart(trendChartType, [{ name: pptT('pptExport.trendSeriesAvg'), labels: labels, values: avgOtVals }], Object.assign({ x: trendLeft2, y: trendTop1, w: trendCw, h: trendCh, chartColors: [chartColorOvertime], title: pptT('pptExport.avgOvertimeByPeriod', { basis: basisLabel }) }, trendOpts));
                var avgOtStats = minMaxMedian(avgOtVals, labels);
                slideOt.addText(pptT('pptExport.minLabel') + ' ' + formatHoursForChart(avgOtStats.minVal) + ' (' + avgOtStats.minPeriod + ')  |  ' + pptT('pptExport.maxLabel') + ' ' + formatHoursForChart(avgOtStats.maxVal) + ' (' + avgOtStats.maxPeriod + ')  |  ' + pptT('pptExport.medianLabel') + ' ' + formatHoursForChart(avgOtStats.medianVal) + ' (' + avgOtStats.medianPeriod + ')', { x: trendLeft2, y: trendTop1 + trendCh + 0.05, w: trendCw, h: trendHighlightH, fontSize: 9, color: chartLabelColor });
              } catch (errTrend) { console.warn('Trend chart error:', errTrend); }
            }

            if (options.wfoWfhTrend) {
              var locData = aggregateByPeriodForYearWithLocation(entries, year, basis);
              if (locData.length > 0) {
                var locLabels = locData.map(function (p) { return p.label; });
                var lineChartType = (pres.ChartType && pres.ChartType.line) ? pres.ChartType.line : 'line';
                var lineTrendOpts = {
                  showLabel: true,
                  catAxisLabelFontSize: 9,
                  catAxisLabelColor: chartLabelColor,
                  valAxisLabelFontSize: 9,
                  valAxisLabelColor: chartLabelColor,
                  valAxisTitle: pptT('pptExport.chartAxisValueTitle'),
                  showLegend: true,
                  legendFontSize: 9,
                  legendColor: chartLabelColor,
                  dataLabelColor: textPrimary,
                  dataLabelFontSize: 8,
                  chartArea: { fill: { color: bgCard }, roundedCorners: true },
                  plotArea: { fill: { color: bgCard } },
                  titleFontSize: 11,
                  titleColor: chartTitleColor,
                  showTitle: true,
                  lineSize: 2.25,
                  lineDataSymbol: 'circle',
                  lineDataSymbolSize: 5
                };
                var wfoSeriesLab = pptT('statsSummary.datasetWfo');
                var wfhSeriesLab = pptT('statsSummary.datasetWfh');
                if (options.workingHours) {
                  var slideLocW = pres.addSlide();
                  slideLocW.background = { color: bgSlide };
                  slideLocW.addShape('rect', { x: 0, y: 0, w: 10, h: 1.0, fill: { color: headerBarBg } });
                  slideLocW.addShape('rect', { x: 0, y: 0, w: 0.12, h: 1.0, fill: { color: headerAccent } });
                  slideLocW.addText(year + '  —  ' + pptT('pptExport.wfoWfhWorkingHoursTrendTitle', { basis: basisLabel }), { x: 0.6, y: 0.32, w: 8.8, h: 0.5, fontSize: 24, bold: true, color: textOnDark });
                  try {
                    var wfoTotW = locData.map(function (p) { return p.wfoWork / 60; });
                    var wfhTotW = locData.map(function (p) { return p.wfhWork / 60; });
                    var wfoAvgW = locData.map(function (p) { return p.wfoDays > 0 ? p.avgWfoWork / 60 : 0; });
                    var wfhAvgW = locData.map(function (p) { return p.wfhDays > 0 ? p.avgWfhWork / 60 : 0; });
                    slideLocW.addChart(
                      lineChartType,
                      [
                        { name: wfoSeriesLab, labels: locLabels, values: wfoTotW },
                        { name: wfhSeriesLab, labels: locLabels, values: wfhTotW }
                      ],
                      Object.assign(
                        {
                          x: trendLeft1,
                          y: trendTop1,
                          w: trendCw,
                          h: trendCh,
                          chartColors: [chartColorWork, chartColorWfhWorkLine],
                          title: pptT('pptExport.wfoWfhTotalWorkByPeriod', { basis: basisLabel })
                        },
                        lineTrendOpts
                      )
                    );
                    slideLocW.addChart(
                      lineChartType,
                      [
                        { name: wfoSeriesLab, labels: locLabels, values: wfoAvgW },
                        { name: wfhSeriesLab, labels: locLabels, values: wfhAvgW }
                      ],
                      Object.assign(
                        {
                          x: trendLeft2,
                          y: trendTop1,
                          w: trendCw,
                          h: trendCh,
                          chartColors: [chartColorWork, chartColorWfhWorkLine],
                          title: pptT('pptExport.wfoWfhAvgWorkByPeriod', { basis: basisLabel })
                        },
                        lineTrendOpts
                      )
                    );
                  } catch (errLocW) {
                    console.warn('WFO/WFH working hours line chart error:', errLocW);
                  }
                }
                if (options.overtime) {
                  var slideLocO = pres.addSlide();
                  slideLocO.background = { color: bgSlide };
                  slideLocO.addShape('rect', { x: 0, y: 0, w: 10, h: 1.0, fill: { color: headerBarBg } });
                  slideLocO.addShape('rect', { x: 0, y: 0, w: 0.12, h: 1.0, fill: { color: headerAccent } });
                  slideLocO.addText(year + '  —  ' + pptT('pptExport.wfoWfhOvertimeTrendTitle', { basis: basisLabel }), { x: 0.6, y: 0.32, w: 8.8, h: 0.5, fontSize: 24, bold: true, color: textOnDark });
                  try {
                    var wfoTotO = locData.map(function (p) { return p.wfoOt / 60; });
                    var wfhTotO = locData.map(function (p) { return p.wfhOt / 60; });
                    var wfoAvgO = locData.map(function (p) { return p.wfoDays > 0 ? p.avgWfoOt / 60 : 0; });
                    var wfhAvgO = locData.map(function (p) { return p.wfhDays > 0 ? p.avgWfhOt / 60 : 0; });
                    slideLocO.addChart(
                      lineChartType,
                      [
                        { name: wfoSeriesLab, labels: locLabels, values: wfoTotO },
                        { name: wfhSeriesLab, labels: locLabels, values: wfhTotO }
                      ],
                      Object.assign(
                        {
                          x: trendLeft1,
                          y: trendTop1,
                          w: trendCw,
                          h: trendCh,
                          chartColors: [chartColorOvertime, chartColorWfhOtLine],
                          title: pptT('pptExport.wfoWfhTotalOvertimeByPeriod', { basis: basisLabel })
                        },
                        lineTrendOpts
                      )
                    );
                    slideLocO.addChart(
                      lineChartType,
                      [
                        { name: wfoSeriesLab, labels: locLabels, values: wfoAvgO },
                        { name: wfhSeriesLab, labels: locLabels, values: wfhAvgO }
                      ],
                      Object.assign(
                        {
                          x: trendLeft2,
                          y: trendTop1,
                          w: trendCw,
                          h: trendCh,
                          chartColors: [chartColorOvertime, chartColorWfhOtLine],
                          title: pptT('pptExport.wfoWfhAvgOvertimeByPeriod', { basis: basisLabel })
                        },
                        lineTrendOpts
                      )
                    );
                  } catch (errLocO) {
                    console.warn('WFO/WFH overtime line chart error:', errLocO);
                  }
                }
              }
            }
          });
        }
      });

      var fileName = 'key-highlights-' + profileName.replace(/\s+/g, '-') + '-' + dateStr + '.pptx';
      var p = pres.writeFile({ fileName: fileName });
      if (p && typeof p.then === 'function') {
        p.then(function () {
          W.closeKeyHighlightsPptModal();
          var okMsg = (W.I18N && W.I18N.t) ? W.I18N.t('toasts.pptDownloaded') : 'Key highlights PowerPoint downloaded.';
          if (typeof W.showToast === 'function') W.showToast(okMsg, 'success');
          else alert(okMsg);
        }).catch(function (err) {
          var msg = (err && err.message) ? err.message : String(err);
          var errMsg = (W.I18N && W.I18N.t) ? W.I18N.t('toasts.pptDownloadFailed', { msg: msg }) : ('Download failed: ' + msg);
          if (typeof W.showToast === 'function') W.showToast(errMsg, 'error');
          else alert(errMsg);
          console.error('Key highlights PPT error:', err);
        });
      } else {
        W.closeKeyHighlightsPptModal();
        var okMsg = (W.I18N && W.I18N.t) ? W.I18N.t('toasts.pptDownloaded') : 'Key highlights PowerPoint downloaded.';
        if (typeof W.showToast === 'function') W.showToast(okMsg, 'success');
        else alert(okMsg);
      }
    } catch (err) {
      var msg = (err && err.message) ? err.message : String(err);
      var errMsg = (W.I18N && W.I18N.t) ? W.I18N.t('toasts.pptFailed', { msg: msg }) : ('PPT generation failed: ' + msg);
      if (typeof W.showToast === 'function') W.showToast(errMsg, 'error');
      else alert(errMsg);
      console.error('Key highlights PPT error:', err);
    }
  };
})(window.WorkHours);
