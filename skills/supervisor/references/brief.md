# Worker brief

Write it before spawning the worker, and deliver the whole thing in the worker's
first message. A follow-up send races the boot and can be dropped.

## The eight fields

1. **Outcome** — one sentence, in the user's terms.
2. **Acceptance criteria** — observable behaviours, each with how it is proven.
3. **Owned files** — exact paths or directories the worker may write.
4. **Forbidden writes** — everything else, plus: no commit, no branch switch, no
   stash, no new agents, no panes outside your own tab.
5. **Validation command** — the exact command and the directory it runs in.
6. **Evidence format** — as below.
7. **Model and effort** — chosen at dispatch, not discovered later.
8. **Round cap** — three rounds without net progress ends the task.

## Evidence format

Every report, one block:

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

## Status file

`state/<task>.status`, append-only, one line per event:

```text
working: implementing the freeze batching
done: added contest-time.js timer; npm test -- --config jest.unit.config.mjs exit 0
blocked: tests need a Postgres instance this worktree does not have
needs-decision: sse-retry Do we retry on 502 as well as a dropped stream?
paused: awaiting review until 2026-11-03T18:00:00Z
```

## What the brief is not

Not a plan, not a design document, not a spec. If the work needs a document,
hand the worker the document and keep the eight fields as the contract.
