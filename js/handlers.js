/**
 * Profile and UI event handlers.
 * Depends: storage, profile, filters, render.
 */
(function (W) {
  'use strict';
  W.handleProfileChange = function handleProfileChange() {
    var profileRoleEl = document.getElementById('profileRole');
    if (profileRoleEl && typeof W.setProfileRole === 'function') {
      var prevProfile = profileRoleEl.getAttribute('data-current-profile');
      if (prevProfile) W.setProfileRole(prevProfile, profileRoleEl.value);
    }
    try { localStorage.setItem('workingHoursLastProfile', W.getProfile()); } catch (_) {}
    if (typeof W.refreshProfileRoleInput === 'function') W.refreshProfileRoleInput();
    if (profileRoleEl) profileRoleEl.setAttribute('data-current-profile', W.getProfile());
    W.refreshFilterYearWeek();
    W.renderEntries();
  };
  W.openNewProfileModal = function openNewProfileModal() {
    var nameEl = document.getElementById('newProfileNameModal');
    var roleEl = document.getElementById('newProfileRoleModal');
    if (nameEl) nameEl.value = '';
    if (roleEl) roleEl.value = '';
    document.getElementById('newProfileModal').classList.add('open');
    if (nameEl) nameEl.focus();
  };
  W.closeNewProfileModal = function closeNewProfileModal() {
    document.getElementById('newProfileModal').classList.remove('open');
  };
  W.openEditProfileModal = function openEditProfileModal() {
    var current = W.getProfile();
    document.getElementById('editProfileOriginalName').value = current;
    document.getElementById('editProfileNameModal').value = current;
    document.getElementById('editProfileRoleModal').value = W.getProfileRole(current);
    document.getElementById('editProfileModal').classList.add('open');
    document.getElementById('editProfileNameModal').focus();
  };
  W.closeEditProfileModal = function closeEditProfileModal() {
    document.getElementById('editProfileModal').classList.remove('open');
  };
  W.handleSaveEditProfile = function handleSaveEditProfile() {
    var nameEl = document.getElementById('editProfileNameModal');
    var roleEl = document.getElementById('editProfileRoleModal');
    var originalNameEl = document.getElementById('editProfileOriginalName');
    var newName = (nameEl && nameEl.value || '').trim();
    var originalName = (originalNameEl && originalNameEl.value || '').trim();
    if (!newName) { alert('Enter a profile name.'); return; }
    var data = W.getData();
    if (newName !== originalName) {
      if (data[newName] !== undefined && !Array.isArray(data[newName])) {
        alert('Profile name reserved or already in use.');
        return;
      }
      if (!data[originalName]) data[originalName] = [];
      data[newName] = data[originalName];
      delete data[originalName];
      var lastKey = 'lastClock_' + originalName;
      if (data[lastKey] !== undefined) {
        data['lastClock_' + newName] = data[lastKey];
        delete data[lastKey];
      }
      if (data.vacationDaysByProfile && data.vacationDaysByProfile[originalName] !== undefined) {
        data.vacationDaysByProfile[newName] = data.vacationDaysByProfile[originalName];
        delete data.vacationDaysByProfile[originalName];
      }
      if (data.profileMeta && data.profileMeta[originalName] !== undefined) {
        data.profileMeta[newName] = data.profileMeta[originalName] || {};
        delete data.profileMeta[originalName];
      }
    }
    if (data.profileMeta && data.profileMeta[newName]) {
      data.profileMeta[newName].role = roleEl && roleEl.value ? String(roleEl.value).trim() : '';
    } else {
      if (!data.profileMeta) data.profileMeta = {};
      data.profileMeta[newName] = { role: roleEl && roleEl.value ? String(roleEl.value).trim() : '' };
    }
    W.setData(data);
    W.closeEditProfileModal();
    W.refreshProfileSelect();
    document.getElementById('profileSelect').value = newName;
    if (typeof W.refreshProfileRoleInput === 'function') W.refreshProfileRoleInput();
    var roleInput = document.getElementById('profileRole');
    if (roleInput) roleInput.setAttribute('data-current-profile', newName);
    try { localStorage.setItem('workingHoursLastProfile', newName); } catch (_) {}
    W.refreshFilterYearWeek();
    W.renderEntries();
  };
  W.handleAddProfile = function handleAddProfile() {
    var nameEl = document.getElementById('newProfileNameModal');
    var roleElModal = document.getElementById('newProfileRoleModal');
    const name = (nameEl && nameEl.value || '').trim();
    if (!name) { alert('Enter a profile name.'); return; }
    const data = W.getData();
    if (data[name] !== undefined && !Array.isArray(data[name])) { alert('Profile name reserved.'); return; }
    if (!data[name]) data[name] = [];
    W.setData(data);
    // Save role metadata for new profile, if provided
    if (typeof W.setProfileRole === 'function' && roleElModal) {
      W.setProfileRole(name, roleElModal.value);
    }
    W.closeNewProfileModal();
    W.refreshProfileSelect();
    document.getElementById('profileSelect').value = name;
    if (typeof W.refreshProfileRoleInput === 'function') W.refreshProfileRoleInput();
    var roleEl = document.getElementById('profileRole');
    if (roleEl) roleEl.setAttribute('data-current-profile', name);
    try { localStorage.setItem('workingHoursLastProfile', name); } catch (_) {}
    W.refreshFilterYearWeek();
    W.renderEntries();
  };
})(window.WorkHours);
