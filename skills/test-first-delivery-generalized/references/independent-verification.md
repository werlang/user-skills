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

## 2. Permission Boundary

The implementer does not own or modify authoritative tests. Because agent tools lack native filesystem-level write denial, the orchestrator enforces this boundary before accepting any implementer work:

```bash
git diff --name-only HEAD -- tests/authoritative | grep -q . && echo "DENIED: authoritative touched by implementer" && exit 1
```

If an implementer touches `tests/authoritative/**`, the orchestrator immediately rejects the diff.

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

- Is the full **Falsification Triad** present for each seam (Golden Happy Path with independent literal, Boundary/Edge transition, Negative/Rejection)?
- Are there shallow existential assertions (`toBeDefined()`, `toBeTruthy()`) or assertions on mock call counts alone? If so, reject.
- Are expected values independent literals from the spec, or recomputed like the implementation? (Reject `const expected = items.reduce(...)`).
- **Are snapshot tests present?** Reject `toMatchSnapshot()`, `toMatchInlineSnapshot()`, or `-u` / `--updateSnapshot`. All authoritative expectations must be explicit literals.
- Could the suite pass if the feature always succeeds / always fails?
- Could it pass with an off-by-one boundary (e.g., `>` vs `>=`, `30*24h` vs calendar days)?
- Could it pass if idempotency, auth, or validation were missing?
- Are seams public? Any mocking of internal collaborators?

Send back to Designer once if needed; do not loop indefinitely.

## 5. Mutation Testing & Fast Sabotage

After authoritative is green, test the tests to ensure they actually detect defects.

### 5.1 Automated Mutation Testing (Preferred when Configured)

Run only if `stryker.conf` exists or after explicit configuration; scope strictly with `--mutate <touched-files>` (never run unconstrained on the entire repository):

```bash
# example with StrykerJS (Vitest/Jest)
npx stryker run --mutate "src/features/order-cancellation/**/*.ts"
# or containerized if runtime is container-based
docker compose run --rm <service> npx stryker run --mutate "src/features/order-cancellation/**/*.ts"
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

### 5.2 Fast Sabotage Litmus Test (Lightweight Required Gate when Stryker Unconfigured)

When full mutation suites are unconfigured or slow in containerized environments:
1. Identify 2–3 core invariants in the implementation (e.g. boundary comparison `>=` vs `>`, validation/auth guard, return shape).
2. Manually mutate one invariant at a time in the code.
3. Run the authoritative test suite against each mutation.
4. **Litmus Invariant:** Every single mutation MUST produce a failing test. If any mutation passes silently, the suite is toothless and must be hardened before acceptance.
5. Restore production code once verified.

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

## 8. Single-Agent Fallback (Degraded)

When subagents or multiple sessions are unavailable, single-agent execution cannot provide true information-flow isolation. Apply these compensatory controls:

1. Mark all test suites and the validation report as `[SELF-REVIEW-DEGRADED]`.
2. Do Phase 1–3 in an isolated turn with implementation code hidden, create authoritative tests, and commit them.
3. **Mandate the Hidden-Tests Split**: Split tests into `tests/authoritative/public/**` (implementer runs) and `tests/authoritative/hidden/**` (CI-only, withheld from implementer turn).
4. Execute the Fast Sabotage Litmus Test (perturb 2–3 invariants). Do not claim IV-TDD independence; report as `authoritative-unverified, mutation-gated only`.
