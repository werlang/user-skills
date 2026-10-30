# Project skill template

Copy into `<repo>/.agents/skills/<name>/SKILL.md` and replace every bracketed part with verified facts. Delete sections that have nothing true to say.

```markdown
---
name: <name, equal to the folder>
description: <What this covers in this project and when to use it, with project triggers: paths, layers, file names.>
---

# <Project> <concern>

Localizes the global `<base>` skill (and `<other base>`): follow it for the method; this file holds what is true in <project>. On project facts, this file wins.

## Where

- `<path>`: <role>.
- `<path>`: <role>.

## Rules

- <A convention the code follows, stated as a rule, naming the real file, export or command.>
- <...>

## Deviations from `<base>`

- <What the project does instead of the global method> — <why: a deliberate choice, a constraint, a migration in progress>.

## Commands

<Only commands that run in this repository, in the form its rules require (for example through containers).>

## Checks before finishing

- <The project's own gates for this concern: tests, lint, generators to re-run, docs to update.>
```

Guidelines:

- Prefer a rule with a path over a principle without one.
- One fact per bullet; no narrative.
- If `AGENTS.md` already states a rule in full, link it instead of repeating it.
- Keep it short: a project skill is a delta over its global base, not a manual.
