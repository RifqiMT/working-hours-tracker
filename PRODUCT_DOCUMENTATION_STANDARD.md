# Product Documentation Standard

## 1. Purpose

This standard governs how product, engineering, design, and operations documentation must be created and maintained for Working Hours Tracker.

The objective is to keep all artifacts:

- Accurate to actual source code behavior.
- Complete for cross-functional teams.
- Traceable from requirement to implementation.
- Operationally useful for release and incident handling.

## 2. Mandatory Documentation Inventory

### Core Product Files

1. `README.md`
2. `docs/PRD.md`
3. `docs/USER_PERSONAS.md`
4. `docs/USER_STORIES.md`

### Data and Quality Files

5. `docs/VARIABLES.md`
6. `docs/PRODUCT_METRICS.md`
7. `docs/METRICS_AND_OKRS.md`
8. `docs/TRACEABILITY_MATRIX.md`

### Design and Governance Files

9. `docs/DESIGN_GUIDELINES.md`
10. `docs/GUARDRAILS.md`
11. `docs/SECURITY_MODEL.md`

### Engineering and Operations Files

12. `docs/ARCHITECTURE.md`
13. `docs/API_CONTRACTS.md`
14. `docs/DEPLOYMENT_VERCEL.md`
15. `docs/TEST_STRATEGY.md`
16. `docs/OPERATIONS_RUNBOOK.md`

### Control Files

17. `docs/README.md`
18. `CHANGELOG.md`

## 3. Quality Requirements

### Accuracy

- File paths, APIs, env vars, and logic statements must match current implementation.
- Deprecated behaviors must be explicitly marked.

### Completeness

- Product overview, feature logic, business context, and tech context must be covered.
- Variables documentation must include definition, location, formula/rule, and examples.

### Traceability

- Every major requirement must map to stories, code modules, tests, and metrics.
- Traceability matrix must be maintained every release.

### Readability

- Use concise sections with clear headings.
- Prefer explicit examples over ambiguous descriptions.

### Governance

- Documentation updates are mandatory in the same change set as relevant code changes.

## 4. Update Triggers

Documentation updates are required when changes occur in:

- Feature behavior or user workflows
- UI labels/text/i18n key structures
- Data schema, merge logic, export/import format
- API contract, auth model, deployment config
- Metrics definitions, OKRs, release criteria

## 5. Review Workflow

1. Author updates docs and code together.
2. Reviewer validates code-doc alignment.
3. Release owner verifies quality gate checklist.

## 6. Release Documentation Gate

- [ ] Automated tests pass
- [ ] Diagnostics/lint clean for changed files
- [ ] README and docs index updated
- [ ] PRD/personas/stories updated for scope changes
- [ ] Variables/metrics/traceability updated
- [ ] Guardrails/security/runbook updated if operational impact exists
- [ ] Changelog updated with date and impact summary

## 7. Ownership Model

- **Product team:** PRD, personas, stories, metrics, OKRs
- **Engineering team:** architecture, API, variables, security, tests, runbook
- **Shared ownership:** README, traceability, guardrails, changelog
