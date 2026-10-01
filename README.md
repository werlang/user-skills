# User Skills

Reusable Codex skills for software development work.

This repository is organized as plain Markdown guidance with small reference
projects and helper scripts where a skill needs them. It does not contain a
single application, package manifest, or root-level runtime.

## Repository layout

| Path | Purpose |
| --- | --- |
| [`skills/`](skills/) | Reusable skills. Each cataloged skill is a directory with a `SKILL.md` entrypoint. |
| Skill-local `reference/` or `references/` directories | Focused checklists, templates, examples, and reference implementations used by skills. |
| Skill-local `scripts/` directories | Optional validation or workflow scripts shipped with a skill. |
| [`.github/COMMIT-v2.md`](.github/COMMIT-v2.md) | Commit-message convention for this repository. |

## Skill definitions

See the [skill definition catalog](skills/README.md) for every checked-in
`skills/*/SKILL.md` entrypoint and the purpose of each one. Each skill's
`SKILL.md` is its authoritative definition; read it before using that skill.

## Contributing changes

Keep guidance executable and aligned with the files it describes:

1. Read [`AGENTS.md`](AGENTS.md) before changing skills.
2. Keep each skill's `SKILL.md` focused on when to use it and how to work.
3. Put detailed checklists, templates, and examples in that skill's
   `reference/` or `references/` directory.
4. Update the relevant README or repository guidance when a path, workflow, or
   convention changes.
5. Use targeted file and link checks when no runtime test applies.

There is no root test command. Skill-specific scripts document their own
invocation and should be run only when the changed skill requires them.
