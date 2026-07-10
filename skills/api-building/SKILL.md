---
name: api-building
description: Build or refactor reusable Node.js APIs using Express, express.Router, ESM imports, named exports, entity classes in model/, helpers for non-endpoint logic, middleware for auth and other pre-route concerns, and route handlers that talk to model instances. Use when creating CRUD APIs, JWT auth flows, bcrypt password login, route modules, or starter API structures.
---

# API Building

Use this skill when an API should follow this default structure:

- Node.js + Express.
- `express.Router()` modules.
- ESM imports only.
- Named exports only. Never default export.
- `model/` for entity classes and persistence.
- `routes/` for API endpoints.
- `helpers/` for utilities that are not routes, middleware, or entities.
- `middlewares/` for auth and other pre-route logic.
- Only `GET`, `POST`, `PUT`, and `DELETE` endpoints.

## Required Structure

```text
src/
	app.js
	routes/
	model/
	helpers/
	middlewares/
```

## Responsibility Split

- `app.js`: compose Express, shared middleware, and route mounts.
- `routes/*.js`: parse input, validate request data, run request-scoped business logic, and shape HTTP responses.
- `model/*.js`: entity classes, persistence methods, normalization, relation loading.
- `helpers/*.js`: response helpers, database helpers, date utilities, mailers, render helpers, or other support code.
- `middlewares/*.js`: JWT auth, request guards, and reusable cross-cutting logic.

## Rules

- Routes talk to model instances, not raw SQL.
- Only models use the database driver.
- Passwords are hashed with `bcrypt`.
- Auth defaults to JWT bearer tokens.
- Helpers are for support logic, not endpoint handlers and not direct entities.
- Keep route logic explicit, but keep persistence and entity behavior inside models.

## Endpoint Pattern

Prefer this request flow:

1. Read params, query, and body in the route.
2. Validate the required inputs in the route.
3. Instantiate the relevant model class.
4. Call model methods.
5. Return JSON through response helpers.

## References

- Read `references/architecture.md` for the generic architecture rules.
- Read `references/mini-project/` for a small starter API that follows this structure.
- Pair this with the `mysql-helper`, `entity-models`, and `web-frontend` skills when needed.
