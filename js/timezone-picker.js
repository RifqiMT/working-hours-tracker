/**
 * Searchable timezone picker (global timezone list).
 * Depends: time (getTimezoneList, getTimeZoneLabel).
 */
(function (W) {
  'use strict';

  function filterZones(list, query, emptyOption) {
    if (!query || !query.trim()) return list;
    var q = query.trim().toLowerCase();
    var filtered = list.filter(function (z) {
      return z.value.toLowerCase().indexOf(q) !== -1 || z.label.toLowerCase().indexOf(q) !== -1;
    });
    if (emptyOption && (filtered.length === 0 || emptyOption.label.toLowerCase().indexOf(q) !== -1)) {
      filtered = [emptyOption].concat(filtered.filter(function (z) { return z.value !== ''; }));
    }
    return filtered;
  }

  function initPicker(wrapEl, hiddenInputId, options) {
    options = options || {};
    var hidden = document.getElementById(hiddenInputId);
    if (!wrapEl || !hidden) return;
    var list = (typeof W.getTimezoneList === 'function') ? W.getTimezoneList() : [];
    var emptyLabel = options.emptyLabel || '';
    var hasEmptyOption = !!emptyLabel;
    var emptyOption = hasEmptyOption ? { value: '', label: emptyLabel } : null;
    if (hasEmptyOption) list = [emptyOption].concat(list);
    if (list.length === 0) return;

    var input = wrapEl.querySelector('.tz-picker-input');
    var listEl = wrapEl.querySelector('.tz-picker-list');
    if (!input || !listEl) return;

    function setDisplayLabel(value) {
      if (value === '' && emptyLabel) {
        input.value = emptyLabel;
      } else {
        input.value = (typeof W.getTimeZoneLabel === 'function') ? W.getTimeZoneLabel(value) : value;
      }
      if (hiddenInputId === 'entriesViewTimezone') {
        hidden.value = value || '';
      } else {
        hidden.value = value || W.DEFAULT_TIMEZONE;
      }
    }

    function renderList(zones, query) {
      listEl.innerHTML = '';
      if (query && query.length > 0) {
        var head = document.createElement('div');
        head.className = 'tz-picker-suggestions-label';
        head.textContent = 'Suggestions';
        listEl.appendChild(head);
      }
      zones.slice(0, 200).forEach(function (z) {
        var opt = document.createElement('div');
        opt.setAttribute('role', 'option');
        opt.className = 'tz-picker-option';
        opt.dataset.value = z.value;
        opt.textContent = z.label;
        opt.addEventListener('click', function () {
          setDisplayLabel(z.value);
          listEl.setAttribute('hidden', '');
          listEl.style.display = 'none';
          input.blur();
          if (hiddenInputId === 'entriesViewTimezone') {
            W._entriesViewTimezone = (z.value || '').trim();
            if (typeof W.renderEntries === 'function') W.renderEntries();
          }
          var ev = document.createEvent ? document.createEvent('HTMLEvents') : new Event('change', { bubbles: true });
          if (ev.initEvent) ev.initEvent('change', true, false);
          hidden.dispatchEvent(ev);
        });
        listEl.appendChild(opt);
      });
      if (zones.length > 200) {
        var more = document.createElement('div');
        more.className = 'tz-picker-more';
        more.textContent = 'Type to narrow down (' + zones.length + ' total)';
        listEl.appendChild(more);
      } else if (zones.length === 0) {
        var none = document.createElement('div');
        none.className = 'tz-picker-more';
        none.textContent = 'No timezones match. Try a different search.';
        listEl.appendChild(none);
      }
    }

    if (hiddenInputId === 'entriesViewTimezone') {
      setDisplayLabel(hidden.value);
    } else {
      setDisplayLabel(hidden.value || W.DEFAULT_TIMEZONE);
    }

    input.addEventListener('focus', function () {
      var q = input.value.trim();
      if (q === emptyLabel) q = '';
      var filtered = filterZones(list, q, emptyOption);
      renderList(filtered.length ? filtered : list, q);
      listEl.removeAttribute('hidden');
      listEl.style.display = 'block';
    });

    input.addEventListener('input', function () {
      var q = input.value.trim();
      if (q === emptyLabel) q = '';
      var filtered = filterZones(list, q, emptyOption);
      renderList(filtered.length ? filtered : list, q);
      listEl.removeAttribute('hidden');
      listEl.style.display = 'block';
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        setDisplayLabel(hidden.value);
        listEl.setAttribute('hidden', '');
        listEl.style.display = 'none';
        input.blur();
        return;
      }
      if (listEl.getAttribute('hidden') !== null || listEl.style.display === 'none') {
        var q = (input.value + (e.key.length === 1 ? e.key : '')).trim();
        if (q === emptyLabel) q = '';
        var filtered = filterZones(list, q, emptyOption);
        renderList(filtered.length ? filtered : list, q);
        listEl.removeAttribute('hidden');
        listEl.style.display = 'block';
      }
    });

    document.addEventListener('click', function outside(e) {
      if (!wrapEl.contains(e.target)) {
        setDisplayLabel(hidden.value);
        listEl.setAttribute('hidden', '');
        listEl.style.display = 'none';
      }
    });
  }

  W.initTimezonePickers = function initTimezonePickers() {
    var entryWrap = document.getElementById('entryTimezoneWrap');
    if (entryWrap) initPicker(entryWrap, 'entryTimezone');

    var editWrap = document.getElementById('editTimezoneWrap');
    if (editWrap) initPicker(editWrap, 'editTimezone');

    var viewWrap = document.getElementById('entriesViewTimezoneWrap');
    if (viewWrap) initPicker(viewWrap, 'entriesViewTimezone', { emptyLabel: 'Entry timezone' });
  };
})(window.WorkHours);
