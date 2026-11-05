# Worker brief

Write it before spawning the worker, and deliver all of it in the worker's first
message. A follow-up send races the boot and can be dropped.

## The eight fields

1. **Outcome** — one sentence, in the user's terms.
2. **Acceptance criteria** — observable behaviour, each with how it is proven.
3. **Owned files** — exact paths inside your worktree (`.worktrees/<task>`). The
   status file at `.worktrees/state/<task>.status` is the only file outside it
   you may write.
4. **Forbidden writes** — everything else. Also forbidden: commits, branch
   switches, stashes, new agents, panes outside your own tab, deleting files you
   do not own, secrets or credentials in any file or log, and destructive
   commands (`rm -rf`, `git reset --hard`, force pushes). Network access only
   when the outcome requires it, and then say so in the status file.
5. **Validation command** — the exact command and the directory it runs in,
   plus the supervisor's preflight result on the untouched worktree (exit code
   and tests already failing).
6. **Evidence format** — below.
7. **Model and effort** — chosen at dispatch.
8. **Round cap** — three rounds without net progress ends the task. Also state
   the stall threshold if it is not the default of 10 minutes.

## Stop rule

After you write `blocked:` or `needs-decision:`, end your turn and wait. Do not
keep working around the decision.

## Evidence format

Each report is one block, appended to the status file directly after the `done:`
line. The terminal is not the record; its history can be truncated.

```text
changed: <path> — <what>
ran: <command> — exit <code>
number: <claim> — <how it was measured>
unverified: <what you did not check>
```

UI work adds:

```text
shot: <path> md5:<hash> — <one sentence describing what is visible>
```

Proof by action beats prose. "Typed into the field without clicking, then
screenshotted" is evidence; "the field is focused" is not.

## Status file lines

Worker lines are claims. The supervisor appends verdicts after them:

```text
working: implementing the freeze batching
done: added contest-time.js timer; npm test -- --config jest.unit.config.mjs exit 0
blocked: tests need a Postgres instance this worktree does not have
needs-decision: sse-retry Do we retry on 502 as well as a dropped stream?
paused: awaiting review until 2026-11-03T18:00:00Z
rejected: 2 open — timer drifts under load; missing test for the 502 path
accepted: 3f2c1ab — freeze batching with timer and retry tests
stalled: 2026-11-03T18:40:00Z
```

## What the brief is not

Not a plan, not a design document, not a spec. If the work needs a document,
give the worker the document and keep the eight fields as the contract.
