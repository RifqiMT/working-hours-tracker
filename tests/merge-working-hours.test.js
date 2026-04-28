const test = require('node:test');
const assert = require('node:assert/strict');

const { mergeAndNormalizeWorkingHoursPayload } = require('../lib/merge-working-hours');

test('mergeAndNormalizeWorkingHoursPayload merges by id and prefers newer updatedAt', () => {
  const existing = {
    exportedAt: '2026-01-01T00:00:00.000Z',
    data: {
      'Profile A': [
        {
          id: 'id-1',
          date: '2026-03-01',
          clockIn: '08:00',
          clockOut: '17:00',
          breakMinutes: 60,
          dayStatus: 'work',
          location: 'WFH',
          description: 'old',
          timezone: 'Europe/Berlin',
          createdAt: '2026-03-01T08:00:00.000Z',
          updatedAt: '2026-03-01T17:00:00.000Z'
        }
      ],
      profileMeta: {},
      vacationDaysByProfile: {}
    }
  };

  const incoming = {
    exportedAt: '2026-01-02T00:00:00.000Z',
    data: {
      'Profile A': [
        {
          id: 'id-1',
          date: '2026-03-01',
          clockIn: '8:5',
          clockOut: '18:00',
          breakMinutes: 30,
          dayStatus: 'work',
          location: 'WFO',
          description: 'new',
          timezone: 'Europe/Berlin',
          createdAt: '2026-03-01T08:00:00.000Z',
          updatedAt: '2026-03-01T18:00:00.000Z'
        }
      ]
    }
  };

  const merged = mergeAndNormalizeWorkingHoursPayload(existing, incoming, { nowIso: '2026-04-01T00:00:00.000Z' });
  const rows = merged.data['Profile A'];
  assert.equal(rows.length, 1);
  assert.equal(rows[0].clockIn, '08:05');
  assert.equal(rows[0].clockOut, '18:00');
  assert.equal(rows[0].breakMinutes, 30);
  assert.equal(rows[0].location, 'WFO');
  assert.equal(rows[0].description, 'new');
});

test('mergeAndNormalizeWorkingHoursPayload collapses to one entry per canonical date', () => {
  const existing = { exportedAt: 'x', data: { 'P': [] } };
  const incoming = {
    exportedAt: 'y',
    data: {
      P: [
        { id: 'a', date: '2026-03-02', clockIn: '09:00', clockOut: '17:00', updatedAt: '2026-03-02T10:00:00.000Z' },
        { id: 'b', date: '2026-03-02T00:00:00.000Z', clockIn: '08:00', clockOut: '16:00', updatedAt: '2026-03-02T11:00:00.000Z' }
      ]
    }
  };

  const merged = mergeAndNormalizeWorkingHoursPayload(existing, incoming, { nowIso: '2026-04-01T00:00:00.000Z' });
  assert.equal(merged.data.P.length, 1);
  assert.equal(merged.data.P[0].id, 'b');
  assert.equal(merged.data.P[0].date, '2026-03-02');
});

