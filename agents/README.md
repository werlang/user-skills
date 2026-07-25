# Task agents

These files define a small task-orchestration team. They are complementary:
the orchestrator owns coordination and commits, while the worker agents own
one bounded phase of a task.

| Agent | Responsibility | Does not own |
| --- | --- | --- |
| [`Task Orchestrator.agent.md`](Task%20Orchestrator.agent.md) | Routes work, maintains `PLAN.md`, coordinates review/testing, and manages commits when requested. | Production code, tests, or bug fixes. |
| [`Task Planner.agent.md`](Task%20Planner.agent.md) | Researches a complex request and creates an atomic plan. | Implementation, tests, or commits. |
| [`Task Coder.agent.md`](Task%20Coder.agent.md) | Implements one selected task. | New test suites, review, or commits. |
| [`Task Reviewer.agent.md`](Task%20Reviewer.agent.md) | Reviews one completed task for correctness and security risks. | Fixes, tests, or commits. |
| [`Task Tester.agent.md`](Task%20Tester.agent.md) | Authors and runs the narrowest relevant tests in prep or validation mode. | Production fixes or commits. |

## Normal flow

For a complex request, the orchestrator delegates planning first. The usual
implementation loop is:

```text
request
  -> planner
  -> tester prep (when an honest pre-change check exists)
  -> coder
  -> reviewer
  -> tester validation
  -> documentation mode and documentation review when required
  -> handoff
```

The canonical state for a planned task is the orchestration folder under
`.agents/orchestrator/<REQUEST_ID>-<short-slug>/`, containing at least
`00-request.md` and `PLAN.md`. Workers must read the selected task from that
plan and must not broaden their scope without returning a blocker or review
note.

## File naming

Agent filenames use the stable role name, for example
`Task Coder.agent.md`. Version history belongs in Git history; do not add a
version suffix to the active filename unless the runtime explicitly requires
parallel versions.
