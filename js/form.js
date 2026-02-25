/**
 * Add/save entry form.
 * Depends: entries, time, constants, render.
 */
(function (W) {
  'use strict';
  W.getEntryFormValues = function getEntryFormValues() {
    var clockIn = document.getElementById('entryClockIn').value;
    var clockOut = document.getElementById('entryClockOut').value;
    var breakVal = Number(document.getElementById('entryBreak').value) || 0;
    var breakUnit = document.getElementById('entryBreakUnit').value;
    var location = document.getElementById('entryLocation').value;
    const dayStatus = document.getElementById('entryStatus').value;
    if (dayStatus !== 'work') {
      clockIn = W.NON_WORK_DEFAULTS.clockIn;
      clockOut = W.NON_WORK_DEFAULTS.clockOut;
      breakVal = 1;
      breakUnit = 'hours';
      location = W.NON_WORK_DEFAULTS.location;
    }
    return {
      date: document.getElementById('entryDate').value,
      clockIn: clockIn,
      clockOut: clockOut,
      breakMinutes: W.parseBreakToMinutes(breakVal, breakUnit),
      dayStatus: dayStatus,
      location: location
    };
  };
  W.applyNonWorkDefaultsToEntryForm = function applyNonWorkDefaultsToEntryForm() {
    document.getElementById('entryBreak').value = '1';
    document.getElementById('entryBreakUnit').value = 'hours';
    document.getElementById('entryLocation').value = W.NON_WORK_DEFAULTS.location;
    document.getElementById('entryClockIn').value = W.NON_WORK_DEFAULTS.clockIn;
    document.getElementById('entryClockOut').value = W.NON_WORK_DEFAULTS.clockOut;
  };
  W.handleSaveEntry = function handleSaveEntry() {
    const v = W.getEntryFormValues();
    if (!v.date) { alert('Please select a date.'); return; }
    const entries = W.getEntries();
    const existing = entries.find(function (e) { return e.date === v.date && e.clockIn === v.clockIn; });
    if (existing) {
      existing.clockOut = v.clockOut;
      existing.breakMinutes = v.breakMinutes;
      existing.dayStatus = v.dayStatus;
      existing.location = v.location;
    } else {
      entries.push({ id: W.generateId(), date: v.date, clockIn: v.clockIn || null, clockOut: v.clockOut || null, breakMinutes: v.breakMinutes, dayStatus: v.dayStatus, location: v.location });
    }
    W.setEntries(entries);
    W.renderEntries();
    W.setToday();
    document.getElementById('entryClockIn').value = '';
    document.getElementById('entryClockOut').value = '';
    document.getElementById('entryBreak').value = '0';
    document.getElementById('entryBreakUnit').value = 'minutes';
  };
})(window.WorkHours);
