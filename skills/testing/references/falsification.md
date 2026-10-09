# Falsification — What Makes a Test Worth Keeping

Tests live at seams: public boundaries where behavior is observed without reaching inside. Agree seams with the user before writing. No test at an unconfirmed seam.

## Anti-patterns with mechanical cues

Reject on sight in authoritative tests. Each cue is grep-able for Designer/Reviewer prompts.

- **Implementation-coupled** — mocks own modules, tests privates, or verifies via side channel (DB query instead of public getter). Tell: breaks on refactor with no behavior change.
  - Cue: `jest.mock(<own-module>)`, `private`, `db.query.*SELECT` inside a test for an interface that returns the object.
- **Tautological** — expected recomputed the way code computes it, so it passes by construction.
  - Cue: `const expected = .*(\.reduce|\.map|\.filter).*` followed by `expect\(.*\)\.toBe\(expected\)`; `expect\(.*\)\.toBe\([a-z]+\s*[+\-*/]`.
  - Fix: independent known literal from contract.
- **Shallow / existential** — asserts presence or call count instead of exact state.
  - Cue: `expect\(.*\)\.toBeDefined\(\)`, `toBeTruthy\(\)`, sole `toHaveBeenCalled\(\)` as correctness proof.
  - Fix: assert exact values, shapes, or state transitions.
- **Mirror / sycophantic** — expected edited post-hoc to match actual, or snapshots auto-bless output.
  - Ban in authoritative: `toMatchSnapshot()`, `toMatchInlineSnapshot()`, `-u`, `--updateSnapshot`. Snapshot changes require a Test Change Request.
- **Horizontal slicing** — all tests up front from imagined shape. Work in vertical slices: one seam, one test, one minimal impl per cycle. Each test is a tracer bullet responding to the last result.

## GOOD / BAD pairs

```typescript
// BAD: status-only, passes for wrong items or no charge
test("checkout confirms", async () => {
  const result = await checkout(cart, pay);
  expect(result.status).toBe("confirmed");
});

// GOOD: exact contract against independent literals
test("user can checkout with valid cart", async () => {
  cart.add({ id: "prod_1", price: 20 });
  cart.add({ id: "prod_2", price: 25 });
  const result = await checkout(cart, pay);
  expect(result).toEqual({
    status: "confirmed", subtotal: 45, itemCount: 2,
    orderId: "ord_101", chargeId: "ch_999",
  });
});
```

```typescript
// BAD: recomputed oracle
const expected = items.reduce((s, i) => s + i.price, 0);
expect(calculateTotal(items)).toBe(expected);

// GOOD: independent literal
expect(calculateTotal([{ price: 10 }, { price: 5 }])).toBe(15);
```

```typescript
// BAD: verifies through side channel + existential
await createUser({ name: "Alice" });
const row = await db.query("SELECT * FROM users WHERE name=?", ["Alice"]);
expect(row).toBeDefined();

// GOOD: verifies through interface with exact value
const user = await createUser({ name: "Alice" });
expect(await getUser(user.id)).toMatchObject({ name: "Alice" });
```

## Falsification Triad (per seam)

1. **Golden happy path** — primary rule with hardcoded literal from contract.
2. **Boundary / edge** — threshold - 1, threshold, + 1; empty; max/min; timezone cutoff.
3. **Negative / rejection** — invalid input, missing auth, invariant violation must explicitly reject with expected error/status.

Example:

```typescript
describe("applyDiscountCoupon", () => {
  test("applies 20% on eligible subtotal", () => {
    expect(applyDiscount({ subtotal: 100, coupon: "SAVE20" }))
      .toEqual({ subtotal: 100, discount: 20, total: 80 });
  });
  test("rejects $99.99 below $100 threshold", () => {
    expect(applyDiscount({ subtotal: 99.99, coupon: "SAVE20" }))
      .toEqual({ subtotal: 99.99, discount: 0, total: 99.99 });
  });
  test("throws on expired coupon", () => {
    expect(() => applyDiscount({ subtotal: 150, coupon: "EXPIRED20" }))
      .toThrow(InvalidCouponError);
  });
});
```

## Sabotage Litmus (Designer-picked)

Before accepting green, Designer or Reviewer picks 2-3 invariants (never the implementer):

- flip boundary (`>=` to `>`), omit guard/auth check, return empty/dummy.
- Each mutation must turn the suite RED. Any silent pass = toothless suite, harden before acceptance.

## Mock only at system boundaries

Mock external APIs, time/randomness, and optionally FS/DB (prefer real test DB). Never mock own classes or internal collaborators.

Design for mockability with dependency injection and SDK-style interfaces (one function per external operation), so mocks return one shape without conditional logic.
