---
name: migrate-project-context
description: "Migrate, port, rewrite, or update docs, prompts, skills, agents, instructions, README files, and other markdown/MD context from a source project into a target project. Use when copied .github/.agents/.claude/docs/tasks context must be audited against the target codebase, stale source-project claims removed, and files rewritten to match the destination project."
argument-hint: "Source repo/path, destination repo/path, or note that the source files are already copied"
user-invocable: true
---

# Migrate Project Context

Use this skill when a project inherited documentation or agent context from another repository and those files must become true for the destination project. This workflow always includes an audit pass before rewriting.

## Covers

- `.github/**`
- `.agents/**`
- `.claude/**`
- `README.md`, `AGENTS.md`, `CLAUDE.md`
- `docs/**/*.md`, `tasks/**/*.md`
- prompt, instruction, agent, skill, reference, and other markdown files related to project context

## Inputs to Confirm

1. Where the source context lives: a source repository/path, copied files already present in the destination, or both.
2. Which repository/folder is the destination source of truth.
3. Whether the request is limited to agent-context files or should include broader markdown documentation.

## Workflow

1. Inventory the destination implementation first. Map runtime, entry points, routes, entities/models, config, env vars, scripts, infrastructure, tests, and deployment shape.
2. Audit all destination docs and customization files in scope. Classify each as accurate, partial, incorrect, or obsolete. Use [the scope checklist](./references/scope-checklist.md).
3. Build a mismatch ledger with:
   - old or copied claim
   - verified destination reality
   - file or files that need rewriting, deletion, or link fixes
4. Rewrite files in this order:
   1. core instructions (`copilot-instructions.md`, `AGENTS.md`, `CLAUDE.md`)
   2. skill indexes, skill files, and skill references
   3. prompts, instructions, and custom agents
   4. README, docs, tasks, and other markdown
5. Replace source-project names, entities, routes, commands, ports, env vars, architecture claims, and examples with destination facts. Preserve structure only when it is still useful.
6. Run a stale-term sweep for source-specific residue and a consistency sweep for routes, scripts, ports, config names, env vars, file paths, and linked references.
7. Return the result using [the output template](./references/output-template.md).

## Rules

- Code wins over docs.
- Never keep aspirational claims as implemented facts.
- Do not assume copied context is mostly correct.
- Prefer deleting misleading content over leaving it half-correct.
- Update broken links and path references when files move or are renamed.
- If a customization references missing files, tools, workflows, or subsystems, rewrite or remove the reference.

## Required Checks

- Skill descriptions match real target workflows.
- Prompt examples point to paths and components that exist.
- Agent instructions describe actual quality gates, tools, and conventions.
- Markdown examples use real commands, files, APIs, and deployment assumptions.
- Any matching file under `.github`, `.agents`, or `.claude` is audited even if it was not named explicitly in the request.

## Output

Return:

- files updated
- key mismatches fixed, removed, or added
- remaining implementation issues discovered during migration
- confidence notes for stale-term and consistency sweeps
