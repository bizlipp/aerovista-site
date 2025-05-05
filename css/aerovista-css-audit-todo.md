# ✅ AeroVista CSS Audit – To-Do List

This document lists prioritized tasks based on the audit of your current CSS files (`styles.css`, `theme-classes.css`, `theme-variables.css`, `responsive-fixes.css`).

| Task | Category | Priority | Notes |
|------|----------|----------|-------|
| Normalize container widths and paddings across all breakpoints | Layout Consistency | High | Currently, several `.container` and `.section` blocks have inconsistent spacing, affecting alignment. |
| Consolidate repetitive utility classes into reusable mixins or Tailwind-like utilities | Optimization | High | Repeated `padding`, `margin`, `font` and `color` classes are scattered across files. |
| Align all theme colors to centralized CSS variables | Design System | High | `theme-variables.css` exists but some color values are hardcoded in `styles.css` and `theme-classes.css`. |
| Standardize button styles using shared classes | UI Consistency | Medium | Buttons vary in size, font, and background behavior across pages. |
| Audit responsive breakpoints in `responsive-fixes.css` | Responsiveness | High | Some styles apply too early or late. Confirm breakpoint tokens match desired device behavior. |
| Unify heading styles (`h1`–`h4`) and spacing | Typography | High | Headers are inconsistently sized and spaced across different pages. |
| Define a baseline `body` font size, line height, and margin/padding | Typography | Medium | Some text blocks are misaligned due to lack of default styles. |
| Review `.card`, `.glass`, `.grid` components for redundancy and simplify | Component Architecture | Medium | Several variants of these exist across files; should merge or unify. |
| Apply `:root` variables in `theme-variables.css` for all spacing and font tokens | Design System | Medium | Helps futureproof for theme switching and responsive scaling. |
| Merge redundant gradient styles across themes | Design Cleanup | Medium | Similar gradients used with different names. Can reduce repetition. |
| Add comments to major sections in `styles.css` | Maintenance | Low | Improves long-term maintainability. |
| Rename vague classes like `.alt`, `.section-alt`, `.pad-box` | Semantics | Low | Rename to descriptive terms for clarity and future team collaboration. |

