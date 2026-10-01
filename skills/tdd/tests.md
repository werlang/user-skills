# Good and Bad Tests

## Good Tests

**Integration-style**: Test through real interfaces, not mocks of internal parts.

```typescript
// GOOD: Tests observable behavior and verifies contract against independent literals
test("user can checkout with valid cart", async () => {
  const cart = createCart();
  cart.add({ id: "prod_1", price: 20 });
  cart.add({ id: "prod_2", price: 25 });
  const result = await checkout(cart, paymentMethod);
  expect(result).toEqual({
    status: "confirmed",
    orderId: "ord_101",
    subtotal: 45,
    itemCount: 2,
    chargeId: "ch_999",
  });
});
```

Characteristics:

- Tests behavior users/callers care about
- Uses public API only
- Survives internal refactors
- Describes WHAT, not HOW
- Verifies exact contract values against independent literals (rejects status/shape-only checks)
- One logical assertion per test

## Bad Tests

**Implementation-detail tests**: Coupled to internal structure.

```typescript
// BAD: Tests implementation details
test("checkout calls paymentService.process", async () => {
  const mockPayment = jest.mock(paymentService);
  await checkout(cart, payment);
  expect(mockPayment.process).toHaveBeenCalledWith(cart.total);
});
```

Red flags:

- Mocking internal collaborators
- Testing private methods
- Asserting on call counts/order
- Test breaks when refactoring without behavior change
- Test name describes HOW not WHAT
- Verifying through external means instead of interface

```typescript
// BAD: Bypasses interface to verify
test("createUser saves to database", async () => {
  await createUser({ name: "Alice" });
  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(row).toBeDefined();
});

// GOOD: Verifies through interface
test("createUser makes user retrievable", async () => {
  const user = await createUser({ name: "Alice" });
  const retrieved = await getUser(user.id);
  expect(retrieved.name).toBe("Alice");
});
```

**Tautological tests**: Expected value restates the implementation, so the test passes by construction.

```typescript
// BAD: Expected value is recomputed the way the code computes it
test("calculateTotal sums line items", () => {
  const items = [{ price: 10 }, { price: 5 }];
  const expected = items.reduce((sum, i) => sum + i.price, 0);
  expect(calculateTotal(items)).toBe(expected);
});

// GOOD: Expected value is an independent, known literal
test("calculateTotal sums line items", () => {
  expect(calculateTotal([{ price: 10 }, { price: 5 }])).toBe(15);
});
```

**Shallow / Existential tests**: Asserts mere presence or shape rather than correctness.

```typescript
// BAD: Passes even if data is corrupted, empty, or defaulted
test("fetchUserProfile returns profile", async () => {
  const profile = await fetchUserProfile("usr_123");
  expect(profile).toBeDefined();
  expect(typeof profile.email).toBe("string");
});

// GOOD: Asserts exact contract and observable state against known literals
test("fetchUserProfile returns verified user attributes", async () => {
  const profile = await fetchUserProfile("usr_123");
  expect(profile).toEqual({
    id: "usr_123",
    email: "alice@example.com",
    tier: "premium",
    isActive: true,
  });
});
```

## The Falsification Triad Example

Every seam should feature the triad to prevent single-path confirmation bias:

```typescript
describe("applyDiscountCoupon", () => {
  // 1. Golden Happy Path: independent literal from spec
  test("applies 20% discount on eligible subtotal", () => {
    const order = { subtotal: 100, coupon: "SAVE20" };
    expect(applyDiscount(order)).toEqual({ subtotal: 100, discount: 20, total: 80 });
  });

  // 2. Boundary / Edge Case: exact threshold transition
  test("does not apply discount when subtotal is strictly below threshold ($99.99)", () => {
    const order = { subtotal: 99.99, coupon: "SAVE20" };
    expect(applyDiscount(order)).toEqual({ subtotal: 99.99, discount: 0, total: 99.99 });
  });

  // 3. Negative / Rejection Case: invalid or forbidden input
  test("throws InvalidCouponError when coupon is expired", () => {
    const order = { subtotal: 150, coupon: "EXPIRED20" };
    expect(() => applyDiscount(order)).toThrow(InvalidCouponError);
  });
});
```

## The Sabotage (Mutation) Litmus Test Example

Before committing tests, deliberately sabotage the implementation to verify your tests catch real defects:

```typescript
// 1. Invert the boundary in production:
//    From: if (subtotal >= 100)
//    To:   if (subtotal > 100)
//    Result: Test "applies 20% discount on eligible subtotal" ($100) MUST FAIL.

// 2. Remove the rejection branch:
//    From: if (coupon.isExpired) throw new InvalidCouponError()
//    To:   // omitted
//    Result: Test "throws InvalidCouponError when coupon is expired" MUST FAIL.

// If tests stay GREEN during sabotage, the test suite is toothless.
```
