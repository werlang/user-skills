---
name: clean-code-and-oop
description: Authoritative engineering standards for writing Clean Code, Object-Oriented Programming (OOP) architectures, SOLID design principles, and safe refactoring. Trigger automatically whenever creating new features, writing classes/modules, designing domain entities, refactoring existing code, restructuring functions, reviewing code quality, or simplifying complex logic.
---

# Clean Code, OOP, and Refactoring Guidelines

This skill defines the engineering standards for writing clean, object-oriented, and maintainable software. Apply these principles by default across all code generation, refactoring, and code review tasks.

---

## 1. Core Engineering Principles

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           The Pragmatic Foundation                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  KISS: Choose the most direct, readable solution over cleverness.           │
│  YAGNI: Code strictly for current requirements, never future guesses.       │
│  DRY & Rule of Three: Copy twice, abstract on the 3rd occurrence.           │
│  SOLID: Maintain single-responsibility classes and stable interfaces.       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Clean Code Standards

1. **Intention-Revealing Naming**:
   - Class and entity names must be explicit domain nouns (`UserRegistration`, `CatalogModel`). Avoid generic suffixes like `Data`, `Info`, `Manager`, `Processor`.
   - Method names must begin with active verbs (`calculateTotal`, `verifyEmail`, `publishRelease`).
   - Boolean variables and predicates must use clear prefixes (`isActive`, `hasPermission`, `canDownload`).
   - Never use type-based prefixes (`strName`, `arrItems`) or cryptic abbreviations.

2. **Function & Method Hygiene**:
   - **Single Responsibility (SRP)**: Each function must do one thing at a single level of abstraction.
   - **Small & Focused**: Keep functions short and easy to understand in a single pass.
   - **Bounded Parameters**: Functions should take 0–2 positional parameters. If 3 or more parameters are needed, group them into a structured options object (`{ key, bucket, fileName }`).
   - **Command-Query Separation (CQS)**: Methods that mutate state must not return complex query objects with hidden side-effects. Methods that query data must be pure and free of side-effects.

3. **Guard Clauses & Control Flow**:
   - Flatten control flow with **early returns** / guard clauses at the top of functions to handle edge cases, invalid inputs, and error conditions.
   - Never write deeply nested `if/else` ladders (arrow anti-pattern).
   - **Fail Fast & Loud**: Throw typed custom errors (`CustomError`) with stable machine-readable error codes instead of returning silent `null` or empty objects.

4. **Zero Dead Code & Noise**:
   - Completely delete commented-out code, orphaned variables, and temporary debug statements (`console.log`) before completing a task.

---

## 3. OOP & Domain Architecture

1. **True Encapsulation & Rich Domain Entities**:
   - Protect internal class state; expose intention-driven domain methods rather than public property mutations.
   - Avoid **Anemic Domain Models** (where models are dumb data bags and business validation is scattered across controllers/routes). Business invariants, state transitions, and validation belong inside the entity class.
   - Return copies or immutable views of internal collections to prevent external callers from mutating private class arrays/sets.

2. **Composition over Inheritance**:
   - Use class inheritance strictly for genuine polymorphic *is-a* relationships (e.g. `Modal extends BaseComponent`, `User extends Model`).
   - Use composition (`has-a` / `uses-a`) to combine cohesive collaborators, strategies, and helpers.

3. **SOLID Principles in Practice**:
   - **Single Responsibility Principle (SRP)**: A class should have only one reason to change.
   - **Open/Closed Principle (OCP)**: Open for extension (via strategies, polymorphism, or event handlers), closed for direct modification.
   - **Liskov Substitution Principle (LSP)**: Derived classes must remain completely substitutable for their base class without violating contracts.
   - **Interface Segregation Principle (ISP)**: Expose small, cohesive, client-specific method interfaces rather than bloated god-classes.
   - **Dependency Inversion Principle (DIP)**: High-level routes and services depend on abstractions and domain models, never raw low-level database drivers or infrastructure details.

4. **Polymorphism & Strategy over Type-Branching**:
   - Replace sprawling `switch(type)` / `if (role === 'admin')` dispatch trees with polymorphic handlers or strategy lookup maps.

---

## 4. Refactoring Guidelines

1. **Test-Guarded (Red-Green-Refactor)**:
   - Always run unit tests before and after refactoring to ensure behavioral equivalence. Never perform refactoring on untested paths without adding regression coverage first.

2. **Core Refactoring Moves**:
   - **Extract Method**: Break down long methods into cohesive, intention-revealing private/helper functions.
   - **Extract Class / Component**: Split classes that accumulate multiple responsibilities.
   - **Decompose Conditional**: Replace complex boolean expressions with descriptive variables or guard methods.
   - **Parameter Object**: Replace parameter-heavy function signatures with structured options objects.

3. **Boy Scout Rule**:
   - Leave every touched file cleaner, simpler, and better documented than you found it.

4. **Production Baseline vs. In-Flight Work**:
   - `main` is the canonical source of production code.
   - **In-flight / Pre-release work (not in `main`)**: Perform **hard replacements**. Completely delete obsolete code, parameters, and methods in a single pass. Never introduce backwards-compatibility fallbacks, dual-variable shims, or legacy aliases.
   - **Production contracts (already in `main`)**: Apply safe evolution, non-breaking schema migrations, and backward-compatible transitions only when modifying live production contracts or persistent production data.

---

## 5. References & Deep Dive Guides

Consult the bundled reference guides for concrete before/after examples and detailed checklists:
- [Clean Code Diagnostic Checklist](references/clean-code-checklist.md) - Quick pre-flight inspection checklist.
- [OOP Patterns and Anti-Patterns](references/oop-patterns-and-anti-patterns.md) - Rich vs. anemic models, strategy pattern, composition vs. inheritance.
- [Refactoring Catalog & Recipes](references/refactoring-catalog.md) - Step-by-step refactoring recipes and smells.

---

## 6. Related Skills
- [`code-review`](../code-review/SKILL.md) - Code quality and standards evaluation.
- [`api-building`](../api-building/SKILL.md) - Clean API architecture and entity models.
- [`web-frontend`](../web-frontend/SKILL.md) - Component OOP hierarchy and model-view separation.
- [`document-touched-code`](../document-touched-code/SKILL.md) - JSDoc contracts and interface documentation.
- [`backend-bug-review-generalized`](../backend-bug-review-generalized/SKILL.md) - Backend bug audit and regression prevention.
- [`frontend-bug-review-generalized`](../frontend-bug-review-generalized/SKILL.md) - Frontend contract and interaction bug audit.
