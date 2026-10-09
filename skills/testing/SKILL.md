---
name: testing
description: Behavior testing for any code change. Use whenever the user mentions tests, TDD, red-green-refactor, regression, falsification, mutation, sabotage checks, test coverage, or asks to verify behavior, fix a bug, or change application logic — even if they do not name this skill.
---

# Testing

Test observable behavior at public boundaries, not whatever the implementation happens to do. Agent-written tests default to mirroring the implementation, so they cannot self-certify correctness.

## 1. The oracle rule

Agent tests prove self-consistency, not correctness. Both impl and tests are the same misread of intent when one context authors both.

- **Authoritative tests** (`tests/authoritative/**`) are the correctness oracle. They require human-supplied literals or a pre-existing frozen suite. An agent context that has seen the implementation never authors them alone. No literals = no authoritative tests; degraded single-context output stays in `tests/work/**` and never promotes to authoritative.
- **Work tests** (`tests/work/**`) are agent scratch for fast feedback and debugging. They never certify delivery.
- Single-context output is always `[SELF-REVIEW-DEGRADED]`. Report as `authoritative-unverified, mutation-gated only`. Do not claim independence.
- See [verification](references/verification.md) for freeze mechanics and [falsification](references/falsification.md) for what makes a test falsify rather than confirm.

Why: agent-only suites routinely pass on buggy code in our sessions. Treat them as self-consistency until falsified by an external oracle.

## 2. Tier effort before writing

Do not run the full loop for every change. Calibrate to blast radius:

- **Trunk** (auth, billing, migrations, shared infra, date/money logic): full loop §3 + scoped mutation or sabotage + adversarial check. Human literals required. Trunk never ships on a degraded self-authored oracle — missing human oracle means `blocked`, not `done`.
- **Branch** (feature logic, API handlers, workers): contract + Falsification Triad + Fast Sabotage. Human confirms seams and one worked example.
- **Leaf** (isolated view, copy change, gated script): one happy-path work probe + run nearest suite. No authoritative ceremony. Leaf applies only when none of these are present: auth, billing/money, PII, date/timezone, migration/schema, storage/upload, redirect/token. Any of those escalates to Branch minimum, Trunk if shared or irreversible.

If tier is unclear, ask one question and default to Branch.

## 3. The loop

### 3.1 Contract with literals

Derive from issue/PRD/spec, not from code. Every rule needs one worked example:

```yaml
feature: order-cancellation
rules:
  - id: CANCEL-001
    description: cancellable within 30 calendar days, not 30x24h
    example: purchase 2026-01-01T23:00+01:00 -> cancel 2026-01-31T00:30+01:00 REJECTED
```

No literals = no authoritative tests. Record seams under test ("public interface + which boundaries") and confirm with the user when Trunk/Branch. No test at an unconfirmed seam.

### 3.2 Author tests from contract, not code

Test Designer context receives `requirement + contract + public interfaces + existing authoritative tests`. Never the candidate implementation.

Author the Falsification Triad per seam — happy path from independent literal, boundary transition, negative rejection. Ban shallow, tautological, and snapshot oracles. Detail in [falsification](references/falsification.md).

Reviewer context receives `requirement + tests` only. Reject missing triad, shallow assertions, recomputed expected values, snapshots, internal mocks, or suites that pass for `always-allow` / `always-deny` / off-by-one. One send-back max.

### 3.3 Freeze, then implement

Freeze approved authoritative files before implementation. Record digests. Implementer may run them and may add `tests/work/**` probes, but never edits authoritative to green. Controlled changes go through a Test Change Request (reason + contract change + new literal + affected paths) approved independently. Mechanics in [verification](references/verification.md).

Legitimate: `write impl -> run authoritative -> fail -> fix impl -> rerun`.
Prohibited: `fail -> edit test or regenerate expected from impl -> green`.

### 3.4 Verify

1. Authoritative suite green with exit `0` and clean stderr.
2. Falsification gate: scoped mutation (`mutation_score >= 0.90`) or Fast Sabotage (2-3 Designer-picked invariants, every one must fail). Implementer never picks its own sabotage.
3. Adversarial spot-check for Trunk: `Find a spec violation the suite misses`. Findings go to Designer, never direct to impl edits.

Commands and framework discovery in [commands](references/commands.md). Run unit scope by default. Run integration/browser only on explicit request or when the change affects rendered UI, redirects, storage, or uploads.

## 4. Freeze guard

Freeze per [verification](references/verification.md). The orchestrator enforces the guard defined there (baseline digests + `status --porcelain` check) before accepting implementer output. Adapt the path only if the repo already uses an established layout.

## 5. Done report

A task is done only when:

- contract with literals is captured or linked
- authoritative suite was frozen before impl and untouched by implementer (guard output shown)
- falsification gate passed (mutation score or sabotage list with each mutation -> FAIL)
- remaining gaps stated (integration-only, browser-only, hidden-test debt)

Report: tier used, authoritative vs work results, guard result, mutation/sabotage evidence, gaps. Never claim tests prove absence of bugs. Never use coverage as the gate — coverage is execution evidence; falsification is correctness evidence.

Touch-code docs defer to `document-touched-code`. Broader quality review defers to `code-review`. End-to-end product audits defer to `ui-ux-auditor`.
