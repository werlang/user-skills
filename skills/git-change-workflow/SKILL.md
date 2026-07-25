---
name: git-change-workflow
description: "Choose and apply a Git branching and commit workflow for implementation, refactor, bug-fix, documentation, and configuration work. Use this skill whenever a task may need a branch, commits, staging, or delivery-policy decisions: keep simple fast work on the current branch with no Git mutations, and put complex or large work on a new branch with small, focused, atomic commits."
---

# Git Change Workflow

## Choose the delivery tier

Classify the request before editing. Prefer the fast track only when the scope is clearly small and localized.

| Tier | Typical scope | Git policy |
| --- | --- | --- |
| Fast track | Typo, one-file copy or comment edit, one isolated constant/style change, or a similarly local fix | Stay on the current branch. Do not create a branch, stage files, commit, stash, reset, rebase, or push. |
| Planned track | New features, multi-file fixes, refactors, API/schema changes, broad documentation or configuration changes, cross-cutting tests, or ambiguous/risky work | Create a dedicated branch before editing and commit verified work atomically. |

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
3. Create a new local branch from the current `HEAD` before implementation:
   - `feat/<short-slug>` for features, refactors, documentation, or configuration improvements.
   - `fix/<short-slug>` for defect corrections.
   Reuse an already active dedicated branch only when it clearly belongs to the same task. Do not silently switch to a branch belonging to another task. If the repository has no usable `HEAD` or branch creation fails, report the blocker before editing.
4. Work in independently verifiable slices. Keep each slice cohesive and avoid mixing unrelated cleanup into it.
5. Validate each completed slice before committing it.

Do not commit planned work directly to `main` or `master`. Do not push unless the user separately requests it.

When an orchestrator is coordinating worker agents, keep commit authority with the orchestrator. Planners, coders, reviewers, and testers may inspect or modify their assigned work, but must not run `git commit`, `git push`, or history-rewriting commands.

## Atomic commit workflow

Create as many commits as the work requires. A commit should represent one logical, independently understandable unit: one feature slice, bug fix, refactor, test change that belongs to that unit, or documentation/configuration update. Keep commits small so each one can be reviewed, reverted, or cherry-picked without carrying unrelated changes.

Before every commit:

1. Stage only the completed unit with explicit paths, for example `git add -- path/to/file-a path/to/file-b`. Never use `git add .` or `git add -A` when unrelated work may exist.
2. Inspect the staged file list and diff: `git diff --cached --name-only`, `git diff --cached --stat`, and `git diff --cached` as needed.
3. Run `git diff --cached --check` and the targeted tests or validation for the unit.
4. Use a concise conventional message with an optional scope:
   - `feat(scope): add ...`
   - `fix(scope): correct ...`
   - `refactor(scope): reorganize ...`
   - `test(scope): cover ...`
   - `style(scope): adjust ...`
   - `docs(scope): update ...`
5. Confirm that only intended files are staged, that the slice has been reviewed, and that validation passes; then commit.

Include tests with the production change when they form one inseparable functional unit. Separate independent documentation, cleanup, or test-only work into its own commit. If review or validation finds a defect after a commit, make a new focused `fix(...)` commit; do not amend or rewrite an existing commit.

## Handoff

Report the delivery tier, branch name, commit hashes and subjects for planned work, validation performed, and any intentionally uncommitted paths. For fast-track work, state that no branch or commit was created. Keep the user’s unrelated changes separate from the task’s commits.
