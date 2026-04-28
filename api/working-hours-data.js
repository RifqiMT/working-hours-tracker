const { createClient } = require('redis');
const { mergeAndNormalizeWorkingHoursPayload } = require('../lib/merge-working-hours');

const DEFAULT_STORE_KEY = 'workingHoursData:v1';

let _redisClient = null;
let _redisConnecting = null;

async function getRedisClient() {
  if (_redisClient) return _redisClient;
  if (_redisConnecting) return _redisConnecting;

  const url = process.env.REDIS_URL;
  if (!url) {
    const err = new Error('REDIS_URL is not set');
    err.code = 'missing_redis_url';
    throw err;
  }

  const client = createClient({ url });

  _redisConnecting = (async () => {
    client.on('error', (e) => {
      // Avoid throwing here; handler paths will surface connection errors.
      console.error('Redis client error:', e && e.message ? e.message : e);
    });
    await client.connect();
    _redisClient = client;
    _redisConnecting = null;
    return client;
  })();

  return _redisConnecting;
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let buf = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      buf += chunk;
      // Hard limit: mirror express.json limit (25mb) without buffering unbounded.
      if (buf.length > 25 * 1024 * 1024) {
        const err = new Error('payload_too_large');
        err.code = 'payload_too_large';
        reject(err);
        try {
          req.destroy();
        } catch (_) {}
      }
    });
    req.on('end', () => resolve(buf));
    req.on('error', reject);
  });
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function shouldRequireApiKey() {
  return typeof process.env.WORKHOURS_API_KEY === 'string' && process.env.WORKHOURS_API_KEY.trim() !== '';
}

function isAuthorized(req) {
  if (!shouldRequireApiKey()) return true;
  const provided = req.headers['x-api-key'];
  return typeof provided === 'string' && provided === process.env.WORKHOURS_API_KEY;
}

function createHandler(deps) {
  const d = deps && typeof deps === 'object' ? deps : {};
  let store = d.store || null;
  const key =
    d.storeKey ||
    process.env.WORKHOURS_REDIS_KEY ||
    process.env.WORKHOURS_KV_KEY ||
    DEFAULT_STORE_KEY;
  const requireAuth = typeof d.requireAuth === 'boolean' ? d.requireAuth : true;
  const authMode = d.authMode === 'all' || d.authMode === 'write' ? d.authMode : 'write';

  return async function workingHoursDataHandler(req, res) {
    try {
      if (!store) {
        store = {
          get: async (k) => {
            const client = await getRedisClient();
            return await client.get(k);
          },
          set: async (k, v) => {
            const client = await getRedisClient();
            await client.set(k, v);
          }
        };
      }

      const method = (req.method || 'GET').toUpperCase();
      if (method !== 'GET' && method !== 'HEAD' && method !== 'POST' && method !== 'OPTIONS') {
        res.statusCode = 405;
        res.setHeader('Allow', 'GET,HEAD,POST,OPTIONS');
        return res.end();
      }

      // CORS (kept permissive; Vercel is same-origin by default, but this preserves current local behavior).
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
      if (method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
      }

      const authRequiredForThisMethod =
        requireAuth && shouldRequireApiKey() && (authMode === 'all' || method === 'POST');

      if (authRequiredForThisMethod && !isAuthorized(req)) {
        return sendJson(res, 401, { error: 'Unauthorized' });
      }

      if (method === 'GET' || method === 'HEAD') {
        const stored = await store.get(key);
        if (!stored) {
          if (method === 'HEAD') {
            res.statusCode = 404;
            return res.end();
          }
          return sendJson(res, 404, { error: 'Working Hours Data not found' });
        }
        if (typeof stored === 'string') {
          try {
            if (method === 'HEAD') {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              return res.end();
            }
            return sendJson(res, 200, JSON.parse(stored));
          } catch (_) {
            return sendJson(res, 500, { error: 'Stored data is corrupted' });
          }
        }
        // If KV returns an object (depending on client), return it directly.
        if (method === 'HEAD') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.end();
        }
        return sendJson(res, 200, stored);
      }

      // POST
      const nowIso = new Date().toISOString();
      let incoming = {};
      try {
        const raw = await readRawBody(req);
        incoming = raw ? JSON.parse(raw) : {};
      } catch (err) {
        if (err && err.code === 'payload_too_large') {
          return sendJson(res, 413, { error: 'Payload too large' });
        }
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }

      let merged;
      try {
        // Persist full snapshot semantics for app saves:
        // missing profiles/entries in incoming payload are treated as deletions.
        merged = mergeAndNormalizeWorkingHoursPayload({}, incoming, { nowIso });
      } catch (err) {
        console.error('Merge failed:', err && err.message ? err.message : err);
        return sendJson(res, 500, { error: 'Failed to process payload' });
      }

      try {
        await store.set(key, JSON.stringify(merged));
      } catch (err) {
        console.error('Redis write failed:', err && err.message ? err.message : err);
        return sendJson(res, 500, { error: 'Failed to persist data' });
      }

      res.statusCode = 204;
      return res.end();
    } catch (err) {
      console.error('Unhandled API error:', err);
      return sendJson(res, 500, { error: 'Internal server error' });
    }
  };
}

module.exports = createHandler();
module.exports.createHandler = createHandler;

