---
name: css-standards
description: Enforce reusable, brand-aware CSS architecture for public web apps by owning shared tokens in a common stylesheet, importing page entrypoints first, keeping component partials scoped, and using consistent media-query and color-token conventions.
---

# CSS Standards

Use this skill when a frontend project needs a consistent, maintainable CSS architecture for shared tokens, page entry styles, component partials, and brand-driven visual language.

## Scope

- Applies to styles under `web/src/css/`.
- Applies to class names used in `web/view/*.html`.
- Applies to browser components that toggle visual state from `web/src/js/components/`.

## Visual Direction

- Prefer a warm, readable public app appearance over a generic admin-style theme.
- Keep hero sections, event/showcase layouts, and modal/profile surfaces visually consistent.
- Preserve existing brand cues and palette tokens rather than introducing a new theme.
- Avoid migrating the site toward a different source project's palette or generic admin UI language.

## Typography and Icons

- Define default fonts and icon imports in the shared `tokens.css` file.
- Do not add new font or icon imports inside leaf CSS files.
- Reserve special accent typefaces for the cases the UI already uses, not for arbitrary styling.
- Prefer a single shared icon system for the app. Keep icon styling tied to the package-provided CSS variables or documented API instead of version-pinned font-family names.
- Keep visible labels alongside icons in buttons, chips, cards, links, and modal actions unless the control is already clearly labeled for accessibility.

## Responsive Rules

- CSS must be mobile first: define the base layout for `0px` first, then enhance it with `min-width` media queries.
- Do not use `max-width` breakpoints unless the user explicitly asks for them.
- Use this default breakpoint scale:
  - `Base`: `0`
  - `sm`: `640px`
  - `md`: `768px`
  - `lg`: `1024px`
  - `xl`: `1280px`
  - `2xl`: `1536px`
- Keep responsive overrides close to the selectors they modify rather than moving them to a detached responsive section.
- When a repository already has its own documented breakpoint contract, follow that local rule instead of introducing a competing scale.
- On phone layouts, prefer flush section shells when they improve readability: outer wrappers may drop to `padding: 0`, large sections/panels/modals may tighten to a smaller radius, and the breathing room should move into inner headers, bodies, facts, and action rows instead of staying on the outer shell.
- Restore the roomier framed-card treatment at the first upward breakpoint used by the project rather than preserving desktop gutters on narrow screens.

## Core Rules

1. `web/src/css/tokens.css` owns shared CSS variables, font imports, and global browser chrome such as scrollbar styling.
2. Page CSS entry files should import `./tokens.css` first, then the component partials they need.
3. Reuse existing shared color tokens from `web/src/css/tokens.css` instead of hardcoding duplicate palette values.
4. Use `var(--token)` for pure shared colors.
5. Use `rgb(from var(--token) r g b / alpha)` when a shared color needs opacity.
6. Use `color-mix(...)` or another standards-compliant blend only when the result is not a pure shared color.
7. Prefer consistent plain-CSS media queries using `min-width` and the shared breakpoint scale: `640px`, `768px`, `1024px`, `1280px`, `1536px`.
8. Keep page entry files as composition layers: imports first, then only page-level layout and one-off scaffolding.
9. Shared structural shells should live in reusable classes such as `.surface-host` and `.surface-card`, or equivalent project naming, rather than being re-declared inside every semantic component selector.
10. Each reusable UI component should own its style file. If a page entry starts carrying multiple component roots, extract them instead of extending the entry file.
11. If a page-specific component is only a contextual variant of a reusable component, keep the shared visual primitive in the reusable component file and limit the page-specific file to contextual overrides and container-specific states.
12. If multiple page-scoped components share the same visual primitive and there is no reusable base component yet, extract a small shared partial or shared structural class instead of duplicating rules or pushing them back into the entry file.
13. Prefer multiple classes on the same element when structure and meaning are different concerns: semantic classes for purpose and JS hooks, structural classes for reusable shells and spacing contracts. Do not use `data-*` attributes. Never store domain data (IDs, values, lookup mappings) in data attributes — that data belongs in JavaScript structures resolved at interaction time.
14. Prefer nested selectors within each component file so styles stay colocated and scoped.
15. Keep responsive overrides in the same component file as the base styles they modify.
16. Keep component styles in their existing partials such as `modal.css`, `menu.css`, `toast.css`, etc., rather than creating new ones for one-off treatments. If a new reusable visual primitive emerges, give it its own CSS partial instead of burying it in an unrelated page file.
17. Prefer CSS class toggles over inline styles. Dynamic asset URLs or one-off image backgrounds are the exception, not the default.
18. Keep interactions visually controlled: subtle lift, border shifts, and shadow changes are usually better than aggressive transforms or high-contrast effects.

## Structural Classes

- Separate semantic classes from structural classes whenever a project has repeated shells.
- Semantic classes should answer what the element is in the product: `.panel`, `.profile-card`, `.settings-section`, `.feature-grid`.
- Structural classes should answer what reusable shell pattern it uses: `.surface-host`, `.surface-card`, `.surface-subtle`, or whatever equivalent naming the project already uses.
- Prefer adding a structural class in markup over inventing a new selector that only restates border, radius, background, shadow, and base padding.
- Keep the structural class layer small. This is not a license to turn the project into utility-class soup.
- When HTML is generated from JavaScript, include the structural class in the generated `className` so client-rendered elements follow the same visual contract as server-rendered markup.

## Guardrails

- Do not import a new design system or generic admin theme.
- Do not migrate the visual language toward a source project's unrelated palette.
- Do not add dark-mode-only treatments unless explicitly requested.
- Do not mix `max-width` and `min-width` strategies in the same stylesheet by default.
- Do not introduce alternate icon systems or ad hoc glyph conventions when the project already has a shared icon setup.
- Do not hardcode palette colors, fonts, radii, or shadows in component files when an existing shared token already covers the need.
- Keep hover, focus, and error states readable against the existing brand colors.
- Do not force desktop-style floating card shells on phones when a flatter flush section or sheet reads better.

## Review Checklist

- Does the page entry file stay slim and act as composition instead of owning leaf component blocks?
- Does the change reuse `tokens.css` tokens and shared globals?
- Do pure colors use `var(--token)`, alpha variants `rgb(from var(--token) r g b / alpha)`, and non-pure blends `color-mix(...)`?
- Does the style live in the correct page or component CSS file?
- Are nested selectors used for component internals and states where that matches the project’s CSS style?
- Are responsive rules mobile first and limited to `min-width` queries with the shared breakpoint scale?
- Do responsive overrides stay colocated with the component they modify?
- On phones, do outer shells use the available width efficiently, with breathing room pushed inward instead of trapped in desktop wrapper padding?
- Do icon treatments follow the shared icon setup instead of introducing a second icon system or version-pinned font-family names?
- Are new visual states driven by classes rather than DOM style mutation?
- Does the result still feel like the existing site rather than a new theme?

## References

- Read `references/css-standards.md` for the generic rules.
- Read `references/mini-project/` for a small starter CSS structure.
