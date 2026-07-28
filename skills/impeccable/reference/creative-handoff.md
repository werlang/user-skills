# Creative handoff

Use this boundary whenever Impeccable encounters unresolved aesthetic judgment.
The goal is one creative decision followed by one technical implementation, not
two skills producing competing designs.

## When to delegate

Load `frontend-design` when the request establishes or materially changes:

- the visual thesis or identity;
- palette direction or typographic personality;
- composition, imagery, signature elements, or expressive motion;
- brand voice or the intended emotional register.

Do not delegate when those decisions already exist in the user brief,
DESIGN.md, a confirmed creative direction contract, or an established surface.
Do not delegate a purely technical defect.

## What Frontend Design returns

Receive one compact creative direction contract covering:

- subject, audience, situation, and job;
- thesis and anti-goals;
- visual world, palette relationships, and type roles;
- first viewport, hierarchy, reading path, and responsive intent;
- signature element, imagery, motion character, and voice.

Treat this contract as the source of creative truth for the task. Impeccable may
translate it into tokens, components, breakpoints, assets, and runtime behavior,
but may not replace its taste with an independent concept.

## What Impeccable returns

After implementation, return:

- the implemented files and behavior;
- accessibility, responsiveness, state, performance, and build evidence;
- any constrained deviation from the creative contract;
- the exact creative decision that needs revision, if a technical constraint
  makes part of the contract infeasible.

If visual fidelity needs review, return the rendered result to
`frontend-design` once. Apply its focused findings, then finish technical
validation. Do not ask either skill to re-decide an issue it already resolved.

## Conflict order

1. Explicit user direction.
2. Established product and brand truth.
3. Accessibility, correctness, and platform constraints.
4. `frontend-design` among technically valid creative options.
5. `impeccable` for implementation details.

If `frontend-design` is unavailable, do not recreate a separate taste system
inside Impeccable. Use an already approved direction or ask the user for one;
for technically bounded work, proceed without creative delegation.
