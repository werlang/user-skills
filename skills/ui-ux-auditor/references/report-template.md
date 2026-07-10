# UI/UX Audit Report Template

Use this structure for the final Markdown report. Adapt section names when the project already has a strong document convention.

## Title

`UI/UX Audit: <feature, page, or release scope>`

## Executive Summary

Write a short consultant-style summary:

- what was audited,
- overall quality judgment,
- main strengths,
- and the most important risks or UX problems.

## Scope

- product or page audited,
- requested scenarios,
- adjacent scenarios included by the audit,
- and notable exclusions.

## Method

- browser environment used,
- automated coverage consulted,
- manual paths executed,
- and safety measures such as stubs or intercepted side effects.

## Flows Validated

List each flow with a short outcome:

- `Passed`: completed cleanly.
- `Passed with friction`: worked, but required guesswork, retries, or weak feedback.
- `Failed`: could not be completed reliably.
- `Simulated`: validated with browser interception instead of the real side effect.

## Findings

Order findings by severity.

For each finding, include:

### `<Severity> — <Short title>`

- affected flow,
- observed behavior,
- why it matters,
- evidence,
- and recommendation.

Prefer behaviorally grounded findings over aesthetic commentary.

## Strengths To Preserve

Call out the parts of the UX that are working well and should not be lost in future changes.

## Prioritized Recommendations

Present the next actions in practical order:

1. highest-value fix,
2. next most important fix,
3. follow-up improvements.

Keep recommendations specific enough that an engineer or designer can act on them.

## Validation Gaps Or Constraints

State what was not validated, why, and what would be needed to close the gap.

## Appendix

Include only when useful:

- screenshots,
- URLs,
- side effects that were stubbed,
- or file references that explain a verified issue.