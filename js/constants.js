/**
 * Constants and configuration.
 * No dependencies.
 */
(function (W) {
  'use strict';
  W.STORAGE_KEY = 'workingHoursData';
  W.DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  W.NON_WORK_DEFAULTS = { breakMinutes: 60, location: 'Anywhere', clockIn: '09:00', clockOut: '18:00' };
  W.STANDARD_WORK_MINUTES_PER_DAY = 8 * 60;
  /** Default timezone for all entries: Germany, Berlin (IANA: Europe/Berlin). */
  W.DEFAULT_TIMEZONE = 'Europe/Berlin';
  /** Human-readable labels for timezone display. */
  W.TIMEZONE_LABELS = {
    'Europe/Berlin': 'Germany, Berlin',
    'UTC': 'UTC'
  };
})(window.WorkHours = window.WorkHours || {});
