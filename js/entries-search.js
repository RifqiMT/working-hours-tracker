/**
 * Suggestive (typeahead) free-text search for entries.
 * Depends: entries, i18n, filters (getFilteredEntries), render (renderEntries/renderCalendar/renderStatsBox).
 */
(function (W) {
  'use strict';

  function toLowerSafe(v) {
    return (v == null ? '' : String(v)).toLowerCase();
  }

  function truncateLabel(s, maxLen) {
    s = (s == null ? '' : String(s)).trim();
    if (s.length <= maxLen) return s;
    return s.slice(0, maxLen - 1) + '…';
  }

  function buildCandidatePools() {
    var entries = (typeof W.getEntries === 'function') ? W.getEntries() : [];
    var statusSet = {};
    var locationSet = {};
    var dateSet = {};
    var descSet = {};
    var yearSet = {};
    var yearMonthSet = {};
    var monthNameSet = {};
    var monthFullSet = {};
    var weekdayShortSet = {};
    var isoWeekSet = {};
    var timeSet = {};

    var lang = W.currentLanguage || 'en';
    var monthsArr = (W.I18N && typeof W.I18N.resolve === 'function') ? W.I18N.resolve('calendarStats.months', lang) : null;
    var weekdaysArr = (W.I18N && typeof W.I18N.resolve === 'function') ? W.I18N.resolve('calendarStats.weekdaysFull', lang) : null;

    entries.forEach(function (e) {
      var status = e.dayStatus || 'work';
      statusSet[status] = true;
      if (e.location) locationSet[e.location] = true;
      if (e.date) dateSet[e.date] = true;
      var d = (e.description || '').trim();
      if (d) {
        descSet[d] = true;
        // Add translated description values to suggestions when available.
        if (typeof W.getTranslatedDescriptionCached === 'function') {
          var translated = W.getTranslatedDescriptionCached(d, lang);
          if (translated && String(translated).trim()) descSet[String(translated).trim()] = true;
          else if (typeof W.translateDescriptionText === 'function') {
            W.translateDescriptionText(d, lang).then(function () {
              // Rebuild suggestion pools once new translations arrive.
              W._entriesSearchCandidatePools = null;
              if (W._entriesSearchRefreshQueued) return;
              W._entriesSearchRefreshQueued = true;
              setTimeout(function () {
                W._entriesSearchRefreshQueued = false;
                var inputEl = document.getElementById('entriesSearchInput');
                if (!inputEl) return;
                // Re-trigger suggestions while typing/focused for responsive updates.
                if (document.activeElement === inputEl || inputEl.value) {
                  inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }, 90);
            });
          }
        }
      }
      var clockIn = (e.clockIn || '').toString().trim();
      if (clockIn) timeSet[clockIn] = true;
      var clockOut = (e.clockOut || '').toString().trim();
      if (clockOut) timeSet[clockOut] = true;

      var dateIso = (e.date || '').trim();
      if (dateIso.length >= 8) {
        yearSet[dateIso.slice(0, 4)] = true;
        var dateObj = new Date(dateIso + 'T12:00:00');
        if (!isNaN(dateObj.getTime())) {
          var monthIdx = dateObj.getMonth();
          var monthNum = String(monthIdx + 1);
          var monthNumPad = (monthNum.length < 2) ? ('0' + monthNum) : monthNum;
          var yearMonth = dateIso.slice(0, 4) + '-' + monthNumPad;
          yearMonthSet[yearMonth] = true;

          var monthName = (monthsArr && monthsArr[monthIdx]) ? monthsArr[monthIdx] : '';
          if (monthName) monthNameSet[monthName] = true;
          if (monthName) monthFullSet[monthName] = true;

          var wdShort = (weekdaysArr && weekdaysArr[dateObj.getDay()]) ? weekdaysArr[dateObj.getDay()] : '';
          if (wdShort) weekdayShortSet[wdShort] = true;

          if (typeof W.getISOWeek === 'function') {
            isoWeekSet[String(W.getISOWeek(dateIso))] = true;
          }
        }
      }
    });

    var statusCodes = Object.keys(statusSet).sort();
    var locationCodes = Object.keys(locationSet).sort();
    var dateList = Object.keys(dateSet).sort().reverse(); // ISO strings: lexicographic == chronological.

    var descPool = Object.keys(descSet);
    // Cap to keep typing responsive.
    descPool = descPool.slice(0, 120);
    var yearList = Object.keys(yearSet).sort().reverse();
    var yearMonthList = Object.keys(yearMonthSet).sort().reverse();
    var monthNameList = Object.keys(monthNameSet).sort();
    var monthFullList = Object.keys(monthFullSet).sort();
    var weekdayShortList = Object.keys(weekdayShortSet).sort();
    var isoWeekList = Object.keys(isoWeekSet).sort().reverse();
    var timeList = Object.keys(timeSet).sort();

    return {
      statusCodes: statusCodes,
      locationCodes: locationCodes,
      dateList: dateList,
      descPool: descPool,
      yearList: yearList,
      yearMonthList: yearMonthList,
      monthNameList: monthNameList,
      monthFullList: monthFullList,
      weekdayShortList: weekdayShortList,
      isoWeekList: isoWeekList,
      timeList: timeList
    };
  }

  function ensurePools() {
    var lang = W.currentLanguage || 'en';
    if (!W._entriesSearchCandidatePools || W._entriesSearchCandidateLang !== lang) {
      W._entriesSearchCandidatePools = buildCandidatePools();
      W._entriesSearchCandidateLang = lang;
    }
    return W._entriesSearchCandidatePools;
  }

  W.initEntriesSearch = function initEntriesSearch() {
    var input = document.getElementById('entriesSearchInput');
    var wrap = document.getElementById('entriesSearchWrap');
    var listEl = document.getElementById('entriesSearchList');
    var clearBtn = document.getElementById('entriesSearchClearBtn');
    if (!input || !wrap || !listEl) return;

    function hideList() {
      listEl.setAttribute('hidden', '');
      listEl.style.display = 'none';
    }

    function showList() {
      listEl.removeAttribute('hidden');
      listEl.style.display = 'block';
    }

    function getI18nT() {
      return (W.I18N && typeof W.I18N.t === 'function') ? W.I18N.t : function (k) { return k; };
    }

    function getStatusLabel(statusCode) {
      var t = getI18nT();
      return t('status.' + (statusCode || 'work'));
    }

    function getLocationLabel(locCode) {
      var t = getI18nT();
      if (locCode === 'WFO') return t('location.wfo');
      if (locCode === 'WFH') return t('location.wfh');
      if (locCode === 'Anywhere') return t('location.anywhere');
      return locCode || '';
    }

    function renderSuggestions(queryRaw) {
      var t = getI18nT();
      var q = toLowerSafe(queryRaw).trim();

      // Refresh pools if entries changed significantly (e.g., after import).
      // Cheap heuristic: rebuild if pool is empty.
      var pools = ensurePools();
      if (!pools || (!pools.statusCodes.length && !pools.locationCodes.length && !pools.dateList.length && !pools.descPool.length)) {
        W._entriesSearchCandidatePools = buildCandidatePools();
        pools = W._entriesSearchCandidatePools;
      }

      listEl.innerHTML = '';

      // Header when user is typing.
      if (q.length) {
        var head = document.createElement('div');
        head.className = 'tz-picker-suggestions-label';
        head.textContent = t('filtersEntries.searchSuggestionsLabel');
        listEl.appendChild(head);
      }

      var suggestions = [];
      var seen = {};

      function pushSuggestion(kind, displayLabel) {
        if (!displayLabel) return;
        var label = String(displayLabel);
        var key = kind + '|' + label;
        if (seen[key]) return;
        seen[key] = true;
        suggestions.push({ kind: kind, label: label });
      }

      // Status suggestions.
      pools.statusCodes.forEach(function (code) {
        var label = getStatusLabel(code);
        if (!q || toLowerSafe(label).indexOf(q) !== -1 || toLowerSafe(code).indexOf(q) !== -1) {
          pushSuggestion('status', label);
        }
      });

      // Location suggestions.
      pools.locationCodes.forEach(function (code) {
        var label = getLocationLabel(code);
        if (!q || toLowerSafe(label).indexOf(q) !== -1 || toLowerSafe(code).indexOf(q) !== -1) {
          pushSuggestion('location', label);
        }
      });

      // Overtime suggestions (generic).
      var overtimeLabel = t('filters.options.overtime.overtime');
      var noOvertimeLabel = t('filters.options.overtime.no-overtime');
      if (!q || toLowerSafe(overtimeLabel).indexOf(q) !== -1) pushSuggestion('overtime', overtimeLabel);
      if (!q || toLowerSafe(noOvertimeLabel).indexOf(q) !== -1) pushSuggestion('overtime', noOvertimeLabel);

      // Date suggestions (ISO substring match).
      if (q) {
        // Year-only.
        if (/^\d{4}$/.test(q) && pools.yearList) {
          pools.yearList.forEach(function (y) {
            if (toLowerSafe(y).indexOf(q) !== -1) pushSuggestion('year', y);
          });
        }

        // Year-month patterns (YYYY-MM).
        if ((q.indexOf('-') !== -1 || /^\d{4}\d{0,2}$/.test(q)) && pools.yearMonthList) {
          pools.yearMonthList.forEach(function (ym) {
            if (!ym) return;
            if (toLowerSafe(ym).indexOf(q) !== -1) pushSuggestion('yearMonth', ym);
          });
        }

        // Month/day names.
        if (q.length >= 3) {
          if (pools.monthFullList) {
            pools.monthFullList.forEach(function (m) {
              if (!m) return;
              if (toLowerSafe(m).indexOf(q) !== -1) pushSuggestion('month', m);
            });
          }
          if (pools.monthNameList) {
            pools.monthNameList.forEach(function (m) {
              if (!m) return;
              if (toLowerSafe(m).indexOf(q) !== -1) pushSuggestion('month', m);
            });
          }
          if (pools.weekdayShortList) {
            pools.weekdayShortList.forEach(function (wd) {
              if (!wd) return;
              if (toLowerSafe(wd).indexOf(q) !== -1) pushSuggestion('weekday', wd);
            });
          }
        }

        // ISO week number.
        if (pools.isoWeekList) {
          pools.isoWeekList.forEach(function (w) {
            if (!w) return;
            if (toLowerSafe(w).indexOf(q) !== -1) pushSuggestion('week', w);
          });
        }

      // Time suggestions (clock in/out like "09:00", "17:30", or partial like "9:").
      if (pools.timeList && q && (q.indexOf(':') !== -1 || /^\d{1,2}$/.test(q))) {
        pools.timeList.forEach(function (tm) {
          if (!tm) return;
          if (toLowerSafe(tm).indexOf(q) !== -1) {
            pushSuggestion('time', tm);
          }
          if (suggestions.length >= 12) return;
        });
      }

        // ISO date substring fallback.
        if (q.length >= 3 && pools.dateList) {
          pools.dateList.forEach(function (d) {
            if (!d) return;
            if (toLowerSafe(d).indexOf(q) !== -1) pushSuggestion('date', d);
            if (suggestions.length >= 12) return;
          });
        }
      }

      // Description suggestions (snippet).
      if (q) {
        pools.descPool.forEach(function (desc) {
          if (!desc) return;
          if (toLowerSafe(desc).indexOf(q) !== -1) {
            pushSuggestion('description', truncateLabel(desc, 42));
          }
          if (suggestions.length >= 12) return;
        });
      }

      // If empty query, keep it short and relevant (latest dates first).
      if (!q) {
        suggestions = suggestions.slice(0, 6);
        // Also include a few recent dates for faster jump.
        var recentDatesAdded = 0;
        pools.dateList.forEach(function (d) {
          if (recentDatesAdded >= 3) return;
          if (!seen['date|' + d]) {
            pushSuggestion('date', d);
            recentDatesAdded++;
          }
        });
      }

      // Render list options.
      if (!suggestions.length) {
        var none = document.createElement('div');
        none.className = 'tz-picker-more';
        none.textContent = t('filtersEntries.searchNoMatch');
        listEl.appendChild(none);
      } else {
        suggestions.slice(0, 12).forEach(function (s) {
          var opt = document.createElement('div');
          opt.setAttribute('role', 'option');
          opt.className = 'tz-picker-option';
          opt.textContent = s.label;
          opt.addEventListener('click', function (e) {
            e.preventDefault();
            input.value = s.label;
            hideList();
            input.blur();
            if (typeof W.renderEntries === 'function') W.renderEntries();
            if (typeof W.renderCalendar === 'function') W.renderCalendar();
            if (typeof W.renderStatsBox === 'function') W.renderStatsBox();
          });
          listEl.appendChild(opt);
        });
      }
    }

    function applySearchRender() {
      if (typeof W.renderEntries === 'function') W.renderEntries();
      if (typeof W.renderCalendar === 'function') W.renderCalendar();
      if (typeof W.renderStatsBox === 'function') W.renderStatsBox();
    }

    function update() {
      renderSuggestions(input.value);
      showList();
      applySearchRender();
    }

    // Initial state.
    hideList();

    input.addEventListener('focus', function () {
      renderSuggestions(input.value);
      showList();
    });

    input.addEventListener('input', function () {
      update();
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        hideList();
        input.blur();
        return;
      }
      if (e.key === 'Enter') {
        // Select the first option if available.
        var first = listEl.querySelector('.tz-picker-option');
        if (first) first.click();
      }
    });

    document.addEventListener('click', function (ev) {
      if (!wrap.contains(ev.target)) {
        hideList();
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        hideList();
        if (typeof W.renderEntries === 'function') W.renderEntries();
        if (typeof W.renderCalendar === 'function') W.renderCalendar();
        if (typeof W.renderStatsBox === 'function') W.renderStatsBox();
      });
    }
  };
})(window.WorkHours);

