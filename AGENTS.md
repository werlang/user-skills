# Agent guidance

## Repository purpose

This is a file-based collection of reusable Codex skills and task-agent
definitions. The source of truth is the checked-in Markdown and the small
reference projects or scripts that accompany it.

## Before editing

- Read the target `skills/<name>/SKILL.md` or agent file completely.
- Inspect referenced files and confirm that paths, commands, and examples
  exist.
- Check `git status --short` and preserve unrelated user changes.
- Treat existing skill and agent contracts as intentional unless the request
  explicitly changes them.

## Skill conventions

- Every skill entrypoint is `skills/<name>/SKILL.md`.
- Keep YAML frontmatter valid and keep `name` consistent with the directory.
- Use the description to state the trigger and scope; put operational detail
  in the body.
- Resolve relative references from the skill directory.
- Keep examples minimal and executable. Do not document a command that is not
  defined by the referenced project or script.
- Put reusable checklists, templates, and examples in a skill-local
  `references/` directory. Preserve an established `reference/` layout when a
  skill already uses it; put executable helpers in `scripts/`.
- Keep [`skills/README.md`](skills/README.md) synchronized with the skill
  directories and their `SKILL.md` descriptions.
- When updating `obsidian-dev-brain`, keep its in-vault protocol note and the
  User Skills project changelog synchronized with the skill's operational
  rules. Record contract, migration, and validation guidance as behavior-level
  changes rather than a file-by-file inventory.

## Agent conventions

- Agent definitions live in `agents/` and use the `.agent.md` suffix.
- Keep role boundaries explicit. The orchestrator coordinates work; planner,
  coder, reviewer, and tester do not silently take over one another's duties.
- Preserve the canonical orchestration inputs `00-request.md` and `PLAN.md`
  when an agent workflow refers to them.
- Do not grant commit authority to worker agents when the orchestrator owns
  commits.
- Keep agent names, handoffs, and referenced files synchronized with the
  actual files in this repository.

## Documentation rules

- Keep `README.md` human-oriented: explain purpose, layout, available areas,
  and contribution expectations.
- Keep this file agent-oriented: state source-of-truth rules, boundaries, and
  validation expectations.
- Update [`agents/README.md`](agents/README.md) when the agent roster or
  workflow changes.
- Prefer precise claims over aspirational ones. If a validation path is not
  available, say so.

## Validation

This repository has no root package manifest or application runtime. For a
documentation-only change, run targeted checks such as:

```sh
rg --files skills agents 2>/dev/null || find skills agents -type f | sort
rg -n "^name:" skills/*/SKILL.md 2>/dev/null || grep -rn "^name:" skills/*/SKILL.md
rg -n "path|command|agent name|skill name" README.md AGENTS.md agents skills 2>/dev/null || grep -rn "path\|command\|agent name\|skill name" README.md AGENTS.md agents skills
```

`rg` is preferred when installed; `find`/`grep` are the portable fallback.

When changing a skill with a shipped script, use that script's documented
command. Report environment failures separately from content or contract
errors.
