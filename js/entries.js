/**
 * Entries data (get/set, last clock state).
 * Depends: storage, profile, time (generateId).
 */
(function (W) {
  'use strict';

  function isProfileKey(key, data) {
    if (key === 'vacationDaysByProfile' || key === 'profileMeta') return false;
    if (key.indexOf('lastClock_') === 0) return false;
    return data && Array.isArray(data[key]);
  }

  function buildDefaultTimestamps() {
    var now = new Date();
    var created = new Date(now.getFullYear(), now.getMonth(), 1, 13, 0, 0, 0);
    var modified = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 13, 0, 0, 0);
    return {
      createdAt: created.toISOString(),
      updatedAt: modified.toISOString()
    };
  }

  /** Ensure every entry in every profile has a unique id and baseline timestamps. Persists to storage. Call at startup and after merge. */
  W.ensureAllEntryIds = function ensureAllEntryIds() {
    if (typeof W.generateId !== 'function') return;
    var data = W.getData();
    if (!data || typeof data !== 'object') return;
    var changed = false;
    var defaults = buildDefaultTimestamps();
    Object.keys(data).forEach(function (key) {
      if (!isProfileKey(key, data)) return;
      var arr = data[key];
      for (var i = 0; i < arr.length; i++) {
        var e = arr[i];
        if (e && !e.id) {
          e.id = W.generateId();
          changed = true;
        }
        if (e && !e.createdAt && !e.updatedAt) {
          e.createdAt = defaults.createdAt;
          e.updatedAt = defaults.updatedAt;
          changed = true;
        }
      }
    });
    if (changed && typeof W.setData === 'function') {
      W.setData(data);
    }
  };

  function ensureEntryIdsForProfile(profile, data) {
    data = data || W.getData();
    if (!Array.isArray(data[profile])) {
      data[profile] = [];
      return data[profile];
    }
    var changed = false;
    data[profile].forEach(function (e) {
      if (e && !e.id && typeof W.generateId === 'function') {
        e.id = W.generateId();
        changed = true;
      }
    });
    if (changed && typeof W.setData === 'function') {
      W.setData(data);
    }
    return data[profile];
  }

  W.getEntries = function getEntries() {
    const data = W.getData();
    const profile = W.getProfile();
    if (!data[profile]) data[profile] = [];
    return ensureEntryIdsForProfile(profile, data);
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
