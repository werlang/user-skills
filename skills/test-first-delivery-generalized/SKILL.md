---
name: test-first-delivery-generalized
description: Deliver behavior changes, bug fixes, refactors, and feature work in any project with tests or explicit validation. Use when changing application behavior, updating existing tests, writing tests, reviewing missing coverage, choosing between automated and manual validation, or documenting testing gaps across backend, frontend, CLI, and database migrations.
---

# Test-First Delivery

Use this skill whenever a task changes application behavior, fixes a bug, or refactors existing structures.

This skill implements **Independent Verification TDD (IV-TDD)**: the agent that searches for the implementation must not control the oracle that judges it. See `tdd` for what makes a good independent test; this skill defines the operational loop, subagent boundaries, and freeze mechanics that enforce it.

---

## 1. Default Quality Contract

Unless explicitly directed otherwise:
1. **Never Stop at Code Changes Alone**: Every behavior-changing task is incomplete without verification.
2. **Follow Independent-Test TDD where practical**: authoritative tests are written first, from the specification, by a Test Designer that has not seen the implementation, frozen, then implemented against. The implementer may add `tests/work/**` probes but cannot modify `tests/authoritative/**`.
3. **Leave Touched Code Easy to Understand**: Enforce JSDoc/docstrings on all touched functions, methods, and constructors. Include focused inline comments near complex or non-obvious logic.
4. **Target 100% Coverage for Validated Scope, but coverage is not a quality gate**: Run coverage, then run mutation testing. Quantity is a poor proxy for quality. Report `mutation_score = killed / total`.
5. **State What Was Verified**: Conclude with a clear report detailing the authoritative vs work tests run, mutation results, adversarial findings, manual validation, and any remaining gaps.

---

## 2. The TDD Workflow — Independent Verification Loop

For new features or bug fixes, apply the loop. Do not give the same context both roles.

### Phase 0 — Behavioral Contract

Before tests or implementation, create a machine-readable contract from the requirement (issue/PRD/spec/existing behavior):

```yaml
feature: order-cancellation
rules:
  - id: CANCEL-001
    description: Orders may be cancelled within 30 calendar days (not 30×24h).
  - id: CANCEL-002
    description: Already shipped orders cannot be cancelled.
  - id: CANCEL-003
    description: Cancellation is idempotent.
```

This is the source of truth. The implementer never gets to redefine it because an implementation is inconvenient.

### Phase 1 — Independent Test Generation (Test Designer subagent)

Spawn a dedicated **Test Designer** subagent with:

```text
requirement + contract + public interfaces + existing authoritative tests
```

Not the implementation. Task: `Construct tests that distinguish correct behavior from plausible incorrect implementations.` Ask for properties capable of falsifying violations, not "write tests for this function."

Output: `tests/authoritative/<feature>.test.*`

### Phase 2 — Test Review (Reviewer subagent)

Spawn a second subagent with `requirement + tests` (no implementation). It checks:

- missing edge/boundary cases, redundant tests, coupling to implementation details
- tests that merely reproduce requirement examples
- whether the suite could still pass for an obviously incorrect implementation (`always allows`, `never allows`, `wrong boundary`, `not idempotent`)
- ambiguous assertions

This is conceptual mutation testing before implementation exists. Reviewer may send back to Designer once.

### Phase 3 — Freeze (permission boundary)

Once approved, authoritative tests become immutable:

```text
tests/authoritative/** → FROZEN
tests/work/**          → mutable (implementer scratch)
```

Enforce at tool/filesystem level:

```text
Implementer READ:  src/** , tests/authoritative/**
Implementer WRITE: src/** , tests/work/**
Implementer WRITE tests/authoritative/** = DENIED
```

A prompt saying "don't edit tests" is not a boundary.

### Phase 4 — Implementation (Implementer subagent)

Give the implementer:

```text
requirement + contract + frozen authoritative tests + existing code
```

Instruction: `Implement the contract. You may execute authoritative tests but cannot modify them. You may create tests/work/** for debugging.`

Legitimate loop:

```text
write impl → run authoritative tests → failure → inspect impl → modify impl → run tests
```

Illegitimate (prohibited):

```text
write impl → test fails → modify impl OR test → green
```

### Phase 5 — Verification

1. **Authoritative suite** must be green.
2. **Mutation testing** — mutate the implementation (`>=`→`>`, remove condition, invert boolean, alter boundary) and run authoritative tests. If mutations survive, the suite is insufficient.

   ```yaml
   verification:
     tests: 47
     mutations: 83
     killed: 79
     survived: 4
     mutation_score: 0.95
   ```

   Treat `mutation_score < 0.90` as a gap even if coverage is 100%.

3. **Adversarial verifier** (optional but recommended for complex logic) — subagent with `requirement + implementation + authoritative tests`, asked `Find a spec violation not detected by the tests`. It writes `verification/findings.md`. Findings go back to the Test Designer for a new frozen test, never to the implementer directly.

### Test Change Requests (controlled mutability)

If an authoritative test appears wrong:

```text
failure → is test wrong? NO → fix impl
                       YES → file Test Change Request (reason + requirement change + expected behavior + affected tests) → independent reviewer → approved → Designer updates → re-freeze
```

Never edit authoritative tests to make the suite green.

Example minimal (single-agent fallback when subagents are not available): do Phase 1-3 in a *separate model turn* with implementation files hidden, freeze, then continue as implementer with write-denied. The invariant matters more than the number of models.

---

## 3. Testing Strategy & Decision Tree

Before executing tests, discover the project reality (e.g. check `package.json`, `pyproject.toml`, Docker Compose config, environment setups). Use the decision tree to determine the validation path:

1. **Does the target area already have authoritative tests (`tests/authoritative/**`)?**
   * **Yes** → Treat them as frozen. Implementer must not modify them. Run them. If a failure suggests the test is wrong, file a Test Change Request. Implementer may add `tests/work/**` probes only.
   * **No authoritative suite, but area has legacy tests** → Treat legacy tests as non-authoritative. Do not mutate them to pass; add a new authoritative suite via Phase 1-3, then implement.
   * **No tests at all** → Continue to step 2.
2. **Did the user explicitly request no test framework changes?**
   * **Yes** → Do not bootstrap. Provide a manual validation checklist and call out the automation gap.
   * **No** → Continue to step 3.
3. **Is there an approved, lightweight framework used in adjacent code?**
   * **Yes** → Use that framework to write the authoritative suite (Phase 1) plus scoped work tests.
   * **No** → Continue to step 4.
4. **Fallback to Project Defaults**:
   * *API (Backend)*: Use the existing Vitest/Jest runner to write unit tests.
   * *Web (Frontend)*: Write unit/component tests. If Playwright infrastructure is present, update component specs.
5. **Manual Verification Fallback**:
   * If automation is impractical, document the manual verification checklist to prove the contract.

See [references/testing-decision-tree.md](references/testing-decision-tree.md) for details and [references/independent-verification.md](references/independent-verification.md) for the full freeze/mutation/adversarial reference.

---

## 4. Documentation & Comments Standard

Maintain documentation as part of code delivery:

* **Doc Comments**: Use the host language's standard (JSDoc for JS/TS, docstrings for Python, etc.) to document parameters, return values, thrown errors, side effects, and invariants for all touched exported functions and class members.
* **Inline Comments**: Keep comments focused on **why** the logic exists, its assumptions, edge cases, caching precedence, and order of operations. Remove or rewrite comments that mechanically repeat the next line.

---

## 5. Execution Workflow (Docker Environment)

> [!IMPORTANT]
> **Host Isolation**: Since Python and Node are not installed on the host machine, run all test commands using Docker containers.
> **Test Scope Rule**: Run **unit tests only** by default during AI tasks. Integration/functional tests and E2E/Playwright browser smoke tests are reserved for **explicit requests**.
> **Permission Rule**: When an authoritative suite exists, enforce `WRITE tests/authoritative/** = DENIED` for the implementer before running tests. If the runtime cannot enforce filesystem deny, use a pre-run guard (e.g., `git diff --name-only | grep authoritative` → fail if implementer touched it, or a wrapper around `write_file`).

1. **Derive project commands** from the environment manifests and [references/validation-commands.md](references/validation-commands.md).
2. **Run authoritative tests inside containers** (e.g., `docker compose run --rm api npm run test:authoritative` or `docker compose run --rm api npx vitest run tests/authoritative`).
3. **Run work tests separately** (`docker compose run --rm api npx vitest run tests/work`) — these may be created/modified by the implementer.
4. **Run integration / E2E tests ONLY upon explicit request**.
5. **Run mutation testing** (e.g., `npx stryker run` / `npx vitest --coverage` + mutation step) and report `mutation_score`.
6. **Iterate until green on authoritative + mutation threshold met**, or a hard blocker is clearly documented. Never achieve green by editing authoritative tests.

---

## 6. Done Criteria

A task is complete only when:
- The behavioral contract is captured (or linked to the originating issue/PRD).
- The authoritative suite was created/reviewed independently (Designer + Reviewer) and frozen before implementation.
- The implementation code is in place and `tests/authoritative/**` was **not** modified by the implementer (verified via permission guard or `git diff`).
- Touched code has JSDoc comments and high-signal inline intent comments.
- `tests/work/**` probes (if any) are separated from authoritative tests and documented.
- Authoritative automated tests were run successfully in the Docker container; mutation testing was run and `mutation_score` is reported (≥0.90 or gaps acknowledged); adversarial findings (if run) are triaged.
- Manual browser validation was executed and logged for UI/UX changes.
- A final validation report highlights what was tested (authoritative vs work), what commands were run, mutation/adversarial results, and any remaining gaps.

---

## 7. Quick Reference — Single vs Multi-Agent

| Mode | How to keep independence |
|------|--------------------------|
| **Multi-agent (preferred)** | Designer and Implementer are separate subagents with different `READ/WRITE` tool scopes and disjoint context windows. Freeze enforced by orchestrator. |
| **Single-agent fallback** | Do Phase 1-3 in an isolated turn with implementation hidden, commit `tests/authoritative/**`, then continue as implementer with a wrapper that denies writes to that path. Still file Test Change Requests for any authoritative edits. |
| **Anti-pattern** | Single turn: `write impl → write tests → edit tests until green`. Treat as failed verification. |
