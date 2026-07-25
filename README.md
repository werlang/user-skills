# User Skills

Reusable Codex skills and task agents for software development work.

This repository is organized as plain Markdown guidance with small reference
projects and helper scripts where a skill needs them. It does not contain a
single application, package manifest, or root-level runtime.

## Repository layout

| Path | Purpose |
| --- | --- |
| [`skills/`](skills/) | Reusable skills. Each skill is a directory with a `SKILL.md` entrypoint. |
| [`skills/*/references/`](skills/) | Focused checklists, templates, examples, and reference implementations used by skills. |
| [`skills/*/scripts/`](skills/) | Optional validation or workflow scripts shipped with a skill. |
| [`agents/`](agents/) | Task-specific agent definitions for planning, coding, review, and testing. |
| [`.github/COMMIT-v2.md`](.github/COMMIT-v2.md) | Commit-message convention for this repository. |

## Skill definitions

See the [skill definition catalog](skills/README.md) for the complete list of
skills and the purpose of each one. Each skill's `SKILL.md` is its authoritative
definition; read it before using that skill.

## Task agents

The [`agents/`](agents/) directory contains the orchestration workers. Start
with `Task Orchestrator` for multi-step work; it coordinates `Task Planner`,
`Task Coder`, `Task Reviewer`, and `Task Tester`.
See
[`agents/README.md`](agents/README.md) for role boundaries and the expected
workflow.

## Contributing changes

Keep guidance executable and aligned with the files it describes:

1. Read [`AGENTS.md`](AGENTS.md) before changing skills or agents.
2. Keep each skill's `SKILL.md` focused on when to use it and how to work.
3. Put detailed checklists, templates, and examples in that skill's
   `references/` directory.
4. Update the relevant README or agent guidance when a path, workflow, or
   convention changes.
5. Use targeted file and link checks when no runtime test applies.

There is no root test command. Skill-specific scripts document their own
invocation and should be run only when the changed skill requires them.
