# Design Guidelines

**Last updated:** 2026-03-20

Defines visual system standards for themes, components, and responsive behavior for Working Hours Tracker (`index.html` + `js/*`).

## Design Principles

- Professional clarity over decorative complexity.
- High readability and predictable interaction states.
- Semantic consistency for status/overtime indicators.
- Responsive composition without functional loss.

## Token system

Core tokens used throughout UI:

- `--bg`, `--surface`, `--border`, `--text`, `--muted`
- `--accent`, `--accent-hover`
- `--success`, `--warning`

Supporting semantic/status tokens must derive from this base system.

### Base palette (default theme)

Before any `data-theme` override, the shell establishes a neutral baseline; country themes then override the same variable names. Inspect `:root` / `body` rules at the top of `index.html` for the exact default hex values used when no persisted theme applies yet (theme is restored early in `js/init.js` from `localStorage` `workingHoursTheme`).

## Theme Palette Guidance

Themes should:

- maintain contrast-compliant text/background pairing,
- preserve stable semantic meanings (`success`/`warning`),
- use accent color for emphasis instead of over-saturating surfaces.

## Full Theme Palette Reference (Token-Level)

All themes are defined in `index.html` via `body[data-theme="..."]` overrides. This table captures the effective values used by UI tokens and component semantics:

| Theme | bg | surface | border | accent | accent-hover | text | muted | success | warning |
|---|---|---|---|---|---|---|---|---|---|
| argentina | #f3f4f6 | #ffffff | #e5e7eb | #38bdf8 | #0ea5e9 | #0f172a | #475569 | #16a34a | #fbbf24 |
| australia | #020617 | #020617 | #1d4ed8 | #1d4ed8 | #1e40af | #e5e7eb | #9ca3af | #22c55e | #facc15 |
| austria | #fef2f2 | #ffffff | #fecaca | #dc2626 | #b91c1c | #111827 | #4b5563 | #16a34a | #eab308 |
| belgium | #111827 | #020617 | #facc15 | #facc15 | #eab308 | #f9fafb | #e5e7eb | #22c55e | #f97316 |
| brazil | #f3f4f6 | #ffffff | #e5e7eb | #16a34a | #15803d | #111827 | #6b7280 | #16a34a | #facc15 |
| canada | #f3f4f6 | #ffffff | #e5e7eb | #dc2626 | #b91c1c | #111827 | #4b5563 | #16a34a | #eab308 |
| china | #f3f4f6 | #ffffff | #e5e7eb | #dc2626 | #b91c1c | #111827 | #4b5563 | #16a34a | #facc15 |
| czechia | #eff6ff | #ffffff | #bfdbfe | #2563eb | #1d4ed8 | #0f172a | #1d4ed8 | #16a34a | #eab308 |
| dark | #020617 | #020617 | #1f2937 | #22c55e | #16a34a | #e5e7eb | #9ca3af | #22c55e | #facc15 |
| denmark | #fef2f2 | #ffffff | #fecaca | #dc2626 | #b91c1c | #111827 | #4b5563 | #16a34a | #eab308 |
| eu | #020617 | #020617 | #1d4ed8 | #facc15 | #eab308 | #e5e7eb | #9ca3af | #22c55e | #f97316 |
| finland | #e5f0ff | #ffffff | #bfdbfe | #2563eb | #1d4ed8 | #0f172a | #4b5563 | #16a34a | #eab308 |
| france | #e5e7eb | #f9fafb | #9ca3af | #1d4ed8 | #1e3a8a | #020617 | #4b5563 | #16a34a | #eab308 |
| germany | #111827 | #020617 | #facc15 | #f97316 | #ea580c | #f9fafb | #cbd5f5 | #22c55e | #facc15 |
| greece | #e0f2fe | #ffffff | #93c5fd | #1d4ed8 | #1e3a8a | #0f172a | #1d4ed8 | #16a34a | #eab308 |
| india | #f3f4f6 | #ffffff | #e5e7eb | #ea580c | #c2410c | #111827 | #6b7280 | #16a34a | #facc15 |
| indonesia | #f3f4f6 | #ffffff | #fecaca | #dc2626 | #b91c1c | #111827 | #6b7280 | #16a34a | #ea580c |
| ireland | #ecfdf5 | #ffffff | #bbf7d0 | #16a34a | #15803d | #052e16 | #166534 | #16a34a | #f97316 |
| italy | #ecfdf5 | #ffffff | #6ee7b7 | #16a34a | #15803d | #111827 | #047857 | #16a34a | #eab308 |
| japan | #f3f4f6 | #ffffff | #e5e7eb | #b91c1c | #991b1b | #111827 | #6b7280 | #16a34a | #eab308 |
| mexico | #f3f4f6 | #ffffff | #e5e7eb | #16a34a | #15803d | #111827 | #6b7280 | #16a34a | #f97316 |
| netherlands | #eff6ff | #ffffff | #93c5fd | #2563eb | #1d4ed8 | #111827 | #1d4ed8 | #16a34a | #fbbf24 |
| norway | #eff6ff | #ffffff | #fecaca | #b91c1c | #7f1d1d | #111827 | #4b5563 | #16a34a | #eab308 |
| poland | #ffffff | #f3f4f6 | #fecaca | #c53030 | #991b1b | #111827 | #4b5563 | #16a34a | #eab308 |
| portugal | #ecfdf3 | #ffffff | #86efac | #15803d | #166534 | #052e16 | #166534 | #16a34a | #f97316 |
| russia | #f3f4f6 | #ffffff | #e5e7eb | #2563eb | #1d4ed8 | #020617 | #4b5563 | #16a34a | #eab308 |
| saudiarabia | #022c22 | #03271c | #16a34a | #16a34a | #15803d | #ecfdf5 | #bbf7d0 | #16a34a | #facc15 |
| southafrica | #0b1120 | #020617 | #16a34a | #16a34a | #15803d | #e5e7eb | #9ca3af | #16a34a | #facc15 |
| southkorea | #f3f4f6 | #ffffff | #e5e7eb | #2563eb | #1d4ed8 | #111827 | #6b7280 | #16a34a | #e11d48 |
| spain | #fef3c7 | #ffffff | #fbbf24 | #dc2626 | #b91c1c | #111827 | #4b5563 | #16a34a | #f59e0b |
| sweden | #e0f2fe | #f9fafb | #60a5fa | #1d4ed8 | #1e3a8a | #0f172a | #1d4ed8 | #16a34a | #facc15 |
| switzerland | #f9fafb | #ffffff | #fecaca | #dc2626 | #b91c1c | #111827 | #4b5563 | #16a34a | #eab308 |
| turkey | #fef2f2 | #ffffff | #fecaca | #dc2626 | #b91c1c | #111827 | #4b5563 | #16a34a | #eab308 |
| uk | #020617 | #020617 | #1f2937 | #1d4ed8 | #1e40af | #e5e7eb | #9ca3af | #16a34a | #eab308 |
| ukraine | #e0f2fe | #dbeafe | #60a5fa | #2563eb | #1d4ed8 | #0f172a | #475569 | #16a34a | #fbbf24 |
| us | #020617 | #020617 | #1f2937 | #2563eb | #1d4ed8 | #e5e7eb | #9ca3af | #16a34a | #eab308 |

For complete token values, `index.html` remains the source of truth.

## Component Color Semantics

These components map directly to CSS semantic tokens defined in `index.html`:

- **Status indicators (Work / Sick / Holiday / Vacation):**
  - Background token: `--status-<status>-bg`
  - Pill token: `--status-<status>-pill-bg`
  - Used by: entries table status pills, calendar legend, and overtime/status highlights.
- **Entry row selection & hover:**
  - Hover token: `--entry-row-hover-bg`
  - Selected row background: `--entry-row-selected-bg`
  - Selected row border: `--entry-row-selected-border`
  - Used by: entries table row interaction states.
- **Calendar overtime visualization:**
  - Overtime bar token: `--calendar-overtime-bar`
  - Used by: calendar micro bars that indicate overtime intensity.
- **Help and tooltip interaction affordances:**
  - Help hover token: `--help-hover-bg`
  - Used by: help modal UI hover states.
- **Focus and accessibility affordance:**
  - Strong focus ring token: `--focus-ring-strong`
  - Used by: focus-visible states for interactive controls.
- **Charts and infographic visuals:**
  - Chart text: `--chart-text`
  - Chart muted: `--chart-muted`
  - Chart grid: `--chart-grid`
  - Tooltip background: `--chart-tooltip-bg`
  - Tooltip border: `--chart-tooltip-border`
  - Used by: `js/stats-summary.js` and Chart.js options.

## Component standards

- **Forms:** labels visible, placeholders optional, titles/tooltips for action intent; break fields use numeric inputs with dynamic `max` per unit (see `docs/VARIABLES.md`).
- **Filters:** grouped hierarchy, clear mode state (basic/advanced), predictable reset behavior.
- **Table:** sortable headers, icon semantics, row-state feedback; multi-select supports batch edit queue UX.
- **Calendar:** status color coding and location/overtime micro indicators.
- **Modals:** clear heading, single primary action emphasis, easy dismissal; edit entry uses a scrollable body with pinned footer where applicable, safe-area padding on notched devices, and fixed-position child overlays (e.g. timezone suggestion list) scoped to `#editModal` to avoid clipping.
- **Buttons:** consistent icon sizing, minimum interactive target, hover/focus states.
- **Internet Connectivity Badge (non-text, icon-only):** Expose `aria-label`/`title` and tooltip text translated via manual i18n packs (`common.internetStatus.*`); tooltip/ARIA text must re-sync to the currently selected UI language on language changes, and visible network status text is intentionally omitted.

## Responsive Standards

- Maintain functionality parity across breakpoints.
- Preserve key workflows in constrained width (entry, filters, table actions).
- Avoid hidden critical actions unless explicit progressive disclosure is intended.

## Accessibility Standards

- Use `aria-label`/`title` for icon-only controls.
- Maintain keyboard navigability for all controls and modals.
- Ensure color is not the sole status signal when practical.

## Internationalization UX Rules

- Strings should avoid hardcoded locale assumptions.
- Long labels must degrade gracefully in constrained layouts.
- Dynamic selectors should preserve single-select behavior and clear chosen value.
- **Reference packs:** `en` is fully hand-maintained in `js/i18n.js`. Indonesian (`id`) is additionally exported as a file-based full manual pack (`js/i18n-id-locale.js`) loaded by `index.html` before `js/i18n.js`. All other supported locales are delivered via file-based full packs loaded by `index.html`. For file-based packs, embedded UI/help content remains authoritative (shell merges are skipped for those locales).
- **Profile pre-cache:** `#prewarmUiPackBtn` is disabled/hidden in offline-first mode (manual packs are loaded from file; no network warmup is performed).
- **Privacy:** UI string translation cache keys (`workingHoursUiPackTranslationCache::<locale>`) are retained for backward compatibility, but offline-first operation does not require or populate them via network calls.
