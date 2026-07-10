---
name: mysql-helper
description: Build or refactor MySQL access layers that expose public helper methods such as find, get, insert, update, delete, and dump; keep any raw executor private inside the helper; and ensure only model classes use the driver. Use when adding database access, CRUD methods, filter handling, or base model infrastructure.
---

# MySQL Helper

Use this skill when database access should follow a strict helper-driven pattern.

## Rules

- Only models use the MySQL helper.
- Routes, middleware, and general helpers must not call a raw query executor.
- The helper's public API should expose methods like `find`, `get`, `insert`, `update`, `delete`, and `dump`.
- If a low-level executor exists, keep it private to the helper implementation.
- Prefer a `mysql2/promise` pool manager and `CustomError` wrapper for SQL failures.

## Recommended Shape

- one shared connection or pool manager
- one public CRUD-oriented helper surface
- one base model wrapping that helper
- entity-specific model classes extending the base behavior

## References

- Read `references/mysql-helper.md` for the generic rules.
- Read `references/mini-project/` for a small starter helper and base model.