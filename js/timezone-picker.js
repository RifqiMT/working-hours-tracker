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

    /** Rebuild each time so labels follow language (getTimeZoneLabel uses currentLanguage). */
    function buildZoneList() {
      var base = (typeof W.getTimezoneList === 'function') ? W.getTimezoneList() : [];
      var emptyLabel = options.emptyLabel || '';
      if (hiddenInputId === 'entriesViewTimezone' && W.I18N && typeof W.I18N.t === 'function') {
        emptyLabel = W.I18N.t('filtersEntries.entriesViewTimezonePlaceholder');
      }
      var hasEmptyOption = !!emptyLabel;
      var emptyOption = hasEmptyOption ? { value: '', label: emptyLabel } : null;
      if (emptyOption) return [emptyOption].concat(base);
      return base;
    }

    var list = buildZoneList();
    if (list.length === 0) return;

    var input = wrapEl.querySelector('.tz-picker-input');
    var listEl = wrapEl.querySelector('.tz-picker-list');
    if (!input || !listEl) return;
    if (W.I18N && typeof W.I18N.t === 'function') {
      // Keep listbox aria-label in sync with current language (HTML has a hardcoded default).
      var aria = W.I18N.t('timezone.optionsAriaLabel');
      if (aria) listEl.setAttribute('aria-label', aria);
    }

    /** Edit modal uses overflow on the body; fixed list avoids clipping under scrollable ancestors. */
    var useFixedListInEditModal = !!(wrapEl.closest && wrapEl.closest('#editModal'));

    function syncEditModalTzListFixedPosition() {
      if (!useFixedListInEditModal) return;
      if (listEl.style.display === 'none') return;
      var r = input.getBoundingClientRect();
      var spaceBelow = window.innerHeight - r.bottom - 10;
      var maxH = Math.max(72, Math.min(220, spaceBelow));
      listEl.style.position = 'fixed';
      listEl.style.left = r.left + 'px';
      listEl.style.top = r.bottom + 4 + 'px';
      listEl.style.right = 'auto';
      listEl.style.width = Math.max(r.width, 160) + 'px';
      listEl.style.maxHeight = maxH + 'px';
      listEl.style.zIndex = '10050';
    }

    function resetEditModalTzListFixedStyles() {
      if (!useFixedListInEditModal) return;
      listEl.style.position = '';
      listEl.style.left = '';
      listEl.style.top = '';
      listEl.style.right = '';
      listEl.style.width = '';
      listEl.style.maxHeight = '';
      listEl.style.zIndex = '';
    }

    function hideTzDropdown() {
      listEl.setAttribute('hidden', '');
      listEl.style.display = 'none';
      resetEditModalTzListFixedStyles();
    }

    function showTzDropdown() {
      listEl.removeAttribute('hidden');
      listEl.style.display = 'block';
      if (useFixedListInEditModal) {
        var run = function () { syncEditModalTzListFixedPosition(); };
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run);
        else run();
      }
    }

    if (useFixedListInEditModal) {
      window.addEventListener('resize', syncEditModalTzListFixedPosition);
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', syncEditModalTzListFixedPosition);
        window.visualViewport.addEventListener('scroll', syncEditModalTzListFixedPosition);
      }
      var editModalBody = wrapEl.closest('.edit-entry-modal-body');
      if (editModalBody) {
        editModalBody.addEventListener('scroll', syncEditModalTzListFixedPosition, { passive: true });
      }
    }

    function currentEmptyLabel() {
      if (hiddenInputId === 'entriesViewTimezone' && W.I18N && typeof W.I18N.t === 'function') {
        return W.I18N.t('filtersEntries.entriesViewTimezonePlaceholder');
      }
      return options.emptyLabel || '';
    }

    function setDisplayLabel(value) {
      var elab = currentEmptyLabel();
      if (value === '' && elab) {
        input.value = elab;
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
        head.textContent = (W.I18N && W.I18N.t) ? W.I18N.t('timezone.suggestions') : 'Suggestions';
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
          hideTzDropdown();
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
        more.textContent = (W.I18N && W.I18N.t) ? W.I18N.t('timezone.typeToNarrow', { n: zones.length }) : ('Type to narrow down (' + zones.length + ' total)');
        listEl.appendChild(more);
      } else if (zones.length === 0) {
        var none = document.createElement('div');
        none.className = 'tz-picker-more';
        none.textContent = (W.I18N && W.I18N.t) ? W.I18N.t('timezone.noMatch') : 'No timezones match. Try a different search.';
        listEl.appendChild(none);
      }
    }

    if (hiddenInputId === 'entriesViewTimezone') {
      setDisplayLabel(hidden.value);
    } else {
      setDisplayLabel(hidden.value || W.DEFAULT_TIMEZONE);
    }

    input.addEventListener('focus', function () {
      list = buildZoneList();
      var emptyLabel = (list[0] && list[0].value === '') ? list[0].label : '';
      var emptyOption = (list[0] && list[0].value === '') ? list[0] : null;
      var q = input.value.trim();
      if (q === emptyLabel) q = '';
      var filtered = filterZones(list, q, emptyOption);
      renderList(filtered.length ? filtered : list, q);
      showTzDropdown();
    });

    input.addEventListener('input', function () {
      list = buildZoneList();
      var emptyLabel = (list[0] && list[0].value === '') ? list[0].label : '';
      var emptyOption = (list[0] && list[0].value === '') ? list[0] : null;
      var q = input.value.trim();
      if (q === emptyLabel) q = '';
      var filtered = filterZones(list, q, emptyOption);
      renderList(filtered.length ? filtered : list, q);
      showTzDropdown();
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        setDisplayLabel(hidden.value);
        hideTzDropdown();
        input.blur();
        return;
      }
      if (listEl.getAttribute('hidden') !== null || listEl.style.display === 'none') {
        list = buildZoneList();
        var emptyLabel = (list[0] && list[0].value === '') ? list[0].label : '';
        var emptyOption = (list[0] && list[0].value === '') ? list[0] : null;
        var q = (input.value + (e.key.length === 1 ? e.key : '')).trim();
        if (q === emptyLabel) q = '';
        var filtered = filterZones(list, q, emptyOption);
        renderList(filtered.length ? filtered : list, q);
        showTzDropdown();
      }
    });

    document.addEventListener('click', function outside(e) {
      if (!wrapEl.contains(e.target)) {
        setDisplayLabel(hidden.value);
        hideTzDropdown();
      }
    });
  }

  W.initTimezonePickers = function initTimezonePickers() {
    var entryWrap = document.getElementById('entryTimezoneWrap');
    if (entryWrap) initPicker(entryWrap, 'entryTimezone');

    var editWrap = document.getElementById('editTimezoneWrap');
    if (editWrap) initPicker(editWrap, 'editTimezone');

    var viewWrap = document.getElementById('entriesViewTimezoneWrap');
    if (viewWrap) {
      var emptyLabel = (W.I18N && typeof W.I18N.t === 'function')
        ? W.I18N.t('filtersEntries.entriesViewTimezonePlaceholder')
        : 'Entry timezone';
      initPicker(viewWrap, 'entriesViewTimezone', { emptyLabel: emptyLabel });
    }
  };
})(window.WorkHours);
