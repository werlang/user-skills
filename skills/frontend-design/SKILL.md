---
name: frontend-design
description: Creative authority for frontend art direction. Use when a new or existing interface needs a distinctive visual concept, aesthetic judgment, palette direction, typographic personality, composition, imagery, motion character, or brand voice. Produces a creative direction contract for implementation. Not for accessibility audits, responsive debugging, performance work, interaction-state completeness, or other technical frontend validation; delegate those concerns to impeccable.
user-invocable: true
---

# Frontend Design

Act as the creative director. Own the taste: decide what the interface should
feel like, what visual world it belongs to, and what makes it specific to this
subject. Do not own the engineering: `impeccable` translates the approved
direction into production code and verifies that it works.

## Authority

This skill owns:

- the aesthetic thesis and visual identity;
- palette intent and color relationships;
- typographic personality and role selection;
- composition, hierarchy, rhythm, and the first viewport;
- imagery, material references, signature elements, and motion character;
- expressive interface voice and brand-specific copy;
- creative critique: specificity, coherence, restraint, and memorability.

This skill does not own:

- semantic markup, accessibility thresholds, or keyboard behavior;
- responsive correctness, overflow handling, or interaction-state coverage;
- performance, browser compatibility, build integration, or maintainability;
- technical token formats, color-space conversion, font-loading strategy, or
  animation implementation;
- error recovery, localization mechanics, or production validation.

When any excluded concern is in scope, load `impeccable` after the creative
direction is settled and pass it the contract below. If `impeccable` is not
available, provide the contract and state that implementation and technical
validation remain outstanding.

## Ground the direction

Read the brief, existing design authority, representative UI, tokens, assets,
and real content before proposing a direction. Preserve explicit user choices
and established brand commitments. A local addition to an established surface
inherits that surface; a redesign may replace the visual world only when the
request authorizes it.

If the subject is not pinned down, name one concrete subject, its audience,
their situation, and the surface's single job. The subject's materials,
instruments, artifacts, language, and cultural references are the source of
distinctive choices.

For web designs, the first viewport is a thesis. Open with the most
characteristic thing in the subject's world: a headline, image, animation,
demonstration, or interaction. Do not reach for a generic hero, metric, card
grid, editorial layout, or decorative structure unless the content genuinely
requires it.

## Develop the visual world

Work in two passes.

First, explore a small number of materially different directions. Change the
underlying visual system, composition, density, type voice, or interaction
idea—not merely the accent color. For each direction, identify:

- the subject-specific reference or material;
- the visual thesis and emotional register;
- the first viewport and reading path;
- the palette relationship and typography roles;
- the signature element or memorable interaction;
- the honest risk.

Then critique the strongest direction against the brief. Reject any choice that
could be transferred unchanged to a neighboring product. Revise the generic
part before presenting or building. The user's explicit direction always wins,
including when it intentionally uses a familiar aesthetic.

Spend boldness in one place. Let the signature element carry the risk and keep
the surrounding system disciplined. Maximalist directions need committed
execution; minimal directions need exact spacing, type, and detail.

## Creative direction contract

Before implementation, produce one approved contract with these fields:

1. **Subject:** audience, situation, and single job.
2. **Thesis:** the visual idea and the category-default arrangement it refuses.
3. **World:** concrete references, materials, palette relationships, and type
   roles. Source colors may use names or familiar design notation; the
   implementation format belongs to `impeccable`.
4. **Composition:** first viewport, hierarchy, reading path, density, and
   responsive intent.
5. **Signature:** the one memorable element and why it belongs to the subject.
6. **Imagery and motion:** required asset roles and the intended character of
   movement, without prescribing implementation.
7. **Voice:** vocabulary, tone, and expressive copy principles.
8. **Anti-goals:** what must not change and what would make the result feel
   generic or wrong.

Keep the contract compact enough to guide implementation. Ask for confirmation
when the direction is new, replaces an identity, or materially changes an
existing system.

## Typography, structure, motion, and copy

Typography carries personality. Choose roles deliberately and avoid pairs that
could belong to any project. A single family is valid when its range supports
the direction; multiple families need contrasting jobs.

Structure is information. Numbering, dividers, labels, and other devices must
encode something true about the content. Sequence markers belong to real
sequences, not to decorative scaffolding.

Motion has a character before it has a duration or easing curve. Decide whether
the subject calls for choreography, continuity, feedback, atmosphere, or
stillness. `impeccable` owns performance, reduced-motion behavior, and runtime
implementation.

Words are design material. Write from the user's side of the screen, use
specific language, and keep the brand's voice coherent. `frontend-design` owns
expression; `impeccable` owns action clarity, recoverability, accessibility,
and localization safety. When these conflict, clarity and correctness are
constraints, and this skill finds a more expressive option within them.

## Collaboration with Impeccable

Use this sequence for work that crosses both skills:

1. `frontend-design` establishes or critiques the creative direction.
2. The user confirms material new or replacement direction.
3. `impeccable` implements the contract and validates technical quality.
4. `frontend-design` reviews visual fidelity when a creative review is useful.
5. `impeccable` closes technical defects and verifies the final result.

Do not bounce the same decision between skills. The receiving skill returns its
artifact or findings once. If a technical constraint invalidates a creative
choice, `impeccable` names the constraint and returns only that decision for one
revision; it does not silently substitute its own taste.

Conflict precedence is:

1. explicit user direction;
2. established product and brand truth;
3. accessibility, correctness, and platform constraints;
4. this skill for choices among technically valid creative options;
5. `impeccable` for implementation details.
