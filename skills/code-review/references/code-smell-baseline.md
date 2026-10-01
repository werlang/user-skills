# Code Smell Baseline for Agent Reviewers

This reference defines the baseline code smells applied during the **Standards** review pass. It translates clean-code heuristics into **mechanical detection cues**, **grep-able patterns**, and **cost-symptom gates**.

Rules that bind the baseline:
- **The repo overrides**: A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgment call**: Each smell is a labeled heuristic, never a hard violation. Skip anything already enforced by repo tooling (linters, formatters, typecheckers).
- **Stated maintenance cost required**: Every reported finding **must state a concrete maintenance cost** (harming changeability, readability, or testability); a finding without a stated cost is trivia.

---

## 1. Naming & Structure

| Smell | What It Is | Mechanical Detection Cue | Cost Symptom & Remediation |
| :--- | :--- | :--- | :--- |
| **Mysterious Name** | Identifier does not reveal intent, or query-named function mutates state (Command-Query Separation breach). | Search for functions named `get*`, `find*`, `is*`, `has*` that perform state mutations, network writes, or file I/O. | **Cost**: Callers cannot predict side effects.<br/>**Fix**: Rename honestly or separate query from mutation. |
| **Long Parameter List / Data Clumps** | >= 4 primitive parameters travelling together across multiple functions. | Inspect function signatures in diff with 4+ scalar arguments matching sibling function parameter signatures. | **Cost**: High call-site friction, order mismatch bugs.<br/>**Fix**: Bundle into a single typed object/interface. |
| **Primitive Obsession** | Raw strings, numbers, or tuples representing domain entities that carry validation rules. | Repetitive validation regexes or range checks on raw strings/numbers scattered across call sites. | **Cost**: Invariant checks duplicated and easily omitted.<br/>**Fix**: Encapsulate in a dedicated domain value object/type. |
| **Global Data / Mutable Data** | Mutable state exposed at module scope or shared across unrelated functions. | Non-`const` module variables, exported mutable singletons, or direct mutation of process environment outside bootstrap. | **Cost**: Non-deterministic race conditions, un-isolatable tests.<br/>**Fix**: Scope state to instances; make dependencies explicit via injection. |
| **Lazy Element** | Class, function, or wrapper that once did work and now merely forwards or holds single trivial logic. | Single-method classes or one-line functions whose only purpose is passing arguments to another function without translation. | **Cost**: Indirection overhead without architectural benefit.<br/>**Fix**: Inline the unit. |
| **Comments Narrating Bad Code** | Comments explaining *what* confusing code does or narrating deleted blocks, rather than *why*. | Inline comments restating the next line (`// increment count`), apology comments (`// hack: fix later`), or commented-out code blocks. | **Cost**: Clutter, drifts out of sync with code.<br/>**Fix**: Make the code self-documenting; delete commented code (Git retains history); keep only rationale (*why*). |

---

## 2. Duplication & Coupling

| Smell | What It Is | Mechanical Detection Cue | Cost Symptom & Remediation |
| :--- | :--- | :--- | :--- |
| **Duplicated Code** | Identical or near-identical logic blocks occurring across multiple sites. | Run `git grep` on key expressions. Count occurrences **codebase-wide**. | **Rule of Three**: Only extract past the 3rd occurrence.<br/>**Cost**: Bug fixes at one site miss others.<br/>**Fix**: Extract shared helper past 3rd occurrence; if <= 2, leave inline (KISS wins). |
| **Feature Envy** | Method calls more methods/fields of another object than of its own host. | Method receives an object `x` and makes multiple repeated calls like `x.getA()`, `x.getB()`, `x.calculateC()`. | **Cost**: High coupling, logic decoupled from data.<br/>**Fix**: Move the method (or fragment) onto the target object. |
| **Insider Trading** | Two modules reaching into each other's private internals or shared private variables. | Module importing non-exported internal paths, private underscore methods, or manipulating internal state buffers. | **Cost**: Changes to one module instantly break the other.<br/>**Fix**: Introduce a public contract interface both speak. |
| **Message Chains** | Deeply chained navigation calls (`a.b().c().d()`). | Chained method calls traversing 3+ object boundaries in business logic. | **Cost**: Tightly coupled to intermediate object graphs.<br/>**Fix**: Hide the traversal behind a single intention-revealing method on the root object. |
| **Repeated Switches** | Identical `switch (type)` or `if/else` ladders on the same discriminant enum across multiple files. | Multiple switch/case statements matching on the exact same enum or string discriminator. | **Cost**: Adding a new variant requires modifying every switch (Shotgun Surgery).<br/>**Fix**: Polymorphism or a shared registry/map. |
| **Shotgun Surgery** | A single logical change forces small edits across dozens of scattered files. | Diff shows 1-2 line edits repeated across 10+ unrelated directories. | **Cost**: Easy to miss a file during future changes.<br/>**Fix**: Consolidate the shared concept into a single authoritative module. |
| **Divergent Change** | One module is edited repeatedly for unrelated business reasons. | Git log shows one file constantly modified across disparate PRs and features. | **Cost**: High merge conflict rate, low cohesion.<br/>**Fix**: Split the module along single-responsibility seams. |

---

## 3. Overengineering (The Common AI Trap)

| Smell | What It Is | Mechanical Detection Cue | Cost Symptom & Remediation |
| :--- | :--- | :--- | :--- |
| **Speculative Generality** | Factory classes, abstract generic interfaces, or single-use hooks created for hypothetical future needs. | Interface with exactly 1 implementing class; unused generic type parameters; functions with unused config/flag options. | **Cost**: Cognitive drag, premature abstraction.<br/>**Fix**: Delete abstractions; implement the concrete solution directly (YAGNI). |
| **Premature Compatibility / Unreleased Shims** | Preserving backwards-compatibility adapters, dual-writes, or fallback routes for code never released in `main`. | Fallback ternary expressions checking for legacy data shapes that only existed on development branches. | **Cost**: Dead code and maintenance burden for zero users.<br/>**Fix**: Delete legacy paths; make the new implementation canonical. |
| **Premature Abstraction (Forced DRY)** | Abstracting code on the 1st or 2nd occurrence, introducing complex indirection. | Helper created for 2 call sites that requires parameters to customize slight differences. | **Cost**: Convoluted control flow; worse than duplication.<br/>**Fix**: Inline the code. Follow the Rule of Three; KISS wins. |
| **Middle Man** | Class or function that mostly forwards calls without adding validation, translation, or transactions. | Method body is purely `return this.service.method(...args)`. | **Cost**: Pointless indirection.<br/>**Fix**: Let callers talk directly to the provider, unless the wrapper adds architectural isolation. |

---

## 4. Bigness (Evidence-Gated)

Never flag bigness based solely on line count. Report only when accompanied by a **concrete cost symptom**:

| Smell | What It Is | Mechanical Detection Cue | Cost Symptom & Remediation |
| :--- | :--- | :--- | :--- |
| **Long Function / Large Class** | Function mixing disparate abstraction levels, containing untestable fragments, or handling multiple lifecycles. | Deep nesting (> 3 levels), multiple unrelated state variables, or mixed I/O and pure business logic in one block. | **Run Extraction Test**: Is the proposed piece nameable, cohesive, and does extraction make the parent easier to read without plumbing?<br/>**Fix**: Extract if test passes; otherwise keep cohesive. |
| **Refused Bequest** | Subclass that inherits from a parent but overrides or throws exceptions on most inherited methods. | Subclass overriding methods with `throw new UnsupportedOperationError()` or empty no-ops. | **Cost**: Violates Liskov Substitution Principle.<br/>**Fix**: Replace inheritance with composition. |

---

## 5. Error Flow

| Smell | What It Is | Mechanical Detection Cue | Cost Symptom & Remediation |
| :--- | :--- | :--- | :--- |
| **Exceptions as Control Flow** | Using `try/catch` blocks to handle expected business scenarios (e.g. cache misses, entity not found). | `catch` block returning default value or boolean `false` for expected non-error cases. | **Cost**: Masks genuine fatal runtime errors, degrades performance.<br/>**Fix**: Use explicit optional return types (`null`, `Result`, or discriminated union). |
| **Swallowed Errors** | Empty `catch` blocks or catch blocks that log and continue without propagating or handling. | `catch (e) {}` or `catch (err) { console.error(err); }` in operations where caller expects completion. | **Cost**: Silent failure, impossible production debugging.<br/>**Fix**: Propagate, wrap in domain error, or loudly document why silence is correct. |

---

## 6. Tests as Review Surface

Tests are first-class production code and must adhere to the same simplicity standards:

- **Duplicated Fixtures**: Large setup objects re-declared across 3+ test files -> Extract into a shared fixture factory.
- **Divergent Mocks**: The same external service mocked with conflicting shapes across test files -> Consolidate into one canonical mock.
- **Implementation-Coupled Assertions**: Tests asserting private method calls or spying on internal collaborators -> Refactor to assert public boundary behavior and state transitions.
- **Tautological / Mirror Tests**: Assertions that recompute expected values using the same code/formula as the implementation -> Replace with independent literals from the spec.
- **Shallow / Existential Assertions**: Tests asserting only `toBeDefined()`, `toBeTruthy()`, or mock invocation without verifying returned payload values or side effects -> Add exact value assertions.
