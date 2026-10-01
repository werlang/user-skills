---
name: skill-optimizer
description: "Iteratively improve, update, refactor, and harden agent skills or durable guidance using adversarial review rounds. Acts as an orchestrator launching sub-agents across review rounds until findings converge, or applies targeted lessons learned into the narrowest owning skill. Trigger when updating, optimizing, hardening, or creating skills, or when asked to 'update the skill', 'optimize skill', 'harden skill', 'run adversarial review on skill', 'improve skill', 'update docs', 'document recurring pattern', or 'capture reusable workflow'."
---

# Skill Optimizer

Harden skills and durable repository guidance through bounded adversarial review rounds until findings converge.

---

## 1. Orchestration Model & User Customization

### Default Orchestration Role
Unless the user specifies otherwise, **act as the parent orchestrator**. The orchestrator manages the lifecycle:
1. Bounds the target skill and captures baseline commit references.
2. Coordinates improvement drafts.
3. Dispatches clean-context adversarial review rounds via the dispatch contract below.
4. Triages findings with technical counters or surgical patches.
5. Manages round iteration and enforces circuit breakers.

### User Customization Points
The user may override or guide any part of the review loop:
- **Designated Review Execution**: The user can specify how review rounds are executed according to their active environment—such as an external orchestrator (e.g. Orca), specific sub-agents, or alternative models.
- **Custom Orchestration Method**: The user can mandate a specific evaluation protocol (e.g., single-turn triage, tournament rounds between competing proposals, or multi-round adversarial verification).
- **Default Method**: When not specified, default to the **Iterative Adversarial Review Loop** below.

---

## 2. The Adversarial Multi-Round Methodology

### Phase 1: Input Analysis, Baseline Pinning & Guide Discovery
1. **Intake the Goal**: Extract the improvement objective from the user request, recent session context, observed failure mode, or durable lesson.
2. **Pin the Starting Baseline**:
   - Capture the baseline commit and persist it in the review header:
     ```sh
     BASE_SHA=$(git rev-parse HEAD)
     ```
   - All subsequent review diffs evaluate against `BASE_SHA` (for Round 1) or `ROUND_SHA` of the previous round (for Round 2+). Fail closed if baseline is not recorded.
3. **Find the Narrowest Owning Guide (Dynamic Discovery)**:
   - Search existing skill frontmatter rather than relying on a hardcoded list:
     ```sh
     grep -rn "^name:\|^description:" skills/*/SKILL.md
     ```
   - Inspect [`skills/README.md`](../README.md) to locate the closest domain owner (e.g. `code-review` for review criteria, `clean-code-and-oop` for coding standards, `tdd` for testing).
   - Prefer updating an existing guide over creating a new one. If repository-wide root conventions change, update [`AGENTS.md`](../../AGENTS.md).
   - Only create a new skill when no existing skill is a viable long-term owner.

---

### Phase 2: Mutation & Proposal (Round 1..N)
1. **Formulate Bounded Hypothesis**: Modify one clear architectural concept or set of related rules. Avoid "rewrite everything" or vague "improve clarity" churn.
2. **Apply Directive Writing Standards**:
   - **Rules over Narratives**: Write direct, imperative instructions. Omit conversational filler.
   - **Context Economy**: Every paragraph must justify its token cost in the LLM's context window. Assume the agent is smart; do not explain generic syntax or standard programming concepts.
   - **Progressive Disclosure**: Keep `SKILL.md` focused on operational workflows and decision trees. Offload comprehensive catalogs, reference tables, and checklists to skill-local `references/`.
   - **Set Explicit Degrees of Freedom**:
     - *High freedom*: Text heuristics for open-ended design choices.
     - *Low freedom / Strict contracts*: Concrete machine contracts (e.g., structured schemas in [references/finding-contract.md](references/finding-contract.md), exact commands, immutable file seams) for fragile operations.
3. **Capture Mutation Diff**:
   - Run `git diff BASE_SHA..HEAD` to inspect the exact diff before initiating review.

---

### Phase 3: Adversarial Review Round (Dispatch Contract)
To execute the review round, follow this 3-tier dispatch contract:
1. **User-Designated Harness**: If the user specified a harness or review mechanism:
   - Validate target availability (e.g. `which orca` or environment presence).
   - Dispatch to that harness with the checklist path and diff. If the designated target is missing, stop and ask the user rather than guessing.
2. **Sub-Agent Invocation (Default Automated)**: If a subagent tool is available:
   - Launch an independent sub-agent with a clean context. Provide the diff (`git diff BASE_SHA..HEAD`) and instruct it to audit using [references/adversarial-review-checklist.md](references/adversarial-review-checklist.md) and emit findings conforming to [references/finding-contract.md](references/finding-contract.md).
3. **Self-Review Fallback (Degraded)**: If no subagent tool or external harness is available:
   - Perform an adversarial self-audit in a separate reasoning block, explicitly labeling all findings as `[SELF-REVIEW-DEGRADED]`.

The reviewer audits against:
- **Plausibility & Grounding**: Real commands, valid paths, and environment constraints.
- **Mechanical Enforceability**: Grep-able cues, AST checks, concrete cost symptoms.
- **Token Economy**: No narrative fluff, progressive disclosure honored.
- **Degree of Freedom Calibration**: Strict contracts for fragile boundaries vs heuristics.
- **Failure Modes & Degradation**: Fallbacks for missing tools or offline runs.

Findings must adhere to [references/finding-contract.md](references/finding-contract.md):
```markdown
### F1: [Category] Title
- **Severity**: BLOCKER | MAJOR | MINOR
- **Location**: `<target-file>#L<line>`
- **Adversarial Challenge**: <Why this fails, exposes a blind spot, or creates overhead>
- **Proposed Remediation**: <Surgical, concrete fix>
```

---

### Phase 4: Triage & Counter-Proposals
The orchestrator evaluates every reported finding against defined severities:
- **`BLOCKER`**: Factually wrong, unexecutable, hallucinated commands/paths, or unbounded loops.
- **`MAJOR`**: Mechanically unenforceable, uncalibrated degrees of freedom, severe token bloat, or missing fallbacks.
- **`MINOR`**: Phrasing clarity, localized redundancy, formatting, or typos.

Triage actions:
- **`ACCEPT`**: Adopt the finding and apply the suggested surgical fix directly.
- **`COUNTER`**: Propose a superior technical alternative that resolves the core risk while maintaining simpler architecture.
- **`REJECT`**: Dismiss only with concrete technical evidence citing file/line proof and repository scope rules. **All rejected `BLOCKER` findings must re-enter the next review round for confirmation.**

Apply accepted and countered edits to the target files.

---

### Phase 5: Adversarial Verification & Circuit Breakers
1. **Scoped Verification**:
   - Capture the round commit ref: `ROUND_SHA=$(git rev-parse HEAD)` and persist it in the round header.
   - The reviewer verifies the diff:
     - If diff `< 200` lines: Read full diff (`git diff BASE_SHA..HEAD`) and touched files only (`SKILL.md` and edited reference files, not the transitive directory closure).
     - If diff `>= 200` lines: Read diff hunks plus 50 lines of surrounding context to protect token budget.
2. **Circuit Breakers & Convergence Gate**:
   - **Max Rounds**: Maximum of 3 automated review rounds (`R1`, `R2`, `R3`).
   - **Escalation Gate**: If `BLOCKER` or `MAJOR` findings remain unresolved after Round 3, halt automated looping, set verdict to `ESCALATE`, and escalate to the human user with an open issue list.
   - **Convergence**: Declare **Settled & Converged (`CONVERGED`)** only when zero `BLOCKER` or `MAJOR` findings remain and both author and reviewer verify all claims. If open findings remain, declare `INCOMPLETE`.

---

### Phase 6: Settlement & Repository Synchronization
1. **Synchronize Repository Catalogs**:
   - If the skill description, scope, or triggers changed, update [`skills/README.md`](../README.md).
   - If root guidance or global conventions changed, update [`AGENTS.md`](../../AGENTS.md).
2. **Deliver Summary**:
   - Report target skill, rounds completed, accepted/countered findings, and final settled diff summary.

---

## 3. Good vs. Poor Candidates for Skill Updates

| Good Candidates | Poor Candidates |
| :--- | :--- |
| Newly established architectural boundary or machine contract | Renaming a local variable or function for style |
| Reusable component, helper, or test pattern repeated >= 3 times | One-off bug fix with no broader application |
| Validated execution or test verification command | Temporary workarounds, mocks, or development shims |
| Concrete rule resolving a repeated agent failure mode | Assumptions not yet proven in real execution |
| Mechanical code smell detection cues with cost symptoms | Vague aspirational guidelines ("write clean code") |

---

## 4. References & Assets

- [references/adversarial-review-checklist.md](references/adversarial-review-checklist.md) — Red-team audit checklist for plausibility, mechanical cues, token cost, and contracts.
- [references/finding-contract.md](references/finding-contract.md) — Schema, severity definitions, and YAML machine contracts for review findings.