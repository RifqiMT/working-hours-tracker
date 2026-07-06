# Guardrails

**Product:** Working Hours Tracker  
**Last updated:** 2026-07-06

Guardrails define **technical and business limitations** the team must respect during product development. They prevent data loss, security incidents, performance regressions, and documentation drift.

---

## 1. Business Guardrails

| ID | Guardrail | Rationale | What to do instead |
|----|-----------|-----------|-------------------|
| **BG-01** | Do not break canonical time record trust | Users and managers rely on historical accuracy | Preserve merge rules; document schema changes |
| **BG-02** | Reporting outputs must remain schema-stable | Downstream pipelines fail on drift | Version exports; update `VARIABLES.md` + `CHANGELOG.md` |
| **BG-03** | Shipped features require complete i18n | Global users see raw keys | Add keys to all manual packs before release |
| **BG-04** | No silent deletion of user data | Snapshot POST deletes omitted records | Confirm UX + docs when changing sync semantics |
| **BG-05** | Profile password is app-level, not OS-level | Users must understand limits on shared devices | Document in help + `SECURITY_MODEL.md` |
| **BG-06** | Out of scope: payroll, SSO, native mobile | Avoid scope creep | Route requests to integrations/export |

---

## 2. Technical Guardrails

| ID | Guardrail | Rationale | What to do instead |
|----|-----------|-----------|-------------------|
| **TG-01** | Never persist plaintext passwords | Credential exposure | SHA-256 hash only in `profileMeta` |
| **TG-02** | Never commit secrets | Repo leakage | Use env vars; `.gitignore` local data |
| **TG-03** | Single merge source of truth | Client/server divergence | Change `lib/merge-working-hours.js` + tests |
| **TG-04** | Production POST = full snapshot replace | Deterministic Redis state | Merge on client before POST; document deletions |
| **TG-05** | Do not bypass `requireProfileAccess` for mutations | Locked profile bypass | Gate view/edit/export in `entries.js`, `export.js` |
| **TG-06** | One entry per canonical date after merge | Duplicate day records | Rely on merge collapse; do not disable in UI only |
| **TG-07** | Canonical storage formats | Filter/sort breakage | Dates `YYYY-MM-DD`, times `HH:mm`, IANA timezones |
| **TG-08** | Client does not send API key by default | Intentional for open GET | Set `WORKHOURS_API_KEY` only with client header plan |

---

## 3. Performance Guardrails

| ID | Guardrail | Threshold | Measurement |
|----|-----------|-----------|-------------|
| **PG-01** | No >10% regression on critical paths without approval | 10% | Before/after timing on save, render, sync |
| **PG-02** | Entries render must stay interactive | Subjective + row count testing | Test with 1k+ entry fixture locally |
| **PG-03** | Autosave queue must not block UI | Non-blocking queue drain | `storage.js` async patterns |
| **PG-04** | Chart/PPT generation on filtered data | Avoid full-dataset chart on 10k+ rows | Respect active filters |
| **PG-05** | i18n refresh debounced | Language switch uses `scheduleLanguageHeavyRefresh` | No full re-render storm |

**Critical paths:** initial load + startup sync, `renderEntries`, autosave POST, stats modal open.

---

## 4. Quality Guardrails

| ID | Guardrail | Requirement |
|----|-----------|-------------|
| **QG-01** | Tests for merge and API | `npm test` must pass before release |
| **QG-02** | i18n verification | Run `verify:i18n` when adding keys |
| **QG-03** | Docs in same change set | Per `PRODUCT_DOCUMENTATION_STANDARD.md` |
| **QG-04** | Manual smoke for UX changes | Profile, entry, sync, export, language |
| **QG-05** | No dead code accumulation | Remove unused exports when identified |
| **QG-06** | Error paths must log meaningfully | Context without secrets (`data-sync.js` pattern) |

---

## 5. Security Guardrails

| ID | Guardrail | Detail |
|----|-----------|--------|
| **SG-01** | Hash-only password storage | See `SECURITY_MODEL.md` |
| **SG-02** | Optional `X-API-Key` on write | When `WORKHOURS_API_KEY` set |
| **SG-03** | Security headers on Vercel | `vercel.json` X-Frame-Options, etc. |
| **SG-04** | No PII in public logs | Redact profile names in shared telemetry |
| **SG-05** | Network translation opt-in | `__WH_ALLOW_NETWORK_TRANSLATION__` default off |
| **SG-06** | External IP APIs best-effort | ipapi/ipwho for hints only; offline fallback |

---

## 6. Operational Guardrails

| ID | Guardrail | Detail |
|----|-----------|--------|
| **OG-01** | Production deploy only when explicitly approved | No automatic push to prod |
| **OG-02** | `data/Working Hours Data.json` not committed | Gitignored local snapshot |
| **OG-03** | Redis backup before destructive ops | See `OPERATIONS_RUNBOOK.md` |
| **OG-04** | Rollback plan for API schema changes | Restore Redis snapshot + client compatibility |
| **OG-05** | Release checklist 100% | `RELEASE_SIGNOFF_TEMPLATES.md` |

---

## 7. Data and Schema Guardrails

| Field | Rule |
|-------|------|
| `dayStatus` | Only `work`, `sick`, `holiday`, `vacation` |
| `location` | `WFO`, `WFH`, `Anywhere` (normalize `AW`) |
| `breakMinutes` | Non-negative integer |
| `vacation quota` | 0–365 per year |
| `profileMeta.passwordHash` | Hex string only |

---

## 8. When to Escalate

| Situation | Escalate to |
|-----------|-------------|
| Save reliability < 97% weekly | Engineering lead + Operations |
| Schema breaking change | Product + Riley persona (ops analyst) |
| Security incident | Immediate ops; rotate `WORKHOURS_API_KEY` / Redis creds |
| Performance regression > 10% | Tech lead before merge |
| Missing i18n at release | Block release; localization |

---

## 9. Related Documents

- `SECURITY_MODEL.md` — threat model detail
- `TECHNICAL_GUIDELINES.md` — engineering norms
- `BUSINESS_GUIDELINES.md` — product decision principles
- `PRODUCT_METRICS.md` — threshold monitoring
