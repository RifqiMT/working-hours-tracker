# Business Guidelines

**Product:** Working Hours Tracker  
**Last updated:** 2026-07-22

---

## 1. Product Positioning

Working Hours Tracker is a **practical, trustworthy daily operations tool** for individuals and small teams who need structured time records, profile isolation, and management-ready exports—without payroll engines or enterprise identity platforms.

**Positioning statement:**  
*“The fastest path from daily work to defensible time records and leadership-ready reports.”*

---

## 2. Target Customers

| Segment | Fit | Primary value |
|---------|-----|---------------|
| Individual knowledge workers | High | Speed + accuracy |
| Team leads (5–50 people) | High | Reporting + exports |
| Operations / data stewards | Medium | Schema stability |
| Enterprise HR/payroll | Low (out of scope) | Export handoff only |

---

## 3. Decision Principles

| Principle | Guidance |
|-----------|----------|
| **Reliability over breadth** | Ship stable save/sync before new input modalities. |
| **Backward-compatible exports** | Add columns; avoid renaming without version notice. |
| **Low effort for repeat tasks** | Prefer clock shortcuts, bulk, voice over new screens. |
| **Document every behavior change** | Same release as code (`PRODUCT_DOCUMENTATION_STANDARD.md`). |
| **Measure what matters** | Tie roadmap items to KPIs in `PRODUCT_METRICS.md`. |

---

## 4. Feature Prioritization Framework

| Priority | Criteria | Examples |
|----------|----------|----------|
| **P0** | Data loss risk, security, save/sync | Merge bugs, auth bypass |
| **P1** | Core daily workflow | Entry, profile, export |
| **P2** | Reporting enhancements | PPT, infographic |
| **P3** | Personalization | New themes, niche locales |

---

## 5. Commercial and Licensing

- Project is **private** (`package.json`).
- No embedded telemetry selling user data.
- External APIs (IP geolocation, optional Google translate) are **best-effort** and documented in guardrails.

---

## 6. Stakeholder Communication

| Stakeholder | Update channel | Frequency |
|-------------|----------------|-----------|
| End users | Release notes, in-app help | Per release |
| Managers | Export/PPT improvements | Quarterly |
| Operations | CHANGELOG, API_CONTRACTS | Per schema change |
| Leadership | OKR review (`METRICS_AND_OKRS.md`) | Monthly |

---

## 7. Risk Appetite

| Area | Appetite |
|------|----------|
| Data loss | **Zero tolerance** |
| Schema breaking changes | **Zero** without migration plan |
| UX experiments | Moderate with feature flags/local only |
| Third-party CDN dependency | Accepted (Chart.js, Luxon) with vendor fallback notes |

---

## 8. Compliance Considerations

- Users responsible for local labor law compliance; product provides records not legal advice.
- Profile passwords are **not** a substitute for device/OS access control.
- Exported files may contain PII—handle per organizational policy.

---

## 9. Related Documents

- `PRD.md`
- `GUARDRAILS.md`
- `USER_PERSONAS.md`
