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
- **Mass Assignment Defense**: Whitelist explicitly permitted fields on model create/update methods; never assign raw `req.body` directly to database persistence layers per [`security-defense-and-mitigation`](../security-defense-and-mitigation/SKILL.md).
- **IDOR / BOLA Prevention**: Always scope entity query and mutation methods by the authenticated account/tenant ID (`where owner_id = ?`) to ensure unauthorized cross-user access is impossible.
- **Rich Domain Encapsulation**: Keep validation invariants and domain business rules inside entity methods rather than in anemic data bags per [`clean-code-and-oop`](../clean-code-and-oop/SKILL.md).

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
- Pair with [`api-building`](../api-building/SKILL.md), [`security-defense-and-mitigation`](../security-defense-and-mitigation/SKILL.md), and [`clean-code-and-oop`](../clean-code-and-oop/SKILL.md).