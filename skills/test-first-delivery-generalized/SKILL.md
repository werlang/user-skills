---
name: test-first-delivery-generalized
description: Deliver behavior changes, bug fixes, refactors, and feature work in any project with tests or explicit validation. Use when changing application behavior, updating existing tests, writing tests, reviewing missing coverage, choosing between automated and manual validation, or documenting testing gaps across backend, frontend, CLI, and database migrations.
---

# Test-First Delivery

Use this skill whenever a task changes application behavior, fixes a bug, or refactors existing structures. 

---

## 1. Default Quality Contract

Unless explicitly directed otherwise:
1. **Never Stop at Code Changes Alone**: Every behavior-changing task is incomplete without verification.
2. **Follow Test-First (TDD) cycle** where practical: write or update failing tests before writing minimal code to make them pass.
3. **Leave Touched Code Easy to Understand**: Enforce JSDoc/docstrings on all touched functions, methods, and constructors. Include focused inline comments near complex or non-obvious logic.
4. **Target 100% Coverage for Validated Scope**: Run test suites with coverage, fixing failures and gaps iteratively.
5. **State What Was Verified**: Conclude with a clear report detailing the automated tests run, manual validation performed, and any remaining gaps.

---

## 2. The TDD Workflow (Red-Green-Refactor)

For new features or bug fixes, apply the three-phase loop:

### Phase A: Red (Failing Test)
1. Write a failing test that defines the desired behavior or reproduces the reported bug.
2. Verify the test fails with a clear, expected error message before writing any application code.
*Example:*
```javascript
describe('Feature: User password reset', () => {
  it('should invalidate old tokens and create a new hashed token', async () => {
    const user = await setupTestUser();
    const token = await generateResetToken(user.id);
    expect(token).toBeDefined();
    // Test fails initially because generateResetToken is not implemented
  });
});
```

### Phase B: Green (Minimal Code)
1. Write the simplest possible implementation that satisfies the test.
2. Avoid over-engineering, optimizations, or additional features. Run tests to confirm they are green.

### Phase C: Refactor (Clean Code)
1. Improve code quality (deduplicate, clarify names, extract logic) while running tests to verify no regressions occur.
2. Document the implementation: add JSDoc for signatures and focused inline comments for intent.

---

## 3. Testing Strategy & Decision Tree

Before executing tests, discover the project reality (e.g. check `package.json`, `pyproject.toml`, Docker Compose config, environment setups). Use the decision tree to determine the validation path:

1. **Does the target area already have automated tests?**
   * **Yes** → Add or update tests within that suite.
   * **No** → Continue to step 2.
2. **Did the user explicitly request no test framework changes?**
   * **Yes** → Do not bootstrap. Provide a manual validation checklist and call out the automation gap.
   * **No** → Continue to step 3.
3. **Is there an approved, lightweight framework used in adjacent code?**
   * **Yes** → Use that framework to write scoped unit/component tests.
   * **No** → Continue to step 4.
4. **Fallback to Project Defaults**:
   * *API (Backend)*: Use the existing Vitest/Jest runner to write unit tests.
   * *Web (Frontend)*: Write unit/component tests. If Playwright infrastructure is present, update component specs.
5. **Manual Verification Fallback**:
   * If automation is impractical, document the manual verification checklist to prove the contract.

See [references/testing-decision-tree.md](references/testing-decision-tree.md) for details.

---

## 4. Documentation & Comments Standard

Maintain documentation as part of code delivery:

* **Doc Comments**: Use the host language's standard (JSDoc for JS/TS, docstrings for Python, etc.) to document parameters, return values, thrown errors, side effects, and invariants for all touched exported functions and class members.
* **Inline Comments**: Keep comments focused on **why** the logic exists, its assumptions, edge cases, caching precedence, and order of operations. Remove or rewrite comments that mechanically repeat the next line.

---

## 5. Execution Workflow (Docker Environment)

> [!IMPORTANT]
> **Host Isolation**: Since Python and Node are not installed on the host machine, run all test commands using Docker containers.

1. **Derive project commands** from the environment manifests and [references/validation-commands.md](references/validation-commands.md).
2. **Run tests inside containers** (e.g., `docker compose run --rm api npm run test`).
3. **Perform manual smoke tests** in a browser when changing UI interactions, layout, viewport size, or auth states, following the [references/browser-smoke-checklist.md](references/browser-smoke-checklist.md).
4. **Iterate until green** and the coverage of the changed files is addressed.

---

## 6. Done Criteria

A task is complete only when:
- The implementation code is in place.
- Touched code has JSDoc comments and high-signal inline intent comments.
- Relevant automated tests were created/updated and run successfully in the Docker container.
- Manual browser validation was executed and logged for UI/UX changes.
- A final validation report highlights what was tested, what commands were run, and any remaining gaps.