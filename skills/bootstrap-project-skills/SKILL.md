---
name: bootstrap-project-skills
description: "Bootstrap, localize, refresh, or audit a repository's own project skills from the user's global skills. Use when the user asks to bootstrap skills on a project, create project-local skills from global ones, localize or adapt global skills to a codebase, or bring an existing .agents/skills set back in line with the code or with changed global skills. Picks the global skills relevant to the project's real stack, rewrites each as a short project skill that names its global base and keeps only verified project facts, paths, commands and deliberate deviations, then indexes and verifies them."
argument-hint: "Project root (defaults to the current repository); optionally a reference project already bootstrapped, or the skills to include or skip"
user-invocable: true
---

# Bootstrap Project Skills

Turn the user's global skills into a project's own skills. The two layers stay distinct:

- **Global skill** (`~/.claude/skills/<name>`): the method, project-agnostic. It never names a project.
- **Project skill** (`<repo>/.agents/skills/<name>`): the same concern localized to one codebase. It names its global base, then states only what is true here: paths, the real API of local helpers, commands that run, conventions the code follows, and where the project deliberately departs from the global method. It does not copy the global body.

An agent working in the project loads both: the global skill for *how*, the project skill for *what, where and which exceptions*. On a conflict about project facts, the project skill wins; the user's instructions and the repository's `AGENTS.md`/`CONTRIBUTING.md` win over both.

## Workflow

1. **Read the ground rules.** The repository's `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `README.md`, and any existing `.agents/skills`, `.claude/skills` or `.github` customization. Existing project skills are inputs to refresh, not to overwrite blindly. If the user names a reference project that already has project skills, read its index and two of its skills for format and naming.
2. **Inventory the global skills.** List the global skills directory and its catalog (`README.md`). Classify each with [the localization map](references/localization-map.md): *localize* (encodes a codebase layer: API, models, database helper, frontend, CSS, tests, docs), *keep global* (generic workflow such as code review or git), or *never* (tools and documents).
3. **Inventory the project's documentation.** Read every doc beyond the root guides: `docs/**` (design system, architecture, decision records, generated references such as API or asset catalogues), package and folder READMEs (`*/README*`), deploy and runbook guides, `.env.example` comments, and the doc comments at the top of key modules. Collect from them what code alone does not show: intended conventions, design tokens and visual rules, domain vocabulary, the reasons behind deviations, which file owns which topic, and which docs are generated (and by what command). Treat every doc claim as a lead to verify in step 4, never as a fact.
4. **Inventory the code.** Map runtime and stack, folder layout, entry points, the database and its helper, the frontend build (or lack of one), styles, test runners, lint, how commands run (containers, task runners), deploy. Check each doc claim from step 3 against it: a confirmed claim can go into a project skill (citing the doc that owns it); a claim the code contradicts is a finding for the report, and the project skill states what the code does. Reuse the inventory step of `migrate-project-context` when it applies.
5. **Select.** For each *localize* candidate, check whether the project has that layer and name the project skill after what the project does (map in the reference: `api-building` → `api-development`, `web-frontend` → `frontend-development`, `testing` → `test-first-delivery`, the database helper after the real engine). Merge globals that cover one project concern into one project skill. **A project with stylesheets always gets its own `css-standards`:** every project's tokens, file layout and conventions differ. Add a domain skill only when the project has rules no global covers. Show the selection as a table (project skill, global bases, why) and get the user's confirmation, unless the request already fixed the set.
6. **Write each project skill** from [the template](references/project-skill-template.md):
   - frontmatter `name` equal to the folder, and a `description` with project-specific triggers (paths, layers);
   - a first line naming the global base skills;
   - only verified facts: every path, export, command, env var and error code in it must exist now;
   - a **Deviations** section for each place the project departs from the global method on purpose, with the reason (for example: no bundler, MySQL instead of Postgres, numeric ids kept). Never contradict the global skill silently;
   - short and scannable (most project skills run 15 to 80 lines). Link to `AGENTS.md`, `CONTRIBUTING.md` or docs instead of repeating them.
7. **Index and wire.** Write or update `.agents/skills/README.md` (project skills, which global skills they localize, and which global skills apply unchanged). Make the repository's agent guide (`AGENTS.md` or equivalent) point to the index in one line.
8. **Verify** with `audit-project-context` thinking: every path exists (`ls`/`git ls-files`), every command runs, every named export or route is real (grep), and no source residue remains from the global skills (grep each project skill for the global's generic examples that are false here, such as `src/js/`, webpack, `public_id`, `PATCH`, another database engine). Fix or delete each false claim; code wins over docs.
9. **Deliver.** Follow `git-change-workflow`: one commit per project skill, then the index and wiring; or leave the work uncommitted when the user or repository asks. Report with [the output template](references/output-template.md).

## Refreshing an existing set

When project skills already exist (asked to refresh, or global skills changed):

- Diff each project skill against the code: stale paths, removed helpers, renamed commands, new conventions.
- Re-read the docs changed since the skills were written (`git log` on `docs/`, READMEs, guides): new design rules, decisions or owners may belong in a project skill, once verified in code.
- Diff against its global base: if the global method changed, check the project skill still layers on it and its deviations still apply.
- Add skills for layers the project gained; delete skills for layers it lost.
- A lesson that is true for every project belongs in the global skill (propose it, use `skill-optimizer`); a lesson true only here belongs in the project skill.

## Rules

- Never copy a global skill's body into a project skill; reference it by name.
- Never put a project's facts into a global skill.
- Never invent conventions: write what the code does, and mark wanted-but-absent rules as such only when the user asks for them.
- Keep project skills in the repository (versioned with the code they describe), under `.agents/skills/` unless the repository already uses another location.
- Respect repository rules for how commands run (for example, containers only); every command in a project skill must follow them.
