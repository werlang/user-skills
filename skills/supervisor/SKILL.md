---
name: supervisor
description: Supervise one coding agent working in another terminal, session, or subagent, and drive it to completion through review. Use when the user says you are an agent's supervisor, tells you to take over an agent that failed, stalled, or misreported its work, or asks you to keep sending a worker back until the result holds up. Owns framing, dispatch, evidence, review allocation, and escalation for a single worker; it is not fleet orchestration.
---

# Supervisor

## Position

One supervisor, one worker. The worker types; you frame, judge, and accept.
Spend your turns on decisions, not on elapsed time.

**Authority once granted is not re-requested.** When the director signs off the scheme and
says go — "você é o chefe", "manda ver", "delegue para X" — that is permission to decide and
dispatch, not an invitation to send a plan for approval. Bring decisions back as outcomes with
the tradeoff in one line; asking again after that reads as stalling and is the fastest way to
lose the mandate. The exceptions are the ones that were never yours: product rules that change
money, a direction the user owns (taste, naming, which app replaces which), and anything
irreversible outside the branch.

Do the work directly, without supervising, when either holds:

- The change is smaller than its brief: writing the brief costs more than the
  change.
- Nothing can block on the worker for you. Without `hc wait`, `herdr agent
  wait`, or a background subagent that notifies on completion, you would poll in
  turns, which is the expensive failure this skill exists to avoid.

Route job-level decisions through [`tech-lead`](../tech-lead/SKILL.md); the
tech lead owns the job, and the supervisor owns the round. This skill drives
one worker at a time; the tech lead coordinates independent tasks.

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
5. **The worktree materializes only tracked files.** A contract the worker must
   read (spec, brief, ADR, schema) that is gitignored or was never committed does
   not exist in the worker's checkout: the worker burns its first minutes
   searching other directories, then proceeds on assumptions. Before dispatch,
   `git -C .worktrees/<task> ls-files | grep -i <spec>`; commit what is missing
   (a spec belongs in history anyway) or copy it in and treat the copy as
   untracked.
6. **Put the brief inside the worktree.** A one-shot CLI worker reads from disk,
   and permission rules frequently deny reads outside its working directory — a
   denied read is indistinguishable from a brief nobody opened. Write
   `.brief-<task>.md` in the worktree, keep it out of the commit, and refer to it
   by relative path in the dispatch message.
7. **A worker with a shell can scaffold into the parent checkout.** One `cd` to
   the repository root and it creates `src/`, `package.json`, a lockfile and a
   test tree two levels above its worktree — invisible to the worktree's
   `git status`, invisible in the status file, and one `git add -A` away from
   being committed by you. After every round run `git status --short` in the main
   checkout as well as in the worktree, and delete stray scaffolding before
   reviewing the round.

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

**Read the brief as the build will.** Every version it names must agree with
every other one — a compile-SDK floor against the dependencies that demand a
higher one, a Kotlin minimum against the artifacts, a Gradle minimum against the
plugin. A contradiction costs a full build round. Also name the exact validation
command, so a later round cannot quietly shrink it.

**Name the reference implementation and quote its tree.** When the director says
"mirror project X", the brief carries X's real layout — package roots, folder
spelling (`route/` vs `routes/`, `middleware/` vs `middlewares/`), file names,
router and error conventions, test runner — read out of the repository, not
remembered from a generic template. A worker free to invent scaffolding produces
 a tree that is discarded whole: the moment files land in the wrong place, stop
 that round instead of reviewing a layout you already know will be thrown away.
The same rule covers a premise that changes mid-flight: when the director swaps
an architectural decision (a different reference project, a different driver)
while the round is running, the round is already invalid — kill the process, fix
the brief, dispatch again. Letting it finish to "see what it produces" buys code
you will delete and a review nobody reads.

**Say which contract wins where they disagree.** Mirroring a house style and
honouring the product spec collide in predictable places — error envelope shape,
route naming, auth model, folder spelling. Put one line in the brief ("the spec
wins on the error envelope; the house style wins on layer layout") and name every
difference you already know. Without it the worker faithfully copies the
reference project and the independent reviewer rejects the round as a spec
violation, which costs a full round for one sentence you could have written.

Deliver the brief as the worker's **first message**. A send to a booting agent
can be dropped, and a CLI that self-updates on start eats the first Enter, so the
text can sit in the input box looking delivered. Send the text, send Enter as its
own keystroke, then confirm the agent is working: a first `working:` line in the
status file, or a visible working state. Do not count an unconfirmed dispatch as
a started job. Choose the model at dispatch, not after round one.

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

**A `done:` line is a claim; the diff is the fact.** A round that says a finding
is resolved can coexist with the original unfiltered call site — the worker
patched the helper and left the caller, or the other way round. Grep the
*enforcement point* named by the finding (the guard, the filter, the branch) and
quote the line you found, instead of accepting the sentence that says it exists.
Build that diff with `git add -A -N` before `git diff <base>`: a round whose work
is all new files otherwise diffs to nothing, and "the fact" is empty.

**A verdict written before you consumed the delegator's findings is void.** If a
human or lead sends findings while the supervisor pane is mid-turn, the message
can be appended to the input and skipped; the pane then writes `accepted:` as if
nothing arrived. Re-open it — append `rejected: <n> open — <the unanswered
findings>` and drive one more round — and never defend the acceptance by citing
the suite that was green for the smaller scope. Two habits prevent it: send
findings only when `hc get` reports the pane idle, and re-read the status tail
after every verdict rather than trusting the screen that scrolled.

Demand proof by action when a claim is hard to verify: "type into the field
without clicking, then screenshot it" settles in one round what prose cannot.

**Each evidence class is produced where its tooling lives.** A worker CLI with no
browser cannot screenshot a UI, and a supervisor on another host cannot see the
served tree; planning both criteria into one round leaves them unprovable and the
reviewer rejecting on measurement rather than on product. Say in the brief which
actor produces which evidence — the worker the code and the tests, the driving
agent the screenshots — and keep the acceptance wording identical so the split is
mechanical.

**A metric that cannot observe the artifact is not evidence.** Reading a WebGL
canvas with `drawImage` returns an empty buffer unless the context kept its
drawing buffer, so `coverage: 0` says nothing about whether a model rendered, and
an alpha-only coverage also cannot tell two differently coloured swatches apart —
hash the RGB. Capture the screen region (animation paused) and compare hashes;
accept a pixel-coverage number only from a 2D canvas you know paints its pixels.

**A reviewer that cannot install the toolchain still owes you a repro.** When the review host has no
network, a reading-only pass degrades into style commentary. Require throwaway scripts that import the
project's own modules against an in-memory store (SQLite, a fake transport) and reproduce each suspected
defect, plus one mutation per finding: restore the bug in the scratch copy and watch the probe or test
go red. A finding that arrives with a repro is actionable; one that arrives as prose is a question.

**A round that touched a client is not accepted on its stub.** A stubbed peer accepts whatever shape the
view model happens to produce, so a screen can pass its whole suite while the real API rejects the first
missing field (a line id, a description, an ISO instant with an offset). Before accepting, boot the real
service and drive the flow once; the payload mismatch and the deployment-only config bug (an `Origin` or
host the two processes must agree on) both show up only there, and both are invisible to unit tests.

**Context budget.** Read the status tail, the evidence block, and the diff for the
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

**The closing pass is a different brief from the first one.** A reviewer told to
re-read the whole contract spends its budget re-approving what was already
approved. Send it the previous `findings` file, the diff from base and the gate
commands, and require a numbered verdict line per finding — `F1 fechado` /
`parcial` / `aberto`, each with the enforcement point (`file:line`) and the probe
that now fails without the fix. Fixes are only real when someone restored the bug
and watched the test go red; a test written next to a fix can assert the new
behaviour and still pass with the old bug in place.

**Say what quorum accepts, and what happens to the leftovers.** Put it in the
closing brief (`APPROVE` with at most N mediums) so the verdict is a decision and
not a negotiation after the fact. A medium that the closing pass discovers and
that is not a regression of the round is a next-round item: record it in the
status file against the round that will carry it, or it vanishes with the branch.
Hold the round only for highs, for a broken contract, or for anything that moved
money.

## 7. Bound the loop

One loop bound: **three rounds without net progress** → stop, write `blocked:`
naming the single decision the human must make, and wait. "Net progress" means
the open-finding count went down, a previously open finding closed, **or the
severity mix did** (four highs to one high is a round that bought something);
renaming a finding does not count.

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

**The conversation and the decision are separate cost centres.** Keep the chat
session on the cheap model — exploration, ops, environment work and single
mechanical edits live there — and when an intent becomes a delivery, run the
deciding turn as one dedicated one-shot call on the strongest reasoner (whichever
non-interactive entry point your agent CLI offers: `claude -p`, `codex exec`, or
the host agent's own one-shot flag), then hand execution back to the cheap worker.
Say which call decided and what it returned; silence about it is how a cheap model
ends up owning an irreversible choice nobody audited.

**Take the pair the user names for this job, and probe it before framing.**
Supervisor and worker models change between jobs (`codex exec -m <id> -c
model_reasoning_effort="medium"`, `opencode run --auto -m
<provider>/<model>#<tier>` where the `#` suffix is the reasoning tier, `claude -p
--model <alias> --effort <tier>`). Each entry point has its own model universe: a
model reachable in one CLI is often absent from another host's gateway. One
one-line probe per binary (`"Reply only: ok"`) costs seconds and settles the id
before a long round is framed on it. A supervisor that lives only on another
machine runs there over ssh against an rsynced tree, and you still own the gate.

**A model the director names belongs to the agents, not to the product.** When he answers a
delegation question with a model or a CLI ("use X for the worker"), that choice governs the
dispatch path and nothing else — it is not a green light to build the product's own runtime on
that CLI. An agent CLI is a large self-updating binary plus someone's interactive OAuth session;
putting it inside a service couples production to a developer tool and to one person's login.
The line stays sharp: the agents run on the model he named, the product runs on code, on a
documented HTTP API, or on nothing. Getting this wrong reads as not listening, because it is.

**Probe on the host that will do the work, and probe by running, not by listing.**
The same CLI installed on two machines can be authenticated on only one — a
worker binary that answers fine on the Pi can refuse on the Mac with
`authentication required` — so an install check on the wrong host reads like a
broken tool and burns a dispatch. And a model that `opencode models`/a gateway
lists can still fail the moment it runs (`Model unavailable`, `Insufficient
balance`: a provider prefix that looks valid but is unbilled, or a `#tier` suffix
routed to a different provider). The probe is a real one-line run of the exact id
on the exact host; the banner it prints (`build · <model>`) is the proof to quote.
A worker launched where its CLI cannot authenticate exits in one second with a
log line nobody read — check that the status file has a **first** `working:` line,
not just an `exit:` line.

**A defect the owner reports that you cannot reproduce is a hypothesis list, not a
cause.** Drive it once yourself; when it works on your side, the brief carries the
ordered candidates (stale assets, state-gated controls, viewport/tab layout) and
requires the worker to say which one fired and prove it. Writing "fix the edit
button" into a brief invites a rewrite of a flow that was never broken, and
accepting "fixed" without naming the mechanism leaves the real cause shipping.

**A lead helper fails loudly.** If no lead model is configured, refuse with an
exit code and a message naming the setting — never fall back to the session model,
because the fallback is invisible and lands exactly on the decisions that cost the
most to get wrong.

**Read quota pressure from every door before scheduling heavy work.** The same
weekly bucket can be spent through two independent clients — the vendor's own agent
CLI and an IDE that resells the same models — so a quota that looks healthy in one
is often exhausted in the other, and a plan built on the healthy number dies
mid-round instead of being cut up front.

## Report to the human

State the outcome, the work branch and its commits, the evidence you ran
yourself, and what you did **not** verify. Confirm the cleanup: no worktree,
worker branch, terminal, or status file of this job remains. Never narrate
waiting. If you did not open, run, or read something, say so in one line.

**"Is it ready?" is answered against a written definition, never a percentage.**
The director asking mid-flight wants a verdict and a gap list, so answer with: the
layers that are done and reviewed, the layers that are not, and the concrete
gates still open (deployment self-starting, a backup restored once, the real
legacy device rendering, the actual users onboarded, an external review clean).
Name the definition you are holding yourself to — "in use for a week with the
tunnel up and the tablet on the fridge" — so "not yet" is a position and not a
shrug. A green suite, a working demo on a terminal and a committed branch are
three different levels, and conflating them is what makes a later "pronto?"
land as a surprise.

## References

- [`references/brief.md`](references/brief.md): the worker brief, the evidence
  format, and the status-line examples.
- [`references/skill-map.md`](references/skill-map.md): which skills to name in
  the brief for each kind of work.
- [`references/failure-modes.md`](references/failure-modes.md): known ways
  supervision goes wrong.
