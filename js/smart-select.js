/**
 * Smart single-select picker (typeahead + suggestions).
 * Keeps native <select> as source of truth, but provides dynamic UI.
 */
(function (W) {
  'use strict';

  var registry = {};
  var FILTER_SELECT_IDS = ['filterYear', 'filterMonth', 'filterDay', 'filterWeek', 'filterDayName', 'filterDayStatus', 'filterLocation', 'filterOvertime', 'filterDescription'];

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
    if (id === 'filterMonth') {
      out.sort(function (a, b) {
        if (isEmptyAll(a) && !isEmptyAll(b)) return -1;
        if (!isEmptyAll(a) && isEmptyAll(b)) return 1;
        var an = asInt(a.value);
        var bn = asInt(b.value);
        if (an != null && bn != null) return an - bn; // 1..12
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
    chevron.textContent = '▾';
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

  function setListVisible(input, list, visible) {
    if (visible) {
      list.removeAttribute('hidden');
      list.style.display = 'block';
      input.setAttribute('aria-expanded', 'true');
      return;
    }
    list.setAttribute('hidden', '');
    list.style.display = 'none';
    input.setAttribute('aria-expanded', 'false');
  }

  function enhanceSelect(selectId, options) {
    var cfg = options || {};
    var selectEl = document.getElementById(selectId);
    if (!selectEl || selectEl.dataset.smartEnhanced === '1') return;

    selectEl.dataset.smartEnhanced = '1';
    selectEl.classList.add('smart-single-select-native');

    var wrapper = document.createElement('div');
    wrapper.className = 'smart-single-select';
    wrapper.dataset.targetSelect = selectId;
    if (cfg.variant === 'filters') wrapper.classList.add('smart-single-select--filters');

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'smart-single-select-input';
    if (cfg.variant === 'filters') input.classList.add('smart-single-select-input--filters');
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

    function pickValue(value) {
      if (selectEl.value !== value) {
        selectEl.value = value;
        var ev = document.createEvent ? document.createEvent('HTMLEvents') : new Event('change', { bubbles: true });
        if (ev.initEvent) ev.initEvent('change', true, false);
        selectEl.dispatchEvent(ev);
      }
      syncInputFromSelect();
      setListVisible(input, list, false);
      input.blur();
    }

    function openList(filtered) {
      list.innerHTML = '';
      var optionsList = filtered || getOptions(selectEl);
      if (!optionsList.length) {
        var empty = document.createElement('div');
        empty.className = 'smart-single-select-empty';
        empty.textContent = getEmptyText();
        list.appendChild(empty);
      } else {
        optionsList.slice(0, 240).forEach(function (item) {
          list.appendChild(createOptionElement(item, pickValue));
        });
      }
      setListVisible(input, list, true);
    }

    input.addEventListener('focus', function () {
      openList(filterOptions(getOptions(selectEl), input.value));
    });

    input.addEventListener('input', function () {
      openList(filterOptions(getOptions(selectEl), input.value));
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        syncInputFromSelect();
        setListVisible(input, list, false);
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
        setListVisible(input, list, false);
      }
    });

    registry[selectId] = {
      sync: function () {
        input.setAttribute('aria-label', getAriaLabel(selectEl));
        syncInputFromSelect();
        if (document.activeElement === input) {
          openList(filterOptions(getOptions(selectEl), input.value));
        }
      }
    };

    syncInputFromSelect();
  }

  W.initSmartSingleSelects = function initSmartSingleSelects() {
    enhanceSelect('themeSelect', { variant: 'header' });
    enhanceSelect('languageSelect', { variant: 'header' });
    FILTER_SELECT_IDS.forEach(function (id) {
      enhanceSelect(id, { variant: 'filters' });
    });
  };

  W.refreshSmartSingleSelects = function refreshSmartSingleSelects() {
    Object.keys(registry).forEach(function (id) {
      if (registry[id] && typeof registry[id].sync === 'function') registry[id].sync();
    });
  };
})(window.WorkHours);

