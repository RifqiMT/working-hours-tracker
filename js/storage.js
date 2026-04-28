/**
 * Local storage read/write.
 * Depends: constants (STORAGE_KEY).
 */
(function (W) {
  'use strict';

  var AUTO_SAVE_DELAY_MS = 800;
  var AUTO_SAVE_RETRY_MS = 4000;
  var AUTO_SAVE_MAX_RETRIES = 3;
  var autoSaveTimer = null;
  var autoSaveRetryTimer = null;
  var autoSaveInFlight = false;
  var autoSaveDirty = false;
  var autoSaveRetryCount = 0;
  var autoSaveFlushBound = false;

  function trSync(key, fallback, subs) {
    try {
      if (W.I18N && typeof W.I18N.t === 'function') {
        var v = W.I18N.t('sync.' + key, subs || {});
        if (v != null && v !== ('sync.' + key)) return v;
      }
    } catch (_) {}
    return fallback;
  }

  function setSyncHealthStatus(text, kind) {
    try {
      var el = document.getElementById('saveDataStatus');
      if (!el) return;
      el.textContent = text || '';
      el.className = 'save-data-status';
      if (kind) el.classList.add('save-data-status--' + kind);
      el.setAttribute('aria-live', 'polite');
    } catch (_) {}
  }

  W.getData = function getData() {
    try {
      const raw = localStorage.getItem(W.STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  };

  function runAutoSave() {
    if (autoSaveInFlight) return;
    if (typeof W.saveWorkingHoursDataToFile !== 'function') return;
    if (!autoSaveDirty) return;
    autoSaveInFlight = true;
    setSyncHealthStatus(trSync('saving', 'Saving...'), 'saving');
    Promise.resolve(W.saveWorkingHoursDataToFile(false)).then(function (ok) {
      autoSaveInFlight = false;
      if (ok) {
        autoSaveDirty = false;
        autoSaveRetryCount = 0;
        setSyncHealthStatus(trSync('saved', 'Saved'), 'saved');
        return;
      }
      autoSaveRetryCount += 1;
      if (autoSaveRetryCount <= AUTO_SAVE_MAX_RETRIES) {
        setSyncHealthStatus(trSync('saving', 'Saving...') + ' (' + autoSaveRetryCount + '/' + AUTO_SAVE_MAX_RETRIES + ')', 'retry');
        if (autoSaveRetryTimer) clearTimeout(autoSaveRetryTimer);
        autoSaveRetryTimer = setTimeout(function () {
          autoSaveRetryTimer = null;
          runAutoSave();
        }, AUTO_SAVE_RETRY_MS);
      } else {
        setSyncHealthStatus(trSync('saveFailedConnect', 'Save failed. Please sync again.'), 'error');
      }
    }).catch(function () {
      autoSaveInFlight = false;
      autoSaveRetryCount += 1;
      if (autoSaveRetryCount <= AUTO_SAVE_MAX_RETRIES) {
        setSyncHealthStatus(trSync('saving', 'Saving...') + ' (' + autoSaveRetryCount + '/' + AUTO_SAVE_MAX_RETRIES + ')', 'retry');
        if (autoSaveRetryTimer) clearTimeout(autoSaveRetryTimer);
        autoSaveRetryTimer = setTimeout(function () {
          autoSaveRetryTimer = null;
          runAutoSave();
        }, AUTO_SAVE_RETRY_MS);
      } else {
        setSyncHealthStatus(trSync('saveFailedConnect', 'Save failed. Please sync again.'), 'error');
      }
    });
  }

  function bindAutoSaveFlushEventsOnce() {
    if (autoSaveFlushBound) return;
    autoSaveFlushBound = true;
    if (typeof window === 'undefined' || !window.addEventListener) return;
    window.addEventListener('beforeunload', function () {
      if (!autoSaveDirty || autoSaveInFlight) return;
      runAutoSave();
    });
    document.addEventListener('visibilitychange', function () {
      if (typeof document === 'undefined') return;
      if (document.visibilityState !== 'hidden') return;
      if (!autoSaveDirty || autoSaveInFlight) return;
      runAutoSave();
    });
  }

  function scheduleAutoSave() {
    if (typeof W.saveWorkingHoursDataToFile !== 'function') return;
    bindAutoSaveFlushEventsOnce();
    autoSaveDirty = true;
    setSyncHealthStatus(trSync('saving', 'Saving...'), 'saving');
    if (autoSaveRetryTimer) {
      clearTimeout(autoSaveRetryTimer);
      autoSaveRetryTimer = null;
    }
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(function () {
      autoSaveTimer = null;
      runAutoSave();
    }, AUTO_SAVE_DELAY_MS);
  }

  W.setData = function setData(data) {
    localStorage.setItem(W.STORAGE_KEY, JSON.stringify(data));
    scheduleAutoSave();
  };
})(window.WorkHours);
