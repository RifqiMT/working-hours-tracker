/**
 * Profile and UI event handlers.
 * Depends: storage, profile, filters, render.
 */
(function (W) {
  'use strict';
  function syncNewProfilePasswordFields() {
    var requireCb = document.getElementById('newProfileRequirePasswordModal');
    var fieldsWrap = document.getElementById('newProfilePasswordFields');
    var passWrap = document.getElementById('newProfilePasswordWrap');
    var confirmWrap = document.getElementById('newProfilePasswordConfirmWrap');
    var show = !!(requireCb && requireCb.checked);
    var showPassWrap = document.getElementById('newProfileShowPasswordWrap');
    if (fieldsWrap) fieldsWrap.hidden = !show;
    if (passWrap) passWrap.hidden = !show;
    if (confirmWrap) confirmWrap.hidden = !show;
    if (showPassWrap) showPassWrap.hidden = !show;
  }

  function syncEditProfilePasswordFields() {
    var requireCb = document.getElementById('editProfileRequirePasswordModal');
    var fieldsWrap = document.getElementById('editProfilePasswordFields');
    var passWrap = document.getElementById('editProfilePasswordWrap');
    var currentWrap = document.getElementById('editProfileCurrentPasswordWrap');
    var confirmWrap = document.getElementById('editProfilePasswordConfirmWrap');
    var show = !!(requireCb && requireCb.checked);
    var showPassWrap = document.getElementById('editProfileShowPasswordWrap');
    var hasExistingPassword = !!W._editProfileHasExistingPassword;
    if (fieldsWrap) fieldsWrap.hidden = !show;
    if (passWrap) passWrap.hidden = !show;
    if (currentWrap) currentWrap.hidden = !(show && hasExistingPassword);
    if (confirmWrap) confirmWrap.hidden = !show;
    if (showPassWrap) showPassWrap.hidden = !show;
  }

  function syncNewProfilePasswordVisibility() {
    var showCb = document.getElementById('newProfileShowPasswordModal');
    var passEl = document.getElementById('newProfilePasswordModal');
    var confirmEl = document.getElementById('newProfilePasswordConfirmModal');
    var visible = !!(showCb && showCb.checked);
    if (passEl) passEl.type = visible ? 'text' : 'password';
    if (confirmEl) confirmEl.type = visible ? 'text' : 'password';
  }

  function syncEditProfilePasswordVisibility() {
    var showCb = document.getElementById('editProfileShowPasswordModal');
    var currentEl = document.getElementById('editProfileCurrentPasswordModal');
    var passEl = document.getElementById('editProfilePasswordModal');
    var confirmEl = document.getElementById('editProfilePasswordConfirmModal');
    var visible = !!(showCb && showCb.checked);
    if (currentEl) currentEl.type = visible ? 'text' : 'password';
    if (passEl) passEl.type = visible ? 'text' : 'password';
    if (confirmEl) confirmEl.type = visible ? 'text' : 'password';
  }

  function bindProfilePasswordToggleHandlersOnce() {
    if (W._profilePasswordToggleHandlersBound) return;
    W._profilePasswordToggleHandlersBound = true;
    var newCb = document.getElementById('newProfileRequirePasswordModal');
    var editCb = document.getElementById('editProfileRequirePasswordModal');
    var newShowCb = document.getElementById('newProfileShowPasswordModal');
    var editShowCb = document.getElementById('editProfileShowPasswordModal');
    if (newCb) newCb.addEventListener('change', syncNewProfilePasswordFields);
    if (editCb) editCb.addEventListener('change', syncEditProfilePasswordFields);
    if (newShowCb) newShowCb.addEventListener('change', syncNewProfilePasswordVisibility);
    if (editShowCb) editShowCb.addEventListener('change', syncEditProfilePasswordVisibility);
  }

  W.handleProfileChange = async function handleProfileChange() {
    var selected = W.getProfile();
    var previous = W._lastAuthorizedProfile || selected;
    var granted = typeof W.requireProfileAccess === 'function'
      ? await W.requireProfileAccess(selected, { actionKey: 'profileAuth.actions.viewProfileTasks', action: 'View profile tasks' })
      : true;
    if (!granted) {
      var selBack = document.getElementById('profileSelect');
      if (selBack && previous) selBack.value = previous;
      return;
    }
    W._lastAuthorizedProfile = selected;
    try { localStorage.setItem('workingHoursLastProfile', selected); } catch (_) {}
    if (typeof W.refreshProfileRoleInput === 'function') W.refreshProfileRoleInput();
    var profileRoleEl = document.getElementById('profileRole');
    if (profileRoleEl) profileRoleEl.setAttribute('data-current-profile', W.getProfile());
    W.refreshFilterYearWeek();
    W.renderEntries();
    if (typeof W.updateEntryDateDuplicateHint === 'function') W.updateEntryDateDuplicateHint();
  };
  W.openNewProfileModal = function openNewProfileModal() {
    var nameEl = document.getElementById('newProfileNameModal');
    var roleEl = document.getElementById('newProfileRoleModal');
    var requireCb = document.getElementById('newProfileRequirePasswordModal');
    var showCb = document.getElementById('newProfileShowPasswordModal');
    var passEl = document.getElementById('newProfilePasswordModal');
    var confirmEl = document.getElementById('newProfilePasswordConfirmModal');
    if (nameEl) nameEl.value = '';
    if (roleEl) roleEl.value = '';
    if (requireCb) requireCb.checked = false;
    if (showCb) showCb.checked = false;
    if (passEl) passEl.value = '';
    if (confirmEl) confirmEl.value = '';
    bindProfilePasswordToggleHandlersOnce();
    syncNewProfilePasswordFields();
    syncNewProfilePasswordVisibility();
    document.getElementById('newProfileModal').classList.add('open');
    if (nameEl) nameEl.focus();
  };
  W.closeNewProfileModal = function closeNewProfileModal() {
    document.getElementById('newProfileModal').classList.remove('open');
  };
  W.openEditProfileModal = async function openEditProfileModal() {
    var current = W.getProfile();
    if (typeof W.requireProfileAccess === 'function') {
      var granted = await W.requireProfileAccess(current, { actionKey: 'profileAuth.actions.editProfileSettings', action: 'Edit profile settings' });
      if (!granted) return;
    }
    var requireCb = document.getElementById('editProfileRequirePasswordModal');
    var showCb = document.getElementById('editProfileShowPasswordModal');
    var currentPassEl = document.getElementById('editProfileCurrentPasswordModal');
    var passEl = document.getElementById('editProfilePasswordModal');
    var confirmEl = document.getElementById('editProfilePasswordConfirmModal');
    document.getElementById('editProfileOriginalName').value = current;
    document.getElementById('editProfileNameModal').value = current;
    document.getElementById('editProfileRoleModal').value = W.getProfileRole(current);
    W._editProfileHasExistingPassword = !!(typeof W.hasProfilePassword === 'function' && W.hasProfilePassword(current));
    if (requireCb) requireCb.checked = !!W._editProfileHasExistingPassword;
    if (showCb) showCb.checked = false;
    if (currentPassEl) currentPassEl.value = '';
    if (passEl) passEl.value = '';
    if (confirmEl) confirmEl.value = '';
    bindProfilePasswordToggleHandlersOnce();
    syncEditProfilePasswordFields();
    syncEditProfilePasswordVisibility();
    document.getElementById('editProfileModal').classList.add('open');
    document.getElementById('editProfileNameModal').focus();
  };
  W.closeEditProfileModal = function closeEditProfileModal() {
    document.getElementById('editProfileModal').classList.remove('open');
  };
  W.handleSaveEditProfile = async function handleSaveEditProfile() {
    var nameEl = document.getElementById('editProfileNameModal');
    var roleEl = document.getElementById('editProfileRoleModal');
    var originalNameEl = document.getElementById('editProfileOriginalName');
    var requirePasswordEl = document.getElementById('editProfileRequirePasswordModal');
    var currentPasswordEl = document.getElementById('editProfileCurrentPasswordModal');
    var passwordEl = document.getElementById('editProfilePasswordModal');
    var passwordConfirmEl = document.getElementById('editProfilePasswordConfirmModal');
    var newName = (nameEl && nameEl.value || '').trim();
    var originalName = (originalNameEl && originalNameEl.value || '').trim();
    var requirePassword = !!(requirePasswordEl && requirePasswordEl.checked);
    var currentPassword = currentPasswordEl && currentPasswordEl.value ? String(currentPasswordEl.value) : '';
    var password = passwordEl && passwordEl.value ? String(passwordEl.value) : '';
    var passwordConfirm = passwordConfirmEl && passwordConfirmEl.value ? String(passwordConfirmEl.value) : '';
    if (!newName) { alert((W.I18N && W.I18N.t) ? W.I18N.t('toasts.enterProfileName') : 'Enter a profile name.'); return; }
    var hadExistingPassword = typeof W.hasProfilePassword === 'function' ? W.hasProfilePassword(originalName) : false;
    var keepExistingPassword = false;
    if (requirePassword) {
      if (!password) {
        if (!hadExistingPassword) {
          alert((W.I18N && W.I18N.t) ? W.I18N.t('toasts.passwordRequiredWhenProfileProtected') : 'Password is required when profile protection is enabled.');
          return;
        }
        keepExistingPassword = true;
      } else if (password !== passwordConfirm) {
        alert((W.I18N && W.I18N.t) ? W.I18N.t('toasts.passwordConfirmationMismatch') : 'Password confirmation does not match.');
        return;
      }
    }
    if (requirePassword && hadExistingPassword && !keepExistingPassword) {
      if (!currentPassword) {
        alert((W.I18N && W.I18N.t) ? W.I18N.t('toasts.currentPasswordRequiredToChange') : 'Current password is required to change the profile password.');
        return;
      }
      if (typeof W.verifyProfilePassword === 'function') {
        var currentPasswordOk = await W.verifyProfilePassword(originalName, currentPassword);
        if (!currentPasswordOk) {
          alert((W.I18N && W.I18N.t) ? W.I18N.t('toasts.currentPasswordIncorrect') : 'Current password is incorrect.');
          return;
        }
      }
    }
    var data = W.getData();
    if (newName !== originalName) {
      if (data[newName] !== undefined && !Array.isArray(data[newName])) {
        alert((W.I18N && W.I18N.t) ? W.I18N.t('toasts.profileNameReservedOrUsed') : 'Profile name reserved or already in use.');
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
    if (typeof W.ensureProfileId === 'function') W.ensureProfileId(newName);
    try { localStorage.setItem('workingHoursLastProfile', newName); } catch (_) {}
    W.refreshFilterYearWeek();
    W.renderEntries();
    if (typeof W.setProfilePassword === 'function') {
      if (requirePassword) {
        if (!keepExistingPassword) await W.setProfilePassword(newName, password);
      } else {
        await W.setProfilePassword(newName, '');
      }
    }
  };
  W.handleAddProfile = async function handleAddProfile() {
    var nameEl = document.getElementById('newProfileNameModal');
    var roleElModal = document.getElementById('newProfileRoleModal');
    var requirePasswordEl = document.getElementById('newProfileRequirePasswordModal');
    var passwordEl = document.getElementById('newProfilePasswordModal');
    var passwordConfirmEl = document.getElementById('newProfilePasswordConfirmModal');
    const name = (nameEl && nameEl.value || '').trim();
    var requirePassword = !!(requirePasswordEl && requirePasswordEl.checked);
    var password = passwordEl && passwordEl.value ? String(passwordEl.value) : '';
    var passwordConfirm = passwordConfirmEl && passwordConfirmEl.value ? String(passwordConfirmEl.value) : '';
    if (!name) { alert((W.I18N && W.I18N.t) ? W.I18N.t('toasts.enterProfileName') : 'Enter a profile name.'); return; }
    if (requirePassword && !password) { alert((W.I18N && W.I18N.t) ? W.I18N.t('toasts.passwordRequiredWhenProfileProtected') : 'Password is required when profile protection is enabled.'); return; }
    if (requirePassword && password !== passwordConfirm) { alert((W.I18N && W.I18N.t) ? W.I18N.t('toasts.passwordConfirmationMismatch') : 'Password confirmation does not match.'); return; }
    const data = W.getData();
    if (data[name] !== undefined && !Array.isArray(data[name])) { alert((W.I18N && W.I18N.t) ? W.I18N.t('toasts.profileNameReserved') : 'Profile name reserved.'); return; }
    if (!data[name]) data[name] = [];
    W.setData(data);
    if (typeof W.setProfileRole === 'function' && roleElModal) {
      W.setProfileRole(name, roleElModal.value);
    }
    W.closeNewProfileModal();
    W.refreshProfileSelect();
    document.getElementById('profileSelect').value = name;
    if (typeof W.refreshProfileRoleInput === 'function') W.refreshProfileRoleInput();
    var roleEl = document.getElementById('profileRole');
    if (roleEl) roleEl.setAttribute('data-current-profile', name);
    if (typeof W.ensureProfileId === 'function') W.ensureProfileId(name);
    try { localStorage.setItem('workingHoursLastProfile', name); } catch (_) {}
    W.refreshFilterYearWeek();
    W.renderEntries();
    if (typeof W.setProfilePassword === 'function') {
      await W.setProfilePassword(name, requirePassword ? password : '');
    }
  };

  W.openDeleteProfileModal = function openDeleteProfileModal() {
    var names = W.getProfileNames();
    if (names.length <= 1) {
      var msg = (W.I18N && W.I18N.t) ? W.I18N.t('toasts.cannotDeleteOnlyProfile') : 'Cannot delete the only profile. Create another profile first.';
      if (typeof W.showToast === 'function') {
        W.showToast(msg, 'info');
      } else {
        alert(msg);
      }
      return;
    }
    document.getElementById('deleteProfileModal').classList.add('open');
  };

  W.closeDeleteProfileModal = function closeDeleteProfileModal() {
    document.getElementById('deleteProfileModal').classList.remove('open');
  };

  W.confirmDeleteProfile = async function confirmDeleteProfile() {
    var current = W.getProfile();
    if (typeof W.requireProfileAccess === 'function') {
      var granted = await W.requireProfileAccess(current, { actionKey: 'profileAuth.actions.deleteProfileTasks', action: 'Delete profile tasks' });
      if (!granted) return;
    }
    var data = W.getData();
    var names = W.getProfileNames();
    if (names.length <= 1) { W.closeDeleteProfileModal(); return; }
    delete data[current];
    var lastKey = 'lastClock_' + current;
    if (data[lastKey] !== undefined) delete data[lastKey];
    if (data.vacationDaysByProfile && data.vacationDaysByProfile[current] !== undefined) delete data.vacationDaysByProfile[current];
    if (data.profileMeta && data.profileMeta[current] !== undefined) delete data.profileMeta[current];
    W.setData(data);
    W.closeDeleteProfileModal();
    W.refreshProfileSelect();
    var next = W.getProfileNames()[0];
    if (document.getElementById('profileSelect')) document.getElementById('profileSelect').value = next;
    if (typeof W.refreshProfileRoleInput === 'function') W.refreshProfileRoleInput();
    var roleInput = document.getElementById('profileRole');
    if (roleInput) roleInput.setAttribute('data-current-profile', next);
    try { localStorage.setItem('workingHoursLastProfile', next); } catch (_) {}
    W._lastAuthorizedProfile = next;
    W.refreshFilterYearWeek();
    W.renderEntries();
  };
})(window.WorkHours);
