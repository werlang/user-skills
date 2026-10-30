# Localization map

How each kind of global skill relates to a project. Check the global catalog (`skills/README.md`) for skills added since this list; classify a new one by the same test: *does it describe how a codebase layer is built?*

## Localize: one project skill per concern the project has

| Global base | Project skill name | Localize when the project has | Project facts to capture |
| --- | --- | --- | --- |
| `api-building` (+ `security-defense-and-mitigation`) | `api-development` | An HTTP API | Entry point, router layout, auth middleware and its variants, error class and response shape, validation helper, CORS/CSRF rules, route documentation convention, rate limits |
| `entity-models` | `entity-models` | Persistence models | Base model and its methods, which models extend it, ownership filters, ids (numeric, public ids), relation helpers, transaction use |
| `mysql-helper` | `mysql-helper`, `postgres-helper`, ... (the real engine) | A database helper | The helper's public methods and their exact semantics, raw SQL rules, locking and transactions, migrations and how they run, charset or collation traps |
| `web-frontend` | `frontend-development` | Browser code | Server rendering, page entries, folder roles (components, helpers, models, templates), module loading or bundler, template variables, how the frontend reaches the API, escaping rules |
| `css-standards` | `css-standards` | **Any stylesheet** (always localize) | Where styles live, per-page or shared files, tokens and variables (or their absence), naming, breakpoints, line endings, library styles not to touch, how pages load styles |
| `testing` | `test-first-delivery` | Tests | Each runner and its exact command, folder layout, what is mocked, oracle or golden-value sources, sabotage or mutation practice, coverage gaps worth knowing |
| `documentation-maintenance` (+ `document-touched-code`) | `documentation-maintenance` | Docs or agent guides | Which files are the source of truth, generated docs and their generators, comment conventions, which docs to update for which change |
| `frontend-design`, `impeccable` | (rarely) folded into `frontend-development` or `css-standards` | A design system | The design system file or tokens; otherwise keep these global |

Merge two globals into one project skill when the project treats them as one concern; split one global into two only when the project has two distinct layers.

## Keep global (generic workflows)

`code-review`, `git-change-workflow`, `job-orchestration`, `grilling`, `skill-optimizer`, `audit-project-context`, `migrate-project-context`, `clean-code-and-oop`, `security-defense-and-mitigation` (beyond what `api-development` captures). The repository's own rules for these live in `CONTRIBUTING.md` or `AGENTS.md`; list these skills in the project index as applying unchanged.

## Never localize (tools and documents)

Browser and desktop automation, document formats (`docx`, `pdf`, `pptx`, `xlsx`, `docs`, `google-workspace`), memory and messaging, research, communication styles.

## Domain skills

Add a project skill with no global base only for rules no global covers and the code depends on (a game engine's protocol, a marketplace's staged roadmap, a deployment tunnel). Name it after the domain.
