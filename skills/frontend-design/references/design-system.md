# Project Design Systems

Design work happens inside whatever design system the project already has. This
reference is the decision tree for finding it, using it, creating it from the
project's existing elements, and knowing when to stop and ask.

The short version, in order:

1. **Detect** an existing design system before making any visual choice.
2. **Use it** when it exists — it is a constraint, not raw material.
3. **Create it** from what the project already has when it does not exist.
4. **Grill the user** whenever you are not confident about a brand-defining
   call. Never guess a palette, typeface, or voice that the project will live
   with.

## 1. Detect

Before choosing a single color or typeface, look for a design system in roughly
this order of authority:

- **A design-system document**: `design-system.md`, `DESIGN.md`, `STYLEGUIDE.md`,
  `docs/design*.md`, a Storybook/design-token package, `tokens.json`, a
  style-dictionary config.
- **A token source**: CSS custom properties in a `tokens.css` / `variables.css` /
  `theme.css`, a Tailwind theme config, a MUI/Chakra/styled-components theme
  module, a `theme.ts`. Read the tokens; they are the system's real vocabulary.
- **A component library**: a components directory with primitives (Button, Form,
  Modal, Toast, Tooltip, Table, Pagination…), plus its documented API, states,
  and variants.
- **Governance hints**: `AGENTS.md`/`CLAUDE.md`/`README` rules about styling,
  a lint config that enforces conventions, CI checks on CSS.
- **De-facto evidence**: if none of the above exists, derive the system from
  repeated values in the codebase (the colors, type stacks, spacing, and radii
  that already recur) — that repetition *is* the unnamed system.

Report what you found (even if it is only "a `tokens.css` and a `Button` class")
before designing. If you find two competing sources (a doc that disagrees with
the code), the code wins for behavior and you flag the drift; don't silently
pick one.

## 2. Use it

When a system exists, your job shifts: you are designing *within* an identity,
not inventing one.

- **Map every choice to a token or component.** Before writing a value, check
  the token source. Use `var(--token)`-style references, never re-typed hex
  values, one-off font stacks, or magic spacing numbers.
- **Extend, don't fork.** If the system lacks a needed role (say, a focus ring
  or a motion duration), extend the single token source with a semantic token
  and use it everywhere — do not invent a local constant that the next person
  has to rediscover. Never create a parallel scale alongside the existing one.
- **Reuse the primitives.** Compose existing components before styling new DOM.
  If a primitive is missing, follow the project's own rule for adding one (many
  repos require documenting the gap first). Variants belong to the component's
  owner file, not to a page stylesheet.
- **Respect the documented voice and signature.** A system that names its
  thesis, motif, and anti-goals (e.g. "calm technical workbench, layer-stack
  motif, no SaaS card wall") is telling you where boldness is allowed. Spend
  your signature inside those guardrails; the anti-goals are hard limits.
- **Keep parity obligations.** Themes (light/dark), locales, reduced-motion,
  and keyboard-focus contracts are part of the system. New UI ships with all of
  them.
- **Run the project's validation** for UI changes (build, render/style tests,
  lint) and check both themes before calling work done.

Distinctiveness is still allowed — but it comes from how you compose the
existing vocabulary, and from the content, not from breaking the contract.

## 3. Create it (when none exists)

If detection comes up empty, build a design system *from what the project
already has* rather than importing a new one. Codifying beats redrawing.

- **Inventory first.** List the recurring tokens (palette, type, spacing,
  radii, shadows, motion, layers, focus), the reusable components with their
  variants and states, and which pages own what. Prefer the existing values —
  even imperfect ones — over replacements; this is a consolidation, not a
  redesign. Do not migrate the project toward another product's palette or a
  generic admin theme.
- **Codify in the project's idiom.** Put tokens in the project's existing
  token file (or create one where its conventions would expect it), and write a
  short catalog document (e.g. `docs/design-system.md`) with: token tables and
  roles, component inventory with API/variants/states/a11y, an ownership map,
  governance rules, and a "known gaps" list so the document stays honest.
- **Fill real gaps with semantic tokens.** Motion durations, z-index scales,
  and focus rings are the most commonly missing; add them as semantic tokens
  and adopt them across the codebase in one pass where the code is not yet
  released. Keep documented contract values (breakpoints, JS mirror constants)
  written down where the tooling cannot express them.
- **Match documentation to reality.** Fix stale claims in existing docs while
  you are there; a design system whose doc drifts from the code is worse than
  none.
- **Follow the project's CSS/ownership rules** (nesting, no `!important`,
  component partials, class-based state) — the system must look like it grew
  from this codebase.

Keep the catalog compact and navigable: tables over prose, file paths for every
claim, and a component index that lets the next person find an owner before
writing new DOM.

## 4. Grill the user (when not confident)

Stop and ask when a call is brand-defining, expensive to reverse, or contradicts
what you found. Interactive questions (with concrete options) beat guesses.
Good triggers:

- Two sources disagree on the palette, type, or theme mechanism.
- The "system" is aspirational (a mood board) and the code says something else.
- The project has no tokens and the recurring values are inconsistent — you
  cannot tell which value is canonical.
- A choice needs licensing, procurement, or brand approval (typefaces, logos).
- The scope of a codification is ambiguous: documentation only, token
  gap-fill plus adoption, or a full component refactor — the diff sizes differ
  by an order of magnitude.
- Light/dark defaults, naming conventions, or where the catalog should live
  (`docs/` vs a live reference page) are unspecified.

Ask about direction, not implementation details. Then follow the answers
literally: when the human pins an axis, that choice wins.

## Checklist

Before finishing a design task in a project:

- [ ] I found (or created) the project's design system and named where it lives.
- [ ] Every color, typeface, spacing, radius, shadow, motion, layer, and focus
      value I wrote maps to a documented token.
- [ ] I reused existing components; anything new follows the project's
      component-creation rule.
- [ ] Light/dark, locales, reduced-motion, and keyboard focus all work.
- [ ] The catalog/README/AGENTS guidance matches the code I just wrote.
- [ ] The project's validation commands pass.
