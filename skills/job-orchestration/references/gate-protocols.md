# Gate protocols

Detailed mechanics for the gates in [SKILL.md](../SKILL.md). Load the section a
gate needs when it first runs; the tier table in SKILL.md section 4 decides
which gates apply.

## Contents

- [Test-first gate](#test-first-gate)
- [Commit gate](#commit-gate)

## Test-first gate

Applies to Branch and Trunk tasks. Follow [`testing`](../../testing/SKILL.md)
for the loop itself; these rules make its guards hold in a shared worktree.

1. Define specification-derived rules and the agreed public testing boundary.
2. The independent Test Designer writes acceptance tests from requirements,
   public contracts, and fixtures, without seeing the candidate implementation.
3. Check the tests against the specification (orchestrator for Branch, a
   separate test reviewer for Trunk).
4. Freeze the approved authoritative test set: record the complete path list
   and content digests. Verify the manifest before and after each implementer
   run; reject unauthorized edits, deletions, or substitutions. This guard is
   not native sandboxing.
5. Confirm red for the missing or incorrect behavior, not broken infrastructure.
6. Delegate the smallest implementation to reach green.
7. Run acceptance and relevant regression checks. Review refactoring separately
   and rerun validation afterward.
8. Falsify: Branch runs Fast Sabotage (2-3 invariants picked by the Test
   Designer, each must fail); Trunk runs scoped mutation testing or sabotage.
   Mutate only a disposable copy, never the shared active worktree, and confirm
   the clean implementation still passes.

Use the approved frozen manifest, not `HEAD`, as the test-ownership baseline.
Approved designer changes may remain uncommitted so inseparable tests and
production code ship together. A `HEAD` diff shows changes since a commit, not
who authored them; replace inherited HEAD-relative deny-guard examples with
before/after manifest comparisons. If canonical project policy requires a
conflicting guard, resolve that gate before implementer dispatch.

Measure agreed changed-code and branch coverage where supported; document
exclusions and regressions.

## Commit gate

Before committing a unit, its prerequisite slices must be committed and writers
overlapping its paths must be paused. Then prove the validated state equals the
commit candidate (`HEAD` plus only the staged unit), using the cheapest proof
that holds:

1. **Clean-tree proof (default).** `git status --porcelain` shows no dirty or
   untracked paths besides the staged unit and recorded user-owned paths the
   unit does not depend on. The shared-worktree validation run then counts as
   candidate validation. Record the status output digest with the run.
2. **Disposable candidate copy.** When other uncommitted job work exists that
   the unit could depend on, export the candidate tree (for example
   `git worktree add --detach <tmp> HEAD` and apply `git diff --cached`) and run
   scoped validation there. A shared run that used another task's uncommitted
   dependency is not commit evidence.

Review reuse: when the reviewed manifest digests equal the staged content,
the task review covers the candidate. Otherwise refresh the review for the
changed paths.

After committing, confirm the resulting commit tree matches the validated
candidate and record both in the ledger.
