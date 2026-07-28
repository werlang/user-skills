# Skill definitions

Each directory in this folder is a reusable Codex skill. The `SKILL.md` file
is the authoritative definition; this catalog is an index for people choosing
which skill to read.

## API and application structure

| Skill | Use it for | Definition |
| --- | --- | --- |
| `api-building` | Reusable Node.js APIs, Express routes, middleware, authentication, and API starter structures. | [`SKILL.md`](api-building/SKILL.md) |
| `entity-models` | Class-based API entities, relations, persistence methods, and model coordination. | [`SKILL.md`](entity-models/SKILL.md) |
| `mysql-helper` | MySQL helper layers with public CRUD methods and private query execution. | [`SKILL.md`](mysql-helper/SKILL.md) |
| `web-frontend` | Server-rendered Express frontends with render middleware, page entries, components, helpers, and API-backed models. | [`SKILL.md`](web-frontend/SKILL.md) |

## Review, testing, and delivery

| Skill | Use it for | Definition |
| --- | --- | --- |
| `audit-project-context` | Auditing README files, prompts, skills, agents, and instructions against the actual codebase. | [`SKILL.md`](audit-project-context/SKILL.md) |
| `backend-bug-review-generalized` | Reviewing backend, API, worker, and data-layer logic, contracts, authorization, and state transitions. | [`SKILL.md`](backend-bug-review-generalized/SKILL.md) |
| `frontend-bug-review-generalized` | Reviewing frontend rendering, interaction, URL/auth state, accessibility, and browser behavior. | [`SKILL.md`](frontend-bug-review-generalized/SKILL.md) |
| `git-change-workflow` | Choosing current-branch fast tracks or dedicated branches with small, focused, atomic commits for larger work. | [`SKILL.md`](git-change-workflow/SKILL.md) |
| `test-first-delivery-generalized` | Choosing tests, preparing regression coverage, validating behavior changes, and documenting testing gaps. | [`SKILL.md`](test-first-delivery-generalized/SKILL.md) |
| `ui-ux-auditor` | Auditing a product journey or interface through browser-based user-flow validation. | [`SKILL.md`](ui-ux-auditor/SKILL.md) |

## Documentation and agent context

| Skill | Use it for | Definition |
| --- | --- | --- |
| `document-touched-code` | Adding focused JSDoc, docstrings, method comments, and maintainability comments to changed code. | [`SKILL.md`](document-touched-code/SKILL.md) |
| `documentation-maintenance` | Keeping documentation, agent guidance, comments, and validation instructions synchronized with implementation. | [`SKILL.md`](documentation-maintenance/SKILL.md) |
| `migrate-project-context` | Porting project docs, prompts, skills, and agent instructions into a different repository. | [`SKILL.md`](migrate-project-context/SKILL.md) |
| `skill-creator` | Designing and scaffolding new Codex skills. | [`SKILL.md`](skill-creator/SKILL.md) |
| `skill-optimizer` | Evolving an existing skill using evaluation results and mutation memory. | [`SKILL.md`](skill-optimizer/SKILL.md) |
| `skill-updater` | Detecting reusable workflows and updating durable docs, prompts, or skill guidance. | [`SKILL.md`](skill-updater/SKILL.md) |
| `socraticode` | Searching code structure, symbols, dependencies, impact, and non-code context. | [`SKILL.md`](socraticode/SKILL.md) |

## Product quality and security

| Skill | Use it for | Definition |
| --- | --- | --- |
| `css-standards` | Shared CSS tokens, entrypoint imports, scoped component styles, and responsive conventions. | [`SKILL.md`](css-standards/SKILL.md) |
| `frontend-design` | Creative direction, visual identity, palette and typography taste, composition, imagery, motion character, and brand voice for frontend interfaces. | [`SKILL.md`](frontend-design/SKILL.md) |
| `impeccable` | Production implementation and technical frontend quality: accessibility, responsive behavior, interaction states, performance, maintainability, and validation. | [`SKILL.md`](impeccable/SKILL.md) |
| `security-defense-and-mitigation` | Authentication, authorization, bot defense, security headers, validation, escaping, and secure defaults. | [`SKILL.md`](security-defense-and-mitigation/SKILL.md) |
| `seo-optimizer` | Auditing and implementing technical SEO, metadata, structured data, and indexing improvements. | [`SKILL.md`](seo-optimizer/SKILL.md) |

## Developer memory

| Skill | Use it for | Definition |
| --- | --- | --- |
| `obsidian-dev-brain` | Maintaining and querying persistent developer memory, architecture records, and component history. | [`SKILL.md`](obsidian-dev-brain/SKILL.md) |

## How to use a skill

1. Choose the narrowest skill matching the request.
2. Read its complete `SKILL.md` before taking action.
3. Follow links to `references/` or `scripts/` when the skill requires them.
4. Use the repository code and configuration as the source of truth when the
   skill is applied to a project.
