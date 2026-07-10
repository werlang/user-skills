---
name: tdd-workflow
description: Test-Driven Development workflow. Use when implementing features, refactoring code, or fixing bugs. Follow the red-green-refactor cycle: write failing tests first, implement minimal code to pass tests, verify all tests pass, then refactor. Apply this for backend, frontend, CLI, and full-stack work.
---

# Test-Driven Development (TDD) Workflow

## Overview

Test-Driven Development follows a cyclical approach that ensures code quality, maintainability, and confidence. The core loop is:

1. **Red** - Write a failing test that defines desired behavior
2. **Green** - Write minimal code to make the test pass
3. **Refactor** - Improve code quality while keeping tests green
4. **Repeat** - Continue until feature is complete

## When to Apply TDD

- Implementing new features or API endpoints
- Fixing bugs (write a test that reproduces the bug first)
- Refactoring existing code
- Adding complex business logic
- Cross-platform or multi-service work

Applicable to: Node.js/Express APIs, React/Vue frontends, Python services, TypeScript projects, CLI tools, database migrations, and any testable code.

## Core Workflow

### Phase 1: Red (Write Failing Test)

1. **Understand the requirement** - What behavior should be tested?
2. **Choose test framework** - Use project's existing test framework (Jest, Vitest, Mocha, pytest, etc.)
3. **Write the test** - Define:
   - **Input/Setup**: What data or state is needed?
   - **Action**: What function/method is called?
   - **Assertion**: What should the result be?
4. **Verify it fails** - Run the test and confirm it fails with a clear error message

Example structure:
```javascript
describe('Feature: User login', () => {
  it('should return JWT token when credentials are valid', async () => {
    const user = { email: 'test@example.com', password: 'password123' };
    const result = await login(user);
    expect(result.token).toBeDefined();
    expect(result.user.email).toBe(user.email);
  });
});
```

### Phase 2: Green (Write Minimal Code)

1. **Implement the simplest solution** - Write only enough code to make the test pass
2. **Avoid over-engineering** - Don't optimize or add features not required by the test
3. **Run the test** - Verify it passes
4. **Run all tests** - Ensure no regression in other tests

Example minimal implementation:
```javascript
async function login(credentials) {
  // Just enough to pass the test
  if (credentials.email && credentials.password) {
    return {
      token: 'jwt-token-here',
      user: { email: credentials.email }
    };
  }
}
```

### Phase 3: Refactor (Improve Quality)

1. **Keep tests passing** - Run tests after each change
2. **Improve code quality**:
   - Remove duplication
   - Extract helper functions
   - Clarify naming
   - Simplify logic
3. **Verify all tests still pass** - No regressions

Example refactored code:
```javascript
async function login(credentials) {
  validateLoginInput(credentials); // Extract validation
  const user = await db.findUser(credentials.email); // Extract DB call
  const isValid = await verifyPassword(credentials.password, user.password);
  
  if (!isValid) throw new AuthError('Invalid credentials');
  
  return {
    token: generateJWT(user),
    user: sanitizeUserObject(user)
  };
}
```

## Patterns by Domain

### Backend/API (Express, FastAPI, etc.)

**Test structure:**
```javascript
describe('POST /api/users', () => {
  it('should create user and return 201 with user object', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'new@example.com', name: 'John' });
    
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });
});
```

**Typical loop:**
1. Write test for endpoint behavior (status, response shape, validation)
2. Implement route handler + business logic
3. Refactor: extract helpers, add middleware, improve error handling

### Frontend (React, Vue, etc.)

**Test structure:**
```javascript
describe('LoginForm component', () => {
  it('should submit form when credentials are entered', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    
    await userEvent.type(screen.getByPlaceholderText(/email/), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: /submit/ }));
    
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ email: 'test@example.com' }));
  });
});
```

**Typical loop:**
1. Write test for user interaction (clicks, input, navigation)
2. Implement component to handle interaction
3. Refactor: extract sub-components, improve styling, add accessibility

### Database/Migration

**Test structure:**
```javascript
describe('User migration', () => {
  it('should add email_verified column with default false', async () => {
    await runMigration();
    const columns = await db.query("DESCRIBE users");
    expect(columns).toContainEqual(expect.objectContaining({ Field: 'email_verified' }));
  });
});
```

## Best Practices

1. **One assertion focus** - Each test should verify one behavior
2. **Clear test names** - Describe what is being tested and expected outcome
3. **Test edge cases** - Valid input, invalid input, boundary conditions, error states
4. **Avoid test interdependencies** - Each test should be independent and runnable in any order
5. **Use descriptive variables** - Make test data meaningful to understand what is being tested
6. **Mock external dependencies** - Mock APIs, databases, file systems; test in isolation
7. **Keep tests fast** - Unit tests should run in milliseconds; avoid heavy I/O when possible

## Common Test Scenarios

| Scenario | What to Test |
|----------|--------------|
| Function/method | Input validation, return value, side effects, error cases |
| API endpoint | Status code, response shape, validation errors, authorization |
| Component | User interactions, rendering output, state changes, accessibility |
| Database query | Correct data returned, filtering, sorting, edge cases |
| Integration | Multiple components working together, end-to-end flow |

## Testing Tools & Frameworks

- **JavaScript/TypeScript**: Jest, Vitest, Mocha, Chai, Supertest (API testing)
- **React/Vue**: Vitest, React Testing Library, Playwright (e2e)
- **Python**: pytest, unittest, nose
- **Database**: Database-specific test utilities, transaction rollback for isolation

## Iteration Loop

For each feature/bug fix:

1. **Write comprehensive failing tests** - Cover happy path, edge cases, errors
2. **Implement features** - Red → Green → Refactor for each test
3. **Run full test suite** - Ensure no regressions
4. **Update documentation** - If behavior changed
5. **Commit with passing tests** - Each commit should have all tests green

## When TDD Becomes Testing

If you find yourself writing only a few tests for code that is already implemented, you've shifted from TDD to testing. In that case:
- Use the `test-first-delivery-generalized` skill for existing codebases
- Focus on regression testing and critical paths
- Still apply TDD for new features going forward

## References

- Test-first planning ensures requirements clarity before coding
- Tests serve as living documentation of expected behavior
- Refactoring with a safety net (tests) prevents regressions
- TDD often results in simpler, more modular code
