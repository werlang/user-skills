# HTTP Security Headers

HTTP security headers instruct browser security mechanisms to restrict resource loading, block Cross-Site Scripting (XSS), prevent clickjacking, enforce secure transport protocols, restrict sensitive device/hardware APIs, and eliminate fingerprinting information.

Every HTTP service exposed to clients (whether a public SSR web frontend, a JSON API, or a static asset gateway) must emit hardened security headers.

---

## 1. Multi-Tier Boundary Architecture & Common Pitfalls

### The Multi-Tier Blindspot
In modern architectures, developers frequently configure security headers (e.g., using `helmet` in Express) on the **backend API** (`api.example.com`), but inadvertently leave the **public web frontend / SSR service** (`example.com`) completely unconfigured.

Because browsers navigate directly to HTML SSR routes (`/`, `/login`, `/dashboard`), the frontend is the primary surface where XSS, clickjacking, and MIME sniffing attacks take place. Applying security headers *only* to the API leaves the public web application completely exposed (receiving a failing **Grade F** on SecurityHeaders.com).

### The Cloudflare Tunnel / Edge Proxy Fallacy
A dangerous assumption is that ingress proxies, reverse proxies, or edge tunnels inject security headers automatically:
- **Cloudflare Tunnel (`cloudflared`) DOES NOT inject security headers by default.** It simply creates an encrypted tunnel between Cloudflare's edge and your origin service. It forwards HTTP response headers exactly as emitted by your origin.
- Unless explicit **Transform Rules / Managed Transforms** or Cloudflare Workers are configured on the Cloudflare dashboard, the headers received by the end-user's browser are strictly whatever your origin application emits.
- Reverse proxies (Nginx, Traefik, AWS ALB) also pass origin headers through unless explicitly instructed to add them.
- **Rule of Defense-in-Depth**: Every origin service (Web SSR, SPA static server, Backend API) must configure and emit its own security headers directly in application code, independently of edge infrastructure.

### Multi-Tier Boundary Verification Matrix
Audit every tier independently during architecture review and release verification:

| Tier | Host Example | Primary Threat Surface | Mandatory Headers |
| :--- | :--- | :--- | :--- |
| **Web / SSR Frontend** | `https://example.com` | XSS, Clickjacking, MIME sniffing, Unauthorized hardware/browser API access, SSL stripping | Full Web CSP, HSTS, Permissions-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strip `X-Powered-By` |
| **Backend API** | `https://api.example.com` | Direct URL navigation, MIME confusion, unauthorized cross-origin mutations | Zero-Trust API CSP (`default-src 'none'`), HSTS, Permissions-Policy, X-Content-Type-Options, Strict CORS, Frame-Ancestors 'none', Strip `X-Powered-By` |
| **Static CDN / Object Storage** | `https://cdn.example.com` | MIME sniffing, Cross-origin asset blocking | `X-Content-Type-Options: nosniff`, CORS headers (`Access-Control-Allow-Origin`) for fonts/images, Cache-Control |
| **Edge / Gateway / Tunnel** | Cloudflare / Nginx / Caddy | Header leakage, SSL stripping | Strip server identification (`Server`), enforce HTTPS redirect, preserve origin security headers |

---

## 2. Core Security Headers Specification

### 1. Permissions-Policy
Controls which browser features, hardware APIs (camera, microphone, geolocation, USB, etc.), and iframe capabilities can be used by the page or embedded content.
- **Why it matters**: Missing `Permissions-Policy` immediately prevents achieving an **A+** grade on SecurityHeaders.com.
- **Syntax**: `feature=(allowlist)`. An empty tuple `()` denies the feature completely. `(self)` permits access only to the same origin.
- **Recommended Production Web Baseline**:
  ```http
  Permissions-Policy: accelerometer=(), autoplay=(), camera=(), cross-origin-isolated=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(self), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), xr-spatial-tracking=()
  ```
  *(If your frontend requires a specific feature, such as payment or geolocation, grant it explicitly to `(self)`, e.g., `payment=(self)` or `geolocation=(self)`).*
- **Recommended Backend API Baseline**:
  ```http
  Permissions-Policy: accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), xr-spatial-tracking=()
  ```

### 2. Content-Security-Policy (CSP)
Restricts which scripts, stylesheets, images, fonts, connections, and frames the browser may execute or load.
- See detailed frontend vs. API archetypes in Section 3 below.

### 3. HTTP Strict Transport Security (HSTS)
Forces browsers to interact with the site exclusively over encrypted HTTPS connections, preventing SSL stripping and protocol downgrade attacks.
- **Required Header**: `Strict-Transport-Security`
- **Recommended Production Value**:
  ```http
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  ```
  - `max-age=63072000`: 2 years in seconds (minimum 1 year / 31536000 required for top ratings and preload eligibility).
  - `includeSubDomains`: Extends HTTPS requirement to all subdomains.
  - `preload`: Authorizes inclusion in Chrome, Firefox, and Safari's built-in HSTS preload lists (https://hstspreload.org).

### 4. X-Content-Type-Options: nosniff
Prevents browsers from MIME-sniffing a response away from the declared `Content-Type`.
- **Required Header**: `X-Content-Type-Options: nosniff`
- Prevents user-uploaded files or static content from being interpreted and executed as HTML or JavaScript.

### 5. X-Frame-Options & CSP frame-ancestors
Protects users against clickjacking attacks by blocking unauthorized sites from embedding your pages inside an `<iframe>`.
- **Legacy Header**: `X-Frame-Options: DENY` (or `SAMEORIGIN`)
- **Modern CSP Directive**: `frame-ancestors 'none'` (or `'self'`)
- **Best Practice**: Send both `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'` for universal compatibility across older and modern browsers.

### 6. Referrer-Policy
Governs how much URL information is sent in the `Referer` header when following outbound links or loading external assets.
- **Recommended Value**:
  ```http
  Referrer-Policy: strict-origin-when-cross-origin
  ```
  Sends full path for same-origin requests, only the origin domain for cross-origin HTTPS requests, and no referrer header to insecure HTTP destinations.

### 7. Information Leakage Elimination
Attackers and automated scanners use response headers to fingerprint server software, programming languages, and framework versions.
- **Remove `X-Powered-By`**: In Express, call `app.disable('x-powered-by')` or use `helmet.hidePoweredBy()`.
- **Sanitize `Server`**: Strip or sanitize the `Server` header (e.g., at the reverse proxy or via edge rules). Do not expose exact Nginx, Apache, or Node.js versions.

### 8. Cross-Origin Resource Sharing (CORS)
- **APIs**: Validate incoming `Origin` headers against an explicit domain whitelist.
- **Never Wildcard with Credentials**: Never pair `Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true`.
- **Preflight Cache**: Set `Access-Control-Max-Age: 86400` to prevent redundant `OPTIONS` round-trips.

---

## 3. Architecture-Specific CSP Archetypes

Different architectural tiers require fundamentally different CSP models. Never copy an API CSP to a web frontend or vice-versa.

### Archetype A: Backend API (Zero-Trust / No-Execution CSP)
Backend APIs return JSON/REST/GraphQL data. They never render HTML or execute client scripts. If an API URL is loaded directly in a browser, it must be locked down completely.
```http
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'
```
- `default-src 'none'`: Disables all script execution, styling, image loading, and network connections.
- `frame-ancestors 'none'`: Prevents API endpoints from being embedded in iframes.
- `base-uri 'none'`: Prevents base tag manipulation.
- `form-action 'none'`: Prevents posting forms to or from the endpoint.

### Archetype B: Standard Production Web Frontend / SSR (Full-Stack Web App)
Real-world production web applications frequently load Google Fonts, integrate OAuth login providers (e.g. Google Sign-In), consume external CDNs, and serve media from cloud object storage (Cloudflare R2, AWS S3).

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://*.r2.dev https://*.s3.amazonaws.com https://lh3.googleusercontent.com; connect-src 'self' https://api.example.com; frame-src https://accounts.google.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self' https://accounts.google.com;
```

**Directive Breakdown:**
- `default-src 'self'`: Default fallback allows resources only from the site's own origin.
- `script-src 'self'`: Restricts JavaScript to first-party bundled scripts. (Add trusted analytics/tag manager domains if explicitly needed).
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`: Allows Google Fonts CSS. `'unsafe-inline'` is commonly required for dynamic UI styling, CSS custom properties (variables), or inline style bindings (unless using Archetype C nonces).
- `font-src 'self' https://fonts.gstatic.com data:`: Allows font binaries from Google Fonts and inline data URIs.
- `img-src 'self' data: blob: https://*.r2.dev https://*.s3.amazonaws.com https://lh3.googleusercontent.com`: Permits same-origin images, base64 data URIs, blob URLs, cloud object storage buckets (R2 / S3), and Google OAuth user avatar URLs (`lh3.googleusercontent.com`).
- `connect-src 'self' https://api.example.com`: Authorizes browser `fetch`/XHR calls to the public backend API domain.
- `frame-src https://accounts.google.com`: Permits Google OAuth authentication frames and popups.
- `frame-ancestors 'none'`: Hardens the frontend against clickjacking.
- `object-src 'none'`: Completely disables Flash, Java, and legacy browser plugins.
- `base-uri 'self'`: Prevents `<base>` tag injection attacks.
- `form-action 'self' https://accounts.google.com`: Restricts where HTML `<form>` submissions can post.

### Archetype C: Nonce-Based Strict Frontend (Maximum Security SSR)
When inline scripts or styles are required, eliminate `'unsafe-inline'` by generating a per-request cryptographically secure nonce in SSR middleware:

```javascript
// Express SSR middleware example
import crypto from 'node:crypto';

app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.cspNonce = nonce;

  res.setHeader(
    'Content-Security-Policy',
    `default-src 'self'; ` +
    `script-src 'self' 'nonce-${nonce}'; ` +
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com; ` +
    `font-src 'self' https://fonts.gstatic.com; ` +
    `object-src 'none'; ` +
    `base-uri 'self'; ` +
    `frame-ancestors 'none';`
  );
  next();
});
```

In your SSR template (Mustache / EJS / Pug):
```html
<script nonce="{{cspNonce}}">
  window.__APP_CONFIG__ = { apiUrl: "https://api.example.com" };
</script>
```

---

## 4. Diagnostic & Verification Protocol

### Benchmark Evaluation Criteria

Validate all deployed environments against industry-standard security header benchmarks:

1. **SecurityHeaders.com (Primary Live Audit Tool)**:
   - **Target Grade: A+**
   - **Canonical Audit URL**:
     ```text
     https://securityheaders.com/?q=<domain>&hide=on&followRedirects=on
     ```
     Example: `https://securityheaders.com/?q=nodeaec.com.br&hide=on&followRedirects=on`
   - **Why these URL parameters are mandatory**:
     - `q=<domain>`: The target domain or subdomain to evaluate (e.g. `nodeaec.com.br` or `api.nodeaec.com.br`).
     - `hide=on`: **Privacy protection**. Prevents the scanned domain and its score from being broadcast in the public "Recent Scans" table on the SecurityHeaders.com front page (vital during development, staging, or confidential releases).
     - `followRedirects=on`: **Full journey audit**. Follows redirect chains (e.g., `http://` -> `https://` or apex -> `www`) so the scanner grades the final landing HTML page rather than halting at the initial 301/302 redirect.
   - **Interactive vs. CLI Audits**: SecurityHeaders.com protects its web interface with Cloudflare Bot Management (`cf-mitigated: challenge`, returning HTTP 403 to raw `curl` user-agents). Open the canonical audit URL directly in a browser or browser automation agent (`agent-browser`) to review the interactive score and recommendations.
   - **Grade Breakdown**:
     - **Grade A+**: All core headers present (`Strict-Transport-Security` with `includeSubDomains`, `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options` or `frame-ancestors`), zero information leaks (`Server`, `X-Powered-By`).
     - **Grade A**: All core headers present, but missing `includeSubDomains` or minor policy optimization.
     - **Grade B/C/D**: Missing one or more critical headers (e.g., missing `Permissions-Policy` or `Referrer-Policy`).
     - **Grade F**: Zero security headers emitted (typical when frontend relies on an unconfigured Cloudflare Tunnel or omitted middleware).

2. **Mozilla Observatory**:
   - **Target: Grade A / A+ (Score >= 100)**
   - Evaluates CSP depth (avoiding wildcards and inline execution), HSTS preloading, cookie security flags, and Subresource Integrity (SRI).

### Active Diagnostic Recipes (cURL)

Raw cURL commands are essential during development, inside Docker containers, and in CI pipelines because they bypass browser caches, display exact raw header casing and values, and allow direct testing before DNS or ingress proxies are wired up.

#### 1. Fast Security Headers Audit
Inspect all security and leakage headers on any public or staging URL in a single command:
```bash
curl -sIL https://example.com | grep -iE '^(http/|strict-transport-security|content-security-policy|x-content-type-options|permissions-policy|referrer-policy|x-frame-options|server|x-powered-by)'
```

#### 2. Follow Redirect Chains
Confirm that security headers are emitted on both the redirect response and the final canonical URL:
```bash
curl -IL https://example.com
```

#### 3. Inspect Local / Container Services Directly
Verify headers in development or CI inside Docker containers before traffic touches any proxy:
```bash
# Verify Web SSR container directly
docker compose exec web curl -sI http://localhost:3000

# Verify Backend API container directly
docker compose exec api curl -sI http://localhost:4000/health
```

#### 4. Programmatic Scanners (Mozilla Observatory API)
Mozilla Observatory provides a public JSON REST API suitable for CLI automation and CI scripts:
```bash
# Trigger analysis on Mozilla Observatory:
curl -s -X POST "https://http-observatory.security.mozilla.org/api/v1/analyze?host=example.com" | jq '{grade: .grade, score: .score, state: .state}'
```

---

## 5. Mandatory Automated Test Requirements

Relying solely on manual inspection invites regression. Every HTTP service (both Web frontend and API) **must maintain automated unit or integration tests** asserting the presence and correct values of all required security headers.

### Web Frontend Header Test (Node.js / Express Example)
```javascript
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js'; // Web frontend Express application

describe('Web Frontend HTTP Security Headers', () => {
  test('GET / emits all mandatory security headers for Grade A+ rating', async () => {
    const res = await request(app).get('/');

    assert.equal(res.status, 200);

    // 1. MIME Sniffing Protection
    assert.equal(res.headers['x-content-type-options'], 'nosniff');

    // 2. Clickjacking Protection
    assert.equal(res.headers['x-frame-options'], 'DENY');

    // 3. Referrer Privacy
    assert.equal(res.headers['referrer-policy'], 'strict-origin-when-cross-origin');

    // 4. Permissions-Policy
    assert.ok(res.headers['permissions-policy'], 'Permissions-Policy header must be present');
    assert.match(res.headers['permissions-policy'], /camera=\(\)/);
    assert.match(res.headers['permissions-policy'], /microphone=\(\)/);
    assert.match(res.headers['permissions-policy'], /geolocation=\(\)/);

    // 5. Content-Security-Policy
    assert.ok(res.headers['content-security-policy'], 'Content-Security-Policy header must be present');
    assert.match(res.headers['content-security-policy'], /default-src 'self'/);
    assert.match(res.headers['content-security-policy'], /object-src 'none'/);
    assert.match(res.headers['content-security-policy'], /frame-ancestors 'none'/);

    // 6. Strict-Transport-Security (enforced in production or with HTTPS test harness)
    if (process.env.NODE_ENV === 'production') {
      assert.ok(res.headers['strict-transport-security']);
      assert.match(res.headers['strict-transport-security'], /max-age=63072000/);
      assert.match(res.headers['strict-transport-security'], /includeSubDomains/);
    }

    // 7. Information Leakage Elimination
    assert.equal(res.headers['x-powered-by'], undefined, 'X-Powered-By header must be stripped');
  });
});
```

### Backend API Header Test Example
```javascript
describe('Backend API HTTP Security Headers', () => {
  test('GET /health returns zero-trust CSP and strict security headers', async () => {
    const res = await request(apiApp).get('/health');

    assert.equal(res.status, 200);
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.equal(
      res.headers['content-security-policy'],
      "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
    );
    assert.ok(res.headers['permissions-policy'], 'Permissions-Policy must be present on API');
    assert.equal(res.headers['x-powered-by'], undefined);
  });
});
```

### Continuous Integration Rule
Any pull request or commit that modifies server middleware, changes route handlers, or updates dependency packages must pass these tests. Dropping a security header or relaxing CSP directives must cause automated test failure.
