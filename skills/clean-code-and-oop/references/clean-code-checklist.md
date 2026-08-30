# Clean Code Diagnostic Checklist

Use this pre-flight checklist when writing new features, refactoring existing modules, or performing a code review.

---

## 1. Naming & Readability
- [ ] **Intention-Revealing Naming**: Do class, function, and variable names explicitly describe their purpose and intent without needing inline comment explanations?
- [ ] **No Cryptic Abbreviations**: Are terms spelled out cleanly (`customerRepository`, `authenticationToken` rather than `custRepo`, `authToken`, `usr`)?
- [ ] **No Noise Words**: Are generic suffixes (`Data`, `Info`, `Item`, `Manager`, `Processor`, `Helper`) avoided unless strictly adhering to a defined framework role?
- [ ] **Action Verbs for Methods**: Do methods start with clear active verbs (`calculateTotal`, `verifyEmail`, `publishVersion`)?
- [ ] **Predicate Booleans**: Are boolean flags and methods prefixed with `is`, `has`, `can`, `should` (e.g. `isActive`, `hasPermission`, `canDownload`)?
- [ ] **No Hungarian / Type Prefixes**: Are names free from data-type prefixes (`strName`, `arrItems`, `tblUsers`)?

---

## 2. Functions & Methods
- [ ] **Single Responsibility Principle (SRP)**: Does each function do exactly one thing at a single level of abstraction?
- [ ] **Bounded Length**: Is the function short, cohesive, and easy to read top-to-bottom on a single screen?
- [ ] **Low Cyclomatic Complexity**: Are nested control structures flattened?
- [ ] **Bounded Arguments (0–2 parameters)**: If a function requires 3 or more arguments, are they grouped into a structured options object (`{ key, body, contentType }`)?
- [ ] **Command-Query Separation (CQS)**: Does the function either perform a state-mutating command OR query data, without unexpected mutating side-effects in queries?
- [ ] **Zero Side-Effects**: Does the function avoid silently mutating input parameters or global state?

---

## 3. Control Flow & Defensive Design
- [ ] **Guard Clauses & Early Returns**: Are invalid inputs, edge cases, and preconditions checked immediately at the top of the function with early returns, eliminating nested `if/else` ladders?
- [ ] **Fail Fast & Loud**: Does the code throw typed, domain-specific errors (`CustomError`) with stable error codes rather than silently returning `null`, `false`, or empty objects?
- [ ] **No Magic Numbers or Strings**: Are raw numbers and string literals extracted into named constants or configuration enums?
- [ ] **Pure Logicless Templates**: Is HTML generation free from inline JS loops, conditionals, or raw concatenation?

---

## 4. Code Hygiene & Maintenance
- [ ] **Zero Dead Code**: Have all commented-out code blocks, unreachable branches, and unused variables/imports been deleted?
- [ ] **Zero Debug Code**: Are all `console.log`, `debugger`, and temporary debugging statements removed?
- [ ] **Boy Scout Rule**: Is the touched code cleaner, more readable, and better structured than before you touched it?
- [ ] **Rule of Three (Pragmatic DRY)**: Has duplication been abstracted only after the third occurrence, ensuring we don't build premature or bad abstractions?
- [ ] **YAGNI Compliance**: Is every line written solely for current requirements, with zero speculative future proofing?
