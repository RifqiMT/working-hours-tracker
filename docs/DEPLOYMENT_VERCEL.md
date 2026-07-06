# Deployment on Vercel

**Product:** Working Hours Tracker  
**Last updated:** 2026-07-06

---

## 1. Prerequisites

- Vercel account linked to repository
- Redis instance (Upstash, Redis Cloud, etc.)
- Node.js 18+ compatible project

---

## 2. Project Configuration

Configuration file: `vercel.json`

| Setting | Value |
|---------|-------|
| API routes | `api/**/*.js` → `@vercel/node` |
| Static | `index.html`, `js/**`, `vendor/**` |
| Rewrite | `/api/(.*)` → `/api/$1.js` |
| SPA fallback | Routes to `index.html` |
| Headers | X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy |

---

## 3. Environment Variables

Set in Vercel Project → Settings → Environment Variables:

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `REDIS_URL` | **Yes** | `redis://default:pass@host:6379` | Production persistence |
| `WORKHOURS_API_KEY` | No | `(random secret)` | Enables POST auth |
| `WORKHOURS_REDIS_KEY` | No | `workingHoursData:v1` | Override blob key |

Apply to **Production** (and Preview if testing API).

---

## 4. Deploy Steps

1. Push branch to connected Git remote (with user approval).
2. Vercel builds serverless function + static assets.
3. Verify deployment URL loads SPA.
4. Run smoke tests (see §6).
5. Update `CHANGELOG.md` if production release.

**Note:** Do not deploy without explicit stakeholder approval per project guardrails.

---

## 5. Build and Install

`package.json` postinstall copies `pptxgenjs` bundle to `vendor/pptxgen.bundle.js`.

Ensure `npm install` runs on Vercel (default for Node projects).

---

## 6. Post-Deploy Smoke Checklist

- [ ] `GET /api/working-hours-data` returns 200 or 404
- [ ] `POST` with valid JSON returns 204 (with API key if configured)
- [ ] UI loads; create test entry locally
- [ ] Export CSV downloads
- [ ] No console errors on stats modal open

---

## 7. Preview Deployments

Preview URLs useful for:
- i18n visual QA
- Theme contrast checks
- API testing with preview Redis (use separate `WORKHOURS_REDIS_KEY`)

**Warning:** Do not use production Redis for preview without isolation.

---

## 8. Troubleshooting

| Issue | Fix |
|-------|-----|
| 500 on API | Check `REDIS_URL`, function logs |
| 401 on POST | Set/send `X-API-Key` |
| PPT export fails | Verify `vendor/pptxgen.bundle.js` in build output |
| 404 on routes | Confirm `vercel.json` rewrites |

See `OPERATIONS_RUNBOOK.md` for incidents.

---

## 9. Local Parity

| Production | Local equivalent |
|------------|----------------|
| Vercel static + API | `npm start` (3010) |
| Separate frontend port | `npm run start:frontend` (3011) |
| Redis | `data/Working Hours Data.json` |

---

## 10. Related Documents

- `ARCHITECTURE.md`
- `API_CONTRACTS.md`
- `OPERATIONS_RUNBOOK.md`
