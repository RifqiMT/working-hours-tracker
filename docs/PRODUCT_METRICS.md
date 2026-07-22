# Product Metrics

**Product:** Working Hours Tracker  
**Last updated:** 2026-07-22  
**Audience:** Product, engineering, operations  
**Aligned with:** Product Documentation Standard v2.4

---

## 1. Purpose

This document defines **Key Performance Indicators (KPIs)** and supporting operational metrics used to measure product health, user outcomes, and release quality. Each metric includes a plain-language definition, calculation formula, data source, target, and owner.

---

## 2. KPI Framework

| KPI | Friendly name | Definition | Formula | Target | Owner | Primary source |
|-----|---------------|------------|---------|--------|-------|----------------|
| `daily_active_profiles` | Daily Active Profiles | Distinct profiles with ≥1 logged action per calendar day | `count(distinct profile where action_count ≥ 1 on date D)` | ≥ 85% of expected active profiles | Product | Client events*, snapshot diff |
| `save_reliability` | Save Reliability | Share of save attempts that succeed including retries | `successful_saves / total_save_attempts` | ≥ 99.0% monthly | Engineering | `storage.js` queue + API logs |
| `startup_sync_success` | Startup Sync Success | Share of app loads that complete initial sync without fatal error | `successful_startup_syncs / total_app_loads` | ≥ 99.5% | Engineering | `init.js`, API monitoring |
| `entry_accuracy_rate` | Entry Accuracy Rate | Entries not edited again the same calendar day | `entries_without_same_day_edit / entries_created` | ≥ 92% | Product Ops | `updatedAt` vs `date` |
| `export_success_rate` | Export Success Rate | Successful CSV/JSON/PPT export completions | `successful_exports / export_attempts` | ≥ 98% | Product Ops | Export handler + toasts |
| `voice_parse_acceptance` | Voice Parse Acceptance | Voice sessions applied without field correction | `accepted_without_edit / total_voice_sessions` | ≥ 80% | Product | Voice review modal outcomes* |
| `translation_coverage` | Translation Coverage | Shipped UI keys present in required locale packs | `translated_keys / required_keys` | 100% at release gate | Localization | `verify:i18n` scripts |
| `schema_rejection_incidents` | Schema Rejection Incidents | Downstream pipeline failures due to schema drift | `count(incidents tagged schema)` | 0 per quarter | Operations | Support / pipeline logs |

\* *Client event instrumentation may be manual or log-derived until formal analytics pipeline exists.*

---

## 3. KPI Detail Sheets

### 3.1 Save Reliability

**Why it matters:** Users trust the product only if entries persist after every action.

**Calculation:**
```
save_reliability = (autosave_success + manual_save_success) / (autosave_attempts + manual_save_attempts)
```
Include retries as single attempt until final outcome.

**Segmentation:** By environment (local vs Vercel), HTTP status family, profile locked/unlocked.

**Alert threshold:** < 97% over rolling 7 days → P2 investigation.

---

### 3.2 Entry Accuracy Rate

**Why it matters:** High same-day re-edit rates indicate UX friction or voice parse issues.

**Calculation:**
```
For each entry created on date D:
  same_day_edit = (updatedAt date == D) AND (updatedAt > createdAt + 5 minutes)
entry_accuracy_rate = 1 - (same_day_edit_count / entries_created)
```

**Segmentation:** By entry method (voice vs form vs bulk).

---

### 3.3 Export Success Rate

**Why it matters:** Managers depend on exports for reporting cycles.

**Calculation:**
```
export_success_rate = successful_exports / export_attempts
```
Count CSV, JSON, and PPT separately and in aggregate.

**Failure modes:** Locked profile skipped, empty dataset, browser download blocked.

---

### 3.4 Translation Coverage

**Why it matters:** Raw i18n keys visible to users destroy global UX quality.

**Calculation:**
```
translation_coverage = keys_present_in_all_required_packs / keys_in_en_catalog
```

**Release gate:** 100% for locales in rollout stage `all`.

---

## 4. Supporting Operational Metrics

| Metric | Definition | Use |
|--------|------------|-----|
| `merge_conflict_fallback_rate` | Merges that fell back to incoming-only due to parse errors | Data integrity monitoring |
| `api_error_rate` | HTTP 4xx/5xx / total API calls | SRE dashboard |
| `api_p95_latency` | 95th percentile GET/POST duration | Performance |
| `autosave_queue_depth_p95` | Pending saves in queue | Client perf |
| `profile_lock_adoption` | Profiles with `passwordHash` / total profiles | Security persona (Jordan) |
| `i18n_verify_failures` | Count of `verify:i18n` failures per CI run | Release blocker |
| `test_pass_rate` | Automated tests passed / total | Engineering gate |
| `doc_freshness_days` | Days since last doc update for touched modules | Governance |

---

## 5. Metric Collection Methods

| Method | Metrics | Notes |
|--------|---------|-------|
| **Automated tests** | Merge correctness, API contract | `npm test` |
| **i18n scripts** | Translation coverage | `npm run verify:i18n` |
| **API logs (Vercel)** | Error rate, latency, sync | Requires log drain |
| **Snapshot diff** | Active profiles, entry volume | Compare daily Redis exports |
| **Manual sampling** | Voice acceptance, UX defects | Quarterly UX review |

---

## 6. Dashboard Recommendations

### Weekly product review (30 min)
- Daily Active Profiles trend
- Save Reliability + Startup Sync Success
- Open P1/P2 defects

### Monthly business review
- Entry Accuracy Rate
- Export Success Rate
- Schema rejection incidents
- OKR KR progress (`METRICS_AND_OKRS.md`)

### Release gate (per deploy)
- Translation coverage = 100%
- `npm test` pass
- Traceability matrix updated

---

## 7. Baselines and Benchmarks

| Metric | Baseline (pre-product) | Current target |
|--------|------------------------|----------------|
| Report prep time | ~50 min manual Excel | ≤ 30 min (40% reduction) |
| Save reliability | Unknown (spreadsheet manual) | ≥ 99% |
| Schema incidents | Ad-hoc failures | 0 / quarter |

---

## 8. Data Privacy Notes

- Do not log plaintext passwords or full entry descriptions in centralized analytics without policy review.
- Profile names may be PII—hash or aggregate in shared dashboards.
- Export metrics should not retain file contents.

---

## 9. Related Documents

- `METRICS_AND_OKRS.md` — quarterly objectives
- `TRACEABILITY_MATRIX.md` — requirement-to-metric mapping
- `GUARDRAILS.md` — thresholds for performance regressions
