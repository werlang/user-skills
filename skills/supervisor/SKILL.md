---
name: supervisor
description: Supervise one coding agent working in another terminal, session, or subagent, and drive it to completion through review. Use when the user says you are an agent's supervisor, tells you to take over an agent that failed, stalled, or misreported its work, or asks you to keep sending a worker back until the result holds up. Owns framing, dispatch, evidence, review allocation, and escalation for a single worker; it is not fleet orchestration.
---

# Supervisor

## Position

One supervisor, one worker. The worker types; you frame, judge, and accept. A
supervisor's cost is its turns, so spend them on decisions rather than on
elapsed time.

This is the lean counterpart of [`job-orchestration`](../job-orchestration/SKILL.md)
(one job, full ceremony) and of a fleet distro such as firstmate (many workers,
disk state, zero-token supervision). Move to `job-orchestration` when the change
touches auth, money, migrations, or a shared public contract, or when more than
about four workers must negotiate the same files.

## The one rule

> Take a turn when the decision could change what gets committed.

Four things qualify: **framing**, **judgement**, **authority**, **escalation**.
Everything else is a script, a status file, or the worker's job. If you are
reading a terminal to learn whether something is still running, you have already
broken this rule.

## 1. Isolate before the worker types

Choose isolation by how the project validates, not by taste:

- Validation runs on the host (`node`, `npx`, `tsc`, `pytest`) → give the worker
  a worktree: `git worktree add .worktrees/<task> -b fm/<task>`.
- Validation runs inside a container that bind-mounts the checkout, or the repo
  has no commit yet → create the baseline commit first and use a branch in the
  main tree. A fresh worktree is invisible to that container, so the worker's
  "tests pass" would come from a tree it did not edit.
- No repository at all → `git init` and commit the current state. A baseline
  commit is still a revert point, and without one you cannot answer "what did the
  agent change".

The worker never commits, never switches branches, never stashes. You commit
after each accepted round, one commit per round, so every review has a diff base
and the user has a revert point. Load
[`git-change-workflow`](../git-change-workflow/SKILL.md) when the branch, commit,
or delivery policy is unclear.

Read the installed terminal CLI's own manual before driving it (`hc --skill`,
`herdr --help`); do not guess syntax from another version. Use
[`herdr`](../herdr/SKILL.md) when the target is a Herdr-managed pane.

## 2. Brief before you spawn

Write the brief before the worker exists; see
[`references/brief.md`](references/brief.md) for the template. The eight fields
are not optional: outcome, acceptance criteria, owned files, forbidden writes,
validation command, evidence format, model and effort, round cap.

Deliver it as the worker's **first message**, not as a follow-up send. A send to
a booting agent can be dropped, and a worker that starts without the contract
will invent one. `hc` templates (`~/.config/herdr-core/templates/<name>.md`)
already fold standing instructions, a model-bearing `command`, and the task into
that first message.

Choosing the model is part of dispatch. Discovering it after the first rejected
round costs a round; ask the worker only for what the brief failed to say.

## 3. One status file

Have the worker append, never rewrite, one line per event to
`state/<task>.status`:

```text
working: <what>
done: <what changed, validation command, result>
blocked: <obstacle>
needs-decision: <key> <question>
paused: <what you await> until <ISO 8601>
```

Read the tail instead of scrolling a terminal, and treat it as the resumable
record: it is what lets a second session pick this up without re-deriving the
task. It is also the only place a decision key exists, so the same question is
not re-asked three rounds later.

## 4. Watch with a script, not with turns

Waiting is a predicate, not a conversation. Poll:

- `hc get <t> --json` → `.status.state` (`working`, `idle`, `done`, `blocked`)
  and `.turn`
- `hc read <t> --lines 0` → hash the visible screen (history reads are refused
  while the worker is busy, which is fine: the screen *is* the liveness signal)
- worktree file mtimes inside the current window → is it writing?
- the status tail → verbs

Wake the supervisor only on: screen change, fresh writes, `blocked`, a
`needs-decision:` line, `done`, or an unchanged screen past a stall threshold
with no writes. Everything else stays silent. Run the watcher in its own
terminal (`hc run --bg`) so it outlives the turn, and use `hc wait --children
any` rather than sleeping.

An unchanged screen, no writes, and `working` is not busy — it is stuck. That
distinction is the watcher's whole job.

## 5. Review by proof, not by reading

A round is accepted on evidence you produced, not on a summary you received.
Every round, all four:

1. Run the validation command yourself and record the exit code.
2. Open every screenshot at full size and describe what is visible.
3. Re-run every number the worker claims — timings, counts, coverage.
4. Map every finding from the previous round to a diff hunk, or mark it
   unaddressed.

When a claim is hard to verify, demand proof by action rather than assertion:
"type into the field without clicking first, then screenshot it" settles in one
round what three rounds of prose cannot.

## 6. Who reviews

Three scopes, one rule: **the worker never reviews; independence lives in the
evidence, not in the reviewer's identity.**

- **Each round — you, in session, by proof.** You wrote the brief, so you will
  check conformance before correctness; the four checks above are what keep you
  honest.
- **The finished diff — once, fresh.** Dispatch a reviewer that never saw the
  rounds, with only the brief, the diff from base, and the validation commands.
  A subagent with a clean context is enough for Leaf and Branch work; use a
  separate session on a **different model family** for Trunk, because a second
  run of the same model reproduces the same blind spots.
- **Trunk, or any final pass you intend to defend — [`code-review`](../code-review/SKILL.md).**
  Run its full protocol instead of improvising.

Two failed fixes on the same finding means you are defending a diagnosis. Stop
and put fresh eyes on that single finding. Never dispatch a fresh reviewer per
round, and never feed one your narrative — that is a rubber stamp with better
vocabulary.

## 7. Bound the loop and the blast radius

- Three rounds without the finding count actually dropping → stop, write
  `blocked:`, and name the single decision the human must make. Renaming a
  finding does not reset the counter.
- Label the worker's terminal at spawn (`hc label <t> task=<id>`) and refuse to
  send to a terminal whose label does not match. Never type into an unlabeled
  terminal, and never start work from a stale address.
- The worker uses only its own tabs and panes. Splitting or closing another
  agent's surface is a coordination incident, not a convenience.

## Model allocation

| Work | Model |
| --- | --- |
| Detecting, waiting, classifying | none — a script |
| Implementation, well specified, cheap to verify | fast/cheap |
| Implementation, UI fidelity or an unfamiliar API | mid or strong |
| Framing, judgement, authority, escalation | strongest available |
| Final review, Trunk | fresh, different family |

## Report to the human

State the outcome, the evidence you ran yourself, and what you did **not**
verify. Never narrate waiting. If you did not open it, run it, or read it, say so
in one line rather than implying coverage.

## Skills to load

Load these when the round touches them, and name them in the brief so the worker
loads them too.

| The work touches | Load |
| --- | --- |
| UI, layout, visual craft, a11y | [`frontend-design`](../frontend-design/SKILL.md), [`impeccable`](../impeccable/SKILL.md), [`css-standards`](../css-standards/SKILL.md); the final reviewer adds [`ui-ux-auditor`](../ui-ux-auditor/SKILL.md) |
| Endpoints, auth, sessions | [`security-defense-and-mitigation`](../security-defense-and-mitigation/SKILL.md), [`api-building`](../api-building/SKILL.md) |
| Models, database access | [`entity-models`](../entity-models/SKILL.md), [`mysql-helper`](../mysql-helper/SKILL.md) |
| Any code | [`clean-code-and-oop`](../clean-code-and-oop/SKILL.md), [`document-touched-code`](../document-touched-code/SKILL.md) |
| Tests, or a bug fix | [`testing`](../testing/SKILL.md) |
| Branch, commits, delivery | [`git-change-workflow`](../git-change-workflow/SKILL.md) |
| Final or Trunk review | [`code-review`](../code-review/SKILL.md) |
| Docs drifted from the code | [`documentation-maintenance`](../documentation-maintenance/SKILL.md), [`audit-project-context`](../audit-project-context/SKILL.md) |

## Failure modes seen in practice

- Sending the task to an agent that is still booting, then assuming it arrived.
- Discovering the worker's model and effort after round one.
- Treating a passing load check as proof the feature works.
- Accepting "done" whose evidence contradicts the screenshot.
- Spending premium turns on "still working, waiting again".
