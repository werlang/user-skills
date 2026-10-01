# Round 2 Adversarial Verification — skill-optimizer

Scope: `skills/skill-optimizer/SKILL.md` (148 lines) + `references/adversarial-review-checklist.md` (55 lines) + `references/finding-contract.md` (52 lines, new)
Baseline: `verification/round1-adversarial-review.md` F1–F9
Method: full file reads + `git diff HEAD -- skills/skill-optimizer/` + grep grounding (`agents/`, `mermaid`, `BASE_SHA`, `docker|container|mutation-memory|skill-updater`)

User constraint (carried from R1): do NOT use agents from `agents/` folder. Disregard `agents/` harness. Prefer removal over path-fix.

Verdict: **INCOMPLETE — READY FOR R3**. R1 fixes substantially applied, but one BLOCKER remains (user-constraint violation reintroduced by F1/F4 fixes). No silent convergence.

---

## R1 fix verification

| ID | R1 title | Status | Evidence |
|----|----------|--------|----------|
| F1 | Dispatch contract missing | PASS with violation (see R2-F1) | SKILL.md#L67-L75 3-tier contract present with validation + degraded label. Tier-1 example still cites `../../agents/` in violation of user constraint. |
| F2 | No circuit breaker | PASS | SKILL.md#L116-L119 max 3 rounds + escalation gate; checklist#L42 mirrors it. |
| F3 | Undefined baseline diff | PASS | SKILL.md#L36-L41 `BASE_SHA=$(git rev-parse HEAD)`, L63 + L73 + L114 `git diff BASE_SHA..HEAD`, L112 `ROUND_SHA`. Minor persistence gap only (see R2-F3). |
| F4 | Wrong `agents/` path | FAIL — wrong direction | SKILL.md#L127 now `../../agents/` technically resolves, but violates user constraint to disregard `agents/` entirely. Must remove, not fix. See R2-F1. |
| F5 | No strict contract example | PASS | `finding-contract.md` created with markdown schema + severity table + YAML summary; linked from SKILL.md#L61,L73,L84 and checklist#L34,L47. Minor verdict-string drift only (see R2-F3). |
| F6 | Mermaid + full reads | PASS with residue | `mermaid` removed (grep clean); scoped reads at L113-L115 (`<200` full, `>=200` hunks+50). Residual: L114 still allows unbounded full files; L10 intro still narrative. See R2-F4. |
| F7 | Severity undefined + REJECT loophole | PASS | Severities defined SKILL.md#L96-L99 + contract#L23-L27; REJECT requires evidence L104 + BLOCKER re-entry. Enforcement relies on L119 dual-verify — acceptable. |
| F8 | Hardcoded roster | PASS | Dynamic discovery SKILL.md#L43-L48 via `grep -rn "^name:\|^description:" skills/*/SKILL.md` + README index; examples marked `e.g.`. |
| F9 | Checklist narratives + containers | PARTIAL | `Token Justification` fixed L25, grep cues added L18 (`grep -rn "TODO\|FIXME\|any"`), verification cues L10/L20 (`which`, `--help`, exit `0`). Residual container phrase L12 + `agents/` ref L11. See R2-F1/R2-F2. |

Clean confirmed: no refs to deleted `scripts/*.mjs`, `mutation-memory.json`, `evaluation.json`, `skill-updater/SKILL.md`; `../README.md` + `../../AGENTS.md` resolve correctly.

---

## New findings (R2)

### R2-F1: [User Constraint] `agents/` refs reintroduced after explicit disregard
- Severity: BLOCKER
- Location: skills/skill-optimizer/SKILL.md#L26, skills/skill-optimizer/SKILL.md#L70, skills/skill-optimizer/SKILL.md#L127, skills/skill-optimizer/references/adversarial-review-checklist.md#L11
- Adversarial Challenge: R1 triage note required removing `agents/` harness, not fixing its path. R2 instead standardised on `../../agents/` in 4 places (customization L26 `designated agent files`, dispatch example L70 `test -f ../../agents/<name>.agent.md`, settlement L127, checklist L11). Following the skill as written now routes the user toward a forbidden harness and contradicts the recorded constraint.
- Proposed Remediation: Delete, don't fix: remove `agents/` bullet from Phase 6 settlement (or replace with `skills/` + `AGENTS.md` only); change L70 example to `which orca` / subagent availability check only; change L26 to `user-specified harness (e.g. Orca), subagents, or alternative models` with no agent-files clause; change checklist L11 to `references/, docs/` only. Add one-line guard: `Never reference agents/ — user has excluded that harness.`

### R2-F2: [Plausibility] Residual container clause with no workflow to attach to
- Severity: MINOR
- Location: skills/skill-optimizer/references/adversarial-review-checklist.md#L12
- Adversarial Challenge: `when containers are required` survives from deleted node/Docker era. No skill in tree currently declares a container runtime (grep for `docker` clean except this line). Reviewer will flag phantom container requirements or demand containers where none exist.
- Proposed Remediation: Delete trailing clause or scope: `Flag assumptions of undeclared host runtimes (Node/Python) unless the target skill declares them.`

### R2-F3: [Mechanical Enforceability] Ephemeral SHAs + verdict-string drift
- Severity: MINOR
- Location: skills/skill-optimizer/SKILL.md#L39, skills/skill-optimizer/SKILL.md#L112, skills/skill-optimizer/references/finding-contract.md#L40
- Adversarial Challenge: `BASE_SHA`/`ROUND_SHA` are shell variables — lost across subagent contexts and retries. `All subsequent diffs evaluate against BASE_SHA or previous round's ref` (L41) never names `ROUND_SHA` as that ref. Contract YAML uses `CONVERGED | INCOMPLETE | ESCALATE` while SKILL.md uses `Settled & Converged` (L119) — automated harness cannot map them.
- Proposed Remediation: Add persistence rule: `Record BASE_SHA and ROUND_SHA in the round header / verification file header; fail closed if missing.` Change L41 to `...against BASE_SHA (R1) or ROUND_SHA(N-1) (R2+)`. Align strings: `Settled & Converged == CONVERGED`.

### R2-F4: [Token Economy] Unbounded full-file read + intro narrative residue
- Severity: MINOR
- Location: skills/skill-optimizer/SKILL.md#L10, skills/skill-optimizer/SKILL.md#L114
- Adversarial Challenge: `If diff <200 lines: read full diff and full files` still permits unbounded reads (touched skill + all refs) for the common small-diff case, undercutting the F6 fix. L10 `unifies durable rule codification with empirical, adversarial hardening...` is marketing narrative that violates the skill's own `Rules over Narratives` (L56).
- Proposed Remediation: Scope L114 to `full diff + touched files only (SKILL.md + edited refs), not transitive closure.` Compress L10 to one imperative line, e.g. `Harden skills via bounded adversarial rounds until BLOCKER/MAJOR converge.`

---

## Convergence gate

- BLOCKERs open: 1 (R2-F1).
- MAJORs open: 0.
- MINORs open: 3 (R2-F2, R2-F3, R2-F4).
- Action: address R2-F1 (deletion, not path-fix) then R3 verification can declare **Settled & Converged** (`CONVERGED`) if no new BLOCKER/MAJOR emerge. Do not loop on MINORs alone past R3 per circuit breaker.
