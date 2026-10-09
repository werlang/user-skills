# Verification — Freeze, Mutation, and Degraded Modes

Invariant: the implementer never controls the oracle.

## Layout

```text
tests/authoritative/**  # frozen oracle, human-anchored, CI-run
tests/work/**           # mutable scratch, implementer-owned
```

Adapt paths only if the repo already has an established layout. Keep the two-suite invariant. Same runner for both; CI always runs authoritative.

## Freeze and guard (canonical implementation)

After Reviewer approval, capture the freeze baseline: file list + digests of approved authoritative files plus `git status --porcelain -- tests/authoritative` output. Orchestrator re-checks before and after implementer runs and rejects unauthorized edits, deletions, or substitutions. When approved Designer files must stay uncommitted (inseparable test+code shipment per `job-orchestration`), compare before/after manifests with digests instead of denying all dirt — designer-attributed files pass, implementer-attributed changes fail.

Run from repo root and preserve evidence:

```bash
ROOT=$(git rev-parse --show-toplevel) && cd "$ROOT" || exit 1
BASE=$(mktemp) && AFTER=$(mktemp)
find tests/authoritative -type f -exec sha256sum {} + | sort > "$BASE"
git status --porcelain -- tests/authoritative > "$AFTER"; cat "$AFTER"
test ! -s "$AFTER" || { echo "DENIED: authoritative touched by implementer"; cat "$AFTER"; exit 1; }
echo "PASS: authoritative untouched"
```

Why `status --porcelain`: `git diff --name-only HEAD` misses untracked files, so an implementer-created oracle file would pass. Do not use diff-only guards. The printed file list is the evidence required in the done report.

## Test Change Request

Frozen does not mean dogma. Path for a suspect test:

```text
fail -> is test wrong? NO -> fix impl
                    YES -> file TCR (reason + contract change + new literal + affected paths)
                        -> independent reviewer approves -> Designer updates -> re-freeze -> rerun
```

Log in PR description with mirror at repo-root `docs/orchestration/<job-slug>-tcr.md` (matching `job-orchestration` ledger convention). Never edit authoritative to green.

## Designer → Reviewer checklist

Reviewer sees `requirement + tests`, no implementation:

- full Triad per seam with independent literals?
- shallow (`toBeDefined`, `toBeTruthy`, sole call-count) present? Reject.
- recomputed expected (`reduce`-derived, `a+b`)? Reject.
- snapshots (`toMatchSnapshot`, `toMatchInlineSnapshot`, `-u`)? Reject.
- passes for `always-allow`, `always-deny`, off-by-one, missing idempotency/auth/validation? Reject.
- public seams only, no internal mocks?

One send-back max. Do not loop.

## Mutation and sabotage

After green, test the tests.

- **Scoped mutation (preferred when configured):** run only if `stryker.conf.*` exists with a matching language plugin, scoped to touched files. Example: `npx stryker run --mutate "src/features/<slice>/**/*.ts"`. Gate `mutation_score = killed / total >= 0.90`. Below gate = Designer adds tests, re-freeze. If unconfigured, use Fast Sabotage; do not bootstrap without permission.
- **Fast Sabotage (required fallback):** Designer picks 2-3 invariants, mutates one at a time, runs authoritative each time. Every mutation must FAIL. Any silent pass hardens the suite first. Restore code after.

Report shape:

```yaml
verification: { tests: 12, mutations: 3, killed: 3, mutation_score: 1.0,
  sabotage: ["flip >= to > fails", "omit auth guard fails"] }
```

## Hidden-tests variant (Trunk only)

Split authoritative into `public/**` (implementer runs) and `hidden/**` (CI-only). Contest-judge model: prevents overfitting on billing, auth, date logic. Findings from hidden failures go to Designer, not direct impl edits.

## Single-agent fallback (degraded)

No true isolation exists in one context. Apply all of:

1. Label suite and report `[SELF-REVIEW-DEGRADED]`.
2. Author contract + candidate tests in an impl-hidden turn, commit, then implement in a later turn.
3. Keep degraded output under `tests/work/**` unless a human supplies literals or a pre-existing frozen suite exists. Never promote single-context tests to `tests/authoritative/**` on Trunk; Trunk without human oracle is `blocked`.
4. Mandate hidden split when an authoritative claim is made from multi-turn work.
5. Run Designer-picked sabotage. Report `authoritative-unverified, mutation-gated only`. Never claim independence.
