/**
 * Filter values and filtered entries.
 * Depends: entries, time (getISOWeek).
 */
(function (W) {
  'use strict';
  W.getFilterValues = function getFilterValues() {
    return {
      year: (document.getElementById('filterYear') && document.getElementById('filterYear').value) || '',
      month: (document.getElementById('filterMonth') && document.getElementById('filterMonth').value) || '',
      day: (document.getElementById('filterDay') && document.getElementById('filterDay').value) || '',
      week: (document.getElementById('filterWeek') && document.getElementById('filterWeek').value) || '',
      dayName: (document.getElementById('filterDayName') && document.getElementById('filterDayName').value) || '',
      dayStatus: (document.getElementById('filterDayStatus') && document.getElementById('filterDayStatus').value) || '',
      location: (document.getElementById('filterLocation') && document.getElementById('filterLocation').value) || '',
      overtime: (document.getElementById('filterOvertime') && document.getElementById('filterOvertime').value) || '',
      description: (document.getElementById('filterDescription') && document.getElementById('filterDescription').value) || '',
      search: (document.getElementById('entriesSearchInput') && document.getElementById('entriesSearchInput').value) || ''
    };
  };
  W.getFilteredEntries = function getFilteredEntries() {
    var entries = W.getEntries();
    const f = W.getFilterValues();
    var filtersPanel = document.querySelector('.filters-panel');
    var mode = filtersPanel ? String(filtersPanel.getAttribute('data-mode') || 'basic') : 'basic';
    var isAdvanced = mode === 'advanced';
    if (W._calendarSelectedDates && W._calendarSelectedDates.length > 0) {
      var set = {};
      W._calendarSelectedDates.forEach(function (d) { set[d] = true; });
      entries = entries.filter(function (e) { return set[e.date]; });
    } else {
      if (f.year) entries = entries.filter(function (e) { return (e.date || '').slice(0, 4) === f.year; });
      if (f.month) {
        entries = entries.filter(function (e) {
          const d = new Date((e.date || '') + 'T12:00:00');
          return !isNaN(d.getTime()) && String(d.getMonth() + 1) === f.month;
        });
      }
      if (isAdvanced && f.day) {
        entries = entries.filter(function (e) {
          var dateStr = e.date || '';
          if (dateStr.length < 10) return false;
          var dayNum = parseInt(dateStr.slice(8, 10), 10);
          return !isNaN(dayNum) && dayNum === parseInt(f.day, 10);
        });
      }
    }
    if (isAdvanced && f.week) entries = entries.filter(function (e) { return String(W.getISOWeek(e.date)) === f.week; });
    if (isAdvanced && f.dayName) {
      entries = entries.filter(function (e) {
        const d = new Date((e.date || '') + 'T12:00:00');
        return !isNaN(d.getTime()) && String(d.getDay()) === f.dayName;
      });
    }
    if (f.dayStatus) entries = entries.filter(function (e) { return (e.dayStatus || 'work') === f.dayStatus; });
    if (f.location) entries = entries.filter(function (e) {
        var loc = e.location || '';
        return loc === f.location || (loc === 'AW' && f.location === 'Anywhere');
      });
    if (isAdvanced && f.overtime) {
      var standard = W.STANDARD_WORK_MINUTES_PER_DAY || 480;
      if (f.overtime === 'overtime') {
        entries = entries.filter(function (e) {
          if ((e.dayStatus || 'work') !== 'work') return false;
          var dur = W.workingMinutes(e.clockIn, e.clockOut, e.breakMinutes);
          return dur != null && dur > standard;
        });
      } else if (f.overtime === 'no-overtime') {
        entries = entries.filter(function (e) {
          if ((e.dayStatus || 'work') !== 'work') return true;
          var dur = W.workingMinutes(e.clockIn, e.clockOut, e.breakMinutes);
          return dur == null || dur <= standard;
        });
      }
    }
    if (isAdvanced && f.description === 'available') {
      entries = entries.filter(function (e) { return ((e.description || '').trim()).length > 0; });
    } else if (isAdvanced && f.description === 'not-available') {
      entries = entries.filter(function (e) { return ((e.description || '').trim()).length === 0; });
    }
    if (!W._entriesShowAllDates) {
      var todayStr = new Date().toISOString().slice(0, 10);
      entries = entries.filter(function (e) { return (e.date || '') <= todayStr; });
    }
    // Free-text search (suggestive UI).
    // Matches against: date (YYYY-MM-DD), day-status (code + translated label), location (code + translated label),
    // overtime (overtime/no-overtime for work days only), and description.
    if (f.search && typeof f.search === 'string') {
      var q = f.search.trim().toLowerCase();
      if (q) {
        var tokens = q.split(/\s+/).filter(Boolean);
        var lang = W.currentLanguage || 'en';
        var t = (W.I18N && typeof W.I18N.t === 'function') ? W.I18N.t : function (k) { return k; };
        var standard = W.STANDARD_WORK_MINUTES_PER_DAY || 480;
        function preprocessQueryWithIntentFlags(rawQuery) {
          var s = ' ' + String(rawQuery || '').toLowerCase().trim() + ' ';
          var rules = [
            // Overtime presence
            { re: /\b(with overtime|has overtime|overtime yes|dengan lembur|ada lembur)\b/g, flag: 'has_overtime' },
            { re: /\b(without overtime|no overtime|overtime no|overtime none|tanpa lembur|tidak lembur|lembur tidak ada)\b/g, flag: 'no_overtime' },
            // Description presence
            { re: /\b(with description|has description|description available|desc available|dengan deskripsi|ada deskripsi)\b/g, flag: 'has_description' },
            { re: /\b(without description|no description|description not available|desc empty|desc none|tanpa deskripsi|deskripsi tidak ada|deskripsi kosong)\b/g, flag: 'no_description' },
            // Duration presence
            { re: /\b(with duration|has duration|duration available|dengan durasi|ada durasi|durasi ada)\b/g, flag: 'has_duration' },
            { re: /\b(without duration|no duration|duration not available|tanpa durasi|durasi tidak ada|durasi kosong)\b/g, flag: 'no_duration' },
            // Break presence
            { re: /\b(with break|has break|break available|dengan istirahat|ada istirahat|istirahat ada|ada break)\b/g, flag: 'has_break' },
            { re: /\b(without break|no break|break none|break not available|tanpa istirahat|istirahat tidak ada|istirahat kosong|tanpa break)\b/g, flag: 'no_break' },
            // Clock in/out/time presence
            { re: /\b(with clock in|has clock in|clock in available|dengan jam masuk|ada jam masuk|jam masuk ada)\b/g, flag: 'has_clock_in' },
            { re: /\b(without clock in|no clock in|clock in not available|tanpa jam masuk|jam masuk tidak ada|jam masuk kosong)\b/g, flag: 'no_clock_in' },
            { re: /\b(with clock out|has clock out|clock out available|dengan jam pulang|ada jam pulang|jam pulang ada)\b/g, flag: 'has_clock_out' },
            { re: /\b(without clock out|no clock out|clock out not available|tanpa jam pulang|jam pulang tidak ada|jam pulang kosong)\b/g, flag: 'no_clock_out' },
            { re: /\b(with time|has time|time available|dengan waktu|ada waktu|waktu ada)\b/g, flag: 'has_time' },
            { re: /\b(without time|no time|time not available|tanpa waktu|waktu tidak ada|waktu kosong)\b/g, flag: 'no_time' }
          ];
          rules.forEach(function (r) {
            s = s.replace(r.re, ' ' + r.flag + ' ');
          });
          return s.replace(/\s+/g, ' ').trim();
        }
        var normalizedQuery = preprocessQueryWithIntentFlags(q);
        tokens = normalizedQuery.split(/\s+/).filter(Boolean);
        var intentSet = {};
        tokens.forEach(function (tk) {
          if (tk.indexOf('has_') === 0 || tk.indexOf('no_') === 0) intentSet[tk] = true;
        });
        tokens = tokens.filter(function (tk) { return !(tk.indexOf('has_') === 0 || tk.indexOf('no_') === 0); });
        function getLocationLabel(locCode) {
          if (locCode === 'WFO') return t('location.wfo');
          if (locCode === 'WFH') return t('location.wfh');
          if (locCode === 'Anywhere') return t('location.anywhere');
          return locCode || '';
        }
        function getStatusLabel(statusCode) {
          return t('status.' + (statusCode || 'work'));
        }
        function getI18nArray(pathKey) {
          if (!W.I18N || typeof W.I18N.resolve !== 'function') return null;
          var arr = W.I18N.resolve(pathKey, lang);
          return Array.isArray(arr) ? arr : null;
        }
        var monthsArr = getI18nArray('calendarStats.months');
        var weekdaysArr = getI18nArray('calendarStats.weekdaysFull');

        function getOvertimeLabelsForEntry(e) {
          if ((e.dayStatus || 'work') !== 'work') return null;
          var dur = W.workingMinutes(e.clockIn, e.clockOut, e.breakMinutes);
          if (dur == null) return null;
          return dur > standard
            ? { label: t('filters.options.overtime.overtime'), code: 'overtime' }
            : { label: t('filters.options.overtime.no-overtime'), code: 'no-overtime' };
        }
        function getDescriptionPresenceTokens(hasDescription) {
          // English + Indonesian + common shorthand variations.
          if (hasDescription) {
            return [
              'description available', 'has description', 'with description', 'desc available',
              'deskripsi ada', 'dengan deskripsi', 'ada deskripsi'
            ];
          }
          return [
            'description not available', 'no description', 'without description', 'desc empty', 'desc none',
            'deskripsi tidak ada', 'tanpa deskripsi', 'deskripsi kosong'
          ];
        }
        function getOvertimePresenceTokens(otInfo) {
          // otInfo null => not-work day or no valid duration; still useful for negative queries.
          if (otInfo && otInfo.code === 'overtime') {
            return [
              'has overtime', 'with overtime', 'overtime yes', 'lembur ada', 'dengan lembur', 'ada lembur'
            ];
          }
          return [
            'no overtime', 'without overtime', 'overtime none', 'overtime no',
            'tanpa lembur', 'tidak lembur', 'lembur tidak ada'
          ];
        }
        function getDurationPresenceTokens(hasDuration) {
          if (hasDuration) {
            return [
              'has duration', 'with duration', 'duration available',
              'ada durasi', 'dengan durasi', 'durasi ada'
            ];
          }
          return [
            'no duration', 'without duration', 'duration not available',
            'tanpa durasi', 'durasi tidak ada', 'durasi kosong'
          ];
        }
        function getBreakPresenceTokens(hasBreak) {
          if (hasBreak) {
            return [
              'has break', 'with break', 'break available',
              'ada istirahat', 'dengan istirahat', 'istirahat ada', 'ada break'
            ];
          }
          return [
            'no break', 'without break', 'break none', 'break not available',
            'tanpa istirahat', 'istirahat tidak ada', 'istirahat kosong', 'tanpa break'
          ];
        }
        function getClockPresenceTokens(hasClockIn, hasClockOut) {
          var tokens = [];
          if (hasClockIn) {
            tokens.push(
              'has clock in', 'with clock in', 'clock in available',
              'ada jam masuk', 'jam masuk ada', 'dengan jam masuk'
            );
          } else {
            tokens.push(
              'no clock in', 'without clock in', 'clock in not available',
              'tanpa jam masuk', 'jam masuk tidak ada', 'jam masuk kosong'
            );
          }
          if (hasClockOut) {
            tokens.push(
              'has clock out', 'with clock out', 'clock out available',
              'ada jam pulang', 'jam pulang ada', 'dengan jam pulang'
            );
          } else {
            tokens.push(
              'no clock out', 'without clock out', 'clock out not available',
              'tanpa jam pulang', 'jam pulang tidak ada', 'jam pulang kosong'
            );
          }
          if (hasClockIn && hasClockOut) {
            tokens.push(
              'has time', 'with time', 'time available',
              'ada waktu', 'waktu ada', 'dengan waktu'
            );
          } else {
            tokens.push(
              'no time', 'without time', 'time not available',
              'tanpa waktu', 'waktu tidak ada', 'waktu kosong'
            );
          }
          return tokens;
        }
        function scheduleSearchRerenderAfterTranslation() {
          if (W._searchTranslationRerenderQueued) return;
          W._searchTranslationRerenderQueued = true;
          setTimeout(function () {
            W._searchTranslationRerenderQueued = false;
            if (typeof W.renderEntries === 'function') W.renderEntries();
            if (typeof W.renderCalendar === 'function') W.renderCalendar();
            if (typeof W.renderStatsBox === 'function') W.renderStatsBox();
          }, 80);
        }

        entries = entries.filter(function (e) {
          var dateIso = e.date || '';
          var date = dateIso.toLowerCase();
          var rawDesc = ((e.description || '') + '').trim();
          var desc = rawDesc.toLowerCase();
          // Include translated description in search haystack when available.
          // If not cached yet, fetch it asynchronously and refresh search once ready.
          if (rawDesc && typeof W.getTranslatedDescriptionCached === 'function') {
            var translatedDesc = W.getTranslatedDescriptionCached(rawDesc, lang);
            if (translatedDesc) {
              desc += ' ' + String(translatedDesc).toLowerCase();
            } else if (typeof W.translateDescriptionText === 'function') {
              W.translateDescriptionText(rawDesc, lang).then(function () {
                scheduleSearchRerenderAfterTranslation();
              });
            }
          }
          var statusCode = (e.dayStatus || 'work');
          var statusLabel = getStatusLabel(statusCode);
          statusLabel = (statusLabel || '').toLowerCase();
          var locCode = (e.location || '');
          var locLabel = getLocationLabel(locCode);
          locLabel = (locLabel || '').toLowerCase();
          var clockIn = (e.clockIn || '').toString().toLowerCase();
          var clockOut = (e.clockOut || '').toString().toLowerCase();
          var breakMin = (e.breakMinutes != null ? String(e.breakMinutes) : '').toLowerCase();
          var durMin = null;
          try { durMin = W.workingMinutes(e.clockIn, e.clockOut, e.breakMinutes); } catch (_) { durMin = null; }
          var durMinStr = durMin != null ? String(durMin).toLowerCase() : '';
          var overtimeMinStr = '';
          if (durMin != null && durMin > standard) overtimeMinStr = String(durMin - standard).toLowerCase();
          var hasDuration = durMin != null;
          var hasBreak = Number(e.breakMinutes) > 0;
          var hasClockIn = !!(e.clockIn && String(e.clockIn).trim());
          var hasClockOut = !!(e.clockOut && String(e.clockOut).trim());
          var hasOvertime = !!(durMin != null && (e.dayStatus || 'work') === 'work' && durMin > standard);

          // Phrase/intention filters (strong semantics).
          if (intentSet.has_overtime && !hasOvertime) return false;
          if (intentSet.no_overtime && hasOvertime) return false;
          if (intentSet.has_description && !(rawDesc.length > 0)) return false;
          if (intentSet.no_description && rawDesc.length > 0) return false;
          if (intentSet.has_duration && !hasDuration) return false;
          if (intentSet.no_duration && hasDuration) return false;
          if (intentSet.has_break && !hasBreak) return false;
          if (intentSet.no_break && hasBreak) return false;
          if (intentSet.has_clock_in && !hasClockIn) return false;
          if (intentSet.no_clock_in && hasClockIn) return false;
          if (intentSet.has_clock_out && !hasClockOut) return false;
          if (intentSet.no_clock_out && hasClockOut) return false;
          var hasTime = hasClockIn && hasClockOut;
          if (intentSet.has_time && !hasTime) return false;
          if (intentSet.no_time && hasTime) return false;

          // Date tokens: support natural queries like "2025", "2025-01", month names, weekday names, or "15".
          var dateObj = new Date(dateIso + 'T12:00:00');
          var dateTokens = '';
          if (!isNaN(dateObj.getTime())) {
            var year = dateIso.slice(0, 4);
            var monthIdx = dateObj.getMonth();
            var monthNum = String(monthIdx + 1);
            var monthNumPad = (monthNum.length < 2) ? ('0' + monthNum) : monthNum;
            var dayNum = String(dateObj.getDate());
            var dayNumPad = (dayNum.length < 2) ? ('0' + dayNum) : dayNum;
            var yearMonth = year && monthNumPad ? (year + '-' + monthNumPad) : '';
            var monthName = (monthsArr && monthsArr[monthIdx]) ? monthsArr[monthIdx] : '';
            var monthShort = monthName;
            var weekdayFull = (weekdaysArr && weekdaysArr[dateObj.getDay()]) ? weekdaysArr[dateObj.getDay()] : '';
            var isoWeek = (typeof W.getISOWeek === 'function' && dateIso) ? String(W.getISOWeek(dateIso)) : '';

            dateTokens = [
              year, yearMonth, monthNum, monthNumPad, dayNum, dayNumPad,
              monthName, monthShort, weekdayFull,
              isoWeek
            ].filter(Boolean).join(' ');
          }

          // Include more entry fields so the search is adaptive to “what users type”.
          // This covers descriptions + times + duration/overtime/break text.
          var haystack = (date + ' ' + dateTokens + ' ' + desc + ' ' + statusCode + ' ' + statusLabel + ' ' + locCode + ' ' + locLabel + ' ' +
            clockIn + ' ' + clockOut + ' ' + breakMin + ' ' + durMinStr + ' ' + overtimeMinStr).toLowerCase();
          var ot = getOvertimeLabelsForEntry(e);
          if (ot) haystack += ' ' + ot.label.toLowerCase() + ' ' + ot.code;
          var hasDescription = rawDesc.length > 0;
          haystack += ' ' + getDescriptionPresenceTokens(hasDescription).join(' ');
          haystack += ' ' + getOvertimePresenceTokens(ot).join(' ');
          haystack += ' ' + getDurationPresenceTokens(hasDuration).join(' ');
          haystack += ' ' + getBreakPresenceTokens(hasBreak).join(' ');
          haystack += ' ' + getClockPresenceTokens(hasClockIn, hasClockOut).join(' ');
          // Intent flags (exact phrase-level semantics, prevents "with" matching "without").
          if (hasDescription) haystack += ' has_description'; else haystack += ' no_description';
          if (ot && ot.code === 'overtime') haystack += ' has_overtime'; else haystack += ' no_overtime';
          if (hasDuration) haystack += ' has_duration'; else haystack += ' no_duration';
          if (hasBreak) haystack += ' has_break'; else haystack += ' no_break';
          if (hasClockIn) haystack += ' has_clock_in'; else haystack += ' no_clock_in';
          if (hasClockOut) haystack += ' has_clock_out'; else haystack += ' no_clock_out';
          if (hasClockIn && hasClockOut) haystack += ' has_time'; else haystack += ' no_time';

          // Remaining free-text tokens must match.
          return tokens.every(function (tok) { return haystack.indexOf(tok) !== -1; });
        });
      }
    }
    return entries;
  };
  /** Set all filter dropdowns to "All" and refresh entries and calendar. */
  W.resetAllFilters = function resetAllFilters() {
    var ids = ['filterYear', 'filterMonth', 'filterDay', 'filterWeek', 'filterDayName', 'filterDayStatus', 'filterLocation', 'filterOvertime', 'filterDescription'];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });
    var entriesSearchInput = document.getElementById('entriesSearchInput');
    if (entriesSearchInput) entriesSearchInput.value = '';
    var entriesSearchList = document.getElementById('entriesSearchList');
    if (entriesSearchList) {
      entriesSearchList.setAttribute('hidden', '');
      entriesSearchList.style.display = 'none';
    }
    if (typeof W.clearCalendarSelection === 'function') W.clearCalendarSelection();
    if (typeof W.syncCalendarFromFilters === 'function') W.syncCalendarFromFilters();
    if (typeof W.renderEntries === 'function') W.renderEntries();
    if (typeof W.renderCalendar === 'function') W.renderCalendar();
  };
  W.refreshFilterYearWeek = function refreshFilterYearWeek() {
    const entries = W.getEntries();
    const years = new Set();
    entries.forEach(function (e) {
      if (e.date && e.date.length >= 4) years.add(e.date.slice(0, 4));
    });
    const currentYear = new Date().getFullYear();
    for (var y = currentYear - 2; y <= currentYear + 1; y++) years.add(String(y));
    const yearEl = document.getElementById('filterYear');
    if (yearEl) {
      const cur = yearEl.value;
      var allLabel = (W.I18N && W.I18N.t) ? W.I18N.t('common.all') : 'All';
      yearEl.innerHTML = '<option value="">' + allLabel + '</option>' + Array.from(years).sort().reverse().map(function (y) { return '<option value="' + y + '">' + y + '</option>'; }).join('');
      if (years.has(cur)) yearEl.value = cur;
    }
    const weekEl = document.getElementById('filterWeek');
    if (weekEl && weekEl.options.length <= 1) {
      var allLabel = (W.I18N && W.I18N.t) ? W.I18N.t('common.all') : 'All';
      weekEl.innerHTML = '<option value="">' + allLabel + '</option>' + Array.from({ length: 53 }, function (_, i) { return i + 1; }).map(function (w) { return '<option value="' + w + '">' + w + '</option>'; }).join('');
    }
  };

  /**
   * Refresh untranslated "static" filter/toolbar text (no data-i18n in HTML).
   * Triggered on initial load and on language changes.
   */
  W.refreshFiltersEntriesStaticText = function refreshFiltersEntriesStaticText() {
    if (!W.I18N || typeof W.I18N.t !== 'function') return;
    var t = W.I18N.t;
    var lang = W.currentLanguage || 'en';

    function setText(el, text) {
      if (!el) return;
      if (text == null) return;
      el.textContent = text;
    }
    function setIconButtonLabel(btn, label) {
      if (!btn) return;
      if (label == null) return;
      // Icon-only toolbar buttons keep the visible content as SVG.
      // We store the translated label in an `sr-only` node and also set `aria-label`.
      var srOnly = btn.querySelector('.sr-only');
      if (srOnly) srOnly.textContent = label;
      setAria(btn, 'aria-label', label);
    }
    function setAria(el, attrName, value) {
      if (!el) return;
      if (!attrName) return;
      if (value == null) return;
      el.setAttribute(attrName, value);
    }
    function setOptionText(selectId, value, text) {
      var sel = document.getElementById(selectId);
      if (!sel) return;
      var opt = sel.querySelector('option[value="' + value + '"]');
      if (opt && text != null) opt.textContent = text;
    }
    function abbrevMonthName(name) {
      if (!name) return name;
      return name;
    }

    // Category-2 label (top section header) has no data-i18n in HTML.
    var category2Label = document.querySelector('.category.category-2 .category-label');
    if (category2Label) category2Label.textContent = t('layout.category2');

    // Filters & entries card header.
    var cardHeader = document.querySelector('#filtersEntriesCard .filters-entries-header h2');
    if (cardHeader) cardHeader.textContent = t('filtersEntries.title');

    // Basic / Advanced toggle buttons.
    setText(document.getElementById('filtersModeBasic'), t('filtersEntries.basicMode'));
    setText(document.getElementById('filtersModeAdvanced'), t('filtersEntries.advancedMode'));

    // Show all dates toggle.
    var showAllInput = document.getElementById('entriesShowAllDates');
    if (showAllInput && showAllInput.parentElement) {
      var showAllLabel = showAllInput.parentElement.querySelector('.entries-show-all-dates-label');
      if (!showAllLabel) showAllLabel = showAllInput.parentElement.querySelector('.sr-only');
      var stateLabel = showAllInput.checked ? t('filtersEntries.showAllDates') : t('filtersEntries.showUpToCurrentDate');
      if (showAllLabel) setText(showAllLabel, stateLabel);
      showAllInput.parentElement.setAttribute('title', stateLabel);
      setAria(showAllInput.parentElement, 'aria-label', stateLabel);
    }
    setText(document.getElementById('entriesShowAllDatesHint'), t('filtersEntries.showAllDatesHint'));

    // Reset filters / selection.
    setIconButtonLabel(document.getElementById('resetFiltersBtn'), t('filtersEntries.resetFilters'));
    setIconButtonLabel(document.getElementById('resetSelectionBtn'), t('filtersEntries.resetSelection'));

    // Sortable column headers use JS-updated text; re-apply current language + sort arrows.
    if (typeof W.renderEntriesTableSortHeaders === 'function') W.renderEntriesTableSortHeaders();

    // View times in (label + input placeholder/aria).
    var viewTimesLabel = document.querySelector('label[for="entriesViewTimezoneSearch"]');
    setText(viewTimesLabel, t('filtersEntries.viewTimesIn'));
    var viewTzInput = document.getElementById('entriesViewTimezoneSearch');
    if (viewTzInput) {
      setText(viewTzInput, viewTzInput.value);
      viewTzInput.placeholder = t('filtersEntries.entriesViewTimezonePlaceholder');
      setAria(viewTzInput, 'aria-label', t('filtersEntries.entriesViewTimezoneAriaLabel'));
    }
    // Entries search input.
    var entriesSearchInput = document.getElementById('entriesSearchInput');
    if (entriesSearchInput) {
      entriesSearchInput.placeholder = t('filtersEntries.searchPlaceholder');
      setAria(entriesSearchInput, 'aria-label', t('filtersEntries.searchAriaLabel'));
    }
    var entriesSearchClearBtn = document.getElementById('entriesSearchClearBtn');
    if (entriesSearchClearBtn) {
      setAria(entriesSearchClearBtn, 'aria-label', t('filtersEntries.searchClear'));
      var srOnly = entriesSearchClearBtn.querySelector('.sr-only');
      if (srOnly) srOnly.textContent = t('filtersEntries.searchClear');
      entriesSearchClearBtn.setAttribute('title', t('filtersEntries.searchClear'));
    }
    var entriesSearchList = document.getElementById('entriesSearchList');
    if (entriesSearchList) setAria(entriesSearchList, 'aria-label', t('filtersEntries.searchSuggestionsLabel'));

    // Entries toolbar actions.
    setIconButtonLabel(document.getElementById('editEntryBtn'), t('filtersEntries.editBtn'));
    setIconButtonLabel(document.getElementById('deleteEntryBtn'), t('filtersEntries.deleteBtn'));
    setIconButtonLabel(document.getElementById('infographicBtn'), t('filtersEntries.infographicBtn'));
    setIconButtonLabel(document.getElementById('statsSummaryBtn'), t('filtersEntries.statsSummaryBtn'));
    var keyHighlightsBtn = document.getElementById('keyHighlightsPptBtn');
    if (keyHighlightsBtn) {
      setIconButtonLabel(keyHighlightsBtn, t('filtersEntries.keyHighlightsPptBtn'));
      keyHighlightsBtn.setAttribute('title', t('filtersEntries.keyHighlightsPptBtnTitle'));
    }

    // Entries table description header title + sr-only.
    var descTh = document.querySelector('.entries-scroll thead th[title][style*="width: 2rem"]');
    if (descTh) {
      descTh.setAttribute('title', t('filtersEntries.columns.descriptionHoverTitle'));
      var descSrOnly = descTh.querySelector('.sr-only');
      setText(descSrOnly, t('filtersEntries.columns.description'));
    }

    // Select-all checkbox aria + sr-only.
    var selectAllCb = document.getElementById('entriesSelectAll');
    if (selectAllCb) {
      setAria(selectAllCb, 'aria-label', t('filtersEntries.entriesSelectAllAriaLabel'));
      var selectSrOnly = selectAllCb.closest('th') ? selectAllCb.closest('th').querySelector('.sr-only') : null;
      setText(selectSrOnly, t('filtersEntries.entriesSelectSrOnly'));
    }

    // Filter panel labels (no data-i18n in HTML for these).
    setText(document.querySelector('label[for="filterYear"]'), t('filters.year'));
    setText(document.querySelector('label[for="filterMonth"]'), t('filters.month'));
    setText(document.querySelector('label[for="filterDayStatus"]'), t('clockEntry.statusLabel'));
    setText(document.querySelector('label[for="filterLocation"]'), t('clockEntry.locationLabel'));
    setText(document.querySelector('label[for="filterDay"]'), t('filters.day'));
    setText(document.querySelector('label[for="filterWeek"]'), t('filters.week'));
    setText(document.querySelector('label[for="filterDayName"]'), t('filters.dayName'));
    setText(document.querySelector('label[for="filterOvertime"]'), t('render.overtimeLabel'));
    setText(document.querySelector('label[for="filterDescription"]'), t('clockEntry.descriptionLabel'));

    // Filter panel options.
    setOptionText('filterDayStatus', 'work', t('status.work'));
    setOptionText('filterDayStatus', 'sick', t('status.sick'));
    setOptionText('filterDayStatus', 'holiday', t('status.holiday'));
    setOptionText('filterDayStatus', 'vacation', t('status.vacation'));

    setOptionText('filterLocation', 'WFO', t('location.wfo'));
    setOptionText('filterLocation', 'WFH', t('location.wfh'));
    setOptionText('filterLocation', 'Anywhere', t('location.anywhere'));

    setOptionText('filterOvertime', 'overtime', t('filters.options.overtime.overtime'));
    setOptionText('filterOvertime', 'no-overtime', t('filters.options.overtime.no-overtime'));

    setOptionText('filterDescription', 'available', t('filters.options.description.available'));
    setOptionText('filterDescription', 'not-available', t('filters.options.description.not-available'));

    // Month/day-name options are derived from calendar translations.
    var months = W.I18N.resolve ? W.I18N.resolve('calendarStats.months', lang) : null;
    var weekdaysFull = W.I18N.resolve ? W.I18N.resolve('calendarStats.weekdaysFull', lang) : null;

    var filterMonthEl = document.getElementById('filterMonth');
    if (filterMonthEl && Array.isArray(months)) {
      filterMonthEl.querySelectorAll('option[value]').forEach(function (opt) {
        if (!opt || !opt.value) return;
        var n = parseInt(opt.value, 10);
        if (isNaN(n) || n < 1 || n > 12) return;
        var name = months[n - 1];
        if (name) opt.textContent = abbrevMonthName(name);
      });
    }

    var filterDayNameEl = document.getElementById('filterDayName');
    if (filterDayNameEl && Array.isArray(weekdaysFull)) {
      filterDayNameEl.querySelectorAll('option[value]').forEach(function (opt) {
        if (!opt || !opt.value) return;
        var idx = parseInt(opt.value, 10);
        if (isNaN(idx) || idx < 0 || idx >= weekdaysFull.length) return;
        var label = weekdaysFull[idx];
        if (label) opt.textContent = label;
      });
    }

    if (typeof W.updateEntryButtonsState === 'function') W.updateEntryButtonsState();
  };
})(window.WorkHours);
