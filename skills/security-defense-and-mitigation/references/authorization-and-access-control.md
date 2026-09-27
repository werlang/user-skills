# Authorization, Access Control & Concurrency

Authentication verifies *who a user is*. Authorization determines *what a user is permitted to do or access*. Broken authorization is one of the most common and critical vulnerabilities in modern web applications and APIs.

---

## 1. Broken Object-Level Authorization (BOLA / IDOR)

Insecure Direct Object References (IDOR), also known as Broken Object-Level Authorization (BOLA, #1 on the OWASP API Security Top 10), occurs when an application exposes a reference to an internal object (e.g. order ID, account ID, document ID) without verifying that the requesting user owns or has permission to access that specific record.

### The Vulnerability:
```javascript
// BAD: Endpoint trusts user ID from parameter without checking ownership
app.get('/api/orders/:orderId', authenticateUser, async (req, res) => {
  const order = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.orderId]);
  // An attacker can enumerate orderId (1, 2, 3...) to read anyone's orders!
  res.json(order);
});
```

### The Solution: Explicit Ownership Scoping
Always filter queries by the authenticated user's ID or tenant ID directly in the data layer:
```javascript
// GOOD: Query is explicitly scoped to the authenticated tenant/user
app.get('/api/orders/:orderId', authenticateUser, async (req, res) => {
  const order = await db.query(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [req.params.orderId, req.user.id]
  );

  if (!order) {
    // Return 404 rather than 403 to prevent resource enumeration
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(order);
});
```

### Key BOLA / IDOR Rules:
1. **Never trust client-supplied identity**: Derive ownership strictly from verified session/JWT claims (`req.user.id`, `req.user.tenantId`), never from `req.body.userId` or `req.query.userId`.
2. **Prefer unpredictable public identifiers**: Use Base62 UUIDs or random public IDs (e.g. 14-character alphanumeric tokens or UUIDv4) rather than sequential auto-incrementing integers (`1, 2, 3`) for customer-facing endpoints. *(Note: UUIDs reduce enumeration speed, but DO NOT replace server-side authorization checks!)*
3. **Return 404 on unauthorized access**: Unless business requirements demand explaining permission levels, return `404 Not Found` rather than `403 Forbidden` for missing ownership to prevent attackers from confirming record existence.

---

## 2. Mass Assignment & Parameter Tampering

Mass assignment occurs when client input is passed directly to database models or ORM update methods without filtering allowed properties. Attackers can inject administrative or financial fields into request payloads (e.g., `role: "admin"`, `is_verified: true`, `balance: 99999`).

### The Vulnerability:
```javascript
// BAD: Directly applying entire req.body to user record
app.put('/api/profile', authenticateUser, async (req, res) => {
  // Attacker sends: { name: "Bob", role: "admin", is_verified: true }
  await User.update(req.body, { where: { id: req.user.id } });
  res.json({ success: true });
});
```

### The Solution: Strict Input Whitelisting (DTOs)
Explicitly pick and validate only the permitted mutable fields:
```javascript
// GOOD: Whitelisting allowed mutable fields
app.put('/api/profile', authenticateUser, async (req, res) => {
  const { name, bio, phoneNumber } = req.body;
  
  await User.update(
    { name, bio, phoneNumber },
    { where: { id: req.user.id } }
  );

  res.json({ success: true });
});
```

---

## 3. Role-Based & Attribute-Based Access Control (RBAC / ABAC)

When applications support multiple roles (e.g., Member, Manager, Admin, Owner) or permissions:

### 1. Fail Closed (Deny by Default)
If no role or permission check explicitly grants access, access must be rejected.

### 2. Centralized Authorization Middleware
Never scatter ad-hoc `if (user.role === 'admin')` checks across controller logic. Enforce permissions via declarative middleware:
```javascript
// Middleware factory for permission enforcement
function requirePermission(requiredPermission) {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
}

// Route definition
app.delete('/api/products/:id', authenticateUser, requirePermission('products:delete'), deleteProductHandler);
```

### 3. Re-verify Critical Privileges on Mutation
For destructive actions (e.g. deleting an organization, changing billing details, transferring ownership), verify permissions on the current database record immediately before executing, not just from the cached session or token.

---

## 4. Race Conditions & Concurrency (TOCTOU)

Time-of-Check to Time-of-Use (TOCTOU) vulnerabilities happen when an application checks a condition (e.g., wallet balance, item inventory, voucher redemption limit) in one step, and performs the state update in a later step without concurrency control. Attackers exploit this by sending concurrent parallel requests (HTTP pipelining) to double-spend or bypass limits.

### The Vulnerability:
```javascript
// BAD: Check-then-act with race condition
app.post('/api/redeem-coupon', authenticateUser, async (req, res) => {
  const coupon = await db.query('SELECT * FROM coupons WHERE code = ?', [req.body.code]);
  
  // Multiple parallel requests pass this check simultaneously!
  if (coupon.uses_remaining <= 0) {
    return res.status(400).json({ error: 'Coupon exhausted' });
  }

  // Decrement occurs after all parallel requests passed the check
  await db.query('UPDATE coupons SET uses_remaining = uses_remaining - 1 WHERE id = ?', [coupon.id]);
  await applyCoupon(req.user.id, coupon);
  res.json({ success: true });
});
```

### Solution 1: Atomic Database Updates
Perform condition evaluation and decrement in a single atomic SQL statement:
```sql
UPDATE coupons 
SET uses_remaining = uses_remaining - 1 
WHERE code = :code AND uses_remaining > 0;
```
Check the number of affected rows. If `affectedRows === 0`, the coupon was already exhausted or invalid.

### Solution 2: Database Transactions with Row Locks (`SELECT ... FOR UPDATE`)
When multiple tables or multi-step calculations are involved, wrap operations in a database transaction using pessimistic locking:
```javascript
// GOOD: Transaction with row-level pessimistic lock
await db.transaction(async (trx) => {
  // Lock the account row until transaction commits
  const [account] = await trx.query(
    'SELECT balance FROM accounts WHERE id = ? FOR UPDATE',
    [accountId]
  );

  if (account.balance < amount) {
    throw new Error('Insufficient funds');
  }

  await trx.query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, accountId]);
  await trx.query('INSERT INTO transactions (account_id, amount) VALUES (?, ?)', [accountId, -amount]);
});
```
