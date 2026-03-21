/**
 * Init and event binding.
 * Depends: all other modules.
 */
(function (W) {
  'use strict';
  W.updateInternetStatusIndicator = function updateInternetStatusIndicator() {
    var iconEl = document.getElementById('internetStatusIcon');
    var badgeEl = document.getElementById('internetStatusBadge');
    if (!iconEl && !badgeEl) return;
    var online = typeof navigator !== 'undefined' && navigator.onLine === true;
    if (iconEl) {
      iconEl.classList.toggle('is-online', online);
      iconEl.classList.toggle('is-offline', !online);
    }
    if (badgeEl) {
      badgeEl.classList.toggle('is-online', online);
      badgeEl.classList.toggle('is-offline', !online);
    }

    var t = W.I18N && typeof W.I18N.t === 'function' ? W.I18N.t : null;
    var msg = online
      ? (t ? t('common.internetStatus.on') : 'Internet is on')
      : (t ? t('common.internetStatus.off') : 'Internet is offline');
    if (badgeEl) {
      badgeEl.setAttribute('aria-label', msg);
      badgeEl.setAttribute('title', msg);
    } else if (iconEl) {
      iconEl.setAttribute('aria-label', msg);
      iconEl.setAttribute('title', msg);
    }
  };
  W.showToast = function showToast(message, kind) {
    var container = document.getElementById('toastContainer');
    if (!container) {
      if (message) alert(message);
      return;
    }
    var el = document.createElement('div');
    el.className = 'toast toast--' + (kind || 'info');
    el.textContent = message;
    container.appendChild(el);
    // trigger transition
    setTimeout(function () { el.classList.add('is-visible'); }, 10);
    setTimeout(function () {
      el.classList.remove('is-visible');
      setTimeout(function () {
        if (el.parentNode === container) container.removeChild(el);
      }, 200);
    }, 4000);
  };
  W.restoreLastProfile = function restoreLastProfile() {
    try {
      const last = localStorage.getItem('workingHoursLastProfile');
      if (last && W.getProfileNames().indexOf(last) !== -1) document.getElementById('profileSelect').value = last;
    } catch (_) {}
  };
  W.bindFilterListeners = function bindFilterListeners() {
    var filterIds = ['filterYear', 'filterMonth', 'filterDay', 'filterWeek', 'filterDayName', 'filterDayStatus', 'filterLocation', 'filterOvertime', 'filterDescription'];
    filterIds.forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('change', function () {
        if (id === 'filterYear' && el.value === '') {
          filterIds.forEach(function (otherId) {
            if (otherId === 'filterYear') return;
            var other = document.getElementById(otherId);
            if (other) other.value = '';
          });
          if (typeof W.clearCalendarSelection === 'function') W.clearCalendarSelection();
        }
        if (id === 'filterYear' || id === 'filterMonth') {
          var dayEl = document.getElementById('filterDay');
          if (dayEl) dayEl.value = '';
          if (typeof W.clearCalendarSelection === 'function') W.clearCalendarSelection();
          W.syncCalendarFromFilters();
        }
        if (id === 'filterDay') {
          if (typeof W.clearCalendarSelection === 'function') W.clearCalendarSelection();
        }
        W.renderEntries();
        if (typeof W.renderCalendar === 'function') W.renderCalendar();
      });
    });
  };
  W.bindCalendarListeners = function bindCalendarListeners() {
    var prevEl = document.getElementById('calendarPrev');
    var nextEl = document.getElementById('calendarNext');
    var gridEl = document.getElementById('calendarGrid');
    if (prevEl) prevEl.addEventListener('click', function () {
      var cal = W.getCalendarMonth();
      var d = new Date(cal.year, cal.month - 1 - 1, 1);
      W.setCalendarMonth(d.getFullYear(), d.getMonth() + 1);
      W.syncFiltersFromCalendar();
      W.renderEntries();
      if (typeof W.renderCalendar === 'function') W.renderCalendar();
    });
    if (nextEl) nextEl.addEventListener('click', function () {
      var cal = W.getCalendarMonth();
      var d = new Date(cal.year, cal.month - 1 + 1, 1);
      W.setCalendarMonth(d.getFullYear(), d.getMonth() + 1);
      W.syncFiltersFromCalendar();
      W.renderEntries();
      if (typeof W.renderCalendar === 'function') W.renderCalendar();
    });
    if (gridEl) gridEl.addEventListener('click', function (e) {
      var cell = e.target.closest('.calendar-day[data-date]');
      if (cell && cell.getAttribute('data-date')) {
        W.toggleCalendarDate(cell.getAttribute('data-date'));
      }
    });
  };
  W.applyTheme = function applyTheme(themeKey) {
    var allowed = [
      'indonesia', 'dark', 'germany',
      'ukraine', 'france', 'poland',
      'spain', 'italy', 'netherlands',
      'belgium', 'sweden', 'norway',
      'finland', 'denmark', 'switzerland',
      'austria', 'ireland', 'portugal',
      'czechia', 'greece',
      'us', 'eu', 'japan',
      'brazil', 'china', 'india', 'mexico', 'southafrica',
      'canada', 'uk',
      'argentina', 'australia', 'russia', 'saudiarabia', 'southkorea', 'turkey'
    ];
    var key = themeKey && allowed.indexOf(themeKey) !== -1 ? themeKey : 'indonesia';
    try {
      localStorage.setItem('workingHoursTheme', key);
    } catch (_) {}
    if (document && document.body) {
      document.body.setAttribute('data-theme', key);
    }
    var sel = document.getElementById('themeSelect');
    if (sel && sel.value !== key) sel.value = key;
  };

  W.initTheme = function initTheme() {
    var stored = null;
    try {
      stored = localStorage.getItem('workingHoursTheme');
    } catch (_) {}
    W.applyTheme(stored || 'indonesia');
    var sel = document.getElementById('themeSelect');
    if (sel) {
      sel.addEventListener('change', function () {
        W.applyTheme(sel.value);
      });
    }
  };

  W.bindEventListeners = function bindEventListeners() {
    var clockInBtn = document.getElementById('clockInBtn');
    if (clockInBtn) clockInBtn.addEventListener('click', W.clockIn);
    var clockOutBtn = document.getElementById('clockOutBtn');
    if (clockOutBtn) clockOutBtn.addEventListener('click', W.clockOut);
    var profileSelect = document.getElementById('profileSelect');
    if (profileSelect) profileSelect.addEventListener('change', W.handleProfileChange);
    var newProfileBtn = document.getElementById('newProfileBtn');
    if (newProfileBtn) newProfileBtn.addEventListener('click', W.openNewProfileModal);
    var editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) editProfileBtn.addEventListener('click', W.openEditProfileModal);
    var deleteProfileBtn = document.getElementById('deleteProfileBtn');
    if (deleteProfileBtn) deleteProfileBtn.addEventListener('click', W.openDeleteProfileModal);
    var vacationDaysBtn = document.getElementById('vacationDaysBtn');
    if (vacationDaysBtn && typeof W.openVacationDaysModal === 'function') {
      vacationDaysBtn.addEventListener('click', W.openVacationDaysModal);
    }
    var saveDataBtn = document.getElementById('saveDataBtn');
    if (saveDataBtn && typeof W.saveWorkingHoursDataToFile === 'function') {
      saveDataBtn.addEventListener('click', function () {
        W.saveWorkingHoursDataToFile(true);
      });
    }
    var syncDataBtn = document.getElementById('syncDataBtn');
    var syncDataFileInput = document.getElementById('syncDataFileInput');
    if (syncDataBtn && syncDataFileInput && typeof W.handleWorkingHoursDataFile === 'function') {
      // Fallback manual sync handler (file chooser)
      W._fallbackManualSync = function () {
        syncDataFileInput.value = '';
        syncDataFileInput.click();
      };
      syncDataFileInput.addEventListener('change', function () {
        var file = syncDataFileInput.files && syncDataFileInput.files[0];
        if (!file) return;
        W.handleWorkingHoursDataFile(file);
      });
      syncDataBtn.addEventListener('click', function () {
        if (typeof W.syncWorkingHoursData === 'function') {
          W.syncWorkingHoursData(W._fallbackManualSync);
        } else {
          W._fallbackManualSync();
        }
      });
    }
    var profileRoleEl = document.getElementById('profileRole');
    if (profileRoleEl) profileRoleEl.setAttribute('data-current-profile', W.getProfile());
    document.getElementById('saveEntry').addEventListener('click', W.handleSaveEntry);
    var voiceEntryBtn = document.getElementById('voiceEntryBtn');
    if (voiceEntryBtn && typeof W.startVoiceEntry === 'function') {
      voiceEntryBtn.addEventListener('click', W.startVoiceEntry);
    }
    var voiceReviewModal = document.getElementById('voiceReviewModal');
    if (voiceReviewModal) {
      document.getElementById('voiceReviewModalClose').addEventListener('click', W.closeVoiceReviewModal);
      document.getElementById('voiceReviewModalCancel').addEventListener('click', W.closeVoiceReviewModal);
      document.getElementById('voiceReviewModalApply').addEventListener('click', W.applyVoiceReviewAndClose);
      var voiceReviewRetakeBtn = document.getElementById('voiceReviewRetakeBtn');
      if (voiceReviewRetakeBtn && typeof W.startVoiceRetake === 'function') {
        voiceReviewRetakeBtn.addEventListener('click', W.startVoiceRetake);
      }
      voiceReviewModal.addEventListener('click', function (e) { if (e.target === voiceReviewModal) W.closeVoiceReviewModal(); });
      var voiceReviewStatus = document.getElementById('voiceReviewStatus');
      if (voiceReviewStatus && typeof W.syncVoiceReviewLocation === 'function') {
        voiceReviewStatus.addEventListener('change', W.syncVoiceReviewLocation);
      }
    }
    document.getElementById('entryStatus').addEventListener('change', function () {
      if (document.getElementById('entryStatus').value !== 'work') W.applyNonWorkDefaultsToEntryForm();
      if (typeof W.syncEntryLocationForStatus === 'function') W.syncEntryLocationForStatus();
    });
    if (typeof W.syncEntryLocationForStatus === 'function') W.syncEntryLocationForStatus();
    (function bindBreakFieldLimitsAll() {
      function bindOne(valueId, unitId) {
        var inp = document.getElementById(valueId);
        var sel = document.getElementById(unitId);
        if (!inp || !sel || typeof W.syncBreakInputLimits !== 'function') return;
        var sync = function () {
          W.syncBreakInputLimits(valueId, unitId);
        };
        sel.addEventListener('change', sync);
        inp.addEventListener('input', sync);
        inp.addEventListener('blur', sync);
        sync();
      }
      bindOne('entryBreak', 'entryBreakUnit');
      bindOne('editBreak', 'editBreakUnit');
      bindOne('voiceReviewBreak', 'voiceReviewBreakUnit');
    })();
    (function () {
      var exportDropdown = document.getElementById('exportDropdown');
      var exportBtn = document.getElementById('exportBtn');
      var exportDropdownCsv = document.getElementById('exportDropdownCsv');
      var exportDropdownJson = document.getElementById('exportDropdownJson');
      var hoverCloseTimer = null;
      var HOVER_CLOSE_DELAY_MS = 220;

      function closeExportDropdown() {
        if (exportDropdown) exportDropdown.classList.remove('is-open');
        if (exportBtn) exportBtn.setAttribute('aria-expanded', 'false');
      }
      function openExportDropdown() {
        // Ensure import dropdown is closed so only one is visible
        var importDropdown = document.getElementById('importDropdown');
        var importBtn = document.getElementById('importBtn');
        if (importDropdown) importDropdown.classList.remove('is-open');
        if (importBtn) importBtn.setAttribute('aria-expanded', 'false');
        if (exportDropdown) exportDropdown.classList.add('is-open');
        if (exportBtn) exportBtn.setAttribute('aria-expanded', 'true');
      }
      function cancelHoverClose() {
        if (hoverCloseTimer) {
          clearTimeout(hoverCloseTimer);
          hoverCloseTimer = null;
        }
      }
      function scheduleHoverClose() {
        cancelHoverClose();
        hoverCloseTimer = setTimeout(function () {
          hoverCloseTimer = null;
          closeExportDropdown();
        }, HOVER_CLOSE_DELAY_MS);
      }

      if (exportBtn) {
        exportBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          var isOpen = exportDropdown && exportDropdown.classList.contains('is-open');
          if (isOpen) closeExportDropdown(); else openExportDropdown();
        });
      }
      if (exportDropdown) {
        exportDropdown.addEventListener('mouseenter', function () {
          cancelHoverClose();
          openExportDropdown();
        });
        exportDropdown.addEventListener('mouseleave', function () {
          scheduleHoverClose();
        });
        exportDropdown.addEventListener('click', function (e) { e.stopPropagation(); });
      }

      if (exportDropdownCsv && typeof W.exportToCsv === 'function') {
        exportDropdownCsv.addEventListener('click', function () {
          cancelHoverClose();
          closeExportDropdown();
          W.exportToCsv();
        });
      }
      if (exportDropdownJson && typeof W.exportToJson === 'function') {
        exportDropdownJson.addEventListener('click', function () {
          cancelHoverClose();
          closeExportDropdown();
          W.exportToJson();
        });
      }
    })();
    document.getElementById('statsSummaryBtn').addEventListener('click', W.openStatsSummaryModal);
    document.getElementById('infographicBtn').addEventListener('click', W.openInfographicModal);
    var entriesFullscreenBtn = document.getElementById('entriesFullscreenBtn');
    var filtersEntriesCard = document.getElementById('filtersEntriesCard');
    if (entriesFullscreenBtn && filtersEntriesCard) {
      var entriesModalContainer = document.getElementById('entriesFullscreenModalContainer');
      var editModalEl = document.getElementById('editModal');
      var deleteModalEl = document.getElementById('deleteConfirmModal');
      var entriesModalsOriginalParent = document.body;
      function isEntriesFullscreenActive() {
        return document.fullscreenElement === filtersEntriesCard || document.webkitFullscreenElement === filtersEntriesCard || document.msFullscreenElement === filtersEntriesCard;
      }
      function moveEntriesModalsToCard() {
        if (!entriesModalContainer || !editModalEl || !deleteModalEl) return;
        if (editModalEl.parentNode !== entriesModalContainer) {
          entriesModalContainer.appendChild(editModalEl);
          entriesModalContainer.appendChild(deleteModalEl);
        }
      }
      function moveEntriesModalsToBody() {
        if (!editModalEl || !deleteModalEl) return;
        if (editModalEl.parentNode !== entriesModalsOriginalParent) {
          entriesModalsOriginalParent.appendChild(editModalEl);
          entriesModalsOriginalParent.appendChild(deleteModalEl);
        }
      }
      entriesFullscreenBtn.addEventListener('click', function () {
        var inFullscreen = isEntriesFullscreenActive();
        if (inFullscreen) {
          if (document.exitFullscreen) document.exitFullscreen();
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
          else if (document.msExitFullscreen) document.msExitFullscreen();
        } else {
          moveEntriesModalsToCard();
          if (filtersEntriesCard.requestFullscreen) filtersEntriesCard.requestFullscreen();
          else if (filtersEntriesCard.webkitRequestFullscreen) filtersEntriesCard.webkitRequestFullscreen();
          else if (filtersEntriesCard.msRequestFullscreen) filtersEntriesCard.msRequestFullscreen();
        }
      });
      W.moveEntriesModalsToCard = moveEntriesModalsToCard;
      W.moveEntriesModalsToBody = moveEntriesModalsToBody;
      W.isEntriesFullscreenActive = isEntriesFullscreenActive;
      W._pendingEditEntry = null;
      W._pendingEditBatchOrderedIds = null;
      W._pendingDeleteConfirm = null;
    }
    var keyHighlightsPptBtn = document.getElementById('keyHighlightsPptBtn');
    if (keyHighlightsPptBtn && typeof W.openKeyHighlightsPptModal === 'function') {
      keyHighlightsPptBtn.addEventListener('click', W.openKeyHighlightsPptModal);
    }
    var keyHighlightsPptModal = document.getElementById('keyHighlightsPptModal');
    if (keyHighlightsPptModal) {
      keyHighlightsPptModal.addEventListener('click', function (e) {
        if (e.target.id === 'keyHighlightsPptModal') W.closeKeyHighlightsPptModal();
      });
    }
    var keyHighlightsPptModalClose = document.getElementById('keyHighlightsPptModalClose');
    if (keyHighlightsPptModalClose && typeof W.closeKeyHighlightsPptModal === 'function') {
      keyHighlightsPptModalClose.addEventListener('click', W.closeKeyHighlightsPptModal);
    }
    var keyHighlightsPptModalCancel = document.getElementById('keyHighlightsPptModalCancel');
    if (keyHighlightsPptModalCancel && typeof W.closeKeyHighlightsPptModal === 'function') {
      keyHighlightsPptModalCancel.addEventListener('click', W.closeKeyHighlightsPptModal);
    }
    var keyHighlightsPptGenerateBtn = document.getElementById('keyHighlightsPptGenerateBtn');
    if (keyHighlightsPptGenerateBtn && typeof W.generateKeyHighlightsPpt === 'function') {
      keyHighlightsPptGenerateBtn.addEventListener('click', function () { W.generateKeyHighlightsPpt(); });
    }
    (function () {
      var importDropdown = document.getElementById('importDropdown');
      var importBtn = document.getElementById('importBtn');
      var importDropdownPanel = importDropdown ? importDropdown.querySelector('.import-dropdown-panel') : null;
      var importDropdownCsv = document.getElementById('importDropdownCsv');
      var importDropdownJson = document.getElementById('importDropdownJson');
      var hoverCloseTimer = null;
      var HOVER_CLOSE_DELAY_MS = 220;

      function closeImportDropdown() {
        if (importDropdown) importDropdown.classList.remove('is-open');
        if (importBtn) importBtn.setAttribute('aria-expanded', 'false');
      }
      function openImportDropdown() {
        // Ensure export dropdown is closed so only one is visible
        var exportDropdown = document.getElementById('exportDropdown');
        var exportBtn = document.getElementById('exportBtn');
        if (exportDropdown) exportDropdown.classList.remove('is-open');
        if (exportBtn) exportBtn.setAttribute('aria-expanded', 'false');
        if (importDropdown) importDropdown.classList.add('is-open');
        if (importBtn) importBtn.setAttribute('aria-expanded', 'true');
      }
      function cancelHoverClose() {
        if (hoverCloseTimer) {
          clearTimeout(hoverCloseTimer);
          hoverCloseTimer = null;
        }
      }
      function scheduleHoverClose() {
        cancelHoverClose();
        hoverCloseTimer = setTimeout(function () {
          hoverCloseTimer = null;
          closeImportDropdown();
        }, HOVER_CLOSE_DELAY_MS);
      }

      if (importBtn) {
        importBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          var isOpen = importDropdown && importDropdown.classList.contains('is-open');
          if (isOpen) closeImportDropdown(); else openImportDropdown();
        });
      }
      document.addEventListener('click', function () {
        cancelHoverClose();
        closeImportDropdown();
      });
      if (importDropdown) importDropdown.addEventListener('click', function (e) { e.stopPropagation(); });

      if (importDropdown) {
        importDropdown.addEventListener('mouseenter', function () {
          cancelHoverClose();
          openImportDropdown();
        });
        importDropdown.addEventListener('mouseleave', function () {
          scheduleHoverClose();
        });
      }
      if (importDropdownPanel) {
        importDropdownPanel.addEventListener('mouseenter', function () {
          cancelHoverClose();
          openImportDropdown();
        });
        importDropdownPanel.addEventListener('mouseleave', function () {
          scheduleHoverClose();
        });
      }

      if (importDropdownCsv) {
        importDropdownCsv.addEventListener('click', function () {
          cancelHoverClose();
          closeImportDropdown();
          var el = document.getElementById('importCsvInput');
          if (el) el.click();
        });
      }
      if (importDropdownJson) {
        importDropdownJson.addEventListener('click', function () {
          cancelHoverClose();
          closeImportDropdown();
          var el = document.getElementById('importJsonInput');
          if (el) el.click();
        });
      }
    })();
    var importCsvInput = document.getElementById('importCsvInput');
    if (importCsvInput) {
      importCsvInput.addEventListener('change', function () {
        var file = importCsvInput.files && importCsvInput.files[0];
        importCsvInput.value = '';
        if (!file) return;
        W.handleImportCsv(file).then(function (result) {
          if (result.errors && result.errors.length) {
            W.showToast((W.I18N && W.I18N.t) ? W.I18N.t('toasts.importRowsIssues', { errors: result.errors.slice(0, 3).join('; ') }) : ('Some rows had issues: ' + result.errors.slice(0, 3).join('; ')), 'warning');
          }
          if (result.imported) {
            W.renderEntries();
            if (typeof W.syncCalendarFromFilters === 'function') W.syncCalendarFromFilters();
            if (typeof W.renderCalendar === 'function') W.renderCalendar();
          }
        });
      });
    }
    var importJsonInput = document.getElementById('importJsonInput');
    if (importJsonInput) {
      importJsonInput.addEventListener('change', function () {
        var file = importJsonInput.files && importJsonInput.files[0];
        importJsonInput.value = '';
        if (!file) return;
        W.handleImportJson(file).then(function (result) {
          if (result.errors && result.errors.length) {
            W.showToast((W.I18N && W.I18N.t) ? W.I18N.t('toasts.importRowsIssues', { errors: result.errors.slice(0, 3).join('; ') }) : ('Some rows had issues: ' + result.errors.slice(0, 3).join('; ')), 'warning');
          }
          if (result.imported) {
            W.renderEntries();
            if (typeof W.syncCalendarFromFilters === 'function') W.syncCalendarFromFilters();
            if (typeof W.renderCalendar === 'function') W.renderCalendar();
          }
        });
      });
    }
    document.getElementById('editEntryBtn').addEventListener('click', function () {
      if (typeof W.isEntriesFullscreenActive === 'function' && W.isEntriesFullscreenActive()) {
        var container = document.getElementById('entriesFullscreenModalContainer');
        var editModalEl = document.getElementById('editModal');
        if (container && editModalEl && !container.contains(editModalEl)) {
          var ids = W._selectedEntryIds || [];
          if (ids.length >= 1 && typeof W.getSelectedEntryIdsSortedForEdit === 'function') {
            var ordered = W.getSelectedEntryIdsSortedForEdit();
            if (ordered.length) {
              W._pendingEditBatchOrderedIds = ordered;
              W._pendingEditEntry = null;
              if (document.exitFullscreen) document.exitFullscreen();
              else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
              else if (document.msExitFullscreen) document.msExitFullscreen();
              return;
            }
          }
        }
      }
      W.editSelectedEntry();
    });
    document.getElementById('deleteEntryBtn').addEventListener('click', function () {
      if (typeof W.isEntriesFullscreenActive === 'function' && W.isEntriesFullscreenActive()) {
        var container = document.getElementById('entriesFullscreenModalContainer');
        var deleteModalEl = document.getElementById('deleteConfirmModal');
        if (container && deleteModalEl && !container.contains(deleteModalEl)) {
          var ids = W._selectedEntryIds || [];
          if (ids.length > 0) {
            var idSet = {};
            ids.forEach(function (id) { idSet[id] = true; });
            W._pendingDeleteConfirm = {
              callback: function () {
                W.setEntries(W.getEntries().filter(function (e) { return !idSet[e.id]; }));
                W._selectedEntryIds = [];
                W.renderEntries();
              },
              count: ids.length
            };
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
            return;
          }
        }
      }
      W.deleteSelectedEntry();
    });
    var showAllEl = document.getElementById('entriesShowAllDates');
    if (showAllEl) {
      W._entriesShowAllDates = showAllEl.checked;
      showAllEl.addEventListener('change', function () {
        W._entriesShowAllDates = showAllEl.checked;
        // Make the tooltip + screen-reader label reflect current state.
        if (W.I18N && typeof W.I18N.t === 'function') {
          var label = showAllEl.parentElement;
          if (label) {
            var stateTitle = showAllEl.checked
              ? W.I18N.t('filtersEntries.showAllDates')
              : W.I18N.t('filtersEntries.showUpToCurrentDate');
            label.setAttribute('title', stateTitle);
            var sr = label.querySelector('.entries-show-all-dates-label');
            if (sr) sr.textContent = stateTitle;
          }
        }
        W.renderEntries();
        if (typeof W.renderCalendar === 'function') W.renderCalendar();
        if (typeof W.renderStatsBox === 'function') W.renderStatsBox();
      });
    }
    var resetFiltersBtn = document.getElementById('resetFiltersBtn');
    if (resetFiltersBtn && typeof W.resetAllFilters === 'function') resetFiltersBtn.addEventListener('click', W.resetAllFilters);
    var resetSelectionBtn = document.getElementById('resetSelectionBtn');
    if (resetSelectionBtn && typeof W.clearEntrySelection === 'function') resetSelectionBtn.addEventListener('click', W.clearEntrySelection);
    var entriesViewTimezone = document.getElementById('entriesViewTimezone');
    if (entriesViewTimezone) {
      entriesViewTimezone.addEventListener('change', function () {
        W._entriesViewTimezone = entriesViewTimezone.value || '';
        if (typeof W.renderEntries === 'function') W.renderEntries();
      });
    }
    var filtersPanel = document.querySelector('.filters-panel');
    var filtersModeBasic = document.getElementById('filtersModeBasic');
    var filtersModeAdvanced = document.getElementById('filtersModeAdvanced');
    if (filtersPanel && filtersModeBasic && filtersModeAdvanced) {
      var setFiltersMode = function (mode) {
        filtersPanel.setAttribute('data-mode', mode);
        var isBasic = mode === 'basic';
        filtersModeBasic.classList.toggle('is-active', isBasic);
        filtersModeAdvanced.classList.toggle('is-active', !isBasic);
        filtersModeBasic.setAttribute('aria-pressed', isBasic ? 'true' : 'false');
        filtersModeAdvanced.setAttribute('aria-pressed', !isBasic ? 'true' : 'false');

        // Keep layout stable, but prevent interaction with advanced selects in Basic mode.
        var advSelects = filtersPanel.querySelectorAll('.filter-item--advanced select');
        if (advSelects && advSelects.length) {
          advSelects.forEach(function (sel) {
            if (!sel) return;
            sel.disabled = isBasic;
            if (sel.disabled) sel.setAttribute('aria-disabled', 'true');
            else sel.removeAttribute('aria-disabled');
          });
        }

        // Mode affects filtering semantics; re-render immediately.
        if (typeof W.renderEntries === 'function') W.renderEntries();
        if (typeof W.renderCalendar === 'function') W.renderCalendar();
        if (typeof W.renderStatsBox === 'function') W.renderStatsBox();
      };
      filtersModeBasic.addEventListener('click', function () { setFiltersMode('basic'); });
      filtersModeAdvanced.addEventListener('click', function () { setFiltersMode('advanced'); });
      setFiltersMode('basic');
    }
    document.getElementById('editModalCancel').addEventListener('click', W.closeEditModal);
    document.getElementById('editModalSave').addEventListener('click', W.saveEditEntry);
    document.getElementById('editModal').addEventListener('click', function (e) { if (e.target.id === 'editModal') W.closeEditModal(); });
    var editModalVoiceBtn = document.getElementById('editModalVoiceBtn');
    if (editModalVoiceBtn && typeof W.startVoiceEntryForEdit === 'function') {
      editModalVoiceBtn.addEventListener('click', W.startVoiceEntryForEdit);
    }
    document.getElementById('deleteConfirmModal').addEventListener('click', function (e) { if (e.target.id === 'deleteConfirmModal') W.closeDeleteConfirmModal(); });
    document.getElementById('deleteConfirmCancel').addEventListener('click', W.closeDeleteConfirmModal);
    document.getElementById('deleteConfirmOk').addEventListener('click', W.confirmDeleteEntry);
    document.getElementById('helpModal').addEventListener('click', function (e) { if (e.target.id === 'helpModal') W.closeHelpModal(); });
    document.getElementById('helpModalClose').addEventListener('click', W.closeHelpModal);
    document.getElementById('vacationDaysModal').addEventListener('click', function (e) { if (e.target.id === 'vacationDaysModal') W.closeVacationDaysModal(); });
    document.getElementById('vacationDaysModalCancel').addEventListener('click', W.closeVacationDaysModal);
    document.getElementById('vacationDaysModalSave').addEventListener('click', W.saveVacationDaysModal);
    document.getElementById('newProfileModal').addEventListener('click', function (e) { if (e.target.id === 'newProfileModal') W.closeNewProfileModal(); });
    document.getElementById('newProfileModalCancel').addEventListener('click', W.closeNewProfileModal);
    document.getElementById('newProfileModalSave').addEventListener('click', W.handleAddProfile);
    document.getElementById('editProfileModal').addEventListener('click', function (e) { if (e.target.id === 'editProfileModal') W.closeEditProfileModal(); });
    document.getElementById('editProfileModalCancel').addEventListener('click', W.closeEditProfileModal);
    document.getElementById('editProfileModalSave').addEventListener('click', W.handleSaveEditProfile);
    document.getElementById('deleteProfileModal').addEventListener('click', function (e) { if (e.target.id === 'deleteProfileModal') W.closeDeleteProfileModal(); });
    document.getElementById('deleteProfileModalCancel').addEventListener('click', W.closeDeleteProfileModal);
    document.getElementById('deleteProfileModalOk').addEventListener('click', W.confirmDeleteProfile);
    document.getElementById('statsSummaryModal').addEventListener('click', function (e) { if (e.target.id === 'statsSummaryModal') W.closeStatsSummaryModal(); });
    document.getElementById('statsSummaryModalClose').addEventListener('click', W.closeStatsSummaryModal);
    document.getElementById('statsSummaryView').addEventListener('change', W.statsSummaryViewChange);
    var statsDateFrom = document.getElementById('statsSummaryDateFrom');
    var statsDateTo = document.getElementById('statsSummaryDateTo');
    var statsDateClear = document.getElementById('statsSummaryDateClear');
    function statsSummaryDatesRefresh() {
      if (typeof W.statsSummaryViewChange === 'function') W.statsSummaryViewChange();
    }
    if (statsDateFrom) statsDateFrom.addEventListener('change', statsSummaryDatesRefresh);
    if (statsDateTo) statsDateTo.addEventListener('change', statsSummaryDatesRefresh);
    if (statsDateClear) {
      statsDateClear.addEventListener('click', function () {
        if (statsDateFrom) statsDateFrom.value = '';
        if (statsDateTo) statsDateTo.value = '';
        statsSummaryDatesRefresh();
      });
    }
    var statsCatGen = document.getElementById('statsSummaryCatGeneral');
    var statsCatDet = document.getElementById('statsSummaryCatDetails');
    if (statsCatGen) {
      statsCatGen.addEventListener('click', function () {
        if (typeof W.setStatsSummaryCategory === 'function') W.setStatsSummaryCategory('general');
      });
    }
    if (statsCatDet) {
      statsCatDet.addEventListener('click', function () {
        if (typeof W.setStatsSummaryCategory === 'function') W.setStatsSummaryCategory('details');
      });
    }
    document.querySelectorAll('.stats-summary-download').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = this.getAttribute('data-download-chart');
        if (key && typeof W.downloadStatsChart === 'function') W.downloadStatsChart(key);
      });
    });
    document.querySelectorAll('.stats-summary-enlarge').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = this.getAttribute('data-enlarge-chart');
        if (key && typeof W.openEnlargeChart === 'function') W.openEnlargeChart(key);
      });
    });
    var statsEnlargeModal = document.getElementById('statsSummaryEnlargeModal');
    if (statsEnlargeModal) {
      statsEnlargeModal.addEventListener('click', function (e) { if (e.target.id === 'statsSummaryEnlargeModal') W.closeEnlargeChart(); });
      statsEnlargeModal.addEventListener('keydown', function (e) {
        if (!statsEnlargeModal.classList.contains('open')) return;
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (typeof W.statsSummaryEnlargeGoAdjacent === 'function') W.statsSummaryEnlargeGoAdjacent(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (typeof W.statsSummaryEnlargeGoAdjacent === 'function') W.statsSummaryEnlargeGoAdjacent(1);
        }
      });
    }
    document.getElementById('statsSummaryEnlargeClose').addEventListener('click', W.closeEnlargeChart);
    document.getElementById('statsSummaryEnlargeDownload').addEventListener('click', W.downloadEnlargedChart);
    var enlargePrev = document.getElementById('statsSummaryEnlargePrev');
    var enlargeNext = document.getElementById('statsSummaryEnlargeNext');
    if (enlargePrev) {
      enlargePrev.addEventListener('click', function () {
        if (typeof W.statsSummaryEnlargeGoAdjacent === 'function') W.statsSummaryEnlargeGoAdjacent(-1);
      });
    }
    if (enlargeNext) {
      enlargeNext.addEventListener('click', function () {
        if (typeof W.statsSummaryEnlargeGoAdjacent === 'function') W.statsSummaryEnlargeGoAdjacent(1);
      });
    }
    function onFullscreenChange() {
      var inFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
      var modal = document.getElementById('statsSummaryEnlargeModal');
      if (inFullscreen === modal && typeof W.onEnlargeFullscreenEnter === 'function') {
        W.onEnlargeFullscreenEnter();
      }
      if (!inFullscreen && modal && modal.classList.contains('open')) {
        W.closeEnlargeChart();
      }
      var filtersEntriesCard = document.getElementById('filtersEntriesCard');
      if (filtersEntriesCard && inFullscreen !== filtersEntriesCard && typeof W.moveEntriesModalsToBody === 'function') {
        W.moveEntriesModalsToBody();
        if (W._pendingEditBatchOrderedIds && W._pendingEditBatchOrderedIds.length) {
          var batchIds = W._pendingEditBatchOrderedIds;
          W._pendingEditBatchOrderedIds = null;
          if (batchIds.length === 1) {
            var one = W.getEntries().find(function (e) { return e.id === batchIds[0]; });
            if (one && typeof W.openEditModal === 'function') W.openEditModal(one);
          } else if (typeof W.startEditEntryBatch === 'function') {
            W.startEditEntryBatch(batchIds);
          }
        } else if (W._pendingEditEntry) {
          var entry = W._pendingEditEntry;
          W._pendingEditEntry = null;
          if (typeof W.openEditModal === 'function') W.openEditModal(entry);
        }
        if (W._pendingDeleteConfirm) {
          var cb = W._pendingDeleteConfirm.callback;
          var count = W._pendingDeleteConfirm.count;
          W._pendingDeleteConfirm = null;
          if (typeof W.openDeleteConfirmModal === 'function' && cb) W.openDeleteConfirmModal(cb, count);
        }
      }
      var entriesFullscreenBtn = document.getElementById('entriesFullscreenBtn');
      if (entriesFullscreenBtn && filtersEntriesCard && W.I18N && W.I18N.t) {
        entriesFullscreenBtn.textContent = inFullscreen === filtersEntriesCard ? W.I18N.t('filtersEntries.fullscreenBtnExit') : W.I18N.t('filtersEntries.fullscreenBtnEnter');
        entriesFullscreenBtn.setAttribute('title', inFullscreen === filtersEntriesCard ? W.I18N.t('filtersEntries.fullscreenBtnTitleExit') : W.I18N.t('filtersEntries.fullscreenBtnTitleEnter'));
      }
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);
    var profileCalendarBtn = document.getElementById('profileCalendarBtn');
    if (profileCalendarBtn) {
      profileCalendarBtn.addEventListener('click', function () {
        var target = document.getElementById('calendarCard') || document.getElementById('calendarTitle') || document.querySelector('.category-3');
        if (target && typeof target.scrollIntoView === 'function') {
          try {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } catch (_) {
            target.scrollIntoView();
          }
        }
      });
    }
    document.getElementById('infographicModal').addEventListener('click', function (e) { if (e.target.id === 'infographicModal') W.closeInfographicModal(); });
    document.getElementById('infographicModalClose').addEventListener('click', W.closeInfographicModal);
    document.querySelectorAll('.help-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { W.openHelpModal(this.getAttribute('data-help')); });
    });
    var entriesThead = document.querySelector('.entries-scroll thead');
    if (entriesThead) {
      entriesThead.addEventListener('click', function (e) {
        var th = e.target.closest('th[data-sort]');
        if (th && typeof W.setEntriesSort === 'function') W.setEntriesSort(th.getAttribute('data-sort'));
      });
    }
    document.getElementById('editStatus').addEventListener('change', function () {
      if (document.getElementById('editStatus').value !== 'work') W.applyNonWorkDefaultsToEditForm();
      if (typeof W.syncEditLocationForStatus === 'function') W.syncEditLocationForStatus();
    });
  };
  W.init = function init() {
    W.refreshDynamicTranslations = function refreshDynamicTranslations() {
      // Guardrail: whenever language changes and UI strings are re-applied,
      // re-sync any dynamic UI tooltips/aria-labels using the selected locale packs.
      if (typeof W.updateInternetStatusIndicator === 'function') W.updateInternetStatusIndicator();
      var entriesFullscreenBtn = document.getElementById('entriesFullscreenBtn');
      var filtersEntriesCard = document.getElementById('filtersEntriesCard');
      if (entriesFullscreenBtn && filtersEntriesCard && W.I18N && W.I18N.t) {
        var inFullscreen = document.fullscreenElement === filtersEntriesCard || document.webkitFullscreenElement === filtersEntriesCard || document.msFullscreenElement === filtersEntriesCard;
        entriesFullscreenBtn.textContent = inFullscreen ? W.I18N.t('filtersEntries.fullscreenBtnExit') : W.I18N.t('filtersEntries.fullscreenBtnEnter');
        entriesFullscreenBtn.setAttribute('title', inFullscreen ? W.I18N.t('filtersEntries.fullscreenBtnTitleExit') : W.I18N.t('filtersEntries.fullscreenBtnTitleEnter'));
      }
      if (typeof W.refreshFiltersEntriesStaticText === 'function') W.refreshFiltersEntriesStaticText();
      if (W.I18N && typeof W.I18N.t === 'function') {
        document.querySelectorAll('.help-btn').forEach(function (btn) {
          btn.setAttribute('aria-label', W.I18N.t('common.helpBtnAria'));
        });
      }
      if (typeof W.refreshHelpModalContent === 'function') W.refreshHelpModalContent();
      if (typeof W.refreshProfileRoleInput === 'function') W.refreshProfileRoleInput();
      if (typeof W.refreshEntryFormStaticText === 'function') W.refreshEntryFormStaticText();
      if (typeof W.refreshEditEntryModalStaticText === 'function') W.refreshEditEntryModalStaticText();
      if (typeof W.refreshVoiceReviewModalStaticText === 'function') W.refreshVoiceReviewModalStaticText();
      if (typeof W.refreshExportModalStaticText === 'function') W.refreshExportModalStaticText();
      if (typeof W.refreshDeleteConfirmModalStaticText === 'function') W.refreshDeleteConfirmModalStaticText();
      if (typeof W.refreshVacationDaysModalStaticText === 'function') W.refreshVacationDaysModalStaticText();
      if (typeof W.refreshNewProfileModalStaticText === 'function') W.refreshNewProfileModalStaticText();
      if (typeof W.refreshEditProfileModalStaticText === 'function') W.refreshEditProfileModalStaticText();
      if (typeof W.refreshDeleteProfileModalStaticText === 'function') W.refreshDeleteProfileModalStaticText();
      if (typeof W.refreshStatsSummaryModalStaticText === 'function') W.refreshStatsSummaryModalStaticText();
      if (typeof W.refreshStatsSummaryEnlargeModalStaticText === 'function') W.refreshStatsSummaryEnlargeModalStaticText();
      if (typeof W.refreshInfographicModalStaticText === 'function') W.refreshInfographicModalStaticText();
      if (typeof W.refreshKeyHighlightsPptModalStaticText === 'function') W.refreshKeyHighlightsPptModalStaticText();
      if (typeof W.refreshSmartSingleSelects === 'function') W.refreshSmartSingleSelects();
      if (typeof W.refreshFilterYearWeek === 'function') W.refreshFilterYearWeek();
      // If stats modal is already open, re-render charts so tooltips/axis labels update immediately.
      var statsModal = document.getElementById('statsSummaryModal');
      if (statsModal && statsModal.classList.contains('open') && typeof W.statsSummaryViewChange === 'function') {
        W.statsSummaryViewChange();
      }
      if (typeof W.renderEntries === 'function') W.renderEntries();
      if (typeof W.renderStatsBox === 'function') W.renderStatsBox();
      if (typeof W.renderCalendar === 'function') W.renderCalendar();
    };
    if (W.I18N && typeof W.I18N.applyTranslations === 'function') {
      W.I18N.applyTranslations();
      W.refreshDynamicTranslations();
    }
    // Dynamic language selection: re-apply translations in real time
    var langSelect = document.getElementById('languageSelect');
    if (langSelect && W.I18N && typeof W.I18N.applyTranslations === 'function') {
      langSelect.addEventListener('change', function () {
        var value = langSelect.value;
        if (value === 'auto') {
          try {
            localStorage.removeItem('workingHoursLanguage');
          } catch (_) {}
          W.I18N.applyTranslations('auto');
        } else {
          W.I18N.applyTranslations(value);
        }
      });
    }
    var prewarmUiPackBtn = document.getElementById('prewarmUiPackBtn');
    if (prewarmUiPackBtn && W.I18N && typeof W.I18N.prewarmAllUiPackLocales === 'function') {
      if (W.I18N.networkTranslationEnabled !== true) {
        // Offline mode: manual full locale packs are loaded via file scripts; no network warmup is performed.
        prewarmUiPackBtn.disabled = true;
        var container = prewarmUiPackBtn.closest('.profile-field--prewarm');
        if (container) container.style.display = 'none';
      } else {
        prewarmUiPackBtn.addEventListener('click', function () {
          if (prewarmUiPackBtn.disabled) return;
          prewarmUiPackBtn.disabled = true;
          var runMsg =
            W.I18N.t && typeof W.I18N.t === 'function'
              ? W.I18N.t('profile.prewarmUiPack.running')
              : 'Caching translations…';
          if (typeof W.showToast === 'function') W.showToast(runMsg, 'info');
          W.I18N.prewarmAllUiPackLocales({ batchSize: 28, delayMs: 100 })
            .then(function () {
              prewarmUiPackBtn.disabled = false;
              var doneMsg =
                W.I18N.t && typeof W.I18N.t === 'function'
                  ? W.I18N.t('profile.prewarmUiPack.done')
                  : 'Translation cache updated.';
              if (typeof W.showToast === 'function') W.showToast(doneMsg, 'success');
              if (typeof W.I18N.applyTranslations === 'function') {
                W.I18N.applyTranslations(undefined, { skipUiPackWarmup: true });
              }
              if (typeof W.refreshDynamicTranslations === 'function') W.refreshDynamicTranslations();
            })
            .catch(function () {
              prewarmUiPackBtn.disabled = false;
              var errMsg =
                W.I18N.t && typeof W.I18N.t === 'function'
                  ? W.I18N.t('profile.prewarmUiPack.error')
                  : 'Caching did not finish.';
              if (typeof W.showToast === 'function') W.showToast(errMsg, 'warning');
            });
        });
      }
    }
    if (typeof W.ensureAllEntryIds === 'function') {
      W.ensureAllEntryIds();
    }
    W.setToday();
    W.refreshProfileSelect();
    W.restoreLastProfile();
    if (typeof W.refreshProfileRoleInput === 'function') W.refreshProfileRoleInput();
    var roleEl = document.getElementById('profileRole');
    if (roleEl) roleEl.setAttribute('data-current-profile', W.getProfile());
    W.refreshFilterYearWeek();
    W.renderEntries();
    if (typeof W.syncCalendarFromFilters === 'function') W.syncCalendarFromFilters();
    if (typeof W.renderCalendar === 'function') W.renderCalendar();
    W.bindFilterListeners();
    W.bindEventListeners();
    W.bindCalendarListeners();
    if (typeof W.initTimezonePickers === 'function') W.initTimezonePickers();
    if (typeof W.initEntriesSearch === 'function') W.initEntriesSearch();
    if (typeof W.initTheme === 'function') W.initTheme();
    // Connectivity indicator (non-blocking; best-effort via navigator.onLine).
    if (typeof W.updateInternetStatusIndicator === 'function') W.updateInternetStatusIndicator();
    try {
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('online', function () {
          if (typeof W.updateInternetStatusIndicator === 'function') W.updateInternetStatusIndicator();
        });
        window.addEventListener('offline', function () {
          if (typeof W.updateInternetStatusIndicator === 'function') W.updateInternetStatusIndicator();
        });
      }
    } catch (_) {}
    if (typeof W.initSmartSingleSelects === 'function') W.initSmartSingleSelects();
  };
  W.init();
})(window.WorkHours);
