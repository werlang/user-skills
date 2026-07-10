# Migration Scope Checklist

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
- other root or feature markdown files that describe behavior, architecture, commands, or workflows

## Destination-Reality Checks

Verify against code and config:

- runtime/frameworks
- entry points and services
- routes and public interfaces
- entities/models and naming
- env vars and config files
- scripts and dev/build/test commands
- data stores, queues, caches, and external integrations
- deploy/runtime assumptions, ports, and compose files

## Typical Migration Problems

- copied project names and domain nouns
- stale routes, models, and env vars
- skills that describe workflows this repo does not have
- prompts that mention folders or agents that are missing
- docs that claim tooling, tests, CI, or guardrails that are not implemented
