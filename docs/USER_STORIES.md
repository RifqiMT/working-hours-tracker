# User Stories

## Epic E1 — Profile Management and Access Control

- **US-101** As a user, I want to create a profile so my entries are isolated.
  - AC: new profile appears in selector and accepts role metadata.
- **US-102** As a user, I want to protect a profile with password.
  - AC: protected profile requires unlock before view/edit/delete actions.
- **US-103** As a user, I want to edit profile attributes safely.
  - AC: changing password requires current password when one exists.

## Epic E2 — Entry Lifecycle

- **US-201** As a user, I want to save daily entries quickly.
  - AC: date/in/out/break/status/location/timezone persisted correctly.
- **US-202** As a user, I want bulk entry for multiple days.
  - AC: multiple rows validate and save with duplicate-date awareness.
- **US-203** As a user, I want to edit/delete selected entries.
  - AC: selected rows can be batch edited/deleted after access check.

## Epic E3 — Voice-Assisted Input

- **US-301** As a user, I want voice input in my language.
  - AC: transcript parsed and normalized to canonical English data schema.
- **US-302** As a user, I want a review step before applying voice data.
  - AC: modal shows parsed fields and allows manual correction.

## Epic E4 — Data Reliability and Sync

- **US-401** As a user, I want automatic persistence while I work.
  - AC: autosave queue retries failures and reflects sync status.
- **US-402** As a user, I want startup sync with existing cloud data.
  - AC: app merges on load and preserves local validity.

## Epic E5 — Reporting and Localization

- **US-501** As a manager, I want exportable CSV/JSON and PPT highlights.
  - AC: exports include profile metadata and expected schema.
- **US-502** As a global user, I want full manual language packs.
  - AC: all visible strings are sourced from i18n/manual locale keys.
