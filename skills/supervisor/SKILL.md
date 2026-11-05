---
name: supervisor
description: Supervise one coding agent working in another terminal, session, or subagent, and drive it to completion through review. Use when the user says you are an agent's supervisor, tells you to take over an agent that failed, stalled, or misreported its work, or asks you to keep sending a worker back until the result holds up. Owns framing, dispatch, evidence, review allocation, and escalation for a single worker; it is not fleet orchestration.
---

# Supervisor

## Position

One supervisor, one worker. The worker types; you frame, judge, and accept.
Spend your turns on decisions, not on elapsed time.

Do the work directly, without supervising, when either holds:

- The change is smaller than its brief: writing the brief costs more than the
  change.
- Nothing can block on the worker for you. Without `hc wait`, `herdr agent
  wait`, or a background subagent that notifies on completion, you would poll in
  turns, which is the expensive failure this skill exists to avoid.

Move to [`job-orchestration`](../job-orchestration/SKILL.md) when the change
touches auth, money, migrations, or a shared public contract, or when more than
three workers must run. Independent tasks that should run in parallel also go
there; this skill runs them one after another.

## The one rule

> Take a turn when the decision could change what gets committed.

Four things qualify: **framing**, **judgement**, **authority**, **escalation**.
Everything else is a script, a status file, or the worker's job. Reading a
terminal to learn whether something is still running means the rule is broken.

## 1. Isolate before the worker types

Every job lives on a new work branch, and every worker gets its own worktree.
Follow the user's or project's branch, commit, and integration rules; load
[`git-change-workflow`](../git-change-workflow/SKILL.md) when they are unclear.

1. **Baseline.** No commit yet → commit the current state first; no repository →
   `git init` and commit. Without a base commit there is no diff base.
2. **Work branch.** `git branch <type>/<slug> <base>`, without switching the
   user's checkout.
3. **Worker worktree.** `git worktree add .worktrees/<task> -b <type>/<slug>-<task> <type>/<slug>`.
   Keep `.worktrees/` ignored (`.git/info/exclude` when the project's
   `.gitignore` should not change).
4. **Validation must see the worktree.** If validation runs in a container that
   bind-mounts the main checkout, point it at the worktree first. If that is
   impossible, say so in the brief and validate only after the merge.

The worker never commits, switches branches, or stashes. After each accepted
round you commit in the worker's worktree: atomic Conventional Commits, one
logical change each, unless the user's or project's rules say otherwise.

**Close the job.** After the final review passes:

1. Merge each worker branch into the work branch (default `git merge --no-ff`).
   Resolve conflicts yourself, or send them back as a round.
2. Re-run the validation command on the work branch.
3. Remove each worktree (`git worktree remove`), delete each merged worker
   branch (`git branch -d`), and run `git worktree prune`.
4. Close the watcher and worker terminals you created.
5. Delete the status file only after the report below is delivered.

The work branch stays unmerged into the user's branch and is not pushed. Integrating
it is the user's decision.

Read the installed terminal CLI's manual (`hc --skill`, `herdr --help`) before
driving it. Use [`herdr`](../herdr/SKILL.md) for Herdr-managed panes.

## 2. Brief before you spawn

Write the brief first; the template is in
[`references/brief.md`](references/brief.md). Its eight fields are required.

**Preflight.** Before the worker starts, run the validation command in the fresh
worktree and record the exit code and any tests already failing. This catches a
missing database or container before a round is spent, and gives "tests pass" a
baseline.

Deliver the brief as the worker's **first message**. A send to a booting agent
can be dropped. Choose the model at dispatch, not after round one.

## 3. One status file, claims and verdicts

Each task has one append-only file, `.worktrees/state/<task>.status`, outside the
worker's tree, so it is never committed. The worker appends claims; the
supervisor appends verdicts. Nobody rewrites a line.

Worker: `working:`, `done:`, `blocked:`, `needs-decision: <key> <question>`,
`paused: … until <ISO 8601>`. Supervisor: `accepted: <commit> — <what>`,
`rejected: <n> open — <findings>`, and `stalled: <ISO 8601>` when the watcher
confirms a stall.

Read the tail, never the terminal history. The file is the resumable record: it
shows what was claimed, what was judged, and which decision keys exist.

## 4. Wait by blocking, not by turns

The worker must stop when it needs you. After writing `blocked:` or
`needs-decision:`, it ends its turn. The blocking wait then returns, and nothing
depends on the status file being polled.

- `hc wait <t>` (or `hc send <t> <text> --wait`) for an `hc` terminal.
- `herdr agent wait <name>` for a Herdr pane.
- A background subagent notifies on completion; it needs no watcher.

Use a watcher only to catch a stall, which no blocking wait sees. Run it with
`hc run --bg` so it outlives the turn. Its rule:

- Screen changes (`hc read <t>`, hashed), new worktree writes, and new status
  lines reset its stall timer. They never wake you.
- A stall is confirmed when the screen is unchanged, nothing is written, and no
  status line appears for **10 minutes** while the last line says `working:`.
  Put a different threshold in the brief when the task is known to be slow.
- On confirmation, the watcher appends `stalled:` and exits. Its exit is what
  wakes the supervisor, through `hc wait --children any`.

An unchanged screen with no writes and a `working:` line is stuck, not busy.

## 5. Review by proof, not by reading

Accept a round only on evidence you produced. Check in order and stop at the
first failure:

1. Run the validation command yourself and record the exit code. Non-zero →
   append `rejected:` and send the round back. Stop here.
2. Re-run every number the worker claims: timings, counts, coverage.
3. Map each finding from the previous round to a diff hunk, or mark it unaddressed.
4. Only when the mechanical checks pass and a criterion is visual, open the
   screenshot at full size. Otherwise the `shot:` hash and sentence are enough.

Demand proof by action when a claim is hard to verify: "type into the field
without clicking, then screenshot it" settles in one round what prose cannot.

**Context budget.** Read the status tail, the evidence block, and the diff for
the current round. Do not reread earlier transcripts, earlier diffs, or the full
worker terminal. Use the status file as the record of earlier rounds.

## 6. Who reviews

The worker never reviews. The check on each round is yours, against evidence,
and it checks conformance to the brief first, not correctness. That limit is
accepted.

- **Each round:** you, by proof (above).
- **Finished diff, once:** a reviewer that has never seen the rounds, given only
  the brief, the diff from base, and the validation commands. For Leaf and Branch
  work, a clean-context subagent is enough. For Trunk, use a different model
  family, since the same family repeats the same blind spots.
- **Trunk, or any final pass you will defend:** run [`code-review`](../code-review/SKILL.md).

## 7. Bound the loop

One loop bound: **three rounds without net progress** → stop, write `blocked:`
naming the single decision the human must make, and wait. "Net progress" means
the open-finding count went down or a previously open finding closed; renaming a
finding does not count.

Exception: two failed fixes on the same finding → stop that finding and put a
fresh reviewer on it alone. Do not feed that reviewer your narrative.

Targets are fixed too. Label the worker's terminal at spawn (`hc label <t>
task=<id>`). Check the label with `hc get <t>` before each send and refuse to send
on a mismatch. Touch only your own tabs and panes.

## Model allocation

| Work | Model |
| --- | --- |
| Detecting, waiting, classifying | none — a script or a blocking wait |
| Implementation, well specified, cheap to verify | fast/cheap |
| Implementation, UI fidelity or an unfamiliar API | mid or strong |
| Framing, judgement, authority, escalation | strongest available |
| Final review, Trunk | different family |

## Report to the human

State the outcome, the work branch and its commits, the evidence you ran
yourself, and what you did **not** verify. Confirm the cleanup: no worktree,
worker branch, terminal, or status file of this job remains. Never narrate
waiting. If you did not open, run, or read something, say so in one line.

## References

- [`references/brief.md`](references/brief.md): the worker brief, the evidence
  format, and the status-line examples.
- [`references/skill-map.md`](references/skill-map.md): which skills to name in
  the brief for each kind of work.
- [`references/failure-modes.md`](references/failure-modes.md): known ways
  supervision goes wrong.
