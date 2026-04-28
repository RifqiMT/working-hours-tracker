# Changelog

All notable changes to this project are documented in this file.

## 2026-04-28

### Added

- Expanded enterprise-grade documentation suite:
  - Comprehensive README refresh.
  - PRD, personas, user stories, variables dictionary with relationship chart.
  - Product metrics and OKRs documentation.
  - Design guidelines, guardrails, and traceability matrix updates.
  - New security model, test strategy, and operations runbook docs.

### Changed

- Aligned architecture and API docs with current implementation:
  - Local backend entrypoint is `dev/server.js`.
  - Production persistence via Vercel serverless API + Redis.
  - Optional POST API-key authentication documented.
- Updated localization and profile-auth documentation coverage to include password/unlock flows.

### Impact

- Documentation now reflects latest product behavior, deployment architecture, and operational standards.
- Improves onboarding, release governance, and cross-team traceability.
