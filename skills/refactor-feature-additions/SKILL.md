---
name: refactor-feature-additions
description: Use this skill whenever a task refactors existing code or adds/modifies feature behavior in API or Web, especially when the touched code must leave behind JSDoc, focused code comments, test updates, and explicit validation.
---

# Refactor & Feature Delivery

## When to Use This Skill

Use this skill for any task that:

- Refactors existing code (structure, naming, extraction, simplification, cleanup)
- Adds a new feature
- Changes existing feature behavior
- Touches API business logic or Web UI behavior

## Default Quality Contract

Unless the user explicitly says otherwise:

1. Implement the feature/refactor change.
2. Add or update JSDoc for the methods/functions you touched.
3. Leave focused comments around non-trivial logic you added or materially changed so intent and edge-case handling are obvious in-place.
4. Add or update tests for the modified behavior.
5. Run the relevant test command(s) with coverage.
6. Fix failures and re-run tests until they pass; target full coverage for the validated scope whenever practical.
7. Report what changed and how it was validated.

Do not stop after code changes only when testable behavior was modified.

## Workflow

### Step 1: Define Behavior Delta

- List exactly what behavior changed.
- Keep unrelated behavior unchanged.
- Identify the narrowest test scope that proves the delta.

### Step 2: Implement with Minimal Scope

- Prefer root-cause refactors over superficial patches.
- Keep public APIs stable unless change is required.
- Preserve existing style and architecture boundaries.
- Treat documentation as part of the implementation: update JSDoc on touched methods/functions and explain complex decision points close to the changed code.

### Step 3: Update Tests for the Delta

- Add/adjust tests that verify both normal and edge paths for the changed behavior.
- Use existing test framework and patterns in the target service.
- Avoid broad rewrites of unrelated tests.

### Step 4: Run and Iterate Until Green

- Run service-specific tests impacted by the change first.
- Expand to broader relevant tests if available.
- If tests fail, fix code/tests and rerun until the validated scope is green.

### Step 5: Fallback When Automation Is Missing

- Follow the decision process in `references/testing-decision-tree.md`.
- If the target area has no automated framework and bootstrap is not requested, provide a concise manual validation checklist and explicitly note the limitation.

## Validation Checklist

- Feature/refactor behavior works as requested.
- Touched methods/functions have accurate JSDoc.
- Complex changed logic includes enough local commentary to explain intent and non-obvious constraints.
- Tests exist for modified behavior (unless explicitly opted out).
- Test command output is green for executed scope.
- Coverage for the validated scope is improved and any remaining gaps are explicit.
- No unrelated regressions were introduced.

## Done Criteria

A task is complete only when:

- Code changes are in place,
- Touched code has been documented with JSDoc and relevant explanatory comments,
- Relevant tests were added/updated,
- Tests were run and are passing for the validated scope,
- Coverage expectations for the validated scope were addressed and documented,
- Any unavoidable gaps are explicitly documented.
