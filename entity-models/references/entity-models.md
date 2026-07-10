# Entity Models Reference

This reference defines a reusable class-based entity modeling approach.

## Folder Layout

```text
src/
  model/
    model.js
    relation.js
    user.js
    article.js
  routes/
    articles.js
```

## Responsibilities

### Base Model

- centralize access to the database helper through a shared `driver`
- provide common CRUD wrappers
- set `static driver = Mysql` or a similar shared helper on the base class

### Entity Models

- define fields and normalization
- expose entity-specific methods
- load related entities through other model classes

### Relation Helper

- handle join-table persistence
- provide `getAll`, `replace`, `insert`, and `delete`

## Bootstrap

- Start from `references/mini-project/src/model/model.js`.
- Use `relation.js` when a join table is involved.
- Consume a shared database helper from `references/mini-project/src/helpers/mysql.js` via the model base class.
