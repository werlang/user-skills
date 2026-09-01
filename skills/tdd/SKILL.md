---
name: tdd
description: Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
---

# Test-Driven Development

TDD is the red → green loop. This skill is the reference that makes that loop produce tests worth keeping: what a good test is, where tests go, the anti-patterns, and the rules of the loop. Every section applies on every cycle — consult them before and during the loop, not after.

When exploring the codebase, read `CONTEXT.md` (if it exists) so test names and interface vocabulary match the project's domain language, and respect ADRs in the area you're touching.

## What a good test is

Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't. A good test reads like a specification — "user can checkout with valid cart" tells you exactly what capability exists — and survives refactors because it doesn't care about internal structure.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Seams — where tests go

A **seam** is the public boundary you test at: the interface where you observe behavior without reaching inside. Tests live at seams, never against internals.

**Test only at pre-agreed seams.** Before writing any test, write down the seams under test and confirm them with the user. No test is written at an unconfirmed seam. You can't test everything — agreeing the seams up front is how testing effort lands on the critical paths and complex logic instead of every edge case.

Ask: "What's the public interface, and which seams should we test?"

## Anti-patterns

- **Implementation-coupled** — mocks internal collaborators, tests private methods, or verifies through a side channel (querying the database instead of using the interface). The tell: the test breaks when you refactor but behavior hasn't changed.
- **Tautological** — the assertion recomputes the expected value the way the code does (`expect(add(a, b)).toBe(a + b)`, a snapshot derived by hand the same way, a constant asserted equal to itself), so it passes by construction and can never disagree with the code. Expected values must come from an independent source of truth — a known-good literal, a worked example, the spec.
- **Horizontal slicing** — writing all tests first, then all implementation. Bulk tests verify _imagined_ behavior: you test the _shape_ of things rather than user-facing behavior, the tests go insensitive to real changes, and you commit to test structure before understanding the implementation. Work in **vertical slices** instead — one test → one implementation → repeat, each test a **tracer bullet** that responds to what the last cycle taught you.

## Independent Verification Boundary

The agent that searches for the implementation must not control the oracle that judges it. If the same agent writes both code and the tests that verify it, "tests pass" stops being an invariant — it becomes another variable the agent can manipulate.

- **Correlated generation** — `spec → impl → test` from the same context produces self-consistent but wrong worlds. Example: spec says "orders cancellable within 30 calendar days," agent interprets as `days <= 30`, implements `if (days <= 30)` and writes `expect(cancel(30)).toBe(true); expect(cancel(31)).toBe(false)`. Suite is green, requirement is still violated (timezone/calendar boundaries). Even non-tautological tests correlate when they re-encode the implementer's interpretation. Expected values must derive from the specification/contract, not from the implementation.
- **Information-flow isolation** — Independence comes from permission and information boundaries, not model identity. Test Designer sees `requirement + behavioral contract + public interfaces` but **not** the implementation. Implementer sees `requirement + contract + frozen tests + existing code` but **cannot modify** the authoritative tests. The verification environment is an external judge; the implementer is a contestant.

## Test Ownership — Authoritative vs Work

Treat "tests" as two distinct artifacts:

- **Authoritative (verification) tests** — `tests/authoritative/**` (or `tests/**/authoritative/**`). System-owned, spec-derived, frozen after review. Created only by Test Designer / Reviewer subagents. This suite is the correctness oracle and feeds CI. Purpose: correctness, regression detection, acceptance.
- **Development (work) tests** — `tests/work/**` (or `__tests__/work/**`, `tests/work-*` if the repo prefers). Agent-owned, mutable, for fast feedback, exploration, and tracer-bullet debugging. Purpose: feedback loop `modify → run → observe → modify`.

**Freeze rule (enforce at tool/filesystem level, not just prompt):**

```text
READ:  src/** , tests/authoritative/**
WRITE: src/** , tests/work/**
WRITE tests/authoritative/** = DENIED for Implementer
```

`Don't modify tests` in a prompt is not a boundary. `write_file("tests/authoritative/foo.test.js") → DENIED` is.

If an authoritative failure suggests the test is wrong, the implementer must not edit it. Instead file a **Test Change Request** (`reason + requirement change + expected behavior + affected tests`) to an independent reviewer. Reviewer approves → Test Designer updates → re-freeze.

An optional stronger variant hides a subset of authoritative tests from the implementer entirely (public tests for dev feedback, hidden tests only in CI) to prevent overfitting — same principle as a programming-contest judge.

See `test-first-delivery-generalized` for the operational loop that enforces this (contract → designer → reviewer → freeze → implementer → mutation/adversarial verification).

## Rules of the loop

- **Red before green, and red is owned by the Test Designer.** The failing test is written before implementation, by a role/context that has not seen the implementation. The implementer may create `tests/work/**` probes, but the authoritative red comes from the frozen suite.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle.
- **Refactoring is not part of the loop.** It belongs to the review stage (see the `code-review` skill), not the red → green implementation cycle.
- **Never resolve an authoritative failure by editing the authoritative test.** Fix the implementation, or file a Test Change Request.
