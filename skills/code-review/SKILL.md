---
name: code-review
description: Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes — Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/PRD asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Also supports a verify-fixes mode: re-review the diff produced by fixes made in response to a prior review. Use when the user wants to review a branch, a PR, work-in-progress changes, asks to "review since X", or wants fixes from a previous review double-checked.
---

Two-axis review of the diff between `HEAD` and a fixed point the user supplies:

- **Standards** — does the code conform to this repo's documented coding standards?
- **Spec** — does the code faithfully implement the originating issue / PRD / spec?

Both axes run as **parallel sub-agents** so they don't pollute each other's context, then this skill aggregates their findings.

The issue tracker should have been provided to you — run `/setup-matt-pocock-skills` if `docs/agents/issue-tracker.md` is missing.

## Process

### 1. Pin the fixed point and calibrate stakes

Whatever the user said is the fixed point — a commit SHA, branch name, tag, `main`, `HEAD~5`, etc. If they didn't specify one, ask for it.

Capture the diff command once: `git diff <fixed-point>...HEAD` (three-dot, so the comparison is against the merge-base). Also note the list of commits via `git log <fixed-point>..HEAD --oneline`.

Before going further, confirm the fixed point resolves (`git rev-parse <fixed-point>`) and the diff is non-empty. A bad ref or empty diff should fail here — not inside parallel sub-agents.

Also ask one calibration question if the answer isn't already known: **has any of this diff already run outside local development?** (deployed, migrated, sent real traffic/email/data). Findings on stateful artifacts — persisted data, external effects, configuration — change severity completely depending on the answer: pre-production means risky shapes can simply be edited, shipped means they need forward-compatible treatment. Carry the answer into both sub-agents' briefs.

### 2. Identify the spec source

Look for the originating spec, in this order:

1. Issue references in the commit messages (`#123`, `Closes #45`, GitLab `!67`, etc.) — fetch via the workflow in `docs/agents/issue-tracker.md`.
2. A path the user passed as an argument.
3. A PRD/spec file under `docs/`, `specs/`, or `.scratch/` matching the branch name or feature.
4. If nothing is found, ask the user where the spec is.

If there genuinely is no spec, do **not** skip the Spec axis — run it in **degraded mode**: treat the branch's own commit messages as a weak spec and have the Spec agent check self-consistency — does the diff actually do what its commits claim? Half-done work and scope creep are visible without a formal spec. Mark the section "Spec (degraded — self-consistency vs commit messages)" in the final report.

### 3. Identify the standards sources

Anything in the repo that documents how code should be written. Look beyond the obvious: `CONTRIBUTING.md`, `CODING_STANDARDS.md`, agent/AI instruction files (`AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.agents/**`), architecture docs, README conventions sections.

**Check what tooling enforces first** — lint configs, formatters, type-checkers, CI gates. Anything those already catch is out of scope for reviewers; saying so up front keeps them focused on what humans and agents can uniquely see.

#### The point of the methodology

Every principle below exists for exactly three outcomes: the code stays **changeable**, **readable**, and **testable**. A finding that cannot say which of those three suffers — and roughly what it costs to change later — is trivia, not a finding. State the cost, not just the shape.

#### KISS, YAGNI, and DRY Triad

On top of repo standards, evaluate every change against the core simplicity triad:

- **KISS (Keep It Simple, Stupid)** — Choose the most straightforward, readable solution. Every line of code should prioritize extreme readability.
- **YAGNI (You Aren't Gonna Need It)** — Only code for current, actual requirements, never future guesses. Avoid writing premature helpers, single-use wrapper classes, extra parameters, or speculative abstractions.
- **DRY (Don't Repeat Yourself)** — Business logic should have a single, unambiguous representation. Apply DRY *after* repetition is real.

**Interactions & Balancing Rules:**

- **KISS + YAGNI (Protection)**: YAGNI stops unnecessary code from being written; KISS ensures necessary code stays simple and direct.
- **DRY vs. YAGNI (The Tension)**: Follow the **Rule of Three** — abstract on the third occurrence. Count occurrences **across the whole codebase, not just the diff**: duplication usually predates the change; `grep` for the pattern to get the true count. The diff is where a finding surfaces, not the boundary of what counts.
- **DRY vs. KISS (The Balance)**: Forcing code to be DRY can create convoluted, unreadable architectures. A little duplication is far better than a bad, confusing abstraction (**KISS wins**).

#### Code Smell Baseline

The Standards axis carries the **smell baseline** below — a fixed set of code smells (after _Refactoring_, ch.3, plus a few from the wider clean-code canon) that applies even when a repo documents nothing. Rules that bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic, never a hard violation — and skip anything tooling already enforces.
- **Size is a proxy, never a threshold.** Where a smell concerns bigness, report it only with a cost symptom (below). Never recommend splitting on line counts.

Each smell reads *what it is* → *how to fix*; match it against the diff:

**Naming & structure**

- **Mysterious Name** — a name that doesn't reveal what it does or holds; includes query-named functions that mutate or validate as a side effect (a Command–Query Separation breach). → rename; if no honest name comes, the design's murky.
- **Long Parameter List / Data Clumps** — the same few arguments travelling together call after call. → bundle into one type and pass that.
- **Primitive Obsession** — a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Global Data / Mutable Data** — shared mutable state poked from multiple sites in the diff. → scope it down or make ownership explicit.
- **Lazy Element** — a class or function that once earned its keep and now barely does anything. → inline it.
- **Comments narrating bad code** — comments compensating for unclear code ("this resets the flag because…") or narrating deleted code. Good intent/why comments are fine. → fix the code, keep the why.

**Duplication & coupling**

- **Duplicated Code** — the same logic shape appears in multiple places. Count occurrences **codebase-wide** per the Rule of Three above before recommending extraction. → extract the shared shape past the third occurrence; call it from all sites.
- **Feature Envy** — a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Insider Trading** — modules exchanging internals no third party should see. → reintroduce a boundary both can speak.
- **Message Chains** — long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Repeated Switches** — the same `switch`/`if`-cascade on the same type recurs across the change. → polymorphism, or one map both sites share.
- **Shotgun Surgery** — one logical change forces scattered edits across many files. → gather what changes together into one module.
- **Divergent Change** — one file or module is edited for several unrelated reasons. → split so each module changes for one reason.

**Overengineering (the direction most reviews under-flag)**

- **Speculative Generality** — abstraction, parameters, single-use hooks for needs nothing in the spec has. → delete; inline back until a real need shows.
- **Premature Abstraction (Forced DRY)** — an abstraction introduced below the Rule-of-Three count, or one that adds confusing indirection. → inline it; KISS wins over premature DRY.
- **Middle Man** — a class or function that mostly forwards onward. **Counterweight:** forwarding-only wrappers are debt, but wrappers that add vocabulary, a boundary, error translation, or transactional meaning are *design* — flag only the former, and say which the wrapper lacks.

**Bigness (evidence-gated — report only with a cost symptom)**

- **Long Function / Large Class** — report only when you can point at one of: mixed abstraction levels in one unit; a fragment that cannot be honestly named; duplicated logic trapped inside; or a history of unrelated edits repeatedly landing in the same unit. Never line counts. Before recommending any split, run the **extraction test**: is the piece nameable and cohesive, and does extracting make the parent *easier* to read without callers juggling more interface? If the result is shallow fragments and pass-through plumbing, recommend against splitting — fewer, deeper units beat many shallow ones.
- **Refused Bequest** — a subclass that ignores or overrides most of what it inherits. → composition over inheritance.

**Error flow**

- **Exceptions as Control Flow** — `try/catch` used to route expected cases (miss → fallback, empty → default) while swallowing real failures in the same net. → narrow the catch to the specific expected condition; let everything else propagate.
- **Swallowed Errors** — empty catch blocks, errors logged-and-dropped where the caller needed to know. → propagate, wrap in a domain error, or document loudly why silence is correct.

**Tests are review surface too**

- Duplicated fixtures re-declaring the same objects across files past the Rule of Three; divergent mocks of the same concept (same name, different shapes); assertions coupled to implementation instead of behaviour; tests that can't fail. Same baselines apply — tests are code.

### 4. Run the reviews

**Topology.** Default: send a single message with two `Agent` tool calls (`general-purpose` subagent) — Standards + Spec — so their contexts stay independent.

For large diffs (rough guide: >2,000 changed lines or >40 files, or clearly separable areas), partition the **Standards** axis by area (e.g., api/, web/, css/, tests/) into additional parallel agents. Give every partition the *identical* methodology text and the same finding schema; partition coverage, not judgment. The Spec agent always reads the whole diff — spec mapping needs global context.

**Boundary check.** Whenever the diff touches both sides of an interface — API↔client, schema↔code, template/module↔importer, docs↔behaviour, class names↔CSS — assign one agent (or handle at aggregation) an explicit cross-surface pass: do both sides agree? Partitioned reviews otherwise let each half look clean while the contract drifts.

**Reviewers may investigate.** Sub-agents may run **read-only** commands — `git grep`, targeted test runs, opening quoted locations — to turn speculation into evidence. They must not modify anything.

**Standards sub-agent prompt** — include:

- The full diff command and commit list, the partition scope if applicable, and the operational-exposure answer from step 1.
- The list of standards-source files found in step 3, plus the enforced-by-tooling exclusions, **plus the methodology from step 3 pasted in full** — the sub-agent has no other access to it.
- Permission to run read-only commands.
- The brief: "Report findings in this exact shape — `location (file:line) · category (documented-standard violation | suspected bug | smell) · severity (high = hurts maintainers or users after merge; medium = should fix soon; low = nit) · confidence (verified = you opened and confirmed the evidence; reported = plausible but unchecked) · evidence (quote the actual code)`. Cover (a) documented-standard violations — cite standard file + rule; (b) KISS/YAGNI/DRY breaches; (c) baseline smells — name it, quote it, state the maintenance cost. A finding without stated cost is trivia; leave it out. Skip anything tooling enforces. Order by severity; cap detailed findings at ~10 per partition and list the rest one-line."

**Spec sub-agent prompt** — include:

- The diff command and commit list (whole diff, always).
- The path or fetched contents of the spec — or, in degraded mode, the commit-message list and the self-consistency brief.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding." In degraded mode: "(a) commits whose claims the diff doesn't fully honour; (b) diff behaviour no commit message mentions."

If the spec is missing entirely and the user confirms there is none, degraded mode still runs — only skip when the diff is purely mechanical (formatting, renames).

### 5. Aggregate

Before presenting, do three passes over the raw reports:

1. **Verify.** Open every high-severity finding and a sample of the rest at its quoted location. Mark each finding `verified` or `unverified`; drop any whose quoted evidence doesn't hold (and say what was dropped). **Deletion-class findings** ("dead code/key/file") publish as high-severity only with proof of non-use — including dynamic reference patterns (constructed key names, string-built imports), not just literal greps.
2. **Dedup with attribution.** Two agents reporting the same issue in different words ship once, crediting both.
3. **Keep the axes separate.** Present under `## Standards` and `## Spec`, preserving each finding's location/severity/confidence/evidence shape. Do **not** merge or rerank across axes (see _Why two axes_).

End with a one-line summary per axis: total findings (verified/unverified), and the worst issue _within each axis_. Don't pick a single winner across axes.

State explicitly anything material that was **not** verifiable statically (runtime behaviour, visual output, integration points) so the reader knows the review's edges.

## Verify-fixes mode

When the user has applied fixes in response to a review, re-review **the fix diff itself** (`review-point..HEAD`, or uncommitted changes): defect-first, same methodology, with one added lens — *did the fix introduce what it was fixing?* Fixes routinely overshoot (loosening a validator beyond need), undershoot (fixing one of several duplicate sites), or break neighbours (renamed identifiers still queried elsewhere). The fix diff is statistically the most error-prone artifact in the cycle; treat it as a first-class review target, not a footnote.

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly the issue asked but breaks the project's conventions → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.
