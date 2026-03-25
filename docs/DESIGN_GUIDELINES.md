# Design Guidelines

## 1. Design Principles

- **Clarity first**: users should understand current status and next action immediately.
- **Consistency over novelty**: similar interactions must look and behave similarly.
- **Fluid by default**: components must adapt gracefully across breakpoints.
- **Data readability**: values and labels should remain legible in dense views.

## 2. Layout System

- Three primary columns/sections:
  - Profile + Clock & Entry
  - Filters + Entries
  - Calendar + Statistics
- Desktop supports multi-column layout; tablet/mobile progressively stack and reflow.
- Avoid rigid widths that cause clipping; prefer fluid `minmax`, wrapping, and `min-width: 0`.

## 3. Responsive Standards

- Validate behavior at major ranges: ultra-wide desktop, desktop, laptop, tablet, large mobile, small mobile.
- Critical controls (save, filters, navigation) must remain visible and reachable.
- Modals must support internal scroll and fullscreen states without hidden actions.

## 4. Typography and Density

- Prioritize readable labels and values over decorative text.
- Use compact formatting for cards where space is constrained.
- Provide full-value tooltip context where compact numbers are used.

## 5. Color and Theme Guidance

Use semantic palettes through CSS variables and keep contrast accessible.

### 5.1 Light Theme Baseline
- Background: neutral light surface
- Card background: elevated neutral-white surface
- Text primary: dark neutral
- Text secondary: medium neutral
- Accent primary: brand blue family
- Positive/status: green family
- Warning: amber family
- Error: red family

### 5.2 Dark Theme Baseline
- Background: deep neutral
- Card background: layered dark surface
- Text primary: near-white
- Text secondary: muted gray
- Accent primary: brighter blue tint
- Positive/status: softened green tint
- Warning: amber tint
- Error: red tint

### 5.3 Status and Indicator Colors
- Internet status icon and location status icon must remain visually distinguishable.
- Day-status indicators (`work`, `vacation`, `holiday`, `sick`) must use stable semantic colors across cards, calendar, and legend.

## 6. Component Standards

### Buttons
- Keep button hierarchy clear (primary, secondary, tertiary).
- Match action-row spacing rhythm across profile, filters, and entry sections.
- In ultra-wide layouts, keep related actions in one row when space allows.

### Cards
- Use consistent spacing, border radius, and icon sizing for data cards.
- Do not force fixed heights that create dead space unless explicitly required.

### Forms
- Keep labels concise and aligned.
- Maintain constant bottom padding for sticky action rows in entry flows.
- Ensure textarea growth does not hide submit actions.

### Tables
- Preserve horizontal readability with controlled scroll behavior.
- Header and row spacing should support scanning without visual clutter.

### Tooltips
- Use concise, complete context.
- Prefer multiline content for full-value summaries.
- Prefer custom tooltip components over native `title` attributes for critical, multiline, and responsive content.
- If using custom tooltips, ensure:
  - Multiline text is readable (`white-space: pre-wrap` or equivalent).
  - Word breaking is enabled on narrow viewports (`overflow-wrap:anywhere`, `word-break:break-word`).
  - Tooltip positioning never hides critical UI.
  - Tooltip content is accessible via `aria-label`/`role="tooltip"`.

### Statistics Tooltips (Implementation Guidance)
- Statistics cards use a custom floating tooltip container (`.stats-custom-tooltip`) and `data-stats-tooltip` payloads to show detailed, multiline information.
- Do not add new `title="..."` tooltip attributes to the Statistics section; it can cause duplicate native tooltips and inconsistent user experience.
- Weekday icon labels in "Days by type" must use localized weekday abbreviations from `calendarStats.weekdaysShort` so the UI stays consistent across all manual language packs.
- Tooltip visual styling targets a dark translucent surface for readability:
  - Background: `rgba(15, 23, 42, 0.96)`
  - Border: `rgba(148, 163, 184, 0.35)`
  - Text: `#f8fafc`
  - Responsive sizing: `max-width: min(440px, calc(100vw - 2rem))` and scroll-limited `max-height`.

## 7. Accessibility Expectations

- Keyboard navigability for core controls and modals.
- Color contrast should satisfy practical readability in both themes.
- Screen-reader labels for icon-only controls and informational indicators.

## 8. UX QA Checklist

- No clipped control labels at supported breakpoints.
- No overlapping controls when sections wrap.
- Modals remain actionable in narrow widths.
- Statistics and infographic content remains readable and scrollable.
