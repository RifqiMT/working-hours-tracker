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
  W.setProfileRole = function setProfileRole(profile, role) {
    var data = W.getData();
    if (!data.profileMeta) data.profileMeta = {};
    if (!data.profileMeta[profile]) data.profileMeta[profile] = {};
    data.profileMeta[profile].role = role ? String(role).trim() : '';
    W.setData(data);
  };
  W.refreshProfileRoleInput = function refreshProfileRoleInput() {
    var el = document.getElementById('profileRole');
    if (el) el.value = W.getProfileRole(W.getProfile());
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
