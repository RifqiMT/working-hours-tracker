# Operations Runbook

**Product:** Working Hours Tracker  
**Last updated:** 2026-07-07

---

## 1. Service Overview

| Component | Environment | URL / path |
|-----------|-------------|------------|
| Static SPA | Production | Vercel deployment URL |
| API | Production | `/api/working-hours-data` |
| Redis | Production | Via `REDIS_URL` |
| Local API | Development | `http://localhost:3010` |
| Local UI proxy | Development | `http://localhost:3011` |

---

## 2. Health Checks

| Check | Command / action | Expected |
|-------|------------------|----------|
| Automated tests | `npm test` | 6/6 pass |
| API GET | `curl -s -o /dev/null -w "%{http_code}" $URL/api/working-hours-data` | `200` or `404` if empty |
| API POST | Authenticated test POST with small payload | `204` |
| UI load | Open `/` in browser | Profile selector visible |
| Redis connectivity | Vercel function logs on POST | No connection errors |

---

## 3. Common Incidents

### 3.1 POST returns 401 Unauthorized

**Symptoms:** Autosave fails; sync errors in console.

**Cause:** `WORKHOURS_API_KEY` set but client not sending `X-API-Key`.

**Resolution:**
1. Confirm env in Vercel project settings.
2. Temporarily unset key OR update client to send header.
3. Verify with `curl -H "X-API-Key: $KEY" -X POST ...`

---

### 3.2 GET returns 500 / Redis errors

**Symptoms:** Startup sync fails; API logs show Redis connection errors.

**Cause:** Invalid `REDIS_URL`, Redis outage, or quota exceeded.

**Resolution:**
1. Verify `REDIS_URL` in Vercel (no trailing whitespace).
2. Test Redis from provider dashboard.
3. Roll back to last known good snapshot if data corrupt (see §5).

---

### 3.3 Users report missing data after sync

**Symptoms:** Entries disappeared after reload.

**Cause:** Snapshot POST omitted profiles (deletion semantics).

**Resolution:**
1. Check if older local backup exists in browser localStorage (another device).
2. Restore from manual JSON export if available.
3. Review client merge logs; educate on full-payload POST behavior.
4. Document in incident report; update `GUARDRAILS.md` communication if needed.

---

### 3.4 Frontend proxy 502 (local)

**Symptoms:** Port 3011 shows backend unreachable.

**Cause:** `dev/server.js` not running on 3010.

**Resolution:** Run `npm start` in project root.

---

## 4. Monitoring Recommendations

| Signal | Source | Alert threshold |
|--------|--------|-----------------|
| API 5xx rate | Vercel logs | > 1% over 15 min |
| API 401 rate | Vercel logs | Spike after key rotation |
| POST latency p95 | Vercel | > 3s |
| Redis memory | Provider | > 80% plan limit |

---

## 5. Backup and Restore

### 5.1 Production (Redis)

1. Export blob from Redis key `workingHoursData:v1` (or `WORKHOURS_REDIS_KEY`).
2. Store encrypted backup off-site.
3. Restore: `SET` key with validated JSON.

### 5.2 Local

Copy `data/Working Hours Data.json` before destructive tests.

---

## 6. Rollback Procedure

1. Revert Vercel deployment to previous promotion in dashboard.
2. If schema migration occurred, restore Redis backup from §5.
3. Notify users if incompatible client version shipped.
4. Record in `CHANGELOG.md` incident section.

---

## 7. Secret Rotation

| Secret | Steps |
|--------|-------|
| `WORKHOURS_API_KEY` | Generate new → update Vercel → update clients → revoke old |
| `REDIS_URL` | Create new DB/user → update env → verify GET/POST → decommission old |

---

## 8. On-Call Escalation

| Severity | Response time | Actions |
|----------|---------------|---------|
| P0 data loss | Immediate | Stop POST; restore backup; comms |
| P1 API down | < 1 hour | Check Vercel + Redis status |
| P2 degraded | Next business day | Track in backlog |

---

## 9. Related Documents

- `DEPLOYMENT_VERCEL.md`
- `API_CONTRACTS.md`
- `SECURITY_MODEL.md`
- `GUARDRAILS.md` OG-*
