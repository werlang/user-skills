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
## Layout variants in the wild

Two shapes are common. The repository you are in decides which one applies; this page only describes
them so the reader recognises the tree instead of inventing one.

**Split packages** — API and front-end as sibling packages, each with its own `package.json`:

```text
package.json          # workspace root, when the repo uses workspaces
api/
  app.js
  route/              # singular
  middleware/         # singular
  model/
  helpers/
web/
  package.json
  src/
```

**Single package** — one `package.json`, the API at the root of `src/`:

```text
package.json
src/
  app.js
  routes/             # plural
  middlewares/        # plural
  models/
  services/
```

Rules that apply to both:

- Take the shape you find: singular vs plural directory names, `app.js` at the package root or under
  `src/`, front-end as a sibling package or not.
- Read `package.json` and a couple of imports before choosing; a directory rename is never part of an
  API change.
- New files follow their neighbours: same casing, same noun form, same export style.
