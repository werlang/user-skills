---
name: api-building
description: Build or refactor reusable Node.js APIs using Express, express.Router, ESM imports, named exports, entity classes in model/, helpers for non-endpoint logic, middleware for auth and other pre-route concerns, and route handlers that talk to model instances. Automatically triggers security-defense-and-mitigation for proactive endpoint defense, authentication, authorization, and input validation. Use when creating CRUD APIs, JWT auth flows, bcrypt password login, route modules, or starter API structures.
---

# API Building

Use this skill when an API should follow this default structure:

- Node.js + Express.
- `express.Router()` modules.
- ESM imports only.
- Named exports only. Never default export.
- `model/` for entity classes and persistence.
- `route/` for API endpoints.
- `helpers/` for utilities that are not routes, middleware, or entities.
- `middleware/` for auth and other pre-route logic.
- Only `GET`, `POST`, `PUT`, and `DELETE` endpoints.
- **Folder names come from the repo, not from this page.** The convention below is the default for a new
  service; in an existing tree you copy what is there. The reference project (`node-aec`) uses `api/` and
  `web/` as separate packages, `route/` and `middleware/` in the singular, and `app.js` at the package root.

## Required Structure

```text
api/                       # package root in the reference project; app.js sits beside the folders
	app.js
	route/
	model/
	helpers/
	middleware/
	locales/<lang>/
	migrations/001_initial_schema.sql
	scripts/migrate.js
	tests/
```

## Responsibility Split

- `app.js`: compose Express, shared middleware, and route mounts.
- `route/*.js`: parse input, validate request data, run request-scoped business logic, and shape HTTP responses.
- `model/*.js`: entity classes, persistence methods, normalization, relation loading.
- `helpers/*.js`: response helpers, database helpers, date utilities, mailers, render helpers, or other support code.
- `middleware/*.js`: device or JWT auth, request guards, and reusable cross-cutting logic.

- Routes talk to model instances, not raw SQL.
- Only models use the database driver.
- A route module builds `const router = Router()`, wraps every handler in `try { … } catch (error) { return next(error); }`, and exports by alias: `export { router as productsRouter };`. Handlers `return res.send({ … })` with the resource named in the payload.
- Domain failures are thrown as `CustomError(status, message, code, data)` from `helpers/error.js`; the error middleware is the only place that renders `{ error, code, message }`.
- A synchronous driver keeps the layering unchanged: handlers stay `async` for consistency, model calls need no `await`, and only the model opens a transaction around a multi-row write — `db.transaction(...)` on `better-sqlite3`, `db.exec('BEGIN')`/`'COMMIT'`/`'ROLLBACK'` wrapped in one `runInTransaction(fn)` helper on `node:sqlite`.
- Tests are `vitest` + `supertest` against the real app object, split into unit and integration configs and driven from `npm test`; migrations run through `npm run db:migrate` → `scripts/migrate.js`.
- Passwords are hashed with `bcrypt`.
- Auth defaults to JWT bearer tokens.
- Helpers are for support logic, not endpoint handlers and not direct entities.
- Keep route logic explicit, but keep persistence and entity behavior inside models.
- **Maintainability & Simplicity**: Default to simple, direct, non-overengineered code. Avoid unnecessary abstraction layers, duplicate helper functions, or excessive complexity. Keep code robust, safe, performant, and easy to maintain.

## Mandatory Security Defense (Auto-Triggered)

Whenever building or refactoring API endpoints, automatically apply [`security-defense-and-mitigation`](../security-defense-and-mitigation/SKILL.md) under the Proactive Security Rule:

1. **Authentication & Password Safety**: Hash all passwords with `bcrypt` (work factor ≥12). Secure JWTs with strong signing secrets from environment variables, explicit expiry (`expiresIn: '1h'`), and store tokens in `HttpOnly; Secure; SameSite=Strict` cookies or standard `Authorization: Bearer` headers.
2. **Authorization & IDOR/BOLA Defense**: Never trust client-supplied resource ownership (e.g. `req.body.userId`, `/users/:id`). Verify that the authenticated session identity matches the target entity's owner before reading, mutating, or deleting rows.
3. **Input Validation & Sanitization**: Validate all `req.params`, `req.query`, and `req.body` inputs in routes before touching models. Disallow mass assignment (whitelist permitted fields). Reject or sanitize malformed, overlong, or unexpected keys.
4. **Injection Prevention**: All SQL queries inside models must use parameterized queries via [`mysql-helper`](../mysql-helper/SKILL.md). Never concatenate user input into SQL strings.
5. **Rate Limiting & Bot Defense**: Apply rate-limiting middleware to auth endpoints (`/login`, `/register`, `/forgot-password`) to prevent brute-forcing.
6. **HTTP Security Headers**: Apply standard security headers (CSP, HSTS, X-Content-Type-Options, X-Frame-Options) across API responses.

## Runtime facts that cost a round

- **Native modules and the wrong Python.** `node-gyp` uses the `python3` on `PATH`; inside an agent's
  virtualenv that interpreter has no `gyp` module, and `npm install better-sqlite3` dies in a gyp trace that
  reads like a broken toolchain. Pin the system interpreter in the project's `.npmrc`
  (`python=/usr/bin/python3`) and keep that file out of version control when the path is host-specific.
  The compile itself needs `make` and `g++`, which are usually already there.
- **`node:sqlite` is a valid first choice, not only a fallback.** Node ≥22.5 ships `DatabaseSync`; it needs no
  native build, no `python3`/`make` and no ABI to re-break on a Node upgrade, which is enough reason for a
  project to pick it deliberately over `better-sqlite3`. It is still experimental, so keep it behind a single
  `helpers/sqlite.js` and the swap back is one file. Deltas proven against `better-sqlite3`: `run()` returns
  `{ changes, lastInsertRowid }`; rows come back as **null-prototype objects** (spread `{ ...row }` before
  `toJSON` or `hasOwnProperty`); there is **no `db.transaction()`** and **no `.backup()`** (back up with
  `sqlite3 .backup` or `VACUUM INTO`); `PRAGMA journal_mode=WAL`, `foreign_keys`, `busy_timeout`,
  `synchronous=FULL` and JSON1 all work.
- **Bind address in a container.** Behind a sidecar tunnel or reverse proxy, the app binds `0.0.0.0`
  **inside** the container while the published port is `127.0.0.1` on the host and the proxy targets the
  service name on the compose network. `HOST=127.0.0.1` inside the container is a config that runs and
  answers nothing — the failure only shows up after deploy, as a 502 from the tunnel.
- **A renderer that writes through the API must sign the API's own origin.** When the API validates
  `Origin`/`Referer` on writes and the server-rendered app calls it server-to-server, the renderer sends the
  **public** origin value — not its internal container URL, not `localhost`, and not nothing. Ship the same
  variable (`PUBLIC_ORIGIN`) in both services' env and in `.env.example`: with it missing on one side every
  POST answers 403 while every GET, unit test and smoke check stays green, and the symptom surfaces as
  "não consegui salvar" on the first screen that writes.
- **A 403 on writes from your own harness is usually the harness.** An app that enforces double-submit
  CSRF (`X-CSRF-Token` derived from the session token, typically only when `NODE_ENV=production`) answers a
  scripted POST with exactly the same `403 CSRF_FAILED` as a genuine misconfigured origin — and relaxing the
  server check to make the script pass weakens every write in the product. Send the full header set a
  browser sends (cookie, `Origin` equal to the public origin, the CSRF header with the app's own
  derivation, `Idempotency-Key`) before reading the middleware; if the fix survives only because the test
  changed, revert it.
- **A listening port is not proof your app is there.** Before choosing a port for a harness and again after
  starting the service, check `ss -ltnp | grep :<port>` and assert the response names your app (title, health
  payload). A container publishing that port answers 200 with a different project's page, and the browser
  session then exercises the wrong app end to end.
- **Verify a native install by using it, not by the log.** `node -e "new (require('better-sqlite3'))(':memory:')"`
  plus one `CREATE TABLE`/`SELECT` settles it in a second; `npm install` printing "added N packages" does
  not.
- **Transient checks belong INSIDE the idempotent mutation, never before it.** A resource that can expire
  or be purged between the check and the write (an attachment, a reserved slot, a token) fails this way:
  the first call validates, commits and stores its 201 response; the replay arrives after the resource
  expired, the pre-check rejects it, and the client gets 410 for a write that succeeded. Validate the
  transient condition inside the callback the idempotency layer replays, so a replay returns the stored
  response and only a genuinely new mutation re-checks.
- **Exclusivity needs a constraint, not a pre-check.** "This document may be linked to only one parent"
  written as `SELECT … ; if (none) INSERT` has a window and, worse, survives reviews because the happy
  path works: two parents end up sharing the child. Put the rule in the write path — a unique index, or
  the check and the insert inside one transaction — and test the second binding, not the first.
- **Dropping a capability means removing its surface, not flagging it off.** When a feature is cut — a
  reader, an integration, a background worker — delete its route, model, provider client and job table
  (with a new idempotent `DROP TABLE IF EXISTS` migration for bases that already received it), and let the
  tests that covered it go with it. A `FEATURE_ENABLED=false` path that still knows how to call an external
  provider is debt with no expiry: it stays compiled, a stray job can still reach it, and the next reader
  treats it as supported. Keep what is still used — an upload endpoint outlives the reader that consumed
  its files.
- **A health endpoint that only proves the process is alive is a lie that ages well.** `/ready` answering
  `{ ready: true }` from a listener with no dependency check hides a database whose schema was never
  applied and an integration nobody paired, for months, while every monitor stays green. Probe what the
  service needs to do its job, under a short deadline (a `SELECT 1` plus a zero-row read of each table the
  routes write, and the capability flag the feature depends on), answer `false` with an explicit list of
  `reasons`, and keep HTTP 200 so an external monitor can read the payload instead of flipping status
  codes. Also expose the counter a human needs to disambiguate (`readySessionIds`, not just a count) —
  and never let a later failure mode be silent: a background loop that returns before touching the
  database logs nothing and looks idle while the scheduler is dead.

## Endpoint Pattern

Prefer this request flow:

1. Read params, query, and body in the route.
2. Validate the required inputs in the route.
3. Instantiate the relevant model class.
4. Call model methods.
5. Return JSON through response helpers.

## Error Response Format

**Precedence first: if the product spec defines an envelope, the spec wins — including when it is nested
and this section is not.** The shape below is the house default for a service with no contract of its own;
a house style copied over a written contract is a review rejection, not a style choice, and the failure is
silent for every client that reads `error.code`.

Error responses emitted by API error middleware must return HTTP status codes along with machine-readable error codes (`code`) and default messages (`error`, `message`) to enable frontend localization:

```json
{
  "error": "Name is required.",
  "code": "NAME_REQUIRED",
  "message": "Name is required."
}
```

Include a stable, machine-readable `code` string in all 4xx/5xx responses so frontend clients can map error codes to localized translation files.

## References

- Read `references/architecture.md` for the generic architecture rules.
- Read `references/mini-project/` for a small starter API that follows this structure.
- Pair this with [`security-defense-and-mitigation`](../security-defense-and-mitigation/SKILL.md), [`clean-code-and-oop`](../clean-code-and-oop/SKILL.md), [`mysql-helper`](../mysql-helper/SKILL.md), [`entity-models`](../entity-models/SKILL.md), and [`web-frontend`](../web-frontend/SKILL.md) when needed.
