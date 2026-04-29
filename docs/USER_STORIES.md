# User Stories

## Epic E1 — Profile Lifecycle and Access

### US-101: Create Profile

As a user, I want to create a profile so my entries are isolated.

**Acceptance Criteria**
- New profile appears in selector immediately.
- Role metadata is persisted.

### US-102: Protect Profile

As a user, I want to lock profile access using password.

**Acceptance Criteria**
- Locked profile requires password before protected actions.
- Incorrect password attempts show clear user feedback.

### US-103: Update Password Securely

As a user, I want current-password verification when changing password.

**Acceptance Criteria**
- Existing password must be provided before replacement.
- Mismatched confirmation blocks save.

## Epic E2 — Entry Operations

### US-201: Save Single Entry

As a user, I want to add/update one entry quickly.

**Acceptance Criteria**
- Canonical date/time/break/status/location/timezone persisted.
- Existing day updates are handled correctly.

### US-202: Save Bulk Entries

As a user, I want to manage multiple entries at once.

**Acceptance Criteria**
- Row validation blocks malformed input.
- Duplicate-date behavior is explicit.

### US-203: Batch Edit/Delete

As a user, I want to edit/delete selected entries safely.

**Acceptance Criteria**
- Selection and batch actions are consistent.
- Locked profiles enforce unlock before action.

## Epic E3 — Voice-Assisted Entry

### US-301: Multilingual Voice Input

As a user, I want voice entry in my language.

**Acceptance Criteria**
- Parser accepts multilingual phrases.
- Persisted values follow canonical schema.

### US-302: Review Before Apply

As a user, I want to edit parsed values before saving.

**Acceptance Criteria**
- Review modal displays parsed values.
- All fields remain editable before apply.

## Epic E4 — Data Reliability

### US-401: Autosave Reliability

As a user, I want background save to work reliably.

**Acceptance Criteria**
- Autosave retries transient failures.
- Status indicators communicate queue/saving/failure states.

### US-402: Startup Sync

As a user, I want latest cloud data loaded at startup.

**Acceptance Criteria**
- Startup sync fetches and merges data.
- Access controls remain enforced after sync.

## Epic E5 — Reporting and Localization

### US-501: Export and Reporting

As a manager, I want portable outputs for reporting.

**Acceptance Criteria**
- CSV/JSON/PPT outputs are generated and usable.
- Profile metadata integrity is preserved.

### US-502: Full Manual Translation

As a global user, I want complete translation coverage.

**Acceptance Criteria**
- New feature strings are added to manual packs.
- No raw fallback keys in released UX.
