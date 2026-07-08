/**
 * Shared custom tooltip: structured sections, theme-aware, responsive.
 */
(function (W) {
  'use strict';

  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escAttr(s) {
    return escHtml(s);
  }

  function buildTooltipText(lines) {
    return lines.filter(function (l) { return l !== null && l !== undefined; }).join('\n');
  }

  W.buildAppTooltipText = buildTooltipText;

  W.buildAppTooltipAttr = function buildAppTooltipAttr(lines) {
    return escAttr(buildTooltipText(lines));
  };

  W.buildAppTooltipData = function buildAppTooltipData(lines) {
    return escAttr(buildTooltipText(lines).replace(/\n/g, '\\n'));
  };

  function decodeTooltipRaw(raw) {
    return String(raw || '').replace(/\\n/g, '\n');
  }

  function splitKeyValue(line) {
    var idx = String(line).indexOf(':');
    if (idx <= 0) return null;
    var key = line.slice(0, idx).trim();
    var val = line.slice(idx + 1).trim();
    if (!key) return null;
    return { key: key, val: val };
  }

  W.renderAppTooltipHtml = function renderAppTooltipHtml(raw) {
    var txt = decodeTooltipRaw(raw);
    var lines = String(txt).split('\n');
    var titleKey = '';
    var titleVal = '';
    var body = [];
    var i = 0;

    for (; i < lines.length; i++) {
      var line = lines[i];
      if (!String(line || '').trim()) continue;
      var kv = splitKeyValue(line.trim());
      if (kv && kv.val) {
        titleKey = kv.key;
        titleVal = kv.val;
      } else {
        body.push(line);
      }
      i++;
      break;
    }
    for (; i < lines.length; i++) body.push(lines[i]);

    var html = '<div class="app-tip">';
    if (titleKey || titleVal) {
      html += '<div class="app-tip__header">';
      if (titleKey) html += '<div class="app-tip__title">' + escHtml(titleKey) + '</div>';
      if (titleVal) html += '<div class="app-tip__badge">' + escHtml(titleVal) + '</div>';
      html += '</div>';
    }

    var sections = [];
    var current = null;

    function pushSection(label) {
      current = { label: label || '', rows: [] };
      sections.push(current);
    }

    body.forEach(function (line) {
      if (line === '' || line == null) {
        current = null;
        return;
      }
      var trimmed = String(line);
      var isSub = trimmed.indexOf('  ') === 0;
      var t = trimmed.trim();
      if (!t) return;

      var onlyHeader = !isSub && t.charAt(t.length - 1) === ':' && t.indexOf(':') === t.length - 1;
      if (onlyHeader) {
        pushSection(t.slice(0, -1));
        return;
      }

      if (!current) pushSection('');

      var kvRow = !isSub ? splitKeyValue(t) : null;
      if (kvRow && kvRow.val) {
        current.rows.push({ type: 'kv', key: kvRow.key, val: kvRow.val });
      } else if (isSub) {
        current.rows.push({ type: 'sub', text: t });
      } else {
        current.rows.push({ type: 'text', text: t });
      }
    });

    if (sections.length) {
      html += '<div class="app-tip__sections">';
      sections.forEach(function (section, idx) {
        if (!section.rows.length && !section.label) return;
        html += '<section class="app-tip__section' + (idx > 0 ? ' app-tip__section--divider' : '') + '">';
        if (section.label) {
          html += '<div class="app-tip__section-label">' + escHtml(section.label) + '</div>';
        }
        if (section.rows.length) {
          html += '<div class="app-tip__rows">';
          section.rows.forEach(function (row) {
            if (row.type === 'kv') {
              html += '<div class="app-tip__row app-tip__row--kv">' +
                '<span class="app-tip__key">' + escHtml(row.key) + '</span>' +
                '<span class="app-tip__val">' + escHtml(row.val) + '</span>' +
              '</div>';
            } else if (row.type === 'sub') {
              html += '<div class="app-tip__row app-tip__row--sub">' + escHtml(row.text) + '</div>';
            } else {
              html += '<div class="app-tip__row">' + escHtml(row.text) + '</div>';
            }
          });
          html += '</div>';
        }
        html += '</section>';
      });
      html += '</div>';
    }

    html += '</div>';
    if (!titleKey && !titleVal && !sections.length) {
      return '<div class="app-tip"><div class="app-tip__row">' + escHtml(txt) + '</div></div>';
    }
    return html;
  };

  function getTooltipEl() {
    var tipEl = document.getElementById('appCustomTooltip') || document.getElementById('statsCustomTooltip');
    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.id = 'appCustomTooltip';
      tipEl.className = 'app-custom-tooltip stats-custom-tooltip';
      tipEl.setAttribute('role', 'tooltip');
      tipEl.setAttribute('aria-hidden', 'true');
    }
    if (tipEl.parentElement !== document.body) {
      document.body.appendChild(tipEl);
    }
    return tipEl;
  }

  function resolveStatsTooltipTarget(target) {
    if (!target || !target.closest) return null;

    var chip = target.closest('.stat-weekday-chip[data-stats-tooltip], .stat-weekday-chip[data-app-tooltip]');
    if (chip) return chip;

    var comboSub = target.closest('.stat-combo-sub[data-stats-tooltip], .stat-combo-sub[data-app-tooltip]');
    if (comboSub) return comboSub;

    var combo = target.closest('.stat-combo[data-stats-tooltip], .stat-combo[data-app-tooltip]');
    if (combo) {
      var inComboIcon = !!target.closest('.stat-combo-icon');
      var inComboMain = !!target.closest('.stat-combo-main');
      var inComboSub = !!target.closest('.stat-combo-sub');
      if (inComboIcon || inComboMain || inComboSub) return combo;
      return null;
    }

    var day = target.closest('.stat-day[data-stats-tooltip], .stat-day[data-app-tooltip]');
    if (day) {
      var inIcon = !!target.closest('.stat-day-icon');
      var inMain = !!target.closest('.stat-day-main');
      if (inIcon || inMain) return day;
      return null;
    }

    return target.closest('[data-app-tooltip]');
  }

  function readTooltipRaw(el) {
    if (!el) return '';
    return el.getAttribute('data-app-tooltip') || el.getAttribute('data-stats-tooltip') || '';
  }

  W.initAppTooltips = function initAppTooltips() {
    if (W._appTooltipBound) return;
    W._appTooltipBound = true;

    var tipEl = getTooltipEl();
    var lastEl = null;

    function hideTip() {
      tipEl.style.display = 'none';
      tipEl.setAttribute('aria-hidden', 'true');
      tipEl.classList.remove('app-custom-tooltip--visible', 'app-custom-tooltip--scrollable');
      tipEl.style.pointerEvents = 'none';
      lastEl = null;
    }

    function syncTooltipScrollState() {
      var canScroll = tipEl.scrollHeight > tipEl.clientHeight + 1;
      tipEl.classList.toggle('app-custom-tooltip--scrollable', canScroll);
    }

    function positionTipAt(clientX, clientY, target) {
      var margin = 14;
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      var rect = target ? target.getBoundingClientRect() : null;
      var anchorX = clientX != null ? clientX : (rect ? rect.left + rect.width / 2 : margin);
      var anchorY = clientY != null ? clientY : (rect ? rect.top + rect.height / 2 : margin);

      var spaceBelow = Math.max(0, vh - anchorY - margin);
      var spaceAbove = Math.max(0, anchorY - margin);
      var openBelow = spaceBelow >= spaceAbove;
      var maxHeight = Math.max(140, Math.min(Math.round(vh * 0.82), openBelow ? spaceBelow : spaceAbove));
      tipEl.style.maxHeight = maxHeight + 'px';

      tipEl.style.display = 'block';
      tipEl.style.visibility = 'hidden';
      var tw = tipEl.offsetWidth;
      var th = tipEl.offsetHeight;

      var left = anchorX + margin;
      if (left + tw > vw - margin) left = anchorX - tw - margin;
      left = Math.max(margin, Math.min(left, vw - tw - margin));

      var top = openBelow ? (anchorY + margin) : (anchorY - th - margin);
      if (top < margin) top = margin;
      if (top + th > vh - margin) top = Math.max(margin, vh - th - margin);

      tipEl.style.left = left + 'px';
      tipEl.style.top = top + 'px';
      tipEl.style.visibility = 'visible';
    }

    function showTipFor(target, clientX, clientY) {
      var raw = readTooltipRaw(target);
      if (!raw) return hideTip();

      tipEl.innerHTML = W.renderAppTooltipHtml(raw);
      tipEl.setAttribute('aria-hidden', 'false');
      tipEl.classList.add('app-custom-tooltip--visible');
      tipEl.style.pointerEvents = 'auto';
      lastEl = target;
      positionTipAt(clientX, clientY, target);
      syncTooltipScrollState();
    }

    tipEl.addEventListener('mouseenter', function () {
      tipEl.classList.add('app-custom-tooltip--hovered');
    });
    tipEl.addEventListener('mouseleave', function (e) {
      tipEl.classList.remove('app-custom-tooltip--hovered');
      var related = e.relatedTarget;
      if (related && lastEl && (lastEl === related || lastEl.contains(related))) return;
      if (related && resolveStatsTooltipTarget(related)) return;
      hideTip();
    });
    tipEl.addEventListener('wheel', function (e) {
      e.stopPropagation();
    }, { passive: true });

    document.addEventListener('mouseover', function (e) {
      var el = resolveStatsTooltipTarget(e.target);
      if (!el) return;
      showTipFor(el, e.clientX, e.clientY);
    }, true);

    document.addEventListener('mouseout', function (e) {
      if (!lastEl) return;
      var related = e.relatedTarget;
      if (related) {
        if (tipEl === related || tipEl.contains(related)) return;
        var toEl = resolveStatsTooltipTarget(related);
        if (toEl) return;
        if (lastEl.contains(related)) return;
      }
      hideTip();
    }, true);

    document.addEventListener('focusin', function (e) {
      var el = resolveStatsTooltipTarget(e.target);
      if (!el) return;
      showTipFor(el);
    }, true);

    document.addEventListener('focusout', function () {
      hideTip();
    }, true);

    window.addEventListener('scroll', function (e) {
      if (!lastEl) return;
      if (e.target === tipEl || (e.target && tipEl.contains(e.target))) return;
      hideTip();
    }, true);
    window.addEventListener('resize', function () {
      if (!lastEl) return;
      syncTooltipScrollState();
    });
  };
})(window.WorkHours);
