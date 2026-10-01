# Round 1 Adversarial Review — test skills (tdd + test-first-delivery-generalized)

```yaml
review_round:
  round_number: 1
  base_sha: "a2ca7f0d0fd3c3908ab3bacc7f940850dbab1080"
  target_file: "skills/tdd/SKILL.md; skills/tdd/tests.md; skills/tdd/mocking.md; skills/test-first-delivery-generalized/SKILL.md; skills/test-first-delivery-generalized/references/independent-verification.md; skills/test-first-delivery-generalized/references/validation-commands.md; skills/test-first-delivery-generalized/references/testing-decision-tree.md"
  verdict: INCOMPLETE
  findings_count:
    blocker: 1
    major: 6
    minor: 1
```

Scope: falsification strength (kill tautological / sycophantic / shallow tests) + checklist 5-axis audit + zero `agents/`-folder routing + zero ungrounded environment assumptions.
Method: full reads of all 7 files + grep grounding (`agents/`, `docker|compose`, `toMatchSnapshot|updateSnapshot|--u`, `CONTEXT.md`, compose/manifest existence) + contract-schema output.

Grounding passes: zero content references to root `agents/` folder (`grep -rn "agents/" skills/tdd/ skills/test-first-delivery-generalized/` clean). `skills/tdd/agents/openai.yaml` is skill-local metadata, not root-harness routing — flagged only as unreferenced cruft in F8. No `skill-optimizer` loop violations inherited.

---

### F1: [Plausibility] Absolute Docker mandate with hardcoded service topology is unexecutable here
- Severity: BLOCKER
- Location: `skills/test-first-delivery-generalized/references/validation-commands.md#L6`
- Adversarial Challenge: `Since the host environment lacks local Python or Node.js runtimes, all verification commands must be executed using Docker containers` states a host fact that is false in general and unverified per target. This repo itself has no `package.json`, no `pyproject.toml`, no `docker-compose.yml` (verified absent), and per AGENTS.md is docs-only. Every command then hardcodes `docker compose run --rm api|web|service` — three service names with no `docker-compose.yml` to ground them. Applied to this repo or any non-Compose project, all 15+ commands fail. Checklist Runtime Assumptions violated.
- Proposed Remediation: Downgrade L6 to conditional discovery: `If the target project declares Docker Compose, prefer it; otherwise use the project's documented runner after verifying with which node/python + package.json/pyproject.toml.` Replace hardcoded `api|web|service` with `<service-from-compose-yml>` placeholder plus `docker compose config --services` discovery step. Add non-Docker fallback (direct `npx vitest` / `pytest`) instead of Docker-or-nothing.

### F2: [Falsification] GOOD example teaches the exact shallow assertion the skill bans
- Severity: MAJOR
- Location: `skills/tdd/tests.md#L9`
- Adversarial Challenge: `expect(result.status).toBe("confirmed")` with no payload, line-item, total, or side-effect assertion is status-only verification. `skills/tdd/SKILL.md#L30` explicitly defines this as shallow (`expect(res.status).toBe(200) without asserting payload values`), and L88 bans relying solely on it in authoritative tests. A learner copying the GOOD pattern ships a test that passes when the wrong items, wrong total, or no charge occurs — pure confirmation, zero falsification.
- Proposed Remediation: Harden the GOOD example to assert exact contract: `expect(result).toEqual({ status: "confirmed", total: <literal>, items: [...], chargeId: expect.any(String) })` or split status + payload assertions. Add reviewer cue: reject any authoritative test asserting status/shape without exact values.

### F3: [Mechanical Enforceability] No grep-able anti-tautology guard and open snapshot-sycophancy loophole
- Severity: MAJOR
- Location: `skills/tdd/SKILL.md#L29`
- Adversarial Challenge: Tautological (`expected` recomputed like impl) and sycophantic (post-hoc expected-matching) bans are prose only. No regex/AST cue tells Designer/Reviewer how to detect `const expected = items.reduce(...)` or `expect(add(a,b)).toBe(a+b)`, and grep confirms zero mentions of `toMatchSnapshot` / `updateSnapshot` / `--u` anywhere. `npx vitest -u` / `toMatchSnapshot()` auto-blesses whatever the code emitted — the canonical sycophancy machine — yet is never forbidden. Agents will keep generating self-agreeing suites that pass sabotage by construction.
- Proposed Remediation: Add mechanical cues to `tdd/SKILL.md` anti-patterns: reject `expected\s*=.*(reduce|map|filter).*\n.*expect\(.*\)\.toBe\(expected\)`, reject `expect\(.*\)\.toBe\([a-z]+\s*[+\-*/]`, and add rule: `Ban toMatchSnapshot()/toMatchInlineSnapshot() in authoritative tests; ban -u/--updateSnapshot unconditionally; snapshot changes require Test Change Request.` Mirror in test-first-delivery Phase 2 reviewer checklist.

### F4: [Degree of Freedom] Freeze DENIED is a text slogan, not a machine boundary
- Severity: MAJOR
- Location: `skills/tdd/SKILL.md#L66`
- Adversarial Challenge: `WRITE tests/authoritative/** = DENIED for Implementer` and `write_file(...) → DENIED` claim tool/filesystem enforcement, but no wrapper, hook, MCP scope, or script implements it. Subagent tooling here has no path-scoped deny primitive; the only executable artifact is a `git diff --name-only | grep` post-hoc check (itself inconsistent — see F8). A strict contract with no mechanism is high-freedom prose masquerading as low-freedom. Implementer edits the oracle, suite goes green, nobody stops it.
- Proposed Remediation: Recalibrate DoF honestly: label freeze as `orchestrator-enforced convention + post-run guard`, provide the one executable guard verbatim (`git diff --name-only HEAD -- tests/authoritative | grep -q . && exit 1` run by orchestrator before accept), and require the orchestrator — not the implementer — to own all `tests/authoritative/**` writes. Drop `→ DENIED` arrow notation unless a real deny hook ships in `scripts/`.

### F5: [Failure Modes] Single-agent fallback destroys the isolation invariant it claims to preserve
- Severity: MAJOR
- Location: `skills/test-first-delivery-generalized/SKILL.md#L150`
- Adversarial Challenge: `do Phase 1-3 in a separate model turn with implementation files hidden` in the same context window is not isolation — the model retains the implementation it just read, the contract interpretation, and the planned code. Correlated `spec → impl → test` self-consistency (correctly diagnosed at `tdd/SKILL.md#L56`) re-enters through memory. No `[SELF-REVIEW-DEGRADED]` label (required by skill-optimizer dispatch), no hidden-test split mandated, no clean-context relaunch. Single-agent runs will certify their own mirrors as independent.
- Proposed Remediation: Mark fallback explicitly degraded: require `[SELF-REVIEW-DEGRADED]` label on all fallback suites, mandate hidden-test split (`public` visible / `hidden` CI-only) when subagents are unavailable, and forbid claiming IV-TDD independence — report as `authoritative-unverified, mutation-gated only`. Prefer two-session separation (new clean turn with only contract+interfaces pasted) over same-turn role-play.

### F6: [Token Economy] SKILL.md duplicates its own references and contradicts its coverage gate
- Severity: MAJOR
- Location: `skills/test-first-delivery-generalized/SKILL.md#L154`
- Adversarial Challenge: §3 decision tree (~20 lines), freeze blocks (L79-L96), TCR flow (L139-L150), mutation/sabotage (L120-L137), and hidden-tests (L137) each repeat `references/testing-decision-tree.md` and `references/independent-verification.md` nearly verbatim — ~80 duplicated lines loaded on every invocation, violating Progressive Disclosure the skill itself preaches. Worse, L20 says `coverage is not a quality gate` while L211 and `testing-decision-tree.md#L43` demand `coverage is 100%` as a Done criterion. Orchestrator cannot tell whether 92% coverage ships or blocks.
- Proposed Remediation: Compress §3 to a 6-line router (`discover manifests → decision-tree.md → contract → Designer→Reviewer→freeze→implement→verify`) and delete duplicated blocks, keeping only the `NEVER edit authoritative to green` invariant inline. Resolve the contradiction in one place: `coverage informative; mutation_score >= 0.90 is the gate; 100% scope coverage required only for the validated seam, not the repo.`

### F7: [Plausibility] Framework-existence claims and Stryker bare-run are ungrounded
- Severity: MAJOR
- Location: `skills/test-first-delivery-generalized/references/testing-decision-tree.md#L25`
- Adversarial Challenge: `Vitest infrastructure exists; Playwright E2E infrastructure exists` asserts target facts never discovered — false for this repo and any non-JS project. `npx stryker run` (SKILL.md#L124, validation-commands.md#L40, independent-verification.md#L80) assumes a configured `stryker.conf` + installed `@stryker-mutator/*`; bare `npx stryker run` on an unconfigured repo prompts/fails and mutates the whole project (hours, not a gate). No install/config/discovery step, no scoped `--mutate` form, no fallback when Stryker is absent beyond hand-waved sabotage.
- Proposed Remediation: Make L25-L26 conditional: `If package.json shows vitest/jest (verify with grep), use it; else bootstrap per step 3 or fall back to manual checklist.` Gate Stryker: `only run if stryker.conf exists or after npx stryker init; scope with --mutate <touched-files>; if unconfigured, Fast Sabotage (2-3 hand mutations, each MUST fail) is the accepted gate.` Verify commands with `which`/manifest grep before citing.

### F8: [Mechanical Enforceability] Guard-command drift, path-sprawl, and unreferenced skill-local agent file
- Severity: MINOR
- Location: `skills/test-first-delivery-generalized/references/validation-commands.md#L46`
- Adversarial Challenge: Three variants of the freeze guard coexist: `git diff --name-only HEAD | grep -q` (commands.md), `git diff --name-only | grep -q` (independent-verification.md#L37, misses staged), and prose `git diff` (SKILL.md#L208). None pins `-- tests/authoritative`, so `tests/work-authoritative-notes.md` false-positives. Path conventions sprawl across `tests/authoritative/**`, `tests/**/authoritative/**`, `__tests__/work/**`, `tests/work-*` — the guard cannot cover all spellings. Separately, `skills/tdd/agents/openai.yaml` ships with no reference from `tdd/SKILL.md` (dead weight, not a root-`agents/` violation).
- Proposed Remediation: Canonicalize to one guard: `git diff --name-only HEAD -- tests/authoritative | grep -q . && echo DENIED && exit 1` (orchestrator pre-accept). Canonicalize paths to `tests/authoritative/**` + `tests/work/**` with `adapt only if repo convention pre-exists` note. Either link `agents/openai.yaml` from SKILL.md or delete it.

---

## Convergence gate

- BLOCKERs open: 1 (F1). MAJORs open: 6 (F2–F7). MINORs open: 1 (F8).
- Action: address F1 (conditional Docker discovery, no hardcoded topology) plus F2–F7 before R2 verification can declare convergence. Falsification bar for R2: every GOOD example asserts independent literals + exact state; snapshot-update banned; freeze guard singular and executable; single-agent path labeled degraded; no ungrounded `exists` claims.
