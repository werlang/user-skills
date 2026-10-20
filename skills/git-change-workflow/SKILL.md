---
name: git-change-workflow
description: "Choose and apply a Git branching, worktree, and commit workflow for implementation, refactor, bug-fix, documentation, and configuration work. Use this skill whenever a task may need a branch, worktree, commits, commit messages, staging, merging, or delivery-policy decisions: keep simple fast work on the current branch with no Git mutations, put complex or large work on a new branch (or an isolated worktree when needed) with small, focused, atomic Conventional Commits, and follow the repository's CONTRIBUTING.md, offering to create one when it is missing."
---

# Git Change Workflow

## Read the repository's rules first

Before choosing a branch name, base branch, commit scope, or integration method,
look for the repository's own contract, in this order:

1. `CONTRIBUTING.md` (root, `.github/`, or `docs/`).
2. Commit or branch rules referenced from `AGENTS.md`, `CLAUDE.md`, or the README.
3. Enforced config such as `commitlint.config.*` or a `commit-msg` hook.

Repository rules override every default in this skill. When rules conflict with
the user's explicit instructions for the current task, follow the user.

If the repository has no contributing guide and the task is planned-track work,
offer once to add one. On a yes, build it from
[`references/contributing-template.md`](references/contributing-template.md),
filled from the repository's real branches, history, and CI, and commit it on
its own as `docs: add contributing guide`. On a no, use this skill's defaults
and do not ask again in the same session.

## Choose the delivery tier

Classify the request before editing. Prefer the fast track only when the scope is clearly small and localized.

| Tier | Typical scope | Git policy |
| --- | --- | --- |
| Fast track | Typo, one-file copy or comment edit, one isolated constant/style change, or a similarly local fix | Stay on the current branch. Do not create a branch, stage files, commit, stash, reset, rebase, or push. |
| Planned track | New features, multi-file fixes, refactors, API/schema changes, broad documentation or configuration changes, cross-cutting tests, or ambiguous/risky work | Create a dedicated branch (or worktree) before editing and commit verified work atomically. |

If the scope is uncertain, treat it as planned work. The extra branch is cheaper than mixing a broad change into the user’s current branch.

## Fast-track workflow

1. Work directly on the current branch.
2. Make the smallest change that satisfies the request.
3. Run the narrowest useful validation when one exists.
4. Leave the result unstaged and uncommitted for the user to inspect and commit.

Avoid Git commands on this path. Use a read-only status check only when needed to avoid overwriting unrelated user changes.

## Planned-track workflow

1. Before editing, inspect the repository with read-only commands such as `git status --short`, `git branch --show-current`, and `git log -1 --oneline`.
2. Preserve pre-existing user changes. Never use `git reset --hard`, `git clean`, broad stashing, or history rewriting to make the worktree convenient. If existing changes overlap the request or make branch ownership unclear, stop and ask before proceeding.
3. Create a new local branch before implementation, from the base branch the repository names (often an integration branch such as `dev`), otherwise from the current `HEAD`:
   - Name it `<type>/<short-slug>` using the commit types in [`references/commit-messages.md`](references/commit-messages.md): `feat/contest-export`, `fix/login-redirect`, `docs/setup-guide`.
   - Use lowercase, hyphen-separated slugs of a few words.
   Reuse an already active dedicated branch only when it clearly belongs to the same task. Do not silently switch to a branch belonging to another task. If the repository has no usable `HEAD` or branch creation fails, report the blocker before editing.
4. Work in independently verifiable slices. Keep each slice cohesive and avoid mixing unrelated cleanup into it.
5. Validate each completed slice before committing it.

Do not commit planned work directly to the default branch or a shared integration branch unless the user asks for it. Do not push unless the user separately requests it.

When an orchestrator is coordinating worker agents, keep commit authority with the orchestrator. Planners, coders, reviewers, and testers may inspect or modify their assigned work, but must not run `git commit`, `git push`, or history-rewriting commands.

## Worktrees

Use a separate worktree instead of a branch in the current checkout only when isolation is needed:

- the current checkout has unrelated uncommitted work that must stay untouched;
- several tasks or agents work on the same repository at the same time; or
- the user asks for one.

When creating one:

1. Prefer the harness's or Orca's worktree tooling when available; otherwise run `git worktree add -b <type>/<slug> ../<repo>-<slug> <base>`.
2. Create it as a sibling of the main checkout, never inside it, so tooling and `git status` do not pick it up.
3. Remember that ignored files are not copied: reinstall dependencies, copy local `.env` files only with the user's consent, and confirm services or ports do not clash with the main checkout.
4. Record the path, branch, and base commit in the handoff.

Never delete a worktree or its branch that holds uncommitted or unmerged work. Remove one (`git worktree remove <path>`, then `git worktree prune`) only after its branch is merged or the user authorizes it.

## Atomic commit workflow

Create as many commits as the work requires. A commit should represent one logical, independently understandable unit: one feature slice, bug fix, refactor, test change that belongs to that unit, or documentation/configuration update. Keep commits small so each one can be reviewed, reverted, or cherry-picked without carrying unrelated changes.

Before every commit:

1. Stage only the completed unit with explicit paths, for example `git add -- path/to/file-a path/to/file-b`. Never use `git add .` or `git add -A` when unrelated work may exist.
2. Inspect the staged file list and diff: `git diff --cached --name-only`, `git diff --cached --stat`, and `git diff --cached` as needed.
3. Run `git diff --cached --check` and the targeted tests or validation for the unit.
4. Write the message following [`references/commit-messages.md`](references/commit-messages.md) (Conventional Commits), using the repository's scopes and rules where it defines them. If the staged changes need two types or two unrelated summaries, split the commit instead.
5. Confirm that only intended files are staged, that the slice has been reviewed, and that validation passes; then commit.

Include tests with the production change when they form one inseparable functional unit. Separate independent documentation, cleanup, or test-only work into its own commit.

If review or validation finds a defect after a commit:

- If the commit is unpushed and unreviewed, you may fold the fix into it (`git commit --amend` for the latest commit, or `git commit --fixup=<sha>` then `git rebase --autosquash` before pushing).
- If the commit has been pushed, reviewed, or is part of an orchestrated job, make a new focused `fix(...)` commit; never rewrite it.

## Integration

Merge only when the user asks. Unless the repository says otherwise:

- Merge a finished branch into its base with `git merge --no-ff <branch>` so the atomic commits stay intact and grouped. Do not squash them away.
- Resolve conflicts by preserving both sides' intent, rerun validation, and report what was resolved.
- Delete the merged local branch only when the user agrees.

## Handoff

Report the delivery tier, branch name (and worktree path, if any), commit hashes and subjects for planned work, validation performed, and any intentionally uncommitted paths. For fast-track work, state that no branch or commit was created. Keep the user’s unrelated changes separate from the task’s commits.
