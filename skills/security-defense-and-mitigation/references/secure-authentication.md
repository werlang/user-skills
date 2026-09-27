# Secure Authentication & Session Management

Authentication and session management are high-value targets for attackers. Securing credential handling, session state, and account recovery flows is critical.

---

## 1. Password Complexity & Hashing

### Backend Validation Parity:
- **Never rely on frontend validation alone**. All registration and password change endpoints must validate password complexity.
- **Rule of Thumb**: Enforce a minimum length (e.g., 8-12 characters), mixed case, numeric, and special character requirements on both sides.

### Cryptographic Hashing:
- Always use a slow, salted hashing function like **bcrypt** or **Argon2id**.
- **PHP**: Use `password_hash($password, PASSWORD_DEFAULT)` and verify with `password_verify($password, $hash)`.
- **Node.js**: Use `bcrypt` or `argon2` packages.
- **Never** use MD5, SHA-1, or plain SHA-256 for password storage.

---

## 2. Brute-Force & Account Lockouts

Protect logins against credential stuffing and brute forcing.

- **Account Lockout Policy**: Temporarily lock accounts or require CAPTCHA verification after a fixed number of failed login attempts (e.g., 5 failures = 15-minute lock).
- **Generic Error Messages**: Use generic responses for auth failures to prevent username enumeration:
  - **Bad**: "Username not found" or "Incorrect password".
  - **Good**: "Invalid email/username or password".

---

## 3. Session & JWT Security

Sessions and JSON Web Tokens (JWT) must be protected from leakage (via XSS) and hijacking.

### Secure Cookies:
If storing session IDs or JWTs in cookies, always configure these flags:
- `HttpOnly`: Prevents client-side scripts from reading the cookie (protects against XSS theft).
- `Secure`: Ensures the cookie is only sent over encrypted HTTPS connections.
- `SameSite=Strict` or `SameSite=Lax`: Mitigates Cross-Site Request Forgery (CSRF).

### JWT Guidelines:
- **Short Lifespan**: Access tokens should expire quickly (e.g., 15 minutes). Use a refresh token pattern for longer sessions.
- **Revocation**: Implement a blacklist or database-backed session table to revoke refresh tokens on logout or security incidents.
- **No Sensitive Data**: Never store passwords, PII, or internal database structure details inside the unencrypted JWT payload.

---

## 4. Cross-Site Request Forgery (CSRF) Protection

State-changing requests (POST, PUT, DELETE) must be verified to originate from the user's authentic browser context.

- **Anti-CSRF Tokens**: Inject a unique, cryptographically random token in the user's session and require it as a form input or header on all state-changing endpoints. Validate that the submitted token matches the session token.
- **SameSite Cookies**: Use `SameSite=Strict` (or `Lax`) on session cookies.

---

## 5. Secure Email & Action Verification Tokens

Email confirmation and password reset flows rely on unique tokens.

- **Cryptographic Randomness**: Generate tokens using cryptographically secure pseudo-random generators:
  - **PHP**: `bin2hex(random_bytes(32))`
  - **Node.js**: `crypto.randomBytes(32).toString('hex')`
- **Expirable**: Tokens must have a strict expiration timestamp (e.g., 1-2 hours) stored in the database.
- **Single-Use**: Invalidate or delete the token immediately once it has been verified.
- **Confirm Actions via POST**: Never trigger a state change (like confirming an email or resetting a password) via a GET request (e.g., direct link click). The email link should point to a landing page with a confirmation form/button that submits via **POST**, preventing web browsers or email scanners from pre-fetching the link and accidentally confirming/resetting the action.

---

## 6. Sensitive Data in Logs & Redaction

Developers often write `console.log(req.body)` or `console.error(err)` when debugging, inadvertently streaming cleartext passwords, session tokens, and PII into cloud log aggregators (CloudWatch, Datadog, Papertrail, Elastic).

### 1. Blacklist Sensitive Fields
Configure application loggers (e.g., Pino, Winston, Morgan) with automatic serializers/redactors that mask sensitive keys:
- **Keys to redact**: `password`, `passwordConfirmation`, `token`, `refreshToken`, `authorization`, `cookie`, `creditCard`, `cvv`, `secret`, `apiKey`, `ssn`, `cpf`.
- **Example Pattern**:
  ```javascript
  // Express middleware redacting sensitive keys before logging
  function sanitizeForLog(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const redacted = Array.isArray(obj) ? [...obj] : { ...obj };
    const sensitiveKeys = ['password', 'token', 'authorization', 'secret', 'creditCard', 'cvv'];

    for (const key of Object.keys(redacted)) {
      if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
        redacted[key] = '[REDACTED]';
      } else if (typeof redacted[key] === 'object') {
        redacted[key] = sanitizeForLog(redacted[key]);
      }
    }
    return redacted;
  }
  ```

### 2. Sanitize Database Connection Strings
Database connection errors frequently output the raw connection URI (`postgres://app_user:s3cr3tP@ss@db-host:5432/app`). Strip or redact credentials before logging error objects.

---

## 7. Log Injection (CRLF Injection)

When untrusted user input is written into plain text logs without sanitization, an attacker can submit values containing carriage returns and line feeds (`\r\n`). This allows the attacker to forge fake log entries or confuse automated log parsers:

```text
// User submits username: "admin\r\n[2026-09-27 12:00:00] [INFO] User admin elevated to superuser"
```

### Prevention:
Strip or URL-encode newline characters before writing user-controlled strings to logs:
```javascript
function safeLogString(input) {
  if (typeof input !== 'string') return input;
  return input.replace(/[\r\n]/g, '_');
}
```
Prefer structured JSON logging (e.g., Pino) over plain-text string formatting, as JSON serializers automatically escape newlines into `\n` literals.

