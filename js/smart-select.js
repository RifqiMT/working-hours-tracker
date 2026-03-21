/**
 * Smart single-select picker (typeahead + suggestions).
 * Keeps native <select> as source of truth, but provides dynamic UI.
 */
(function (W) {
  'use strict';

  var registry = {};

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
    out.sort(function (a, b) {
      return String(a.label || '').localeCompare(String(b.label || ''), undefined, { sensitivity: 'base' });
    });
    if (autoItem) out.unshift(autoItem);
    return out;
  }

  function filterOptions(options, query) {
    var q = String(query || '').trim().toLowerCase();
    if (!q) return options.slice();
    return options.filter(function (item) {
      return item.label.toLowerCase().indexOf(q) !== -1 || String(item.value || '').toLowerCase().indexOf(q) !== -1;
    });
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

  function enhanceSelect(selectId) {
    var selectEl = document.getElementById(selectId);
    if (!selectEl || selectEl.dataset.smartEnhanced === '1') return;

    selectEl.dataset.smartEnhanced = '1';
    selectEl.classList.add('smart-single-select-native');

    var wrapper = document.createElement('div');
    wrapper.className = 'smart-single-select';
    wrapper.dataset.targetSelect = selectId;

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'smart-single-select-input';
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('aria-label', selectEl.getAttribute('aria-label') || '');
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'false');

    var list = document.createElement('div');
    list.className = 'smart-single-select-list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('hidden', '');

    wrapper.appendChild(input);
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
      closeList();
      input.blur();
    }

    function openList(filtered) {
      list.innerHTML = '';
      var options = filtered || getOptions(selectEl);
      if (!options.length) {
        var empty = document.createElement('div');
        empty.className = 'smart-single-select-empty';
        empty.textContent = (W.I18N && W.I18N.t) ? W.I18N.t('filtersEntries.searchNoMatch') : 'No match';
        list.appendChild(empty);
      } else {
        options.slice(0, 200).forEach(function (item) {
          list.appendChild(createOptionElement(item, pickValue));
        });
      }
      list.removeAttribute('hidden');
      list.style.display = 'block';
      input.setAttribute('aria-expanded', 'true');
    }

    function closeList() {
      list.setAttribute('hidden', '');
      list.style.display = 'none';
      input.setAttribute('aria-expanded', 'false');
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
        closeList();
        input.blur();
      } else if (e.key === 'Enter') {
        var options = filterOptions(getOptions(selectEl), input.value);
        var firstEnabled = options.find(function (item) { return !item.disabled; });
        if (firstEnabled) pickValue(firstEnabled.value);
      }
    });

    document.addEventListener('click', function (e) {
      if (!wrapper.contains(e.target)) {
        syncInputFromSelect();
        closeList();
      }
    });

    registry[selectId] = {
      sync: function () {
        input.setAttribute('aria-label', selectEl.getAttribute('aria-label') || '');
        syncInputFromSelect();
        if (document.activeElement === input) {
          openList(filterOptions(getOptions(selectEl), input.value));
        }
      }
    };

    syncInputFromSelect();
  }

  W.initSmartSingleSelects = function initSmartSingleSelects() {
    enhanceSelect('themeSelect');
    enhanceSelect('languageSelect');
  };

  W.refreshSmartSingleSelects = function refreshSmartSingleSelects() {
    Object.keys(registry).forEach(function (id) {
      if (registry[id] && typeof registry[id].sync === 'function') registry[id].sync();
    });
  };
})(window.WorkHours);

