# New visual work

Use this flow for a new surface or an authorized replacement visual identity.
PRODUCT.md owns product truth. DESIGN.md owns durable visual decisions. A
surface brief owns strategy specific to one route or artifact.

## 1. Establish existing authority

Read PRODUCT.md, DESIGN.md, representative code, tokens, components, assets,
and real content.

- **Established world:** inherit it. Missing DESIGN.md does not erase coherent
  visual authority already present in the product.
- **Incomplete world:** preserve confirmed assets and recognizable traits;
  identify only the decisions the new surface still needs.
- **Authorized redesign:** preserve product truth, content, function,
  constraints, and explicit brand commitments; replace the old visual world
  only through an approved creative direction.
- **No visual authority:** require a creative direction before implementation.

A local addition inherits its surrounding surface. Do not turn it into an
identity exercise.

## 2. Resolve product and technical scope

Clarify only facts that materially change implementation:

- visitor task or action and success condition;
- real content, evidence, data ranges, and assets;
- required states and transitions;
- target platforms, browsers, input modes, accessibility, localization, and
  performance constraints;
- what must remain untouched.

Do not ask the user for CSS values or implementation details they did not
choose.

## 3. Delegate unresolved creative direction

Follow [creative-handoff.md](creative-handoff.md). Load `frontend-design` for a
new identity, open-ended new surface, or material visual change. Pass it the
product truth, technical constraints, established authority, real content, and
anti-goals.

Receive an approved creative direction contract before writing UI code. Skip
delegation only when the user, DESIGN.md, or an already confirmed contract
settles the visual direction.

For `shape`, return the combined brief through [shape.md](shape.md) and stop
before persistence or implementation.

## 4. Persist approved direction

When a new or replacement world is approved, update DESIGN.md through
[document.md](document.md) before implementation. Record durable system rules,
not transient mock details.

When strategy belongs only to one route or artifact, use:

`node .claude/skills/impeccable/scripts/surface-brief.mjs read <primary-target>`

`node .claude/skills/impeccable/scripts/surface-brief.mjs write <primary-target> <body-file> [related-target ...]`

Keep the surface brief small: scope, visitor job, content/proof, constraints,
creative direction, memorable moment, and unresolved decisions.

If the approved contract requires visual exploration and image generation is
available, use [visualize.md](visualize.md) to produce implementation references
without reopening the art direction.

## 5. Implement faithfully

Load [craft-floor.md](craft-floor.md), then translate the contract into the
project's real system:

- preserve the stated thesis, hierarchy, first viewport, palette relationships,
  type roles, signature, imagery, motion character, and voice;
- implement semantic structure, complete states, responsive composition,
  keyboard and touch behavior, reduced motion, and graceful degradation;
- author or source required assets honestly; never invent commercial claims,
  prices, customers, benchmarks, or unsupported capabilities;
- use existing components and conventions where they support the contract;
- document deliberate departures when the contract requires a new reusable
  pattern.

If a technical constraint invalidates part of the contract, return only that
decision to `frontend-design` for one revision. Do not silently dilute or
replace the direction.

## 6. Inspect and finish

Inspect representative desktop, mobile, zoomed, keyboard, reduced-motion, long
content, empty, loading, error, and success paths as applicable. Run the
project's build and focused validation. Compare the result with the creative
contract and DESIGN.md, then fix material technical or fidelity gaps.

When creative review is useful, return the rendered result to
`frontend-design` once. Apply focused findings, complete technical validation,
and report any accepted deviations.
