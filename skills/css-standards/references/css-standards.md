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

## Responsive Strategy

- Write the base layout first.
- Add media queries close to the owning selectors.
- Use a mobile-first flow: base rules at `0`, then `@media (min-width: 640px)`, `768px`, `1024px`, `1280px`, and `1536px` as needed.
- Avoid `max-width` breakpoints unless the user explicitly asks for them.
- Avoid one large responsive override section disconnected from the component structure.

## Bootstrap

- Start from `references/mini-project/web/src/css/tokens.css`.
- Compose page styles by importing shared component styles.
- Add one shared structural partial early when the UI clearly has repeated host/card shells.
