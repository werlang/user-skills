# Browser Audit Checklist

Use this checklist to keep the audit honest and reusable.

## 1. Preflight

- Identify the supported local run command or existing running environment.
- Confirm the actual frontend URL.
- Identify side effects that must be stubbed or simulated.
- Identify the tests, helpers, or selectors that already cover the target area.

## 2. Requested Flows

For every user-requested flow, record:

- start point,
- steps taken,
- result,
- friction points,
- and any evidence worth citing.

Treat these as mandatory. Do not replace them with adjacent flows.

## 3. Automated Coverage Pass

- Read the nearest browser specs.
- Read helper selectors or fixtures when they reveal intended interaction paths.
- Note what the tests already prove.
- Note what still requires a live browser pass.

## 4. Exploratory Coverage Around The Request

Check nearby risks that could make the requested flow misleading or unstable:

- navigation and state persistence,
- loading and error handling,
- modals, drawers, popovers, and stacked surfaces,
- clipboard/import/export/restore flows,
- validation and conflict messaging,
- optimistic updates and rollback behavior,
- keyboard and focus behavior,
- accessible button and field labels,
- mobile or constrained-width layout when applicable,
- and submit or confirmation paths.

## 5. Safety Rules

- Do not trigger destructive or external actions blindly.
- Intercept or stub actions that send email, process payment, submit to production, or mutate shared systems.
- If using live data, keep the audit reversible whenever possible.
- State clearly which actions were simulated instead of executed for real.

## 6. Evidence Standards

- Prefer confirmed observations over speculation.
- When reporting a problem, capture the exact text or UI response when possible.
- Use screenshots selectively when they clarify layout or affordance problems.
- Use code references only when they help explain a verified behavior.

## 7. Severity Guide

- High: blocks completion, causes data loss/risk, misleads the user into failure, or creates false confidence.
- Medium: works but with major confusion, weak feedback, avoidable retries, or high error probability.
- Low: polish, copy, consistency, or mild discoverability issues that do not block task completion.

## 8. Closing Check

Before finishing, confirm that you can answer all of these:

- What tests were consulted?
- What did you verify live in the browser?
- What was simulated for safety?
- What genuinely worked well?
- What would you change first if asked to improve the UX?