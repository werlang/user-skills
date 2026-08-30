# Refactoring Catalog & Recipes

This guide documents proven, disciplined refactoring techniques (derived from Martin Fowler's *Refactoring* and Clean Code principles) to eliminate code smells without changing observable behavior.

---

## 1. The Refactoring Workflow

```text
[Existing Working Code]
       │
       ▼
1. Ensure Unit Test Suite Passes (Green)
       │
       ▼
2. Identify Specific Code Smell (Long Method, Large Class, Feature Envy, Primitive Obsession)
       │
       ▼
3. Check Production Baseline vs. In-Flight:
   - In-Flight / Not in main: Hard replace cleanly (delete old code, zero legacy fallbacks).
   - In main: Safe evolutionary transition.
       │
       ▼
4. Apply Atomic Refactoring Step
       │
       ▼
5. Run Tests -> Green -> Repeat
```

---

## 2. Core Refactoring Recipes

### Recipe A: Extract Function / Method
**Smell:** Long method doing multiple things or containing an inline comment explaining what a code chunk does.

```javascript
// 🔴 Before: mixed concerns and inline explanations
async function handleUserRegistration(req, res) {
    const { email, password, name } = req.body;
    
    // validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        throw new CustomError(400, 'Invalid email format', 'INVALID_EMAIL');
    }
    
    // hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // save user
    const user = await User.create({ email, passwordHash, name });
    res.status(201).json({ id: user.publicId });
}

// 🟢 After: clear intention with extracted helper methods
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        throw new CustomError(400, 'Invalid email format', 'INVALID_EMAIL');
    }
}

async function handleUserRegistration(req, res) {
    const { email, password, name } = req.body;
    validateEmail(email);
    const user = await User.register({ email, password, name });
    res.status(201).json({ id: user.publicId });
}
```

---

### Recipe B: Replace Primitive / Parameter List with Options Object
**Smell:** Functions with 3+ positional arguments or primitives passing around cohesive data together.

```javascript
// 🔴 Before: error-prone positional arguments
async function createPresignedUrl(key, bucket, ttl, isAttachment, filename, region) {
    // ...
}
// Easy to mix up argument positions:
await createPresignedUrl('doc.pdf', 'my-bucket', 300, true, 'download.pdf', 'us-east-1');

// 🟢 After: named options object with sensible defaults
export async function createPresignedUrl({
    key,
    bucket,
    fileName,
    ttlSeconds = 300,
    isAttachment = false,
    region = 'auto',
}) {
    // ...
}
// Clear, order-independent call site:
await createPresignedUrl({
    key: 'doc.pdf',
    bucket: 'my-bucket',
    fileName: 'download.pdf',
    isAttachment: true,
});
```

---

### Recipe C: Replace Conditional with Guard Clauses
**Smell:** Deeply nested `if/else` ladders (arrow anti-pattern).

```javascript
// 🔴 Before: nesting obscures the happy path
function calculateShipping(order) {
    let result;
    if (order.isInternational) {
        result = order.weight * 15;
    } else {
        if (order.isExpress) {
            result = 25;
        } else {
            if (order.total > 100) {
                result = 0;
            } else {
                result = 10;
            }
        }
    }
    return result;
}

// 🟢 After: flat, linear guard clauses
export function calculateShipping(order) {
    if (order.isInternational) {
        return order.weight * 15;
    }
    if (order.isExpress) {
        return 25;
    }
    if (order.total > 100) {
        return 0;
    }
    return 10;
}
```

---

### Recipe D: Rule of Three (Pragmatic DRY)
**Smell:** Abstracting too early on the first duplicate block, resulting in premature, confusing abstractions.

- **1st Occurrence:** Write the straightforward, clean implementation.
- **2nd Occurrence:** Copy the localized code. Inspect differences. Keep it localized.
- **3rd Occurrence:** Extract a cohesive, well-named helper or class.

> "A little duplication is far cheaper than the wrong abstraction."
