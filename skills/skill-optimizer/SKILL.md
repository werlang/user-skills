---
name: skill-optimizer
description: "Optimizes, refactors, and updates an existing agent skill (SKILL.md) using a production prompt, candidate mutations, evaluator verdicts, and skill-local mutation memory. You MUST trigger this skill whenever the user requests to optimize a skill, run a skill evolution/optimization loop, improve a skill's performance on previous prompts, or update/apply mutation results and mutation memory files, even if they do not explicitly name this skill."
---

# Skill: Skill Optimizer

## Purpose

You are responsible for improving a single agent skill through iterative evolution.

Your objective is **not** to rewrite the skill from scratch. Your objective is to update one already-evaluated candidate mutation, its skill-local memory, and the canonical skill.

You optimize **only one target skill**.

---

# Single-Conversation Orchestration

When the user asks to optimize a skill from the previous prompt, act as the parent orchestrator. Do not ask the user to manually create candidate or evaluation files.

1. Identify the target skill from the request and current conversation. If no single skill is unambiguous, ask the user to name it.
2. Treat the preceding real user request, its supplied context, and the target skill's response as the optimization input. Never optimize an invented or summarized replacement prompt.
3. Run `scripts/prepare-optimization-run.mjs` to initialize the target's local memory when absent and create an immutable run manifest.
4. Launch exactly three independent subagents in parallel. Give each the manifest, baseline skill, local memory, preceding prompt, context, and baseline response. Do not provide a candidate subagent with another candidate's result.
5. Collect the three candidate JSON objects. Randomize their order and assign neutral slots such as `option-1`, `option-2`, and `option-3`. Launch one evaluator subagent only after all candidates return. Give it the baseline response, prompt, context, and slot-labelled candidate responses. Do not give it mutation ids, mutation memory, or candidate skills.
6. Map the evaluator's slot-level verdict back to candidate ids, then assemble the evaluation JSON from the manifest, candidates, and verdict. Run `scripts/apply-optimization-result.mjs` to validate the run, update local memory, and promote only when authorized.
7. Report the target skill, candidate ids, evaluator winner, and whether promotion occurred. Do not expose hidden reasoning from subagents.

Subagents must return JSON only. The parent agent owns all file reads, writes, evaluation assembly, and promotion. Scripts do not invoke subagents; they only create and validate local artifacts.

## Subagent Orchestration Templates

To ensure strict schema compliance, the parent orchestrator must instruct subagents with the exact instructions below.

### Candidate Subagent Instructions

When launching the three parallel candidate subagents, provide each with the run manifest, the baseline skill, the target skill's local mutation memory, the preceding prompt, the supplied context, and the baseline response. Instruct each subagent as follows:

```text
Create one candidate mutation of the supplied baseline skill.

Modify exactly one idea. Do not rewrite unrelated instructions.
Use the supplied skill-local mutation memory to avoid locally unsuccessful or
already-tested ideas. Do not inspect another candidate.

Return JSON only:
{
  "id": "stable-kebab-case-id",
  "summary": "One reusable sentence.",
  "tags": ["one-or-more-tags"],
  "candidateSkill": "Complete mutated SKILL.md content",
  "response": "Answer to the supplied prompt using candidateSkill"
}
```

### Evaluator Subagent Instructions

When launching the evaluator subagent (after all three candidates have returned), randomize the candidate responses into neutral slots (`option-1`, `option-2`, and `option-3`). Provide the evaluator with the preceding prompt, context, baseline response, and the slot-labelled candidate responses. Instruct it as follows:

```text
Compare each candidate response against the baseline for the supplied prompt and context.

For every candidate, set improved to true only if it is better than the baseline.
Select winnerId as the single best promotable candidate, or null when none should be promoted.
Return JSON only:
{
  "outcomes": [
    { "slot": "option-1", "improved": true },
    { "slot": "option-2", "improved": false },
    { "slot": "option-3", "improved": true }
  ],
  "winnerSlot": "option-1"
}
```

---

# Inputs

You will receive:

- The current skill.
- A real user prompt.
- The context supplied to the target agent.
- The baseline response produced by the current skill.
- Three candidate artifacts, generated independently from the same current skill. Each artifact must contain a unique mutation id, one atomic mutation idea, the complete candidate skill, and its response to the same prompt and context.
- An evaluator verdict comparing the baseline and all three candidate responses. The verdict must identify exactly one winner, or declare that no candidate wins, and must record whether each candidate improved on the baseline.
- The complete mutation memory for this target skill, using `mutation-memory.template.json` as its schema.

All candidates are evaluated against the same immutable baseline. Do not generate, execute, or reevaluate candidates.

---

# Strict Exchange Format

Use `references/evaluation.json` as the required shape for candidate artifacts and the evaluator verdict. It contains exactly three entries in `candidates`, the target `skillId`, a unique `evaluationId`, SHA-256 digests of the current skill and mutation memory, a `winnerId` that is either one candidate id or `null`, and one baseline-relative outcome per candidate.

Each candidate must include:

- `id`: a stable, unique mutation id.
- `summary`: a short, reusable statement of one idea.
- `tags`: one or more concise categorization strings.
- `candidateSkill`: the complete mutated skill, generated directly from the current skill.
- `response`: the candidate's answer to the same prompt and context as the baseline.

Each `outcomes` entry must contain the candidate id and an `improved` boolean. `true` means the evaluator found that candidate better than the baseline; `false` means it did not. The selected `winnerId` chooses the best promotable candidate; it does not turn other baseline improvements into losses. The parent maps these fields from blinded evaluator slots; never ask the evaluator to produce mutation ids directly.

Use `references/mutation-memory.json` and `references/updater-output.json` as the exact before-and-after reference. Copy `mutation-memory.template.json` to the target skill's directory before its first evaluation.

For deterministic bookkeeping, run:

```sh
node scripts/update-mutation-memory.mjs <memory.json> <evaluation.json> <current-skill.md>
```

The script verifies that `baseSkillSha256` matches `<current-skill.md>` before it updates memory. It writes JSON matching `references/updater-output.json` to standard output. It does not evaluate responses or edit a skill file. If its promotion action is `promote`, use the corresponding candidate's `candidateSkill` verbatim as the updated skill.

For a complete orchestration run, use these scripts:

```sh
node scripts/prepare-optimization-run.mjs <target-skill.md> <run-directory>
node scripts/apply-optimization-result.mjs <target-skill.md> <memory.json> <evaluation.json>
```

---

# Mutation Memory

The mutation memory is specific to this skill. Store its JSON file next to the target skill, rather than sharing it with other skills.

Never assume that mutations successful in other skills are beneficial here.

The memory contains historical mutation ideas together with their performance.

The memory contains `processedEvaluationIds` and mutation entries. Each mutation entry contains:

- id
- summary
- tags
- wins
- losses
- score
- evaluations

Use this memory to understand:

- which ideas consistently improve the skill;
- which ideas consistently make the skill worse;
- which areas have not yet been explored.

Candidate-generation systems should not repeat previous mutations unless they are deliberately retesting the same `id`. When retesting, update the existing entry rather than creating a duplicate.

Avoid generating mutations that are semantically equivalent to unsuccessful ones.

Prefer exploring new directions instead of repeatedly proposing "improve wording", "increase clarity", or similar generic edits.

---

# Candidate Requirements

Each candidate mutation must modify **one single idea only**. It must be generated independently from the immutable current skill, not from another candidate.

Good mutations:

- Add explicit constraints.
- Introduce one concrete example.
- Clarify priority order.
- Remove redundant instructions.
- Improve ambiguity handling.
- Specify formatting rules.
- Simplify exception handling.

Bad mutations:

- Improve clarity and formatting.
- Rewrite everything.
- Make the skill better.
- Improve style.

Every mutation must have one identifiable purpose.

Candidate generation must favor unexplored ideas and avoid ideas semantically equivalent to locally unsuccessful entries. Historical scores are skill-local evidence, not universal rules.

---

# Rules

Accept only a verdict that names one of the supplied candidate mutation ids as the winner, or explicitly names no winner. Require exactly one baseline-relative outcome for every supplied candidate.

Never apply an `evaluationId` already listed in `processedEvaluationIds`.

Do not infer evaluator preferences, fabricate missing mutation metadata, or alter the evaluation outcome.

---

# Evaluation

The evaluator already decided which response performed best.

Do not reevaluate responses.

Your job is only to learn from the evaluation.

---

# Updating Memory

For every candidate mutation:

If its baseline-relative outcome is `improved: true`:

- increment wins
- increment evaluations
- increase score by 1

If its baseline-relative outcome is `improved: false`:

- increment losses
- increment evaluations
- decrease score by 1

Use the candidate's mutation id to find an existing entry. If it exists, update its statistics while preserving the existing summary and tags.

Otherwise create an entry with the candidate's id, summary, and tags, then apply its result.

Keep `evaluations` equal to `wins + losses`. Scores are cumulative local evidence: `score = wins - losses`. Normalize a contradictory supplied score to that value.

After applying all three outcomes, append the unique `evaluationId` to `processedEvaluationIds`.

Keep mutation summaries short and reusable.

Good summary examples:

- Add explicit constraints.
- Prioritize recent context.
- Introduce one example.
- Reduce unnecessary explanation.
- Enforce output structure.
- State assumptions explicitly.

Bad examples:

- Changed paragraph three.
- Reworded the second sentence.

The summary should describe the underlying idea, not its implementation.

---

# Promotion

Only the evaluator winner may be promoted.

Promote it only if:

- it is the winner of the evaluation;
- it improved on the baseline in that evaluation;
- its score is positive after the update.

Otherwise the skill remains unchanged.

Never combine multiple mutations into a single update. Promote the winning candidate's complete skill artifact verbatim; do not reconstruct or improve it further.

Never promote losing mutations.

---

# Output

Return exactly three sections.

## Updated Memory

Return the complete updated mutation memory as valid JSON, matching `mutation-memory.template.json`. Its values must match the `updatedMemory` returned by the bookkeeping script.

---

## Promotion Decision

Either:

- Promote mutation `<id>`

or

- No promotion

Include a brief justification.

---

## Updated Skill

If a promotion occurred:

Return the winning candidate's complete skill.

Otherwise:

Return the original skill unchanged.

Do not include explanations, reasoning, or commentary outside these three sections.