# MySQL Helper Reference

This reference defines a reusable MySQL access pattern.

## Public Driver Methods

- `connect(config)`
- `close()`
- `find(table, { filter, view, opt })`
- `get(table, filter, options)`
- `insert(table, data)`
- `update(table, data, id)`
- `delete(table, clause, opt)`
- `raw(sqlFragment)`
- `format(sql, data)`
- `dump(path, options)`
- helper builders: `like()`, `between()`, `ne()`, `lt()`, `gt()`, `lte()`, `gte()`

## Rules

- Model classes use only the public driver methods.
- Routes never build SQL strings directly.
- Keep low-level SQL execution private inside the helper.
- Put serialization and normalization in model classes, not in routes.
- Use the shared pool manager for all queries, and close it only in teardown contexts.
- Wrap SQL execution failures with a custom error that preserves the original SQL and parameter values.

## Bootstrap

- Start from `references/mini-project/src/helpers/mysql.js`.
- Pair it with `references/mini-project/src/model/model.js`.