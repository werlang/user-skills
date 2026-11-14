# CSS Standards Reference

This reference captures a generic CSS organization meant for reuse across projects.

## File Organization

```text
web/src/css/
  tokens.css
  home.css
  card.css
  modal.css
```

## Required Practices

- Put shared tokens in `tokens.css`.
- Use page files as composition roots.
- Keep reusable visuals in their own component files.
- Use semantic selectors for page sections and reusable blocks.
- When the same shell pattern appears across multiple components, separate structure from meaning.
- Prefer a small shared structural layer such as `.surface-host`, `.surface-card`, and `.surface-subtle` over repeating border, radius, shadow, background, and base padding in many component selectors.
- Prefer multiple classes on one element when that avoids inventing new names for the same shell pattern.
- Keep semantic classes responsible for internals, states, and product meaning; keep structural classes responsible for reusable surface behavior.
- Keep transitions, colors, and spacing consistent.

## Selector Nesting

- Prefer native CSS nesting for a component's internals, pseudo-elements, states, and descendants. Keep the component root as the outer rule.
- Use `&` when the nested selector targets the same element: `&:hover`, `&:focus-visible`, `&::backdrop`, `&[open]`, `&[hidden]`, or `&.is-active`.
- Always nest `&[hidden] { display: none; }` inside component rules that define explicit `display` properties (or use higher hierarchy `[hidden]` selectors) so `[hidden]` overrides `display: flex/grid/block` without needing `!important`.
- Use a bare nested selector for a descendant: `.modal-dialog {}` inside `.modal {}` means `.modal .modal-dialog`.
- Nest a state inside the element it modifies, such as `.modal-close { &:hover { ... } }`.
- Keep nesting shallow and do not nest unrelated component roots. Global rules, shared structural classes, and independently reusable component roots can remain flat.

```css
.modal {
    /* Root styles */

    &::backdrop {
        /* Pseudo-element of .modal */
    }

    .modal-dialog {
        /* Descendant owned by .modal */
    }

    .modal-close {
        /* Descendant owned by .modal */

        &:hover {
            /* State of .modal-close */
        }
    }
}
```

## Responsive Strategy

- Write the base layout first.
- Add media queries close to the owning selectors.
- Use a mobile-first flow: base rules at `0`, then `@media (min-width: 640px)`, `768px`, `1024px`, `1280px`, and `1536px` as needed.
- Avoid `max-width` breakpoints unless the user explicitly asks for them.
- Avoid one large responsive override section disconnected from the component structure.
- Media queries drive page layout; reusable components use `@container` queries against their own host width.
- Full-height shells use `dvh` (or `svh`/`lvh`), not `vh`.

## Platform Defaults

- Declare `color-scheme` on `:root` in `tokens.css` (`light` for a single-theme app; `light dark` plus `light-dark()` tokens for a dual-theme app).
- Gate `scroll-behavior: smooth` and non-essential motion behind `@media (prefers-reduced-motion: no-preference)`.
- In a new tree, declare `@layer` order once in the page entry and import partials into layers; never layer only part of an existing unlayered tree.
- Use `:where()` for low-priority defaults, logical properties where values should flip in right-to-left text, and `overflow: clip` when only clipping.
- The browser-support target is a project decision; see the Modern Platform Defaults section in `../SKILL.md`.

## Bootstrap

- Start from `references/mini-project/web/src/css/tokens.css`; `home.css` shows the layered import pattern and `components/card.css` a container-query component.
- Compose page styles by importing shared component styles.
- Add one shared structural partial early when the UI clearly has repeated host/card shells.
