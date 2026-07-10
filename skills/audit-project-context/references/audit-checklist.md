# Audit Checklist

Audit and update these when present:

## Core Context Files

- `.github/copilot-instructions.md`
- `AGENTS.md`
- `CLAUDE.md`
- `README.md`

## Agent Customization Files

- `.github/prompts/*.prompt.md`
- `.github/instructions/*.instructions.md`
- `.github/agents/*.agent.md`
- `.github/skills/*/SKILL.md`
- `.github/skills/*/references/*.md`
- `.agents/**`
- `.claude/**`

## Broader Markdown

- `docs/**/*.md`
- `tasks/**/*.md`
- other markdown files that describe behavior, commands, architecture, or workflows

## Accuracy Checks

Verify:

- routes, APIs, commands, and scripts
- entities/models and naming
- env vars and config locations
- ports, services, and deployment assumptions
- claimed tests, CI, tooling, and automation
- links to files, folders, prompts, agents, and skills

## Red Flags

- stale project/domain terminology
- copied examples from another repository
- aspirational security/testing/process claims
- prompts or agents that reference paths or tools that do not exist
- skill descriptions that no longer match the codebase
