# Skill definitions

Each checked-in skill directory in this folder has a `SKILL.md` entrypoint. The
entrypoint is the authoritative definition; this catalog is an index for people
choosing which skill to read.

## Browser, discovery, and tooling

| Skill | Use it for | Definition |
| --- | --- | --- |
| `agent-browser` | Browser automation CLI workflows, including web pages, Electron apps, exploratory testing, and QA. The entrypoint is a discovery stub; load the installed CLI's current workflow before running commands. | [`SKILL.md`](agent-browser/SKILL.md) |
| `computer-use` | Inspecting and operating local desktop app windows via Orca computer-use CLI (accessibility trees, screenshots, UI actions). | [`SKILL.md`](computer-use/SKILL.md) |
| `context7-mcp` | Fetching current library and framework documentation or code examples through Context7. | [`SKILL.md`](context7-mcp/SKILL.md) |
| `find-skills` | Discovering and installing skills that match a user's requested capability. | [`SKILL.md`](find-skills/SKILL.md) |
| `orca-cli` | Operating Orca-managed worktrees, terminals, repos, automations, artifacts, and the embedded browser via the public `orca` CLI. | [`SKILL.md`](orca-cli/SKILL.md) |
| `orchestration` | Structured multi-agent coordination via Orca orchestration (threads, task DAGs, coordinator loops, decision gates). | [`SKILL.md`](orchestration/SKILL.md) |
| `socraticode` | Searching code structure, symbols, dependencies, impact, execution flows, and non-code context. | [`SKILL.md`](socraticode/SKILL.md) |

## API and application structure

| Skill | Use it for | Definition |
| --- | --- | --- |
| `api-building` | Reusable Node.js APIs, Express routes, middleware, authentication, and API starter structures. Automatically enforces security defense (auth, IDOR, input validation DTOs, rate limiting, security headers) and clean code standards. | [`SKILL.md`](api-building/SKILL.md) |
| `entity-models` | Class-based API entities, relations, persistence methods, and model coordination. Enforces mass assignment defense and IDOR ownership scoping. | [`SKILL.md`](entity-models/SKILL.md) |
| `mysql-helper` | MySQL helper layers with public CRUD methods and private query execution. Enforces strict SQL injection defense via parameterized queries and identifier whitelisting. | [`SKILL.md`](mysql-helper/SKILL.md) |
| `web-frontend` | Server-rendered Express frontends with render middleware, page entries, components, helpers, and API-backed models. Automatically triggers frontend-design, impeccable, and css-standards for UI pages, and security-defense-and-mitigation for headers, cookies, and CSRF. | [`SKILL.md`](web-frontend/SKILL.md) |

## Review, testing, and delivery

| Skill | Use it for | Definition |
| --- | --- | --- |
| `audit-project-context` | Auditing README files, prompts, skills, agents, and instructions against the actual codebase. | [`SKILL.md`](audit-project-context/SKILL.md) |
| `code-review` | Risk-calibrated review of a diff (Trunk vs Leaf) on standards, spec, evidence, and launch-readiness, with independent red-team discovery, gated cross-examination plus adjudication, auto-fix with regression tests, and closed-loop re-review until clean. | [`SKILL.md`](code-review/SKILL.md) |
| `git-change-workflow` | Choosing current-branch fast tracks or dedicated branches with small, focused, atomic commits for larger work. | [`SKILL.md`](git-change-workflow/SKILL.md) |
| `job-orchestration` | End-to-end delegated jobs with exploration, user grilling, worktree isolation, clean code and OOP standards, independent TDD, adversarial code reviews, synchronized documentation, and atomic semantic commits. | [`SKILL.md`](job-orchestration/SKILL.md) |
| `testing` | Behavior testing for any code change — tiered Trunk/Branch/Leaf effort, human-anchored oracles, falsification triad, freeze guard, and mutation/sabotage verification. | [`SKILL.md`](testing/SKILL.md) |
| `ui-ux-auditor` | Auditing a product journey or interface through browser-based user-flow validation. Pairs with frontend-design and impeccable for visual craft and aesthetic review alongside functional testing. | [`SKILL.md`](ui-ux-auditor/SKILL.md) |

## Documentation and agent context

| Skill | Use it for | Definition |
| --- | --- | --- |
| `clean-code-and-oop` | Writing Clean Code, OOP architectures, SOLID principles, and safe refactoring. | [`SKILL.md`](clean-code-and-oop/SKILL.md) |
| `document-touched-code` | Adding focused JSDoc, docstrings, method comments, and maintainability comments to changed code. | [`SKILL.md`](document-touched-code/SKILL.md) |
| `documentation-maintenance` | Keeping documentation, agent guidance, comments, and validation instructions synchronized with implementation. | [`SKILL.md`](documentation-maintenance/SKILL.md) |
| `migrate-project-context` | Porting project docs, prompts, skills, and agent instructions into a different repository. | [`SKILL.md`](migrate-project-context/SKILL.md) |
| `skill-creator` | Designing and scaffolding new Codex skills. | [`SKILL.md`](skill-creator/SKILL.md) |
| `skill-optimizer` | Iteratively improving, updating, and hardening skills using multi-round adversarial review loops. | [`SKILL.md`](skill-optimizer/SKILL.md) |


## Communication and decision support

| Skill | Use it for | Definition |
| --- | --- | --- |
| `caveman` | Compressing responses into a terse, technically accurate communication style with selectable intensity levels. | [`SKILL.md`](caveman/SKILL.md) |
| `grill-me` | Running a manually invoked relentless interview to sharpen a plan or design. | [`SKILL.md`](grill-me/SKILL.md) |
| `grilling` | Stress-testing a plan, decision, or idea through a recommended-answer interview. | [`SKILL.md`](grilling/SKILL.md) |
| `use-spark` | Accessing Spark email, calendar, contacts, and team data via the `spark` CLI. | [`SKILL.md`](use-spark/SKILL.md) |

## Product quality and security

| Skill | Use it for | Definition |
| --- | --- | --- |
| `css-standards` | Shared CSS tokens, entrypoint imports, scoped component styles, and responsive conventions. Pairs with frontend-design and impeccable for visual identity and craft. | [`SKILL.md`](css-standards/SKILL.md) |
| `frontend-design` | Distinctive visual design, typography, custom palettes, and anti-template aesthetics. Automatically triggers and pairs with impeccable, css-standards, and ui-ux-auditor. | [`SKILL.md`](frontend-design/SKILL.md) |
| `impeccable` | Production implementation and technical frontend quality across visual hierarchy, craft, responsive behavior, and accessibility. Automatically pairs with frontend-design, css-standards, and ui-ux-auditor. | [`SKILL.md`](impeccable/SKILL.md) |
| `security-defense-and-mitigation` | Authentication, authorization, bot defense, security headers, validation, escaping, and secure defaults. Automatically activates for backend APIs, entity models, database helpers, and web frontend routes. | [`SKILL.md`](security-defense-and-mitigation/SKILL.md) |
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
