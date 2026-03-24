const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3010;

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'Working Hours Data.json');

app.use(express.json({ limit: '25mb' }));

// Simple CORS for API use from other ports (e.g., 3011).
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Serve static files (the app)
app.use(express.static(__dirname));

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read working-hours data JSON
app.get('/api/working-hours-data', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.status(404).json({ error: 'Working Hours Data not found' });
    }
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(content);
    res.json(parsed);
  } catch (err) {
    console.error('Failed to read Working Hours Data:', err);
    res.status(500).json({ error: 'Failed to read Working Hours Data' });
  }
});

// Save working-hours data JSON
app.post('/api/working-hours-data', (req, res) => {
  try {
    ensureDataDir();
    const incoming = req.body || {};

    function clone(obj) {
      return obj && typeof obj === 'object' ? JSON.parse(JSON.stringify(obj)) : obj;
    }

    // Merge and normalize entries for a single profile on the server side (same rules as client data-sync).
    function mergeEntriesArrays(existing, incomingArr) {
      const nowIso = new Date().toISOString();
      const nowMs = new Date(nowIso).getTime();
      const DEFAULT_TZ = 'Europe/Berlin';
      const canonicalEntryDate = (e) => {
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
      };
      const makeKey = (e) => {
        if (e && e.id) return `id:${e.id}`;
        const c = canonicalEntryDate(e);
        if (c) return `date:${c}`;
        return `date_raw:${String(e && e.date != null ? e.date : '')}`;
      };
      const getTimestamp = (e) => {
        if (!e) return 0;
        const t = e.updatedAt || e.createdAt;
        if (!t) return 0;
        const d = new Date(t);
        return Number.isNaN(d.getTime()) ? 0 : d.getTime();
      };
      const normClock = (s) => {
        if (s == null || s === '') return '';
        const parts = String(s).trim().split(':');
        const h = parseInt(parts[0], 10);
        const m = parts.length > 1 ? parseInt(parts[1], 10) : 0;
        if (Number.isNaN(h)) return String(s).trim();
        const hh = Math.max(0, Math.min(23, h));
        const mm = Math.max(0, Math.min(59, Number.isNaN(m) ? 0 : m));
        return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
      };
      const parseTimeM = (s) => {
        if (s == null || s === '') return null;
        const parts = String(s).trim().split(':');
        const h = parseInt(parts[0], 10);
        const m = parts.length > 1 ? parseInt(parts[1], 10) : 0;
        if (Number.isNaN(h)) return null;
        return Math.max(0, Math.min(23, h)) * 60 + (Number.isNaN(m) ? 0 : Math.max(0, Math.min(59, m)));
      };
      const newId = () => (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
      const earliestCreated = (prev, e) => {
        const a = prev && prev.createdAt;
        const b = e && e.createdAt;
        if (!a) return b || nowIso;
        if (!b) return a;
        const ta = new Date(a).getTime();
        const tb = new Date(b).getTime();
        if (Number.isNaN(ta)) return b;
        if (Number.isNaN(tb)) return a;
        return ta <= tb ? a : b;
      };
      const normalizeMergedEntry = (prev, e, curTs, incomingTs) => {
        const incomingWins = incomingTs >= curTs;
        const src = incomingWins ? e : prev;
        const other = incomingWins ? prev : e;
        const winMs = Math.max(curTs, incomingTs, 0);
        const updatedAtIso = winMs > 0 ? new Date(winMs).toISOString() : nowIso;
        const desc = String(
          src && src.description != null
            ? src.description
            : (other && other.description != null ? other.description : '')
        ).trim();
        const normDay = (ds) => (['work', 'sick', 'holiday', 'vacation'].indexOf(ds) >= 0 ? ds : null);
        const normLoc = (loc) => {
          if (['WFO', 'WFH', 'AW', 'Anywhere'].indexOf(loc) >= 0) return loc === 'AW' ? 'Anywhere' : loc;
          return null;
        };
        const rawDate = (src && src.date) || (other && other.date);
        const dateNorm = canonicalEntryDate({ date: rawDate }) || rawDate;
        const rawIn = src && src.clockIn != null ? src.clockIn : (other && other.clockIn);
        const rawOut = src && src.clockOut != null ? src.clockOut : (other && other.clockOut);
        const nIn = normClock(rawIn);
        const nOut = normClock(rawOut);
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
          createdAt: earliestCreated(prev, e),
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
          if (incomingTs < curTs) {
            return;
          }
          map[k] = normalizeMergedEntry(prev, e, curTs, incomingTs);
          return;
        }
        const incTs = getTimestamp(e) || 0;
        map[k] = normalizeMergedEntry({}, e, 0, incTs || nowMs);
      });
      const combined = Object.keys(map).map((key) => map[key]);
      const applyNormClocks = (row) => {
        const ri = normClock(row.clockIn);
        const ro = normClock(row.clockOut);
        if (ri) row.clockIn = ri;
        if (ro) row.clockOut = ro;
        return row;
      };
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
            byDate[key] = applyNormClocks(row);
            return;
          }
          const ct = getTimestamp(cur);
          const et = getTimestamp(e) || nowMs;
          if (et > ct) {
            const rowWin = clone(e);
            rowWin.date = canon || rowWin.date;
            byDate[key] = applyNormClocks(rowWin);
          } else if (et === ct) {
            const su = String(e.updatedAt || e.createdAt || '');
            const cu = String(cur.updatedAt || cur.createdAt || '');
            if (su > cu) {
              const rowTie = clone(e);
              rowTie.date = canon || rowTie.date;
              byDate[key] = applyNormClocks(rowTie);
            }
          }
        });
        return Object.keys(byDate).map((k) => byDate[k]);
      };
      return collapseToSingleEntryPerDate(combined).sort(entryDateAsc);
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

    function mergeWorkingHoursRoot(currentRoot, incomingRoot) {
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
          mergedData[key] = mergeEntriesArrays(existingEntries, value);
        } else {
          mergedData[key] = clone(value);
        }
      });

      out.data = mergedData;
      out.exportedAt = new Date().toISOString();
      return out;
    }

    function entryDateAsc(a, b) {
      const da = (a && typeof a.date === 'string') ? a.date : '';
      const db = (b && typeof b.date === 'string') ? b.date : '';
      return da.localeCompare(db);
    }

    function sortAllEntryArraysByDate(root) {
      const out = clone(root);
      const data = out && out.data && typeof out.data === 'object' ? out.data : (out && typeof out === 'object' ? out : {});
      Object.keys(data).forEach((key) => {
        if (key === 'vacationDaysByProfile' || key === 'profileMeta' || key.indexOf('lastClock_') === 0) return;
        if (Array.isArray(data[key])) {
          data[key] = data[key].slice().sort(entryDateAsc);
        }
      });
      return out;
    }

    let finalPayload = incoming;
    if (fs.existsSync(DATA_FILE)) {
      try {
        const existingText = fs.readFileSync(DATA_FILE, 'utf8');
        const existingRoot = existingText ? JSON.parse(existingText) : {};
        finalPayload = mergeWorkingHoursRoot(existingRoot, incoming);
      } catch (e) {
        finalPayload = incoming;
      }
    }
    finalPayload = sortAllEntryArraysByDate(finalPayload);

    fs.writeFileSync(DATA_FILE, JSON.stringify(finalPayload, null, 2), 'utf8');
    res.status(204).end();
  } catch (err) {
    console.error('Failed to write Working Hours Data:', err);
    res.status(500).json({ error: 'Failed to write Working Hours Data' });
  }
});

app.listen(PORT, () => {
  console.log(`Working Hours Tracker server running at http://localhost:${PORT}/`);
});

