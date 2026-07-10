---
name: ui-ux-auditor
description: End-to-end browser-based UI and UX auditing for any product. Use when a user asks to test a page, feature, journey, release candidate, or interface as a real user would; when validating what existing automated tests cover plus requested scenarios plus adjacent UI breakage risks; or when producing a consultant-style Markdown audit report with findings, evidence, and prioritized UX improvements.
---

# UI/UX Auditor

Run two passes every time:

1. Test-engineer pass: verify behavior honestly.
2. UX-consultant pass: evaluate clarity, friction, affordances, and polish.

## Required Pairing

Always read [../test-first-delivery-generalized/SKILL.md](../test-first-delivery-generalized/SKILL.md) before executing the audit.

If the target has a browser-facing UI, also read [../frontend-bug-review-generalized/SKILL.md](../frontend-bug-review-generalized/SKILL.md).

## Audit Contract

- Use the browser whenever the product is reachable.
- Inspect existing automated coverage first and mirror the important flows it already encodes.
- Exercise every scenario the user explicitly asked to test.
- Add exploratory coverage for adjacent risks that could invalidate the user request or make the UI feel broken.
- Treat code and tests as hints, not proof. Do not claim a flow works unless it was verified in the browser or through an honest automated check.
- Stub, intercept, or avoid destructive side effects when the real action would send email, charge money, mutate production data, or trigger external systems.
- Document both what worked and what was confusing, fragile, misleading, inaccessible, or too hard to discover.

## Workflow

1. Discover the validation surface.
2. Launch or attach to the running product.
3. Map the target flows from existing tests and production code.
4. Execute the requested flows as a real user would.
5. Extend the audit with adjacent checks that reduce false confidence.
6. Capture evidence and classify findings.
7. Write the consultant report in Markdown.

## 1. Discover The Validation Surface

- Inspect the project for runnable tests and browser tooling: `package.json`, Playwright/Cypress specs, test helpers, tasks, README, CI files, or dev docs.
- Identify which tests already cover the target flows and which gaps require manual browser work.
- Identify dangerous actions and decide where interception or simulation is required.
- If the app cannot be opened safely, state the blocker and perform the deepest possible code-and-test audit instead.

Use [references/browser-audit-checklist.md](references/browser-audit-checklist.md) as the default audit checklist.

## 2. Launch Or Attach To The Product

- Prefer the project's existing local run path instead of inventing a new one.
- Verify the URL that actually serves the product.
- When multiple services are involved, make sure the UI has the backend dependencies it needs before starting the audit.
- If a browser sidecar or containerized browser exists, prefer that supported setup.

## 3. Map The Target Flows

- Read the nearest browser specs and helper selectors first.
- Use the tests to learn the intended sequence, not to replace the manual pass.
- Read enough implementation code to understand hidden entry points, modal sequencing, restore modes, optimistic UI, side effects, and API dependencies.
- Write down the requested flows you must prove.

## 4. Execute The Requested Flows

For each requested flow:

- start from the visible UI,
- navigate using the controls a real user would discover,
- complete the flow end to end,
- note where labels, affordances, feedback, or recovery are weak,
- and record whether the flow succeeded, partially succeeded, or failed.

Whenever useful, check:

- what changed on screen,
- what state changed underneath,
- what API or side effect was triggered,
- and whether the UI made that consequence understandable.

## 5. Extend The Audit Beyond The Request

Always add a focused exploratory pass for nearby risks, especially:

- empty, loading, busy, and error states,
- modal/panel stacking and close behavior,
- primary versus secondary action clarity,
- keyboard and focus behavior,
- accessible names and labels,
- conflict, validation, and submit feedback,
- responsive or constrained-layout breakage,
- navigation after mutations,
- and any mismatch between what the UI suggests and what the system actually does.

Do not expand into unrelated product redesign. Stay close to the user's requested journey and its dependencies.

## 6. Capture Evidence And Classify Findings

- Prefer concrete findings over taste-based criticism.
- Record severity based on user impact: blocked, misleading, error-prone, or polish-only.
- Capture enough evidence to support each claim: exact UI text, observed behavior, screenshots when necessary, and relevant file references when code explains the issue.
- Separate confirmed defects from UX recommendations.

## 7. Write The Consultant Report

- Produce a Markdown report in the project workspace.
- Prefer an existing documentation area if the repository already has one.
- If no obvious location exists, create `audits/ui-ux-audit-YYYY-MM-DD.md`.
- Keep the report readable by non-authors: concise executive summary, explicit scope, validated flows, prioritized findings, and practical recommendations.

Use [references/report-template.md](references/report-template.md) as the default structure.

## Output Requirements

The final report should include:

- scope and audit method,
- environment and safety notes,
- automated coverage consulted,
- requested flows tested,
- additional exploratory checks performed,
- findings ordered by severity,
- strengths worth preserving,
- prioritized recommendations,
- and remaining gaps or constraints.

When relevant, explicitly call out:

- flows that only worked after retries or guesswork,
- labels that hide the real action,
- places where success and error feedback conflict,
- destructive actions that lacked safe staging,
- and differences between what tests imply and what the real UI felt like.