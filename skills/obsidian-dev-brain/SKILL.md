---
name: obsidian-dev-brain
description: Maintain and query the developer's persistent Obsidian vault memory, component registry, architecture decision records (ADRs), and dev changelog graph. Automatically invoke whenever creating or modifying relevant code (features, fixes, refactors, shared components), making architectural decisions, capturing technical brainstorming, or when the user references past work or component versions across projects.
---

# Obsidian Dev Brain & Memory Graph Protocol

Use this skill as the persistent memory, changelog recorder, component registry, and architectural knowledge graph for all user projects.

**Vault Base Directory Path**:
`/Users/pablowerlang/Library/CloudStorage/GoogleDrive-pablowerlang@acad.charqueadas.ifsul.edu.br/My Drive/obsidian/dev-changelog`

The in-vault copy of this protocol lives at `00 - Inbox/Vault Protocol Guide.md`. If this skill's rules change, update that note in the same pass.

---

## 💡 Core Philosophy

1. **Persistent Memory Across Sessions & Projects**: Every time code is modified, designed, or refactored, the context, reasoning, code locations, component versions, and decisions MUST be recorded in the Obsidian vault.
2. **Graph Traversal Over Keyword Search**: All notes MUST use **inline `[[Wikilinks]]`** to connect projects, components, architecture decision records (ADRs), and changelogs.
3. **Check Before You Build**: Before creating or modifying relevant code (e.g., UI components, auth modules, DB layers, drivers, helpers, wrappers), search the vault to inspect previous implementations across other projects and find the most up-to-date baseline.
4. **Git for the Dev Brain**: Record changes the way git records commits — atomic, typed, dated, and curated. A changelog entry documents *intent and reasoning*, not raw file noise. Group related file edits under one typed change bullet (like a commit); never produce a file-by-file dump.
5. **Proportional Logging**: Logging cost scales with change size. Small change → one line. Big change → full ceremony. Overhead must never become a reason to skip logging entirely.

---

## 🎯 Relevance Threshold (What Gets Logged)

| Signal | Vault Action |
| :--- | :--- |
| Feature, bug fix, refactor, dependency/config/architecture change | Full session changelog entry |
| Reusable component created/modified (cross-project candidate: `Toast`, `Modal`, `Button`, `Input`, `Form`, `Select`, `mysql`, `redis`, `mongo`, `local-data`, `request`, `session`, `AuthMiddleware`, `GoogleClient`, `JWTToken`) | Changelog + Component Registry update |
| Decision with real trade-offs (alternatives weighed, convention set, pattern adopted) | Changelog + ADR |
| Undecided thinking, spikes, open questions, brainstorming | Quick note in `00 - Inbox/`, linked from the changelog |
| Trivial edits (typos, formatting, comment-only, whitespace) | One-line bullet in the day's changelog; nothing else |
| Reading/exploring code without changes | No log (unless it produced a decision → ADR) |

Rules:
- **Component notes are for reusable things.** One-off, page-specific code does not get a component note.
- **ADRs are for decisions, not tasks.** If no alternative was considered, it is a changelog bullet, not an ADR.
- **When in doubt: less ceremony, never less truth.** Always write the changelog entry; the other artifacts are optional per the table.

### Component Categories (what counts as a "reusable component")

The following categories of code are tracked in the Component Registry when they are reusable across projects or pages:

| Category | What it covers | Examples from the codebase |
| :--- | :--- | :--- |
| **Web Components** | Custom elements, UI component classes (ES6 classes extending `HTMLElement` or a base component class) | `Toast`, `Modal`, `Button`, `Input`, `Form`, `Select`, `Card`, `Tooltip`, `Gallery`, `Tabs`, `Pagination`, `Menu`, `Tag`, `Timeline`, `PictureUploader`, `FloatingAction`, `EmptyState`, `Notification`, `ActionRing`, `EntitySelector`, `ProfessorMultiselect`, `ProposalReview`, `ConflictStatusButton`, `FloatingTimetable`, `GridCell`, `HeroButton`, `AuthTabs`, `EventCard`, `EventList`, `FilterForm`, `LinkedText`, `QuickChips`, `BookSelect`, `ProfessorSearch`, `ReportBook`, `SemesterSelect`, `BlocksAnim`, `EndpointTable`, `GasTimer`, `UrlBox` |
| **Drivers** | Low-level adapters for external services, databases, and protocols | `mysql`, `redis`, `mongo`, `mongodb`, `gstorage` (Google Storage), `sw3` (Web3), `telegram`, `wsclient` (WebSocket client), `wsserver` (WebSocket server), `oracle`, `ethers`, `web3`, `gstorage`, `mongodb`, `mongodb` |
| **Helpers** | Utility functions, service wrappers, and non-endpoint logic modules | `error`, `response`, `request`, `session`, `cookies`, `template-var`, `translate`, `local-data`, `utils`, `dynamic-script`, `html-loader`, `loading-status-notifier`, `toast-bus`, `conflict-check-request`, `api`, `event`, `query-state`, `week-range`, `document-builder`, `scraper`, `queue`, `router`, `mailer`, `network`, `recaptcha`, `timer`, `tokenPrice`, `ttl-cache`, `version`, `charts`, `donate`, `gas-list`, `price`, `prism`, `promise`, `sse`, `theme`, `explorer`, `history-schedule`, `retention-cleanup`, `auth`, `orders`, `secure-key`, `stream`, `users`, `api-client`, `state`, `wsclient`, `google-login`, `events`, `format`, `render`, `admin`, `errors`, `format` |
| **Wrappers** | Thin abstraction layers over third-party libraries or complex APIs | `AuthMiddleware` (auth wrapper), `GoogleClient` (Google API wrapper), `JWTToken` (JWT wrapper), `Fetch`/`FetchResponse` (fetch API wrapper), `MjmlCompiler` (MJML wrapper), `QrCodeGen` (QR code wrapper), `Thumb` (image thumbnail wrapper), `Upload` (file upload wrapper), `Pager` (pagination wrapper), `Seo` (SEO wrapper), `FriendlyHash` (hashing wrapper), `RateLimiter` (rate limiting wrapper), `Email` (email wrapper), `Minify` (minification wrapper), `sw3` (Web3 wrapper), `ethers` (Ethers.js wrapper), `web3` (Web3.js wrapper), `telegram` (Telegram Bot API wrapper), `gstorage` (Google Cloud Storage wrapper), `mongodb` (MongoDB wrapper), `mongo` (MongoDB core wrapper), `redis` (Redis wrapper), `oracle` (Oracle DB wrapper) |

**Cross-project candidates**: Any component in the table above that exists in 2+ projects is a cross-project candidate. Before creating a new one, check the vault for an existing baseline. The ⭐️ marker in the Cross-Project Matrix indicates the newest/best version.

---

## 🔍 Workflow Step 1: Querying Vault Context (BEFORE Code Changes)

Concrete query recipe (fast, in order):

1. **Project hub**: Read `01 - Projects/Project - <Name>.md` — stack, conventions, governing ADRs, recent changelogs.
2. **Component registry**: Glob/grep `02 - Components/` for `Component - <Name>.md`, or grep the vault for the tag `component/<slug>`. Read the **Cross-Project Matrix**: which project holds the ⭐️ baseline (newest/best version), and its interface/props. Search by category tags (`#cat/web-component`, `#cat/driver`, `#cat/helper`, `#cat/wrapper`) to find existing implementations of the same type.
3. **ADRs**: Grep `03 - Architecture & ADRs/` for decisions on the topic. `accepted` supersedes `proposed`; check for `deprecated` before reusing an old pattern.
4. **Recent history**: Skim the project's last 2–3 notes in `04 - Dev Changelogs/` for in-flight context.
5. **Apply & cite**: Use the retrieved knowledge in the implementation, and cite the baseline you built upon in the new changelog.

If the vault has no record of a component: say so in the changelog and mark the new implementation as the initial ⭐️ baseline.

---

## 📝 Workflow Step 2: Recording Vault Knowledge (AFTER Code Changes)

### Change-Type Taxonomy (mandatory in every changelog)

Group edits under typed bullets (Keep a Changelog + Conventional Commits semantics):

- **Added** — new features, files, capabilities
- **Changed** — modified existing behavior
- **Fixed** — bug fixes
- **Removed** — deleted code/features
- **Deprecated** — soon-to-be-removed functionality
- **Decided** — decision made → link the `[[ADR-<num> - <Title>]]`

### Recording Rules

- **Append-only history**: If today's changelog for the project exists, add a new `## Session — HH:MM` section at the bottom. Never rewrite prior sessions — they are immutable history, like git commits.
- **Dates are real**: Always use the actual current date/time from your environment (`YYYY-MM-DD`). Never guess, never copy template dates.
- **File links**: `[Toast.tsx](file:///absolute/path/Toast.tsx)` — URL-encode spaces as `%20` (the vault path itself contains spaces).
- **Bidirectional links in the same pass**: The changelog links to project/component/ADR notes, AND the project MOC + component note get a back-link to the changelog in the same edit.
- **Inbox flow**: Undecided thinking goes to `00 - Inbox/Inbox - YYYY-MM-DD - <topic>.md`. When the decision is later made, write the ADR and link it back to the inbox note.
- **Dataview auto-indexing**: The `Master Dev Index.md` and all 4 `README` indices use Dataview queries to auto-populate. After creating any entity note, verify Dataview discovers it — never manually edit the index files' link lists. If a note doesn't appear, check its frontmatter tags and folder location.

### Artifact 1: Dev Session Changelog (`04 - Dev Changelogs/`)
Read `Template - Changelog.md` from `05 - Index & MOCs/Templates/`, copy its structure, and fill in real dates and names. One file per project per day; multiple sessions append as new `## Session — HH:MM` sections.

### Artifact 2: Component Registry (`02 - Components/`)
If a reusable component (e.g., `Toast`, `Modal`, `DataGrid`, `AuthMiddleware`, `mysql`, `redis`, `local-data`) was created or modified:
- Read `Template - Component.md` from the templates folder, copy its structure, and fill in values.
- Update the **Cross-Project Matrix**: every project, version, tech stack, location, and the ⭐️ baseline marker.
- Record interface/props changes and bump the version per the SemVer rule below.
- Assign the correct **category tag** (see Metadata & Tag Taxonomy): `#cat/web-component`, `#cat/driver`, `#cat/helper`, or `#cat/wrapper`.

**Component Versioning (SemVer):**
- **MAJOR**: breaking interface/props change (consumers must update call sites)
- **MINOR**: backward-compatible new capability
- **PATCH**: bug fix or internal change; interface untouched
- New stable components start at `1.0.0`; experimental/unstable at `0.x.y`
- Record the bump reason in the component note's Dev History section

### Artifact 3: Architecture Decision Records (`03 - Architecture & ADRs/`)
If a significant technical choice was made (state library, ORM change, styling rules, cross-project convention):
- Read `Template - ADR.md` from the templates folder, copy its structure, and fill in values. Number sequentially after the highest existing ADR.
- Document: **Status** (Accepted/Proposed/Deprecated), **Context**, **Decision**, **Consequences**, **Rejected Alternatives**.
- Link the ADR to affected `[[Project - <Name>]]` and `[[Component - <Name>]]` notes.

### Artifact 4: Project Hub MOC (`01 - Projects/`)
- Read `Template - Project.md` from the templates folder, copy its structure, and fill in values.
- Add back-links to the new changelog, registered components, and applicable ADRs.

### Artifact 5: Index Verification
Dataview auto-populates all index tables (`Master Dev Index.md` and the 4 `README` indices in each folder). After creating a new entity note, reload the index to verify Dataview discovers it — no manual index editing needed.

---

## 📐 Note Templates (in Vault)

Template files live at `05 - Index & MOCs/Templates/` and serve as the single source of truth for note structure — both for Templater (when creating notes manually in Obsidian) and for agents (to read and fill in programmatically):

| Template File | Creates |
| :--- | :--- |
| `Template - Project.md` | `01 - Projects/Project - <Name>.md` |
| `Template - Component.md` | `02 - Components/Component - <Name>.md` |
| `Template - ADR.md` | `03 - Architecture & ADRs/ADR-<num> - <Title>.md` |
| `Template - Changelog.md` | `04 - Dev Changelogs/Changelog - YYYY-MM-DD - <Project>.md` |

When creating a note: read the corresponding template file from the vault, copy its structure, and fill in the values using today's real date and the entity name. Do not guess at formats — read the template.

The templates above are the canonical format. Any deviation must be reflected in the template files first, then in this skill.

---

## ⚠️ Vault Unreachable (Fail-Open)

The vault lives on cloud storage and may be unmounted. If the vault path is not readable:
1. Continue the coding task normally — never block code work on the vault.
2. Keep track of what *would* be logged during the session.
3. Retry the vault write once at the end of the task.
4. If still unreachable, explicitly tell the user: **"Vault update skipped — vault unreachable"**, and summarize what should be logged so it can be added later.

---

## 🏷️ Metadata & Tag Taxonomy

Always include tags adhering to this naming strategy:
- **Entity Type**: `#type/project`, `#type/component`, `#type/adr`, `#type/changelog`
- **Project**: `#project/<project-slug>` (e.g., `#project/toast-system`)
- **Component**: `#component/<component-slug>` (e.g., `#component/toast`)
- **Component Category**: `#cat/web-component`, `#cat/driver`, `#cat/helper`, `#cat/wrapper`
- **ADR Status**: `#adr/accepted`, `#adr/proposed`, `#adr/deprecated`

Slugs are lowercase, hyphenated (e.g., `Acme Dashboard` → `#project/acme-dashboard`).

---

## ✅ Execution Checklist for Agents

Before completing any coding turn:
1. [ ] Did I query the vault before writing code (project hub → component registry → ADRs → recent changelogs)?
2. [ ] Did I use the real current date/time everywhere (frontmatter, filenames, session headers)?
3. [ ] Did I read the template file from `05 - Index & MOCs/Templates/` before creating any vault note?
4. [ ] Did I create/append the session changelog with typed change bullets (Added/Changed/Fixed/Removed/Deprecated/Decided)?
5. [ ] Reusable component touched (web component, driver, helper, or wrapper) → registry updated, version bumped per SemVer, ⭐️ baseline marker moved if the newest version changed projects?
6. [ ] Decision with real alternatives → ADR created with rejected alternatives documented?
7. [ ] Back-links added in the same pass (project MOC + component note → changelog)?
8. [ ] All `[[Wikilinks]]` valid, YAML frontmatter complete, spaces in `file://` links encoded as `%20`?
9. [ ] Did Dataview auto-discover the new note in the index tables (no manual index editing)?
10. [ ] Vault unreachable → did I retry at the end and explicitly disclose the skip to the user?
