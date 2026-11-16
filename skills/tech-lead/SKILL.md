---
name: tech-lead
description: Use when the owner asks to orchestrate, delegate a delivery, or invokes the tech lead. The assistant collects the three role assignments, dispatches a separate tech-lead agent that plans and decides, hands implementation to the supervisor, and delivers the tech lead's report. Never lets the assistant decide.
version: 1.0.0
author: Pablo Werlang
license: MIT
metadata:
  hermes:
    tags: [orchestration, delegation, tech-lead, authority, escalation]
    related_skills: [supervisor, git-change-workflow, code-review]
---

# Tech lead

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

## 3. Dispatching the tech lead

Make one non-interactive call to the chosen harness/model with the chosen effort, carrying:

- The owner's request verbatim, repository, and working directory.
- Every constraint the owner stated and the supervisor and worker assignments.
- Instructions to plan and decide, delegate implementation to the supervisor following the [supervisor skill](../supervisor/SKILL.md), and implement nothing itself.

Carry the owner's Git restrictions into the delegation; use [git-change-workflow](../git-change-workflow/SKILL.md) for job delivery mechanics and [code-review](../code-review/SKILL.md) for review gates. In the assistant's very next message to the owner, name the actual call carrying the decision and its assigned harness, model, and effort. Confirm dispatch from the harness; an attempted call is not confirmation.

## 4. What the tech lead returns

Report as a tech lead to a product director, in this order:

1. **Outcome.** What was delivered or blocked.
2. **What changed.** Concrete resulting behavior and scope.
3. **Evidence.** Exact acceptance command, expected result, actual commands and their output and exit codes.
4. **Decisions.** Each decision with its trade-off in one line.
5. **Not verified.** Required even when the answer is "none"; name every evidence gap.
6. **Risks.** Accepted exposure and its consequence.
7. **Needs the director.** Escalations or "none".

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

Send one message in three lines: decision; options with cost; recommendation plus deadline. Everything else the tech lead decides. Reversible work does not ask; irreversible work always asks for approval through the assistant and waits. A deadline is not approval.

## 7. Proof rules

- **Gate before merge:** build, tests, and the project's gate artifacts must pass.
- Rewrite a gate artifact only with a per-file justification in the diff.
- Answer a review finding with a fix or evidence, never by closing it or re-running until green.
- A declared number is an assertion: reconcile it against real output before quoting it.
- **"Not verified" is a required field.** Silence is not proof.
- Independence beats raw power: a reviewer that runs the command outranks a stronger reviewer reading the author's summary.

## 8. Cadence

One line per step, or every ~15 minutes: what changed, the evidence, what is next. When nothing changed, say "no change" and name the blocker. A dispatch that was not confirmed is a job that did not start.

## 9. Anti-patterns

- The assistant deciding, or answering "sure, let's do it" until an irreversible change lands.
- Asking for role assignments mid-round instead of up front.
- Silently substituting a model the owner did not name.
- The tech lead implementing instead of delegating.
- A report that summarizes intent instead of recording evidence.
