---
name: impeccable
description: Technical delivery authority for production frontend interfaces. Use to implement, audit, polish, adapt, harden, optimize, validate, or technically refine websites, product UI, dashboards, components, forms, onboarding, and empty states. Owns accessibility, responsive behavior, interaction states, performance, semantics, maintainability, browser validation, design-system integration, and faithful implementation of an approved creative direction. When aesthetic judgment or a new visual direction is required, delegate that decision to frontend-design instead of inventing a competing visual concept. Not for backend-only or non-UI tasks.
version: 4.0.2
user-invocable: true
argument-hint: "[shape · audit|critique · animate|bolder|colorize|delight|layout|overdrive|quieter|typeset · adapt|clarify|distill · harden|onboard|optimize|polish · init|document|extract|live] [target]"
license: Apache 2.0
allowed-tools:
  - Bash(npx impeccable *)
  - Bash(node skills/impeccable/scripts/*)
  - Bash(node .claude/skills/impeccable/scripts/*)
---

# Impeccable

Implement and validate production frontend interfaces. Treat an approved
creative direction as a contract: preserve its thesis, composition, palette
relationships, typography roles, signature, imagery, motion character, and
voice while making the result accessible, responsive, fast, maintainable, and
correct.

## Authority

This skill owns:

- semantic structure, accessibility, keyboard and assistive-technology paths;
- responsive composition, overflow, zoom, localization expansion, and input
  adaptation;
- interaction behavior and complete loading, empty, error, success, disabled,
  permission, and edge states;
- technical color, typography, motion, asset, and token implementation;
- performance, browser support, graceful degradation, and dependency choices;
- component boundaries, design-system integration, build correctness, and
  browser validation;
- technical critique and final delivery evidence.

`frontend-design` owns aesthetic thesis, palette direction, typographic
personality, composition, imagery, expressive motion, brand voice, and visual
critique. Do not create a parallel visual direction inside this skill.

## Setup

1. Run `node skills/impeccable/scripts/context.mjs` (or `node .claude/skills/impeccable/scripts/context.mjs` when installed as a Codex skill) once per session
   from the user's project. If the runtime reports another loaded skill base,
   use that base. Pass a named source file or route with `--target <path>`.
   Follow the script's directives and do not rerun it.
2. Load the one command playbook that owns the request. Use
   [reference/new-work.md](reference/new-work.md) for a new surface or
   replacement visual world.
3. Inspect the target and at least one representative source of incumbent
   truth: DESIGN.md, tokens, theme, CSS, component, or asset.
4. Apply [reference/creative-handoff.md](reference/creative-handoff.md) when
   the request requires unresolved aesthetic judgment. Reuse an already
   approved creative direction; do not invoke `frontend-design` redundantly.
5. After direction and technical scope are resolved, load
   [reference/craft-floor.md](reference/craft-floor.md) immediately before
   editing UI. Do not load it for planning-only work.

## Delegation boundary

Creative delegation is required for:

- a new or replacement visual identity;
- an open-ended new page or surface without approved art direction;
- `bolder`, `quieter`, `colorize`, `typeset`, `delight`, or `overdrive`;
- the subjective visual portion of `shape`, `critique`, `polish`, `layout`,
  `animate`, or departure-mode `live` work.

Stay inside Impeccable when the request is technically bounded, including:

- accessibility, contrast, focus, semantics, or keyboard fixes;
- responsive, overflow, zoom, localization, or device adaptation;
- performance and rendering optimization;
- interaction behavior, state completeness, recovery, or onboarding mechanics;
- token/component extraction, documentation, hooks, doctor, and build repair;
- faithful implementation of an already approved direction.

When both skills apply, use one handoff in each direction at most. Do not bounce
the same decision between them.

## Technical delivery rules

- The user brief and approved creative contract are requirements, not
  inspiration.
- Refinement preserves behavior, content, identity, and everything outside the
  named scope. Redesign preserves product truth and constraints while following
  the approved replacement direction.
- Existing conventions and components are the default implementation substrate.
  Depart only when the contract or UX requires it and the new path remains
  maintainable.
- Convert source colors and type choices into the project's token and loading
  systems. Adjust only what technical constraints require, preserving the
  intended relationship.
- Content is visible without animation. Reduced motion, keyboard operation,
  touch behavior, and graceful degradation are mandatory.
- Validate the real result with the available build, detector, browser,
  screenshots, and representative states. A clean detector is a floor, not
  proof that the interface is finished.
- If a technical constraint invalidates a creative choice, identify the exact
  constraint and return that decision to `frontend-design` once. Do not replace
  it silently.

## Commands

| Command | Category | Description | Reference |
|---|---|---|---|
| `craft [feature]` | Build | Deprecated alias for an ordinary new-work request | [reference/craft.md](reference/craft.md) |
| `shape [feature]` | Build | Plan UX/UI before writing code | [reference/shape.md](reference/shape.md) |
| `init` | Build | Capture durable product context in PRODUCT.md | [reference/init.md](reference/init.md) |
| `document` | Build | Generate DESIGN.md from existing project code | [reference/document.md](reference/document.md) |
| `extract [target]` | Build | Pull reusable tokens and components into a design system | [reference/extract.md](reference/extract.md) |
| `critique [target]` | Evaluate | Separate creative and technical review evidence | [reference/critique.md](reference/critique.md) |
| `audit [target]` | Evaluate | Technical quality checks for accessibility, performance, and responsiveness | [reference/audit.md](reference/audit.md) · native: [reference/audit.native.md](reference/audit.native.md) |
| `polish [target]` | Refine | Final creative-fidelity and technical-quality pass | [reference/polish.md](reference/polish.md) |
| `bolder [target]` | Refine | Implement an approved amplification direction | [reference/bolder.md](reference/bolder.md) |
| `quieter [target]` | Refine | Implement an approved reduction in visual intensity | [reference/quieter.md](reference/quieter.md) |
| `distill [target]` | Refine | Strip to the essential task and content | [reference/distill.md](reference/distill.md) |
| `harden [target]` | Refine | Cover errors, i18n, and edge cases | [reference/harden.md](reference/harden.md) |
| `onboard [target]` | Refine | Build first-run flows, empty states, and activation | [reference/onboard.md](reference/onboard.md) |
| `animate [target]` | Enhance | Implement purposeful, accessible motion | [reference/animate.md](reference/animate.md) |
| `colorize [target]` | Enhance | Implement an approved color direction as a reliable system | [reference/colorize.md](reference/colorize.md) |
| `typeset [target]` | Enhance | Implement and validate an approved typography direction | [reference/typeset.md](reference/typeset.md) |
| `layout [target]` | Enhance | Implement hierarchy, structure, spacing, and adaptation | [reference/layout.md](reference/layout.md) |
| `delight [target]` | Enhance | Implement an approved moment of product character | [reference/delight.md](reference/delight.md) |
| `overdrive [target]` | Enhance | Implement an approved technically ambitious effect | [reference/overdrive.md](reference/overdrive.md) |
| `clarify [target]` | Fix | Improve UX copy, labels, and recovery messages | [reference/clarify.md](reference/clarify.md) |
| `adapt [target]` | Fix | Adapt for devices, viewports, and input modes | [reference/adapt.md](reference/adapt.md) · native: [reference/adapt.native.md](reference/adapt.native.md) |
| `optimize [target]` | Fix | Diagnose and fix UI performance | [reference/optimize.md](reference/optimize.md) |
| `live` | Iterate | Generate and validate variants in the browser | [reference/live.md](reference/live.md) |

## Routing

- **No argument:** read [reference/routing.md](reference/routing.md) and present
  its context-aware menu. Never auto-run a command.
- **Explicit or clearly implied command:** load its reference, using the native
  variant on native platforms. Ask once only when two commands genuinely fit.
- **General new visual work:** load [reference/new-work.md](reference/new-work.md).
- **General bounded refinement:** use the incumbent implementation and approved
  direction as authority; do not expand it into an identity exercise.
- `teach` aliases `init`. `craft` aliases ordinary new-work.

After `init` writes PRODUCT.md, resume without rerunning `context.mjs`.

**Pin / Unpin:** run
`node skills/impeccable/scripts/pin.mjs <pin|unpin> <command>` (or `.claude/skills/impeccable/scripts/pin.mjs` when installed).

**Hooks:** load [reference/hooks.md](reference/hooks.md) for
`/impeccable hooks <on|off|status|ignore-rule|ignore-file|ignore-value|reset>`.

**Doctor:** load [reference/doctor.md](reference/doctor.md) when the user asks
about stale or drifting Impeccable artifacts. Never repair drift as an unrelated
side effect.
