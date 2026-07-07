# Release Sign-Off Templates

**Product:** Working Hours Tracker  
**Last updated:** 2026-07-07

---

## 1. Standard Release Checklist

**Release name:** _______________  
**Release date:** _______________  
**Release owner:** _______________

### Code quality
- [ ] `npm test` — all automated tests pass
- [ ] No secrets in diff (scan for keys, tokens, `.env`)
- [ ] Linter/diagnostics clean on changed files

### Documentation
- [ ] `CHANGELOG.md` updated
- [ ] `README.md` / `docs/README.md` current
- [ ] `TRACEABILITY_MATRIX.md` updated for scope changes
- [ ] `VARIABLES.md` updated if schema changed
- [ ] `DESIGN_GUIDELINES.md` updated if themes/tokens changed

### i18n
- [ ] New UI keys added to `i18n.js` and manual locale packs
- [ ] `npm run verify:i18n` pass (if strings changed)

### Manual smoke (see `TEST_STRATEGY.md`)
- [ ] Profile create/edit/delete
- [ ] Entry save + bulk
- [ ] Sync + export CSV
- [ ] Language + theme switch

### Operations
- [ ] `DEPLOYMENT_VERCEL.md` steps followed
- [ ] Env vars verified on Vercel
- [ ] Post-deploy API smoke (GET/POST)

### Approvals

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Engineering | | | |
| Product | | | |
| QA | | | |
| Operations | | | |

---

## 2. Hotfix Checklist (abbreviated)

- [ ] P0/P1 issue documented
- [ ] Fix + regression test or manual proof
- [ ] `CHANGELOG.md` hotfix entry
- [ ] Rollback plan confirmed
- [ ] Stakeholder approval for prod deploy

---

## 3. Documentation-Only Release

- [ ] No unintended code changes in diff
- [ ] Doc accuracy verified against `js/` behavior
- [ ] `PRODUCT_DOCUMENTATION_STANDARD.md` gate §7 satisfied
- [ ] `CHANGELOG.md` documents doc release

---

## 4. Post-Release

- [ ] Monitor API errors 24h
- [ ] Update `RELEASE_NOTES_DRAFT.md` → published notes
- [ ] OKR/KPI checkpoint if end of month

---

## Related

- `PRODUCT_DOCUMENTATION_STANDARD.md` §7
- `GUARDRAILS.md` OG-05
- `OPERATIONS_RUNBOOK.md`
