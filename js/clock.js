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
    document.getElementById('entryClockOut').value = '';
    document.getElementById('entryStatus').value = 'work';
    document.getElementById('clockStatus').textContent = 'Clocked in at ' + W.nowTime() + ' for ' + W.formatDateWithDay(selectedDate) + '. Enter clock out and break, then click Save entry.';
  };
  W.clockOut = function clockOut() {
    const last = W.getLastClock();
    const selectedDate = document.getElementById('entryDate').value || new Date().toISOString().slice(0, 10);
    if (last && last.action === 'in' && last.date === selectedDate) {
      document.getElementById('entryDate').value = selectedDate;
      document.getElementById('entryClockIn').value = last.time;
      document.getElementById('entryClockOut').value = W.nowTime();
      document.getElementById('entryStatus').value = 'work';
      const entries = W.getEntries();
      const existing = entries.find(function (e) { return e.date === selectedDate && e.clockIn === last.time; });
      if (!existing) {
        const breakMins = W.parseBreakToMinutes(document.getElementById('entryBreak').value, document.getElementById('entryBreakUnit').value);
        entries.push({ id: W.generateId(), date: selectedDate, clockIn: last.time, clockOut: W.nowTime(), breakMinutes: breakMins, dayStatus: 'work', location: document.getElementById('entryLocation').value });
        W.setEntries(entries);
        W.setLastClock(null);
        W.renderEntries();
      }
      document.getElementById('clockStatus').textContent = 'Clocked out at ' + W.nowTime() + ' for ' + W.formatDateWithDay(selectedDate) + '. Entry saved.';
    } else {
      document.getElementById('entryClockOut').value = W.nowTime();
      document.getElementById('clockStatus').textContent = 'Clock out time set for ' + W.formatDateWithDay(selectedDate) + '. Click Save entry to store.';
    }
  };
})(window.WorkHours);
