# Task agents

These files define an autonomous engineering team. They are complementary:
the orchestrator coordinates work, presents interactive Team Sheets, and manages commits, while worker agents adopt specialized domain skills for each bounded phase. The team enforces Independent Verification TDD (IV-TDD): the implementer never controls the oracle.

| Agent | Responsibility | Delegated Skills | Does not own |
| --- | --- | --- | --- |
| [`Task Orchestrator.agent.md`](Task%20Orchestrator.agent.md) | Autonomous Engineering Lead. Coordinates planning, Team Sheet gate, IV-TDD loop with authoritative freeze, circuit breakers, memory sync, and atomic commits. | `git-change-workflow`, `tdd`, `test-first-delivery-generalized`, `obsidian-dev-brain`, `lesson-learned` | Production code, test authoring, or bug fixes. |
| [`Task Planner.agent.md`](Task%20Planner.agent.md) | Lead Architect & Strategist. Analyzes scope, creates Pre-Mortem risk matrices (including correlated-generation), maps contracts and authoritative/work test paths, and builds the Team Sheet. | `clean-code-and-oop` | Implementation, tests, or commits. |
| [`Task Coder.agent.md`](Task%20Coder.agent.md) | Domain Specialist Coder. Implements one bounded task adopting assigned domain skills, adhering to clean code standards and documenting touched code. May write `tests/work/**` probes only; `tests/authoritative/**` is frozen. | `clean-code-and-oop`, `document-touched-code`, assigned domain skills (`css-standards`, `api-building`, etc.) | Authoritative tests, review, or commits. |
| [`Task Reviewer.agent.md`](Task%20Reviewer.agent.md) | Red-Team Auditor. In `plan` mode, audits plans/pre-mortems and IV-TDD readiness before coding. In `code` mode, skeptically audits diffs for correctness, security vectors, KISS/YAGNI, and authoritative immutability. | `code-review`, `security-defense-and-mitigation`, `clean-code-and-oop`, `backend-bug-review-generalized`, `frontend-bug-review-generalized`, `tdd`, `test-first-delivery-generalized` | Fixes, tests, or commits. |
| [`Task Tester.agent.md`](Task%20Tester.agent.md) | Quality & Verification Engineer. In `prep` (Designer) mode authors frozen authoritative tests from the spec without seeing implementation; in `validation` mode runs authoritative + work + mutation + adversarial checks in Docker. | `tdd`, `test-first-delivery-generalized` | Production fixes or commits. |

## Autonomous Lifecycle Flow

For a complex (Tier 3) request, the orchestrator coordinates the team through explicit phase gates:

```text
Request (00-request.md)
  -> Lead Architect (Task Planner: research, contract, pre-mortem, authoritative/work paths)
  -> Red-Team Auditor (Task Reviewer: plan mode pre-flight audit + IV-TDD readiness)
  -> [Interactive Team Sheet Gate: user alignment]
  -> For each task:
       1. Quality Engineer (Task Tester: prep mode -> frozen authoritative tests from spec)
       2. Domain Specialist Coder (Task Coder: standard mode + domain skill, reads/runs authoritative, may write tests/work/** only)
       3. Red-Team Auditor (Task Reviewer: code mode -> skeptical review + [IV-TDD] integrity: authoritative not touched, no correlated generation)
       4. Quality Engineer (Task Tester: validation mode -> authoritative + work + mutation_score >=0.90 + adversarial findings)
       5. Circuit Breaker & Test Change Request Check (Retry <= 3; if authoritative is wrong, route to Tester/Designer for re-freeze)
       6. Task Orchestrator commits atomically (git-change-workflow)
  -> Browser / Manual Validation (when requested)
  -> Documentation Phase (Task Coder: documentation mode -> Task Reviewer)
  -> Institutional Memory Sync (obsidian-dev-brain & LESSONS.md)
```

The canonical state for an orchestration run lives under
`.agents/orchestrator/<REQUEST_ID>-<short-slug>/`, containing `00-request.md` and `PLAN.md`. Workers must read the selected task from that plan and operate strictly within declared file and domain skill boundaries. `tests/authoritative/**` is the frozen oracle; `tests/work/**` is the implementer's scratch suite.

## File naming

Agent filenames use the stable role name, for example `Task Coder.agent.md`. Version history belongs in Git history; do not add a version suffix to the active filename.
