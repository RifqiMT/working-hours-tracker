/**
 * Global data save/sync (JSON).
 * Depends: storage (getData, setData), profile, entries.
 */
(function (W) {
  'use strict';

  function showToast(message, kind) {
    if (typeof W.showToast === 'function') {
      W.showToast(message, kind || 'info');
    }
  }

  function clone(obj) {
    return obj && typeof obj === 'object' ? JSON.parse(JSON.stringify(obj)) : obj;
  }

  /** Normalize entry.date to YYYY-MM-DD when possible so duplicates with ISO timestamps or padding merge correctly. */
  function canonicalEntryDate(e) {
    if (!e || e.date == null || e.date === '') return '';
    var raw = e.date;
    if (typeof raw === 'number' && isFinite(raw)) {
      var nd = new Date(raw);
      return isNaN(nd.getTime()) ? '' : nd.toISOString().slice(0, 10);
    }
    var s = String(raw).trim();
    if (!s) return '';
    var head = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (head) {
      var y = head[1];
      var mo = parseInt(head[2], 10);
      var da = parseInt(head[3], 10);
      if (mo >= 1 && mo <= 12 && da >= 1 && da <= 31) {
        return y + '-' + (mo < 10 ? '0' : '') + mo + '-' + (da < 10 ? '0' : '') + da;
      }
    }
    var parsed = new Date(s);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
    return s;
  }

  /** HH:mm (same rules as time.js); used for dedupe fingerprints and stable storage. */
  function normClockToHHmm(t) {
    if (t == null || t === '') return '';
    var parts = String(t).trim().split(':');
    var h = parseInt(parts[0], 10);
    var m = parts.length > 1 ? parseInt(parts[1], 10) : 0;
    if (isNaN(h)) return String(t).trim();
    var hh = Math.max(0, Math.min(23, h));
    var mm = Math.max(0, Math.min(59, isNaN(m) ? 0 : m));
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  }

  function parseTimeToMinutes(t) {
    if (typeof W.parseTime === 'function') {
      var pm = W.parseTime(t);
      if (pm != null && !isNaN(pm)) return pm;
    }
    if (t == null || t === '') return null;
    var parts = String(t).trim().split(':');
    var h = parseInt(parts[0], 10);
    var m = parts.length > 1 ? parseInt(parts[1], 10) : 0;
    if (isNaN(h)) return null;
    return Math.max(0, Math.min(23, h)) * 60 + (isNaN(m) ? 0 : Math.max(0, Math.min(59, m)));
  }

  /** Sort entries array ascending by entry date (oldest first). Uses date string comparison so YYYY-MM-DD orders correctly. */
  function sortEntriesByDateAsc(entries) {
    if (!Array.isArray(entries)) return entries;
    return entries.slice().sort(function (a, b) {
      var da = canonicalEntryDate(a) || (a && typeof a.date === 'string' ? a.date : '') || '';
      var db = canonicalEntryDate(b) || (b && typeof b.date === 'string' ? b.date : '') || '';
      return da.localeCompare(db);
    });
  }

  /** Build payload for save/sync: full dataset, all timeframes. Entry arrays sorted ascending by date. */
  function buildExportPayload() {
    var data = clone(W.getData());
    Object.keys(data).forEach(function (key) {
      if (key === 'vacationDaysByProfile' || key === 'profileMeta' || key.indexOf('lastClock_') === 0) return;
      if (Array.isArray(data[key])) data[key] = sortEntriesByDateAsc(data[key]);
    });
    return { exportedAt: new Date().toISOString(), data: data };
  }

  /** Full export payload for JSON/CSV export: all profiles, vacation, meta, entries sorted by date asc (including future). */
  W.getFullExportPayload = function getFullExportPayload() {
    return buildExportPayload();
  };

  /** Count total profiles and entries in a payload's data block. */
  function countEntriesInPayload(payload) {
    var data = payload && payload.data && typeof payload.data === 'object' ? payload.data : {};
    var profileCount = 0;
    var entryCount = 0;
    Object.keys(data).forEach(function (key) {
      if (key === 'vacationDaysByProfile' || key === 'profileMeta' || key.indexOf('lastClock_') === 0) return;
      if (Array.isArray(data[key])) {
        profileCount += 1;
        entryCount += data[key].length;
      }
    });
    return { profiles: profileCount, entries: entryCount };
  }

  // Merge and normalize entries for a single profile.
  // - Primary key: entry id (if present), else canonical calendar date (id-less rows).
  // - Same id / same canonical date (id-less): keep the row with the latest updatedAt/createdAt.
  // - Then collapse rows with the same workday fingerprint (canonical date + times + status + location + description);
  //   keep the newest. Handles clone rows with different ids or mixed date string formats.
  // - Sorted ascending by date (oldest first).
  function mergeEntriesArrays(existing, incoming) {
    var nowIso = new Date().toISOString();
    var nowMs = new Date(nowIso).getTime();
    function makeKey(e) {
      if (e && e.id) return 'id:' + e.id;
      var c = canonicalEntryDate(e);
      if (c) return 'date:' + c;
      return 'date_raw:' + String(e && e.date != null ? e.date : '');
    }
    function getTimestamp(e) {
      if (!e) return 0;
      var t = e.updatedAt || e.createdAt;
      if (!t) return 0;
      var d = new Date(t);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    }
    function earliestCreated(prev, e) {
      var a = prev && prev.createdAt;
      var b = e && e.createdAt;
      if (!a) return b || nowIso;
      if (!b) return a;
      var ta = new Date(a).getTime();
      var tb = new Date(b).getTime();
      if (isNaN(ta)) return b;
      if (isNaN(tb)) return a;
      return ta <= tb ? a : b;
    }
    function normalizeMergedEntry(prev, e, curTs, incomingTs) {
      var incomingWins = incomingTs >= curTs;
      var src = incomingWins ? e : prev;
      var other = incomingWins ? prev : e;
      var winMs = Math.max(curTs, incomingTs, 0);
      var updatedAtIso = winMs > 0 ? new Date(winMs).toISOString() : nowIso;
      var desc = (src && src.description != null ? String(src.description) : (other && other.description != null ? String(other.description) : '')).trim();
      var rawDate = (src && src.date) || (other && other.date);
      var dateNorm = canonicalEntryDate({ date: rawDate }) || rawDate;
      var rawIn = src && src.clockIn != null ? src.clockIn : (other && other.clockIn);
      var rawOut = src && src.clockOut != null ? src.clockOut : (other && other.clockOut);
      var nIn = normClockToHHmm(rawIn);
      var nOut = normClockToHHmm(rawOut);
      return {
        id: (src && src.id) || (other && other.id) || (typeof W.generateId === 'function' ? W.generateId() : undefined),
        date: dateNorm,
        clockIn: nIn || rawIn,
        clockOut: nOut || rawOut,
        breakMinutes: src && src.breakMinutes != null ? src.breakMinutes : (other && other.breakMinutes != null ? other.breakMinutes : 0),
        dayStatus: (function () {
          var ds = src && src.dayStatus;
          if (['work', 'sick', 'holiday', 'vacation'].indexOf(ds) >= 0) return ds;
          var po = other && other.dayStatus;
          if (['work', 'sick', 'holiday', 'vacation'].indexOf(po) >= 0) return po;
          return 'work';
        })(),
        location: (function () {
          var loc = src && src.location;
          if (['WFO', 'WFH', 'AW', 'Anywhere'].indexOf(loc) >= 0) return loc === 'AW' ? 'Anywhere' : loc;
          var lo2 = other && other.location;
          if (['WFO', 'WFH', 'AW', 'Anywhere'].indexOf(lo2) >= 0) return lo2 === 'AW' ? 'Anywhere' : lo2;
          return 'WFO';
        })(),
        description: desc,
        timezone: (src && src.timezone) || (other && other.timezone) || W.DEFAULT_TIMEZONE || 'Europe/Berlin',
        createdAt: earliestCreated(prev, e),
        updatedAt: updatedAtIso
      };
    }
    var map = {};
    (existing || []).forEach(function (e) {
      if (!e) return;
      map[makeKey(e)] = clone(e);
    });
    (incoming || []).forEach(function (e) {
      if (!e) return;
      var k = makeKey(e);
      var prev = map[k];
      if (prev) {
        var curTs = getTimestamp(prev);
        var incomingTs = getTimestamp(e) || nowMs;
        if (incomingTs < curTs) {
          return;
        }
        map[k] = normalizeMergedEntry(prev, e, curTs, incomingTs);
        return;
      }
      var incTs = getTimestamp(e) || 0;
      map[k] = normalizeMergedEntry({}, e, 0, incTs || nowMs);
    });
    var combined = Object.keys(map).map(function (key) { return map[key]; });
    function collapseToSingleEntryPerDate(entries) {
      var byDate = {};
      (entries || []).forEach(function (e) {
        if (!e) return;
        var canon = canonicalEntryDate(e) || String(e.date || '');
        var key = canon || ('__nodate__' + (e.id || ''));
        var cur = byDate[key];
        if (!cur) {
          var row = clone(e);
          row.date = canon || row.date;
          var ri = normClockToHHmm(row.clockIn);
          var ro = normClockToHHmm(row.clockOut);
          if (ri) row.clockIn = ri;
          if (ro) row.clockOut = ro;
          byDate[key] = row;
          return;
        }
        var ct = getTimestamp(cur);
        var et = getTimestamp(e) || nowMs;
        if (et > ct) {
          var rowWin = clone(e);
          rowWin.date = canon || rowWin.date;
          var wi = normClockToHHmm(rowWin.clockIn);
          var wo = normClockToHHmm(rowWin.clockOut);
          if (wi) rowWin.clockIn = wi;
          if (wo) rowWin.clockOut = wo;
          byDate[key] = rowWin;
        } else if (et === ct) {
          var su = String(e.updatedAt || e.createdAt || '');
          var cu = String(cur.updatedAt || cur.createdAt || '');
          if (su > cu) {
            var rowTie = clone(e);
            rowTie.date = canon || rowTie.date;
            var ti = normClockToHHmm(rowTie.clockIn);
            var to = normClockToHHmm(rowTie.clockOut);
            if (ti) rowTie.clockIn = ti;
            if (to) rowTie.clockOut = to;
            byDate[key] = rowTie;
          }
        }
      });
      return Object.keys(byDate).map(function (k) { return byDate[k]; });
    }
    var merged = collapseToSingleEntryPerDate(combined);
    return sortEntriesByDateAsc(merged);
  }

  /** Merge two entry arrays (sync/import/server); exposed for import pipeline. */
  W.mergeProfileEntriesArrays = mergeEntriesArrays;

  function isProfileEntryArrayKey(key, data) {
    if (!key || key === 'vacationDaysByProfile' || key === 'profileMeta') return false;
    if (key.indexOf('lastClock_') === 0) return false;
    return data && Array.isArray(data[key]);
  }

  /** Run merge/dedupe on every profile's entry list (e.g. on load). Persists only if something changed. */
  W.dedupeAllProfilesEntryArrays = function dedupeAllProfilesEntryArrays() {
    var data = W.getData();
    if (!data || typeof data !== 'object') return;
    var snapshot = JSON.stringify(data);
    Object.keys(data).forEach(function (key) {
      if (!isProfileEntryArrayKey(key, data)) return;
      data[key] = mergeEntriesArrays(data[key], []);
    });
    if (JSON.stringify(data) !== snapshot) {
      W.setData(data);
      if (typeof W.ensureAllEntryIds === 'function') {
        W.ensureAllEntryIds();
      }
    }
  };

  function shallowMergeObjects(base, extra) {
    var out = {};
    Object.keys(base || {}).forEach(function (k) { out[k] = clone(base[k]); });
    Object.keys(extra || {}).forEach(function (k) { out[k] = clone(extra[k]); });
    return out;
  }

  function getApiBase() {
    // When served from frontend server (port 3011), use same-origin so the
    // request goes to 3011 and the frontend server proxies to backend 3010.
    // When served from backend (port 3010) or file://, call backend directly.
    try {
      if (typeof window !== 'undefined' && window.location && String(window.location.port) === '3011') {
        return '';
      }
    } catch (_) {}
    return 'http://localhost:3010';
  }

  var lastSaveErrorToastAt = 0;
  var SAVE_ERROR_TOAST_COOLDOWN_MS = 15000;

  function showSaveErrorToast(message) {
    var now = Date.now();
    if (now - lastSaveErrorToastAt < SAVE_ERROR_TOAST_COOLDOWN_MS) return;
    lastSaveErrorToastAt = now;
    showToast(message, 'warning');
  }

  function setSaveStatus(text, kind) {
    try {
      var el = document.getElementById('saveDataStatus');
      if (el) {
        el.textContent = text || '';
        el.className = 'save-data-status save-data-status--' + (kind || '');
        el.setAttribute('aria-live', text ? 'polite' : 'off');
      }
    } catch (_) {}
  }

  W.saveWorkingHoursDataToFile = function saveWorkingHoursDataToFile(isManualSave) {
    var payload = buildExportPayload();
    var counts = countEntriesInPayload(payload);
    var json = JSON.stringify(payload, null, 2);

    if (typeof fetch !== 'function') {
      showToast((W.I18N && W.I18N.t) ? W.I18N.t('sync.cannotSaveFetch') : 'Cannot save: fetch API is not available in this browser.', 'warning');
      return;
    }

    var base = getApiBase();
    var apiUrl = base + '/api/working-hours-data';
    if (isManualSave) setSaveStatus((W.I18N && W.I18N.t) ? W.I18N.t('sync.saving') : 'Saving…', 'saving');

    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: json
    }).then(function (res) {
      if (res && res.ok) {
        if (isManualSave) {
          setSaveStatus((W.I18N && W.I18N.t) ? W.I18N.t('sync.saved') : 'Saved', 'saved');
          setTimeout(function () { setSaveStatus(''); }, 2000);
          var msg = (W.I18N && W.I18N.t) ? W.I18N.t('sync.savedToast', { entries: counts.entries, profiles: counts.profiles, profileLabel: counts.profiles === 1 ? (W.I18N.t('common.profileLabel')) : (W.I18N.t('common.profilesLabel')) }) : ('Saved ' + counts.entries + ' entries across ' + counts.profiles + (counts.profiles === 1 ? ' profile' : ' profiles') + ' to data/Working Hours Data.json.');
          showToast(msg, 'success');
        }
      } else {
        setSaveStatus('');
        showSaveErrorToast((W.I18N && W.I18N.t) ? W.I18N.t('sync.saveFailedStatus', { status: res ? res.status : '' }) : ('Failed to save data to server (status ' + (res ? res.status : '') + '). Ensure backend is running: npm start'));
      }
    }).catch(function () {
      setSaveStatus('');
      showSaveErrorToast((W.I18N && W.I18N.t) ? W.I18N.t('sync.saveFailedConnect') : 'Save failed. Open the app from http://localhost:3011 (with backend running on 3010) or http://localhost:3010.');
    });
  };

  W.mergeWorkingHoursData = function mergeWorkingHoursData(root) {
    if (!root) return false;
    var incomingData = root.data && typeof root.data === 'object' ? root.data : root;
    if (!incomingData || typeof incomingData !== 'object') return false;
    var current = clone(W.getData());
    var out = current || {};

    Object.keys(incomingData).forEach(function (key) {
      var value = incomingData[key];
      if (key === 'vacationDaysByProfile' || key === 'profileMeta') {
        out[key] = shallowMergeObjects(current[key] || {}, value || {});
      } else if (key.indexOf('lastClock_') === 0) {
        out[key] = clone(value);
      } else if (Array.isArray(value)) {
        var existingEntries = Array.isArray(current[key]) ? current[key] : [];
        out[key] = mergeEntriesArrays(existingEntries, value);
      } else {
        out[key] = clone(value);
      }
    });

    W.setData(out);
    if (typeof W.ensureAllEntryIds === 'function') {
      W.ensureAllEntryIds();
    }
    return true;
  };

  W.handleWorkingHoursDataFile = function handleWorkingHoursDataFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var text = reader.result || '';
      var parsed;
      try {
        parsed = JSON.parse(text);
      } catch (_) {
        showToast((W.I18N && W.I18N.t) ? W.I18N.t('sync.syncFailedInvalid') : 'Failed to sync data: invalid JSON.', 'warning');
        return;
      }
      var ok = W.mergeWorkingHoursData(parsed);
      if (!ok) {
        showToast((W.I18N && W.I18N.t) ? W.I18N.t('sync.syncFailedFormat') : 'Failed to sync data: JSON format not recognized.', 'warning');
        return;
      }
      showToast((W.I18N && W.I18N.t) ? W.I18N.t('sync.syncedFromFile', { filename: file.name }) : ('Synced data from "' + file.name + '".'), 'success');
      if (typeof W.refreshProfileSelect === 'function') W.refreshProfileSelect();
      if (typeof W.refreshProfileRoleInput === 'function') W.refreshProfileRoleInput();
      if (typeof W.renderEntries === 'function') W.renderEntries();
      if (typeof W.renderCalendar === 'function') W.renderCalendar();
      if (typeof W.renderStatsBox === 'function') W.renderStatsBox();
    };
    reader.onerror = function () {
      showToast((W.I18N && W.I18N.t) ? W.I18N.t('sync.syncFailedRead') : 'Failed to read "Working Hours Data" file.', 'warning');
    };
    reader.readAsText(file, 'UTF-8');
  };

  W.syncWorkingHoursData = function syncWorkingHoursData(fallback) {
    if (typeof fetch !== 'function') {
      if (typeof fallback === 'function') fallback();
        else showToast((W.I18N && W.I18N.t) ? W.I18N.t('sync.syncChooseFile') : 'Sync via server is not available; please choose a "Working Hours Data" JSON file.', 'info');
      return;
    }
    var base = getApiBase();
    fetch(base + '/api/working-hours-data', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    }).then(function (res) {
      if (res.status === 404) {
        throw new Error('not_found');
      }
      if (!res.ok) {
        throw new Error('http_' + res.status);
      }
      return res.json();
    }).then(function (payload) {
      var ok = W.mergeWorkingHoursData(payload);
      if (!ok) {
        showToast((W.I18N && W.I18N.t) ? W.I18N.t('sync.syncFailedServerFormat') : 'Failed to sync data from server: JSON format not recognized.', 'warning');
        return;
      }
      showToast((W.I18N && W.I18N.t) ? W.I18N.t('sync.syncedFromServer') : 'Synced data from data/Working Hours Data.json via server.', 'success');
      if (typeof W.refreshProfileSelect === 'function') W.refreshProfileSelect();
      if (typeof W.refreshProfileRoleInput === 'function') W.refreshProfileRoleInput();
      if (typeof W.renderEntries === 'function') W.renderEntries();
      if (typeof W.renderCalendar === 'function') W.renderCalendar();
      if (typeof W.renderStatsBox === 'function') W.renderStatsBox();
    }).catch(function (err) {
      if (err && err.message === 'not_found') {
        showToast((W.I18N && W.I18N.t) ? W.I18N.t('sync.noServerCopy') : 'No server copy found. Please save once or choose a "Working Hours Data" JSON file.', 'info');
      }
      if (typeof fallback === 'function') fallback();
    });
  };
})(window.WorkHours = window.WorkHours || {});


