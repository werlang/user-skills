# Validation Commands Reference

This reference documents standard commands to run tests, check coverage, and validate builds.

> [!IMPORTANT]
> **No Local Runtimes**: Since the host environment lacks local Python or Node.js runtimes, all verification commands must be executed using Docker containers.

## 1. Node.js & Vitest / Jest (API Container)

To run backend tests and check code coverage:

### Run unit tests in the container:
```bash
docker compose run --rm api npm run test
```
*Alternative (direct Docker run):*
```bash
docker run --rm -v $(pwd):/app -w /app node:18-alpine npm run test
```

### Run specific test files:
```bash
docker compose run --rm api npx vitest run path/to/file.test.js
```

### Run tests with coverage:
```bash
docker compose run --rm api npm run test:coverage
```

---

## 2. Web UI / Playwright (Web Container)

To run frontend components or integration tests:

### Run unit tests from the web container:
```bash
docker compose run --rm web npm run test:unit
```
*Alternative (direct Docker run):*
```bash
docker run --rm -v $(pwd):/app -w /app node:18-alpine npm run test:unit
```

### Run Playwright E2E/Component tests (if configured):
```bash
docker compose run --rm web npx playwright test
```

---

## 3. Python Services & Pytest

To run tests in Python environments:

### Run all pytest tests:
```bash
docker compose run --rm service pytest
```
*Alternative (direct Docker run):*
```bash
docker run --rm -v $(pwd):/app -w /app python:3.10-slim pytest
```

### Run with coverage reporting:
```bash
docker compose run --rm service pytest --cov=.
```

---

## 4. Linting & Formatting Checks

Ensure code style matches repository conventions:

### Run linter:
```bash
docker compose run --rm api npm run lint
```
*Alternative:*
```bash
docker run --rm -v $(pwd):/app -w /app node:18-alpine npm run lint
```
