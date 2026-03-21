const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3010;

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'Working Hours Data.json');

app.use(express.json({ limit: '5mb' }));

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

    // Merge and normalize entries for a single profile on the server side.
    // - Primary key: entry id (if present), else date.
    // - If the same id appears multiple times, keep the row with the latest updatedAt (or createdAt).
    // - Sorted ascending by date (oldest first).
    function mergeEntriesArrays(existing, incomingArr) {
      const nowIso = new Date().toISOString();
      const makeKey = (e) => (e && e.id ? `id:${e.id}` : `date:${e && e.date ? e.date : ''}`);
      const getTimestamp = (e) => {
        if (!e) return 0;
        const t = e.updatedAt || e.createdAt;
        if (!t) return 0;
        const d = new Date(t);
        return Number.isNaN(d.getTime()) ? 0 : d.getTime();
      };
      const map = {};
      (existing || []).forEach((e) => {
        if (!e) return;
        map[makeKey(e)] = clone(e);
      });
      (incomingArr || []).forEach((e) => {
        if (!e) return;
        const k = makeKey(e);
        const prev = map[k] || {};
        if (map[k]) {
          const curTs = getTimestamp(prev);
          const incomingTs = getTimestamp(e) || new Date(nowIso).getTime();
          if (incomingTs < curTs) {
            return;
          }
        }
        map[k] = Object.assign({}, prev, {
          date: e.date,
          clockIn: e.clockIn,
          clockOut: e.clockOut,
          breakMinutes: e.breakMinutes != null ? e.breakMinutes : prev.breakMinutes,
          dayStatus: e.dayStatus != null ? e.dayStatus : prev.dayStatus,
          location: e.location != null ? (e.location === 'AW' ? 'Anywhere' : e.location) : prev.location,
          description: e.description != null ? String(e.description).trim() : prev.description,
          timezone: e.timezone || prev.timezone,
          createdAt: prev.createdAt || e.createdAt || nowIso,
          updatedAt: nowIso
        });
      });
      return Object.keys(map)
        .sort()
        .map((k) => map[k]);
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

