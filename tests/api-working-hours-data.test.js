const test = require('node:test');
const assert = require('node:assert/strict');
const { createHandler } = require('../api/working-hours-data');

function makeReqRes({ method = 'GET', headers = {}, body = '' } = {}) {
  const events = {};
  const req = {
    method,
    headers,
    setEncoding() {},
    on(name, fn) {
      events[name] = events[name] || [];
      events[name].push(fn);
    },
    destroy() {}
  };
  const res = {
    statusCode: 200,
    _headers: {},
    _body: '',
    setHeader(k, v) {
      this._headers[String(k).toLowerCase()] = v;
    },
    end(chunk) {
      if (chunk) this._body += chunk;
      this._ended = true;
    }
  };

  // Trigger body stream asynchronously to match handler expectations.
  process.nextTick(() => {
    if (body && events.data) events.data.forEach((fn) => fn(body));
    if (events.end) events.end.forEach((fn) => fn());
  });

  return { req, res };
}

test('GET returns 404 when KV is empty', async () => {
  const store = {
    async get() {
      return null;
    }
  };
  const handler = createHandler({ store, requireAuth: false, storeKey: 'k' });
  const { req, res } = makeReqRes({ method: 'GET' });
  await handler(req, res);
  assert.equal(res.statusCode, 404);
  assert.match(res._body, /not found/i);
});

test('POST persists merged payload and returns 204', async () => {
  let stored = null;
  const store = {
    async get() {
      return stored;
    },
    async set(_key, value) {
      stored = value;
    }
  };
  const handler = createHandler({ store, requireAuth: false, storeKey: 'k' });
  const payload = JSON.stringify({ exportedAt: 'x', data: { P: [{ id: '1', date: '2026-03-01', clockIn: '8:5', clockOut: '17:00', updatedAt: '2026-03-01T17:00:00.000Z' }] } });
  const { req, res } = makeReqRes({ method: 'POST', headers: { 'content-type': 'application/json' }, body: payload });
  await handler(req, res);
  assert.equal(res.statusCode, 204);
  assert.ok(stored, 'expected store.set to be called');
  const parsed = JSON.parse(stored);
  assert.equal(parsed.data.P[0].clockIn, '08:05');
});

test('POST applies full snapshot replace semantics (deletions persist)', async () => {
  let stored = JSON.stringify({
    exportedAt: 'old',
    data: {
      KeepMe: [{ id: '1', date: '2026-03-01', clockIn: '09:00', clockOut: '17:00' }],
      RemoveMe: [{ id: '2', date: '2026-03-02', clockIn: '09:00', clockOut: '17:00' }]
    }
  });
  const store = {
    async get() {
      return stored;
    },
    async set(_key, value) {
      stored = value;
    }
  };
  const handler = createHandler({ store, requireAuth: false, storeKey: 'k' });
  const payload = JSON.stringify({
    exportedAt: 'new',
    data: {
      KeepMe: [{ id: '1', date: '2026-03-01', clockIn: '10:00', clockOut: '18:00' }]
    }
  });
  const { req, res } = makeReqRes({ method: 'POST', headers: { 'content-type': 'application/json' }, body: payload });
  await handler(req, res);
  assert.equal(res.statusCode, 204);
  const parsed = JSON.parse(stored);
  assert.ok(parsed.data.KeepMe, 'expected KeepMe to remain');
  assert.equal(parsed.data.KeepMe[0].clockIn, '10:00');
  assert.equal(parsed.data.RemoveMe, undefined, 'expected RemoveMe to be removed from persisted snapshot');
});

test('Auth mode write: GET does not require key, POST requires key when WORKHOURS_API_KEY is set', async () => {
  const prev = process.env.WORKHOURS_API_KEY;
  process.env.WORKHOURS_API_KEY = 'secret';
  try {
    const store = {
      async get() {
        return null;
      },
      async set() {}
    };
    const handler = createHandler({ store, requireAuth: true, authMode: 'write', storeKey: 'k' });

    const { req: getReq, res: getRes } = makeReqRes({ method: 'GET' });
    await handler(getReq, getRes);
    // No stored value, but should not be 401.
    assert.notEqual(getRes.statusCode, 401);

    const payload = JSON.stringify({ exportedAt: 'x', data: { P: [] } });
    const { req: postReq, res: postRes } = makeReqRes({ method: 'POST', headers: { 'content-type': 'application/json' }, body: payload });
    await handler(postReq, postRes);
    assert.equal(postRes.statusCode, 401);
  } finally {
    if (prev == null) delete process.env.WORKHOURS_API_KEY;
    else process.env.WORKHOURS_API_KEY = prev;
  }
});

