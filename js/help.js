/**
 * Help popup content and open/close.
 * Depends: none.
 */
(function (W) {
  'use strict';
  var HELP = {
    profile: {
      title: 'Profile',
      body: 'Switch between profiles using the dropdown. Each profile has its own entries and settings, stored locally in your browser.\n\nRole is shown for the selected profile and can only be changed via Edit profile.\n\n• Edit profile — change the current profile\'s name and role.\n\n• Add profile — create a new profile.\n\n• Vacation days — set annual allowance for the current profile.\n\n• Delete profile — remove the current profile and all its data. You must have at least one profile.'
    },
    clockEntry: {
      title: 'Clock & entry',
      body: 'This section combines quick clock and manual entry in one form. All times are stored in the selected Timezone (default: Germany, Berlin).\n\nQuick clock: Select the date below, then use Clock In or Clock Out. The form is filled with the current time; you can adjust Clock In or Clock Out manually before saving. Click Save entry to store the entry. No entry is created until you click Save entry.\n\nManual entry: Enter date, Clock In, Clock Out, Break (duration = Clock Out − Clock In − Break), Day status (work, sick, holiday, vacation), Location (WFO, WFH, Anywhere), Timezone (default Germany, Berlin), and optional Description. Click Save entry to add or update.\n\nFor non-work days (sick, holiday, vacation), default times are applied when you change Day status.'
    },
    filtersEntries: {
      title: 'Filters & entries',
      body: 'Filters (Basic / Advanced)\n\nUse Basic to show Year, Month, Day status, Location, and Duration. Switch to Advanced for Week, Day name, Day number, Overtime, and Description filters. Choose "All" in any dropdown to show everything. The calendar and statistics respect these filters.\n\n• Show all dates — when unchecked (default), only entries on or before today are shown; when checked, future entries are included.\n\n• Reset filters — set all filter dropdowns to "All".\n\n• Reset selection — clear selected rows in the table.\n\n• View times in — choose which timezone to use for displaying Date, Clock In, and Clock Out in the table. Select "Entry timezone" to show each entry in its own timezone, or pick any global timezone (searchable list). Date and times are converted to the selected view timezone.\n\nEntries table\n\nSelect rows with the checkbox; use Edit to open the edit form, Delete to remove selected entries (with confirmation). The Timezone column shows the timezone for each entry (default: Germany, Berlin). Use "View times in" to display date and times in another timezone; the list is searchable.\n\n• Export — download entries as CSV or JSON (uses current filters).\n\n• Import — merge data from CSV or JSON.\n\n• Infographic / Statistics summary — view reports.\n\nKey highlights (PowerPoint)\n\nOpens a modal where you configure slides and metrics for your export. Section 1: choose which years to include from a dropdown. Section 2: select metrics in two groups — Days (working days with WFO/WFH, vacation days, vacation quota, vacation remaining, sick leave, holidays) and Hours & overtime (working hours, overtime). Section 3: choose trend slides (x-axis) — None, or one or more of Weekly, Monthly, Quarterly. None is exclusive; you can select multiple bases for trend slides. Click Generate PowerPoint to build and download the file. The deck includes a title slide and, per year: days summary (including vacation quota and remaining when set), hours and overtime summary, and for each selected trend basis two slides (working hours trend and overtime trend) with min/max/median highlights per chart.'
    },
    filters: {
      title: 'Filters',
      body: 'Filter the entries list and calendar by Year, Month, Week, Day name, Day status (work, sick, holiday, vacation), Location (WFO, WFH, Anywhere), Overtime, Description, and Duration. Use Basic for main filters; switch to Advanced for more options. Choose "All" to show everything. The calendar and statistics sections respect these filters.'
    },
    entries: {
      title: 'Entries',
      body: 'Table of entries matching the current filters. Select rows with the checkbox, then Edit or Delete. Use Export to download CSV or JSON. Row colors show day status; location icons show WFH, WFO, or Anywhere.'
    },
    calendar: {
      title: 'Calendar',
      body: 'Month view of your entries. Cells are colored by day status (work, sick, holiday, vacation).\n\n• Location dots: one = WFH, two = WFO, three = Anywhere.\n\nUse the arrows to change month. The calendar aligns with the filters year and month. If both are "All", it shows the current month.'
    },
    statistics: {
      title: 'Statistics',
      body: 'Summary of the filtered entries:\n\n• Total working hours and overtime.\n\n• Average per work day and average overtime.\n\n• Days by type (work, vacation, holiday, sick).\n\nAll values are computed from entries that match the current filters.'
    }
  };

  W.openHelpModal = function openHelpModal(helpId) {
    var item = HELP[helpId];
    if (!item) return;
    var titleEl = document.getElementById('helpModalTitle');
    var bodyEl = document.getElementById('helpModalBody');
    if (titleEl) titleEl.textContent = item.title;
    if (bodyEl) {
      var html = formatHelpBody(item.body);
      bodyEl.innerHTML = html;
    }
    document.getElementById('helpModal').classList.add('open');
  };

  /** Turn help body text (paragraphs and • lines) into HTML. */
  function formatHelpBody(text) {
    if (!text || !text.trim()) return '';
    var parts = [];
    var paragraphs = text.split(/\n\n+/);
    paragraphs.forEach(function (block) {
      block = block.trim();
      if (!block) return;
      var lines = block.split('\n');
      var listItems = [];
      var currentParagraph = [];
      lines.forEach(function (line) {
        var bullet = line.match(/^[•\-]\s*(.*)$/);
        if (bullet) {
          if (currentParagraph.length) {
            parts.push('<p>' + currentParagraph.join(' ') + '</p>');
            currentParagraph = [];
          }
          listItems.push('<li>' + escapeHtml(bullet[1]) + '</li>');
        } else {
          if (listItems.length) {
            parts.push('<ul>' + listItems.join('') + '</ul>');
            listItems = [];
          }
          if (line.trim()) currentParagraph.push(escapeHtml(line.trim()));
        }
      });
      if (currentParagraph.length) parts.push('<p>' + currentParagraph.join(' ') + '</p>');
      if (listItems.length) parts.push('<ul>' + listItems.join('') + '</ul>');
    });
    return parts.join('');
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  W.closeHelpModal = function closeHelpModal() {
    document.getElementById('helpModal').classList.remove('open');
  };
})(window.WorkHours);
