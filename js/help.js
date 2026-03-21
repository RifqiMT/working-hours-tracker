/**
 * Help popup content and open/close.
 * Depends: i18n (W.I18N.resolve, W.currentLanguage).
 */
(function (W) {
  'use strict';
  var HELP_IDS = ['profile', 'clockEntry', 'filtersEntries', 'filters', 'entries', 'calendar', 'statistics'];

  W.openHelpModal = function openHelpModal(helpId) {
    if (HELP_IDS.indexOf(helpId) === -1) return;
    var lang = W.currentLanguage || (W.I18N && W.I18N.getBrowserLanguage && W.I18N.getBrowserLanguage()) || 'en';
    var title = W.I18N && W.I18N.resolve && W.I18N.resolve('help.' + helpId + '.title', lang);
    var body = W.I18N && W.I18N.resolve && W.I18N.resolve('help.' + helpId + '.body', lang);

    // Scalability: if a new language is added but help strings are incomplete,
    // keep the UX by falling back to English.
    if (lang !== 'en' && (title == null || body == null) && W.I18N && W.I18N.resolve) {
      if (title == null) title = W.I18N.resolve('help.' + helpId + '.title', 'en');
      if (body == null) body = W.I18N.resolve('help.' + helpId + '.body', 'en');
    }
    if (title == null && body == null) return;
    var titleEl = document.getElementById('helpModalTitle');
    var bodyEl = document.getElementById('helpModalBody');
    if (titleEl && title != null) titleEl.textContent = title;
    if (bodyEl && body != null) bodyEl.innerHTML = formatHelpBody(body);
    var modal = document.getElementById('helpModal');
    if (modal) {
      modal.dataset.currentHelp = helpId;
      modal.classList.add('open');
    }

    // Close button aria-label is not wired via data-i18n attributes
    var closeBtn = document.getElementById('helpModalClose');
    if (closeBtn && W.I18N && W.I18N.t) closeBtn.setAttribute('aria-label', W.I18N.t('modals.help.closeAria'));
  };

  /** Refresh help modal title/body when language changes (called from init after applyTranslations). */
  W.refreshHelpModalContent = function refreshHelpModalContent() {
    var modal = document.getElementById('helpModal');
    if (!modal || !modal.classList.contains('open') || !modal.dataset.currentHelp) return;
    var helpId = modal.dataset.currentHelp;
    var lang = W.currentLanguage || (W.I18N && W.I18N.getBrowserLanguage && W.I18N.getBrowserLanguage()) || 'en';
    var title = W.I18N && W.I18N.resolve && W.I18N.resolve('help.' + helpId + '.title', lang);
    var body = W.I18N && W.I18N.resolve && W.I18N.resolve('help.' + helpId + '.body', lang);

    if (lang !== 'en' && (title == null || body == null) && W.I18N && W.I18N.resolve) {
      if (title == null) title = W.I18N.resolve('help.' + helpId + '.title', 'en');
      if (body == null) body = W.I18N.resolve('help.' + helpId + '.body', 'en');
    }
    var titleEl = document.getElementById('helpModalTitle');
    var bodyEl = document.getElementById('helpModalBody');
    if (titleEl && title != null) titleEl.textContent = title;
    if (bodyEl && body != null) bodyEl.innerHTML = formatHelpBody(body);

    var closeBtn = document.getElementById('helpModalClose');
    if (closeBtn && W.I18N && W.I18N.t) closeBtn.setAttribute('aria-label', W.I18N.t('modals.help.closeAria'));
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
    var modal = document.getElementById('helpModal');
    if (modal) {
      modal.classList.remove('open');
      delete modal.dataset.currentHelp;
    }
  };
})(window.WorkHours);
