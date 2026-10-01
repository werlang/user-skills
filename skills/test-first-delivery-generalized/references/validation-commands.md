# Validation Commands Reference

This reference documents standard commands to run tests, check coverage, and validate builds across native and containerized environments.

> [!IMPORTANT]
> **Runtime Discovery Rule**:
> 1. Check for project manifests (`package.json`, `pyproject.toml`, `Cargo.toml`, `docker-compose.yml`).
> 2. If native runtimes are present (`node`, `python`, `cargo`), prefer running the project's native runner.
> 3. If the host environment lacks local runtimes or the project uses Docker Compose, discover service names with `docker compose config --services` and substitute `<service>` below (e.g. `api`, `web`, `app`).

---

## 1. Node.js / TypeScript (Vitest / Jest)

### Native Execution (when Node is present)
```bash
# Run authoritative unit tests only
npx vitest run tests/authoritative
# Run development work probes
npx vitest run tests/work
# Run with coverage on touched seam
npx vitest run tests/authoritative --coverage
```

### Containerized Execution (when Compose or container is declared)
```bash
# Discover services first:
docker compose config --services

# Run authoritative tests:
docker compose run --rm <service> npm test -- tests/authoritative
# or with direct vitest:
docker compose run --rm <service> npx vitest run tests/authoritative
```

### Scoped Mutation Verification (Stryker)
> Run only if `stryker.conf` exists or after configuration. Always scope to touched files:
```bash
# Native:
npx stryker run --mutate "src/features/order-cancellation/**/*.ts"

# Containerized:
docker compose run --rm <service> npx stryker run --mutate "src/features/order-cancellation/**/*.ts"
```
*If Stryker is unconfigured, perform the Fast Sabotage Litmus Test (perturb 2–3 invariants by hand; verify every mutation fails the test).*

---

## 2. Python (Pytest)

### Native Execution (when Python is present)
```bash
# Run authoritative unit tests
pytest tests/authoritative/
# Run work tests
pytest tests/work/
# Run with seam coverage
pytest tests/authoritative/ --cov=src/touched_module
```

### Containerized Execution
```bash
docker compose run --rm <service> pytest tests/authoritative/
```

---

## 3. Authoritative Freeze Guard (Canonical)

The orchestrator executes this single, authoritative check before accepting any implementer output:

```bash
git diff --name-only HEAD -- tests/authoritative | grep -q . && echo "DENIED: authoritative touched by implementer" && exit 1
```

If the repository uses an established alternative directory layout (e.g. `tests/**/authoritative/**`), adapt the path pattern in the guard accordingly.

---

## 4. Linting & Formatting Checks

Verify code style without executing integration suites:

```bash
# Native:
npm run lint

# Containerized:
docker compose run --rm <service> npm run lint
```
