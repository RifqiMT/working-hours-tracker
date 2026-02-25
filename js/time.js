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
})(window.WorkHours);
