/**
 * Help popup content and open/close.
 * Depends: none.
 */
(function (W) {
  'use strict';
  var HELP = {
    profile: {
      title: 'Profile',
      body: 'Switch between profiles using the dropdown. Each profile has its own entries and role, stored locally in your browser.\n\nSet the role (e.g. Developer, Manager) for the selected profile; it is saved automatically when you leave the field or switch profile.\n\nUse Edit profile to change the current profile\'s name and role; renaming keeps all entries and settings. Use Add profile to create a new profile (name and role) in a popup. Data is saved per profile automatically.'
    },
    clock: {
      title: 'Clock',
      body: 'Select the date in the "Add or edit entry" section (same column), then use the buttons below.\n\n• Clock In — start the day for that date.\n• Clock Out — end the day; the app uses the selected date for the entry.\n\nUse this for quick logging of today or any selected day.'
    },
    entry: {
      title: 'Add or edit entry',
      body: 'Working duration = Clock Out − Clock In − Break.\n\nEnter the date, times, break duration, day status (work, sick, holiday, vacation), and location (WFO, WFH, AW). Click Save entry to add or update a day.\n\nUse this for manual entries or to correct past days. For non-work days (sick, holiday, vacation), default times are applied.'
    },
    filters: {
      title: 'Filters',
      body: 'Filter the entries list and calendar by:\n\n• Year, Month, Week, Day name\n• Day status (work, sick, holiday, vacation)\n• Location (WFO, WFH, AW)\n\nChoose "All" to show everything. The calendar and statistics sections respect these filters. The calendar month stays in sync with the selected year and month.'
    },
    entries: {
      title: 'Entries',
      body: 'Table of all entries matching the current filters.\n\n• Select a row with the checkbox, then use Edit to open the form or Delete to remove the entry (with confirmation).\n• Export CSV downloads the filtered entries.\n\nRow colors match day status: green = work, red = sick, purple = holiday, cyan = vacation.'
    },
    calendar: {
      title: 'Calendar',
      body: 'Month view of your entries. Cells are colored by day status (work, sick, holiday, vacation).\n\nDots show location: one = WFH, two = WFO, three = AW.\n\nUse the arrows to change month. The calendar aligns with the Filters year and month; if both are "All", it shows the current month.'
    },
    statistics: {
      title: 'Statistics',
      body: 'Summary of the filtered entries:\n\n• Total working hours and overtime\n• Average per work day and average overtime\n• Days by type (work, vacation, holiday, sick)\n\nAll values are computed from entries that match the current filters.'
    }
  };

  W.openHelpModal = function openHelpModal(helpId) {
    var item = HELP[helpId];
    if (!item) return;
    var titleEl = document.getElementById('helpModalTitle');
    var bodyEl = document.getElementById('helpModalBody');
    if (titleEl) titleEl.textContent = item.title;
    if (bodyEl) bodyEl.textContent = item.body;
    document.getElementById('helpModal').classList.add('open');
  };

  W.closeHelpModal = function closeHelpModal() {
    document.getElementById('helpModal').classList.remove('open');
  };
})(window.WorkHours);
