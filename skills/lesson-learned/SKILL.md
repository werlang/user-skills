---
name: lesson-learned
description: Capture durable, project-specific lessons from refactors by answering why the change happened, what project behavior it should affect, and whether the rule is reusable beyond a punctual refactor; record only evidence-backed lessons as checkbox items in the active project's lessons.md and promote them only into project-local documentation, specs, skills, prompts, or agent guidance, never global skills or agents. Use whenever the user asks to refactor code, a refactor exposes a repeatable project rule, or the user asks to update documentation, specs, prompts, skills, or agent guidance.
---

# Lesson Learned

## Purpose

Treat a refactor request as evidence about the project, not only as a code-editing task. Capture a lesson when the request corrects a repeatable mistake, restores a documented or established project standard, or exposes a rule that future agents should follow. Keep the record in the active project's `LESSONS.md`, never in this global skill directory.

Run a lesson check for every user request to refactor code, even when the final conclusion is that no durable lesson exists.

This global installation supplies only the workflow. Every lesson and every file changed to promote it belongs to the active project. Treat `~/.agents/skills/` and other machine-global guidance as out of scope for project lessons; change those only when the user explicitly asks to maintain a global artifact itself.

## Inference gate

Answer these questions before writing a lesson:

1. **Why was the refactor changed?** Separate the user's explicit reason from inferences. Inspect the before/after code, tests, contracts, project guidance, and history when needed. Name the concrete defect, constraint, or decision that caused the change.
2. **What actually changed?** Describe the old and new behavior, responsibility, contract, or validation boundary. Do not turn a vague request such as cleaner, simpler, or more scalable into a rule without a concrete project consequence.
3. **How should the lesson affect the project?** Identify the behavior future work should follow and the smallest project-local owner that can enforce it: code boundary, test, spec, README, project skill, prompt, or agent guidance. State the expected consequence and how it can be checked.
4. **Should this be adopted project-wide?** Look for a documented requirement, an established pattern in multiple relevant locations, a repeated corrective change, a cross-cutting risk, or an explicit request to standardize. A single changed file is evidence of a local issue, not proof of a project-wide standard.
5. **Is this only a punctual (one-off) refactor?** Treat a one-off cleanup, local readability improvement, isolated naming choice, temporary workaround, or product-direction change as local unless separate evidence shows a reusable rule. Keep it out of `lessons.md` when no broader adoption is justified.
6. **What would disprove the generalization?** Check nearby counterexamples, legitimate exceptions, competing project conventions, and whether the proposed rule would create a worse trade-off elsewhere. Record the narrowest rule that survives this check.

For an architectural or cross-cutting candidate, also state the context, decision, expected consequences, meaningful trade-off or rejected alternative, and project-local owner responsible for confirming adoption.

Use the following decision threshold:

| Evidence and scope | Lesson-log action |
| --- | --- |
| Explicit project requirement, repeated pattern, recurring defect, or clearly cross-cutting risk | Record a concise pending project lesson. |
| Strong local evidence but no proof of broader adoption | Keep the refactor local; report a candidate or ask a concise question instead of recording a project-wide lesson. |
| Personal preference, changed mind, one-off cleanup, or unsupported suspicion | Do not record a lesson. |

Do not claim that an agent was wrong merely because code changed. Describe the contributing condition, missing information, contract gap, or process weakness that allowed the mismatch, and prefer a preventive project action over blame.

## Determine the project file

1. Identify the active repository or project root from the current working directory and its existing guidance. Read the nearest `AGENTS.md`, contribution guide, or project instructions before editing.
2. Use an existing `LESSONS.md` at that root. If it does not exist, create it only after confirming a durable lesson. Start it with `# Lessons learned` and a blank line.
3. For a monorepo or a non-Git workspace with multiple plausible roots, use the owner of the changed code and its documentation. Ask a concise question when that owner cannot be determined from the project files.
4. Preserve existing entries and formatting. Do not create a second lesson log in a nested directory or write project lessons into the global skill installation.
5. Treat every promotion target as project-local: root guidance, `docs/`, project `.agents/skills/`, `.agents/prompts/`, `.github/skills/`, specs, tests/tooling, and agent definitions inside the repository. Never edit machine-global `~/.agents/skills/` or `~/.codex/agents/` to implement a project lesson.
6. If the only apparent owner is global, stop and ask whether the user wants a separate global rule. Do not silently cross the project/global boundary.

## Refactor workflow

At the beginning of every refactor request:

1. Read the user's stated reason. If it is unstated, inspect the requested scope, current implementation, nearby tests, relevant documentation, agent guidance, and established patterns. Inspect history only when a claim about prior agent behavior needs historical evidence.
2. Apply the inference gate. Capture the reason, before/after delta, evidence, project impact, adoption scope, counterexample check, and validation owner before deciding whether an item belongs in `LESSONS.md`.
3. Compare the requested result with project evidence. Classify the reason as one of:
   - **Durable correction:** the change fixes behavior, a contract, architecture boundary, security or accessibility rule, localization rule, testing expectation, documentation contract, or another established standard.
   - **Intentional preference:** the user is changing direction, taste, naming, or scope without evidence that the previous result violated a project rule.
   - **Unconfirmed:** the available evidence does not establish why the change is needed.
4. Record a lesson only when the durable-correction classification and adoption threshold agree. Do not record a personal change of mind, a punctual refactor, a temporary workaround, or a speculative accusation that an agent caused the problem. Phrase the rule neutrally as what the project must do.
5. Avoid broad documentation or skill edits during an ordinary refactor unless the user requested them or a documentation-related skill is already in scope. Record the pending lesson and report the appropriate future owner instead.

## Lesson format

Keep each entry to one concise but descriptive checkbox line. Use this form:

```md
- [ ] **[scope]** <durable project rule> because <project-specific reason>; promote to: `<smallest durable owner>`; evidence: `<path or contract>`.
```

Use an owner such as `docs`, `spec`, `agent guidance`, `skill`, `test/tooling`, or `code standard`. Include enough evidence for another agent to verify the lesson, and make the expected project-wide effect and validation path clear. Search existing entries before adding one; update a matching unchecked entry instead of duplicating it. Keep every lesson as a task field: use `- [ ]` while pending and `- [x]` only after the promotion workflow completes.

Example:

```md
- [ ] **API** Validate status values at the route boundary before persistence because the project contract rejects unknown states; promote to: `API spec` and `api-building`; evidence: `api/routes/orders.js`, `docs/orders.md`.
```

Do not turn the file into a narrative, blame log, changelog, or list of unchecked personal preferences.

## Documentation and standard-promotion workflow

Use this workflow whenever the user asks to update project documentation or invokes a documentation-related skill, including work on README files, `docs/`, specs, prompts, project-local skills, `AGENTS.md`, Copilot instructions, or project-local agent definitions. All lesson implementation targets in this workflow must be inside the active project.

1. Search for an existing project-local documentation owner, event, or trigger before adding one. Inspect the active project's `AGENTS.md` files, `.agents/`, `.github/`, `docs/`, skills, prompts, package scripts, and CI guidance with targeted searches for `documentation`, `docs`, `lesson`, `trigger`, and `event`. Extend the existing project owner when one exists; do not create a parallel trigger system or promote the lesson to a global owner.
2. Read the active project's `LESSONS.md` and review every unchecked item. For each item, identify the narrowest project-local durable home: the existing documentation owner, a specification or contract, an existing project skill, a project agent file, a project prompt, a test/tooling rule, or a code standard.
3. Implement every applicable unchecked lesson in that documentation pass. Use the current code and project conventions as the source of truth, keep guidance concise, and update all necessary project-local owners when one file cannot express the rule. If a lesson requires code or another out-of-scope change, leave it unchecked and state the blocker rather than pretending documentation completed it.
4. Validate the promoted rules: check referenced paths and commands, search for stale contradictory guidance, run the smallest relevant tests or static checks, and report any validation that could not run.
5. Only after implementation and validation, change the item's checkbox from `- [ ]` to `- [x]` and append a short implementation pointer when useful, for example `implemented in: \`AGENTS.md\`, \`docs/orders.md\``. Never mark an item complete merely because it was reviewed.

If there is no `LESSONS.md`, do not invent lessons during a documentation-only task. If the file has no unchecked items, state that the promotion pass found nothing pending.

## Handoff

Report the inferred reason and evidence, before/after delta, project impact, adoption scope, counterexamples considered, lessons added or deliberately skipped, promotion files changed, validation performed, and any unchecked items that remain. Distinguish verified project facts from inference, and explain when the user appears to be changing direction or making a punctual refactor rather than correcting a project-standard defect.
