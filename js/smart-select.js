/**
 * Smart single-select picker (typeahead + suggestions).
 * Keeps native <select> as source of truth, but provides dynamic UI.
 */
(function (W) {
  'use strict';

  var registry = {};
  var FILTER_SELECT_IDS = ['filterYear', 'filterMonth', 'filterDay', 'filterWeek', 'filterDayName', 'filterDayStatus', 'filterLocation', 'filterOvertime', 'filterDescription'];
  var FORM_SELECT_IDS = [
    'entryBreakUnit', 'entryStatus', 'entryLocation',
    'editBreakUnit', 'editStatus', 'editLocation',
    'voiceReviewBreakUnit', 'voiceReviewStatus', 'voiceReviewLocation',
    'profileSelect', 'statsSummaryView', 'infographicTimeframe'
  ];
  var COMPACT_SELECT_IDS = ['entryBreakUnit', 'editBreakUnit', 'voiceReviewBreakUnit'];
  var PRESERVE_ORDER_SELECT_IDS = FORM_SELECT_IDS.slice();

  function isModernVariant(variant) {
    return variant === 'filters' || variant === 'form' || variant === 'modern';
  }

  function isCompactSelect(selectEl, cfg) {
    if (!selectEl) return false;
    if (cfg && cfg.compact) return true;
    if (selectEl.id && COMPACT_SELECT_IDS.indexOf(selectEl.id) !== -1) return true;
    if (selectEl.classList && selectEl.classList.contains('bulk-entry-row-breakunit')) return true;
    return (selectEl.options && selectEl.options.length > 0 && selectEl.options.length <= 3);
  }

  function getOptions(selectEl) {
    var out = [];
    Array.prototype.forEach.call(selectEl.options || [], function (opt) {
      out.push({
        value: opt.value,
        label: (opt.textContent || '').trim(),
        disabled: !!opt.disabled
      });
    });
    var autoItem = null;
    out = out.filter(function (item) {
      if (item.value === 'auto') {
        autoItem = item;
        return false;
      }
      return true;
    });
    function isEmptyAll(item) {
      return item && (item.value === '' || item.value == null);
    }
    function asInt(v) {
      var n = parseInt(String(v || ''), 10);
      return isNaN(n) ? null : n;
    }

    // For some filters, ordering should follow numeric meaning (not alphabetical label).
    // Always keep the "All" empty option first when present.
    var id = selectEl && selectEl.id ? String(selectEl.id) : '';
    if (PRESERVE_ORDER_SELECT_IDS.indexOf(id) !== -1) {
      if (autoItem) out.unshift(autoItem);
      return out;
    }
    if (id === 'filterMonth') {
      out.sort(function (a, b) {
        if (isEmptyAll(a) && !isEmptyAll(b)) return -1;
        if (!isEmptyAll(a) && isEmptyAll(b)) return 1;
        var an = asInt(a.value);
        var bn = asInt(b.value);
        if (an != null && bn != null) return an - bn; // 1..12
        return String(a.label || '').localeCompare(String(b.label || ''), undefined, { sensitivity: 'base' });
      });
    } else if (id === 'filterDay' || id === 'filterWeek') {
      // Numeric ordering (Day: 1..31, Week: 1..53). Keep "All" first.
      out.sort(function (a, b) {
        if (isEmptyAll(a) && !isEmptyAll(b)) return -1;
        if (!isEmptyAll(a) && isEmptyAll(b)) return 1;
        var an = asInt(a.value);
        var bn = asInt(b.value);
        if (an != null && bn != null) return an - bn;
        return String(a.label || '').localeCompare(String(b.label || ''), undefined, { sensitivity: 'base' });
      });
    } else if (id === 'filterDayName') {
      // Day index uses JS convention (0=Sunday..6=Saturday). UI should show Monday-first ordering.
      var weekdayOrder = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '0': 6 };
      out.sort(function (a, b) {
        if (isEmptyAll(a) && !isEmptyAll(b)) return -1;
        if (!isEmptyAll(a) && isEmptyAll(b)) return 1;
        var ak = weekdayOrder[String(a.value)];
        var bk = weekdayOrder[String(b.value)];
        if (ak != null && bk != null) return ak - bk; // Mon..Sun
        return String(a.label || '').localeCompare(String(b.label || ''), undefined, { sensitivity: 'base' });
      });
    } else {
      out.sort(function (a, b) {
        if (isEmptyAll(a) && !isEmptyAll(b)) return -1;
        if (!isEmptyAll(a) && isEmptyAll(b)) return 1;
        return String(a.label || '').localeCompare(String(b.label || ''), undefined, { sensitivity: 'base' });
      });
    }
    if (autoItem) out.unshift(autoItem);
    return out;
  }

  function filterOptions(options, query) {
    var q = String(query || '').trim().toLowerCase();
    if (!q) return options.slice();
    return options
      .map(function (item) {
        var label = String(item.label || '').toLowerCase();
        var value = String(item.value || '').toLowerCase();
        var startsLabel = label.indexOf(q) === 0;
        var startsValue = value.indexOf(q) === 0;
        var inLabel = label.indexOf(q);
        var inValue = value.indexOf(q);
        var matched = startsLabel || startsValue || inLabel !== -1 || inValue !== -1;
        if (!matched) return null;
        var rank = startsLabel || startsValue ? 0 : Math.min(inLabel === -1 ? 999 : inLabel + 1, inValue === -1 ? 999 : inValue + 1);
        return { item: item, rank: rank };
      })
      .filter(Boolean)
      .sort(function (a, b) {
        if (a.rank !== b.rank) return a.rank - b.rank;
        return String(a.item.label || '').localeCompare(String(b.item.label || ''), undefined, { sensitivity: 'base' });
      })
      .map(function (x) {
        return x.item;
      });
  }

  function getFallbackLabel(selectId) {
    var label = document.querySelector('label[for="' + selectId + '"]');
    return label ? String(label.textContent || '').trim() : '';
  }

  function getEmptyText() {
    if (W.I18N && typeof W.I18N.t === 'function') return W.I18N.t('filtersEntries.searchNoMatch');
    return 'No match';
  }

  function getAriaLabel(selectEl) {
    var explicit = selectEl.getAttribute('aria-label');
    if (explicit) return explicit;
    var label = getFallbackLabel(selectEl.id);
    return label ? ('Search ' + label) : '';
  }

    function createChevron() {
      var chevron = document.createElement('span');
      chevron.className = 'smart-single-select-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      chevron.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
      return chevron;
    }

  function createOptionElement(item, onPick) {
    var el = document.createElement('div');
    el.className = 'smart-single-select-option';
    el.setAttribute('role', 'option');
    el.dataset.value = item.value;
    el.textContent = item.label;
    if (item.disabled) {
      el.className += ' is-disabled';
      el.setAttribute('aria-disabled', 'true');
    }
    el.addEventListener('mousedown', function (e) { e.preventDefault(); });
    el.addEventListener('click', function () {
      if (item.disabled) return;
      onPick(item.value);
    });
    return el;
  }

  function setListVisible(input, list, wrapper, visible) {
    if (visible) {
      list.removeAttribute('hidden');
      list.style.display = 'block';
      input.setAttribute('aria-expanded', 'true');
      if (wrapper) wrapper.classList.add('is-open');
      return;
    }
    list.setAttribute('hidden', '');
    list.style.display = 'none';
    input.setAttribute('aria-expanded', 'false');
    if (wrapper) wrapper.classList.remove('is-open');
  }

  function enhanceSelect(selectId, options) {
    enhanceSelectElement(document.getElementById(selectId), options);
  }

  function enhanceSelectElement(selectEl, options) {
    var cfg = options || {};
    if (!selectEl || selectEl.dataset.smartEnhanced === '1') return null;

    if (!selectEl.id) {
      selectEl.id = 'smartSelect_' + Math.random().toString(36).slice(2, 10);
    }
    var selectId = selectEl.id;
    var compact = isCompactSelect(selectEl, cfg);

    selectEl.dataset.smartEnhanced = '1';
    selectEl.classList.add('smart-single-select-native');

    var wrapper = document.createElement('div');
    wrapper.className = 'smart-single-select';
    wrapper.dataset.targetSelect = selectId;
    if (isModernVariant(cfg.variant)) wrapper.classList.add('smart-single-select--modern');
    if (cfg.variant === 'form') wrapper.classList.add('smart-single-select--form');
    if (cfg.variant === 'filters') wrapper.classList.add('smart-single-select--filters');
    if (compact) wrapper.classList.add('smart-single-select--compact');

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'smart-single-select-input';
    if (isModernVariant(cfg.variant)) input.classList.add('smart-single-select-input--modern');
    if (compact) {
      input.readOnly = true;
      input.inputMode = 'none';
      input.classList.add('smart-single-select-input--compact');
    }
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('aria-label', getAriaLabel(selectEl));
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'false');

    var list = document.createElement('div');
    list.className = 'smart-single-select-list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('hidden', '');

    wrapper.appendChild(input);
    wrapper.appendChild(createChevron());
    wrapper.appendChild(list);
    selectEl.insertAdjacentElement('afterend', wrapper);

    function selectedLabel() {
      var current = selectEl.value;
      var match = Array.prototype.find.call(selectEl.options || [], function (opt) { return opt.value === current; });
      return match ? (match.textContent || '').trim() : '';
    }

    function syncInputFromSelect() {
      input.value = selectedLabel();
    }

    function syncDisabledState() {
      var disabled = !!selectEl.disabled;
      input.disabled = disabled;
      if (disabled) {
        wrapper.classList.add('is-disabled');
        input.setAttribute('aria-disabled', 'true');
        setListVisible(input, list, wrapper, false);
      } else {
        wrapper.classList.remove('is-disabled');
        input.removeAttribute('aria-disabled');
      }
    }

    function pickValue(value) {
      if (selectEl.value !== value) {
        selectEl.value = value;
        var ev = document.createEvent ? document.createEvent('HTMLEvents') : new Event('change', { bubbles: true });
        if (ev.initEvent) ev.initEvent('change', true, false);
        selectEl.dispatchEvent(ev);
      }
      syncInputFromSelect();
      setListVisible(input, list, wrapper, false);
      input.blur();
    }

    function openList(filtered) {
      list.innerHTML = '';
      var optionsList = filtered || getOptions(selectEl);
      var currentValue = selectEl.value;
      if (!optionsList.length) {
        var empty = document.createElement('div');
        empty.className = 'smart-single-select-empty';
        empty.textContent = getEmptyText();
        list.appendChild(empty);
      } else {
        optionsList.slice(0, 240).forEach(function (item) {
          var optionEl = createOptionElement(item, pickValue);
          if (item.value === currentValue) optionEl.classList.add('is-selected');
          list.appendChild(optionEl);
        });
      }
      setListVisible(input, list, wrapper, true);
    }

    input.addEventListener('focus', function () {
      if (selectEl.disabled) return;
      openList(filterOptions(getOptions(selectEl), compact ? '' : input.value));
    });

    if (!compact) {
      input.addEventListener('input', function () {
        if (selectEl.disabled) return;
        openList(filterOptions(getOptions(selectEl), input.value));
      });
    } else {
      input.addEventListener('mousedown', function (e) {
        if (selectEl.disabled) return;
        e.preventDefault();
        input.focus();
        openList(getOptions(selectEl));
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          openList(getOptions(selectEl));
        }
      });
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        syncInputFromSelect();
        setListVisible(input, list, wrapper, false);
        input.blur();
      } else if (e.key === 'Enter') {
        var optionMatches = filterOptions(getOptions(selectEl), input.value);
        var firstEnabled = optionMatches.find(function (item) { return !item.disabled; });
        if (firstEnabled) pickValue(firstEnabled.value);
      }
    });

    document.addEventListener('click', function (e) {
      if (!wrapper.contains(e.target)) {
        syncInputFromSelect();
        setListVisible(input, list, wrapper, false);
      }
    });

    registry[selectId] = {
      sync: function () {
        input.setAttribute('aria-label', getAriaLabel(selectEl));
        syncInputFromSelect();
        syncDisabledState();
        if (document.activeElement === input) {
          openList(filterOptions(getOptions(selectEl), compact ? '' : input.value));
        }
      }
    };

    syncInputFromSelect();
    syncDisabledState();
    return selectId;
  }

  W.enhanceSmartSingleSelectsInContainer = function enhanceSmartSingleSelectsInContainer(root, options) {
    if (!root || !root.querySelectorAll) return;
    var cfg = options || { variant: 'form' };
    root.querySelectorAll('select:not(.smart-single-select-native)').forEach(function (sel) {
      enhanceSelectElement(sel, cfg);
    });
    if (typeof W.refreshSmartSingleSelects === 'function') W.refreshSmartSingleSelects();
  };

  W.initSmartSingleSelects = function initSmartSingleSelects() {
    enhanceSelect('themeSelect', { variant: 'modern' });
    enhanceSelect('languageSelect', { variant: 'modern' });
    FILTER_SELECT_IDS.forEach(function (id) {
      enhanceSelect(id, { variant: 'filters' });
    });
    FORM_SELECT_IDS.forEach(function (id) {
      enhanceSelect(id, { variant: 'form' });
    });
  };

  W.refreshSmartSingleSelects = function refreshSmartSingleSelects() {
    Object.keys(registry).forEach(function (id) {
      if (registry[id] && typeof registry[id].sync === 'function') registry[id].sync();
    });
  };
})(window.WorkHours);

