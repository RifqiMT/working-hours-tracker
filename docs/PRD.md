# Product Requirements Document (PRD)

## 1. Product Overview

Working Hours Tracker is a multi-profile time logging application used by professionals and teams to record work sessions, manage non-work day types, generate reports, and synchronize records across environments.

## 2. Objectives

- Provide accurate, timezone-safe work tracking.
- Minimize entry friction (single, bulk, and voice-assisted input).
- Ensure data continuity via autosave and cloud synchronization.
- Offer export-ready artifacts for reporting and management.

## 3. In Scope

- Profile lifecycle: create/edit/delete, role, vacation quota, optional password lock.
- Entry lifecycle: create/update/delete single and batch entries.
- Voice parsing with user review before apply.
- Calendar/statistics/infographic and PPT outputs.
- CSV/JSON import and export with metadata support.
- Multilingual UI with manual translation packs.
- Dev file persistence and production Redis persistence.

## 4. Out of Scope

- Multi-tenant server-side identity and account management.
- Payroll disbursement or HRIS integration.
- Native mobile app.

## 5. Functional Requirements

- FR-01 Profiles must be independently managed and selectable.
- FR-02 Password-protected profiles must require unlock before sensitive actions.
- FR-03 Entry calculations must normalize and persist canonical values.
- FR-04 Bulk and voice workflows must support correction before save.
- FR-05 Data must auto-save and support startup sync with merge behavior.
- FR-06 Export and import must preserve profile metadata and compatibility.
- FR-07 UI text must resolve through i18n keys/manual packs.

## 6. Non-Functional Requirements

- NFR-01 Reliability: autosave retry and graceful failure messaging.
- NFR-02 Performance: responsive UI for typical datasets (< 5k entries/profile).
- NFR-03 Security: no plaintext password storage; optional write API key.
- NFR-04 Deployability: zero-downtime Vercel production deploy.
- NFR-05 Observability: sync status and actionable user feedback.

## 7. Risks and Mitigations

- Voice recognition variability across browsers/languages -> review modal + manual edits.
- Shared-device privacy risk -> profile lock and unlock gating.
- Data divergence risk -> shared merge library and snapshot semantics.

## 8. Release Acceptance Criteria

- All tests pass, lint clean, deploy smoke checks pass.
- Docs updated: stories, metrics, variables, traceability, changelog.
- Translation keys added for all introduced user-facing text.
