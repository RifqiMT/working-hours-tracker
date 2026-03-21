/**
 * CSV and JSON export.
 * Full export: all profiles, vacation, profile meta, all entries (including future), sorted by entry date asc.
 * Depends: data-sync (getFullExportPayload), time, profile, storage.
 */
(function (W) {
  'use strict';
  function buildTimestampPrefix() {
    var d = new Date();
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    var yyyy = d.getFullYear();
    var mm = pad(d.getMonth() + 1);
    var dd = pad(d.getDate());
    var hh = pad(d.getHours());
    var mi = pad(d.getMinutes());
    return yyyy + '-' + mm + '-' + dd + '-' + hh + ':' + mi;
  }

  /** Keys in data that are profile entry arrays (not vacationDaysByProfile, profileMeta, lastClock_*). */
  function getProfileKeys(data) {
    if (!data || typeof data !== 'object') return [];
    return Object.keys(data).filter(function (key) {
      if (key === 'vacationDaysByProfile' || key === 'profileMeta') return false;
      if (key.indexOf('lastClock_') === 0) return false;
      return Array.isArray(data[key]);
    });
  }

  /** Return { profiles, entries } for a data object. */
  function countExportData(data) {
    var keys = getProfileKeys(data);
    var entries = 0;
    keys.forEach(function (key) {
      if (Array.isArray(data[key])) entries += data[key].length;
    });
    return { profiles: keys.length, entries: entries };
  }

  /** Reliable download: append link, defer revokeObjectURL so the browser can start the save. */
  function triggerFileDownload(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    a.style.position = 'fixed';
    a.style.left = '-9999px';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 500);
  }

  function showExportToast(format, counts, durationSeconds) {
    var durationStr = durationSeconds < 1 ? durationSeconds.toFixed(2) : durationSeconds.toFixed(1);
    var msg = (W.I18N && W.I18N.t)
      ? W.I18N.t('export.toastMessage', { entries: counts.entries, profiles: counts.profiles, profileLabel: counts.profiles === 1 ? W.I18N.t('common.profileLabel') : W.I18N.t('common.profilesLabel'), format: format, duration: durationStr })
      : ('Exported ' + counts.entries + ' entries across ' + counts.profiles + ' profile' + (counts.profiles === 1 ? '' : 's') + ' as ' + format + ' in ' + durationStr + ' s.');
    if (typeof W.showToast === 'function') W.showToast(msg, 'success');
  }

  /** Single CSV row for one entry. */
  function buildCsvRow(entry, profileName, allData) {
    var role = typeof W.getProfileRole === 'function' ? W.getProfileRole(profileName) :
      (allData.profileMeta && allData.profileMeta[profileName] && allData.profileMeta[profileName].role) || '';
    var profileId = (allData.profileMeta && allData.profileMeta[profileName] && allData.profileMeta[profileName].id) || profileName;
    var quotas = allData.vacationDaysByProfile && allData.vacationDaysByProfile[profileName]
      ? allData.vacationDaysByProfile[profileName]
      : {};
    var dur = W.workingMinutes(entry.clockIn, entry.clockOut, entry.breakMinutes);
    var dateStr = W.formatDateMDY ? W.formatDateMDY(entry.date) : entry.date;
    var year = (entry.date && typeof entry.date === 'string' && entry.date.length >= 4) ? entry.date.slice(0, 4) : '';
    var quotaForYear = (year && quotas && quotas[year] != null) ? quotas[year] : '';
    return [
      profileName,
      profileId,
      role,
      year,
      quotaForYear,
      entry.id || '',
      dateStr,
      entry.clockIn || '',
      entry.clockOut || '',
      entry.breakMinutes != null ? entry.breakMinutes : 0,
      dur != null ? dur : '',
      entry.dayStatus || 'work',
      entry.location || '',
      (entry.description || '').replace(/\r?\n/g, ' '),
      entry.timezone || W.DEFAULT_TIMEZONE,
      entry.createdAt || '',
      entry.updatedAt || ''
    ];
  }

  W.buildCsvRows = function buildCsvRows(entries) {
    var profileName = W.getProfile ? W.getProfile() : '';
    var allData = typeof W.getData === 'function' ? W.getData() : {};
    return entries.map(function (e) { return buildCsvRow(e, profileName, allData); });
  };

  W.exportToCsv = function exportToCsv() {
    var startMs = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    var payload = typeof W.getFullExportPayload === 'function' ? W.getFullExportPayload() : null;
    var data = payload && payload.data ? payload.data : (typeof W.getData === 'function' ? W.getData() : {});
    var counts = countExportData(data);
    var profileKeys = getProfileKeys(data);
    var allRows = [];
    profileKeys.forEach(function (profileName) {
      var entries = Array.isArray(data[profileName]) ? data[profileName] : [];
      entries.forEach(function (entry) {
        allRows.push({ profileName: profileName, entry: entry });
      });
    });
    allRows.sort(function (a, b) {
      return (a.entry.date || '').localeCompare(b.entry.date || '');
    });
    var rows = allRows.map(function (r) { return buildCsvRow(r.entry, r.profileName, data); });
    var headers = ['Profile', 'Profile ID', 'Role', 'Year', 'Vacation quota (year)', 'Entry ID', 'Date', 'Clock In', 'Clock Out', 'Break (min)', 'Duration (min)', 'Status', 'Location', 'Description', 'Timezone', 'Created At', 'Updated At'];
    var bodyRows = rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); });
    var csv = '\uFEFF' + headers.join(',') + '\n' + bodyRows.join('\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    triggerFileDownload(blob, buildTimestampPrefix() + '-working-hours-data.csv');
    var endMs = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    var durationSeconds = (endMs - startMs) / 1000;
    showExportToast('CSV', counts, durationSeconds);
  };

  W.exportToJson = function exportToJson() {
    var startMs = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    var payload = typeof W.getFullExportPayload === 'function' ? W.getFullExportPayload() : null;
    if (!payload) {
      var raw = typeof W.getData === 'function' ? W.getData() : {};
      var data = {};
      Object.keys(raw).forEach(function (key) {
        data[key] = raw[key];
      });
      getProfileKeys(data).forEach(function (key) {
        if (Array.isArray(data[key])) {
          data[key] = data[key].slice().sort(function (a, b) { return (a.date || '').localeCompare(b.date || ''); });
        }
      });
      payload = { exportedAt: new Date().toISOString(), data: data };
    }
    var counts = countExportData(payload.data || {});
    var json = JSON.stringify(payload, null, 2);
    var blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    triggerFileDownload(blob, buildTimestampPrefix() + '-working-hours-data.json');
    var endMs = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    var durationSeconds = (endMs - startMs) / 1000;
    showExportToast('JSON', counts, durationSeconds);
  };
})(window.WorkHours);
