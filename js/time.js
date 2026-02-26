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
    const h = Math.floor(m / 60);
    const min = Math.round(m % 60);
    return (h ? h + 'h ' : '') + (min ? min + 'm' : '');
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
    const day = W.DAY_NAMES[d.getDay()];
    const date = d.getDate();
    const month = d.toLocaleDateString('en', { month: 'short' });
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
  W.parseBreakToMinutes = function parseBreakToMinutes(value, unit) {
    const val = Number(value) || 0;
    return unit === 'hours' ? Math.round(val * 60) : Math.round(val);
  };

  /** Get display label for a timezone (e.g. Europe/Berlin -> "Europe - Berlin"). */
  W.getTimeZoneLabel = function getTimeZoneLabel(tz) {
    if (!tz) return (W.TIMEZONE_LABELS && W.TIMEZONE_LABELS[W.DEFAULT_TIMEZONE]) || W.DEFAULT_TIMEZONE || '—';
    return (W.TIMEZONE_LABELS && W.TIMEZONE_LABELS[tz]) || tz.replace(/_/g, ' ').replace(/\//g, ' – ');
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
