# OOP Patterns and Anti-Patterns Guide

This reference provides concrete before-and-after architectural examples illustrating core Object-Oriented Programming (OOP) and Clean Code design patterns.

---

## 1. Rich Domain Model vs. Anemic Domain Model

### ❌ Anti-Pattern: Anemic Domain Model (Data Bag + Controller Logic)
In an anemic model, classes are mere property holders with getters/setters, while business validation and state rules are scattered across controllers or services.

```javascript
// ❌ Anemic Model: dumb data container
class Product {
    constructor(id, title, status, versions = []) {
        this.id = id;
        this.title = title;
        this.status = status; // 'draft', 'published', 'archived'
        this.versions = versions;
    }
}

// ❌ Controller / Route has to manage all domain invariants:
router.post('/products/:id/publish', async (req, res) => {
    const product = await productRepo.findById(req.params.id);
    if (!product) throw new CustomError(404, 'Product not found');

    // Leaked business rules in controller:
    if (product.status === 'published') {
        throw new CustomError(400, 'Product is already published');
    }
    if (product.versions.length === 0) {
        throw new CustomError(400, 'Cannot publish product without versions');
    }
    if (!product.title || product.title.trim().length === 0) {
        throw new CustomError(400, 'Title required');
    }

    product.status = 'published';
    await productRepo.update(product);
    res.json({ success: true });
});
```

### ✅ Best Practice: Rich Domain Entity (Encapsulated Behavior)
The entity encapsulates its own validation, business invariants, and state transitions.

```javascript
// ✅ Rich Entity: owns state and invariant enforcement
export class Product extends Model {
    /**
     * Publishes the product if all domain invariants are satisfied.
     * @returns {Promise<void>}
     */
    async publish() {
        if (this.status === 'published') {
            throw new CustomError(400, 'Product is already published', 'ALREADY_PUBLISHED');
        }
        if (!this.title?.trim()) {
            throw new CustomError(400, 'Product title is required to publish', 'TITLE_REQUIRED');
        }
        const versionCount = await this.countVersions();
        if (versionCount === 0) {
            throw new CustomError(400, 'Cannot publish product without active versions', 'NO_VERSIONS');
        }

        this.status = 'published';
        await this.update({ status: this.status });
    }
}

// ✅ Thin Controller: delegates directly to the rich entity
router.post('/products/:publicId/publish', async (req, res) => {
    const product = await Product.findByPublicId(req.params.publicId);
    if (!product) throw new CustomError(404, 'Product not found', 'NOT_FOUND');

    await product.publish();
    res.json({ status: product.status });
});
```

---

## 2. Polymorphism / Strategy vs. Type-Branching Ladders

### ❌ Anti-Pattern: Sprawling `switch` / `if` Ladders
Adding a new type requires modifying every switch statement across the codebase (violating Open/Closed Principle).

```javascript
// ❌ Switch ladder across methods
function calculateDiscount(user, orderAmount) {
    switch (user.role) {
        case 'student':
            return orderAmount * 0.20;
        case 'partner':
            return orderAmount * 0.15;
        case 'vip':
            return orderAmount * 0.30;
        default:
            return 0;
    }
}

function getMaxDownloadSpeed(user) {
    switch (user.role) {
        case 'student':
            return 50;
        case 'partner':
            return 100;
        case 'vip':
            return 500;
        default:
            return 10;
    }
}
```

### ✅ Best Practice: Strategy Objects / Polymorphic Handlers
Create cohesive strategy objects or handlers with a common contract. New types can be added without modifying existing code.

```javascript
// ✅ Strategy / Tier Handlers with uniform contract
const DISCOUNT_TIERS = {
    student: {
        calculateDiscount: (amount) => amount * 0.20,
        maxDownloadSpeed: 50,
    },
    partner: {
        calculateDiscount: (amount) => amount * 0.15,
        maxDownloadSpeed: 100,
    },
    vip: {
        calculateDiscount: (amount) => amount * 0.30,
        maxDownloadSpeed: 500,
    },
    standard: {
        calculateDiscount: () => 0,
        maxDownloadSpeed: 10,
    },
};

export function getTierPolicy(role) {
    return DISCOUNT_TIERS[role] ?? DISCOUNT_TIERS.standard;
}

// Usage:
const policy = getTierPolicy(user.role);
const discount = policy.calculateDiscount(orderAmount);
const speed = policy.maxDownloadSpeed;
```

---

## 3. Composition over Inheritance

### ❌ Anti-Pattern: Deep Inheritance Tree for Arbitrary Code Sharing
Using class inheritance merely to share utilities leads to fragile base classes and tight coupling.

```javascript
// ❌ Deep inheritance hierarchy
class BaseUtility {
    log(msg) { console.log(msg); }
    formatDate(d) { return d.toISOString(); }
}

class BaseDataService extends BaseUtility {
    connect() { /* ... */ }
}

class ProductService extends BaseDataService {
    // Inherits logging, date formatting, and connection methods it may not need
}
```

### ✅ Best Practice: Composition with Specialized Collaborators
Inherit only for polymorphic *is-a* substitution (e.g. `Modal extends BaseComponent`). Compose collaborators (`has-a` / `uses-a`) for functionality.

```javascript
// ✅ Cohesive collaborators composed when needed
export class ProductService {
    constructor({ storageClient, mailer, database }) {
        this.storage = storageClient;
        this.mailer = mailer;
        this.db = database;
    }

    async uploadProductMedia(fileStream) {
        return this.storage.upload(fileStream);
    }
}
```

---

## 4. Guard Clauses vs. Nested `if/else` Pyramids

### ❌ Anti-Pattern: The Nested Arrow Pyramids
Deeply nested control structures increase cognitive load and make edge cases difficult to follow.

```javascript
// ❌ Arrow pyramid anti-pattern
function processOrder(order, user, paymentDetails) {
    if (order) {
        if (order.status === 'pending') {
            if (user && user.isVerified) {
                if (paymentDetails && paymentDetails.isValid) {
                    // Actual work buried 5 levels deep
                    const result = chargePayment(paymentDetails, order.total);
                    if (result.success) {
                        order.status = 'paid';
                        return { status: 'success' };
                    } else {
                        return { error: 'Payment failed' };
                    }
                } else {
                    return { error: 'Invalid payment details' };
                }
            } else {
                return { error: 'User not verified' };
            }
        } else {
            return { error: 'Order not pending' };
        }
    } else {
        return { error: 'Order not found' };
    }
}
```

### ✅ Best Practice: Guard Clauses & Early Returns
Check invalid states and edge cases at the top of the function and return/throw immediately.

```javascript
// ✅ Clean flattened execution flow
function processOrder(order, user, paymentDetails) {
    if (!order) {
        throw new CustomError(404, 'Order not found', 'ORDER_NOT_FOUND');
    }
    if (order.status !== 'pending') {
        throw new CustomError(400, 'Order is not in pending status', 'INVALID_STATUS');
    }
    if (!user?.isVerified) {
        throw new CustomError(403, 'User must be verified to complete orders', 'UNVERIFIED_USER');
    }
    if (!paymentDetails?.isValid) {
        throw new CustomError(400, 'Invalid payment details', 'INVALID_PAYMENT');
    }

    const result = chargePayment(paymentDetails, order.total);
    if (!result.success) {
        throw new CustomError(402, 'Payment charge failed', 'PAYMENT_FAILED');
    }

    order.status = 'paid';
    return { status: 'success', transactionId: result.transactionId };
}
```
