# Job record templates

Create these files inside the agreed job worktree before task execution. Replace
the placeholders with actual job data. Adapt fields to the project without
removing ownership, evidence, approvals, or resumption information. Fill
tier-dependent fields only when the task's tier requires that gate; write `n/a
(<tier>)` instead of leaving them blank.

## Contents

- [Specification template](#specification-template)
- [Context digest template](#context-digest-template)
- [Ledger template](#ledger-template)
- [Worker brief template](#worker-brief-template)

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
- Requested worker models/harnesses and resolved IDs (if any):
- Task tiers and rationale (Trunk / Branch / Leaf):
- Testing boundaries, authoritative test ownership, and approved-manifest freeze guard:
- Baseline checks and coverage targets/exclusions:
- Required integration/runtime/browser/migration checks:
- Human approval gates:
- Execution limits and escalation policy:

## Architecture
- Verified current behavior:
- Agreed proposed changes:

## Scope changes and approvals
| Date | Change/approval | User authorization | Affected criteria/tasks |
| --- | --- | --- | --- |

## Related records
- [Context digest](<job-slug>-context.md)
- [Task ledger](<job-slug>.md)
```

## Context digest template

Save as `docs/orchestration/<job-slug>-context.md`. Every worker brief links
here instead of repeating project context. Keep it short and verified; update
it when facts change and note the change in the ledger.

```markdown
# <Job title> — worker context

- Worktree path, branch, and base commit:
- Canonical instructions to follow (paths):
- Architecture map (modules, layers, key entry points):
- Conventions (naming, error handling, file layout):
- Commands: install / test (single file and full) / lint / typecheck / build / run:
- Test layout and fixtures:
- Known baseline failures (not caused by this job):
- Specification: [spec](<job-slug>-spec.md)
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
- Current pinned review base (SHA or manifest digest):
- Current wave and active workers (may they still write?):
- Last update:
- Next safe executable action:

## Baseline and preservation
- Pre-existing user changes and agreed handling:
- Baseline checks, results, and unrelated failures:
- Evidence log directory (redact secrets):

## Task graph and status
| ID | Tier | Outcome / criteria | Dependencies | Wave | Owner / agent ID | Write scope | State | Evidence | Commits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T-01 | Branch | | | 1 | | | planned | | |

### T-01 — <Outcome>
- Tier rationale and acceptance criteria/non-goals:
- Contracts and affected files/interfaces:
- Starting revision:
- Authoritative tests and frozen manifest digest (Branch/Trunk):
- Red / green / falsification evidence (command, exit code, log path):
- Reviews: round, reviewer agent ID, pinned state, findings:
- Fix attempts and shared assumption tested after two failures:
- Commit proof (clean-tree or candidate copy), commit SHA, tree match:
- Blocker or next action:

## Findings register
| ID | Task / round | Severity / location | Failure scenario and evidence | State | Fix/rejection justification | Verified state |
| --- | --- | --- | --- | --- | --- | --- |

## Validation runs
| Time | Task / gate | File state | Command | Exit code | Log path | Gap |
| --- | --- | --- | --- | --- | --- | --- |

## Event and decision log
| Time | Event / decision | Affected tasks | Evidence / spec decision ID |
| --- | --- | --- | --- |

## Blockers and resumption
- Unresolved findings, stalled rounds, and attempted approaches:
- Required user decision/access:
- Changes that invalidate prior approvals:

## Final delivery
- Acceptance-criterion mapping and task completion:
- Integrated validation, coverage, and full final review result:
- Commits and any job-owned uncommitted paths:
- Approved exclusions/limitations:
- Worktree retained for user inspection:
```

## Worker brief template

Send as the subagent task body. Keep it self-contained but short: link the digest
and spec rather than pasting them.

```markdown
# <Task ID> — <role: implementer | test designer | reviewer | fixer> (<tier>)

Context: read docs/orchestration/<job-slug>-context.md first.
Working directory: <path>   Starting revision: <SHA or manifest digest>

## Goal
<Outcome and the acceptance criteria IDs, quoted from the spec>

## Contract
<Public interfaces, inputs/outputs, error behavior this task must honor>

## Ownership
- May write: <paths>
- Must not write: authoritative tests (unless test designer), unrelated files
- Never: commit, push, merge, switch branches, rewrite history

## Skills to load
<Skill names from SKILL.md section 5, plus the must-hold rules inlined>

## Validation to run
<Exact commands; send output to <log dir>/<task>-<step>.log>

## Report (structured, max ~30 lines)
- Changed files
- Acceptance evidence: command, exit code, log path
- Findings (reviewers): ID, severity, file:line, failure scenario, evidence, fix — max 10
- Uncertainties and blockers
```
