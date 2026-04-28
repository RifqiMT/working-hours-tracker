# Design Guidelines

## UX Principles

- Clarity over density: prioritize high-legibility forms and labels.
- Safe editing: destructive actions require confirmation.
- Fast data entry: support single, bulk, and voice flows.
- Consistency: all modal actions follow primary/secondary hierarchy.
- Localization-first: UI text must be sourced through i18n keys.

## Theme and Color System

The app supports multiple themes via `body[data-theme="..."]` in `index.html`.

### Baseline semantic tokens

- Primary action
- Secondary action
- Surface/background
- Text primary/secondary
- Success/warning/error feedback

### Supported themes

- `indonesia`, `dark`, `germany`, `ukraine`, `france`, `poland`, `us`, `eu`, `japan`, `brazil`, `china`, `india`, `mexico`, `southafrica`, `canada`, `uk`, `argentina`, `australia`, `russia`, `saudiarabia`, `southkorea`, `turkey`, `spain`, `italy`, `netherlands`, `belgium`, `sweden`, `norway`, `finland`, `denmark`, `switzerland`, `austria`, `ireland`, `portugal`, `czechia`, `greece`.

## Component Standards

- **Forms:** label-first, clear placeholders, validation messaging near field.
- **Tables:** selectable rows with batch actions and explicit state indicators.
- **Modals:** ESC and backdrop close for non-destructive flows; clear cancel/save labels.
- **Status chips/toasts:** use semantic severity (`info`, `success`, `warning`, `error`).

## Accessibility

- Keyboard navigability for all actionable controls.
- ARIA labels for icon-only and dynamic elements.
- Color is not the only status signal; include text/icon semantics.

## Localization Rules

- No hardcoded user-facing strings in runtime logic.
- All labels/placeholders/tooltips/errors use i18n keys.
- Manual locale pack updates are mandatory for new key introductions.
