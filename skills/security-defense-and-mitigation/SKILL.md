---
name: security-defense-and-mitigation
description: "Guidelines for secure-by-default coding, bot/malicious actor protection, secure authentication/sessions, authorization & IDOR/BOLA defense, multi-tier HTTP security headers (CSP, Permissions-Policy, HSTS), safe file uploads, secrets/supply-chain security, and input validation/escaping. Use this skill when: (1) implementing security/defense features, (2) adding bot defense (honeypots, rate-limiting, CAPTCHA), (3) configuring authentication/authorization/OAuth/tokens/passwords, (4) configuring CORS or security headers across Web frontends and APIs, (5) preventing IDOR/BOLA or mass assignment, (6) handling file uploads, secrets, or dependencies, (7) implementing or refactoring any client-facing input form/endpoint where validation and escaping are required to prevent attacks (SQLi, XSS, SSRF)."
---

# Security Defense & Mitigation

This skill provides guidelines and security-by-design standards to protect web applications against malicious actors, automated bots, and common code-level security vulnerabilities.

> [!IMPORTANT]
> **Proactive Security Rule**: Even when the user does not explicitly request security enhancements, any code changes, refactors, or new features you implement MUST be designed with security in mind. If you are answering questions, you should explicitly call out any defense improvements needed to make the code minimally safe.

## Core Security Pillars

To ensure comprehensive protection, refer to the following specialized reference documents for detailed checklists and code patterns:

1. **Bot Mitigation & Scraping Protection**
   Protect endpoints against automated scripts, credential stuffing, scraping, and brute forcing.
   See [bot-mitigation.md](references/bot-mitigation.md)

2. **Secure Authentication & Session Management**
   Secure user login, registration, password requirements, JWT/session cookies, CSRF protection, and email/verification token flows.
   See [secure-authentication.md](references/secure-authentication.md)

3. **Authorization, Access Control & Concurrency**
   Prevent Broken Object-Level Authorization (BOLA/IDOR), mass assignment parameter tampering, privilege escalation, and race conditions (TOCTOU).
   See [authorization-and-access-control.md](references/authorization-and-access-control.md)

4. **HTTP Security Headers & Multi-Tier Auditing**
   Enforce browser-level protection policies (CSP archetypes, HSTS, Permissions-Policy, CORS, X-Frame-Options, Referrer-Policy) across all architectural tiers (Web/SSR, API, Edge). Apply diagnostic recipes, SecurityHeaders.com Grade A+ / Mozilla Observatory benchmarks, and automated test assertions.
   See [http-security-headers.md](references/http-security-headers.md)

5. **Input Validation, Output Escaping & Upload Safety**
   Prevent Injection (SQLi, Command Injection, Directory Traversal), XSS, SSRF, prototype pollution, and enforce secure file upload handling (magic bytes, UUID storage).
   See [input-validation-and-escaping.md](references/input-validation-and-escaping.md)

6. **Secrets, Cryptography & Supply-Chain Security**
   Zero-commit credential policies, env var management, secret rotation, dependency audits (`npm audit`), Subresource Integrity (SRI), CSPRNG standards, and authenticated symmetric encryption (AES-256-GCM).
   See [secrets-and-supply-chain.md](references/secrets-and-supply-chain.md)

---

## Secure-by-Default Implementation Checklist

When reviewing, writing, or refactoring code, run through these foundational defense principles:

### 1. Parity in Validation
- Never trust client-side validation alone (it can be bypassed).
- Ensure **strict validation rules** implemented on the frontend (e.g. password complexity, field types, string length, regex format) are identically enforced on the backend.
- Return structured error messages to the client without exposing internal stack traces.

### 2. Context-Aware Output Encoding
- When rendering dynamic variables in HTML templates (e.g., Mustache, PHP, React), ensure they are appropriately escaped to prevent XSS.
- In JS, prefer `textContent` over `innerHTML` or `dangerouslySetInnerHTML` unless explicitly sanitized.

### 3. Object-Level Authorization (IDOR / BOLA) & Mass Assignment
- **Never trust client-supplied identity**: Derive ownership strictly from verified session/JWT claims (`req.user.id`), never from parameters (`req.params.userId`, `req.body.userId`).
- Always scope database queries by the authenticated user/tenant ID (`WHERE id = :id AND user_id = :currentUserId`).
- Never pass unvalidated request bodies directly to database updates or ORMs; explicitly whitelist permitted mutable fields (DTO pattern).

### 4. Secrets Hygiene & Zero-Commit Policy
- Never hardcode API keys, passwords, connection URIs, or tokens in source code.
- Ensure `.env*` files are strictly added to `.gitignore`. Provide a sanitized `.env.example` with dummy values.
- If a secret is ever committed to git, assume compromise immediately and rotate it at the provider.

### 5. Cryptographic Standards & CSPRNG
- Never use `Math.random()` for security-sensitive logic (session IDs, tokens, reset links, salts, nonces). Always use a CSPRNG (`crypto.randomBytes()`, `crypto.randomUUID()`).
- Use slow, salted algorithms (**Argon2id** or **bcrypt**) for passwords. Never use MD5, SHA-1, or plain SHA-256.
- For symmetric encryption at rest, use authenticated encryption (**AES-256-GCM**) with a unique random IV per operation.

### 6. Safe File Uploads & Prototype Pollution Prevention
- Never trust user filenames or client MIME types. Validate file buffers via **magic bytes**, store files outside the webroot or in private cloud object storage (S3/R2), and rename files with random UUIDs.
- Treat SVG uploads as executable code (Stored XSS risk); sanitize SVGs or force download via `Content-Disposition: attachment`.
- Ban `eval()`, `new Function()`, and sanitize recursive object merges to block prototype pollution.

### 7. Sensitive Data in Logs & CRLF Sanitization
- Never log raw request bodies containing `password`, `token`, `authorization`, `creditCard`, or PII. Use automatic logger serializers to redact sensitive keys.
- Strip or escape carriage returns and line feeds (`\r`, `\n`) from user input before logging to prevent Log Injection (CRLF).

### 8. Concurrency & Race Condition Defense (TOCTOU)
- Protect state-changing counters, balances, inventory, and redemption limits against parallel double-spend attacks.
- Use atomic SQL updates (`UPDATE ... SET val = val - 1 WHERE id = :id AND val > 0`) or database transactions with row locks (`SELECT ... FOR UPDATE`).

### 9. Multi-Tier Security Header Parity
- **Every public tier must emit security headers**: Never assume reverse proxies, CDNs, or Cloudflare Tunnels add security headers automatically. Cloudflare Tunnel (`cloudflared`) does NOT inject security headers by default.
- Both public Web/SSR frontends and backend APIs must independently configure and send security headers directly from the application layer.
- Web frontends require full CSP, Permissions-Policy, HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy: strict-origin-when-cross-origin`.
- APIs require zero-trust CSP (`default-src 'none'`), Permissions-Policy, HSTS, nosniff, and strict CORS.
- Suppress fingerprinting headers (`Server`, `X-Powered-By`).

### 10. Diagnostic & Verification Loop
- **SecurityHeaders.com Audits**: Audit live deployments using the canonical URL:
  `https://securityheaders.com/?q=<domain>&hide=on&followRedirects=on`
  Always include `hide=on` (to prevent public feed broadcasting) and `followRedirects=on` (to audit the final landing page rather than stopping at the initial 301/302 redirect).
- **Active cURL Inspection**: Use cURL recipes to inspect raw headers directly in development, inside Docker containers, and in staging without cache interference.
- **Mozilla Observatory**: Audit CSP depth, cookies, and transport security against Mozilla Observatory benchmarks (target Grade A / A+).
- **Multi-Hop Verification**: Explicitly verify both redirect entrypoints (`http://` -> `https://` or apex -> `www`) and final landing pages.

### 11. Automated Security Testing & CI Gates
- Every web application and API service must maintain automated unit or integration tests asserting the presence and values of all required security headers.
- Enforce supply-chain audits (`npm audit --audit-level=high` or `pip-audit`) and static analysis (SAST) in CI pipelines.
- Never let headers or security checks be dropped or relaxed during refactoring; gate CI builds on security assertions.
