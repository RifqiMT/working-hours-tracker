# Enterprise Traceability Matrix

| Requirement ID | Requirement | Story IDs | Code | Tests | Metrics |
|---|---|---|---|---|---|
| FR-01 | Profile lifecycle and isolation | US-101/103 | `js/profile.js`, `js/handlers.js` | Manual + regression | Daily Active Profiles |
| FR-02 | Profile password protection | US-102 | `js/profile.js`, `js/entries.js`, `js/form.js`, `js/render.js` | Manual access flows | Access failure ratio |
| FR-03 | Canonical entry normalization | US-201 | `js/time.js`, `lib/merge-working-hours.js` | `tests/merge-working-hours.test.js` | Save success |
| FR-04 | Bulk and multilingual voice input | US-202/301/302 | `js/form.js`, `js/voice-entry.js` | Manual voice/bulk checks | Voice apply rate |
| FR-05 | Autosave and sync reliability | US-401/402 | `js/storage.js`, `js/data-sync.js`, `api/working-hours-data.js` | `tests/api-working-hours-data.test.js` | Autosave + sync rate |
| FR-06 | Import/export/reporting compatibility | US-501 | `js/import.js`, `js/export.js`, `js/highlights-ppt.js` | Manual IO checks | Export completion |
| FR-07 | Full manual i18n approach | US-502 | `js/i18n.js`, `js/i18n-*-locale.js`, `index.html` | i18n audits | Translation completeness |
