/**
 * Profile selection and dropdown.
 * Depends: storage (getData, setData).
 */
(function (W) {
  'use strict';
  W._profileAuthSession = W._profileAuthSession || {};

  function ensureProfileMeta(data) {
    if (!data.profileMeta || typeof data.profileMeta !== 'object') data.profileMeta = {};
  }

  function ensureProfileMetaRecord(data, profile) {
    ensureProfileMeta(data);
    if (!data.profileMeta[profile] || typeof data.profileMeta[profile] !== 'object') data.profileMeta[profile] = {};
  }

  function trOrFallback(key, fallback, subs) {
    try {
      if (W.I18N && typeof W.I18N.t === 'function') {
        var v = W.I18N.t(key, subs || {});
        if (v != null && v !== key) return v;
      }
    } catch (_) {}
    return fallback;
  }

  function getProfileAuthModalElements() {
    return {
      overlay: document.getElementById('profileAuthModal'),
      title: document.getElementById('profileAuthModalTitle'),
      desc: document.getElementById('profileAuthModalDescription'),
      profileChip: document.getElementById('profileAuthProfileChip'),
      profileName: document.getElementById('profileAuthProfileName'),
      actionHint: document.getElementById('profileAuthActionHint'),
      password: document.getElementById('profileAuthPassword'),
      showPassword: document.getElementById('profileAuthShowPassword'),
      confirmWrap: document.getElementById('profileAuthConfirmWrap'),
      confirm: document.getElementById('profileAuthConfirm'),
      error: document.getElementById('profileAuthError'),
      cancelBtn: document.getElementById('profileAuthCancel'),
      okBtn: document.getElementById('profileAuthOk')
    };
  }

  function setProfileAuthButtonLabel(btn, text) {
    if (!btn) return;
    var label = btn.querySelector('.btn-profile-label');
    if (label) label.textContent = text;
    else btn.textContent = text;
  }

  function setProfileAuthError(message) {
    var errorEl = document.getElementById('profileAuthError');
    if (!errorEl) return;
    var msg = String(message || '').trim();
    errorEl.textContent = msg;
    errorEl.hidden = !msg;
  }

  function closeProfileAuthModal(result) {
    if (!W._profileAuthModalResolver) return;
    var resolve = W._profileAuthModalResolver;
    W._profileAuthModalResolver = null;
    W._profileAuthOpenPromise = null;
    var overlay = document.getElementById('profileAuthModal');
    if (overlay) {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
    }
    setProfileAuthError('');
    resolve(result || { cancelled: true });
  }

  function submitProfileAuthModal() {
    var els = getProfileAuthModalElements();
    var pass = els.password ? String(els.password.value || '') : '';
    var conf = els.confirm ? String(els.confirm.value || '') : '';
    closeProfileAuthModal({ cancelled: false, password: pass, confirm: conf });
  }

  function ensureProfileAuthModalBindings() {
    if (W._profileAuthModalBound) return;
    var overlay = document.getElementById('profileAuthModal');
    if (!overlay) return;
    W._profileAuthModalBound = true;

    var cancelBtn = document.getElementById('profileAuthCancel');
    var okBtn = document.getElementById('profileAuthOk');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function (e) {
        e.preventDefault();
        closeProfileAuthModal({ cancelled: true });
      });
    }
    if (okBtn) {
      okBtn.addEventListener('click', function (e) {
        e.preventDefault();
        submitProfileAuthModal();
      });
    }

    var showPassword = document.getElementById('profileAuthShowPassword');
    if (showPassword) {
      showPassword.addEventListener('change', function () {
        var els = getProfileAuthModalElements();
        var visible = !!showPassword.checked;
        if (els.password) els.password.type = visible ? 'text' : 'password';
        if (els.confirm) els.confirm.type = visible ? 'text' : 'password';
      });
    }

    function bindAuthFieldEnter(fieldId) {
      var field = document.getElementById(fieldId);
      if (!field) return;
      field.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeProfileAuthModal({ cancelled: true });
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          submitProfileAuthModal();
        }
      });
    }
    bindAuthFieldEnter('profileAuthPassword');
    bindAuthFieldEnter('profileAuthConfirm');
  }

  function populateProfileAuthModal(cfg) {
    var els = getProfileAuthModalElements();
    if (els.title) els.title.textContent = cfg.title || 'Profile password';
    if (els.desc) {
      els.desc.textContent = cfg.description || trOrFallback(
        'profileAuth.passwordPromptLead',
        'Enter your password to continue.'
      );
    }
    if (els.profileChip && els.profileName) {
      var profileName = cfg.profileName ? String(cfg.profileName) : '';
      if (profileName) {
        els.profileName.textContent = profileName;
        els.profileChip.hidden = false;
        els.profileChip.style.display = '';
      } else {
        els.profileName.textContent = '';
        els.profileChip.hidden = true;
        els.profileChip.style.display = 'none';
      }
    }
    if (els.actionHint) {
      var actionLabel = cfg.actionLabel ? String(cfg.actionLabel) : '';
      if (actionLabel) {
        els.actionHint.textContent = '';
        els.actionHint.appendChild(document.createTextNode(trOrFallback('profileAuth.actionHintPrefix', 'Action:') + ' '));
        var actionStrong = document.createElement('strong');
        actionStrong.textContent = actionLabel;
        els.actionHint.appendChild(actionStrong);
        els.actionHint.hidden = false;
        els.actionHint.style.display = '';
      } else {
        els.actionHint.textContent = '';
        els.actionHint.hidden = true;
        els.actionHint.style.display = 'none';
      }
    }
    if (els.password) {
      els.password.value = '';
      els.password.type = 'password';
      els.password.placeholder = trOrFallback('profileAuth.passwordPlaceholder', 'Enter password');
    }
    if (els.showPassword) els.showPassword.checked = false;
    if (els.confirm) {
      els.confirm.value = '';
      els.confirm.type = 'password';
      els.confirm.placeholder = trOrFallback('profileAuth.confirmPasswordPlaceholder', 'Confirm password');
    }
    setProfileAuthError(cfg.error || '');
    var showConfirm = !!cfg.showConfirm;
    if (els.confirmWrap) {
      els.confirmWrap.hidden = !showConfirm;
      els.confirmWrap.style.display = showConfirm ? '' : 'none';
    }
    setProfileAuthButtonLabel(els.okBtn, cfg.okLabel || trOrFallback('profileAuth.unlockAction', 'Unlock'));
    setProfileAuthButtonLabel(els.cancelBtn, cfg.cancelLabel || trOrFallback('profileAuth.cancelAction', 'Cancel'));
    return els;
  }

  function openProfileAuthModal(config) {
    ensureProfileAuthModalBindings();
    if (W._profileAuthOpenPromise) return W._profileAuthOpenPromise;

    var els = getProfileAuthModalElements();
    if (!els.overlay) return Promise.resolve({ cancelled: true });
    var cfg = config || {};

    W._profileAuthOpenPromise = new Promise(function (resolve) {
      W._profileAuthModalResolver = resolve;
      populateProfileAuthModal(cfg);
      els.overlay.classList.add('open');
      els.overlay.setAttribute('aria-hidden', 'false');
      setTimeout(function () {
        var fresh = getProfileAuthModalElements();
        if (fresh.password) fresh.password.focus();
      }, 0);
    });
    return W._profileAuthOpenPromise;
  }

  async function hashPassword(password) {
    var raw = String(password == null ? '' : password);
    if (!raw) return '';
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
        var digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
        return Array.from(new Uint8Array(digest)).map(function (b) {
          return b.toString(16).padStart(2, '0');
        }).join('');
      }
    } catch (_) {}
    // Fallback (non-cryptographic) for older runtimes without SubtleCrypto.
    var h = 2166136261;
    for (var i = 0; i < raw.length; i++) {
      h ^= raw.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return 'fallback-' + (h >>> 0).toString(16);
  }

  W.getProfilePasswordHash = function getProfilePasswordHash(profile) {
    if (!profile) return '';
    var data = W.getData();
    var meta = data.profileMeta;
    if (!meta || typeof meta[profile] !== 'object') return '';
    var hash = meta[profile].passwordHash || meta[profile].passwordEncrypted;
    return hash ? String(hash) : '';
  };

  W.hasProfilePassword = function hasProfilePassword(profile) {
    return !!W.getProfilePasswordHash(profile);
  };

  W.isProfileAccessUnlocked = function isProfileAccessUnlocked(profile) {
    if (!profile) return true;
    if (!W.hasProfilePassword(profile)) return true;
    return !!(W._profileAuthSession && W._profileAuthSession[profile]);
  };

  W.clearProfileAccessSession = function clearProfileAccessSession(profile) {
    if (!W._profileAuthSession) W._profileAuthSession = {};
    if (!profile) return;
    delete W._profileAuthSession[profile];
  };

  W.grantProfileAccessSession = function grantProfileAccessSession(profile) {
    if (!profile) return;
    if (!W._profileAuthSession) W._profileAuthSession = {};
    W._profileAuthSession[profile] = true;
  };

  W.setProfilePassword = async function setProfilePassword(profile, password) {
    if (!profile) return false;
    var data = W.getData();
    ensureProfileMetaRecord(data, profile);
    var raw = String(password == null ? '' : password);
    if (!raw) {
      delete data.profileMeta[profile].passwordHash;
      delete data.profileMeta[profile].passwordEncrypted;
      W.setData(data);
      W.clearProfileAccessSession(profile);
      return true;
    }
    data.profileMeta[profile].passwordHash = await hashPassword(raw);
    data.profileMeta[profile].passwordEncrypted = data.profileMeta[profile].passwordHash;
    W.setData(data);
    W.grantProfileAccessSession(profile);
    return true;
  };

  W.verifyProfilePassword = async function verifyProfilePassword(profile, password) {
    var expected = W.getProfilePasswordHash(profile);
    if (!expected) return true;
    var actual = await hashPassword(password);
    return actual === expected;
  };

  W.requireProfileAccess = async function requireProfileAccess(profile, opts) {
    var options = opts || {};
    if (!profile) return true;
    if (W.isProfileAccessUnlocked(profile)) return true;
    var action = options.action || 'Access profile tasks';
    if (options.actionKey) action = trOrFallback(options.actionKey, action);
    var authConfig = {
      title: trOrFallback('profileAuth.unlockTitle', 'Unlock profile'),
      description: trOrFallback('profileAuth.passwordPromptLead', 'Enter your password to continue.'),
      profileName: profile,
      actionLabel: action,
      showConfirm: false,
      okLabel: trOrFallback('profileAuth.unlockAction', 'Unlock'),
      cancelLabel: trOrFallback('profileAuth.cancelAction', 'Cancel')
    };
    var invalidMsg = trOrFallback('profileAuth.invalidPassword', 'Invalid profile password.');
    while (true) {
      var modalResult = await openProfileAuthModal(authConfig);
      if (!modalResult || modalResult.cancelled) return false;
      var ok = await W.verifyProfilePassword(profile, modalResult.password);
      if (ok) {
        W.grantProfileAccessSession(profile);
        return true;
      }
      authConfig.error = invalidMsg;
      if (typeof W.showToast === 'function') W.showToast(invalidMsg, 'warning');
    }
  };

  W.getProfile = function getProfile() {
    const sel = document.getElementById('profileSelect');
    return (sel && sel.value) ? sel.value : 'Default';
  };
  function getProfileNamesFromData(data) {
    return Object.keys(data || {}).filter(function (k) {
      return k.indexOf('lastClock_') !== 0 && k !== 'vacationDaysByProfile' && k !== 'profileMeta';
    }).sort();
  }
  function pruneLegacyProfilesWhenOtherProfilesExist(data) {
    if (!data || typeof data !== 'object') return false;
    var names = getProfileNamesFromData(data);
    if (names.length <= 1) return false;
    var removedAny = false;
    names.forEach(function (name) {
      var lower = String(name || '').toLowerCase();
      if (lower !== 'default' && lower !== 'demo') return;
      delete data[name];
      if (data.profileMeta && typeof data.profileMeta === 'object') delete data.profileMeta[name];
      if (data.vacationDaysByProfile && typeof data.vacationDaysByProfile === 'object') delete data.vacationDaysByProfile[name];
      var lastKey = 'lastClock_' + name;
      if (Object.prototype.hasOwnProperty.call(data, lastKey)) delete data[lastKey];
      if (W._profileAuthSession && typeof W._profileAuthSession === 'object') delete W._profileAuthSession[name];
      removedAny = true;
    });
    return removedAny;
  }
  W.getProfileNames = function getProfileNames() {
    const data = W.getData();
    return getProfileNamesFromData(data);
  };
  W.getProfileRole = function getProfileRole(profile) {
    var data = W.getData();
    var meta = data.profileMeta;
    if (!meta || typeof meta[profile] !== 'object') return '';
    return meta[profile].role != null ? String(meta[profile].role) : '';
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
  W.refreshProfileActionsStaticText = function refreshProfileActionsStaticText() {
    if (!W.I18N || !W.I18N.t) return;
    var t = W.I18N.t;
    var exportBtn = document.getElementById('exportBtn');
    var importBtn = document.getElementById('importBtn');
    if (exportBtn) exportBtn.setAttribute('aria-label', t('toolbar.exportBtnAria'));
    if (importBtn) importBtn.setAttribute('aria-label', t('toolbar.importBtnAria'));
    var exportPanel = document.querySelector('#exportDropdown .import-dropdown-panel');
    var importPanel = document.querySelector('#importDropdown .import-dropdown-panel');
    if (exportPanel) exportPanel.setAttribute('aria-label', t('toolbar.exportMenuAria'));
    if (importPanel) importPanel.setAttribute('aria-label', t('toolbar.importMenuAria'));
  };
  W.refreshProfileSelect = function refreshProfileSelect() {
    const data = W.getData();
    var changed = pruneLegacyProfilesWhenOtherProfilesExist(data);
    var names = getProfileNamesFromData(data);
    if (names.length === 0) {
      data['Default'] = [];
      changed = true;
      names = ['Default'];
    }
    if (changed) W.setData(data);
    const sel = document.getElementById('profileSelect');
    const current = sel.value;
    sel.innerHTML = names.map(function (n) { return '<option value="' + n + '">' + n + '</option>'; }).join('');
    if (names.indexOf(current) !== -1) sel.value = current;
    else sel.value = names[0];
  };
})(window.WorkHours);
