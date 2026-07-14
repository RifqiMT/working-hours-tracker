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

  function parseMetricValue(val) {
    var raw = String(val || '');
    var detail = '';
    var breakdownIdx = raw.indexOf(' · ');
    if (breakdownIdx >= 0) {
      detail = raw.slice(breakdownIdx + 3).trim();
      raw = raw.slice(0, breakdownIdx).trim();
    }
    var m = raw.match(/^(.+?)\s*\(([^)]*%)\)\s*$/);
    if (!m) {
      if (detail) return { primary: raw, secondary: '', detail: detail };
      return null;
    }
    return { primary: m[1].trim(), secondary: m[2].trim(), detail: detail };
  }

  function sectionUsesCompactList(section) {
    if (!section.rows.length) return false;
    var kvCount = 0;
    for (var i = 0; i < section.rows.length; i++) {
      if (section.rows[i].type === 'kv') kvCount++;
      else if (section.rows[i].type !== 'sub') return false;
    }
    return kvCount >= 2;
  }

  function renderKvKeyHtml(key) {
    return '<span class="app-tip__key">' + escHtml(key) + '</span>';
  }

  function renderKvValHtml(val, includeDetail) {
    if (includeDetail === undefined) includeDetail = true;
    var metric = parseMetricValue(val);
    if (metric) {
      var html = '<span class="app-tip__val-wrap">';
      html += '<span class="app-tip__val app-tip__val--split">';
      html += '<span class="app-tip__val-count">' + escHtml(metric.primary) + '</span>';
      if (metric.secondary) {
        html += '<span class="app-tip__val-pct">' + escHtml(metric.secondary) + '</span>';
      }
      html += '</span>';
      if (includeDetail && metric.detail) {
        html += renderOvertimeBreakdownHtml(metric.detail, 'app-tip__ot-breakdown--inline');
      }
      html += '</span>';
      return html;
    }
    return '<span class="app-tip__val">' + escHtml(val) + '</span>';
  }

  function parseOvertimeDayDetail(detail) {
    if (!detail) return [];
    var items = [];
    var parts = String(detail).split(/\s*\/\s*/);
    parts.forEach(function (part, idx) {
      var m = String(part).trim().match(/^([\d,.]+)\s+(.+?)\s+\(([^)]+%)\)$/);
      if (!m) return;
      var label = m[2].trim();
      var kind = 'overtime';
      if (parts.length > 1 && idx === parts.length - 1) kind = 'no-overtime';
      else if (/no[\s-]*overtime|tanpa\s*lembur|tidak\s*lembur|sans\s*heure|sem\s*hora/i.test(label)) kind = 'no-overtime';
      items.push({ count: m[1], label: label, pct: m[3], kind: kind });
    });
    return items;
  }

  function parseOvertimePctWidth(pct) {
    var n = parseFloat(String(pct || '').replace('%', '').replace(/,/g, ''));
    if (isNaN(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }

  function renderOvertimeBreakdownHtml(detail, extraClass) {
    var items = parseOvertimeDayDetail(detail);
    if (!items.length) {
      return detail ? '<span class="app-tip__val-detail">' + escHtml(detail) + '</span>' : '';
    }
    var html = '<div class="app-tip__ot-breakdown' + (extraClass ? ' ' + extraClass : '') + '">';
    html += '<div class="app-tip__ot-bar" aria-hidden="true">';
    items.forEach(function (item) {
      var width = parseOvertimePctWidth(item.pct);
      if (width <= 0) return;
      html += '<span class="app-tip__ot-bar-seg app-tip__ot-bar-seg--' + item.kind + '" style="width:' + width + '%"></span>';
    });
    html += '</div>';
    html += '<div class="app-tip__ot-stats" role="list">';
    items.forEach(function (item, idx) {
      html += '<span class="app-tip__ot-stat app-tip__ot-stat--' + item.kind + '" role="listitem">' +
        '<span class="app-tip__ot-stat-count">' + escHtml(item.count) + '</span>' +
        '<span class="app-tip__ot-stat-label">' + escHtml(item.label) + '</span>' +
        '<span class="app-tip__ot-stat-pct">' + escHtml(item.pct) + '</span>' +
      '</span>';
    });
    html += '</div></div>';
    return html;
  }

  function isFocusDetailTip(titleKey, titleVal, sections) {
    if (!titleKey || !titleVal || sections.length !== 1) return false;
    if (sections[0].label) return false;
    var kvCount = 0;
    sections[0].rows.forEach(function (row) {
      if (row.type === 'kv') kvCount++;
    });
    return kvCount === 1;
  }

  function parseSubMetricLine(text) {
    var raw = String(text || '').trim();
    var detail = '';
    var breakdownIdx = raw.indexOf(' · ');
    if (breakdownIdx >= 0) {
      detail = raw.slice(breakdownIdx + 3).trim();
      raw = raw.slice(0, breakdownIdx).trim();
    }
    var kv = splitKeyValue(raw);
    if (kv && kv.val) {
      var metric = parseMetricValue(kv.val);
      if (metric) return { label: kv.key, count: metric.primary, pct: metric.secondary, detail: detail };
      return { label: kv.key, count: kv.val, pct: '', detail: detail };
    }
    var m = raw.match(/^(.+?)\s+([\d,.][\d,.:\s\w]*)\s+\(([^)]*%)\)\s*$/);
    if (m) return { label: m[1].trim(), count: m[2].trim(), pct: m[3].trim(), detail: detail };
    return null;
  }

  function collectLocationTags(rows) {
    var tags = [];
    rows.forEach(function (row) {
      if (row.type === 'sub') {
        var parsed = parseSubMetricLine(row.text);
        if (parsed) {
          tags.push(parsed);
          return;
        }
        String(row.text).split(/,\s*/).forEach(function (part) {
          var item = parseSubMetricLine(part.trim());
          if (item) tags.push(item);
        });
      } else if (row.type === 'text') {
        String(row.text).split(/,\s*/).forEach(function (part) {
          var item = parseSubMetricLine(part.trim());
          if (item) tags.push(item);
        });
      }
    });
    return tags;
  }

  function sectionUsesTagList(section) {
    if (!section.label || !section.rows.length) return false;
    for (var i = 0; i < section.rows.length; i++) {
      if (section.rows[i].type !== 'sub' && section.rows[i].type !== 'text') return false;
    }
    return collectLocationTags(section.rows).length > 0;
  }

  function locVariantClass(label) {
    var s = String(label || '').toUpperCase();
    if (/\bWFO\b|OFFICE/.test(s)) return ' app-tip__loc--wfo';
    if (/\bWFH\b|HOME/.test(s)) return ' app-tip__loc--wfh';
    if (/ANYWHERE/.test(s)) return ' app-tip__loc--anywhere';
    return '';
  }

  function renderLocationTagsHtml(tags, extraClass, nested) {
    if (!tags.length) return '';
    var html = '<div class="app-tip__loc-list' + (extraClass ? ' ' + extraClass : '') + '" role="list">';
    tags.forEach(function (tag) {
      var breakdownHtml = tag.detail ? renderOvertimeBreakdownHtml(tag.detail, 'app-tip__ot-breakdown--loc') : '';
      html += '<div class="app-tip__loc' + locVariantClass(tag.label) + (nested ? ' app-tip__loc--nested' : '') + '" role="listitem">' +
        '<div class="app-tip__loc-row">' +
          '<span class="app-tip__loc-mark" aria-hidden="true"></span>' +
          '<span class="app-tip__loc-label">' + escHtml(tag.label) + '</span>' +
          '<span class="app-tip__loc-metrics">' +
            '<span class="app-tip__loc-count">' + escHtml(tag.count) + '</span>' +
            (tag.pct ? '<span class="app-tip__loc-pct">' + escHtml(tag.pct) + '</span>' : '') +
          '</span>' +
        '</div>' +
        breakdownHtml +
      '</div>';
    });
    html += '</div>';
    return html;
  }

  function renderFocusDayHtml(kvRow) {
    var metric = parseMetricValue(kvRow.val);
    var countHtml = metric
      ? '<span class="app-tip__focus-day-primary">' +
          '<span class="app-tip__val-count">' + escHtml(metric.primary) + '</span>' +
          (metric.secondary ? '<span class="app-tip__val-pct">' + escHtml(metric.secondary) + '</span>' : '') +
        '</span>'
      : '<span class="app-tip__val-count">' + escHtml(kvRow.val) + '</span>';
    var breakdownHtml = metric && metric.detail
      ? renderOvertimeBreakdownHtml(metric.detail)
      : '';
    var html = '<div class="app-tip__focus-day">' +
      '<div class="app-tip__focus-day-head app-tip__subsection-head">' +
        '<span class="app-tip__focus-day-label">' + escHtml(kvRow.key) + '</span>' +
        countHtml +
      '</div>';
    if (breakdownHtml) {
      html += '<div class="app-tip__focus-day-details">' + breakdownHtml + '</div>';
    }
    return html + '</div>';
  }

  function groupSectionRows(rows) {
    var groups = [];
    var current = null;
    rows.forEach(function (row) {
      if (row.type === 'kv') {
        current = { kv: row, details: [] };
        groups.push(current);
      } else if (current) {
        current.details.push(row);
      } else {
        groups.push({ kv: null, details: [row] });
      }
    });
    return groups;
  }

  function renderSectionRowsHtml(rows, compactList) {
    var html = '';
    var groups = groupSectionRows(rows);
    groups.forEach(function (group) {
      if (group.kv) {
        var metric = parseMetricValue(group.kv.val);
        var breakdownItems = metric && metric.detail ? parseOvertimeDayDetail(metric.detail) : [];
        var hasBreakdown = breakdownItems.length > 0;
        var tags = collectLocationTags(group.details);
        var hasTags = tags.length > 0;
        var breakdownHtml = hasBreakdown ? renderOvertimeBreakdownHtml(metric.detail) : '';
        var showInlineBreakdown = hasBreakdown && breakdownHtml && !hasTags;
        var showBreakdownRow = hasBreakdown && breakdownHtml && hasTags;
        html += '<div class="app-tip__kv-block' + (showInlineBreakdown || showBreakdownRow || tags.length ? ' app-tip__kv-block--with-ot' : '') + '">';
        html += '<div class="app-tip__row app-tip__row--kv app-tip__row--subsection' + (compactList ? ' app-tip__row--compact' : '') + '">' +
          renderKvKeyHtml(group.kv.key) +
          renderKvValHtml(group.kv.val, showInlineBreakdown) +
        '</div>';
        if (showBreakdownRow || tags.length) {
          html += '<div class="app-tip__kv-block-details">';
          if (showBreakdownRow) html += breakdownHtml;
          if (tags.length) {
            html += '<div class="app-tip__tag-group' + (compactList ? ' app-tip__tag-group--compact' : '') + '">' +
              renderLocationTagsHtml(tags, '', true) +
            '</div>';
          }
          html += '</div>';
        } else {
          group.details.forEach(function (row) {
            if (row.type === 'sub') {
              html += '<div class="app-tip__row app-tip__row--sub' + (compactList ? ' app-tip__row--sub-compact' : '') + '">' + escHtml(row.text) + '</div>';
            } else if (row.type === 'text') {
              html += '<div class="app-tip__row">' + escHtml(row.text) + '</div>';
            }
          });
        }
        html += '</div>';
      } else {
        group.details.forEach(function (row) {
          if (row.type === 'sub') {
            html += '<div class="app-tip__row app-tip__row--sub' + (compactList ? ' app-tip__row--sub-compact' : '') + '">' + escHtml(row.text) + '</div>';
          } else if (row.type === 'text') {
            html += '<div class="app-tip__row">' + escHtml(row.text) + '</div>';
          }
        });
      }
    });
    return html;
  }

  function scrollHintLabel() {
    if (W.I18N && typeof W.I18N.t === 'function') {
      var t = W.I18N.t('common.tooltipScrollHint');
      if (t && t !== 'common.tooltipScrollHint') return t;
    }
    return 'Scroll for more';
  }

  function getTimeUnitTokens() {
    var t = (W.I18N && typeof W.I18N.t === 'function') ? W.I18N.t : function (k) { return k; };
    var keys = ['time.hour', 'time.hours', 'time.minute', 'time.minutes'];
    var seen = {};
    var tokens = [];
    keys.forEach(function (key) {
      var label = String(t(key) || '').trim();
      if (!label || seen[label]) return;
      seen[label] = true;
      tokens.push(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    });
    if (!tokens.length) tokens.push('hours?', 'minutes?', 'hour', 'minute');
    return tokens;
  }

  function parseDurationSegments(val) {
    var s = String(val || '').trim();
    if (!s || s === '—') return null;
    var unitPattern = getTimeUnitTokens().join('|');
    var re = new RegExp('(-?[\\d,.]+)\\s+(' + unitPattern + ')\\b', 'gi');
    var segments = [];
    var match;
    while ((match = re.exec(s)) !== null) {
      segments.push({ value: match[1], unit: match[2] });
    }
    return segments.length ? segments : null;
  }

  function parseDateHeaderValue(val) {
    var s = String(val || '').trim();
    var m = s.match(/^(\d{1,2})\s+(.+?)\s+(\d{4})\s*\(([^)]+)\)\s*$/);
    if (!m) return null;
    return {
      day: m[1].trim(),
      month: m[2].trim(),
      year: m[3].trim(),
      weekday: m[4].trim()
    };
  }

  function parseDaysCountValue(val) {
    var s = String(val || '').trim();
    if (parseDateHeaderValue(s)) return null;
    var m = s.match(/^(-?[\d,.]+)\s+(.+)$/);
    if (!m) return null;
    if (parseDurationSegments(s)) return null;
    var unit = m[2].trim();
    if (/\(\s*[^)]+\s*\)\s*$/.test(unit) && /\d{4}/.test(unit)) return null;
    if (/\b(hours?|minutes?|mins?|secs?|seconds?)\b/i.test(unit)) return null;
    return { value: m[1].trim(), unit: unit };
  }

  function renderDateHeaderHtml(date) {
    return '<div class="app-tip__header-metric app-tip__header-metric--date">' +
      '<span class="app-tip__header-date">' +
        '<span class="app-tip__header-metric-value">' + escHtml(date.day) + '</span>' +
        '<span class="app-tip__header-metric-value">' + escHtml(date.month) + '</span>' +
        '<span class="app-tip__header-metric-value">' + escHtml(date.year) + '</span>' +
        '<span class="app-tip__header-metric-unit">(' + escHtml(date.weekday) + ')</span>' +
      '</span>' +
    '</div>';
  }

  function renderHeaderMetricPartHtml(seg) {
    return '<span class="app-tip__header-metric-part">' +
      '<span class="app-tip__header-metric-value">' + escHtml(seg.value) + '</span>' +
      '<span class="app-tip__header-metric-unit">' + escHtml(seg.unit) + '</span>' +
    '</span>';
  }

  function renderDurationHeaderHtml(segments) {
    var html = '<div class="app-tip__header-metric app-tip__header-metric--duration">' +
      '<span class="app-tip__header-duration">';
    segments.forEach(function (seg, idx) {
      if (idx > 0) html += '<span class="app-tip__header-duration-join" aria-hidden="true"> </span>';
      html += renderHeaderMetricPartHtml(seg);
    });
    return html + '</span></div>';
  }

  function renderHeaderMetricHtml(val) {
    var duration = parseDurationSegments(val);
    if (duration && duration.length) {
      return renderDurationHeaderHtml(duration);
    }
    var date = parseDateHeaderValue(val);
    if (date) {
      return renderDateHeaderHtml(date);
    }
    var days = parseDaysCountValue(val);
    if (days) {
      return '<div class="app-tip__header-metric app-tip__header-metric--days">' +
        renderHeaderMetricPartHtml(days) +
      '</div>';
    }
    return '<div class="app-tip__header-metric app-tip__header-metric--plain">' +
      '<span class="app-tip__header-metric-plain">' + escHtml(val) + '</span>' +
    '</div>';
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

    var isCompact = !titleKey && !titleVal && sections.length <= 1;
    var isFocus = isFocusDetailTip(titleKey, titleVal, sections);
    var rowCount = 0;
    sections.forEach(function (section) { rowCount += section.rows.length; });
    var html = '<div class="app-tip' +
      (isCompact ? ' app-tip--compact' : '') +
      (isFocus ? ' app-tip--focus' : '') +
      '" data-tip-rows="' + rowCount + '" data-tip-sections="' + sections.length + '">';
    if (titleKey || titleVal) {
      var headerClass = 'app-tip__header';
      if (titleKey && titleVal) headerClass += ' app-tip__header--stacked';
      if (isFocus) headerClass += ' app-tip__header--focus';
      var titleMetric = titleVal ? parseMetricValue(titleVal) : null;
      if (titleMetric && titleMetric.detail) headerClass += ' app-tip__header--with-ot';
      html += '<div class="' + headerClass + '">';
      if (titleKey) html += '<div class="app-tip__title">' + escHtml(titleKey) + '</div>';
      if (titleVal) {
        if (titleMetric && titleMetric.detail) {
          html += '<div class="app-tip__header-summary">';
          html += renderHeaderMetricHtml(titleMetric.primary);
          html += renderOvertimeBreakdownHtml(titleMetric.detail, 'app-tip__ot-breakdown--header');
          html += '</div>';
        } else {
          html += renderHeaderMetricHtml(titleVal);
        }
      }
      html += '</div>';
    }

    if (sections.length) {
      html += '<div class="app-tip__sections' + (isFocus ? ' app-tip__sections--focus' : '') + '">';
      sections.forEach(function (section, idx) {
        if (!section.rows.length && !section.label) return;
        var compactList = !isFocus && sectionUsesCompactList(section);
        var tagList = !isFocus && !compactList && sectionUsesTagList(section);
        var focusSection = isFocus;
        var kvRow = null;
        var detailRows = [];
        if (focusSection) {
          section.rows.forEach(function (row) {
            if (row.type === 'kv' && !kvRow) kvRow = row;
            else detailRows.push(row);
          });
        }
        var locationTags = focusSection ? collectLocationTags(detailRows) : [];
        var summarySection = !focusSection && !section.label && section.rows.length === 1 &&
          section.rows[0].type === 'kv' && idx === 0;
        var sectionClass = 'app-tip__section' +
          (idx > 0 ? ' app-tip__section--divider' : '') +
          (section.label ? ' app-tip__section--labeled' : '') +
          (summarySection ? ' app-tip__section--summary' : '') +
          (compactList ? ' app-tip__section--compact-list' : '') +
          (tagList ? ' app-tip__section--tag-list' : '') +
          (focusSection ? ' app-tip__section--focus' : '');
        html += '<section class="' + sectionClass + '">';
        if (section.label) {
          html += '<div class="app-tip__section-label">' + escHtml(section.label) + '</div>';
        }
        html += '<div class="app-tip__section-body">';
        if (focusSection && kvRow) {
          html += renderFocusDayHtml(kvRow);
          html += renderLocationTagsHtml(locationTags, '', true);
          if (!locationTags.length) {
            detailRows.forEach(function (row) {
              if (row.type === 'sub') {
                html += '<div class="app-tip__row app-tip__row--sub app-tip__row--sub-focus">' + escHtml(row.text) + '</div>';
              } else if (row.type === 'text') {
                html += '<div class="app-tip__row app-tip__row--note">' + escHtml(row.text) + '</div>';
              }
            });
          }
        } else if (tagList) {
          html += renderLocationTagsHtml(collectLocationTags(section.rows), 'app-tip__loc-list--section');
        } else if (section.rows.length) {
          html += '<div class="app-tip__rows' + (compactList ? ' app-tip__rows--compact-list' : '') + '">';
          html += renderSectionRowsHtml(section.rows, compactList);
          html += '</div>';
        }
        html += '</div>';
        html += '</section>';
      });
      html += '</div>';
    }

    html += '</div>';
    if (!titleKey && !titleVal && !sections.length) {
      return '<div class="app-tip app-tip--compact"><div class="app-tip__sections"><div class="app-tip__row">' + escHtml(txt) + '</div></div></div>';
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
    if (!tipEl.querySelector('.app-custom-tooltip__arrow')) {
      var arrow = document.createElement('span');
      arrow.className = 'app-custom-tooltip__arrow';
      arrow.setAttribute('aria-hidden', 'true');
      tipEl.appendChild(arrow);
    }
    if (!tipEl.querySelector('.app-custom-tooltip__scroll-fade-top')) {
      var fadeTop = document.createElement('div');
      fadeTop.className = 'app-custom-tooltip__scroll-fade-top';
      fadeTop.setAttribute('aria-hidden', 'true');
      tipEl.appendChild(fadeTop);
    }
    if (!tipEl.querySelector('.app-custom-tooltip__content')) {
      var content = document.createElement('div');
      content.className = 'app-custom-tooltip__content';
      tipEl.appendChild(content);
    }
    if (!tipEl.querySelector('.app-custom-tooltip__scroll-fade')) {
      var fade = document.createElement('div');
      fade.className = 'app-custom-tooltip__scroll-fade';
      fade.setAttribute('aria-hidden', 'true');
      tipEl.appendChild(fade);
    }
    if (!tipEl.querySelector('.app-custom-tooltip__scroll-hint')) {
      var hint = document.createElement('div');
      hint.className = 'app-custom-tooltip__scroll-hint';
      hint.setAttribute('aria-hidden', 'true');
      hint.innerHTML = '<span class="app-custom-tooltip__scroll-hint-icon" aria-hidden="true">↕</span><span class="app-custom-tooltip__scroll-hint-text"></span>';
      tipEl.appendChild(hint);
    }
    return tipEl;
  }

  function getTooltipScrollHintEl(tipEl) {
    return tipEl.querySelector('.app-custom-tooltip__scroll-hint-text');
  }

  function getTooltipContentEl(tipEl) {
    return tipEl.querySelector('.app-custom-tooltip__content') || tipEl;
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
    var contentEl = getTooltipContentEl(tipEl);
    var scrollHintEl = getTooltipScrollHintEl(tipEl);
    var lastEl = null;
    var lastClientX = null;
    var lastClientY = null;
    var showTimer = null;
    var hideTimer = null;
    var SHOW_DELAY_MS = 85;
    var HIDE_DELAY_MS = 110;

    function cancelShowTimer() {
      if (showTimer) {
        clearTimeout(showTimer);
        showTimer = null;
      }
    }

    function cancelHideTimer() {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    }

    function syncTooltipDensityClass() {
      var tipRoot = contentEl.querySelector('.app-tip');
      var rows = tipRoot ? parseInt(tipRoot.getAttribute('data-tip-rows') || '0', 10) : 0;
      tipEl.classList.remove('app-custom-tooltip--density-compact', 'app-custom-tooltip--density-comfortable', 'app-custom-tooltip--density-spacious');
      if (rows <= 3) tipEl.classList.add('app-custom-tooltip--density-compact');
      else if (rows <= 8) tipEl.classList.add('app-custom-tooltip--density-comfortable');
      else tipEl.classList.add('app-custom-tooltip--density-spacious');
    }

    function hideTip() {
      cancelShowTimer();
      cancelHideTimer();
      tipEl.style.display = 'none';
      tipEl.setAttribute('aria-hidden', 'true');
      tipEl.classList.remove(
        'app-custom-tooltip--visible',
        'app-custom-tooltip--scrollable',
        'app-custom-tooltip--scroll-top',
        'app-custom-tooltip--scroll-bottom',
        'app-custom-tooltip--at-bottom',
        'app-custom-tooltip--placement-top',
        'app-custom-tooltip--placement-bottom',
        'app-custom-tooltip--hovered',
        'app-custom-tooltip--density-compact',
        'app-custom-tooltip--density-comfortable',
        'app-custom-tooltip--density-spacious'
      );
      tipEl.style.pointerEvents = 'none';
      tipEl.style.maxHeight = '';
      tipEl.style.overflowY = '';
      if (contentEl) {
        contentEl.style.maxHeight = '';
        contentEl.style.overflowY = '';
        contentEl.scrollTop = 0;
      }
      lastEl = null;
      lastClientX = null;
      lastClientY = null;
    }

    function resetTooltipScrollLayout() {
      tipEl.classList.remove(
        'app-custom-tooltip--scrollable',
        'app-custom-tooltip--scroll-top',
        'app-custom-tooltip--scroll-bottom',
        'app-custom-tooltip--at-bottom'
      );
      tipEl.style.maxHeight = '';
      tipEl.style.overflowY = '';
      contentEl.style.maxHeight = '';
      contentEl.style.overflowY = 'hidden';
      contentEl.scrollTop = 0;
      if (scrollHintEl) scrollHintEl.textContent = '';
      var hintWrap = tipEl.querySelector('.app-custom-tooltip__scroll-hint');
      if (hintWrap) hintWrap.setAttribute('aria-hidden', 'true');
      var fadeTop = tipEl.querySelector('.app-custom-tooltip__scroll-fade-top');
      var fadeBottom = tipEl.querySelector('.app-custom-tooltip__scroll-fade');
      if (fadeTop) fadeTop.setAttribute('aria-hidden', 'true');
      if (fadeBottom) fadeBottom.setAttribute('aria-hidden', 'true');
    }

    function syncTooltipScrollState(forceScrollable) {
      var canScroll = forceScrollable === true
        ? true
        : (typeof forceScrollable === 'boolean'
          ? forceScrollable
          : (tipEl.classList.contains('app-custom-tooltip--scrollable') &&
            contentEl.scrollHeight > contentEl.clientHeight + 2));

      tipEl.classList.toggle('app-custom-tooltip--scrollable', canScroll);
      if (canScroll) contentEl.style.overflowY = 'auto';

      var hintWrap = scrollHintEl ? scrollHintEl.closest('.app-custom-tooltip__scroll-hint') : null;
      if (scrollHintEl && canScroll) scrollHintEl.textContent = scrollHintLabel();
      if (hintWrap) hintWrap.setAttribute('aria-hidden', canScroll ? 'false' : 'true');

      var fadeTop = tipEl.querySelector('.app-custom-tooltip__scroll-fade-top');
      var fadeBottom = tipEl.querySelector('.app-custom-tooltip__scroll-fade');
      if (fadeTop) fadeTop.setAttribute('aria-hidden', canScroll ? 'false' : 'true');
      if (fadeBottom) fadeBottom.setAttribute('aria-hidden', canScroll ? 'false' : 'true');

      if (!canScroll) {
        tipEl.classList.remove('app-custom-tooltip--scroll-top', 'app-custom-tooltip--scroll-bottom', 'app-custom-tooltip--at-bottom');
        contentEl.style.overflowY = 'hidden';
        return;
      }

      var atTop = contentEl.scrollTop <= 2;
      var atBottom = contentEl.scrollTop + contentEl.clientHeight >= contentEl.scrollHeight - 4;
      tipEl.classList.toggle('app-custom-tooltip--scroll-top', !atTop);
      tipEl.classList.toggle('app-custom-tooltip--scroll-bottom', !atBottom);
      tipEl.classList.toggle('app-custom-tooltip--at-bottom', atBottom);
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(value, max));
    }

    function positionTipAt(clientX, clientY, target, options) {
      var opts = options && typeof options === 'object' ? options : {};
      var remeasure = opts.remeasure !== false;
      var margin = 12;
      var gap = 12;
      var cursorOffsetX = 14;
      var cursorOffsetY = 16;
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      var rect = target && target.getBoundingClientRect ? target.getBoundingClientRect() : null;
      var useCursor = clientX != null && clientY != null && isFinite(clientX) && isFinite(clientY);
      var anchorX = useCursor ? clientX : (rect ? rect.left + rect.width / 2 : margin);
      var anchorY = useCursor ? clientY : (rect ? rect.top + rect.height / 2 : margin);
      var anchorTop = rect ? rect.top : anchorY;
      var anchorBottom = rect ? rect.bottom : anchorY;

      var spaceBelow = useCursor
        ? Math.max(0, vh - anchorY - margin)
        : Math.max(0, vh - anchorBottom - margin);
      var spaceAbove = useCursor
        ? Math.max(0, anchorY - margin)
        : Math.max(0, anchorTop - margin);
      var openBelow = spaceBelow >= spaceAbove;
      var needsScroll = tipEl.classList.contains('app-custom-tooltip--scrollable');

      function applyPlacement(preferBelow) {
        var placement = preferBelow ? 'bottom' : 'top';
        var availableHeight = Math.max(148, Math.min(Math.round(vh * 0.8), (preferBelow ? spaceBelow : spaceAbove) - gap));
        tipEl.style.display = 'flex';
        tipEl.style.visibility = 'hidden';

        if (remeasure) {
          var savedScrollTop = contentEl.scrollTop;
          resetTooltipScrollLayout();
          tipEl.style.maxHeight = 'none';
          contentEl.style.maxHeight = 'none';
          contentEl.style.overflowY = 'hidden';

          var hintWrapMeasure = tipEl.querySelector('.app-custom-tooltip__scroll-hint');
          if (hintWrapMeasure) hintWrapMeasure.setAttribute('aria-hidden', 'false');

          var hintHeight = hintWrapMeasure ? hintWrapMeasure.offsetHeight : 0;
          var contentNatural = contentEl.scrollHeight;
          needsScroll = hintHeight + contentNatural > availableHeight + 1;

          if (needsScroll) {
            tipEl.style.maxHeight = availableHeight + 'px';
            contentEl.style.maxHeight = Math.max(128, availableHeight - hintHeight) + 'px';
            contentEl.style.overflowY = 'auto';
            contentEl.scrollTop = savedScrollTop;
          } else {
            tipEl.style.maxHeight = '';
            contentEl.style.maxHeight = '';
            contentEl.style.overflowY = 'hidden';
            if (hintWrapMeasure) hintWrapMeasure.setAttribute('aria-hidden', 'true');
          }
        }

        var tw = tipEl.offsetWidth;
        var th = tipEl.offsetHeight;
        var left;
        if (useCursor) {
          left = anchorX + cursorOffsetX;
          if (left + tw > vw - margin) left = anchorX - tw - cursorOffsetX;
          if (left < margin) left = clamp(anchorX - Math.round(tw * 0.5), margin, vw - tw - margin);
        } else {
          left = anchorX - tw / 2;
        }
        left = clamp(left, margin, vw - tw - margin);

        var top;
        if (preferBelow) {
          top = useCursor ? anchorY + cursorOffsetY : anchorBottom + gap;
        } else {
          top = useCursor ? anchorY - th - cursorOffsetY : anchorTop - th - gap;
        }
        top = clamp(top, margin, vh - th - margin);

        var arrowX = clamp(18, anchorX - left, tw - 18);
        tipEl.style.setProperty('--tip-arrow-x', arrowX + 'px');
        tipEl.classList.remove('app-custom-tooltip--placement-top', 'app-custom-tooltip--placement-bottom');
        tipEl.classList.add('app-custom-tooltip--placement-' + placement);
        tipEl.style.left = Math.round(left) + 'px';
        tipEl.style.top = Math.round(top) + 'px';
        tipEl.style.visibility = 'visible';
        return { top: top, th: th, placement: placement, needsScroll: needsScroll };
      }

      var pos = applyPlacement(openBelow);
      if (remeasure) {
        if (pos.top + pos.th > vh - margin && spaceAbove > spaceBelow) {
          pos = applyPlacement(false);
        } else if (pos.top < margin && spaceBelow > spaceAbove) {
          pos = applyPlacement(true);
        }
        syncTooltipScrollState(pos.needsScroll);
      }
    }

    function showTipFor(target, clientX, clientY) {
      var raw = readTooltipRaw(target);
      if (!raw) return hideTip();

      contentEl.innerHTML = W.renderAppTooltipHtml(raw);
      resetTooltipScrollLayout();
      tipEl.setAttribute('aria-hidden', 'false');
      tipEl.classList.add('app-custom-tooltip--visible');
      tipEl.style.pointerEvents = 'auto';
      lastEl = target;
      lastClientX = clientX;
      lastClientY = clientY;
      syncTooltipDensityClass();
      positionTipAt(clientX, clientY, target);
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(function () {
          positionTipAt(clientX, clientY, target, { remeasure: false });
        });
      }
    }

    function scheduleShowTip(target, clientX, clientY) {
      cancelHideTimer();
      if (lastEl === target && tipEl.classList.contains('app-custom-tooltip--visible')) {
        positionTipAt(clientX, clientY, target, { remeasure: false });
        return;
      }
      cancelShowTimer();
      showTimer = setTimeout(function () {
        showTimer = null;
        showTipFor(target, clientX, clientY);
      }, SHOW_DELAY_MS);
    }

    function scheduleHideTip() {
      cancelShowTimer();
      cancelHideTimer();
      hideTimer = setTimeout(function () {
        hideTimer = null;
        hideTip();
      }, HIDE_DELAY_MS);
    }

    tipEl.addEventListener('mouseenter', function () {
      cancelHideTimer();
      tipEl.classList.add('app-custom-tooltip--hovered');
    });
    tipEl.addEventListener('mouseleave', function (e) {
      tipEl.classList.remove('app-custom-tooltip--hovered');
      var related = e.relatedTarget;
      if (related && lastEl && (lastEl === related || lastEl.contains(related))) return;
      if (related && resolveStatsTooltipTarget(related)) return;
      scheduleHideTip();
    });
    var scrollSyncRaf = null;
    contentEl.addEventListener('wheel', function (e) {
      e.stopPropagation();
    }, { passive: true });
    contentEl.addEventListener('scroll', function () {
      if (!tipEl.classList.contains('app-custom-tooltip--scrollable')) return;
      if (scrollSyncRaf) return;
      scrollSyncRaf = requestAnimationFrame(function () {
        scrollSyncRaf = null;
        syncTooltipScrollState(true);
      });
    }, { passive: true });

    document.addEventListener('mouseover', function (e) {
      var el = resolveStatsTooltipTarget(e.target);
      if (!el) return;
      scheduleShowTip(el, e.clientX, e.clientY);
    }, true);

    document.addEventListener('mousemove', function (e) {
      if (!lastEl || !tipEl.classList.contains('app-custom-tooltip--visible')) return;
      var el = resolveStatsTooltipTarget(e.target);
      if (!el || el !== lastEl) return;
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      positionTipAt(e.clientX, e.clientY, lastEl, { remeasure: false });
    }, { passive: true });

    document.addEventListener('touchstart', function (e) {
      if (!e.touches || !e.touches.length) return;
      var touch = e.touches[0];
      var el = resolveStatsTooltipTarget(e.target);
      if (el) {
        scheduleShowTip(el, touch.clientX, touch.clientY);
        return;
      }
      if (!tipEl.contains(e.target)) scheduleHideTip();
    }, { passive: true, capture: true });

    document.addEventListener('mouseout', function (e) {
      if (!lastEl && !showTimer) return;
      var related = e.relatedTarget;
      if (related) {
        if (tipEl === related || tipEl.contains(related)) return;
        var toEl = resolveStatsTooltipTarget(related);
        if (toEl) return;
        if (lastEl && lastEl.contains(related)) return;
      }
      scheduleHideTip();
    }, true);

    document.addEventListener('focusin', function (e) {
      var el = resolveStatsTooltipTarget(e.target);
      if (!el) return;
      cancelHideTimer();
      showTipFor(el, null, null);
    }, true);

    document.addEventListener('focusout', function () {
      hideTip();
    }, true);

    window.addEventListener('scroll', function (e) {
      if (!lastEl) return;
      if (e.target === tipEl || (e.target && tipEl.contains(e.target))) return;
      if (!document.body.contains(lastEl)) {
        hideTip();
        return;
      }
      var rect = lastEl.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) {
        hideTip();
        return;
      }
      positionTipAt(lastClientX, lastClientY, lastEl, { remeasure: false });
    }, true);
    window.addEventListener('resize', function () {
      if (!lastEl) return;
      positionTipAt(lastClientX, lastClientY, lastEl, { remeasure: true });
    });
  };
})(window.WorkHours);
