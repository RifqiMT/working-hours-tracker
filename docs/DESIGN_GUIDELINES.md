# Design Guidelines

**Purpose:** Define UX and UI standards—layout, responsive behavior, components, color and theme usage, and modal patterns—for Working Hours Tracker.

**Current state:** Guidelines cover the three-column shell, statistics tooltips, analytics modal envelopes, Infographic layout, named `body[data-theme]` palettes, and accessibility expectations.

**Operational guidance:** New UI must use **CSS custom properties** (`var(--accent)`, `var(--surface)`, and so on) rather than hard-coded hex values except in the theme definition block in `index.html`.

**Change notes:** Theme or modal envelope changes require updates here and in `CHANGELOG.md`.

---

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

### 5.4 Global semantic tokens (`:root`)

These tokens are defined in `index.html` and overridden per theme. Components should reference tokens, not raw palette guesses.

| Token | Role |
|-------|------|
| `--bg` | Page background |
| `--surface` | Card and panel surfaces |
| `--border` | Borders and dividers |
| `--text` | Primary text |
| `--muted` | Secondary / helper text |
| `--accent` | Primary actions, key highlights |
| `--accent-hover` | Hover / active emphasis |
| `--success` | Positive / OK states |
| `--warning` | Caution states |
| `--status-*-bg`, `--status-*-pill-bg` | Day-status tints in calendar and chips |
| `--entry-row-hover-bg`, `--entry-row-selected-bg` | Table interaction |
| `--chart-text`, `--chart-muted`, `--chart-grid`, `--chart-tooltip-*` | Chart.js surfaces |
| `--shadow-soft`, `--shadow-strong` | Elevation |

### 5.5 Named themes (`body[data-theme="…"]`)

Themes swap `--bg`, `--surface`, `--border`, `--text`, `--muted`, `--accent`, `--accent-hover`, and usually `--success` / `--warning`. Below: **theme key** (attribute value), **intent**, and **primary accent** users perceive.

| Theme key | Design intent | Primary accent (reference) |
|-----------|---------------|----------------------------|
| *(default / `:root`)* | Indonesia Merah Putih baseline | `#CE1126` |
| `indonesia` | Soft neutral shell, red accent | `#dc2626` |
| `dark` | Dark shell, high-contrast green accent | `#22c55e` |
| `germany` | Charcoal + gold border, warm orange accent | `#f97316` |
| `ukraine` | Pale blue surfaces, strong blue accent | `#2563eb` |
| `france` | Cool grey-blue, royal blue accent | `#1d4ed8` |
| `poland` | White / grey, deep red accent | `#c53030` |
| `us` | Navy dark, star-field blue accent | `#2563eb` |
| `eu` | Deep blue shell, gold accent | `#facc15` |
| `japan` | Minimal light, hinomaru red accent | `#b91c1c` |
| `brazil` | Light neutral, national green accent | `#16a34a` |
| `china` | Light neutral, flag red accent | `#dc2626` |
| `india` | Light neutral, saffron accent | `#ea580c` |
| `mexico` | Light neutral, flag green accent | `#16a34a` |
| `southafrica` | Dark shell, green accent | `#16a34a` |
| `canada` | Light neutral, maple red accent | `#dc2626` |
| `uk` | Dark navy shell, union blue accent | `#1d4ed8` |
| `argentina` | Light neutral, sky-blue accent | `#38bdf8` |
| `australia` | Dark shell, ensign blue accent | `#1d4ed8` |
| `russia` | Light neutral, flag blue accent | `#2563eb` |
| `saudiarabia` | Deep green shell, green accent | `#16a34a` |
| `southkorea` | Light neutral, taegeuk blue accent | `#2563eb` |
| `turkey` | Soft red-tinted shell, red accent | `#dc2626` |
| `spain` | Warm yellow tint, red accent | `#dc2626` |
| `italy` | Soft green tint, green accent | `#16a34a` |
| `netherlands` | Pale blue tint, blue accent | `#2563eb` |
| `belgium` | Dark shell, gold accent | `#facc15` |
| `sweden` | Blue-tinted light, blue accent | `#1d4ed8` |
| `norway` | Pale blue / white, deep red accent | `#b91c1c` |
| `finland` | Cool blue-white, blue accent | `#2563eb` |
| `denmark` | Soft red-tinted white, red accent | `#dc2626` |
| `switzerland` | Neutral white/grey, red accent | `#dc2626` |
| `austria` | Soft red-tinted white, red accent | `#dc2626` |
| `ireland` | Soft green tint, green accent | `#16a34a` |
| `portugal` | Soft green tint, deep green accent | `#15803d` |
| `czechia` | Pale blue-white, blue accent | `#2563eb` |
| `greece` | Aegean blue-white, blue accent | `#1d4ed8` |

**Implementation note:** Hex values above are **documentation references** copied from `index.html`; the source of truth is always the stylesheet in the repo.

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
- Structure dense tooltip content into readable groups:
  - Title row
  - Section headers (for location/weekday blocks)
  - Indented detail lines for subgroup breakdowns
- Tooltip visual styling targets a dark translucent surface for readability:
  - Background: dark translucent gradient (`rgba(15,23,42,0.97)` family)
  - Border: subtle slate alpha border
  - Text: `#f8fafc`
  - Responsive sizing: `max-width` constrained to viewport, scroll-limited `max-height`, and smooth motion with reduced-motion fallback.

### Modal Sizing Consistency (Analytics + Reporting)
- Statistics Summary, Infographic, and PPT generator modals must share the same dynamic viewport envelope to reduce context-switch friction.
- Use consistent sizing targets:
  - Width envelope near `1120px` max with safe-area-aware viewport constraints.
  - Height envelope near `92vh/92dvh` with internal body scroll.
- Modal content should remain actionable with no clipped controls at mobile breakpoints.

### Infographic Modal (Clusters, Timeframe, Tables)
- **Toolbar**: Category buttons (`.infographic-category-bar`, `#infographicCategoryBar`) switch between panel containers (`#infographicSummaryPanel`, `#infographicVacationPanel`, `#infographicWorkPanel`, `#infographicClockPanel`, `#infographicLocationPanel`). Only one panel is visible at a time.
- **Timeframe**: Label and select live in `#infographicTimeframeWrap` with class `infographic-timeframe-wrap`. They drive re-aggregation for weekday-centric data. Options map to i18n keys under `infographic.timeframe.*`. **Visibility rule:** the entire wrap uses `.is-hidden` (and `display: none`) plus the `hidden` attribute when the active cluster is **General** or **Vacation**; it is shown for **Weekdays**, **Clock In & Clock Out**, and **Details**. The `<select>` is `disabled` when hidden; when visible, restore `aria-label` from the localized timeframe label.
- **Clock cluster**: Wrapper `#infographicClockPanel` with child `.infographic-clock-grid`. At desktop, use **three columns** and **two rows** so reading order is: **earliest clock in**, **latest clock in**, **average clock in**, then **earliest clock out**, **latest clock out**, **average clock out**. At `max-width: 1024px` the grid may drop to two columns; at `640px` to one column—verify readability after reflow.
- **Scrollable timeframe tables**: Wrapper class `infographic-table-wrap--timeframe-scroll` sets a capped viewport height (`max-height: min(52vh, 22rem)`), enables vertical scroll, and makes `thead th` **sticky** with `background: var(--bg)` and a bottom border shadow so headers remain visible while scrolling long period histories.
- **Headings**: Section titles use `.infographic-heading` with `text-transform: none` inside the infographic modal so titles read as full phrases, not forced uppercase.

## 7. Accessibility Expectations

- Keyboard navigability for core controls and modals.
- Color contrast should satisfy practical readability in both themes.
- Screen-reader labels for icon-only controls and informational indicators.

## 8. UX QA Checklist

- No clipped control labels at supported breakpoints.
- No overlapping controls when sections wrap.
- Modals remain actionable in narrow widths.
- Statistics and infographic content remains readable and scrollable.
