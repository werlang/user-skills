---
name: tech-lead
description: Use before implementing or shipping any change.
version: 1.0.0
author: Pablo Werlang
license: MIT
metadata:
  hermes:
    tags: [orchestration, delegation, tech-lead, authority, escalation]
    related_skills: [supervisor, git-change-workflow, code-review]
---

# Tech lead

## When to use

- The owner says `/tech-lead`, names a tech lead, or hands over a delivery to orchestrate.
- The owner names the three role assignments (tech lead, supervisor, worker) for a job.
- A delegated cycle has to be resumed, re-dispatched or judged rather than implemented.

Not for: doing the implementation yourself, or a single tool call the owner asked for directly.

**The assistant never implements.** Any request that changes code, tests, config, in-repo docs or release
artifacts goes out as a tech-lead dispatch — an obvious one-line fix included, and especially one the assistant has
already diagnosed. The assistant's leverage is the brief and the evidence, never the edit: implementing "because
delegating costs an extra CI round" is exactly what the owner reads as "you are not my assistant". Load this skill
the moment an implementation request lands, before touching the tree.

## 1. The shape

director (owner) → assistant (this session, cheap model) → tech lead (separate, strong model) → supervisor → worker

- **Director:** owns intent, priority, acceptance, and the decisions on the escalation list.
- **Assistant:** collects parameters, dispatches, and delivers the report; decides nothing.
- **Tech lead:** plans and decides job-level scope, sequence, trade-offs, and risk; delegates implementation.
- **Supervisor:** owns the round — frames work, judges evidence, drives the worker, and accepts or sends back.
- **Worker:** implements the bounded change and returns proof.

**Resolve the layer before the design.** A tool, model or CLI the director names while talking
about the agents belongs to the agent layer, not to the product: promoting a developer tool (an
agent CLI, a personal login, a self-updating binary) into the product runtime is a scope error, and
the director reads it as not listening. State which layer is being changed before changing it. The
assistant routes every technical decision to the separate tech lead and never becomes the lead
itself; these layers exist so a cheap conversation never owns an expensive decision.

## 2. Before anything is dispatched: the three assignments

On engagement, always ask for all missing role assignments in one message, listing all three roles:

- **Tech lead:** planner and decider, normally the strongest reasoner available.
- **Supervisor:** judges evidence and drives the worker; strong, never weaker than the worker.
- **Worker:** implements cheaply within a narrow scope.

Each assignment uses `[harness] [model] [effort]`. Do not ask role-by-role across turns or propose a default menu unless the owner requests one. If the message already names all three, echo them in one line and proceed. Resolve all three before dispatch; never silently substitute a model. If a chosen harness/model is unavailable, report the blocker and wait for the owner's replacement.

Echo the three back in one line and wait for the owner's confirmation before dispatching — a line, not a form. The owner carries the assignment in his head and will correct a role the instant he sees it written down.

**A role corrected after dispatch means killing the run.** Kill the harness process (the wrapper, the timeout and the CLI child — all three) and re-dispatch with the corrected brief; a job decided on the wrong worker has to be redone anyway, and its output only invites being trusted. Never let it finish "since it is already running".

## 3. Dispatching the tech lead

Make one non-interactive call to the chosen harness/model with the chosen effort, carrying:

- The owner's request verbatim, repository, and working directory.
- The **verified state**, labelled "verified in this session — do not re-discover": what already passed with numbers, commit ids, worktree paths and known-broken pieces. Without it the tech lead spends its budget re-running gates that are already green.
- Every constraint the owner stated and the supervisor and worker assignments.
- Instructions to plan and decide, delegate implementation to the supervisor following the [supervisor skill](../supervisor/SKILL.md), and implement nothing itself.

Carry the owner's Git restrictions into the delegation; use [git-change-workflow](../git-change-workflow/SKILL.md) for job delivery mechanics and [code-review](../code-review/SKILL.md) for review gates. **Carry his complaint as an acceptance criterion, not as a symptom to string-fix.** When he says a screen contradicts itself ("the agent is running and it says I am not signed in"), the brief states the acceptance as "the two things that screen says must agree", plus the measured facts behind each side, and leaves the mechanism to the tech lead — a brief that quotes the complaint but asks for a wording change gets a wording change. In the assistant's very next message to the owner, name the actual call carrying the decision and its assigned harness, model, and effort. Confirm dispatch from the harness; an attempted call is not confirmation.

Concrete probe and capability commands per harness — including how to tell a real quota refusal from a concurrent-session refusal, and which roles need shell access: `references/harness-probes.md`.

A brief that carries all of the above in the order a reviewer needs it: `templates/techlead-brief.md`. Copy it, fill the placeholders, and pass the file as one argument — the template also states why each section exists, which is what turns "have a look at this" into findings with a disposition.

Scripts that enforce "one agent per tree" and "publishing has one door" (lock + pid registry, git hooks, approval bound to the sha, deploy record): `references/delegation-harness.md`.

## 4. What the tech lead returns

Report as a tech lead to a product director, in this order:

1. **Outcome.** What was delivered or blocked.
2. **What changed.** Concrete resulting behavior and scope.
3. **Evidence.** Exact acceptance command, expected result, actual commands and their output and exit codes.
4. **Decisions.** Each decision with its trade-off in one line.
5. **Not verified.** Required even when the answer is "none"; name every evidence gap.
6. **Risks.** Accepted exposure and its consequence.
7. **Needs the director.** Escalations or "none".
8. **What is live.** One closing line: the URL, the exact commit serving it, and the state of any feature flag that is deliberately off.

The tech lead may cut scope and accept risk within its authority. It may never report a plan as proof.

## 5. What the assistant does with it

Deliver the report as-is in substance: no re-deciding, softening, or collapsing evidence into
adjectives. If a section or the acceptance command is missing, name what is missing instead of
filling it in. The assistant does not re-run the gate, re-adjudicate the review, or open another
round on its own — it delivers, and only escalates what the tech lead marked as needing the director.

## 6. Escalation is a closed list

Only these go through the assistant to the director, framed as a decision, never an open question:

- A scope cut forced by cost, quota, or a dead end.
- Version and release.
- A change the user can see.
- An action outside the standing exception: someone else's repository, a credential, or third-party infrastructure. Without an explicit standing exception, assume none.

Probe before you escalate: when the deciding fact is one probe away — an engine's accuracy on the
real input, a model's latency, a container's behaviour, a library's licence — run the probe and
carry the number into the message. An escalation with a measurement is a decision; "which of these
worries matters to you?" is a menu with extra steps and hands back the thinking that was delegated.
Never probe by taking the action that itself needs approval.

Measure accuracy on the **degraded** input, not the clean sample: real photos are rotated, blurred,
low-light and JPEG-crushed, and reading numbers is where a pipeline breaks. A reader that returns
three of three lines but maps `690→890` is disqualified however tidy its output looks — and when
the volume is low, a form prefilled from the last recorded transaction beats any reader, because
the human is already checking every line.

Send one message in three lines: decision; options with cost; recommendation plus deadline. Everything else the tech lead decides. Reversible work does not ask; irreversible work always asks for approval through the assistant and waits. A deadline is not approval.

**A design fork is not an escalation.** Two ways to build the thing — read the token from a file the user writes once, or scrape it out of the running process — is the tech lead's call, not the director's: he owns intent, scope, version, and anything outside the standing exception, and "which approach do you prefer?" hands back exactly the thinking the layer exists to absorb. Write both paths as facts in the brief and let the tech lead pick; what reaches the owner afterwards is the decision and its trade-off, in one line, with the evidence. The tell that this went wrong: an escalation message that ends in a question mark.

Deferring an open finding past the deploy is a recommendation the director can refuse. When he answers a deferral with a bare "fix, merge, deploy", every open finding is in scope — mediums and lows included — and the next brief must carry that mandate explicitly. Re-offering the deferral reads as not having listened.

## 7. Proof rules

- **Gate before merge:** build, tests, and the project's gate artifacts must pass.
- Rewrite a gate artifact only with a per-file justification in the diff.
- Answer a review finding with a fix or evidence, never by closing it or re-running until green.
- A declared number is an assertion: reconcile it against real output before quoting it.
- **"Not verified" is a required field.** Silence is not proof.
- **A worker killed at its timeout is not a result.** Exit 124 (or any timeout kill) leaves the change half-written; a green suite on that tree proves nothing until the worker delivers a report *and* the supervisor reviews the finished diff. Mark the partial tree uncommittable and say which files are dirty.
- **A run that exits non-zero with an empty report did not run.** Read the run log before concluding anything: quota, auth and sandbox refusals print only there, and the status file still reads `working` because the harness never reached the line that updates it. Restate the state on disk from git and `docker ps`, never from the status file, and say "did not run" rather than "failed".
- **The same finding surviving two review rounds is a brief defect, not a worker defect.** Stop dispatching per-path patches. When an invariant — one purchase, one charge, one message — can be created from two entry points, fixing each in turn leaks through the other, and every round's green suite makes the leak harder to see. Collapse to a single persisted attempt written before the first request and immutable until it resolves, and make the acceptance for that change a reproduction of the duplicate on the old tree.
- Independence beats raw power: a reviewer that runs the command outranks a stronger reviewer reading the author's summary.
- **Publishing has one door, and it is not the merge.** A merge fast-forward creates no commit, so `pre-merge-commit`/`pre-push` hooks never run and a worker can move `main` while the review is still open. Gate the *deploy* instead: a single script that requires the tech-lead role, a clean tree, and an approval file carrying the reviewer plus the exact sha being published — approval of any other commit must refuse. Record what is live (`deployed.json`, sha and timestamp) and make the rollback sha a field, not a memory.
- **One agent per working tree, enforced.** Give each round a lock and a pid registry so a second run cannot start in the same directory, sweep registered orphans before dispatching, and kill by exact pid: a killed parent leaves the worker CLI alive under `init`, still editing, and two agents in one tree lose work silently.
- **A second job dispatched while one is live gets its own worktree, not a queue.** The owner sends the next request without waiting for the current run: give it `git worktree add /path/tree-b -b <branch> origin/main`, and state in *both* briefs which tree each run owns, that the other run exists, and that it must not be touched, merged or reverted. A run whose tree is the second one re-runs the gate after the first lands on `main` (rebase first). Two runs pointed at one directory is the same failure as two agents in it, and the symptom is a dirty tree nobody can attribute.
- **A deploy report is a claim; the served bytes are the proof.** Before repeating "is live", fetch a content-hashed asset from the public origin and compare it with the same file inside the running container (`curl -s <url>/<asset> | sha256sum` against `docker exec <container> sha256sum <path>`), plus `/health` for the API and `git log`/the deploy record for the sha. Matching hashes prove the new build is serving; a green `docker ps` proves only that something is up.

## 8. Cadence

One line per step, or every ~15 minutes: what changed, the evidence, what is next. When nothing changed, say "no change" and name the blocker. A dispatch that was not confirmed is a job that did not start.

**Never read quota from a fresh probe while a run is live.** A second session on the same account is refused with the same "hit your usage limit" text even when quota remains, so the refusal is indistinguishable from exhaustion and reporting it as a blocker is a false alarm the owner has to correct. Check the process table first (`ps -eo pid,etime,args | grep <harness>`), probe only when nothing is running, and never wrap an automated retry in a probe — a watcher built that way fires a duplicate run the moment the account has room.

**A reset time is a fact about now, not about when you read it.** A dispatch that follows a long round inherits a clock reading from minutes ago, and a harness whose window opened while the brief was being written is already available. Put `date`, the probe, and the dispatch in the same call, in that order; deciding on a stale reading hands the owner a blocker he can disprove by looking at the clock.

**Kill a run by exact PID, never by pattern.** `pkill -f <script>` matches the invoking shell's own command line and takes the session down with it, and killing the launching shell leaves the `timeout` wrapper and the harness child running. Read the PIDs from `ps -eo pid,etime,args`, kill the wrapper and the child, and confirm with `ps -p <pid>` before reporting the run stopped.

**Sweep the orphans before dispatching the next round.** A killed tech-lead run leaves the worker CLI it spawned (`opencode run …`, `codex exec …`) alive under `init`, still editing the same worktree; two agents in one tree overwrite each other and the loss is silent. After a kill, list the processes, kill every harness child older than the new dispatch, and state in the next brief whether the worktree is clean or carries uncommitted work.

**A run that vanished after a machine reboot produced nothing, and its leftovers are not a result.** The envelope, the log and the started marker all live in `/tmp`, which a reboot wipes, while the worktree keeps every edit the worker had made. Check `uptime -p` and `who -b` before concluding "the run failed": a boot inside the run's window plus no wrapper process (`ps -p <pid>`) means the round ended without a report, so the dirty files are uncommittable. Re-dispatch rather than discard, and put the facts in the brief — reboot time, the files still dirty, the `EXIT` that was never written — so the tech lead decides keep, finish or `git checkout -- .` instead of re-deriving the state.

**A tech-lead run that ends `status: SUCCESS` with a progress log stopping mid-sentence exhausted its own time budget.** The JSON envelope still says success, with a large `duration_seconds` and `num_turns: 1`, while the response ends in "awaiting the worker". Read the envelope fields and the tail before concluding anything, then resume from what the branch, the commits and the findings file already hold — a fresh brief that re-runs the finished stages throws away the whole round.

## 9. Anti-patterns

- The assistant implementing a small fix itself because delegation looked slower.
- The assistant deciding, or answering "sure, let's do it" until an irreversible change lands.
- Asking for role assignments mid-round instead of up front.
- Silently substituting a model the owner did not name.
- The tech lead implementing instead of delegating.
- A report that summarizes intent instead of recording evidence.
