# Job record templates

Create these files inside the agreed job worktree before task execution. Replace
the placeholders with actual job data. Adapt fields to the project without
removing ownership, evidence, approvals, or resumption information.

## Contents

- [Specification template](#specification-template)
- [Ledger template](#ledger-template)

## Specification template

Save as `docs/orchestration/<job-slug>-spec.md`.

```markdown
# <Job title> — specification

## Objective and scope
- Outcome:
- In scope:
- Out of scope:
- References and precedence:
- Compatibility/refactoring policy:

## Acceptance criteria
| ID | Observable outcome | Public boundary | Required verification |
| --- | --- | --- | --- |
| AC-01 | | | |

## Confirmed decisions and assumptions
| ID | Decision or bounded assumption | Rationale | User confirmation/date |
| --- | --- | --- | --- |
| D-01 | | | |

## Execution and quality contract
- Grilling: required/explicitly skipped; shared-understanding confirmation:
- Worktree strategy and any user override:
- Per-role worker harness/model assignments and resolved IDs (implementer, tester, reviewers, fixers, docs):
- Testing boundaries, authoritative test ownership, and approved-manifest freeze guard:
- Baseline checks and coverage targets/exclusions:
- Required integration/runtime/browser/migration checks:
- Human approval gates:
- Execution limits and escalation policy:

## Architecture and project context
- Verified current behavior:
- Agreed proposed changes:
- Project-local skills/docs to prepare:

## Scope changes and approvals
| Date | Change/approval | User authorization | Affected criteria/tasks |
| --- | --- | --- | --- |

## Execution ledger
[Task ledger](<job-slug>.md)
```

## Ledger template

Save as `docs/orchestration/<job-slug>.md`.

```markdown
# <Job title> — orchestration ledger

## Current checkpoint
- Specification: [Job spec](<job-slug>-spec.md)
- Overall status: exploring/grilling/active/blocked/complete
- Worktree path and backing branch:
- Starting base commit and latest integration commit:
- Current verified file snapshot/digests and review base:
- Last update:
- Next safe executable action:

## Baseline and preservation
- Pre-existing user changes and agreed handling:
- Baseline checks, results, and unrelated failures:
- Evidence locations (redact secrets):

## Task graph and status
| ID | Outcome / criteria | Dependencies | Owner / agent ID | Write scope | State | Review / evidence | Commits |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T-01 | | | | | planned | | |

### T-01 — <Outcome>
- Acceptance criteria and non-goals:
- Public contracts and affected files/interfaces:
- Risk and required approval:
- Working directory, starting revision, and worker context (harness/model):
- Required commands/checks:
- Authoritative tests, reviewer approval, and frozen content digests:
- Frozen test guard baseline (approved complete manifest, not HEAD):
- Red evidence, implementation result, and green/regression evidence:
- Reviews: round, reviewer/agent ID, exact file state, and findings:
- Fix attempts and regressions:
- Integration result and semantic commit(s):
- Committed prerequisites, prospective commit tree ID, and exact-candidate validation/review:
- Resulting commit tree ID and match to validated candidate:
- Blocker or next action:

## Findings register
| ID | Task / round | Severity / location | Failure scenario and evidence | State | Fix/rejection justification | Verified state |
| --- | --- | --- | --- | --- | --- | --- |

## Validation runs
| Time | Task / gate | Exact file state | Command / check | Exit code / observed result | Evidence | Gap |
| --- | --- | --- | --- | --- | --- | --- |

## Event and decision log
| Time | Event / decision | Affected tasks | Evidence / spec decision ID |
| --- | --- | --- | --- |

## Blockers and resumption
- Active workers and whether they may still write:
- Unresolved findings, stalled rounds, and attempted approaches:
- Required user decision/access:
- Ready independent tasks and exact next steps:
- Changes that invalidate prior approvals:

## Final delivery
- Acceptance-criterion mapping and task completion:
- Integrated validation, coverage, and final independent reviews:
- Commits and any job-owned uncommitted paths:
- Approved exclusions/limitations:
- Worktree retained for user inspection:
```
