# Commands — Discovery, Scope, and Browser Proof

## Runtime discovery

Derive from manifests, never assume:

1. Check `package.json`, `pyproject.toml` / `setup.cfg`, `Cargo.toml` / `go.mod`, `docker-compose.yml`.
2. Native runtimes present (`node`, `python`, `cargo`, `go`) → prefer native runner.
3. Compose-declared only → discover services first, then substitute `<service>`:
   ```bash
   docker compose config --services
   docker compose run --rm <service> <test-command>
   ```

## Framework selection

- **Node:** if `package.json` shows `vitest`/`jest`, use it. Unit scope default; no integration/browser unless requested or UI-affecting.
- **Python:** if `pyproject.toml` / `requirements.txt` shows `pytest`, use it.
- **Go/Rust:** `go test ./...`, `cargo test`.
- **No runner:** if permitted, bootstrap the lightest conventional runner; else ship a manual checklist and name the automation gap. If user forbids setup changes, never bootstrap.

Standard invocations (check provider/config first, never bootstrap without permission):

```bash
# Node (native) — requires vitest/jest; --coverage requires @vitest/coverage-* or equivalent
npx vitest run tests/authoritative
npx vitest run tests/work
npx vitest run tests/authoritative --coverage   # seam info only, not a gate

# Python (native) — --cov requires pytest-cov
pytest tests/authoritative/
pytest tests/work/
pytest tests/authoritative/ --cov=src/touched_module

# Compose (after service discovery)
docker compose run --rm <service> npx vitest run tests/authoritative
docker compose run --rm <service> pytest tests/authoritative/
```

If the coverage provider or `pytest-cov` is absent, skip coverage and use Fast Sabotage. Do not install without permission.

Scoped mutation only when configured (`stryker.conf.*` present), always bounded:

```bash
npx stryker run --mutate "src/features/<slice>/**/*.ts"
```

Unconfigured → Fast Sabotage per `verification.md`. Never unconstrained repo-wide mutation.

## Scope rule

- Default: unit tests only during AI tasks.
- Integration / E2E / Playwright smoke only on explicit request, or when the diff touches rendered UI, routes, redirects, storage, uploads, or auth flows.
- Lint/typecheck (`npm run lint`, `tsc --noEmit`) are hygiene, not behavior proof.

## Browser proof (UI-affecting changes only)

When the change affects what a user sees or clicks, automated DOM assertions alone are insufficient. Exercise the flow in a real browser session:

- happy path end-to-end from visible controls
- boundary inputs, validation, busy, error, and empty states
- redirect/auth/token behavior, deep-link and back-button state
- console clean (no new uncaught errors), network payloads normalized, storage set/cleared correctly
- responsive spot-check (narrow + desktop) and keyboard/focus path for changed controls

Stub or intercept destructive side effects (charge, email, prod mutation). If the app cannot be opened safely, state the blocker and do the deepest code-and-test audit instead. Full checklist lives with `ui-ux-auditor` for product audits; above is the delivery gate for code changes.
