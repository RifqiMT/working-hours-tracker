/**
 * Clock in / clock out.
 * Depends: entries, time, render.
 */
(function (W) {
  'use strict';
  W.clockIn = function clockIn() {
    const selectedDate = document.getElementById('entryDate').value || new Date().toISOString().slice(0, 10);
    W.setLastClock({ action: 'in', time: W.nowTime(), date: selectedDate });
    document.getElementById('entryDate').value = selectedDate;
    document.getElementById('entryClockIn').value = W.nowTime();
    document.getElementById('entryStatus').value = 'work';
    if (typeof W.syncEntryLocationForStatus === 'function') W.syncEntryLocationForStatus();
    if (typeof W.updateEntryDateDuplicateHint === 'function') W.updateEntryDateDuplicateHint();
    var msg = (W.I18N && W.I18N.t) ? W.I18N.t('clock.statusClockedIn', { time: W.nowTime() }) : ('Clocked in at ' + W.nowTime());
    var statusWrap = document.getElementById('clockStatus').parentElement;
    if (statusWrap) {
      statusWrap.classList.remove('is-clock-out');
      statusWrap.classList.add('is-clock-in');
    }
    document.getElementById('clockStatus').textContent = msg;
  };
  W.clockOut = function clockOut() {
    const last = W.getLastClock();
    const selectedDate = document.getElementById('entryDate').value || new Date().toISOString().slice(0, 10);
    const clockInEl = document.getElementById('entryClockIn');
    const clockOutEl = document.getElementById('entryClockOut');
    document.getElementById('entryDate').value = selectedDate;
    clockOutEl.value = W.nowTime();
    document.getElementById('entryStatus').value = 'work';
    if (typeof W.syncEntryLocationForStatus === 'function') W.syncEntryLocationForStatus();
    if (typeof W.updateEntryDateDuplicateHint === 'function') W.updateEntryDateDuplicateHint();
    if (last && last.action === 'in' && last.date === selectedDate && !(clockInEl.value || '').trim()) {
      clockInEl.value = last.time;
    }
    var msg = (W.I18N && W.I18N.t) ? W.I18N.t('clock.statusClockOutSet', { time: W.nowTime() }) : ('Clocked out at ' + W.nowTime());
    var statusWrap = document.getElementById('clockStatus').parentElement;
    if (statusWrap) {
      statusWrap.classList.remove('is-clock-in');
      statusWrap.classList.add('is-clock-out');
    }
    document.getElementById('clockStatus').textContent = msg;
  };
})(window.WorkHours);
