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

  /** Sort entries array ascending by entry date (oldest first). Uses date string comparison so YYYY-MM-DD orders correctly. */
  function sortEntriesByDateAsc(entries) {
    if (!Array.isArray(entries)) return entries;
    return entries.slice().sort(function (a, b) {
      var da = (a && typeof a.date === 'string') ? a.date : '';
      var db = (b && typeof b.date === 'string') ? b.date : '';
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
  // - Primary key: entry id (if present), else date.
  // - If the same id appears multiple times, keep the version with the latest updatedAt (or createdAt).
  // - Sorted ascending by date (oldest first).
  function mergeEntriesArrays(existing, incoming) {
    var nowIso = new Date().toISOString();
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
    (existing || []).forEach(function (e) {
      if (!e) return;
      map[makeKey(e)] = clone(e);
    });
    (incoming || []).forEach(function (e) {
      if (!e) return;
      var k = makeKey(e);
      var prev = map[k] || {};
      if (map[k]) {
        var curTs = getTimestamp(prev);
        var incomingTs = getTimestamp(e) || (new Date(nowIso)).getTime();
        if (incomingTs < curTs) {
          return;
        }
      }
      map[k] = {
        id: prev.id || (typeof W.generateId === 'function' ? W.generateId() : undefined),
        date: e.date,
        clockIn: e.clockIn,
        clockOut: e.clockOut,
        breakMinutes: e.breakMinutes != null ? e.breakMinutes : 0,
        dayStatus: ['work', 'sick', 'holiday', 'vacation'].indexOf(e.dayStatus) >= 0 ? e.dayStatus : (prev.dayStatus || 'work'),
        location: ['WFO', 'WFH', 'AW', 'Anywhere'].indexOf(e.location) >= 0 ? (e.location === 'AW' ? 'Anywhere' : e.location) : (prev.location || 'WFO'),
        description: (e.description || '').toString().trim(),
        timezone: (e.timezone || prev.timezone || W.DEFAULT_TIMEZONE || 'Europe/Berlin'),
        createdAt: prev.createdAt || e.createdAt || nowIso,
        updatedAt: nowIso
      };
    });
    return Object.keys(map).sort().map(function (k) { return map[k]; });
  }

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


