# Design Guidelines

## Design Principles

- Clarity first
- Safe editing patterns
- Fast data entry
- Consistent component behavior
- Localization-first UX

## Layout Model

1. Profile + Entry controls
2. Filters + Entries
3. Calendar + Statistics

## Component Standards

- Forms: explicit labels, clear validation, safe defaults.
- Modals: clear hierarchy (title/context/actions), predictable close behavior.
- Tables: explicit selection state, protected batch actions.
- Feedback: semantic toast/status usage (`info/success/warning/error`).

## Theme Guidelines

Theme is controlled by `body[data-theme]` and supports:

`indonesia`, `dark`, `germany`, `ukraine`, `france`, `poland`, `us`, `eu`, `japan`, `brazil`, `china`, `india`, `mexico`, `southafrica`, `canada`, `uk`, `argentina`, `australia`, `russia`, `saudiarabia`, `southkorea`, `turkey`, `spain`, `italy`, `netherlands`, `belgium`, `sweden`, `norway`, `finland`, `denmark`, `switzerland`, `austria`, `ireland`, `portugal`, `czechia`, `greece`.

Use semantic color intent for:

- Primary action
- Secondary action
- Surface/background
- Text hierarchy
- State messaging (success/warning/error)

## Accessibility Requirements

- Keyboard support for interactive controls
- ARIA for icon-only/dynamic elements
- Non-color-only state indicators

## Localization Rules

- No hardcoded user-facing text
- All labels/errors/tooltips via i18n keys
- Manual locale pack updates required for all new features
