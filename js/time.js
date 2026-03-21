/**
 * Time and duration helpers.
 * Depends: constants (DAY_NAMES).
 */
(function (W) {
  'use strict';
  W.parseTime = function parseTime(s) {
    if (s == null || s === '') return null;
    const parts = String(s).trim().split(':');
    const h = parseInt(parts[0], 10);
    const m = parts.length > 1 ? parseInt(parts[1], 10) : 0;
    if (isNaN(h)) return null;
    return h * 60 + (isNaN(m) ? 0 : m);
  };
  /** Normalize time string to HH:mm for <input type="time"> (accepts "9:00", "09:00", etc.). */
  W.normalizeTimeToHHmm = function normalizeTimeToHHmm(s) {
    if (s == null || s === '') return '';
    const parts = String(s).trim().split(':');
    const h = parseInt(parts[0], 10);
    const m = parts.length > 1 ? parseInt(parts[1], 10) : 0;
    if (isNaN(h)) return '';
    const hh = Math.max(0, Math.min(23, h));
    const mm = Math.max(0, Math.min(59, isNaN(m) ? 0 : m));
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  };
  W.formatMinutes = function formatMinutes(m) {
    if (m == null || isNaN(m)) return '—';
    var minutes = Math.round(Number(m));
    var h = Math.floor(minutes / 60);
    var min = Math.abs(minutes % 60);

    var t = (W.I18N && typeof W.I18N.t === 'function') ? W.I18N.t : function (k) { return k; };
    function hourUnit(n) {
      return n === 1 ? t('time.hour') : t('time.hours');
    }
    function minuteUnit(n) {
      return n === 1 ? t('time.minute') : t('time.minutes');
    }

    // Always use full words so output like "1329 hours" stays readable.
    if (h > 0 && min > 0) return String(h) + ' ' + hourUnit(h) + ' ' + String(min) + ' ' + minuteUnit(min);
    if (h > 0) return String(h) + ' ' + hourUnit(h);
    return String(min) + ' ' + minuteUnit(min);
  };
  /** Duration = clock out − clock in − break (minutes). */
  W.workingMinutes = function workingMinutes(clockIn, clockOut, breakMin) {
    const inM = W.parseTime(clockIn);
    const outM = W.parseTime(clockOut);
    if (inM == null || outM == null) return null;
    const breakMinutes = Number(breakMin) || 0;
    const spanMinutes = outM - inM;
    if (spanMinutes < 0) return null;
    return Math.max(0, spanMinutes - breakMinutes);
  };
  W.getISOWeek = function getISOWeek(dateStr) {
    if (!dateStr) return 0;
    const d = new Date(dateStr + 'T12:00:00');
    if (isNaN(d.getTime())) return 0;
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };
  W.formatDateWithDay = function formatDateWithDay(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T12:00:00');
    if (isNaN(d.getTime())) return dateStr;
    var t = (W.I18N && typeof W.I18N.resolve === 'function') ? W.I18N.resolve : null;
    var lang = W.currentLanguage || 'en';
    var weekdaysFull = null;
    if (t) {
      var w = t('calendarStats.weekdaysFull', lang);
      if (Array.isArray(w) && w.length >= 7) weekdaysFull = w;
    }
    var day = (Array.isArray(weekdaysFull) ? weekdaysFull[d.getDay()] : W.DAY_NAMES[d.getDay()]) || '';
    const date = d.getDate();
    var months = null;
    if (t) {
      var mArr = t('calendarStats.months', lang);
      if (Array.isArray(mArr) && mArr.length >= 12) months = mArr;
    }
    var month = Array.isArray(months) ? months[d.getMonth()] : d.toLocaleDateString('en', { month: 'long' });
    const year = d.getFullYear();
    return date + ' ' + month + ' ' + year + ' (' + day + ')';
  };
  /** Format YYYY-MM-DD as M/D/YY for CSV compatibility. */
  W.formatDateMDY = function formatDateMDY(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    if (isNaN(d.getTime())) return dateStr;
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const y = d.getFullYear() % 100;
    return m + '/' + day + '/' + (y < 10 ? '0' + y : y);
  };
  /** Parse M/D/YY or M/D/YYYY to YYYY-MM-DD. */
  W.parseMDY = function parseMDY(s) {
    if (!s || typeof s !== 'string') return '';
    const parts = s.trim().split('/');
    if (parts.length < 3) return '';
    const m = parseInt(parts[0], 10);
    const d = parseInt(parts[1], 10);
    let y = parseInt(parts[2], 10);
    if (isNaN(m) || isNaN(d) || isNaN(y)) return '';
    if (y < 100) y += 2000; // 21 -> 2021, 25 -> 2025
    const month = String(m).padStart(2, '0');
    const day = String(d).padStart(2, '0');
    const year = String(y);
    return year + '-' + month + '-' + day;
  };
  W.nowTime = function nowTime() {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  };
  W.setToday = function setToday() {
    const d = new Date();
    document.getElementById('entryDate').value = d.toISOString().slice(0, 10);
  };
  W.generateId = function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  };

  /** UI / form: max break when unit is minutes (per field). */
  W.BREAK_INPUT_MAX_MINUTES = 60;
  /** UI / form: max break when unit is hours (per field). */
  W.BREAK_INPUT_MAX_HOURS = 24;

  /** Convert stored break minutes to { value, unit } for number + unit selects (caps at 24h total). */
  W.breakMinutesToInputFields = function breakMinutesToInputFields(breakMinutesTotal) {
    var capMin = W.BREAK_INPUT_MAX_HOURS * 60;
    var m = Number(breakMinutesTotal) || 0;
    if (m < 0) m = 0;
    if (m > capMin) m = capMin;
    if (m <= W.BREAK_INPUT_MAX_MINUTES) {
      return { value: m, unit: 'minutes' };
    }
    return { value: m / 60, unit: 'hours' };
  };

  /** Clamp break number input to allowed max for current unit; set input max/min attributes. */
  W.syncBreakInputLimits = function syncBreakInputLimits(valueInputId, unitSelectId) {
    var inp = document.getElementById(valueInputId);
    var sel = document.getElementById(unitSelectId);
    if (!inp || !sel) return;
    var isHours = sel.value === 'hours';
    var max = isHours ? W.BREAK_INPUT_MAX_HOURS : W.BREAK_INPUT_MAX_MINUTES;
    inp.setAttribute('min', '0');
    inp.setAttribute('max', String(max));
    var v = Number(inp.value);
    if (!isFinite(v) || v < 0) {
      inp.value = '0';
      return;
    }
    if (v > max) inp.value = String(max);
  };

  W.parseBreakToMinutes = function parseBreakToMinutes(value, unit) {
    var val = Number(value);
    if (!isFinite(val) || val < 0) val = 0;
    if (unit === 'hours') {
      val = Math.min(W.BREAK_INPUT_MAX_HOURS, val);
      return Math.round(val * 60);
    }
    val = Math.min(W.BREAK_INPUT_MAX_MINUTES, val);
    return Math.round(val);
  };

  /** Translate IANA region segment (before " – ") for display purposes. */
  function translateTimeZoneRegionName(segment) {
    if (!segment || typeof segment !== 'string') return segment;
    var trimmed = segment.trim();
    var lang = W.currentLanguage || 'en';
    var mapped = null;
    if (W.I18N && typeof W.I18N.resolve === 'function') {
      mapped = W.I18N.resolve('timezone.regionNames.' + trimmed, lang);
    }
    return (typeof mapped === 'string' && mapped.length) ? mapped : segment;
  }

  /** Get display label for a timezone (e.g. Europe/Berlin -> "Europe – Berlin"). */
  W.getTimeZoneLabel = function getTimeZoneLabel(tz) {
    if (!tz) {
      var defTz = W.DEFAULT_TIMEZONE;
      if (W.TIMEZONE_LABELS && W.TIMEZONE_LABELS[defTz] && W.I18N && typeof W.I18N.resolve === 'function') {
        var defLoc = W.I18N.resolve('timezone.displayLabels.' + defTz.replace(/\//g, '_'), W.currentLanguage || 'en');
        if (typeof defLoc === 'string' && defLoc.length) return defLoc;
      }
      return (W.TIMEZONE_LABELS && W.TIMEZONE_LABELS[defTz]) || defTz || '—';
    }
    if (W.TIMEZONE_LABELS && W.TIMEZONE_LABELS[tz] && W.I18N && typeof W.I18N.resolve === 'function') {
      var mapped = W.I18N.resolve('timezone.displayLabels.' + tz.replace(/\//g, '_'), W.currentLanguage || 'en');
      if (typeof mapped === 'string' && mapped.length) return mapped;
    }
    var raw = (W.TIMEZONE_LABELS && W.TIMEZONE_LABELS[tz]) || tz.replace(/_/g, ' ').replace(/\//g, ' – ');
    if (!raw || typeof raw !== 'string') return raw;
    var sep = ' – ';
    var idx = raw.indexOf(sep);
    if (idx === -1) return raw;
    var region = raw.slice(0, idx);
    var rest = raw.slice(idx + sep.length);
    return translateTimeZoneRegionName(region) + sep + rest;
  };

  /**
   * Get list of global timezones for dropdowns. Returns [{ value: IANA, label: string }].
   * Uses Intl.supportedValuesOf('timeZone') when available, else a fallback list.
   */
  W.getTimezoneList = function getTimezoneList() {
    var ids = [];
    if (typeof Intl !== 'undefined' && Intl.supportedValuesOf && typeof Intl.supportedValuesOf('timeZone') !== 'undefined') {
      try {
        ids = Intl.supportedValuesOf('timeZone').slice(0);
      } catch (e) {}
    }
    if (ids.length === 0) {
      ids = ['Africa/Cairo', 'Africa/Johannesburg', 'America/Chicago', 'America/Los_Angeles', 'America/New_York', 'America/Sao_Paulo', 'America/Toronto', 'Asia/Dubai', 'Asia/Hong_Kong', 'Asia/Jakarta', 'Asia/Kolkata', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney', 'Europe/Berlin', 'Europe/London', 'Europe/Paris', 'Europe/Zurich', 'Pacific/Auckland', 'UTC'];
    }
    return ids.map(function (id) {
      return { value: id, label: W.getTimeZoneLabel(id) };
    }).sort(function (a, b) { return a.label.localeCompare(b.label); });
  };

  /**
   * Human-readable label for an ISO week period key "YYYY-Www" (stats charts, PPT, etc.).
   * Uses i18n template statsSummary.weekLabel with {week} and {year}.
   */
  W.formatIsoWeekPeriodLabel = function formatIsoWeekPeriodLabel(key) {
    if (!key || typeof key !== 'string') return key || '';
    var m = key.match(/^(\d{4})-W(\d{1,2})$/);
    if (!m) return key;
    var year = m[1];
    var week = String(parseInt(m[2], 10));
    if (W.I18N && typeof W.I18N.t === 'function') {
      return W.I18N.t('statsSummary.weekLabel', { week: week, year: year });
    }
    return 'W' + String(m[2]).padStart(2, '0') + ' ' + year;
  };

  /**
   * Human-readable label for an ISO quarter key "YYYY-Qn" (stats charts, PPT, etc.).
   */
  W.formatIsoQuarterPeriodLabel = function formatIsoQuarterPeriodLabel(key) {
    if (!key || typeof key !== 'string') return key || '';
    var m = key.match(/^(\d{4})-Q(\d)$/);
    if (!m) return key;
    var lang = W.currentLanguage || 'en';
    var qp = (W.I18N && typeof W.I18N.resolve === 'function')
      ? W.I18N.resolve('statsSummary.quarterPrefix', lang)
      : null;
    if (typeof qp !== 'string' || qp.length === 0) qp = 'Q';
    return m[1] + ' ' + qp + m[2];
  };

  /**
   * Format a time (and optional date) from one timezone for display in another.
   * entryTz: IANA timezone of the entry (e.g. Europe/Berlin).
   * viewTz: IANA timezone for display, or '' to show as stored (no conversion).
   * Returns formatted time string "HH:mm – HH:mm" for clock in/out, or single "HH:mm".
   */
  W.formatTimeInZone = function formatTimeInZone(dateStr, timeStr, entryTz, viewTz) {
    if (!dateStr || !timeStr) return timeStr || '—';
    entryTz = entryTz || W.DEFAULT_TIMEZONE;
    if (!viewTz || viewTz === entryTz) return timeStr;
    var DateTime = (typeof window !== 'undefined' && window.luxon && window.luxon.DateTime) || (typeof luxon !== 'undefined' && luxon && luxon.DateTime) || (typeof globalThis !== 'undefined' && globalThis.luxon && globalThis.luxon.DateTime);
    if (!DateTime) return timeStr;
    var normalized = (typeof W.normalizeTimeToHHmm === 'function') ? W.normalizeTimeToHHmm(timeStr) : timeStr;
    if (!normalized) return timeStr;
    try {
      var dt = DateTime.fromFormat(dateStr + ' ' + normalized, 'yyyy-MM-dd HH:mm', { zone: entryTz });
      if (!dt.isValid) return timeStr;
      var inView = dt.setZone(viewTz);
      return inView.toFormat('HH:mm');
    } catch (e) {
      return timeStr;
    }
  };

  /** Format clock in and clock out for display, optionally in a view timezone. */
  W.formatClockInOutInZone = function formatClockInOutInZone(entry, viewTz) {
    var entryTz = entry.timezone || W.DEFAULT_TIMEZONE;
    var cin = entry.clockIn || '';
    var cout = entry.clockOut || '';
    if (!viewTz || viewTz === entryTz) return (cin || '—') + ' – ' + (cout || '—');
    var DateTime = (typeof window !== 'undefined' && window.luxon && window.luxon.DateTime) || (typeof luxon !== 'undefined' && luxon && luxon.DateTime) || (typeof globalThis !== 'undefined' && globalThis.luxon && globalThis.luxon.DateTime);
    if (!DateTime) return (cin || '—') + ' – ' + (cout || '—');
    var normIn = (typeof W.normalizeTimeToHHmm === 'function') ? W.normalizeTimeToHHmm(cin) : cin;
    var normOut = (typeof W.normalizeTimeToHHmm === 'function') ? W.normalizeTimeToHHmm(cout) : cout;
    if (!entry.date || !normIn || !normOut) return (cin || '—') + ' – ' + (cout || '—');
    try {
      var dtIn = DateTime.fromFormat(entry.date + ' ' + normIn, 'yyyy-MM-dd HH:mm', { zone: entryTz });
      var dtOut = DateTime.fromFormat(entry.date + ' ' + normOut, 'yyyy-MM-dd HH:mm', { zone: entryTz });
      if (!dtIn.isValid || !dtOut.isValid) return (cin || '—') + ' – ' + (cout || '—');
      var inView = dtIn.setZone(viewTz);
      var outView = dtOut.setZone(viewTz);
      var outStr = outView.toFormat('HH:mm');
      if (inView.toISODate() !== outView.toISODate()) outStr += ' (+1)';
      return inView.toFormat('HH:mm') + ' – ' + outStr;
    } catch (e) {
      return (cin || '—') + ' – ' + (cout || '—');
    }
  };

  /**
   * Get entry date and clock in/out converted to a view timezone for display.
   * Returns { viewDate: 'YYYY-MM-DD', viewClockIn: 'HH:mm', viewClockOut: 'HH:mm', clockOutNextDay: boolean }
   * or null if no viewTz or no conversion (use entry's own date/times).
   */
  W.formatEntryInViewZone = function formatEntryInViewZone(entry, viewTz) {
    if (!viewTz || !entry.date) return null;
    var entryTz = entry.timezone || W.DEFAULT_TIMEZONE;
    if (viewTz === entryTz) return null;
    var DateTime = (typeof window !== 'undefined' && window.luxon && window.luxon.DateTime) || (typeof luxon !== 'undefined' && luxon && luxon.DateTime) || (typeof globalThis !== 'undefined' && globalThis.luxon && globalThis.luxon.DateTime);
    if (!DateTime) return null;
    var normIn = (typeof W.normalizeTimeToHHmm === 'function') ? W.normalizeTimeToHHmm(entry.clockIn || '00:00') : (entry.clockIn || '00:00');
    var normOut = (typeof W.normalizeTimeToHHmm === 'function') ? W.normalizeTimeToHHmm(entry.clockOut || '23:59') : (entry.clockOut || '23:59');
    try {
      var dtIn = DateTime.fromFormat(entry.date + ' ' + normIn, 'yyyy-MM-dd HH:mm', { zone: entryTz });
      var dtOut = DateTime.fromFormat(entry.date + ' ' + normOut, 'yyyy-MM-dd HH:mm', { zone: entryTz });
      if (!dtIn.isValid) return null;
      var inView = dtIn.setZone(viewTz);
      var outView = dtOut.isValid ? dtOut.setZone(viewTz) : inView;
      var clockOutNextDay = inView.toISODate() !== outView.toISODate();
      return {
        viewDate: inView.toFormat('yyyy-MM-dd'),
        viewClockIn: inView.toFormat('HH:mm'),
        viewClockOut: outView.toFormat('HH:mm'),
        clockOutNextDay: clockOutNextDay
      };
    } catch (e) {
      return null;
    }
  };
})(window.WorkHours);
