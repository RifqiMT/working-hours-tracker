const crypto = require('crypto');

function clone(obj) {
  return obj && typeof obj === 'object' ? JSON.parse(JSON.stringify(obj)) : obj;
}

/** Normalize entry.date to YYYY-MM-DD when possible so duplicates merge correctly. */
function canonicalEntryDate(e) {
  if (!e || e.date == null || e.date === '') return '';
  const raw = e.date;
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    const nd = new Date(raw);
    return Number.isNaN(nd.getTime()) ? '' : nd.toISOString().slice(0, 10);
  }
  const s = String(raw).trim();
  if (!s) return '';
  const head = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (head) {
    const y = head[1];
    const mo = parseInt(head[2], 10);
    const da = parseInt(head[3], 10);
    if (mo >= 1 && mo <= 12 && da >= 1 && da <= 31) {
      return y + '-' + (mo < 10 ? '0' : '') + mo + '-' + (da < 10 ? '0' : '') + da;
    }
  }
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return s;
}

/** HH:mm normalization (same rules as client). */
function normClockToHHmm(s) {
  if (s == null || s === '') return '';
  const parts = String(s).trim().split(':');
  const h = parseInt(parts[0], 10);
  const m = parts.length > 1 ? parseInt(parts[1], 10) : 0;
  if (Number.isNaN(h)) return String(s).trim();
  const hh = Math.max(0, Math.min(23, h));
  const mm = Math.max(0, Math.min(59, Number.isNaN(m) ? 0 : m));
  return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}

function getTimestamp(e) {
  if (!e) return 0;
  const t = e.updatedAt || e.createdAt;
  if (!t) return 0;
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

function shallowMergeObjects(base, extra) {
  const out = {};
  Object.keys(base || {}).forEach((k) => {
    out[k] = clone(base[k]);
  });
  Object.keys(extra || {}).forEach((k) => {
    out[k] = clone(extra[k]);
  });
  return out;
}

function newId() {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function earliestCreated(prev, e, nowIso) {
  const a = prev && prev.createdAt;
  const b = e && e.createdAt;
  if (!a) return b || nowIso;
  if (!b) return a;
  const ta = new Date(a).getTime();
  const tb = new Date(b).getTime();
  if (Number.isNaN(ta)) return b;
  if (Number.isNaN(tb)) return a;
  return ta <= tb ? a : b;
}

/**
 * Merge and normalize entries for a single profile.
 * Rules mirror the client-side merge in `js/data-sync.js` and legacy server behavior:
 * - key by id (preferred), else by canonical date
 * - latest updatedAt/createdAt wins; tie-break by ISO string
 * - normalize clocks to HH:mm and enforce valid enums
 * - collapse to single entry per canonical date (newest wins)
 * - sort ascending by date (YYYY-MM-DD)
 */
function mergeEntriesArrays(existing, incomingArr, options) {
  const opts = options && typeof options === 'object' ? options : {};
  const nowIso = opts.nowIso || new Date().toISOString();
  const nowMs = opts.nowMs || new Date(nowIso).getTime();
  const DEFAULT_TZ = opts.defaultTimezone || 'Europe/Berlin';

  const makeKey = (e) => {
    if (e && e.id) return `id:${e.id}`;
    const c = canonicalEntryDate(e);
    if (c) return `date:${c}`;
    return `date_raw:${String(e && e.date != null ? e.date : '')}`;
  };

  const normDay = (ds) => (['work', 'sick', 'holiday', 'vacation'].indexOf(ds) >= 0 ? ds : null);
  const normLoc = (loc) => {
    if (['WFO', 'WFH', 'AW', 'Anywhere'].indexOf(loc) >= 0) return loc === 'AW' ? 'Anywhere' : loc;
    return null;
  };

  const normalizeMergedEntry = (prev, e, curTs, incomingTs) => {
    const incomingWins = incomingTs >= curTs;
    const src = incomingWins ? e : prev;
    const other = incomingWins ? prev : e;
    const winMs = Math.max(curTs, incomingTs, 0);
    const updatedAtIso = winMs > 0 ? new Date(winMs).toISOString() : nowIso;
    const desc = String(
      src && src.description != null ? src.description : (other && other.description != null ? other.description : '')
    ).trim();

    const rawDate = (src && src.date) || (other && other.date);
    const dateNorm = canonicalEntryDate({ date: rawDate }) || rawDate;
    const rawIn = src && src.clockIn != null ? src.clockIn : (other && other.clockIn);
    const rawOut = src && src.clockOut != null ? src.clockOut : (other && other.clockOut);
    const nIn = normClockToHHmm(rawIn);
    const nOut = normClockToHHmm(rawOut);

    return {
      id: (src && src.id) || (other && other.id) || newId(),
      date: dateNorm,
      clockIn: nIn || rawIn,
      clockOut: nOut || rawOut,
      breakMinutes: src && src.breakMinutes != null ? src.breakMinutes : (other && other.breakMinutes != null ? other.breakMinutes : 0),
      dayStatus: normDay(src && src.dayStatus) || normDay(other && other.dayStatus) || 'work',
      location: normLoc(src && src.location) || normLoc(other && other.location) || 'WFO',
      description: desc,
      timezone: (src && src.timezone) || (other && other.timezone) || DEFAULT_TZ,
      createdAt: earliestCreated(prev, e, nowIso),
      updatedAt: updatedAtIso
    };
  };

  const entryDateAsc = (a, b) => {
    const da = canonicalEntryDate(a) || (a && typeof a.date === 'string' ? a.date : '') || '';
    const db = canonicalEntryDate(b) || (b && typeof b.date === 'string' ? b.date : '') || '';
    return da.localeCompare(db);
  };

  const map = {};
  (existing || []).forEach((e) => {
    if (!e) return;
    map[makeKey(e)] = clone(e);
  });
  (incomingArr || []).forEach((e) => {
    if (!e) return;
    const k = makeKey(e);
    const prev = map[k];
    if (prev) {
      const curTs = getTimestamp(prev);
      const incomingTs = getTimestamp(e) || nowMs;
      if (incomingTs < curTs) return;
      map[k] = normalizeMergedEntry(prev, e, curTs, incomingTs);
      return;
    }
    const incTs = getTimestamp(e) || 0;
    map[k] = normalizeMergedEntry({}, e, 0, incTs || nowMs);
  });

  const combined = Object.keys(map).map((key) => map[key]);

  const collapseToSingleEntryPerDate = (entries) => {
    const byDate = {};
    (entries || []).forEach((e) => {
      if (!e) return;
      const canon = canonicalEntryDate(e) || String(e.date || '');
      const key = canon || `__nodate__${e.id || ''}`;
      const cur = byDate[key];
      if (!cur) {
        const row = clone(e);
        row.date = canon || row.date;
        const ri = normClockToHHmm(row.clockIn);
        const ro = normClockToHHmm(row.clockOut);
        if (ri) row.clockIn = ri;
        if (ro) row.clockOut = ro;
        byDate[key] = row;
        return;
      }
      const ct = getTimestamp(cur);
      const et = getTimestamp(e) || nowMs;
      if (et > ct) {
        const rowWin = clone(e);
        rowWin.date = canon || rowWin.date;
        const wi = normClockToHHmm(rowWin.clockIn);
        const wo = normClockToHHmm(rowWin.clockOut);
        if (wi) rowWin.clockIn = wi;
        if (wo) rowWin.clockOut = wo;
        byDate[key] = rowWin;
      } else if (et === ct) {
        const su = String(e.updatedAt || e.createdAt || '');
        const cu = String(cur.updatedAt || cur.createdAt || '');
        if (su > cu) {
          const rowTie = clone(e);
          rowTie.date = canon || rowTie.date;
          const ti = normClockToHHmm(rowTie.clockIn);
          const to = normClockToHHmm(rowTie.clockOut);
          if (ti) rowTie.clockIn = ti;
          if (to) rowTie.clockOut = to;
          byDate[key] = rowTie;
        }
      }
    });
    return Object.keys(byDate).map((k) => byDate[k]);
  };

  return collapseToSingleEntryPerDate(combined).sort(entryDateAsc);
}

function sortAllEntryArraysByDate(root) {
  const out = clone(root);
  const data = out && out.data && typeof out.data === 'object' ? out.data : (out && typeof out === 'object' ? out : {});
  const entryDateAsc = (a, b) => {
    const da = (a && typeof a.date === 'string') ? a.date : '';
    const db = (b && typeof b.date === 'string') ? b.date : '';
    return da.localeCompare(db);
  };
  Object.keys(data).forEach((key) => {
    if (key === 'vacationDaysByProfile' || key === 'profileMeta' || key.indexOf('lastClock_') === 0) return;
    if (Array.isArray(data[key])) data[key] = data[key].slice().sort(entryDateAsc);
  });
  return out;
}

function mergeWorkingHoursRoot(currentRoot, incomingRoot, options) {
  const opts = options && typeof options === 'object' ? options : {};
  const nowIso = opts.nowIso || new Date().toISOString();

  if (!incomingRoot || typeof incomingRoot !== 'object') return currentRoot || {};
  const out = currentRoot && typeof currentRoot === 'object' ? clone(currentRoot) : {};
  const incomingData = incomingRoot.data && typeof incomingRoot.data === 'object' ? incomingRoot.data : incomingRoot;
  const currentData = out.data && typeof out.data === 'object' ? out.data : {};
  const mergedData = currentData || {};

  Object.keys(incomingData).forEach((key) => {
    const value = incomingData[key];
    if (key === 'vacationDaysByProfile' || key === 'profileMeta') {
      mergedData[key] = shallowMergeObjects(currentData[key] || {}, value || {});
    } else if (key.indexOf('lastClock_') === 0) {
      mergedData[key] = clone(value);
    } else if (Array.isArray(value)) {
      const existingEntries = Array.isArray(currentData[key]) ? currentData[key] : [];
      mergedData[key] = mergeEntriesArrays(existingEntries, value, opts);
    } else {
      mergedData[key] = clone(value);
    }
  });

  out.data = mergedData;
  out.exportedAt = nowIso;
  return out;
}

function mergeAndNormalizeWorkingHoursPayload(existingRoot, incomingRoot, options) {
  const merged = mergeWorkingHoursRoot(existingRoot || {}, incomingRoot || {}, options);
  return sortAllEntryArraysByDate(merged);
}

module.exports = {
  canonicalEntryDate,
  mergeEntriesArrays,
  mergeWorkingHoursRoot,
  mergeAndNormalizeWorkingHoursPayload,
  sortAllEntryArraysByDate
};

