---
name: backend-bug-review-generalized
description: Deeply review backend, API, service, worker, and data-layer code for logic bugs, contract mismatches, authorization gaps, state-transition defects, time/date bugs, side-effect failures, and missing regression coverage. Use when auditing server-side code for real defects or pairing bug-finding with deterministic regression tests.
---

# Backend Bug Review

Use this skill for skeptical backend review work when the goal is to find real defects, prove them, and lock them down with regression coverage.

## Required Pairing

Always pair this skill with [../test-first-delivery-generalized/SKILL.md](../test-first-delivery-generalized/SKILL.md).

This skill finds likely defects.
`test-first-delivery-generalized` supplies the contract for updating tests, choosing validation, and rerunning the relevant suite until it is green.

## Focus Areas

Prioritize defects that can change behavior, data, permissions, money, or runtime stability:

- authentication, authorization, tenancy, and ownership checks
- request validation, serialization, and status-code or error mapping
- state transitions, workflow guards, retries, and idempotency
- date, time-zone, scheduling, expiry, and range calculations
- background jobs, startup wiring, optional dependencies, and feature flags
- persistence defaults, normalization, filtering, pagination, and transaction boundaries
- side effects such as e-mail, webhooks, queues, storage, search indexing, and cache invalidation
- error wrapping that hides or corrupts the real failure mode

Do not spend the review on style-only suggestions or refactors without a concrete bug risk.

## Review Workflow

1. Scope the backend surface under review: handlers, routes, services, models, repositories, jobs, helpers, and nearby tests.
2. Read the production code first and identify the highest-risk boundaries and state transitions.
3. Look for contract mismatches between code, docs, validators, serializers, persistence rules, and side effects.
4. For each likely bug, decide whether it is already covered by a deterministic test in the nearest existing suite.
5. If not covered, add or update a focused regression test as close as possible to the defect.
6. Run the narrowest trustworthy command for the affected backend scope.
7. If a regression fails, fix the production root cause, not only the symptom.
8. Rerun the affected validation scope until it is green.
9. Report findings ordered by severity, then list remaining integration-only gaps.

## Bug Heuristics

Prefer investigating these patterns early:

- guards whose acceptance criteria are broader than the documented contract
- helpers that round-trip dates, money, or identifiers through lossy conversions
- defaults applied in one layer but silently skipped in another
- async flows that can partly succeed and leave inconsistent state behind
- retry or deduplication logic that can duplicate work or suppress real errors
- startup or background code that imports optional dependencies without isolating failures
- tests that only prove happy paths while state transitions have multiple branches

## Output Expectations

When the user asked for a review, findings come first.

Each finding should include:

- severity
- the affected backend file, module, or behavior
- why it is a real bug or likely runtime defect
- whether a regression test exists, was added, or is still missing

Keep summaries brief. The value of this skill is in precise bug finding plus executable regression coverage.