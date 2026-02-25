/**
 * Local storage read/write.
 * Depends: constants (STORAGE_KEY).
 */
(function (W) {
  'use strict';
  W.getData = function getData() {
    try {
      const raw = localStorage.getItem(W.STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  };
  W.setData = function setData(data) {
    localStorage.setItem(W.STORAGE_KEY, JSON.stringify(data));
  };
})(window.WorkHours);
