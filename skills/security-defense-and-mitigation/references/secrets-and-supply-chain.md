# Secrets, Cryptography & Supply-Chain Security

Securing an application requires hardening not only your written code, but also how secrets are managed, how third-party dependencies are consumed, and how cryptographic primitives are used.

---

## 1. Secrets & Credentials Management

Hardcoded secrets in source code and accidental commits of `.env` files are the leading causes of initial unauthorized access in production breaches.

### Golden Rules:
1. **Never Hardcode Secrets**: Never embed database passwords, API keys, private certificates, encryption keys, or webhook secrets in source files.
2. **Environment Variable Injection**: Ingest secrets exclusively from the environment (`process.env` in Node.js, `getenv()` in PHP). Validate their presence and types during application bootstrap (e.g. using `zod` or `envalid`).
3. **Strict Git Ignores**:
   Ensure `.gitignore` contains:
   ```gitignore
   .env
   .env.*
   !.env.example
   *.pem
   *.key
   id_rsa
   ```
   Provide a sanitized `.env.example` file checked into git that documents required variable names with empty or safe dummy values.
4. **Secret Scanning in CI**:
   Run automated secret scanners on every commit and pull request to detect accidental leaks before code is merged:
   - **TruffleHog**: Scans git repositories and commit histories for over 800+ credential formats.
   - **Gitleaks**: Lightweight pre-commit and CI scanner.
5. **Compromised Secret Incident Protocol**:
   If a secret or credential is ever committed to version control (even in a private repository or temporary branch):
   - **Assume it is compromised immediately**.
   - **Rotate / Invalidate the credential first** at the provider (database, AWS, Stripe, Google Cloud).
   - Do not merely delete the file or force-push over the commit. Git history, forks, and local clones retain past commits.

---

## 2. Dependency & Supply-Chain Security

Over 80% of code running in modern web applications comes from open-source third-party dependencies (`node_modules`). Compromised dependencies or unpatched CVEs expose applications to remote code execution and data theft.

### 1. Mandatory Vulnerability Audits in CI
Run automated package audit checks on every build to block vulnerable dependencies:
```bash
# Node.js: Fail CI if high or critical vulnerabilities exist
npm audit --audit-level=high

# Python
pip-audit
```

### 2. Lockfile Pinning & Deterministic Builds
- Always commit lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `poetry.lock`) to git.
- **Never run `npm install` in CI or Docker**. Bare `npm install` may resolve newer minor or patch versions with breaking changes or newly published malicious packages.
- **Always run `npm ci`**: `npm ci` wipes existing modules and installs the exact cryptographic hash pinned in `package-lock.json`.

### 3. Automated Dependency Updates
Enable **Dependabot** or **Renovate** to automatically create pull requests for security patches and outdated libraries. Configure CI to run your automated test suite against these PRs before merging.

### 4. Subresource Integrity (SRI)
When loading third-party scripts or stylesheets from public CDNs (e.g., Google Fonts, unpkg, cdnjs), enforce Subresource Integrity (SRI).

If a CDN account is compromised or a CDN server is hijacked, browsers without SRI will execute whatever malicious JavaScript the attacker serves. SRI tells the browser to compute the cryptographic hash of the received file and reject execution if it does not match.

```html
<!-- Example of Subresource Integrity on external script -->
<script 
  src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js" 
  integrity="sha384-e6nF6s6h3vA2/t+gB+3W5n9Lz7/n0C2uG7q5kL8R5H0yT1mN0pQ7v9W1x8Y3z5A" 
  crossorigin="anonymous">
</script>
```
- The `integrity` attribute specifies the expected hash (typically SHA-384 or SHA-512).
- The `crossorigin="anonymous"` attribute is required for cross-origin SRI checks.

---

## 3. Cryptography & Randomness Standards

Flawed cryptographic implementations provide a false sense of security. Always use established primitives and secure random number generators.

### 1. Cryptographically Secure Pseudo-Random Generators (CSPRNG)
Never use `Math.random()` for security-sensitive logic (session IDs, tokens, salts, passwords, reset links, nonces). `Math.random()` is predictable.

| Platform | Insecure (Never Use) | Secure (CSPRNG) |
| :--- | :--- | :--- |
| **Node.js** | `Math.random()` | `crypto.randomBytes(32)` or `crypto.randomUUID()` |
| **Web Browser** | `Math.random()` | `crypto.getRandomValues(new Uint8Array(32))` |
| **PHP** | `rand()`, `mt_rand()` | `random_bytes(32)` or `random_int()` |

### 2. Password Hashing Standards
- **Approved**: **Argon2id** (preferred) or **bcrypt** (cost factor >= 12).
- **Forbidden**: MD5, SHA-1, SHA-256, SHA-512 (fast hashing algorithms intended for data integrity, trivial to crack with GPUs).

### 3. Symmetric Encryption at Rest
When encrypting data at rest (e.g., API keys, OAuth tokens, sensitive user settings in the database):
- **Approved Cipher**: **AES-256-GCM** (Galois/Counter Mode) or **ChaCha20-Poly1305**. These provide authenticated encryption (confidentiality + integrity).
- **Unique IV/Nonce per Operation**: Generate a fresh, random 12-byte Initialization Vector (IV) for *every single encryption*. Never reuse an IV with the same encryption key.
- **Authentication Tag Verification**: Store the authentication tag alongside the ciphertext and IV. Always verify the tag during decryption to detect tampering before returning plaintext.

---

## 4. Static Application Security Testing (SAST)

Incorporate automated security linters in your development and CI workflow to catch anti-patterns before code review:
- **Semgrep**: Fast, open-source static analysis engine with comprehensive OWASP rulesets.
- **eslint-plugin-security**: Node.js / JavaScript ESLint plugin detecting dangerous regexes, dynamic requires, and unsafe object lookups.
- **SonarQube / CodeQL**: Deep code analysis for security vulnerabilities and code quality.
