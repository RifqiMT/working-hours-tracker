/**
 * Voice-based input for clock entry section.
 * Uses Web Speech API to capture speech, parse into entry fields, and show review modal before applying.
 * Depends: form, time, constants.
 */
(function (W) {
  'use strict';

  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  var timeNumberWords = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };

  /**
   * Parse a time string from voice: supports AM/PM (e.g. "9 am", "8:00 p.m.", "eight p.m.") and 24-hour (e.g. "09:00", "17:00").
   * segment: substring containing the time. isPm: true if PM was explicitly said for this time.
   */
  function parseTimeSegment(segment, isPm) {
    if (!segment || typeof segment !== 'string') return null;
    var s = segment.trim().toLowerCase();
    if (/^noon\b/i.test(s)) return '12:00';
    if (/^midnight\b/i.test(s)) return '00:00';
    var parts = s.split(':');
    var hStr = parts[0] ? parts[0].replace(/\D/g, '') : '';
    var h = parseInt(hStr, 10);
    if (isNaN(h) && parts[0]) {
      var word = parts[0].trim().toLowerCase();
      h = timeNumberWords[word];
    }
    var min = parts[1] != null ? parseInt(parts[1].replace(/\D/g, ''), 10) : 0;
    if (isNaN(h)) return null;
    if (isPm === true && h >= 1 && h <= 12) h = h === 12 ? 12 : h + 12;
    if (isPm === false && h === 12) h = 0;
    h = Math.max(0, Math.min(23, h));
    min = isNaN(min) ? 0 : Math.max(0, Math.min(59, min));
    return String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0');
  }

  /**
   * Parse a voice transcript into entry form values.
   * Handles: date (today/yesterday/tomorrow), times in AM/PM or 24-hour (9am, 17:00, 9 to 5), break, status, location (home=WFH, office=WFO), description.
   */
  W.parseVoiceTranscript = function parseVoiceTranscript(transcript) {
    if (!transcript || typeof transcript !== 'string') transcript = '';
    var text = transcript.trim().toLowerCase();
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var dd = String(today.getDate()).padStart(2, '0');
    var todayStr = yyyy + '-' + mm + '-' + dd;

    var result = {
      date: todayStr,
      clockIn: '09:00',
      clockOut: '18:00',
      breakVal: 0,
      breakUnit: 'minutes',
      dayStatus: 'work',
      location: 'WFO',
      description: ''
    };

    // Date: today, yesterday, tomorrow
    if (/\byesterday\b/.test(text)) {
      var d = new Date(today);
      d.setDate(d.getDate() - 1);
      result.date = d.toISOString().slice(0, 10);
    } else if (/\btomorrow\b/.test(text)) {
      var d2 = new Date(today);
      d2.setDate(d2.getDate() + 1);
      result.date = d2.toISOString().slice(0, 10);
    }
    // Optional: "March 13" / "13th of March" / "13 March" (current year)
    var monthNames = 'january february march april may june july august september october november december'.split(' ');
    for (var i = 0; i < 12; i++) {
      var name = monthNames[i];
      var re = new RegExp('(\\d{1,2})(?:st|nd|rd|th)?\\s*(?:of\\s*)?' + name + '|' + name + '\\s*(\\d{1,2})(?:st|nd|rd|th)?', 'i');
      var match = text.match(re);
      if (match) {
        var dayNum = parseInt(match[1] || match[2], 10);
        if (dayNum >= 1 && dayNum <= 31) {
          result.date = yyyy + '-' + String(i + 1).padStart(2, '0') + '-' + String(dayNum).padStart(2, '0');
          break;
        }
      }
    }

    // Times: AM/PM ("9 am", "5:30 pm", "noon") and 24-hour ("09:00", "17:00", "17"); "9 to 5", "from 9 to 17"
    var foundTime = false;
    var i;
    if (/\bnoon\b/i.test(text) && !foundTime) {
      result.clockIn = '12:00';
      result.clockOut = '12:00';
      foundTime = true;
    }
    if (/\bmidnight\b/i.test(text) && !foundTime) {
      result.clockIn = '00:00';
      result.clockOut = '00:00';
      foundTime = true;
    }
    var timePatterns = [
      { re: /from\s+(\d{1,2}(?::\d{2})?)\s*(am|a\.m\.)[\s\S]*?(?:till|until|to)\s+(\d{1,2}(?::\d{2})?)\s*(pm|p\.m\.)/i, p1: false, p2: true, seg2From: 3 },
      { re: /(\d{1,2}(?::\d{2})?)\s*(am|a\.m\.)\s*(?:and\s+)?(?:till|until|to)\s+(\d{1,2}(?::\d{2})?)\s*(pm|p\.m\.)/i, p1: false, p2: true, seg2From: 3 },
      { re: /(\d{1,2}(?::\d{2})?)\s*(am|a\.m\.)\s*(?:to|until|-)\s*(\d{1,2}(?::\d{2})?)\s*(pm|p\.m\.)/i, p1: false, p2: true, seg2From: 3 },
      { re: /(\d{1,2}(?::\d{2})?)\s*(am|a\.m\.)\s*(?:to|until|-)\s*(\d{1,2}(?::\d{2})?)\s*(am|a\.m\.)/i, p1: false, p2: false, seg2From: 3 },
      { re: /(\d{1,2}(?::\d{2})?)\s*(pm|p\.m\.)\s*(?:to|until|-)\s*(\d{1,2}(?::\d{2})?)\s*(pm|p\.m\.)/i, p1: true, p2: true, seg2From: 3 },
      { re: /(?:from\s+)?(\d{1,2}(?::\d{2})?)\s*(am|a\.m\.)?\s*(?:to|until|-)\s*(\d{1,2}(?::\d{2})?)\s*(pm|p\.m\.)/i, p1: false, p2: true, seg2From: 3 },
      { re: /(?:from\s+)?(\d{1,2}(?::\d{2})?)\s*(?:to|until|-)\s*(\d{1,2}(?::\d{2})?)\s*(pm|p\.m\.)/i, p1: null, p2: true, seg2From: 3 },
      { re: /(?:from\s+)?(\d{1,2}(?::\d{2})?)\s*(am|a\.m\.)\s*(?:to|until|-)\s*(\d{1,2}(?::\d{2})?)/i, p1: false, p2: null, seg2From: 3 },
      { re: /(?:till|until|to)\s+(\d{1,2}(?::\d{2})?)\s*(pm|p\.m\.)/i, p2Only: true, seg2From: 1, p2: true },
      { re: /(\d{1,2})\s*to\s*(\d{1,2})\s*(pm|p\.m\.)/i, p1: null, p2: true },
      { re: /(\d{1,2})\s*(am|a\.m\.)\s*to\s*(\d{1,2})/i, p1: false, p2: null, seg2From: 3 },
      { re: /(\d{1,2}):(\d{2})\s*to\s*(\d{1,2}):(\d{2})/i, p1: null, p2: null, colons: true },
      { re: /(\d{1,2})\s*to\s*(\d{1,2})\b/i, p1: null, p2: null }
    ];
    for (i = 0; i < timePatterns.length && !foundTime; i++) {
      var pat = timePatterns[i];
      var m = text.match(pat.re);
      if (!m) continue;
      foundTime = true;
      var seg1 = m[1];
      var seg2 = m[2];
      if (pat.colons && m[3] !== undefined && m[4] !== undefined) {
        seg1 = m[1] + ':' + m[2];
        seg2 = m[3] + ':' + m[4];
      } else if (pat.seg2From && m[pat.seg2From] !== undefined) {
        seg2 = m[pat.seg2From];
      } else if (m[2] && /^(am|a\.m\.|pm|p\.m\.)$/i.test(m[2]) && m[3] !== undefined) {
        seg2 = m[3];
      }
      var pm1 = pat.p1 === true;
      var pm2 = pat.p2 === true;
      if (pat.p1 === null && pat.p2 === null && !pat.p2Only) {
        var n1 = parseInt(String(seg1).replace(/\D/g, ''), 10);
        var n2 = parseInt(String(seg2).replace(/\D/g, ''), 10);
        if (n2 >= 13 && n2 <= 23) pm2 = true;
        if (n1 >= 13 && n1 <= 23) pm1 = true;
        if (n2 >= 1 && n2 <= 7 && n1 >= 8 && n1 <= 12) pm2 = true;
      }
      if (!pat.p2Only) result.clockIn = parseTimeSegment(seg1, pm1) || result.clockIn;
      result.clockOut = parseTimeSegment(seg2, pm2) || result.clockOut;
      var n1 = parseInt(String(seg1).replace(/\D/g, ''), 10);
      var n2 = parseInt(String(seg2).replace(/\D/g, ''), 10);
      if (n2 >= 1 && n2 <= 7 && n1 >= 8 && n1 <= 12 && result.clockOut.indexOf('0') === 0) {
        result.clockOut = String(n2 + 12).padStart(2, '0') + ':00';
      }
    }
    if (!foundTime) {
      var singleIn = text.match(/(?:start|in|from|clock\s*in)\s*(?:at\s+)?(\d{1,2}(?::\d{2})?)\s*(am|a\.m\.|pm|p\.m\.)?/i);
      var singleOut = text.match(/(?:end|out|until|till|to|clock\s*out)\s+(?:at\s+)?(\d{1,2}(?::\d{2})?)\s*(am|a\.m\.|pm|p\.m\.)?/i);
      if (singleIn && singleIn[1]) {
        var pmIn = singleIn[2] && /pm|p\.m\./i.test(singleIn[2]);
        result.clockIn = parseTimeSegment(singleIn[1], pmIn) || result.clockIn;
      }
      if (singleOut && singleOut[1]) {
        var pmOut = singleOut[2] && /pm|p\.m\./i.test(singleOut[2]);
        result.clockOut = parseTimeSegment(singleOut[1], pmOut) || result.clockOut;
      }
      if (!singleIn && !singleOut) {
        var h24In = text.match(/\b(1[3-9]|2[0-3])(?::(\d{2}))?(?:\s*hours?)?\s*to\s*(?:(\d{1,2})(?::(\d{2})?))/i);
        var h24Range = text.match(/(\d{1,2}(?::\d{2})?)\s*to\s*(\d{1,2}(?::\d{2})?)/i);
        if (h24Range) {
          var a = parseInt(String(h24Range[1]).replace(/\D/g, ''), 10);
          var b = parseInt(String(h24Range[2]).replace(/\D/g, ''), 10);
          result.clockIn = parseTimeSegment(h24Range[1], a >= 13 && a <= 23) || result.clockIn;
          result.clockOut = parseTimeSegment(h24Range[2], b >= 13 && b <= 23) || result.clockOut;
        }
      }
    }

    // Break: "30 min", "30 minutes", "1 hour", "1 hr", "one hour break", "half hour", "break of 45 min"
    var numberWords = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50, half: 0.5 };
    function parseBreakNumber(s) {
      if (!s) return NaN;
      s = String(s).trim().toLowerCase();
      var num = parseFloat(s);
      if (!isNaN(num)) return num;
      if (numberWords[s] !== undefined) return numberWords[s];
      return NaN;
    }
    var breakNum = NaN;
    var breakUnitStr = '';
    var digitBreak = text.match(/(\d+(?:\.\d+)?)\s*(minute|min|minutes|hr|hour|hours)(?:\s+break)?/i);
    var wordBreak = text.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|half)\s+(hour|hours|hr|minute|minutes|min)(?:\s+break)?/i);
    var breakOfMatch = text.match(/\bbreak\s+(?:of\s+)?(\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|forty|fifty|half)\s*(minute|min|minutes|hr|hour|hours)?/i);
    if (digitBreak) {
      breakNum = parseFloat(digitBreak[1]);
      breakUnitStr = digitBreak[2];
    } else if (wordBreak) {
      breakNum = parseBreakNumber(wordBreak[1]);
      breakUnitStr = wordBreak[2] || 'hour';
    } else if (breakOfMatch) {
      breakNum = parseBreakNumber(breakOfMatch[1]);
      breakUnitStr = (breakOfMatch[2] || 'minutes').toLowerCase();
      if (!breakUnitStr || breakUnitStr === 'hr' || breakUnitStr === 'hours') breakUnitStr = 'hour';
      if (breakUnitStr === 'minutes' && (breakNum === 1 || breakNum === 0.5)) breakUnitStr = 'hour';
    }
    if (!isNaN(breakNum) && breakNum >= 0) {
      result.breakVal = breakNum;
      result.breakUnit = /hour|hr/i.test(breakUnitStr) ? 'hours' : 'minutes';
      if (result.breakUnit === 'hours' && breakNum < 1 && breakNum > 0) result.breakVal = breakNum; /* e.g. half hour = 0.5 hours */
    }

    // Day status
    if (/\bsick\b/.test(text)) result.dayStatus = 'sick';
    else if (/\bholiday\b/.test(text)) result.dayStatus = 'holiday';
    else if (/\bvacation\b/.test(text)) result.dayStatus = 'vacation';
    else if (/\bwork\b/.test(text)) result.dayStatus = 'work';

    // Location: for sick/holiday/vacation always Anywhere; otherwise home (WFH), office (WFO), etc.
    if (result.dayStatus === 'sick' || result.dayStatus === 'holiday' || result.dayStatus === 'vacation') {
      result.location = 'Anywhere';
    } else if (/\bwfh\b|\bwork from home\b|\bhome\b/i.test(text)) result.location = 'WFH';
    else if (/\banywhere\b/i.test(text)) result.location = 'Anywhere';
    else if (/\bwfo\b|\bwork from office\b|\boffice\b/i.test(text)) result.location = 'WFO';

    // Description: "description ..." or "note ..." or trailing sentence after keywords
    var descMatch = text.match(/(?:description|note|notes|desc|about|regarding)[:\s]+(.+?)(?=\s*(?:\.|$)|$)/i);
    if (descMatch) result.description = descMatch[1].trim();
    else {
      var keyParts = text.split(/\b(?:today|yesterday|tomorrow|clock\s*in|clock\s*out|from|to|break|work|sick|holiday|vacation|wfo|wfh|office|home|anywhere)\b/i);
      var lastPart = keyParts[keyParts.length - 1];
      if (lastPart && lastPart.trim().length > 3) result.description = lastPart.trim();
    }

    return result;
  };

  /**
   * Apply parsed voice result to the entry form (does not submit).
   */
  W.applyVoiceToForm = function applyVoiceToForm(parsed) {
    if (!parsed) return;
    var dateEl = document.getElementById('entryDate');
    var clockInEl = document.getElementById('entryClockIn');
    var clockOutEl = document.getElementById('entryClockOut');
    var breakEl = document.getElementById('entryBreak');
    var breakUnitEl = document.getElementById('entryBreakUnit');
    var statusEl = document.getElementById('entryStatus');
    var locationEl = document.getElementById('entryLocation');
    var descEl = document.getElementById('entryDescription');
    if (dateEl) dateEl.value = parsed.date || '';
    if (clockInEl) clockInEl.value = parsed.clockIn || '';
    if (clockOutEl) clockOutEl.value = parsed.clockOut || '';
    if (breakEl) breakEl.value = String(parsed.breakVal != null ? parsed.breakVal : 0);
    if (breakUnitEl) breakUnitEl.value = parsed.breakUnit || 'minutes';
    if (statusEl) statusEl.value = parsed.dayStatus || 'work';
    if (locationEl) locationEl.value = parsed.location || 'WFO';
    if (descEl) descEl.value = parsed.description || '';
    if (typeof W.applyNonWorkDefaultsToEntryForm === 'function' && parsed.dayStatus !== 'work') {
      W.applyNonWorkDefaultsToEntryForm();
    }
    if (typeof W.syncEntryLocationForStatus === 'function') W.syncEntryLocationForStatus();
    if (typeof W.syncBreakInputLimits === 'function') W.syncBreakInputLimits('entryBreak', 'entryBreakUnit');
  };

  var VOICE_REVIEW_NON_WORK = ['sick', 'holiday', 'vacation'];

  W.syncVoiceReviewLocation = function syncVoiceReviewLocation() {
    var statusEl = document.getElementById('voiceReviewStatus');
    var locationEl = document.getElementById('voiceReviewLocation');
    if (!statusEl || !locationEl) return;
    if (typeof W.syncLocationAndTimeFieldsForDayStatus === 'function') {
      W.syncLocationAndTimeFieldsForDayStatus({
        statusEl: statusEl,
        locationEl: locationEl,
        clockInEl: document.getElementById('voiceReviewClockIn'),
        clockOutEl: document.getElementById('voiceReviewClockOut'),
        breakEl: document.getElementById('voiceReviewBreak'),
        breakUnitEl: document.getElementById('voiceReviewBreakUnit')
      });
      if (typeof W.syncBreakInputLimits === 'function') {
        W.syncBreakInputLimits('voiceReviewBreak', 'voiceReviewBreakUnit');
      }
    } else {
      var status = statusEl.value;
      if (VOICE_REVIEW_NON_WORK.indexOf(status) !== -1) {
        locationEl.value = 'Anywhere';
        locationEl.disabled = true;
      } else {
        locationEl.disabled = false;
      }
    }
  };

  /**
   * Open the voice review modal with parsed values and optional transcript. All fields are editable.
   */
  W.openVoiceReviewModal = function openVoiceReviewModal(parsed, transcript) {
    var overlay = document.getElementById('voiceReviewModal');
    if (!overlay) return;
    var transcriptEl = document.getElementById('voiceReviewTranscript');
    var dateEl = document.getElementById('voiceReviewDate');
    var clockInEl = document.getElementById('voiceReviewClockIn');
    var clockOutEl = document.getElementById('voiceReviewClockOut');
    var breakEl = document.getElementById('voiceReviewBreak');
    var breakUnitEl = document.getElementById('voiceReviewBreakUnit');
    var statusEl = document.getElementById('voiceReviewStatus');
    var locationEl = document.getElementById('voiceReviewLocation');
    var descEl = document.getElementById('voiceReviewDescription');
    if (transcriptEl) transcriptEl.textContent = transcript || '—';
    if (dateEl) dateEl.value = parsed.date || '';
    if (clockInEl) clockInEl.value = parsed.clockIn || '';
    if (clockOutEl) clockOutEl.value = parsed.clockOut || '';
    if (breakEl) breakEl.value = String(parsed.breakVal != null ? parsed.breakVal : 0);
    if (breakUnitEl) breakUnitEl.value = parsed.breakUnit || 'minutes';
    if (statusEl) statusEl.value = parsed.dayStatus || 'work';
    if (locationEl) locationEl.value = (VOICE_REVIEW_NON_WORK.indexOf(parsed.dayStatus) !== -1) ? 'Anywhere' : (parsed.location || 'WFO');
    if (descEl) descEl.value = parsed.description || '';
    if (VOICE_REVIEW_NON_WORK.indexOf(parsed.dayStatus) !== -1) {
      if (clockInEl) clockInEl.value = W.NON_WORK_DEFAULTS.clockIn;
      if (clockOutEl) clockOutEl.value = W.NON_WORK_DEFAULTS.clockOut;
      if (breakEl) breakEl.value = '1';
      if (breakUnitEl) breakUnitEl.value = 'hours';
    }
    W.syncVoiceReviewLocation();
    if (typeof W.syncBreakInputLimits === 'function') W.syncBreakInputLimits('voiceReviewBreak', 'voiceReviewBreakUnit');
    overlay.classList.add('open');
  };

  W.closeVoiceReviewModal = function closeVoiceReviewModal() {
    var overlay = document.getElementById('voiceReviewModal');
    if (overlay) overlay.classList.remove('open');
  };

  /**
   * Read current values from the voice review modal (including any edits) and apply to the main form.
   */
  W.applyVoiceReviewAndClose = function applyVoiceReviewAndClose() {
    var dateEl = document.getElementById('voiceReviewDate');
    var clockInEl = document.getElementById('voiceReviewClockIn');
    var clockOutEl = document.getElementById('voiceReviewClockOut');
    var breakEl = document.getElementById('voiceReviewBreak');
    var breakUnitEl = document.getElementById('voiceReviewBreakUnit');
    var statusEl = document.getElementById('voiceReviewStatus');
    var locationEl = document.getElementById('voiceReviewLocation');
    var descEl = document.getElementById('voiceReviewDescription');
    if (!dateEl) { W.closeVoiceReviewModal(); return; }
    var parsed = {
      date: dateEl.value || '',
      clockIn: clockInEl.value || '',
      clockOut: clockOutEl.value || '',
      breakVal: Number(breakEl.value) || 0,
      breakUnit: breakUnitEl ? breakUnitEl.value : 'minutes',
      dayStatus: statusEl ? statusEl.value : 'work',
      location: locationEl ? locationEl.value : 'WFO',
      description: descEl ? descEl.value : ''
    };
    if (VOICE_REVIEW_NON_WORK.indexOf(parsed.dayStatus) !== -1) {
      parsed.location = 'Anywhere';
      parsed.clockIn = W.NON_WORK_DEFAULTS.clockIn;
      parsed.clockOut = W.NON_WORK_DEFAULTS.clockOut;
      parsed.breakVal = 1;
      parsed.breakUnit = 'hours';
    } else if (parsed.dayStatus === 'work' && parsed.location !== 'WFO' && parsed.location !== 'WFH') {
      parsed.location = 'WFO';
    }
    if (W._voiceReviewTarget === 'editForm') {
      W.applyVoiceToEditForm(parsed);
      if (typeof W.showToast === 'function') W.showToast((W.I18N && W.I18N.t) ? W.I18N.t('toasts.editFormUpdated') : 'Edit form updated. Review and click Save changes when ready.', 'info');
    } else {
      W.applyVoiceToForm(parsed);
      if (typeof W.showToast === 'function') W.showToast((W.I18N && W.I18N.t) ? W.I18N.t('toasts.entryFormUpdated') : 'Entry form updated. Review and click Save entry when ready.', 'info');
    }
    W._voiceReviewTarget = null;
    W.closeVoiceReviewModal();
  };

  /**
   * Apply parsed values to the edit entry form (does not submit). Preserves entry id and timezone.
   */
  W.applyVoiceToEditForm = function applyVoiceToEditForm(parsed) {
    if (!parsed) return;
    var dateEl = document.getElementById('editDate');
    var clockInEl = document.getElementById('editClockIn');
    var clockOutEl = document.getElementById('editClockOut');
    var breakEl = document.getElementById('editBreak');
    var breakUnitEl = document.getElementById('editBreakUnit');
    var statusEl = document.getElementById('editStatus');
    var locationEl = document.getElementById('editLocation');
    var descEl = document.getElementById('editDescription');
    if (dateEl) dateEl.value = parsed.date || '';
    if (clockInEl) clockInEl.value = parsed.clockIn || '';
    if (clockOutEl) clockOutEl.value = parsed.clockOut || '';
    if (breakEl) breakEl.value = String(parsed.breakVal != null ? parsed.breakVal : 0);
    if (breakUnitEl) breakUnitEl.value = parsed.breakUnit || 'minutes';
    if (statusEl) statusEl.value = parsed.dayStatus || 'work';
    if (locationEl) locationEl.value = (VOICE_REVIEW_NON_WORK.indexOf(parsed.dayStatus) !== -1) ? 'Anywhere' : (parsed.location || 'WFO');
    if (descEl) descEl.value = parsed.description || '';
    if (VOICE_REVIEW_NON_WORK.indexOf(parsed.dayStatus) !== -1) {
      if (typeof W.applyNonWorkDefaultsToEditForm === 'function') W.applyNonWorkDefaultsToEditForm();
    } else if (typeof W.syncEditLocationForStatus === 'function') {
      W.syncEditLocationForStatus();
    }
    if (typeof W.syncBreakInputLimits === 'function') W.syncBreakInputLimits('editBreak', 'editBreakUnit');
  };

  var NO_SPEECH_TIMEOUT_MS = 60 * 1000; /* 1 minute: stop if no voice input within this time */

  /**
   * Start voice input for the main clock entry form. Sets target to entryForm and runs recognition.
   */
  W.startVoiceEntry = function startVoiceEntry() {
    W._voiceReviewTarget = 'entryForm';
    W._startVoiceRecognition('voiceEntryBtn');
  };

  /**
   * Start voice input from the edit entry modal. Sets target to editForm and runs recognition; review modal then applies to edit form.
   */
  W.startVoiceEntryForEdit = function startVoiceEntryForEdit() {
    W._voiceReviewTarget = 'editForm';
    W._startVoiceRecognition('editModalVoiceBtn');
  };

  /**
   * Retake voice from within the review modal. Keeps current target (entryForm or editForm); new result updates the modal.
   */
  W.startVoiceRetake = function startVoiceRetake() {
    if (!W._voiceReviewTarget) W._voiceReviewTarget = 'entryForm';
    W._startVoiceRecognition('voiceReviewRetakeBtn');
  };

  /**
   * Internal: request microphone, listen up to 1 minute for speech, parse and show review modal. buttonId = element to disable during listening.
   */
  W._startVoiceRecognition = function _startVoiceRecognition(buttonId) {
    if (!SpeechRecognition) {
      if (typeof W.showToast === 'function') W.showToast((W.I18N && W.I18N.t) ? W.I18N.t('toasts.voiceNotSupported') : 'Voice input is not supported in this browser. Try Chrome or Edge.', 'info');
      else alert((W.I18N && W.I18N.t) ? W.I18N.t('toasts.voiceNotSupported') : 'Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    var recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    var voiceBtn = document.getElementById(buttonId);
    var noSpeechTimerId = null;
    var completed = false;

    function reenableButton() {
      if (voiceBtn) {
        voiceBtn.disabled = false;
        var fallbackAria = (W.I18N && W.I18N.t) ? W.I18N.t('clockEntry.voiceEntryBtn.aria') : 'Fill with voice';
        voiceBtn.setAttribute('aria-label', voiceBtn.getAttribute('data-voice-aria-label') || fallbackAria);
      }
    }

    function clearNoSpeechTimer() {
      if (noSpeechTimerId != null) {
        clearTimeout(noSpeechTimerId);
        noSpeechTimerId = null;
      }
    }

    if (voiceBtn) {
      voiceBtn.disabled = true;
      var listeningAria = (W.I18N && W.I18N.t) ? W.I18N.t('voice.listeningAria') : 'Listening…';
      voiceBtn.setAttribute('aria-label', listeningAria);
    }
    if (typeof W.showToast === 'function' && W.I18N && W.I18N.t) {
      if (buttonId === 'voiceReviewRetakeBtn') {
        W.showToast(W.I18N.t('toasts.listeningRetake'), 'info');
      } else if (W._voiceReviewTarget === 'editForm') {
        W.showToast(W.I18N.t('toasts.listeningFromEntry'), 'info');
      } else {
        W.showToast(W.I18N.t('toasts.listeningGeneric'), 'info');
      }
    } else if (typeof W.showToast === 'function') {
      var tt = (W.I18N && typeof W.I18N.t === 'function') ? W.I18N.t : null;
      if (buttonId === 'voiceReviewRetakeBtn') {
        W.showToast(tt ? tt('toasts.listeningRetake') : 'Listening… Say your entry again. You have up to 1 minute.', 'info');
      } else if (W._voiceReviewTarget === 'editForm') {
        W.showToast(tt ? tt('toasts.listeningFromEntry') : 'Listening… Date is taken from the entry. Say times, break, location, etc. (e.g. "9 to 5, one hour break, WFH").', 'info');
      } else {
        W.showToast(tt ? tt('toasts.listeningGeneric') : 'Listening… You have up to 1 minute to speak. Say your entry (e.g. "Today 9 to 5, 30 min break, WFH, meeting with client").', 'info');
      }
    }

    noSpeechTimerId = setTimeout(function () {
      noSpeechTimerId = null;
      if (completed) return;
      completed = true;
      try { recognition.stop(); } catch (e) {}
      reenableButton();
      if (typeof W.showToast === 'function') {
        W.showToast((W.I18N && W.I18N.t) ? W.I18N.t('toasts.noSpeechDetected') : 'No speech detected for 1 minute. Try again or type your entry manually.', 'info');
      }
    }, NO_SPEECH_TIMEOUT_MS);

    recognition.onresult = function (event) {
      if (completed) return;
      var transcript = '';
      var i, result;
      if (event.results) {
        for (i = 0; i < event.results.length; i++) {
          result = event.results[i];
          if (result.isFinal && result[0]) transcript += result[0].transcript;
        }
      }
      if (!transcript) return;
      clearNoSpeechTimer();
      completed = true;
      try { recognition.stop(); } catch (e) {}
      reenableButton();
      var parsed = W.parseVoiceTranscript(transcript);
      if (W._voiceReviewTarget === 'editForm') {
        var editDateEl = document.getElementById('editDate');
        if (editDateEl && editDateEl.value) parsed.date = editDateEl.value;
      } else if (buttonId === 'voiceReviewRetakeBtn') {
        var reviewDateEl = document.getElementById('voiceReviewDate');
        if (reviewDateEl && reviewDateEl.value) {
          var textLower = transcript.trim().toLowerCase();
          var hasExplicitDate = /\b(today|yesterday|tomorrow)\b/.test(textLower) ||
            /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/.test(textLower) ||
            /\b\d{1,2}(st|nd|rd|th)?\s+(of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december)/i.test(textLower);
          if (!hasExplicitDate) parsed.date = reviewDateEl.value;
        }
      }
      W.openVoiceReviewModal(parsed, transcript);
    };

    recognition.onerror = function (event) {
      clearNoSpeechTimer();
      if (completed) return;
      completed = true;
      reenableButton();
      var t = (W.I18N && W.I18N.t) ? W.I18N.t : null;
      var msg = t ? t('toasts.voiceInputFailed') : 'Voice input failed. Try again or type manually.';
      if (event.error === 'not-allowed') msg = t ? t('toasts.voiceMicrophoneDenied') : 'Microphone access denied. Allow microphone to use voice entry.';
      if (event.error === 'no-speech') msg = t ? t('toasts.voiceNoSpeechDetected') : 'No speech detected. You have up to 1 minute to speak—try again.';
      if (typeof W.showToast === 'function') W.showToast(msg, 'info');
      else alert(msg);
    };

    recognition.onend = function () {
      if (completed) return;
      if (noSpeechTimerId != null) {
        var self = recognition;
        setTimeout(function () {
          if (completed || noSpeechTimerId == null) return;
          try { self.start(); } catch (e) { reenableButton(); }
        }, 100);
      } else {
        reenableButton();
      }
    };

    try {
      recognition.start();
    } catch (e) {
      clearNoSpeechTimer();
      completed = true;
      reenableButton();
      if (typeof W.showToast === 'function') W.showToast((W.I18N && W.I18N.t) ? W.I18N.t('toasts.couldNotStartVoice') : 'Could not start voice recognition.', 'info');
    }
  };
})(window.WorkHours);
