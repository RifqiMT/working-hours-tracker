# Technical Guidelines

**Product:** Working Hours Tracker  
**Last updated:** 2026-07-07

---

## 1. Engineering Principles

| Principle | Practice |
|-----------|----------|
| **Modular boundaries** | One concern per `js/*.js` file; extend `WorkHours` namespace. |
| **Deterministic normalization** | All dates/times/enums through `time.js` and merge lib. |
| **Explicit errors** | User toasts + console context; never silent swallow except documented best-effort paths. |
| **Minimal diff** | Focused changes; no unrelated refactors in feature PRs. |
| **Shared merge truth** | Update `lib/merge-working-hours.js` + tests when merge rules change. |

---

## 2. Code Organization

### 2.1 Script load order

Defined in `index.html`. **Do not** load modules before dependencies. `init.js` must remain last.

Critical early chain:

```
constants.js → sync-status.js → storage.js → … → init.js
```

`sync-status.js` must load before `storage.js` because autosave calls `setSyncStatusDisplay` on save lifecycle events.

### 2.2 Naming conventions

| Item | Convention |
|------|------------|
| WorkHours API | `W.camelCase` functions on namespace |
| Private state | `W._leadingUnderscore` |
| i18n keys | `dot.notation` (`clockEntry.save`) |
| CSS | BEM-like blocks (`entry-row-selected`) |
| Themes | Lowercase country id (`southkorea`) |

### 2.3 File size

`index.html` contains large inline CSS—prefer new component styles there unless extracting is approved. JS modules should stay cohesive; split when >800 lines with clear boundary.

---

## 3. Data Handling

- **Never** store plaintext passwords.
- **Always** canonicalize before `setData`.
- **Assume** production POST is snapshot replace.
- **Deduplicate** entry ids and date collisions on load (`dedupeAllProfilesEntryArrays`, `ensureAllEntryIds`).

---

## 4. Security and Secrets

| Rule | Detail |
|------|--------|
| Secrets in env only | `REDIS_URL`, `WORKHOURS_API_KEY` |
| No secrets in docs/commits | Scan diffs before push |
| `.gitignore` | `data/Working Hours Data.json`, `node_modules`, `.vercel` |
| Client-side hash | SHA-256 for profile password |

---

## 5. Performance Guidance

| Path | Guidance |
|------|----------|
| `renderEntries` | Avoid O(n²) on large tables; batch DOM updates |
| Language switch | Use `scheduleLanguageHeavyRefresh` |
| Autosave | Debounce/coalesce rapid `setData` |
| Charts | Destroy Chart instances on modal close |

**Guardrail:** No >10% regression on critical paths without benchmark evidence (`GUARDRAILS.md` PG-01).

---

## 6. Quality and Testing

| Layer | Expectation |
|-------|-------------|
| Merge lib | Unit tests required |
| API handler | Unit tests with mock Redis |
| UI features | Manual regression checklist |
| i18n | `npm run verify:i18n` on key changes |

Run `npm test` before every release.

---

## 7. i18n Implementation

1. Add English keys to `js/i18n.js`.
2. Propagate to all `js/i18n-*-locale.js` packs (or run generation scripts in `scripts/`).
3. Use `data-i18n`, `data-i18n-title`, `data-i18n-aria-label` in HTML where static.
4. Dynamic strings: `W.I18N.t('key', { params })`.

---

## 8. Dependency Management

| Package | Update policy |
|---------|---------------|
| `express`, `redis` | Patch/minor with test pass |
| `pptxgenjs` | Re-run postinstall; verify PPT export |
| CDN (Chart, Luxon) | Pin version in index.html; test charts/timezones |

---

## 9. Git and Release

- Do not commit unless explicitly requested by stakeholder.
- Do not force-push `main`.
- Changelog entry for user-visible changes.

---

## 10. Related Documents

- `ARCHITECTURE.md`
- `TEST_STRATEGY.md`
- `GUARDRAILS.md`
- `API_CONTRACTS.md`
