/**
 * CSV import (same format as export: Date M/D/YY, Clock In, Clock Out, Break (min), Duration, Status, Location).
 * Depends: time, entries, constants.
 */
(function (W) {
  'use strict';

  function parseCsvLine(line) {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (inQuotes) {
        cur += c;
      } else if (c === ',') {
        out.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    out.push(cur.trim());
    return out;
  }

  /** Normalize clock-out after midnight (0:00, 0:30) to same-day 24:00, 24:30 so duration computes correctly. */
  function normalizeClockOut(clockIn, clockOut) {
    if (!clockOut || !clockIn) return clockOut || '';
    var out = String(clockOut).trim();
    var inM = W.parseTime(clockIn);
    var outM = W.parseTime(out);
    if (inM == null || outM == null) return out;
    if (outM < inM && outM <= 60 * 8) {
      var h = Math.floor(outM / 60);
      var m = outM % 60;
      return '24:' + String(m).padStart(2, '0');
    }
    return out;
  }

  W.importFromCsv = function importFromCsv(csvText) {
    var lines = csvText.split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (lines.length < 2) return { imported: 0, errors: ['CSV has no data rows'] };
    var header = parseCsvLine(lines[0]);
    var dateCol = header.findIndex(function (h) { return /date/i.test(h); });
    var clockInCol = header.findIndex(function (h) { return /clock\s*in/i.test(h); });
    var clockOutCol = header.findIndex(function (h) { return /clock\s*out/i.test(h); });
    var breakCol = header.findIndex(function (h) { return /break/i.test(h); });
    var statusCol = header.findIndex(function (h) { return /status/i.test(h); });
    var locationCol = header.findIndex(function (h) { return /location/i.test(h); });
    if (dateCol < 0 || clockInCol < 0 || clockOutCol < 0) {
      return { imported: 0, errors: ['CSV must have Date, Clock In, and Clock Out columns'] };
    }
    if (breakCol < 0) breakCol = -1;
    if (statusCol < 0) statusCol = -1;
    if (locationCol < 0) locationCol = -1;

    var imported = [];
    var errors = [];
    for (var i = 1; i < lines.length; i++) {
      var row = parseCsvLine(lines[i]);
      var dateStr = row[dateCol];
      if (!dateStr) continue;
      var date = W.parseMDY(dateStr);
      if (!date) {
        errors.push('Row ' + (i + 1) + ': invalid date "' + dateStr + '"');
        continue;
      }
      var clockIn = (row[clockInCol] || '').trim();
      var clockOut = (row[clockOutCol] || '').trim();
      clockOut = normalizeClockOut(clockIn, clockOut);
      var breakMin = breakCol >= 0 ? parseInt(row[breakCol], 10) : 0;
      if (isNaN(breakMin)) breakMin = 0;
      var status = (statusCol >= 0 ? row[statusCol] : 'work') || 'work';
      status = ['work', 'sick', 'holiday', 'vacation'].indexOf(status) >= 0 ? status : 'work';
      var location = (locationCol >= 0 ? row[locationCol] : 'WFO') || 'WFO';
      location = ['WFO', 'WFH', 'AW'].indexOf(location) >= 0 ? location : 'WFO';
      imported.push({
        id: W.generateId(),
        date: date,
        clockIn: clockIn || undefined,
        clockOut: clockOut || undefined,
        breakMinutes: breakMin,
        dayStatus: status,
        location: location
      });
    }
    if (imported.length === 0) {
      return { imported: 0, errors: errors.length ? errors : ['No valid rows to import'] };
    }
    var existing = W.getEntries();
    var byDate = {};
    existing.forEach(function (e) { byDate[e.date] = e; });
    imported.forEach(function (e) {
      byDate[e.date] = e;
    });
    var merged = Object.keys(byDate).sort().map(function (k) { return byDate[k]; });
    W.setEntries(merged);
    return { imported: imported.length, errors: errors };
  };

  W.handleImportCsv = function handleImportCsv(file) {
    if (!file || !file.type.match(/text\/csv|application\/csv|.*csv/)) {
      return Promise.resolve({ imported: 0, errors: ['Please choose a CSV file'] });
    }
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onload = function () {
        var result = W.importFromCsv(reader.result || '');
        resolve(result);
      };
      reader.onerror = function () { resolve({ imported: 0, errors: ['Failed to read file'] }); };
      reader.readAsText(file, 'UTF-8');
    });
  };
})(window.WorkHours);
