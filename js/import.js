/**
 * CSV and JSON import. Merges with existing entries and deduplicates by date + clockIn.
 * Depends: time, entries, constants.
 */
(function (W) {
  'use strict';

  /** Merge incoming entries into existing; key by date+clockIn to avoid duplicates. Incoming wins on conflict. */
  function mergeEntries(existing, incoming) {
    var key = function (e) { return (e.date || '') + '|' + (e.clockIn || ''); };
    var map = {};
    existing.forEach(function (e) { map[key(e)] = { id: e.id, date: e.date, clockIn: e.clockIn, clockOut: e.clockOut, breakMinutes: e.breakMinutes, dayStatus: e.dayStatus, location: e.location, description: e.description, timezone: e.timezone }; });
    incoming.forEach(function (e) {
      var k = key(e);
      var existingId = map[k] && map[k].id;
      map[k] = {
        id: existingId || W.generateId(),
        date: e.date,
        clockIn: e.clockIn,
        clockOut: e.clockOut,
        breakMinutes: e.breakMinutes != null ? e.breakMinutes : 0,
        dayStatus: ['work', 'sick', 'holiday', 'vacation'].indexOf(e.dayStatus) >= 0 ? e.dayStatus : 'work',
        location: ['WFO', 'WFH', 'AW', 'Anywhere'].indexOf(e.location) >= 0 ? (e.location === 'AW' ? 'Anywhere' : e.location) : 'WFO',
        description: (e.description || '').trim(),
        timezone: e.timezone && String(e.timezone).trim() ? e.timezone : (W.DEFAULT_TIMEZONE || 'Europe/Berlin')
      };
    });
    return Object.keys(map).sort().map(function (k) {
      var o = map[k];
      return { id: o.id, date: o.date, clockIn: o.clockIn, clockOut: o.clockOut, breakMinutes: o.breakMinutes, dayStatus: o.dayStatus, location: o.location, description: o.description, timezone: o.timezone };
    });
  }

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
    var descriptionCol = header.findIndex(function (h) { return /description/i.test(h); });
    var timezoneCol = header.findIndex(function (h) { return /timezone/i.test(h); });
    if (dateCol < 0 || clockInCol < 0 || clockOutCol < 0) {
      return { imported: 0, errors: ['CSV must have Date, Clock In, and Clock Out columns'] };
    }
    if (breakCol < 0) breakCol = -1;
    if (statusCol < 0) statusCol = -1;
    if (locationCol < 0) locationCol = -1;
    if (descriptionCol < 0) descriptionCol = -1;
    if (timezoneCol < 0) timezoneCol = -1;

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
      location = ['WFO', 'WFH', 'AW', 'Anywhere'].indexOf(location) >= 0 ? (location === 'AW' ? 'Anywhere' : location) : 'WFO';
      var description = (descriptionCol >= 0 ? (row[descriptionCol] || '').trim() : '') || '';
      var tz = (timezoneCol >= 0 && row[timezoneCol]) ? String(row[timezoneCol]).trim() : '';
      if (!tz) tz = W.DEFAULT_TIMEZONE || 'Europe/Berlin';
      imported.push({
        id: W.generateId(),
        date: date,
        clockIn: clockIn || undefined,
        clockOut: clockOut || undefined,
        breakMinutes: breakMin,
        dayStatus: status,
        location: location,
        description: description,
        timezone: tz
      });
    }
    if (imported.length === 0) {
      return { imported: 0, errors: errors.length ? errors : ['No valid rows to import'] };
    }
    var existing = W.getEntries();
    var merged = mergeEntries(existing, imported);
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

  W.importFromJson = function importFromJson(jsonText) {
    var data;
    try {
      data = JSON.parse(jsonText);
    } catch (err) {
      return { imported: 0, errors: ['Invalid JSON'] };
    }
    var list = Array.isArray(data) ? data : (data && data.entries ? data.entries : null);
    if (!list || !Array.isArray(list)) return { imported: 0, errors: ['JSON must contain an "entries" array or be an array of entries'] };
    var errors = [];
    var incoming = list.map(function (e, i) {
      var date = (e.date || '').toString().trim();
      if (!date) { errors.push('Entry ' + (i + 1) + ': missing date'); return null; }
      var clockIn = (e.clockIn || '').toString().trim();
      var clockOut = (e.clockOut || '').toString().trim();
      var breakMin = e.breakMinutes != null ? parseInt(e.breakMinutes, 10) : 0;
      if (isNaN(breakMin)) breakMin = 0;
      var status = (e.dayStatus || e.status || 'work').toString().toLowerCase();
      status = ['work', 'sick', 'holiday', 'vacation'].indexOf(status) >= 0 ? status : 'work';
      var loc = (e.location || 'WFO').toString();
      loc = ['WFO', 'WFH', 'AW', 'Anywhere'].indexOf(loc) >= 0 ? (loc === 'AW' ? 'Anywhere' : loc) : 'WFO';
      var desc = (e.description || '').toString().trim();
      var tz = (e.timezone || '').toString().trim() || (W.DEFAULT_TIMEZONE || 'Europe/Berlin');
      return { date: date, clockIn: clockIn, clockOut: clockOut, breakMinutes: breakMin, dayStatus: status, location: loc, description: desc, timezone: tz };
    }).filter(Boolean);
    if (incoming.length === 0) return { imported: 0, errors: errors.length ? errors : ['No valid entries in JSON'] };
    var existing = W.getEntries();
    var merged = mergeEntries(existing, incoming);
    W.setEntries(merged);
    return { imported: incoming.length, errors: errors };
  };

  W.handleImportJson = function handleImportJson(file) {
    if (!file || !file.name.toLowerCase().endsWith('.json')) {
      return Promise.resolve({ imported: 0, errors: ['Please choose a JSON file'] });
    }
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onload = function () {
        var result = W.importFromJson(reader.result || '');
        resolve(result);
      };
      reader.onerror = function () { resolve({ imported: 0, errors: ['Failed to read file'] }); };
      reader.readAsText(file, 'UTF-8');
    });
  };
})(window.WorkHours);
