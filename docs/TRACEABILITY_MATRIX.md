# Enterprise Traceability Matrix

| Requirement ID | Requirement Summary | Stories | Code References | Test Coverage | Metrics |
|---|---|---|---|---|---|
| FR-01 | Multi-profile isolation and lifecycle | US-101 | `js/profile.js`, `js/handlers.js` | `tests/profile-auth.test.js` | Active Profiles |
| FR-02 | Password-gated profile access | US-102, US-103 | `js/profile.js`, `js/modal.js` | `tests/profile-auth.test.js` | Access Failure Rate |
| FR-03 | Canonical entry save/edit/delete | US-201, US-202, US-203 | `js/form.js`, `js/modal.js`, `lib/merge-working-hours.js` | `tests/merge-working-hours.test.js` | Save Reliability |
| FR-04 | Multilingual voice capture to canonical persistence | US-301, US-302 | `js/voice-entry.js` | `tests/voice-entry.test.js` | Voice Parse Acceptance |
| FR-05 | Startup sync + autosave reliability | US-401, US-402 | `js/data-sync.js`, `js/init.js`, `api/working-hours-data.js` | `tests/api-working-hours-data.test.js` | Sync Success Rate |
| FR-06 | Export/import compatibility and integrity | US-501 | `js/export.js`, `js/import-export.js` | `tests/export-import.test.js` | Export Success Rate |
| FR-07 | Full manual translation package coverage | US-502 | `js/i18n.js`, `js/i18n-*-locale.js` | `tests/i18n-coverage.test.js` | Translation Coverage |
| NFR-01 | Reliability and recoverability | US-401 | `js/data-sync.js` | API + merge tests | Save Reliability |
| NFR-02 | Security hardening and auth controls | US-102 | `api/working-hours-data.js`, `vercel.json` | API auth tests | Security Incident Count |
| NFR-03 | Operational deployability | US-402 | `vercel.json`, `docs/DEPLOYMENT_VERCEL.md` | smoke checklist | Deployment Success Rate |
