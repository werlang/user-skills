---
name: entity-models
description: Model API entities as classes inside model/, including base model inheritance, relation helpers, model-to-model composition, and route-to-model instance flows. Use when creating entities, join-table relations, persistence methods, or routes that should coordinate model instances through a shared database driver helper.
---

# Entity Models

Use this skill when entities should be implemented as classes and relationships should stay in the model layer.

## Rules

- Put entity classes in `model/`.
- Export named classes only.
- Instantiate models in routes instead of passing raw objects around.
- Keep relation logic in models or dedicated relation helpers.
- Keep persistence logic in models and delegate database access to a shared driver helper.
- Let routes orchestrate request-level work through model instances.

## Relation Pattern

Use a small relation helper for join tables and many-to-many behavior.

Typical responsibilities:

- check relation existence
- insert relation rows
- replace relation sets
- delete relation rows
- list related rows

## References

- Read `references/entity-models.md` for the generic architecture.
- Read `references/mini-project/` for a small relation-aware example.