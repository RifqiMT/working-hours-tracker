const express = require('express');
const fs = require('fs');
const path = require('path');
const { mergeAndNormalizeWorkingHoursPayload } = require('../lib/merge-working-hours');

const app = express();
const PORT = process.env.PORT || 3010;

const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
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
app.use(express.static(ROOT_DIR));

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

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

app.post('/api/working-hours-data', (req, res) => {
  try {
    ensureDataDir();
    const incoming = req.body || {};

    const nowIso = new Date().toISOString();
    let finalPayload = incoming;
    if (fs.existsSync(DATA_FILE)) {
      try {
        const existingText = fs.readFileSync(DATA_FILE, 'utf8');
        const existingRoot = existingText ? JSON.parse(existingText) : {};
        finalPayload = mergeAndNormalizeWorkingHoursPayload(existingRoot, incoming, { nowIso });
      } catch (_) {
        finalPayload = incoming;
      }
    }
    finalPayload = mergeAndNormalizeWorkingHoursPayload({}, finalPayload, { nowIso });

    fs.writeFileSync(DATA_FILE, JSON.stringify(finalPayload, null, 2), 'utf8');
    res.status(204).end();
  } catch (err) {
    console.error('Failed to write Working Hours Data:', err);
    res.status(500).json({ error: 'Failed to write Working Hours Data' });
  }
});

app.listen(PORT, () => {
  console.log(`Working Hours Tracker dev server running at http://localhost:${PORT}/`);
});

