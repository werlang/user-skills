---
name: frontend-bug-review-generalized
description: Deeply review frontend code for rendering regressions, interaction bugs, state and URL sync defects, auth and redirect issues, accessibility gaps, date/time problems, bundle or template contract drift, and missing regression coverage. Use when auditing UI code, investigating user-facing bugs, or pairing findings with deterministic frontend tests and honest browser validation.
---

# Frontend Bug Review

Use this skill for skeptical frontend review work when the goal is to find real user-facing defects, prove them, and lock them down with regression coverage plus honest browser validation.

## Required Pairing

Always pair this skill with [../test-first-delivery-generalized/SKILL.md](../test-first-delivery-generalized/SKILL.md).

This skill finds likely defects.
`test-first-delivery-generalized` supplies the contract for updating tests, rebuilding required artifacts, and reporting validation.

## Focus Areas

Prioritize defects that can change user behavior, submitted data, visible state, accessibility, or shipped assets:

- route-to-view, SSR, template, and bundle-entry contracts
- component state, URL sync, filters, pagination, tabs, modals, and optimistic updates
- login, logout, redirects, token persistence, gated routes, and role-conditioned surfaces
- forms, validation, busy states, empty states, retries, and error recovery
- date/time normalization between input widgets, serialized payloads, local display, and shared links
- accessibility regressions around focus order, hidden states, labels, keyboard flows, and disabled controls
- checked-in bundles, generated CSS, static assets, or template hooks that drift from source changes

Do not spend the review on style-only feedback or speculative redesigns without a concrete behavior, accessibility, or maintainability risk.

## Review Workflow

1. Scope the affected page, component, route, template, state module, or shared helper.
2. Read the production code and the nearest frontend tests first.
3. Map the user-visible flow from initial render to client boot to API request and response handling when relevant.
4. Look for contract mismatches between markup, selectors, props, state shape, template variables, routes, and built artifacts.
5. Decide whether each likely bug fits a pure helper assertion, component or DOM test, route or SSR test, or needs a real browser pass.
6. Add or update focused tests where deterministic coverage is practical.
7. Rebuild affected frontend artifacts when the project expects compiled bundles, generated CSS, or checked-in output.
8. Exercise the changed flow in a real browser session when the bug depends on actual input, focus, layout, storage, redirects, uploads, or authenticated multi-step behavior, using [../test-first-delivery-generalized/references/browser-smoke-checklist.md](../test-first-delivery-generalized/references/browser-smoke-checklist.md) as the default checklist.
9. Report findings ordered by severity, then list browser-only or cross-service gaps that remain.

## Test Selection Heuristics

- Use pure helper and contract tests for parsing, normalization, formatting, sorting, reducers, and permission helpers.
- Use component, DOM, or `jsdom`-style tests for event wiring, rendering branches, modal or tab behavior, submit order, and busy or error states.
- Use route or SSR tests for rendered shells, template variables, metadata, redirects, and static asset inclusion.
- Use manual browser validation when behavior depends on real clicks, typing, focus timing, CSS/layout, storage persistence, uploads, redirects, or authenticated cross-surface flows.

## Bug Heuristics

Prefer investigating these patterns early:

- markup hooks changed without matching selector or test updates
- filters or pagination that change the UI without preserving state, defaults, or deep links
- auth flows that trust unsafe redirect targets or rely on stale client state
- date or locale values submitted without normalization or displayed with time-zone drift
- busy or error states that disable controls too early, never recover, or hide the real message
- source asset changes that were not propagated to the build output the project ships
- tests that assert markup exists but never prove the interaction, failure, or empty-state branch that can regress

## Output Expectations

When the user asked for a review, findings come first.

Each finding should include:

- severity
- the affected frontend file or user flow
- why it is a real bug or likely runtime defect
- whether deterministic coverage exists, was added, or is still missing
- whether a browser pass is still needed

Keep summaries brief. The value of this skill is in concrete frontend bug finding plus executable regression coverage.