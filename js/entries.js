/**
 * Entries data (get/set, last clock state).
 * Depends: storage, profile.
 */
(function (W) {
  'use strict';
  W.getEntries = function getEntries() {
    const data = W.getData();
    const profile = W.getProfile();
    if (!data[profile]) data[profile] = [];
    return data[profile];
  };
  W.setEntries = function setEntries(entries) {
    const data = W.getData();
    data[W.getProfile()] = entries;
    W.setData(data);
  };
  W.getLastClock = function getLastClock() {
    const data = W.getData();
    const key = 'lastClock_' + W.getProfile();
    return data[key] || null;
  };
  W.setLastClock = function setLastClock(obj) {
    const data = W.getData();
    data['lastClock_' + W.getProfile()] = obj;
    W.setData(data);
  };
})(window.WorkHours);
