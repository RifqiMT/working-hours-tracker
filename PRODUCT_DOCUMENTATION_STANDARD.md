# Product Documentation Standard

**Last reviewed:** 2026-03-20

This standard defines how documentation is structured, maintained, and quality-checked for `working-hours-tracker`.

## Scope

Applies to all product documentation files in repository root and `docs/`.

## Documentation Set (Required)

- `README.md` — executive-level product and technical overview (features, stack, constraints, doc index).
- `docs/README.md` — documentation hub and navigation map.
- `docs/PRD.md` — requirements, scope, non-goals, acceptance guidance.
- `docs/USER_PERSONAS.md` — persona definitions, goals, pain points, feature fit.
- `docs/USER_STORIES.md` — story catalog with IDs and acceptance criteria.
- `docs/TRACEABILITY_MATRIX.md` — requirement → story → implementation → metrics → validation.
- `docs/GUARDRAILS.md` — technical and business limitations, privacy, i18n, and quality gates.
- `docs/VARIABLES.md` — canonical names, friendly labels, definitions, formulas, locations, examples, relationship diagrams.
- `docs/PRODUCT_METRICS.md` — product metric catalog (operational vs experience).
- `docs/METRICS_AND_OKRS.md` — objectives and key results for the product team.
- `docs/DESIGN_GUIDELINES.md` — tokens, theme palettes, components, responsive and accessibility guidance.
- `docs/ARCHITECTURE.md` — runtime model, modules, data flow, integrations.

### Supporting references (recommended)

- `scripts/README-i18n-tools.md` — generating and verifying file-based locale packs.

## Minimum Quality Bar

Every document update must satisfy:

1. **Implementation alignment**
   - Statements must match current code behavior.
   - Avoid aspirational language unless clearly marked as roadmap.
2. **Traceability**
   - Include file/module references for key logic.
3. **Professional clarity**
   - Use precise wording, stable definitions, and explicit assumptions.
4. **Cross-linking**
   - Link related docs to avoid duplication and drift.
5. **Version hygiene**
   - Update “last updated” date/notes when scope changes materially.

## Required Content Patterns

- **README:** product summary, benefits, feature inventory, stack, constraints, doc index.
- **PRD:** goals, non-goals, requirements, non-functional constraints, acceptance criteria.
- **Personas:** context, goals, pain points, workflows, feature relevance.
- **Stories:** ID, persona, narrative, acceptance criteria, dependencies.
- **Variables:** variable name, friendly name, definition, formula, app location, example, and (when feasible) a relationship chart showing dependencies across modules.
- **Metrics:** formula, source, granularity, caveats.
- **Design:** token system, palettes, component states, a11y and responsive guidance.
- **Architecture:** module boundaries, data flow, persistence and integration points.

## Governance and Ownership

- Product owner validates business correctness.
- Engineering owner validates implementation correctness.
- Documentation owner validates format quality and cross-file consistency.

## Update Triggers

Update affected docs when:

- feature behavior changes,
- storage schema changes,
- i18n/theme options change,
- imports/exports/reporting logic changes,
- dependencies or runtime model changes,
- validation or business rules change (for example break input caps, non-work day defaults, batch edit flows),
- dynamic translation or privacy posture for user-entered text changes.

## Suggested Execution Steps (per documentation cycle)

1. **Analyze source changes first**: review impacted files/modules before editing docs.
2. **Update definition docs**: revise `PRD.md`, personas/stories, and architecture if behavior changed.
3. **Update logic docs**: align variables and metrics docs with formulas/data behavior.
4. **Refresh traceability**: update `TRACEABILITY_MATRIX.md` for all changed requirement areas.
5. **Run consistency check**: verify cross-links and terminology across README + docs hub.
6. **Run locale parity check** (when `js/i18n.js` changes): from project root, run all three gates:
   - `npm run verify:i18n` — asserts `LANGUAGE_OPTION_DEFS`, `_EXTRA_TRANSLATION_LOCALES`, `UI_SURFACE_SHELL`, and `HELP_SHELL` stay aligned.
   - `npm run qa:i18n:quick` — runs quick structural checks, including offline manual-pack presence.
   - `node scripts/verify-manual-locale-packs-offline.js` — validates full file-based packs (offline structural completeness vs the English canonical structure).
   Full manual packs (file-based locale files) include Afrikaans (`af`), Arabic (`ar`), Brazilian Portuguese (`pt-BR`), Chinese (`zh`, 简体中文 in `i18n-zh-locale.js`), Czech (`cs`, `i18n-cs-locale.js`), Danish (`da`, `i18n-da-locale.js`), Dutch (`nl`, `i18n-nl-locale.js`), Finnish (`fi`, `i18n-fi-locale.js`), French (`fr`, `i18n-fr-locale.js`), German (`de`, `i18n-de-locale.js`), Greek (`el`, `i18n-el-locale.js`), Hindi (`hi`, `i18n-hi-locale.js`), Japanese (`ja`, `i18n-ja-locale.js`), Korean (`ko`, `i18n-ko-locale.js`), Norwegian (`no`, `i18n-no-locale.js`), Portuguese (`pt`, `i18n-pt-locale.js`), Polish (`pl`, `i18n-pl-locale.js`), Russian (`ru`, `i18n-ru-locale.js`), Spanish (`es`, `i18n-es-locale.js`), Swedish (`sv`, `i18n-sv-locale.js`), Turkish (`tr`, `i18n-tr-locale.js`), and Ukrainian (`uk`, `i18n-uk-locale.js`); keep `scripts/verify-i18n-locales.js` `MANUAL_FULL_UI_PACK_LOCALES` in sync if you add more file-based packs.

## Collaboration Guardrails

- Do not create commits or push changes unless explicitly requested by the user.
- Keep documentation edits in sync with current source state.
- Record known limitations transparently.
