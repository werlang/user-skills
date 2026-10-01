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
4. **Mutation/Falsification is the Quality Gate, not Line Coverage**: Run mutation testing (`mutation_score >= 0.90`) or verify via the Fast Sabotage Litmus Test. Line coverage is informative only; 100% is expected only for the narrowly touched seam, never the entire repository.
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

### Phase 1 — Independent Test Generation (Test Designer role/subagent)

Provide the Test Designer with:

```text
requirement + contract + public interfaces + existing authoritative tests
```

Not the implementation. Task: `Construct tests that distinguish correct behavior from plausible incorrect implementations.` Ask for properties capable of falsifying violations, not "write tests for this function."

**Core authoring mandates:**
- **The Falsification Triad:** For every seam, author at least:
  1. *Golden Happy Path:* Verified against an independent, hardcoded literal from the contract.
  2. *Boundary / Edge Case:* Off-by-one boundary, empty state, max/min limit, or cutoff point.
  3. *Negative / Rejection Case:* Forbidden state, invalid parameter, or missing permission that must explicitly reject.
- **Ban shallow assertions:** Forbid `toBeDefined()`, `toBeTruthy()`, or sole `toHaveBeenCalled()` checks. Assert exact return values, schemas, or observable state changes.
- **No derivative expected values:** Never calculate expected values using code logic/loops that duplicate the implementation.
- **Ban snapshot testing:** Never use `toMatchSnapshot()` or `toMatchInlineSnapshot()` in authoritative tests; expected values must be explicit, independent literals.

Output: `tests/authoritative/<feature>.test.*`

### Phase 2 — Test Review (Reviewer role/subagent)

Audit with `requirement + tests` (no implementation):

- missing edge/boundary cases, redundant tests, coupling to implementation details
- presence of the full **Falsification Triad** per seam
- absence of shallow existential assertions (`toBeDefined()`, `toBeTruthy()`) or sole call-count assertions
- absence of recomputed or tautological expected values (e.g. `items.reduce(...)`)
- **ban on snapshot sycophancy:** reject `toMatchSnapshot()`, `toMatchInlineSnapshot()`, and `-u` / `--updateSnapshot`
- whether the suite could still pass for an obviously incorrect implementation (`always allows`, `never allows`, `wrong boundary`, `not idempotent`)
- ambiguous assertions

Reviewer may send back to Designer once.

### Phase 3 — Freeze (permission boundary)

Once approved, authoritative tests become immutable:

```text
tests/authoritative/** → FROZEN
tests/work/**          → mutable (implementer scratch)
```

Enforce via orchestrator boundary and post-run guard:

```bash
git diff --name-only HEAD -- tests/authoritative | grep -q . && echo "DENIED: authoritative touched by implementer" && exit 1
```

The orchestrator rejects any implementer diff modifying `tests/authoritative/**`.

### Phase 4 — Implementation (Implementer role/subagent)

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
2. **Mutation testing & Fast Sabotage**:
   - *Automated mutation (Stryker):* Run Stryker only when `stryker.conf` exists or after configuration. Scope strictly with `--mutate <touched-files>` (never run an unconstrained mutation pass across the entire repo). Gate: `mutation_score = killed / total >= 0.90`.
   - *Fast Sabotage Litmus Test (required when Stryker is unconfigured):* Deliberately perturb 2–3 critical production invariants in the touched code (e.g. invert comparison `>=` to `>`, omit a guard or auth check, return empty/dummy value). Run authoritative tests against each mutation. **Every single mutation MUST produce a test failure.** If any mutation passes silently, the suite is toothless and must be hardened before acceptance.

   ```yaml
   verification:
     tests: 47
     mutations: 83
     killed: 79
     survived: 4
     mutation_score: 0.95
     sabotage_checks: ["inverting boundary fails", "omitting auth guard fails"]
   ```

3. **Adversarial verifier** (optional for complex logic) — role/subagent with `requirement + implementation + authoritative tests`, asked `Find a spec violation not detected by the tests`. It writes `verification/findings.md`. Findings go back to the Test Designer for a new frozen test, never to the implementer directly.

### Test Change Requests (controlled mutability)

If an authoritative test appears wrong:

```text
failure → is test wrong? NO → fix impl
                       YES → file Test Change Request (reason + requirement change + expected behavior + affected tests) → independent reviewer → approved → Designer updates → re-freeze
```

Never edit authoritative tests to make the suite green.

---

## 3. Testing Strategy & Decision Router

Before executing tests, discover the project reality (check `package.json`, `pyproject.toml`, `docker-compose.yml`, or build manifests):

1. **Existing Authoritative Suite (`tests/authoritative/**`)?** Treat as frozen. Implementer runs them; cannot edit them. File Test Change Request if test appears wrong.
2. **Legacy Tests Exist?** Treat as non-authoritative. Do not modify legacy tests to get green; add new authoritative suite via Phase 1–3, then implement.
3. **No Tests Exist?** Check for adjacent frameworks in the repository; if none, bootstrap a lightweight runner or provide a manual verification checklist.

See [references/testing-decision-tree.md](references/testing-decision-tree.md) for detailed framework discovery, default paths, and fallback rules.

---

## 4. Documentation & Comments Standard

Maintain documentation as part of code delivery:

* **Doc Comments**: Use the host language's standard (JSDoc for JS/TS, docstrings for Python, etc.) to document parameters, return values, thrown errors, side effects, and invariants for all touched exported functions and class members.
* **Inline Comments**: Keep comments focused on **why** the logic exists, its assumptions, edge cases, caching precedence, and order of operations. Remove or rewrite comments that mechanically repeat the next line.

---

## 5. Execution Workflow

> [!IMPORTANT]
> **Runtime & Container Discovery**: Derive execution commands from the project's declared manifests and available tools. If the project declares Docker Compose, discover services with `docker compose config --services` and run containerized; if native runtimes are present (`node`, `python`, `cargo`), run natively; if the host lacks declared runtimes, rely on containerized execution.
> **Test Scope Rule**: Run **unit tests only** by default during AI tasks. Integration/functional tests and E2E/Playwright browser smoke tests are reserved for **explicit requests**.
> **Permission Rule**: The orchestrator enforces `git diff --name-only HEAD -- tests/authoritative | grep -q . && exit 1` before accepting implementer work.

1. **Derive project commands** from environment manifests and [references/validation-commands.md](references/validation-commands.md).
2. **Run authoritative tests** (e.g., `npm test tests/authoritative` or `docker compose run --rm <service> ...`).
3. **Run work tests separately** (`tests/work/**`) if any were created by the implementer.
4. **Run integration / E2E tests ONLY upon explicit request**.
5. **Execute mutation verification**: Scoped Stryker (`--mutate <files>`) or the Fast Sabotage Litmus Test (2–3 hand mutations).
6. **Iterate until green on authoritative + mutation/sabotage verified**. Never edit authoritative tests to achieve green.

---

## 6. Done Criteria

A task is complete only when:
- The behavioral contract is captured (or linked to the originating issue/PRD).
- The authoritative suite was created/reviewed independently and frozen before implementation.
- The implementation code is in place and `tests/authoritative/**` was **not** modified by the implementer (verified via orchestrator guard `git diff --name-only HEAD -- tests/authoritative`).
- Touched code has doc comments and high-signal inline intent comments.
- `tests/work/**` probes (if any) are separated from authoritative tests and documented.
- Authoritative automated tests passed; the suite enforces the Falsification Triad without shallow or tautological assertions; snapshot testing is not used to auto-bless outputs; scoped mutation testing (`mutation_score >= 0.90`) or Fast Sabotage Litmus Test was verified.
- Manual browser validation was executed and logged only if UI/UX changes were explicitly requested.
- A final validation report highlights what was tested (authoritative vs work), what commands were run, mutation/sabotage results, and any remaining gaps.

---

## 7. Quick Reference — Single vs Multi-Agent

| Mode | How to keep independence |
|------|--------------------------|
| **Multi-agent (preferred)** | Designer and Implementer are separate subagents with different `READ/WRITE` tool scopes and disjoint context windows. Freeze enforced by orchestrator. |
| **Single-agent fallback (Degraded)** | When subagents are unavailable, mark suite as `[SELF-REVIEW-DEGRADED]`. Use two separate turns (isolated turn with implementation hidden to write authoritative tests, commit, then turn with tests write-denied). Mandate hidden-test split (`public` visible / `hidden` CI-only) to guard against self-consistent bias. Do not claim IV-TDD independence; report as `authoritative-unverified, mutation-gated only`. |
| **Anti-pattern** | Single turn: `write impl → write tests → edit tests until green`. Treat as failed verification. |
