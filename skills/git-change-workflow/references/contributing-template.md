# CONTRIBUTING.md Template

Use this when a repository has no contributing guide and the user agrees to add
one. Fill every `<placeholder>` from the repository itself: branches
(`git branch -a`), history (`git log --format=%s`, `git log --merges`), CI
triggers, and existing setup/test docs. Delete lines that do not apply rather
than leaving placeholders or guesses. Keep it short; link to existing docs
instead of copying them.

````markdown
# Contributing

<One sentence on who maintains the project and how changes reach it.>

## Setup and tests

See <README.md / TESTING.md / docs path> for local setup and test commands.
Run <the fast test command> before opening a pull request.

## Branches

- `<default branch>`: <what it represents, e.g. production; pushes deploy>.
- `<integration branch, if any>`: <e.g. integration branch; base for work>.
- Work branches start from `<base branch>` and are named `<type>/<short-slug>`,
  using the commit types below (`feat/contest-export`, `fix/login-redirect`).

## Commits

Commits follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```text
<type>(<scope>): <imperative summary, at most 72 characters>
```

- Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `style`, `build`,
  `ci`, `chore`, `revert`.
- Scope is <required | optional>. Allowed scopes:

  | Scope | Area |
  | --- | --- |
  | `<scope>` | <directory or area it covers> |

- One logical change per commit. Keep tests with the change they cover.
- Add a body when the reason is not obvious from the subject.
- Mark breaking changes with `!` and a `BREAKING CHANGE:` trailer.

Examples from this repository:

```text
<two or three real, well-formed subjects from git log>
```

## Integration

- <How work lands, e.g. merge with `git merge --no-ff` into `<base branch>`,
  or open a pull request into `<base branch>`.>
- <How releases happen, e.g. merge `<integration branch>` into `<default branch>`.>
- Do not rewrite history that others may have pulled.
````
