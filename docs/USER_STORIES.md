# User Stories

**Last updated:** 2026-03-20

Format: **As a [persona], I want [capability], so that [outcome].**

## Profile and Setup

- **US-001:** As an individual contributor, I want to create and switch profiles so that my records stay context-specific.
- **US-002:** As a freelancer, I want each profile to carry role metadata so that exports remain business-ready.
- **US-003:** As an HR coordinator, I want annual vacation quota per profile so that used vs remaining leave is auditable.

## Entry Capture

- **US-010:** As a user, I want to save entries with date, clock in/out, break, status, location, timezone, and description so that records are complete.
  - *Acceptance:* break values respect per-unit maximums (**≤ 60** minutes, **≤ 24** hours) and total stored break does not exceed **24 hours**; non-work statuses follow fixed clock/location rules (see `docs/PRD.md` Entry Management).
- **US-011:** As a user, I want quick clock in/out helpers so that daily logging is faster.
- **US-012:** As a user, I want voice-assisted entry with review before apply so that input remains fast and accurate.

## Filtering and Search

- **US-020:** As a user, I want basic and advanced filter modes so that I can move from simple to detailed analysis.
- **US-021:** As a user, I want semantic typeahead search so that I can query by dynamic patterns (presence/absence/overtime/break/description).
- **US-022:** As a user, I want calendar date selection to constrain visible entries so that date-specific review is easy.

## Table and Actions

- **US-030:** As a user, I want sortable entries with clear status/location icons so that scanning is efficient.
- **US-031:** As a user, I want edit/delete on selected entries so that I can maintain data quality.
- **US-031b:** As a user, I want to edit multiple selected entries in sequence (oldest to newest) and move to the next row after each successful save so that bulk corrections stay efficient.
- **US-032:** As a user, I want fullscreen mode for Filters & entries so that focused analysis is easier.

## Import, Export, Sync

- **US-040:** As a user, I want CSV/JSON import with merge so that I can consolidate historical data.
- **US-041:** As a user, I want full dataset export so that backup and external analysis are reliable.
- **US-042:** As a user, I want optional local Save/Sync API so that my browser data can be mirrored to local file storage.

## Reporting

- **US-050:** As a user, I want a stats card for filtered context so that quick status checks are immediate.
- **US-051:** As a team lead, I want period-based summary charts so that trends are visible.
- **US-052:** As a stakeholder, I want infographic and PPT outputs so that communication is presentation-ready.

## Theme and Language

- **US-060:** As a user, I want dynamic single-select theme and language controls so that personalization remains simple.
- **US-061:** As a user, I want language fallback behavior to remain stable as new locales are added.
- **US-062:** As a user, I want the app to provide complete UI/help translations from file-based locale packs (offline-first) so that languages work without internet access and without warmup delays.

## Acceptance Guidance (Global)

- Data edits persist correctly in local storage structures.
- Filter/search changes refresh table/calendar/stats consistently.
- Reporting values remain formula-consistent across modules.
- Import/export/sync flows preserve record integrity.

## Acceptance Criteria Template (Per Story)

- Correctness: user-visible behavior matches the narrative for the success path and common edge cases.
- Data integrity: persisted dataset (entries, profiles, quotas) remains valid after the action.
- Projection consistency: derived UI (entries table, calendar, stats card, charts, infographic, PPT) updates without mismatch.
- Internationalization resilience: if the active language changes, the story output stays readable and does not overwrite manual full help/UI content.
- Internationalization resilience for non-text indicators: icon-only tooltips/ARIA labels (e.g., internet connectivity badge) must re-synchronize in the selected language using manual full i18n packs.
- Validation hooks: when the change touches i18n/theme lists, `scripts/verify-i18n-locales.js` + `npm run verify:i18n`, and offline structural verification via `node scripts/verify-manual-locale-packs-offline.js` are used as quality gates.
