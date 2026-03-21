/**
 * Local storage read/write.
 * Depends: constants (STORAGE_KEY).
 */
(function (W) {
  'use strict';

  var AUTO_SAVE_DELAY_MS = 800;
  var autoSaveTimer = null;

  W.getData = function getData() {
    try {
      const raw = localStorage.getItem(W.STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  };

  function scheduleAutoSave() {
    if (typeof W.saveWorkingHoursDataToFile !== 'function') return;
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    autoSaveTimer = setTimeout(function () {
      autoSaveTimer = null;
      try {
        if (typeof W.saveWorkingHoursDataToFile === 'function') {
          W.saveWorkingHoursDataToFile(false);
        }
      } catch (_) {
        // Best-effort autosave; ignore failures (manual save remains available).
      }
    }, AUTO_SAVE_DELAY_MS);
  }

  W.setData = function setData(data) {
    localStorage.setItem(W.STORAGE_KEY, JSON.stringify(data));
    scheduleAutoSave();
  };
})(window.WorkHours);
