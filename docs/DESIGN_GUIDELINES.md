# Design Guidelines

**Product:** Working Hours Tracker  
**Last updated:** 2026-07-07  
**Primary surface:** `index.html` (inline CSS + `body[data-theme]`)

---

## 1. Design Principles

| Principle | Application |
|-----------|-------------|
| **Clarity over density** | Three-column layout: profile/entry | filters/entries | calendar/stats. Progressive disclosure via Basic/Advanced filters. |
| **Safety for destructive actions** | Delete profile/entries require confirmation modals with explicit counts. |
| **Speed for repetitive workflows** | Clock in/out, bulk entry, smart filter dropdowns, keyboard shortcuts in chart enlarge modals. |
| **Consistency across locales** | All strings via i18n keys; canonical data independent of display language. |
| **Theme as identity** | 36 country/region palettes; semantic tokens derived from core palette. |

---

## 2. Information Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Header: language, theme, internet/location status           │
├──────────────┬──────────────────────┬───────────────────────┤
│ Category 1   │ Category 2           │ Category 3            │
│ Profile      │ Filters + Entries    │ Calendar + Stats      │
│ Clock entry  │ table                │ box                   │
│ Bulk/voice   │ Export/import        │ Infographic entry     │
└──────────────┴──────────────────────┴───────────────────────┘
Modals: edit, delete, stats, infographic, PPT, profiles, help, voice review
```

**Priority hierarchy:** Active profile → entry operations → filtered data → analytics/export.

---

## 3. Design Token System

### 3.1 Core tokens (overridden per theme)

| Token | Purpose |
|-------|---------|
| `--bg` | Page background |
| `--surface` | Cards, panels, modals |
| `--border` | Dividers, inputs |
| `--text` | Primary text |
| `--muted` | Secondary text, hints |
| `--accent` | Primary actions, links, selection |
| `--accent-hover` | Hover state for accent |
| `--success` | Positive states, work status |
| `--warning` | Warnings, overtime highlights |

### 3.2 Semantic tokens (`:root`, inherit or reference core)

| Token | Purpose |
|-------|---------|
| `--status-work-bg` / `--status-work-pill-bg` | Work day status colors |
| `--status-sick-bg` / `--status-sick-pill-bg` | Sick day |
| `--status-holiday-bg` / `--status-holiday-pill-bg` | Holiday |
| `--status-vacation-bg` / `--status-vacation-pill-bg` | Vacation |
| `--entry-row-hover-bg` | Table row hover |
| `--entry-row-selected-bg` / `--entry-row-selected-border` | Selected rows |
| `--calendar-overtime-bar` | Overtime indicator on calendar |
| `--help-hover-bg` | Help button hover |
| `--focus-ring-strong` | Focus visibility |
| `--shadow-soft` / `--shadow-strong` | Elevation |
| `--chart-text` / `--chart-muted` / `--chart-grid` | Chart.js theming |
| `--chart-tooltip-bg` / `--chart-tooltip-border` | Chart tooltips |

---

## 4. Theme Catalog (36 themes)

Themes are applied via `body[data-theme="<id>"]` and persisted in `localStorage.workingHoursTheme`. Default: **`indonesia`**.

Each row lists the **8 core token overrides** (hex). Semantic status/chart tokens inherit from `:root` unless dark-theme component overrides apply.

| Theme ID | Display intent | `--bg` | `--surface` | `--border` | `--text` | `--muted` | `--accent` | `--accent-hover` | `--success` | `--warning` |
|----------|----------------|--------|-------------|------------|----------|-----------|------------|------------------|-------------|-------------|
| `indonesia` | Indonesia (default) | `#f3f4f6` | `#ffffff` | `#fecaca` | `#111827` | `#6b7280` | `#dc2626` | `#b91c1c` | `#16a34a` | `#ea580c` |
| `dark` | Dark mode | `#020617` | `#020617` | `#1f2937` | `#e5e7eb` | `#9ca3af` | `#22c55e` | `#16a34a` | `#22c55e` | `#facc15` |
| `germany` | Germany | `#111827` | `#020617` | `#facc15` | `#f9fafb` | `#cbd5f5` | `#f97316` | `#ea580c` | `#22c55e` | `#facc15` |
| `ukraine` | Ukraine | `#e0f2fe` | `#dbeafe` | `#60a5fa` | `#0f172a` | `#475569` | `#2563eb` | `#1d4ed8` | `#16a34a` | `#fbbf24` |
| `france` | France | `#e5e7eb` | `#f9fafb` | `#9ca3af` | `#020617` | `#4b5563` | `#1d4ed8` | `#1e3a8a` | `#16a34a` | `#eab308` |
| `poland` | Poland | `#ffffff` | `#f3f4f6` | `#fecaca` | `#111827` | `#4b5563` | `#c53030` | `#991b1b` | `#16a34a` | `#eab308` |
| `spain` | Spain | `#fef3c7` | `#ffffff` | `#fbbf24` | `#111827` | `#4b5563` | `#dc2626` | `#b91c1c` | `#16a34a` | `#f59e0b` |
| `italy` | Italy | `#ecfdf5` | `#ffffff` | `#6ee7b7` | `#111827` | `#047857` | `#16a34a` | `#15803d` | `#16a34a` | `#eab308` |
| `netherlands` | Netherlands | `#eff6ff` | `#ffffff` | `#93c5fd` | `#111827` | `#1d4ed8` | `#2563eb` | `#1d4ed8` | `#16a34a` | `#fbbf24` |
| `belgium` | Belgium | `#111827` | `#020617` | `#facc15` | `#f9fafb` | `#e5e7eb` | `#facc15` | `#eab308` | `#22c55e` | `#f97316` |
| `sweden` | Sweden | `#e0f2fe` | `#f9fafb` | `#60a5fa` | `#0f172a` | `#1d4ed8` | `#1d4ed8` | `#1e3a8a` | `#16a34a` | `#facc15` |
| `norway` | Norway | `#eff6ff` | `#ffffff` | `#fecaca` | `#111827` | `#4b5563` | `#b91c1c` | `#7f1d1d` | `#16a34a` | `#eab308` |
| `finland` | Finland | `#e5f0ff` | `#ffffff` | `#bfdbfe` | `#0f172a` | `#4b5563` | `#2563eb` | `#1d4ed8` | `#16a34a` | `#eab308` |
| `denmark` | Denmark | `#fef2f2` | `#ffffff` | `#fecaca` | `#111827` | `#4b5563` | `#dc2626` | `#b91c1c` | `#16a34a` | `#eab308` |
| `switzerland` | Switzerland | `#f9fafb` | `#ffffff` | `#fecaca` | `#111827` | `#4b5563` | `#dc2626` | `#b91c1c` | `#16a34a` | `#eab308` |
| `austria` | Austria | `#fef2f2` | `#ffffff` | `#fecaca` | `#111827` | `#4b5563` | `#dc2626` | `#b91c1c` | `#16a34a` | `#eab308` |
| `ireland` | Ireland | `#ecfdf5` | `#ffffff` | `#bbf7d0` | `#052e16` | `#166534` | `#16a34a` | `#15803d` | `#16a34a` | `#f97316` |
| `portugal` | Portugal | `#ecfdf3` | `#ffffff` | `#86efac` | `#052e16` | `#166534` | `#15803d` | `#166534` | `#16a34a` | `#f97316` |
| `czechia` | Czechia | `#eff6ff` | `#ffffff` | `#bfdbfe` | `#0f172a` | `#1d4ed8` | `#2563eb` | `#1d4ed8` | `#16a34a` | `#eab308` |
| `greece` | Greece | `#e0f2fe` | `#ffffff` | `#93c5fd` | `#0f172a` | `#1d4ed8` | `#1d4ed8` | `#1e3a8a` | `#16a34a` | `#eab308` |
| `us` | United States | `#020617` | `#020617` | `#1f2937` | `#e5e7eb` | `#9ca3af` | `#2563eb` | `#1d4ed8` | `#16a34a` | `#eab308` |
| `eu` | European Union | `#020617` | `#020617` | `#1d4ed8` | `#e5e7eb` | `#9ca3af` | `#facc15` | `#eab308` | `#22c55e` | `#f97316` |
| `uk` | United Kingdom | `#020617` | `#020617` | `#1f2937` | `#e5e7eb` | `#9ca3af` | `#1d4ed8` | `#1e40af` | `#16a34a` | `#eab308` |
| `japan` | Japan | `#f3f4f6` | `#ffffff` | `#e5e7eb` | `#111827` | `#6b7280` | `#b91c1c` | `#991b1b` | `#16a34a` | `#eab308` |
| `china` | China | `#f3f4f6` | `#ffffff` | `#e5e7eb` | `#111827` | `#4b5563` | `#dc2626` | `#b91c1c` | `#16a34a` | `#facc15` |
| `india` | India | `#f3f4f6` | `#ffffff` | `#e5e7eb` | `#111827` | `#6b7280` | `#ea580c` | `#c2410c` | `#16a34a` | `#facc15` |
| `brazil` | Brazil | `#f3f4f6` | `#ffffff` | `#e5e7eb` | `#111827` | `#6b7280` | `#16a34a` | `#15803d` | `#16a34a` | `#facc15` |
| `mexico` | Mexico | `#f3f4f6` | `#ffffff` | `#e5e7eb` | `#111827` | `#6b7280` | `#16a34a` | `#15803d` | `#16a34a` | `#f97316` |
| `canada` | Canada | `#f3f4f6` | `#ffffff` | `#e5e7eb` | `#111827` | `#4b5563` | `#dc2626` | `#b91c1c` | `#16a34a` | `#eab308` |
| `argentina` | Argentina | `#f3f4f6` | `#ffffff` | `#e5e7eb` | `#0f172a` | `#475569` | `#38bdf8` | `#0ea5e9` | `#16a34a` | `#fbbf24` |
| `australia` | Australia | `#020617` | `#020617` | `#1d4ed8` | `#e5e7eb` | `#9ca3af` | `#1d4ed8` | `#1e40af` | `#22c55e` | `#facc15` |
| `russia` | Russia | `#f3f4f6` | `#ffffff` | `#e5e7eb` | `#020617` | `#4b5563` | `#2563eb` | `#1d4ed8` | `#16a34a` | `#eab308` |
| `saudiarabia` | Saudi Arabia | `#022c22` | `#03271c` | `#16a34a` | `#ecfdf5` | `#bbf7d0` | `#16a34a` | `#15803d` | `#16a34a` | `#facc15` |
| `southkorea` | South Korea | `#f3f4f6` | `#ffffff` | `#e5e7eb` | `#111827` | `#6b7280` | `#2563eb` | `#1d4ed8` | `#16a34a` | `#e11d48` |
| `turkey` | Turkey | `#fef2f2` | `#ffffff` | `#fecaca` | `#111827` | `#4b5563` | `#dc2626` | `#b91c1c` | `#16a34a` | `#eab308` |
| `southafrica` | South Africa | `#0b1120` | `#020617` | `#16a34a` | `#e5e7eb` | `#9ca3af` | `#16a34a` | `#15803d` | `#16a34a` | `#facc15` |

### 4.1 Dark theme component overrides

`body[data-theme="dark"]` includes additional overrides for entries query bar, selection summary, PPT modal panel, and stats chart blocks to preserve contrast on near-black surfaces.

---

## 5. Component Guidelines

### 5.1 Buttons

| Class pattern | Use |
|---------------|-----|
| `.btn`, `.btn--primary` | Primary actions (save, export) |
| `.btn--secondary` | Cancel, secondary |
| `.btn-profile` | Profile toolbar actions |
| `.btn-profile--danger` | Delete profile |

Minimum touch target: comfortable padding; profile buttons use icon + label pattern.

### 5.2 Forms

- Every input has visible `<label>` or `aria-label`.
- Break fields: numeric input + unit select (`minutes` / `hours`) with synced max limits.
- Non-work status locks location to `Anywhere` and may readonly time fields.
- Duplicate-date hints appear below date inputs (single and bulk).

### 5.3 Modals

- Overlay + panel; `open` class toggles visibility.
- Close via X, Cancel, or Escape where bound.
- Destructive confirmations state item count and irreversibility.

### 5.4 Tables (entries)

- Sticky header in scroll region.
- Sortable columns via `th[data-sort]`.
- Status shown as colored pill with icon.
- Duration column combines net time + overtime badge (`+N OT`).

### 5.5 Toasts

- Container: `#toastContainer`
- Types: `info`, `warning`, `success` (class `toast--*`)
- Auto-dismiss ~4s; falls back to `alert` if container missing.

### 5.6 Charts (Stats Summary)

- Chart.js with theme-aware `--chart-*` tokens.
- Enlarge modal supports arrow keys and prev/next navigation.

### 5.7 Smart selects

- Typeahead filter dropdowns for year/week and timezone lists (`smart-select.js`).

### 5.7 Save/sync status badge

- Element: `#saveDataStatus` (`.save-data-status`)
- States via `data-sync-status-kind`: `saving`, `saved`, `retry`, `error`, `queued`, `pending`
- CSS modifiers: `.save-data-status--saving`, `--saved`, `--retry`, `--error`
- Text from `sync.*` i18n keys; persists key in `data-sync-status-key` for language refresh
- `aria-live="polite"` when active

---

## 6. Typography and Spacing

- System font stack via CSS (sans-serif).
- Layout: full-width on wide monitors (no 1400px cap).
- Three-column flex layout ≥961px; stacks on smaller viewports.
- Column bottom edges synced on desktop via `syncMainSectionsBottomEdge`.

---

## 7. Accessibility Standards

| Requirement | Implementation |
|-------------|----------------|
| Contrast | Theme tokens chosen for AA on text/background pairs |
| Keyboard | Modal focus; stats/infographic enlarge arrow keys |
| Screen readers | `aria-label` on icon buttons, status pills, internet/location badges |
| Focus | `--focus-ring-strong` on interactive elements |
| Motion | Transitions subtle; no required motion for comprehension |

---

## 8. Localization UI Rules

1. **No hardcoded user-facing strings** in new features—add keys to `i18n.js` and manual locale packs.
2. **Dates in UI** may be localized; storage remains `YYYY-MM-DD`.
3. **Numbers** use `formatDisplayNumber` where provided for locale-aware grouping.
4. **RTL** (Arabic): layout should be verified manually; locale pack exists (`ar`).
5. On language change, `refreshDynamicTranslations` re-renders heavy sections.

---

## 9. Status and Location Visual Language

| dayStatus | Pill color token | Icon semantics |
|-----------|------------------|----------------|
| `work` | `--status-work-*` | Briefcase / work |
| `sick` | `--status-sick-*` | Medical |
| `holiday` | `--status-holiday-*` | Celebration |
| `vacation` | `--status-vacation-*` | Travel/leisure |

| location | Label (i18n) | Icon |
|----------|--------------|------|
| `WFO` | Office | Building |
| `WFH` | Home | House |
| `Anywhere` | Anywhere | Globe |

---

## 10. Adding a New Theme (checklist)

1. Add theme id to `W.applyTheme` allowlist in `init.js`.
2. Add `<option>` to `#themeSelect` in `index.html`.
3. Add `body[data-theme="newid"] { --bg: ...; ... }` block with 8 core tokens.
4. Verify contrast on entries table, modals, and charts.
5. Update this document’s theme table and `CHANGELOG.md`.

---

## 11. Related Documents

- `VARIABLES.md` — `workingHoursTheme` storage key
- `TECHNICAL_GUIDELINES.md` — implementation conventions
- `GUARDRAILS.md` — performance and quality limits
