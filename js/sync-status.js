/**
 * Profile data sync status badge (#saveDataStatus).
 * Stores translation keys on the element so language changes re-apply automatically.
 * Depends: I18N (optional at runtime).
 */
(function (W) {
  'use strict';

  var STATUS_EL_ID = 'saveDataStatus';

  var FALLBACKS = {
    saving: 'Saving…',
    saved: 'Saved',
    autoSaveRetrying: 'Retrying {attempt}/{max}',
    saveFailedConnect: 'Save failed. Please sync again.',
    autoSaveQueued: 'Queued',
    autoSavePending: 'Pending sync'
  };

  function trSync(key, subs) {
    var bare = String(key || '').replace(/^sync\./, '');
    var fullKey = 'sync.' + bare;
    try {
      if (W.I18N && typeof W.I18N.t === 'function') {
        var v = W.I18N.t(fullKey, subs || {});
        if (v != null && v !== fullKey) return v;
      }
    } catch (_) {}
    var fb = FALLBACKS[bare] || '';
    if (fb && subs && typeof subs === 'object') {
      Object.keys(subs).forEach(function (k) {
        fb = fb.replace(new RegExp('\\{' + k + '\\}', 'g'), String(subs[k]));
      });
    }
    return fb;
  }

  function getStatusEl() {
    return document.getElementById(STATUS_EL_ID);
  }

  function applyStatusToEl(el, key, kind, subs) {
    if (!el) return;
    var bare = String(key || '').replace(/^sync\./, '');
    if (!bare) {
      el.textContent = '';
      el.className = 'profile-actions-status save-data-status';
      el.removeAttribute('data-sync-status-key');
      el.removeAttribute('data-sync-status-kind');
      el.removeAttribute('data-sync-status-subs');
      el.setAttribute('aria-live', 'off');
      return;
    }
    var subsObj = subs && typeof subs === 'object' ? subs : {};
    el.setAttribute('data-sync-status-key', bare);
    el.setAttribute('data-sync-status-kind', kind || '');
    try {
      el.setAttribute('data-sync-status-subs', JSON.stringify(subsObj));
    } catch (_) {
      el.removeAttribute('data-sync-status-subs');
    }
    el.textContent = trSync(bare, subsObj);
    el.className = 'profile-actions-status save-data-status';
    if (kind) el.classList.add('save-data-status--' + kind);
    el.setAttribute('aria-live', 'polite');
  }

  W.setSyncStatusDisplay = function setSyncStatusDisplay(key, kind, subs) {
    applyStatusToEl(getStatusEl(), key, kind, subs);
  };

  W.clearSyncStatusDisplay = function clearSyncStatusDisplay() {
    applyStatusToEl(getStatusEl(), '', '', null);
  };

  W.refreshSyncStatusDisplay = function refreshSyncStatusDisplay() {
    var el = getStatusEl();
    if (!el) return;
    var key = el.getAttribute('data-sync-status-key');
    if (!key) return;
    var kind = el.getAttribute('data-sync-status-kind') || '';
    var subsRaw = el.getAttribute('data-sync-status-subs');
    var subs = {};
    if (subsRaw) {
      try { subs = JSON.parse(subsRaw); } catch (_) {}
    }
    applyStatusToEl(el, key, kind, subs);
  };
})(window.WorkHours || (window.WorkHours = {}));
