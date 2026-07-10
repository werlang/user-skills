---
name: security-defense-and-mitigation
description: Guidelines for secure-by-default coding, bot/malicious actor protection, secure authentication/sessions, security headers, and input validation/escaping. Use this skill when: (1) implementing security/defense features, (2) adding bot defense (honeypots, rate-limiting, CAPTCHA), (3) configuring authentication/authorization/OAuth/tokens/passwords, (4) configuring CORS or security headers (CSP, HSTS, XSS protection), (5) implementing or refactoring any client-facing input form/endpoint where validation and escaping are required to prevent attacks (SQLi, XSS, SSRF).
---

# Security Defense & Mitigation

This skill provides guidelines and security-by-design standards to protect web applications against malicious actors, automated bots, and common security vulnerabilities.

> [!IMPORTANT]
> **Proactive Security Rule**: Even when the user does not explicitly request security enhancements, any code changes, refactors, or new features you implement MUST be designed with security in mind. If you are answering questions, you should explicitly call out any defense improvements needed to make the code minimally safe.

## Core Security Pillars

To ensure comprehensive protection, refer to the following specialized reference documents for detailed checklists and code patterns:

1. **Bot Mitigation & Scraping Protection**
   Protect endpoints against automated scripts, credential stuffing, scraping, and brute forcing.
   See [bot-mitigation.md](file:///Users/pablowerlang/.gemini/config/skills/security-defense-and-mitigation/references/bot-mitigation.md)

2. **Secure Authentication & Session Management**
   Secure user login, registration, password requirements, JWT/session cookies, CSRF protection, and email/verification token flows.
   See [secure-authentication.md](file:///Users/pablowerlang/.gemini/config/skills/security-defense-and-mitigation/references/secure-authentication.md)

3. **HTTP Security Headers**
   Enforce browser-level protection policies (CSP, HSTS, CORS, X-Frame-Options, Referrer-Policy).
   See [http-security-headers.md](file:///Users/pablowerlang/.gemini/config/skills/security-defense-and-mitigation/references/http-security-headers.md)

4. **Input Validation & Output Escaping**
   Prevent Injection (SQLi, Command Injection, Directory Traversal), XSS, SSRF, and validate incoming data on both client and server.
   See [input-validation-and-escaping.md](file:///Users/pablowerlang/.gemini/config/skills/security-defense-and-mitigation/references/input-validation-and-escaping.md)

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

### 3. Fail Securely
- Handle errors gracefully. Catch exceptions and log them internally, but do not expose database queries, file paths, or third-party API keys to the user.
- If an authorization check fails, deny access by default.

### 4. Least Privilege Principle
- Ensure database connections and API client keys have only the necessary permissions required for the application.
- Scope cookies and sessions to the minimum necessary path and domain.
