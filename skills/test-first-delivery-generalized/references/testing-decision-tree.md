# Testing Decision Tree (Refactor & Feature Work)

Use this decision tree after establishing the behavioral contract. It assumes Independent Verification TDD: authoritative tests are the oracle.

## 1) Does the target area already have authoritative tests (`tests/authoritative/**`)?

- **Yes → Frozen.** Do not edit them as the implementer. Run them.
  - If a failure suggests the test is wrong, file a **Test Change Request** (`reason + requirement change + expected behavior + affected tests`) to an independent reviewer. Reviewer → Test Designer → re-freeze.
  - The implementer may add `tests/work/**` probes for debugging, but those never replace authoritative tests.
- **No authoritative suite, but legacy tests exist →** Treat legacy tests as non-authoritative (do not edit them to make the suite green). Create a new authoritative suite via Phase 1-3 (Designer → Reviewer → Freeze), then implement against it.
- **No tests at all →** Continue to step 2.

## 2) Did the user explicitly request no test setup changes?

- **Yes** → Do not bootstrap. Provide a manual validation checklist and call out the automation gap.
- **No** → Continue to step 3.

## 3) Is there an approved, lightweight framework already used in adjacent code?

- **Yes** → Use that framework to create the authoritative suite (Phase 1) and any scoped `tests/work/**` probes.
- **No** → Continue to step 4.

## 4) Repository default for this project

- **API**: Vitest infrastructure exists; create/update Vitest tests. Run only unit tests. Do not run integration or e2e tests.
- **Web**: Playwright E2E infrastructure exists; create/update Playwright tests. Run only unit test from the `web` container. Do not run integration or e2e tests.

In both defaults, authoritative tests go in `tests/authoritative/` and work tests in `tests/work/`.

## 5) Iteration rule

When authoritative tests are available and in scope:

1. Run authoritative tests (`tests/authoritative/**`).
2. Run work tests separately (`tests/work/**`) if any.
3. Run coverage for the validated scope.
4. Run mutation testing and compute `mutation_score = killed / total`.
5. Fix **implementation** failures and gaps (never authoritative tests).
6. Re-run authoritative + coverage + mutation.

Stop only when:
- authoritative suite is green,
- `mutation_score ≥ 0.90` (or gap is acknowledged in the validation report), and
- coverage is 100% for the validated scope — or when a hard blocker is clearly documented.

Never achieve green by editing authoritative tests. If the suite is insufficient (survived mutants, adversarial finding), send the finding back to the Test Designer.

## 6) Hidden-tests variant (optional)

For high-risk logic or to prevent overfitting, keep a subset of authoritative tests hidden from the implementer (implementer sees `public authoritative` for feedback, CI additionally runs `hidden authoritative`). Same judge principle as contest AutoJudge — the contestant doesn't modify the judge.
