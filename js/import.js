/**
 * CSV and JSON import. Merges with existing entries and deduplicates by entry date (one entry per date).
 * Depends: time, entries, constants.
 */
(function (W) {
  'use strict';

  /** Merge incoming entries into existing.
   * - Primary key: entry id (if present).
   * - Fallback key: entry date.
   * - If the same id appears multiple times, keep the row with the latest updatedAt (or createdAt when updatedAt is missing).
   */
  function mergeEntries(existing, incoming) {
    function makeKey(e) {
      if (e && e.id) return 'id:' + e.id;
      return 'date:' + (e && e.date ? e.date : '');
    }
    function getTimestamp(e) {
      if (!e) return 0;
      var t = e.updatedAt || e.createdAt;
      if (!t) return 0;
      var d = new Date(t);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    }
    var map = {};
    existing.forEach(function (e) {
      var k = makeKey(e);
      map[k] = {
        id: e.id,
        date: e.date,
        clockIn: e.clockIn,
        clockOut: e.clockOut,
        breakMinutes: e.breakMinutes,
        dayStatus: e.dayStatus,
        location: e.location,
        description: e.description,
        timezone: e.timezone,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt
      };
    });
    var nowIso = new Date().toISOString();
    incoming.forEach(function (e) {
      var k = makeKey(e);
      var current = map[k] || {};
      var existingId = current.id;
      var baseCreated = current.createdAt || e.createdAt || nowIso;
      var updatedAt = nowIso;
      // If there is already an entry with this key, only replace if incoming is newer.
      if (map[k]) {
        var curTs = getTimestamp(current);
        var incomingTs = getTimestamp(e) || (new Date(nowIso)).getTime();
        if (incomingTs < curTs) {
          return;
        }
      }
      map[k] = {
        id: existingId || e.id || W.generateId(),
        date: e.date,
        clockIn: e.clockIn,
        clockOut: e.clockOut,
        breakMinutes: e.breakMinutes != null ? e.breakMinutes : 0,
        dayStatus: ['work', 'sick', 'holiday', 'vacation'].indexOf(e.dayStatus) >= 0 ? e.dayStatus : 'work',
        location: ['WFO', 'WFH', 'AW', 'Anywhere'].indexOf(e.location) >= 0 ? (e.location === 'AW' ? 'Anywhere' : e.location) : 'WFO',
        description: (e.description || '').trim(),
        timezone: e.timezone && String(e.timezone).trim() ? e.timezone : (W.DEFAULT_TIMEZONE || 'Europe/Berlin'),
        createdAt: baseCreated,
        updatedAt: updatedAt
      };
    });
    return Object.keys(map).map(function (k) {
      var o = map[k];
      return {
        id: o.id,
        date: o.date,
        clockIn: o.clockIn,
        clockOut: o.clockOut,
        breakMinutes: o.breakMinutes,
        dayStatus: o.dayStatus,
        location: o.location,
        description: o.description,
        timezone: o.timezone,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt
      };
    }).sort(function (a, b) {
      return (a.date || '').localeCompare(b.date || '');
    });
  }

  /** YYYY-MM-DD, M/D/YY (export), D/M/YY when first field > 12, or D.M.YYYY */
  function padYmd(y, mo, d) {
    return String(y) + '-' + String(mo).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  }

  function normalizeImportDateCell(raw) {
    var s = (raw == null ? '' : String(raw)).trim();
    if (!s) return '';
    var iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return iso[1] + '-' + iso[2] + '-' + iso[3];
    var dot = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
    if (dot) {
      var p1 = parseInt(dot[1], 10);
      var p2 = parseInt(dot[2], 10);
      var y = parseInt(dot[3], 10);
      if (isNaN(p1) || isNaN(p2) || isNaN(y)) return '';
      if (y < 100) y += 2000;
      if (p1 > 12) return padYmd(y, p2, p1);
      if (p2 > 12) return padYmd(y, p1, p2);
      return padYmd(y, p2, p1);
    }
    if (s.indexOf('/') >= 0) {
      var parts = s.split('/');
      if (parts.length >= 3) {
        var a = parseInt(parts[0], 10);
        var b = parseInt(parts[1], 10);
        if (!isNaN(a) && !isNaN(b) && a > 12 && b <= 12) {
          var yy = parseInt(parts[2], 10);
          if (!isNaN(yy)) {
            if (yy < 100) yy += 2000;
            return padYmd(yy, b, a);
          }
        }
      }
    }
    return W.parseMDY(s);
  }

  function findDateColumnIndex(header) {
    var exact = header.findIndex(function (h) {
      var t = String(h).trim().toLowerCase();
      return t === 'date' || t === 'entry date' || t === 'work date';
    });
    if (exact >= 0) return exact;
    return header.findIndex(function (h) {
      var t = String(h).trim().toLowerCase();
      if (t.indexOf('date') < 0) return false;
      if (/\bupdated\b/i.test(h) || /\bcreated\b/i.test(h)) return false;
      return true;
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
    var text = (csvText || '').replace(/^\uFEFF/, '');
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (lines.length < 2) return { imported: 0, errors: ['CSV has no data rows'] };
    var header = parseCsvLine(lines[0]);
    var profileCol = header.findIndex(function (h) { return /^\s*profile\s*$/i.test(h); });
    if (profileCol < 0) profileCol = header.findIndex(function (h) { return /profile/i.test(h) && !/profile\s*id/i.test(h); });
    var profileIdCol = header.findIndex(function (h) { return /profile\s*id/i.test(h); });
    var roleCol = header.findIndex(function (h) { return /^\s*role\s*$/i.test(h); });
    if (roleCol < 0) roleCol = header.findIndex(function (h) { return /role/i.test(h); });
    var quotaCol = header.findIndex(function (h) { return /vacation\s*quota/i.test(h) || /vacation\s*quota\s*\(year\)/i.test(h); });
    var dateCol = findDateColumnIndex(header);
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

    var entryIdCol = header.findIndex(function (h) { return /entry\s*id/i.test(h); });
    var createdAtCol = header.findIndex(function (h) { return /created\s*at/i.test(h); });
    var updatedAtCol = header.findIndex(function (h) { return /updated\s*at/i.test(h); });

    var importedByProfile = {};
    var metaByProfile = {};
    var errors = [];
    for (var i = 1; i < lines.length; i++) {
      var row = parseCsvLine(lines[i]);
      var dateStr = row[dateCol];
      if (!dateStr) continue;
      var date = normalizeImportDateCell(dateStr);
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
      var profileName = profileCol >= 0 && row[profileCol] ? String(row[profileCol]).trim() : (W.getProfile ? W.getProfile() : 'Default');
      if (!profileName) profileName = 'Default';
      var profileId = profileIdCol >= 0 && row[profileIdCol] ? String(row[profileIdCol]).trim() : profileName;
      var role = roleCol >= 0 && row[roleCol] ? String(row[roleCol]).trim() : '';
      var quotaVal = quotaCol >= 0 && row[quotaCol] ? String(row[quotaCol]).trim() : '';
      var yearKey = date.slice(0, 4);
      if (!metaByProfile[profileName]) {
        metaByProfile[profileName] = { id: profileId, role: role, quotas: {} };
      } else {
        if (!metaByProfile[profileName].id && profileId) metaByProfile[profileName].id = profileId;
        if (!metaByProfile[profileName].role && role) metaByProfile[profileName].role = role;
      }
      if (quotaVal && yearKey) {
        var q = parseInt(quotaVal, 10);
        if (!isNaN(q) && q >= 0) {
          metaByProfile[profileName].quotas[yearKey] = q;
        }
      }
      if (!importedByProfile[profileName]) importedByProfile[profileName] = [];
      importedByProfile[profileName].push({
        id: entryIdCol >= 0 ? (row[entryIdCol] || '').trim() || undefined : undefined,
        date: date,
        clockIn: clockIn || undefined,
        clockOut: clockOut || undefined,
        breakMinutes: breakMin,
        dayStatus: status,
        location: location,
        description: description,
        timezone: tz,
        createdAt: createdAtCol >= 0 ? (row[createdAtCol] || '').trim() || undefined : undefined,
        updatedAt: updatedAtCol >= 0 ? (row[updatedAtCol] || '').trim() || undefined : undefined
      });
    }
    var profileNames = Object.keys(importedByProfile);
    if (!profileNames.length) {
      return { imported: 0, profiles: 0, errors: errors.length ? errors : ['No valid rows to import'] };
    }
    var totalImported = 0;
    profileNames.forEach(function (pName) {
      var allData = W.getData();
      var meta = metaByProfile[pName] || {};
      if (!allData.profileMeta) allData.profileMeta = {};
      if (!allData.profileMeta[pName]) allData.profileMeta[pName] = {};
      if (meta.id) allData.profileMeta[pName].id = meta.id;
      if (meta.role) allData.profileMeta[pName].role = meta.role;
      if (meta.quotas && Object.keys(meta.quotas).length) {
        if (!allData.vacationDaysByProfile) allData.vacationDaysByProfile = {};
        if (!allData.vacationDaysByProfile[pName]) allData.vacationDaysByProfile[pName] = {};
        Object.keys(meta.quotas).forEach(function (yearKey) {
          allData.vacationDaysByProfile[pName][yearKey] = meta.quotas[yearKey];
        });
      }
      W.setData(allData);
      totalImported += importEntriesIntoProfile(pName, importedByProfile[pName]);
    });
    if (typeof W.refreshProfileSelect === 'function') W.refreshProfileSelect();
    if (typeof W.refreshProfileRoleInput === 'function') W.refreshProfileRoleInput();
    if (typeof W.renderEntries === 'function') W.renderEntries();
    if (typeof W.syncCalendarFromFilters === 'function') W.syncCalendarFromFilters();
    if (typeof W.renderCalendar === 'function') W.renderCalendar();
    if (typeof W.renderStatsBox === 'function') W.renderStatsBox();
    return { imported: totalImported, profiles: profileNames.length, errors: errors };
  };

  function showImportToast(imported, profiles, filename, format, durationSeconds) {
    if (imported < 1 || !filename) return;
    var profileLabel = (W.I18N && W.I18N.t) ? (profiles === 1 ? W.I18N.t('common.profileLabel') : W.I18N.t('common.profilesLabel')) : (profiles === 1 ? 'profile' : 'profiles');
    var durationStr = durationSeconds < 1 ? durationSeconds.toFixed(2) : durationSeconds.toFixed(1);
    var msg = (W.I18N && W.I18N.t)
      ? W.I18N.t('import.toastMessage', { imported: imported, profiles: profiles, profileLabel: profileLabel, filename: filename, format: format, duration: durationStr })
      : ('Imported ' + imported + ' entries across ' + profiles + ' ' + profileLabel + ' from "' + filename + '" (' + format + ') in ' + durationStr + ' s.');
    if (typeof W.showToast === 'function') W.showToast(msg, 'success');
  }

  function isLikelyCsvFile(file) {
    if (!file || !file.name) return false;
    var lower = file.name.toLowerCase();
    if (lower.endsWith('.csv')) return true;
    var t = (file.type || '').toLowerCase();
    if (t.indexOf('csv') >= 0) return true;
    if (t === 'text/plain' || t === 'application/octet-stream' || t === '') return lower.endsWith('.csv');
    return false;
  }

  function isLikelyJsonFile(file) {
    if (!file || !file.name) return false;
    var lower = file.name.toLowerCase();
    if (lower.endsWith('.json')) return true;
    var t = (file.type || '').toLowerCase();
    return t.indexOf('json') >= 0;
  }

  W.handleImportCsv = function handleImportCsv(file) {
    if (!file || !isLikelyCsvFile(file)) {
      return Promise.resolve({ imported: 0, profiles: 0, errors: [(W.I18N && W.I18N.t) ? W.I18N.t('toasts.pleaseChooseCsv') : 'Please choose a CSV file'] });
    }
    var startMs = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onload = function () {
        var result = W.importFromCsv(reader.result || '');
        var endMs = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
        var durationSeconds = (endMs - startMs) / 1000;
        if (result.imported > 0) showImportToast(result.imported, result.profiles != null ? result.profiles : 1, file.name, 'CSV', durationSeconds);
        resolve(result);
      };
      reader.onerror = function () { resolve({ imported: 0, profiles: 0, errors: ['Failed to read file'] }); };
      reader.readAsText(file, 'UTF-8');
    });
  };

  function importEntriesIntoProfile(profileName, incoming) {
    var dataObj = W.getData();
    if (!Array.isArray(dataObj[profileName])) dataObj[profileName] = [];
    var merged = mergeEntries(dataObj[profileName], incoming);
    dataObj[profileName] = merged;
    W.setData(dataObj);
    try {
      if (profileName && typeof profileName === 'string') {
        localStorage.setItem('workingHoursLastProfile', profileName);
      }
    } catch (_) {}
    if (typeof W.ensureProfileId === 'function') W.ensureProfileId(profileName);
    return merged.length;
  }

  W.importFromJson = function importFromJson(jsonText) {
    var data;
    try {
      data = JSON.parse(jsonText);
    } catch (err) {
      return { imported: 0, profiles: 0, errors: ['Invalid JSON'] };
    }
    // Support full-data shape produced by global save/sync:
    // { exportedAt, data: { profileName: [...entries], vacationDaysByProfile, profileMeta, ... } }
    if (!Array.isArray(data) && data && data.data && typeof data.data === 'object' && typeof W.mergeWorkingHoursData === 'function') {
      var totalEntries = 0;
      var profileCount = 0;
      Object.keys(data.data).forEach(function (key) {
        var value = data.data[key];
        if (key === 'vacationDaysByProfile' || key === 'profileMeta' || (key && key.indexOf('lastClock_') === 0)) return;
        if (Array.isArray(value)) {
          profileCount += 1;
          totalEntries += value.length;
        }
      });
      var ok = W.mergeWorkingHoursData(data);
      if (!ok) return { imported: 0, profiles: 0, errors: ['JSON full-data format not recognized'] };
      if (typeof W.refreshProfileSelect === 'function') W.refreshProfileSelect();
      if (typeof W.refreshProfileRoleInput === 'function') W.refreshProfileRoleInput();
      if (typeof W.renderEntries === 'function') W.renderEntries();
      if (typeof W.syncCalendarFromFilters === 'function') W.syncCalendarFromFilters();
      if (typeof W.renderCalendar === 'function') W.renderCalendar();
      if (typeof W.renderStatsBox === 'function') W.renderStatsBox();
      return { imported: totalEntries, profiles: profileCount, errors: [] };
    }
    // Per-profile export/import shape: { profile, exportedAt, entries: [...] } or plain entries array
    var list = Array.isArray(data) ? data : (data && data.entries ? data.entries : null);
    if (!list || !Array.isArray(list)) return { imported: 0, profiles: 0, errors: ['JSON must contain an \"entries\" array, be an array of entries, or match the global save format'] };
    var errors = [];
    var targetProfile = (data && typeof data.profile === 'string' && data.profile.trim()) ? data.profile.trim() : W.getProfile();
    // Apply profile-level metadata when present (role, vacation quotas, id)
    if (data && typeof data === 'object') {
      var all = W.getData();
      // profileMeta: role and optional id
      if (!all.profileMeta) all.profileMeta = {};
      if (!all.profileMeta[targetProfile]) all.profileMeta[targetProfile] = {};
      if (data.role != null) {
        all.profileMeta[targetProfile].role = String(data.role).trim();
      }
      if (data.profileId != null) {
        all.profileMeta[targetProfile].id = String(data.profileId).trim();
      }
      // vacationDaysByProfile: per-year quotas
      if (data.vacationDaysByYear && typeof data.vacationDaysByYear === 'object') {
        if (!all.vacationDaysByProfile) all.vacationDaysByProfile = {};
        if (!all.vacationDaysByProfile[targetProfile]) all.vacationDaysByProfile[targetProfile] = {};
        Object.keys(data.vacationDaysByYear).forEach(function (yearKey) {
          var val = data.vacationDaysByYear[yearKey];
          var n = parseInt(val, 10);
          if (!isNaN(n) && n >= 0) {
            all.vacationDaysByProfile[targetProfile][yearKey] = n;
          }
        });
      }
      W.setData(all);
    }
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
      return {
        id: e.id,
        date: date,
        clockIn: clockIn,
        clockOut: clockOut,
        breakMinutes: breakMin,
        dayStatus: status,
        location: loc,
        description: desc,
        timezone: tz,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt
      };
    }).filter(Boolean);
    if (incoming.length === 0) return { imported: 0, profiles: 0, errors: errors.length ? errors : ['No valid entries in JSON'] };
    var total = importEntriesIntoProfile(targetProfile, incoming);
    if (typeof W.refreshProfileSelect === 'function') W.refreshProfileSelect();
    if (typeof W.refreshProfileRoleInput === 'function') W.refreshProfileRoleInput();
    if (typeof W.renderEntries === 'function') W.renderEntries();
    if (typeof W.syncCalendarFromFilters === 'function') W.syncCalendarFromFilters();
    if (typeof W.renderCalendar === 'function') W.renderCalendar();
    if (typeof W.renderStatsBox === 'function') W.renderStatsBox();
    return { imported: total, profiles: 1, errors: errors };
  };

  W.handleImportJson = function handleImportJson(file) {
    if (!file || !isLikelyJsonFile(file)) {
      return Promise.resolve({ imported: 0, profiles: 0, errors: [(W.I18N && W.I18N.t) ? W.I18N.t('toasts.pleaseChooseJson') : 'Please choose a JSON file'] });
    }
    var startMs = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onload = function () {
        var result = W.importFromJson(reader.result || '');
        var endMs = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
        var durationSeconds = (endMs - startMs) / 1000;
        if (result.imported > 0) showImportToast(result.imported, result.profiles != null ? result.profiles : 1, file.name, 'JSON', durationSeconds);
        resolve(result);
      };
      reader.onerror = function () { resolve({ imported: 0, profiles: 0, errors: ['Failed to read file'] }); };
      reader.readAsText(file, 'UTF-8');
    });
  };
})(window.WorkHours);
