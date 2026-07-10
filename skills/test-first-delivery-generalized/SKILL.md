---
name: test-first-delivery-generalized
description: Deliver behavior changes, bug fixes, refactors, and feature work in any project with tests or explicit validation. Use when changing application behavior, updating existing tests, reviewing missing coverage, choosing between automated and manual validation, or documenting testing gaps across backend, frontend, CLI, and full-stack work.
---

# Test-First Delivery

Use this skill whenever a task changes behavior.

## Default Quality Contract

- Do not treat a behavior-changing task as done with code changes alone.
- If the touched area already has automated coverage, update that coverage and run it.
- Prefer the narrowest honest validation path that can prove the changed contract.
- Add success cases plus meaningful edge cases, not only happy-path assertions.
- Prefer project-local tests for the changed area instead of broad repo-wide harness changes.
- If automation is missing, decide whether a small local test addition is justified or whether explicit manual validation is the honest path.
- Rebuild generated artifacts when the project expects checked-in bundles, compiled assets, schemas, or generated clients.
- Finish by stating what was validated, what was not, and why.

## Discover The Project Reality

Before changing tests or commands, inspect the repository for its actual validation surface:

1. Find the existing runners and scripts in `package.json`, `pyproject.toml`, `tox.ini`, `noxfile.py`, `go.mod`, `Cargo.toml`, `pom.xml`, `build.gradle*`, `Makefile`, `justfile`, CI workflows, and task docs.
2. Identify the smallest existing suite that covers the touched behavior: unit, integration, API, component, browser, snapshot, CLI, or contract tests.
3. Identify required secondary steps such as builds, asset rebundles, schema generation, migrations, or fixture setup.
4. Identify which behaviors still need a real manual pass: browser interaction, layout, focus, native integrations, auth redirects, or environment-dependent flows.

Use [references/testing-decision-tree.md](references/testing-decision-tree.md) to choose the validation path.
Use [references/validation-commands.md](references/validation-commands.md) to derive project-appropriate commands.
Use [references/browser-smoke-checklist.md](references/browser-smoke-checklist.md) when browser behavior changed.

## Web Test Design

- Prefer pure assertions for deterministic helpers, parsing, formatting, normalization, reducers, selectors, and permission logic.
- Prefer component, DOM, or `jsdom`-style tests for event wiring, rendering branches, busy states, empty states, error states, and form behavior.
- Prefer route or server tests for SSR output, template variables, API contracts, middleware behavior, and status-code mapping.
- Prefer browser or manual validation when the change depends on real clicks, typing, focus timing, CSS/layout, storage persistence, redirects, uploads, or cross-service auth flows.
- Avoid large snapshot-heavy tests when smaller semantic assertions can prove the contract.

## Workflow

1. Identify the owner of the behavior change: backend, frontend, CLI, mobile, infrastructure, or cross-surface.
2. Check whether the touched area already has automated tests or whether a small local harness should be added.
3. Choose the validation path with [references/testing-decision-tree.md](references/testing-decision-tree.md).
4. Add or update the narrowest honest tests alongside the production change.
5. Run the relevant commands and build steps from [references/validation-commands.md](references/validation-commands.md).
6. For browser-facing interaction changes, execute the adapted checklist from [references/browser-smoke-checklist.md](references/browser-smoke-checklist.md).
7. Fix failures and rerun the validated scope until it is green.
8. Finish with explicit reporting:
   - automated tests or commands run
   - manual checks performed
   - remaining gaps or environment limits

## Done Criteria

A behavior-changing task is complete only when:

- the implementation is in place,
- automated tests were updated and run when they existed or were intentionally bootstrapped,
- changed behavior has meaningful success and edge-case coverage where deterministic automation is practical,
- required build or generation steps were rerun when the project depends on them,
- browser or manual validation was completed for interaction-heavy or environment-dependent behavior when automation could not honestly prove it,
- and the final report plainly calls out remaining gaps.