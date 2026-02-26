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
    document.getElementById('clockStatus').textContent = 'Clocked in at ' + W.nowTime() + ' for ' + W.formatDateWithDay(selectedDate) + '. You can adjust times manually, then click Save entry.';
  };
  W.clockOut = function clockOut() {
    const last = W.getLastClock();
    const selectedDate = document.getElementById('entryDate').value || new Date().toISOString().slice(0, 10);
    const clockInEl = document.getElementById('entryClockIn');
    const clockOutEl = document.getElementById('entryClockOut');
    document.getElementById('entryDate').value = selectedDate;
    clockOutEl.value = W.nowTime();
    document.getElementById('entryStatus').value = 'work';
    if (last && last.action === 'in' && last.date === selectedDate && !(clockInEl.value || '').trim()) {
      clockInEl.value = last.time;
    }
    document.getElementById('clockStatus').textContent = 'Clock out time set for ' + W.formatDateWithDay(selectedDate) + '. You can adjust times manually, then click Save entry to store.';
  };
})(window.WorkHours);
