# Button Design Guidelines (Material Design 3 State Layers)

This document defines the global style guidelines for interactive buttons and state layers across the workspace, based on Material Design 3 guidelines.

## Button Variants
1. **Text Buttons**: No background fill, no outline. Used for low-emphasis actions.
2. **Outlined Buttons**: Border outline (`border border-outline-variant/40`), transparent background. Used for medium-emphasis actions.
3. **Filled Buttons**: Opaque container fill (e.g., `#1A73E8` Google Blue in light mode, `#8AB4F8` in dark mode). Used for high-emphasis actions.

## State Layers & Opacities
State layers are semi-transparent overlays of the text/icon color (or selection color) rendered on top of the button container to communicate interactive states:

| Interactive State | State Layer Opacity | Tailwind CSS / CSS Implementation |
|---|---|---|
| **Enabled** | Base state | Standard text/container colors |
| **Hovered** | `+8%` opacity overlay | `.hover-state-layer:hover::before` or `bg-current/8` overlay |
| **Focused** | `+10%` opacity overlay | `.focus-state-layer:focus-visible::before` or `bg-current/10` overlay |
| **Pressed** | `+10%` opacity overlay | Active clicked state. Can be implemented as `active:bg-current/10` overlay or a custom radial ripple. |
| **Dragged** | `+16%` opacity overlay | Dragging state. |
| **Disabled** | `38%` container & text opacity | `opacity-38 pointer-events-none` |

## Key Specifications & Implementation Notes
* **Google Brand Buttons**: When displaying brand actions (e.g., "Google Dig" actions), align the multi-color Google logo vertically with the text and maintain equal spacing.
* **Opaque Backgrounds**: Ensure buttons floating on top of scrollable elements are fully opaque (e.g., `bg-white dark:bg-[#121115]`) in both normal and hovered states to prevent overlapping content from showing through.
* **Interactive Borders**: Outline borders should adapt to focus states (e.g., showing a clear focus ring `ring-2 ring-primary/20` when focused).

---

# Official Google Material Web Components (@material/web) Guidelines

This workspace includes the official `@material/web` component library. Future agents (including Codex) MUST use these components to build styled, accessible forms, inputs, and controls rather than creating custom elements or styling alternatives.

## Location of Resources
* **Developer/AI Integration Guide**: Full documentation of component tags, styling custom properties, event handling, and custom React 19 examples is located in [MATERIAL_WEB_GUIDE.md](file:///Users/richardvasko/edq-dash/MATERIAL_WEB_GUIDE.md).
* **TypeScript Types**: React JSX declarations for all `@material/web` custom elements are located in [src/types/material-web.d.ts](file:///Users/richardvasko/edq-dash/src/types/material-web.d.ts). Adding new components requires registering them here.
* **Global Theming**: Automatically mapped to the project's Tailwind v4 variables inside the `:root` rule in [src/index.css](file:///Users/richardvasko/edq-dash/src/index.css).

---

# Workspace Target

* **CURRENT WORKSPACE RULE**: Make EDQ dashboard changes directly in `/Users/richardvasko/edq-dash`. The prototyping directory `/Users/richardvasko/edq-dash-material` is now deprecated and should not be used.
* When the user asks to sync between workspaces, sync only the files they name. Do not broadly copy folders or unrelated source files.

---

# Typography & Text Casing

* **NO UPPERCASE TEXT**: Never use `text-transform: uppercase`, `uppercase` (Tailwind), or `tracking-wide` to create all-caps labels anywhere in the app. All labels, pills, badges, buttons, and UI text must render in their natural title-case or sentence-case form (e.g. "In Progress", "Open", "Closed" — never "IN PROGRESS", "OPEN", "CLOSED").
* This rule applies globally across both workspaces (`edq-dash` and `edq-dash-material`).
