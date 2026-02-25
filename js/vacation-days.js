/**
 * Vacation days allowance per year (per profile).
 * Depends: storage, profile.
 */
(function (W) {
  'use strict';
  var KEY = 'vacationDaysByProfile';

  W.getVacationDaysByYear = function getVacationDaysByYear(profile) {
    var data = W.getData();
    var byProfile = data[KEY];
    if (!byProfile || typeof byProfile !== 'object') return {};
    return byProfile[profile] && typeof byProfile[profile] === 'object' ? byProfile[profile] : {};
  };

  W.setVacationDaysForYear = function setVacationDaysForYear(profile, year, days) {
    var data = W.getData();
    if (!data[KEY]) data[KEY] = {};
    if (!data[KEY][profile]) data[KEY][profile] = {};
    var num = parseInt(days, 10);
    if (isNaN(num) || num < 0) num = 0;
    data[KEY][profile][String(year)] = num;
    W.setData(data);
  };

  W.setVacationDaysBulk = function setVacationDaysBulk(profile, yearToDays) {
    var data = W.getData();
    if (!data[KEY]) data[KEY] = {};
    data[KEY][profile] = yearToDays && typeof yearToDays === 'object' ? yearToDays : {};
    W.setData(data);
  };

  /** Get vacation allowance for a given year (for current profile). */
  W.getVacationAllowance = function getVacationAllowance(year) {
    var byYear = W.getVacationDaysByYear(W.getProfile());
    var y = String(year);
    return byYear[y] !== undefined ? parseInt(byYear[y], 10) : null;
  };

  W.openVacationDaysModal = function openVacationDaysModal() {
    var container = document.getElementById('vacationDaysModalRows');
    var profile = W.getProfile();
    if (!container) return;
    var curYear = new Date().getFullYear();
    var yearStart = 2021;
    var yearEnd = curYear + 3;
    var existing = W.getVacationDaysByYear(profile);
    container.innerHTML = '';
    for (var y = yearStart; y <= yearEnd; y++) {
      var row = document.createElement('div');
      row.className = 'row vacation-days-row';
      row.setAttribute('data-year', y);
      var label = document.createElement('label');
      label.textContent = y;
      label.style.minWidth = '4ch';
      var input = document.createElement('input');
      input.type = 'number';
      input.min = 0;
      input.max = 365;
      input.step = 1;
      input.value = existing[String(y)] !== undefined ? existing[String(y)] : '';
      input.placeholder = '0';
      input.setAttribute('aria-label', 'Vacation days ' + y);
      input.style.width = '80px';
      row.appendChild(label);
      row.appendChild(input);
      container.appendChild(row);
    }
    document.getElementById('vacationDaysModal').classList.add('open');
  };

  W.closeVacationDaysModal = function closeVacationDaysModal() {
    document.getElementById('vacationDaysModal').classList.remove('open');
  };

  W.saveVacationDaysModal = function saveVacationDaysModal() {
    var container = document.getElementById('vacationDaysModalRows');
    var profile = W.getProfile();
    if (!container) return;
    var yearToDays = {};
    container.querySelectorAll('.vacation-days-row').forEach(function (row) {
      var y = row.getAttribute('data-year');
      var input = row.querySelector('input[type="number"]');
      if (y && input) {
        var val = parseInt(input.value, 10);
        yearToDays[y] = isNaN(val) || val < 0 ? 0 : Math.min(365, val);
      }
    });
    W.setVacationDaysBulk(profile, yearToDays);
    W.closeVacationDaysModal();
  };
})(window.WorkHours);
