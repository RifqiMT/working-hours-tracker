/**
 * Edit entry modal.
 * Depends: entries, time, constants, render.
 */
(function (W) {
  'use strict';
  W.fillEditFormFromEntry = function fillEditFormFromEntry(entry) {
    document.getElementById('editEntryId').value = entry.id;
    document.getElementById('editDate').value = entry.date || '';
    document.getElementById('editClockIn').value = entry.clockIn || '';
    document.getElementById('editClockOut').value = entry.clockOut || '';
    const breakMin = Number(entry.breakMinutes) || 0;
    document.getElementById('editBreak').value = breakMin >= 60 && breakMin % 60 === 0 ? breakMin / 60 : breakMin;
    document.getElementById('editBreakUnit').value = breakMin >= 60 && breakMin % 60 === 0 ? 'hours' : 'minutes';
    document.getElementById('editStatus').value = entry.dayStatus || 'work';
    document.getElementById('editLocation').value = entry.location || 'WFO';
  };
  W.openEditModal = function openEditModal(entry) {
    W.fillEditFormFromEntry(entry);
    document.getElementById('editModal').classList.add('open');
  };
  W.closeEditModal = function closeEditModal() {
    document.getElementById('editModal').classList.remove('open');
  };
  W.getEditFormValues = function getEditFormValues() {
    var clockIn = document.getElementById('editClockIn').value;
    var clockOut = document.getElementById('editClockOut').value;
    var breakVal = Number(document.getElementById('editBreak').value) || 0;
    var breakUnit = document.getElementById('editBreakUnit').value;
    var location = document.getElementById('editLocation').value;
    const dayStatus = document.getElementById('editStatus').value;
    if (dayStatus !== 'work') {
      clockIn = W.NON_WORK_DEFAULTS.clockIn;
      clockOut = W.NON_WORK_DEFAULTS.clockOut;
      breakVal = 1;
      breakUnit = 'hours';
      location = W.NON_WORK_DEFAULTS.location;
    }
    return {
      id: document.getElementById('editEntryId').value,
      date: document.getElementById('editDate').value,
      clockIn: clockIn,
      clockOut: clockOut,
      breakMinutes: W.parseBreakToMinutes(breakVal, breakUnit),
      dayStatus: dayStatus,
      location: location
    };
  };
  W.saveEditEntry = function saveEditEntry() {
    const v = W.getEditFormValues();
    if (!v.date) { alert('Please select a date.'); return; }
    const entries = W.getEntries();
    const idx = entries.findIndex(function (e) { return e.id === v.id; });
    if (idx === -1) return;
    entries[idx] = { id: v.id, date: v.date, clockIn: v.clockIn || null, clockOut: v.clockOut || null, breakMinutes: v.breakMinutes, dayStatus: v.dayStatus, location: v.location };
    W.setEntries(entries);
    W.renderEntries();
    W.closeEditModal();
  };
  W.applyNonWorkDefaultsToEditForm = function applyNonWorkDefaultsToEditForm() {
    document.getElementById('editBreak').value = '1';
    document.getElementById('editBreakUnit').value = 'hours';
    document.getElementById('editLocation').value = W.NON_WORK_DEFAULTS.location;
    document.getElementById('editClockIn').value = W.NON_WORK_DEFAULTS.clockIn;
    document.getElementById('editClockOut').value = W.NON_WORK_DEFAULTS.clockOut;
  };
  W.openDeleteConfirmModal = function openDeleteConfirmModal(onConfirm) {
    W._deleteConfirmCallback = onConfirm;
    document.getElementById('deleteConfirmModal').classList.add('open');
  };
  W.closeDeleteConfirmModal = function closeDeleteConfirmModal() {
    document.getElementById('deleteConfirmModal').classList.remove('open');
    W._deleteConfirmCallback = null;
  };
  W.confirmDeleteEntry = function confirmDeleteEntry() {
    if (typeof W._deleteConfirmCallback === 'function') W._deleteConfirmCallback();
    W.closeDeleteConfirmModal();
  };
})(window.WorkHours);
