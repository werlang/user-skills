# Task agents

These files define an autonomous engineering team. They are complementary:
the orchestrator coordinates work, presents interactive Team Sheets, and manages commits, while worker agents adopt specialized domain skills for each bounded phase.

| Agent | Responsibility | Delegated Skills | Does not own |
| --- | --- | --- | --- |
| [`Task Orchestrator.agent.md`](Task%20Orchestrator.agent.md) | Autonomous Engineering Lead. Coordinates planning, Team Sheet gate, TDD loop, circuit breakers, memory sync, and atomic commits. | `git-change-workflow`, `obsidian-dev-brain`, `lesson-learned` | Production code, test authoring, or bug fixes. |
| [`Task Planner.agent.md`](Task%20Planner.agent.md) | Lead Architect & Strategist. Analyzes scope, creates Pre-Mortem risk matrices, maps domain skills, and builds the Team Sheet. | `clean-code-and-oop` | Implementation, tests, or commits. |
| [`Task Coder.agent.md`](Task%20Coder.agent.md) | Domain Specialist Coder. Implements one bounded task adopting assigned domain skills, adhering to clean code standards and documenting touched code. | `clean-code-and-oop`, `document-touched-code`, assigned domain skills (`css-standards`, `api-building`, etc.) | New test suites, review, or commits. |
| [`Task Reviewer.agent.md`](Task%20Reviewer.agent.md) | Red-Team Auditor. In `plan` mode, audits plans/pre-mortems before coding. In `code` mode, skeptically audits diffs for correctness, security vectors, and KISS/YAGNI. | `code-review`, `security-defense-and-mitigation`, `clean-code-and-oop`, `backend-bug-review-generalized`, `frontend-bug-review-generalized` | Fixes, tests, or commits. |
| [`Task Tester.agent.md`](Task%20Tester.agent.md) | Quality & Verification Engineer. Authors narrow failing tests before coding (TDD prep) and validates regressions in Docker/containers. | `tdd`, `test-first-delivery-generalized` | Production fixes or commits. |

## Autonomous Lifecycle Flow

For a complex (Tier 3) request, the orchestrator coordinates the team through explicit phase gates:

```text
Request (00-request.md)
  -> Lead Architect (Task Planner: research, pre-mortem, domain skill tagging)
  -> Red-Team Auditor (Task Reviewer: plan mode pre-flight audit)
  -> [Interactive Team Sheet Gate: user alignment]
  -> For each task:
       1. Quality Engineer (Task Tester: prep mode -> narrow failing test)
       2. Domain Specialist Coder (Task Coder: standard mode + domain skill)
       3. Red-Team Auditor (Task Reviewer: code mode -> skeptical review)
       4. Quality Engineer (Task Tester: validation mode -> test pass)
       5. Circuit Breaker Check (Retry <= 3)
       6. Task Orchestrator commits atomically (git-change-workflow)
  -> Browser / Manual Validation (when requested)
  -> Documentation Phase (Task Coder: documentation mode -> Task Reviewer)
  -> Institutional Memory Sync (obsidian-dev-brain & LESSONS.md)
```

The canonical state for an orchestration run lives under
`.agents/orchestrator/<REQUEST_ID>-<short-slug>/`, containing `00-request.md` and `PLAN.md`. Workers must read the selected task from that plan and operate strictly within declared file and domain skill boundaries.

## File naming

Agent filenames use the stable role name, for example `Task Coder.agent.md`. Version history belongs in Git history; do not add a version suffix to the active filename.
