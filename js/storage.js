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

  function setSyncHealthStatus(key, kind, subs) {
    try {
      if (typeof W.setSyncStatusDisplay === 'function') {
        W.setSyncStatusDisplay(key, kind, subs);
      }
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
    setSyncHealthStatus('saving', 'saving');
    Promise.resolve(W.saveWorkingHoursDataToFile(false)).then(function (ok) {
      autoSaveInFlight = false;
      if (ok) {
        autoSaveDirty = false;
        autoSaveRetryCount = 0;
        setSyncHealthStatus('saved', 'saved');
        return;
      }
      autoSaveRetryCount += 1;
      if (autoSaveRetryCount <= AUTO_SAVE_MAX_RETRIES) {
        setSyncHealthStatus('autoSaveRetrying', 'retry', {
          attempt: autoSaveRetryCount,
          max: AUTO_SAVE_MAX_RETRIES
        });
        if (autoSaveRetryTimer) clearTimeout(autoSaveRetryTimer);
        autoSaveRetryTimer = setTimeout(function () {
          autoSaveRetryTimer = null;
          runAutoSave();
        }, AUTO_SAVE_RETRY_MS);
      } else {
        setSyncHealthStatus('saveFailedConnect', 'error');
      }
    }).catch(function () {
      autoSaveInFlight = false;
      autoSaveRetryCount += 1;
      if (autoSaveRetryCount <= AUTO_SAVE_MAX_RETRIES) {
        setSyncHealthStatus('autoSaveRetrying', 'retry', {
          attempt: autoSaveRetryCount,
          max: AUTO_SAVE_MAX_RETRIES
        });
        if (autoSaveRetryTimer) clearTimeout(autoSaveRetryTimer);
        autoSaveRetryTimer = setTimeout(function () {
          autoSaveRetryTimer = null;
          runAutoSave();
        }, AUTO_SAVE_RETRY_MS);
      } else {
        setSyncHealthStatus('saveFailedConnect', 'error');
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
    setSyncHealthStatus('saving', 'saving');
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
