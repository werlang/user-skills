# Adversarial Review Checklist for Skill Optimization

This checklist guides the adversarial reviewer when auditing candidate skill mutations, revisions, and durable rules.

The reviewer's goal is **adversarial falsification**: aggressively breaking assumptions, exposing LLM blind spots, eliminating narrative fluff, and ensuring mechanical enforceability.

---

## 1. Plausibility & Grounding Audit (Zero-Hallucination Gate)
- [ ] **Real Tools & Commands**: Do all cited commands, flags, tools, and MCP servers exist in the target environment or declared runtime? Verify with `which <tool>` or `<tool> --help`. (Flag any invented command or non-standard flag).
- [ ] **Path Realism**: Do all referenced file paths (`references/`, `docs/`, `../README.md`) resolve accurately from the skill directory?
- [ ] **Runtime Assumptions**: Are environment requirements validated before running commands? Flag assumptions of undeclared host runtimes (Node/Python) unless the target skill declares them.

---

## 2. Mechanical Enforceability & Actionability
- [ ] **Rules vs Narratives**: Is the guidance written as direct, imperative rules rather than conversational prose?
- [ ] **Grep-able Cues**: Are heuristics paired with mechanical detection cues (e.g. `grep -rn "TODO|FIXME|any"`, AST checks, or explicit exit codes) instead of vague impressions?
- [ ] **Concrete Cost Symptoms**: For clean-code and architecture heuristics, does flagging a smell require stating a concrete maintenance or testing cost?
- [ ] **Deterministic Verification**: Can an agent following this skill conclusively verify whether a task or diff succeeded using explicit exit codes (`0`) or diffs?

---

## 3. Token Economy & Progressive Disclosure
- [ ] **Token Justification**: Does every paragraph justify its token cost in the context window? Eliminate any sentence whose deletion preserves behavior.
- [ ] **LLM Competence Assumption**: Does the skill explain basics the LLM already knows (e.g. generic syntax or standard tool concepts)? Strip boilerplate.
- [ ] **Progressive Disclosure**: Are bulky catalogs, lookup tables, and detailed checklists offloaded to skill-local `references/` instead of cluttering `SKILL.md`?
- [ ] **Concise Examples**: Are examples minimal, self-contained, and directly executable?

---

## 4. Degree of Freedom Calibration
- [ ] **High Freedom**: Are creative or heuristic tasks given open text instructions without brittle over-specification?
- [ ] **Low Freedom / Strict Contracts**: Are fragile workflows (security boundaries, test freezing, commit authority, human escalation) guarded by strict machine-readable contracts (e.g., schemas in [finding-contract.md](finding-contract.md))?
- [ ] **Seam Integrity**: Does the skill maintain clean boundaries between orchestrator, author, reviewer, and tester roles?

---

## 5. Failure Modes & Graceful Degradation
- [ ] **Missing Prerequisites**: Does the skill specify a degraded fallback mode when optional tools, issue trackers, specs, or subagents are unavailable?
- [ ] **Stopping Gates**: Does the skill enforce hard stopping points (e.g. report-first gates, human sign-off gates) to prevent runaway auto-fixing or unreviewable mutations?
- [ ] **Circuit Breakers**: Are iteration loops bounded by explicit round limits (e.g. max 3 rounds before human escalation) to prevent endless ping-pong?

---

## 6. Review Finding Structure
Adhere to the schema defined in [references/finding-contract.md](finding-contract.md):

```markdown
### F<Number>: [<Category>] <Short Finding Title>
- **Severity**: BLOCKER | MAJOR | MINOR
- **Location**: `<target-file>#L<line>`
- **Adversarial Challenge**: <Why this fails in practice, exposes a blind spot, or creates cognitive/token overhead>
- **Proposed Remediation**: <Concrete, minimal surgical fix or counter-direction>
```
