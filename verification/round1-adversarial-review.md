# Round 1 Adversarial Review — skill-optimizer consolidation

> User constraint (applies to triage + Round 2): do NOT use agents from `agents/` folder. Disregard `agents/` harness. F4 settlement path fix is out-of-scope — prefer removing the `agents/` bullet over fixing its path.

Scope: `skills/skill-optimizer/SKILL.md` (151 lines) + `skills/skill-optimizer/references/adversarial-review-checklist.md` (55 lines)
Diff inspected: `git diff HEAD -- skills/skill-optimizer/SKILL.md` (old 306 lines with JSON memory + node scripts -> new 151 lines agnostic loop) + new checklist.
Grounding checked: `skills/README.md` index, `AGENTS.md` existence, Phase-1 skill dirs exist, `agents/` layout, `skills/skill-updater/` deletion, relative link resolution.

Posture: red-team falsification across plausibility/grounding, mechanical enforceability, token economy, degree-of-freedom calibration, failure modes.

---

### F1: [Plausibility & Grounding] Review-launch is agnostic to the point of unexecutable
- Severity: BLOCKER
- Location: skills/skill-optimizer/SKILL.md#L86
- Adversarial Challenge: `Launch an independent review pass (using the designated review agent, orchestrator harness, or clean-context subagent)` names 3 disjoint mechanisms with no selection rule, no tool/command, no prompt template. Old version had verbatim candidate/evaluator prompts; consolidation deleted them and replaced with hand-wave. Agent with no subagent facility, no Orca, no designated file will hallucinate a harness.
- Proposed Remediation: Add 3-line dispatch contract: 1) if user named harness -> validate path exists (`agents/*.agent.md` / `orca` CLI) else abort to manual review, 2) else if subagent tool available -> launch with checklist path + diff, 3) else fallback to self-review in same context and label findings `SELF-REVIEW-DEGRADED`. Never invent a harness name.

### F2: [Failure Modes] Convergence loop has no circuit breaker
- Severity: BLOCKER
- Location: skills/skill-optimizer/SKILL.md#L121
- Adversarial Challenge: `If BLOCKER or MAJOR exist: return to Phase 2` with no max rounds, no token budget, no stale-finding detection. Violates its own checklist `Anti-Looping Guards` at `adversarial-review-checklist.md#L42`. Two disagreeing agents can ping-pong R1..R∞ and burn context.
- Proposed Remediation: Add hard gate: `Max 3 rounds; R3+ requires human sign-off to continue. Declare CONVERGED if R(N)==R(N-1) with no new BLOCKERs, else ESCALATE with open list.` Log `prior-round SHA` per round.

### F3: [Mechanical Enforceability] Verification diff references undefined baseline
- Severity: BLOCKER
- Location: skills/skill-optimizer/SKILL.md#L119
- Adversarial Challenge: `git diff <prior-round>..HEAD` is not executable — `<prior-round>` is never defined/captured. Phase 2 L81 says `Run git diff against starting baseline` but never records `git rev-parse HEAD` / tag / stash. Reviewer cannot verify, author cannot prove what changed.
- Proposed Remediation: Phase 1 add: `Record BASE_SHA=$(git rev-parse HEAD)`. Phase 2/5 change to `git diff BASE_SHA..HEAD` and per-round `git rev-parse HEAD > .last-round-sha`. Fail closed if `BASE_SHA` missing.

### F4: [Plausibility & Grounding] Wrong `agents/` path in Settlement
- Severity: MAJOR
- Location: skills/skill-optimizer/SKILL.md#L131
- Adversarial Challenge: From `skills/skill-optimizer/SKILL.md`, bare `agents/` resolves to `skills/skill-optimizer/agents/` (does not exist). Correct target is repo-root `agents/` i.e. `../../agents/`. Following instruction as written edits wrong location or no-ops. Adjacent lines get this right (`../README.md`, `../../AGENTS.md`).
- Proposed Remediation: Change to `` `../../agents/` `` and add validation: `ls ../../agents/*.agent.md` before edit.

### F5: [Degree of Freedom] Strict contracts described but never shown
- Severity: MAJOR
- Location: skills/skill-optimizer/SKILL.md#L78
- Adversarial Challenge: `Low freedom: YAML schemas, exact commands, immutable file seams` gives zero examples. Consolidation deleted the only machine contracts in repo (`evaluation.json`, `mutation-memory.template.json`, node validators). Net regression: skill now preaches contracts while shipping none. Author cannot distinguish heuristic vs contract.
- Proposed Remediation: Add minimal 8-line contract example in `references/` (e.g. finding-schema with `severity enum[BLOCKER,MAJOR,MINOR]` + `location regex`) and link it. Rule: fragile ops (human gate, test freeze, commit authority) MUST cite a schema path.

### F6: [Token Economy] Mermaid + duplication + mandatory full reads
- Severity: MAJOR
- Location: skills/skill-optimizer/SKILL.md#L12
- Adversarial Challenge: 20-line mermaid flowchart (~200 tokens) + L37-49 orchestration recap duplicating Phases 3-5 loads on every invocation for overview value only. Worse, L119 mandates `full file reads of the touched files` unconditionally — for large target skills this blows context and contradicts `Context Economy` L76 and `Progressive Disclosure` L77.
- Proposed Remediation: Move mermaid to `references/flow.md` or compress to 5-line numbered list. Change L119 to: `Read full diff + full file only if diff <200 lines, else diff hunks + 50 lines context around each hunk.`

### F7: [Mechanical Enforceability] Severity undefined + REJECT loophole permits false convergence
- Severity: MAJOR
- Location: skills/skill-optimizer/SKILL.md#L108
- Adversarial Challenge: `BLOCKER|MAJOR|MINOR` never defined anywhere (SKILL.md or checklist). Triage allows `REJECT with rationale` with no re-review requirement. Orchestrator can REJECT all BLOCKERs with one sentence and declare `Settled & Converged` at L123. No falsification.
- Proposed Remediation: Define: `BLOCKER=wrong/hallucinated/unexecutable, MAJOR=unenforceable/wasteful/loop-risk, MINOR=style/typo`. Require: `REJECT must cite file:line evidence + scope rule; all BLOCKER REJECTs re-enter next review round for confirmation.`

### F8: [Plausibility & Grounding] Hardcoded Phase-1 roster will rot and misroutes
- Severity: MAJOR
- Location: skills/skill-optimizer/SKILL.md#L57
- Adversarial Challenge: Lists 7 skills (`api-building`, `entity-models`...) as closed set from ~25+ skills in `skills/README.md`. Omits `skill-creator`, `documentation-maintenance`, `audit-project-context`, `security-defense-and-mitigation`, etc. New skills instantly stale; `lesson-learned` trigger will misroute to root guidance.
- Proposed Remediation: Replace hardcoded list with discovery rule: `grep -n "^name:\|^description:" skills/*/SKILL.md + read skills/README.md index; prefer narrowest match, do not trust embedded list.` Keep 2-3 examples only, labeled as examples.

### F9: [Token Economy & Actionability] Checklist violates its own Rules-over-Narratives
- Severity: MINOR
- Location: skills/skill-optimizer/references/adversarial-review-checklist.md#L25
- Adversarial Challenge: `Public Good Context` is meaningless typo for token justification. Items like `Grep-able Cues`, `Deterministic Verification` give no threshold, no regex/AST example, no validation command — exactly the narrative fluff the checklist claims to eliminate. Also L13 `Docker containerization when host runtimes are missing` is leftover from deleted node/Docker workflow with no current scripts to apply it to; L143 in SKILL.md `Validated container execution` similarly dangles.
- Proposed Remediation: Rename to `Token Justification: delete paragraph if removal preserves behavior`. Add one concrete cue per item, e.g. `e.g. grep -rn "TODO|FIXME|process.env"`. Delete Docker/container clause or scope it to `only if skill cites a runtime script.`

---

## Reviewer notes for triage

- Highest leverage: F1 dispatch contract + F2 circuit breaker + F3 BASE_SHA capture. Without these the loop is unexecutable / unbounded / unverifiable.
- Quick wins: F4 path fix, F9 typo + dangling container refs.
- Structural debt: F5 needs a real schema example to restore what deletion removed; F7 needs severity definitions to prevent REJECT-abuse; F8 needs discovery rule not hardcoded roster; F6 needs scoped reads.
- Verified clean: no dangling refs to deleted `scripts/*.mjs` / `mutation-memory.json` / `skill-updater/SKILL.md` in current tree (grep clean); `../README.md` and `../../AGENTS.md` links resolve correctly — only `agents/` does not.
