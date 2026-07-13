# Testing Decision Tree (Refactor & Feature Work)

Use this decision tree after implementing behavior changes.

## 1) Does the target area already have automated tests?

- **Yes** → Add/update tests for changed behavior and run them.
- **No** → Continue to step 2.

## 2) Did the user explicitly request no test setup changes?

- **Yes** → Do not bootstrap. Provide a manual validation checklist and call out the automation gap.
- **No** → Continue to step 3.

## 3) Is there an approved, lightweight framework already used in adjacent code?

- **Yes** → Use that framework and add scoped tests.
- **No** → Continue to step 4.

## 4) Repository default for this project

- **API**: Vitest infrastructure exists; create/update Vitest tests. Run only unit tests. Do not run integration or e2e tests.
- **Web**: Playwright E2E infrastructure exists; create/update Playwright tests. Run only unit test from the `web` container. Do not run integration or e2e tests.

## 5) Iteration rule

When automated tests are available and in scope:

1. Run tests.
2. Run coverage for the same scope.
3. Fix failures and coverage gaps.
4. Re-run tests and coverage.
5. Repeat until tests pass and coverage is 100% for the validated scope.

Stop only when tests are green and coverage is 100% for the validated scope, or when a hard blocker is clearly documented.
