# Design Guidelines

## 1. Design Principles

- Clarity over density.
- Safety for irreversible actions.
- Speed for repetitive workflows.
- Consistency across views and locales.

## 2. Information Architecture

- Top-level navigation: Profile, Entries, Analytics, Exports, Settings.
- Priority hierarchy: active profile state > entry operations > analytics.

## 3. Color and Theme Palette

### Light Theme

- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Primary: `#2563EB`
- Accent: `#0EA5E9`
- Success: `#16A34A`
- Warning: `#D97706`
- Danger: `#DC2626`
- Text Primary: `#0F172A`
- Text Secondary: `#334155`

### Dark Theme

- Background: `#0B1220`
- Surface: `#111827`
- Primary: `#60A5FA`
- Accent: `#22D3EE`
- Success: `#4ADE80`
- Warning: `#F59E0B`
- Danger: `#F87171`
- Text Primary: `#E5E7EB`
- Text Secondary: `#94A3B8`

## 4. Component Guidelines

- **Forms:** always show labels and validation hints.
- **Modals:** destructive actions require clear labels and explicit confirmation.
- **Tables:** keep column headers stable and sortable where meaningful.
- **Toasts:** concise, contextual, and non-blocking.

## 5. Accessibility Standards

- Minimum AA contrast for text and controls.
- Keyboard accessibility for core actions and modals.
- Clearly visible focus states and error states.

## 6. Localization Rules

- All user-facing strings are key-based.
- No new hardcoded strings in feature merges.
- Date/time labels should respect locale while preserving canonical storage format.
