/**
 * Init and event binding.
 * Depends: all other modules.
 */
(function (W) {
  'use strict';
  W.restoreLastProfile = function restoreLastProfile() {
    try {
      const last = localStorage.getItem('workingHoursLastProfile');
      if (last && W.getProfileNames().indexOf(last) !== -1) document.getElementById('profileSelect').value = last;
    } catch (_) {}
  };
  W.bindFilterListeners = function bindFilterListeners() {
    ['filterYear', 'filterMonth', 'filterWeek', 'filterDayName', 'filterDayStatus', 'filterLocation'].forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('change', function () {
        if (id === 'filterYear' || id === 'filterMonth') W.syncCalendarFromFilters();
        W.renderEntries();
      });
    });
  };
  W.bindCalendarListeners = function bindCalendarListeners() {
    var prevEl = document.getElementById('calendarPrev');
    var nextEl = document.getElementById('calendarNext');
    if (prevEl) prevEl.addEventListener('click', function () {
      var cal = W.getCalendarMonth();
      var d = new Date(cal.year, cal.month - 1 - 1, 1);
      W.setCalendarMonth(d.getFullYear(), d.getMonth() + 1);
      W.syncFiltersFromCalendar();
      W.renderEntries();
    });
    if (nextEl) nextEl.addEventListener('click', function () {
      var cal = W.getCalendarMonth();
      var d = new Date(cal.year, cal.month - 1 + 1, 1);
      W.setCalendarMonth(d.getFullYear(), d.getMonth() + 1);
      W.syncFiltersFromCalendar();
      W.renderEntries();
    });
  };
  W.bindEventListeners = function bindEventListeners() {
    document.getElementById('clockInBtn').addEventListener('click', W.clockIn);
    document.getElementById('clockOutBtn').addEventListener('click', W.clockOut);
    document.getElementById('profileSelect').addEventListener('change', W.handleProfileChange);
    document.getElementById('newProfileBtn').addEventListener('click', W.openNewProfileModal);
    document.getElementById('editProfileBtn').addEventListener('click', W.openEditProfileModal);
    document.getElementById('vacationDaysBtn').addEventListener('click', W.openVacationDaysModal);
    var profileRoleEl = document.getElementById('profileRole');
    if (profileRoleEl) {
      profileRoleEl.addEventListener('blur', function () {
        if (typeof W.setProfileRole === 'function') W.setProfileRole(W.getProfile(), profileRoleEl.value);
      });
    }
    document.getElementById('saveEntry').addEventListener('click', W.handleSaveEntry);
    document.getElementById('entryStatus').addEventListener('change', function () {
      if (document.getElementById('entryStatus').value !== 'work') W.applyNonWorkDefaultsToEntryForm();
    });
    document.getElementById('exportCsv').addEventListener('click', W.exportToCsv);
    document.getElementById('statsSummaryBtn').addEventListener('click', W.openStatsSummaryModal);
    document.getElementById('infographicBtn').addEventListener('click', W.openInfographicModal);
    document.getElementById('loadSampleData').addEventListener('click', function () {
      if (typeof window.WorkHoursSeedCsv !== 'string' || !window.WorkHoursSeedCsv.trim()) {
        alert('Sample data not available.');
        return;
      }
      var result = W.importFromCsv(window.WorkHoursSeedCsv);
      var msg = result.imported ? 'Imported ' + result.imported + ' entries.' : '';
      if (result.errors && result.errors.length) msg += (msg ? ' ' : '') + 'Warnings: ' + result.errors.slice(0, 3).join('; ');
      if (msg) alert(msg);
      if (result.imported) {
        W.renderEntries();
        if (typeof W.syncCalendarFromFilters === 'function') W.syncCalendarFromFilters();
        if (typeof W.renderCalendar === 'function') W.renderCalendar();
      }
    });
    var importInput = document.getElementById('importCsvInput');
    document.getElementById('importCsv').addEventListener('click', function () { importInput && importInput.click(); });
    if (importInput) {
      importInput.addEventListener('change', function () {
        var file = importInput.files && importInput.files[0];
        importInput.value = '';
        if (!file) return;
        W.handleImportCsv(file).then(function (result) {
          var msg = result.imported ? 'Imported ' + result.imported + ' entries.' : '';
          if (result.errors && result.errors.length) msg += (msg ? ' ' : '') + 'Warnings: ' + result.errors.slice(0, 3).join('; ');
          if (msg) alert(msg);
          if (result.imported) {
            W.renderEntries();
            if (typeof W.syncCalendarFromFilters === 'function') W.syncCalendarFromFilters();
            if (typeof W.renderCalendar === 'function') W.renderCalendar();
          }
        });
      });
    }
    document.getElementById('editEntryBtn').addEventListener('click', W.editSelectedEntry);
    document.getElementById('deleteEntryBtn').addEventListener('click', W.deleteSelectedEntry);
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
    document.getElementById('infographicModal').addEventListener('click', function (e) { if (e.target.id === 'infographicModal') W.closeInfographicModal(); });
    document.getElementById('infographicModalClose').addEventListener('click', W.closeInfographicModal);
    document.querySelectorAll('.help-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { W.openHelpModal(this.getAttribute('data-help')); });
    });
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
  };
  W.init();
})(window.WorkHours);
