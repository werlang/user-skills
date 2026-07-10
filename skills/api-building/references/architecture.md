# API Architecture Reference

This reference defines a reusable Express API structure intended for new or existing projects.

## Folder Layout

```text
api/
  app.js
  routes/
  middlewares/
  helpers/
  model/
```

## Conventions

- Use ESM only.
- Use named exports only.
- Route modules export `router`.
- Model modules export classes.
- Helper modules export functions or classes.
- Restrict API routes to `GET`, `POST`, `PUT`, and `DELETE`.
- Keep database access inside models.

## Responsibilities

### Routes

- validate input
- orchestrate request-level business rules
- instantiate model classes
- return HTTP responses

### Models

- represent entities as classes
- normalize and serialize data
- encapsulate persistence and relation logic

### Helpers

- hold support logic such as response helpers, database helpers, date tools, mailers, or render helpers

### Middlewares

- authenticate requests
- enforce reusable preconditions before routes run

## Bootstrap

- Start from `references/mini-project/src/app.js`.
- Reuse the same separation of concerns when building new resources.