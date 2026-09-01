# Independent Verification — Freeze, Mutation, and Adversarial Reference

This reference details the permission and verification mechanics for Independent Verification TDD (IV-TDD). The invariant: **the implementer never controls the oracle**.

## 1. File Layout

```text
tests/
  authoritative/          # system-owned, frozen — the oracle
    order-cancellation.test.js
    user-checkout.test.js
  work/                   # agent-owned, mutable — feedback loop
    order-cancellation.work.test.js
    scratch-*.test.js
```

If the repo already uses a different convention, adapt paths but keep the two-suite invariant. Both suites run through the same runner; CI always runs `authoritative`.

## 2. Permission Boundary (tool/file level)

```text
Test Designer / Reviewer:
  READ:  requirement, contract, public interfaces, existing authoritative tests
  WRITE: tests/authoritative/**

Implementer:
  READ:  src/** , tests/authoritative/** , requirement, contract
  WRITE: src/** , tests/work/**
  DENY:  tests/authoritative/**
  RUN:   tests/authoritative/** , tests/work/**
```

Prompt-only guards fail. Enforce one of:

- Filesystem deny (subagent `write_file` tool without `tests/authoritative/**`).
- Orchestrator wrapper that rejects `write_file("tests/authoritative/...")`.
- Pre-commit / pre-run guard: `git diff --name-only | grep -q "tests/authoritative" && echo "DENIED: implementer touched authoritative" && exit 1`.

## 3. Test Change Request (controlled mutability)

Immutable does not mean dogma. Requirements change. The path is:

```text
Authoritative failure → is test wrong?
  NO  → fix implementation
  YES → file Test Change Request:
          - reason
          - requirement/contract change
          - expected behavior (new literal)
          - affected test IDs/paths
        → independent reviewer (not the implementer) approves/rejects
        → if approved, Test Designer updates tests/authoritative/**
        → re-freeze (commit) → implementer re-runs
```

Log the request in `verification/test-change-requests.md` or the PR description.

## 4. Designer → Reviewer Checklist

Reviewer receives `requirement + tests` (no implementation) and answers:

- Could the suite pass if the feature always succeeds / always fails?
- Could it pass with an off-by-one boundary (e.g., `>` vs `>=`, `30*24h` vs calendar days)?
- Could it pass if idempotency, auth, or validation were missing?
- Are expected values independent literals from the spec, or recomputed like the implementation?
- Are seams public? Any mocking of internal collaborators?

Send back to Designer once if needed; do not loop indefinitely.

## 5. Mutation Testing

After authoritative is green:

```bash
# example with StrykerJS (Vitest/Jest)
docker compose run --rm api npx stryker run
# or vitest coverage + custom mutation step
```

Mutations: `>=`→`>`, `===`→`!==`, remove guard, invert boolean, alter boundary, drop validation.

```yaml
verification:
  tests: 47
  mutations: 83
  killed: 79
  survived: 4
  mutation_score: 0.952
```

Gate: `mutation_score >= 0.90`. If lower, treat as insufficient suite — Designer adds tests, re-freeze. Coverage 100% with low mutation score is still a gap.

## 6. Adversarial Verifier (optional)

For complex business rules, spawn a verifier with `requirement + implementation + authoritative tests`:

> "Find a behavior that violates the specification but is not detected by the authoritative tests."

Output: `verification/findings.md`

```markdown
Finding #1 — boundary is 30*24h, not calendar days
  purchase = 2026-01-01T23:00
  cancellation = 2026-01-31T00:30 → currently allowed, should be rejected
  Suggested test: ...
```

Findings go to the Designer, not the implementer. Designer adds a frozen test.

## 7. Hidden-Tests Variant

Prevent overfitting by splitting authoritative into:

```text
tests/authoritative/public/**  → visible to implementer (dev feedback)
tests/authoritative/hidden/**  → only CI runs it
```

Like an AutoJudge: contestant sees sample tests, judge runs hidden tests. Useful for high-risk utilities, billing, and date/time logic.

## 8. Single-Agent Fallback

When subagents are not available:

1. Create contract.
2. In an isolated turn, hide `src/**` implementation files, generate authoritative tests, commit them.
3. Start a new turn as implementer with `tests/authoritative/**` write-denied.

The isolation matters more than the number of models.
