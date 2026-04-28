# Enterprise Traceability Matrix

| Requirement ID | Requirement Summary | Story IDs | Code References | Tests | Metrics |
|---|---|---|---|---|---|
| FR-01 | Multi-profile lifecycle and metadata | US-101, US-103 | `js/profile.js`, `js/handlers.js` | Manual + regression | Daily Active Profiles |
| FR-02 | Profile password protection and unlock gates | US-102 | `js/profile.js`, `js/entries.js`, `js/form.js`, `js/render.js` | Manual security flow tests | Access error rate |
| FR-03 | Canonical entry normalization and calculations | US-201 | `js/time.js`, `lib/merge-working-hours.js` | `tests/merge-working-hours.test.js` | Entry Save Success |
| FR-04 | Bulk and voice-assisted entry with review | US-202, US-301, US-302 | `js/form.js`, `js/voice-entry.js` | Manual scenario tests | Voice Apply Accuracy Proxy |
| FR-05 | Autosave and startup sync reliability | US-401, US-402 | `js/storage.js`, `js/data-sync.js`, `js/init.js` | `tests/api-working-hours-data.test.js` | Autosave Reliability, Sync Success |
| FR-06 | Import/export and reporting artifacts | US-501 | `js/import.js`, `js/export.js`, `js/highlights-ppt.js` | Manual export/import checks | Export Completion Rate |
| FR-07 | Full manual i18n language-pack approach | US-502 | `js/i18n.js`, `js/i18n-*-locale.js`, `index.html` | i18n coverage audit | Translation Coverage |
| NFR-01 | Production persistence via serverless + Redis | O4-related | `api/working-hours-data.js`, `vercel.json` | API tests + smoke | Uptime/API 2xx |
