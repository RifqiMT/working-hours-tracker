/**
 * Profile selection and dropdown.
 * Depends: storage (getData, setData).
 */
(function (W) {
  'use strict';
  W.getProfile = function getProfile() {
    const sel = document.getElementById('profileSelect');
    return (sel && sel.value) ? sel.value : 'Default';
  };
  W.getProfileNames = function getProfileNames() {
    const data = W.getData();
    return Object.keys(data).filter(function (k) {
      return k.indexOf('lastClock_') !== 0 && k !== 'vacationDaysByProfile' && k !== 'profileMeta';
    }).sort();
  };
  W.getProfileRole = function getProfileRole(profile) {
    var data = W.getData();
    var meta = data.profileMeta;
    if (!meta || typeof meta[profile] !== 'object') return '';
    return meta[profile].role != null ? String(meta[profile].role) : '';
  };
  W.getProfileId = function getProfileId(profile) {
    var data = W.getData();
    var meta = data.profileMeta;
    if (!meta || typeof meta[profile] !== 'object' || meta[profile].id == null) return '';
    return String(meta[profile].id);
  };
  W.ensureProfileId = function ensureProfileId(profile) {
    if (!profile) return;
    var data = W.getData();
    if (!data.profileMeta) data.profileMeta = {};
    if (!data.profileMeta[profile]) data.profileMeta[profile] = {};
    if (!data.profileMeta[profile].id && typeof W.generateId === 'function') {
      data.profileMeta[profile].id = 'profile-' + W.generateId();
      W.setData(data);
    }
  };
  W.setProfileRole = function setProfileRole(profile, role) {
    var data = W.getData();
    if (!data.profileMeta) data.profileMeta = {};
    if (!data.profileMeta[profile]) data.profileMeta[profile] = {};
    data.profileMeta[profile].role = role ? String(role).trim() : '';
    W.setData(data);
  };
  W.refreshProfileRoleInput = function refreshProfileRoleInput() {
    var el = document.getElementById('profileRole');
    if (!el) return;
    var profileName = W.getProfile();
    var rawRole = W.getProfileRole(profileName);
    el.value = rawRole || '';
    el.setAttribute('data-current-profile', profileName);
    el.setAttribute('data-role-original', rawRole || '');

    // Dynamically translate user-provided role text for current language.
    if (!rawRole) return;
    var lang = W.currentLanguage || 'en';
    if (typeof W.getTranslatedDynamicUserTextCached === 'function') {
      var cached = W.getTranslatedDynamicUserTextCached(rawRole, lang, 'profileRole');
      if (cached) el.value = cached;
    } else if (typeof W.getTranslatedDescriptionCached === 'function') {
      // Backward compatible fallback.
      var cachedOld = W.getTranslatedDescriptionCached(rawRole, lang);
      if (cachedOld) el.value = cachedOld;
    }
    if (typeof W.translateDynamicUserText === 'function') {
      W.translateDynamicUserText(rawRole, lang, 'profileRole').then(function (translated) {
        if (!el || !el.isConnected) return;
        // Ignore outdated async result if user switched profile or role changed meanwhile.
        if (el.getAttribute('data-current-profile') !== profileName) return;
        if (el.getAttribute('data-role-original') !== rawRole) return;
        el.value = translated || rawRole;
      });
    } else if (typeof W.translateDescriptionText === 'function') {
      // Backward compatible fallback.
      W.translateDescriptionText(rawRole, lang).then(function (translated) {
        if (!el || !el.isConnected) return;
        if (el.getAttribute('data-current-profile') !== profileName) return;
        if (el.getAttribute('data-role-original') !== rawRole) return;
        el.value = translated || rawRole;
      });
    }
  };
  W.refreshProfileSelect = function refreshProfileSelect() {
    const data = W.getData();
    var names = W.getProfileNames();
    if (names.length === 0) {
      data['Default'] = [];
      W.setData(data);
      names = ['Default'];
    }
    const sel = document.getElementById('profileSelect');
    const current = sel.value;
    sel.innerHTML = names.map(function (n) { return '<option value="' + n + '">' + n + '</option>'; }).join('');
    if (names.indexOf(current) !== -1) sel.value = current;
    else sel.value = names[0];
  };
})(window.WorkHours);
