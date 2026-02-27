/**
 * Init and event binding.
 * Depends: all other modules.
 */
(function (W) {
  'use strict';
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
    var filterIds = ['filterYear', 'filterMonth', 'filterDay', 'filterWeek', 'filterDayName', 'filterDayStatus', 'filterLocation', 'filterOvertime', 'filterDescription', 'filterDuration'];
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
    var profileRoleEl = document.getElementById('profileRole');
    if (profileRoleEl) profileRoleEl.setAttribute('data-current-profile', W.getProfile());
    document.getElementById('saveEntry').addEventListener('click', W.handleSaveEntry);
    document.getElementById('entryStatus').addEventListener('change', function () {
      if (document.getElementById('entryStatus').value !== 'work') W.applyNonWorkDefaultsToEntryForm();
    });
    document.getElementById('exportBtn').addEventListener('click', function () {
      document.getElementById('exportModal').classList.add('open');
    });
    document.getElementById('exportModalClose').addEventListener('click', function () { document.getElementById('exportModal').classList.remove('open'); });
    document.getElementById('exportModal').addEventListener('click', function (e) { if (e.target.id === 'exportModal') document.getElementById('exportModal').classList.remove('open'); });
    document.getElementById('exportModalCsv').addEventListener('click', function () {
      if (typeof W.exportToCsv === 'function') W.exportToCsv();
      document.getElementById('exportModal').classList.remove('open');
    });
    document.getElementById('exportModalJson').addEventListener('click', function () {
      if (typeof W.exportToJson === 'function') W.exportToJson();
      document.getElementById('exportModal').classList.remove('open');
    });
    document.getElementById('statsSummaryBtn').addEventListener('click', W.openStatsSummaryModal);
    document.getElementById('infographicBtn').addEventListener('click', W.openInfographicModal);
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
    document.getElementById('importBtn').addEventListener('click', function () { document.getElementById('importModal').classList.add('open'); });
    document.getElementById('importModalClose').addEventListener('click', function () { document.getElementById('importModal').classList.remove('open'); });
    document.getElementById('importModal').addEventListener('click', function (e) { if (e.target.id === 'importModal') document.getElementById('importModal').classList.remove('open'); });
    document.getElementById('importModalCsv').addEventListener('click', function () { var el = document.getElementById('importCsvInput'); if (el) el.click(); });
    document.getElementById('importModalJson').addEventListener('click', function () { var el = document.getElementById('importJsonInput'); if (el) el.click(); });
    var importCsvInput = document.getElementById('importCsvInput');
    if (importCsvInput) {
      importCsvInput.addEventListener('change', function () {
        var file = importCsvInput.files && importCsvInput.files[0];
        importCsvInput.value = '';
        if (!file) return;
        W.handleImportCsv(file).then(function (result) {
          if (result.imported) {
            W.showToast('Imported ' + result.imported + ' entries (merged).', 'success');
          }
          if (result.errors && result.errors.length) {
            W.showToast('Some rows had issues: ' + result.errors.slice(0, 3).join('; '), 'warning');
          }
          if (result.imported) {
            document.getElementById('importModal').classList.remove('open');
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
          if (result.imported) {
            W.showToast('Imported ' + result.imported + ' entries (merged).', 'success');
          }
          if (result.errors && result.errors.length) {
            W.showToast('Some rows had issues: ' + result.errors.slice(0, 3).join('; '), 'warning');
          }
          if (result.imported) {
            document.getElementById('importModal').classList.remove('open');
            W.renderEntries();
            if (typeof W.syncCalendarFromFilters === 'function') W.syncCalendarFromFilters();
            if (typeof W.renderCalendar === 'function') W.renderCalendar();
          }
        });
      });
    }
    document.getElementById('editEntryBtn').addEventListener('click', W.editSelectedEntry);
    document.getElementById('deleteEntryBtn').addEventListener('click', W.deleteSelectedEntry);
    var showAllEl = document.getElementById('entriesShowAllDates');
    if (showAllEl) {
      W._entriesShowAllDates = showAllEl.checked;
      showAllEl.addEventListener('change', function () {
        W._entriesShowAllDates = showAllEl.checked;
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
      };
      filtersModeBasic.addEventListener('click', function () { setFiltersMode('basic'); });
      filtersModeAdvanced.addEventListener('click', function () { setFiltersMode('advanced'); });
      setFiltersMode('basic');
    }
    document.getElementById('editModalCancel').addEventListener('click', W.closeEditModal);
    document.getElementById('editModalSave').addEventListener('click', W.saveEditEntry);
    document.getElementById('editModal').addEventListener('click', function (e) { if (e.target.id === 'editModal') W.closeEditModal(); });
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
    document.getElementById('statsSummaryEnlargeModal').addEventListener('click', function (e) { if (e.target.id === 'statsSummaryEnlargeModal') W.closeEnlargeChart(); });
    document.getElementById('statsSummaryEnlargeClose').addEventListener('click', W.closeEnlargeChart);
    document.getElementById('statsSummaryEnlargeDownload').addEventListener('click', W.downloadEnlargedChart);
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
    });
  };
  W.init = function init() {
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
  };
  W.init();
})(window.WorkHours);
