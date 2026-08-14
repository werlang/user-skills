# Skill definitions

Each checked-in skill directory in this folder has a `SKILL.md` entrypoint. The
entrypoint is the authoritative definition; this catalog is an index for people
choosing which skill to read.

## Browser, discovery, and tooling

| Skill | Use it for | Definition |
| --- | --- | --- |
| `agent-browser` | Browser automation CLI workflows, including web pages, Electron apps, exploratory testing, and QA. The entrypoint is a discovery stub; load the installed CLI's current workflow before running commands. | [`SKILL.md`](agent-browser/SKILL.md) |
| `context7-mcp` | Fetching current library and framework documentation or code examples through Context7. | [`SKILL.md`](context7-mcp/SKILL.md) |
| `find-skills` | Discovering and installing skills that match a user's requested capability. | [`SKILL.md`](find-skills/SKILL.md) |
| `socraticode` | Searching code structure, symbols, dependencies, impact, execution flows, and non-code context. | [`SKILL.md`](socraticode/SKILL.md) |

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
| `code-review` | Reviewing a diff against repository standards and the originating specification or request. | [`SKILL.md`](code-review/SKILL.md) |
| `frontend-bug-review-generalized` | Reviewing frontend rendering, interaction, URL/auth state, accessibility, and browser behavior. | [`SKILL.md`](frontend-bug-review-generalized/SKILL.md) |
| `git-change-workflow` | Choosing current-branch fast tracks or dedicated branches with small, focused, atomic commits for larger work. | [`SKILL.md`](git-change-workflow/SKILL.md) |
| `tdd` | Building features or fixing bugs with test-first red-green-refactor development and integration tests. | [`SKILL.md`](tdd/SKILL.md) |
| `test-first-delivery-generalized` | Choosing tests, preparing regression coverage, validating behavior changes, and documenting testing gaps. | [`SKILL.md`](test-first-delivery-generalized/SKILL.md) |
| `ui-ux-auditor` | Auditing a product journey or interface through browser-based user-flow validation. | [`SKILL.md`](ui-ux-auditor/SKILL.md) |

## Documentation and agent context

| Skill | Use it for | Definition |
| --- | --- | --- |
| `document-touched-code` | Adding focused JSDoc, docstrings, method comments, and maintainability comments to changed code. | [`SKILL.md`](document-touched-code/SKILL.md) |
| `documentation-maintenance` | Keeping documentation, agent guidance, comments, and validation instructions synchronized with implementation. | [`SKILL.md`](documentation-maintenance/SKILL.md) |
| `lesson-learned` | Inferring reusable project lessons from refactors and promoting them only through project-local guidance. | [`SKILL.md`](lesson-learned/SKILL.md) |
| `migrate-project-context` | Porting project docs, prompts, skills, and agent instructions into a different repository. | [`SKILL.md`](migrate-project-context/SKILL.md) |
| `skill-creator` | Designing and scaffolding new Codex skills. | [`SKILL.md`](skill-creator/SKILL.md) |
| `skill-optimizer` | Evolving an existing skill using evaluation results and mutation memory. | [`SKILL.md`](skill-optimizer/SKILL.md) |
| `skill-updater` | Detecting reusable workflows and updating durable docs, prompts, or skill guidance. | [`SKILL.md`](skill-updater/SKILL.md) |

## Communication and decision support

| Skill | Use it for | Definition |
| --- | --- | --- |
| `caveman` | Compressing responses into a terse, technically accurate communication style with selectable intensity levels. | [`SKILL.md`](caveman/SKILL.md) |
| `grill-me` | Running a manually invoked relentless interview to sharpen a plan or design. | [`SKILL.md`](grill-me/SKILL.md) |
| `grilling` | Stress-testing a plan, decision, or idea through a recommended-answer interview. | [`SKILL.md`](grilling/SKILL.md) |

## Product quality and security

| Skill | Use it for | Definition |
| --- | --- | --- |
| `css-standards` | Shared CSS tokens, entrypoint imports, scoped component styles, and responsive conventions. | [`SKILL.md`](css-standards/SKILL.md) |
| `frontend-design` | Creative direction, visual identity, palette and typography taste, composition, imagery, motion character, and brand voice for frontend interfaces. | [`SKILL.md`](frontend-design/SKILL.md) |
| `impeccable` | Production implementation and technical frontend quality: accessibility, responsive behavior, interaction states, performance, maintainability, and validation. | [`SKILL.md`](impeccable/SKILL.md) |
| `security-defense-and-mitigation` | Authentication, authorization, bot defense, security headers, validation, escaping, and secure defaults. | [`SKILL.md`](security-defense-and-mitigation/SKILL.md) |
| `seo-optimizer` | Auditing, diagnosing, implementing, and verifying technical, on-page, international, content, indexing, structured-data, and performance SEO work. | [`SKILL.md`](seo-optimizer/SKILL.md) |

## Developer memory

| Skill | Use it for | Definition |
| --- | --- | --- |
| `obsidian-dev-brain` | Maintaining and querying persistent developer memory, architecture records, and component history. | [`SKILL.md`](obsidian-dev-brain/SKILL.md) |

## How to use a skill

1. Choose the narrowest skill matching the request.
2. Read its complete `SKILL.md` before taking action.
3. Follow links to skill-local `reference/`, `references/`, or `scripts/`
   directories when the skill requires them.
4. Use the repository code and configuration as the source of truth when the
   skill is applied to a project.
