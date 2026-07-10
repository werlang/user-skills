# Comment Patterns

Use these patterns when touched code needs to explain more than the syntax already does.

## Good JSDoc Focus

Document:

- what the input really means, not just its type
- what the function returns or mutates
- side effects, ordering constraints, and invariants
- cases where callers must preserve a contract

Weak:

```js
/**
 * Updates cards.
 * @param {Array} cards
 */
```

Better:

```js
/**
 * Applies a proposal's card mutations to the in-memory snapshot while preserving
 * the original-card baseline used for revert and conflict review.
 *
 * @param {Card[]} cards Cards already normalized to the active timetable date.
 * @returns {Map<string, Card>} Cards keyed by stable comparison id.
 */
```

## Good Section Comment Focus

Prefer comments that explain why a block exists or why the order matters.

Weak:

```js
// Loop through cards
for (const card of cards) {
```

Better:

```js
// Normalize ids once here so every downstream rule compares the same shape.
for (const card of cards) {
```

Better:

```js
// Keep the first pre-edit snapshot only once so revert and audit flows still
// point to the user's original state after later incremental edits.
if (!existing.originalCard) {
```

## Long-Method Phase Comments

When a method has multiple non-trivial phases, add short headers at the phase boundaries:

```js
// Build a stable lookup before evaluating conflicts so repeated comparisons stay O(1).
// ...

// Evaluate hard conflicts first because later soft-rule warnings depend on the filtered set.
// ...
```

## Final Check

Before finishing:

1. Remove comments that merely translate code into prose.
2. Tighten comments that could apply to any project.
3. Verify doc comments still match the current behavior exactly.
