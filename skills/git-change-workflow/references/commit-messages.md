# Commit Messages

Default commit-message contract, based on
[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
and the widely cited [seven rules](https://cbea.ms/git-commit/). A repository's
own rules (usually in `CONTRIBUTING.md`) override anything here.

## Format

```text
<type>[(<scope>)][!]: <summary>

[body: why the change was made]

[trailers]
```

## Subject line

- Imperative mood, as if completing "If applied, this commit will ...":
  `add`, `fix`, `remove`, not `added` or `adds`.
- Lowercase `type` and `scope`; start the summary lowercase; no trailing period.
- Aim for about 50 characters; never exceed 72.
- Describe the outcome, not the files touched or the steps taken. The diff
  already shows how.
- No emojis, ticket noise, or vague summaries such as `update code` or `fixes`.

## Type

Choose the type from the primary purpose of the commit, not from every file it
touches.

| Type | Use for |
| --- | --- |
| `feat` | New user- or developer-facing capability. |
| `fix` | Correcting broken behavior, output, state, validation, or security. |
| `refactor` | Restructuring code without changing observable behavior, including renames. |
| `perf` | Behavior-preserving performance improvement. |
| `test` | Adding or correcting tests, fixtures, or test helpers only. |
| `docs` | Documentation, comments meant as docs, agent guidance, or examples only. |
| `style` | Formatting or whitespace only; no code meaning changes. |
| `build` | Build system, dependencies, packaging, or container images. |
| `ci` | CI pipelines and automation configuration. |
| `chore` | Other maintenance that fits none of the above. |
| `revert` | Reverting an earlier commit; reference its hash in the body. |

Tie-breakers:

- Tests that belong to a feature or fix ride with it; the type stays `feat` or
  `fix`.
- A restructure made in order to fix a bug is a `fix`.
- If no single purpose fits, the staged changes are not atomic: split them
  instead of picking a compromise type.

## Scope

- Optional by default. Use a short noun naming the stable area changed:
  `api`, `web`, `db`, `auth`, `deps`.
- Prefer the repository's established scopes (its contributing guide, or
  `git log --format=%s` history) over inventing a new one.
- Pick the area that explains the reason for the commit, not every directory
  touched. Omit the scope rather than invent a vague one, unless the repository
  requires scopes.

## Breaking changes

Mark changes that break a public contract (API response, CLI flag, config key,
schema) with `!` before the colon, and explain the migration in a
`BREAKING CHANGE:` trailer:

```text
feat(api)!: return problem tags as objects

BREAKING CHANGE: `tags` is now `[{ id, name }]` instead of `string[]`.
```

## Body

- Optional. Add one when the reason, trade-off, or side effect is not obvious
  from the subject. Skip it for self-explanatory changes.
- Separate it from the subject with one blank line; wrap at 72 characters.
- Explain why and what changed in behavior, not a file-by-file inventory.

## Trailers

Put trailers last, after one blank line, in `Token: value` form, for example
`Refs: #123`, `BREAKING CHANGE: ...`, or `Co-Authored-By: ...`. Always keep
attribution trailers that the user or the agent harness requires.

## Examples

```text
feat(api): add date range filter to contest search
fix(web): keep a leading blank line in sample values
refactor(judge): extract the sandbox runner from the queue worker
docs: describe the local docker setup
build(deps): bump express to 5.1.0
revert: undo "feat(web): lazy-load the editor"

fix(auth): reject reset tokens after a password change

Tokens issued before the change stayed valid until expiry, so a leaked
link could still reset the new password.
```
