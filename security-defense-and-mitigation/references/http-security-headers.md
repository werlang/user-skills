# HTTP Security Headers

HTTP security headers instruct browser security mechanisms to restrict access, block XSS, prevent frame hijacking, and enforce secure transport protocols.

---

## 1. Content Security Policy (CSP)

CSP restricts the resources (such as JavaScript, CSS, Images) that the browser is allowed to load for a given page, offering powerful mitigation against Cross-Site Scripting (XSS) and data injection.

### Key Directives:
- `default-src 'self'`: Default fallback policy, allowing resources only from the site's origin.
- `script-src 'self'`: Restricts JavaScript sources. Avoid `'unsafe-inline'` or `'unsafe-eval'`. Use cryptographic nonces (`nonce-<random>`) or source hashes for legitimate inline scripts.
- `object-src 'none'`: Prevents the browser from loading plugins like Flash or Java.
- `base-uri 'self'`: Restricts the URLs that can be used in the `<base>` tag (prevents base tag hijacking).

### Example Header Value:
```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com; object-src 'none'; base-uri 'self';
```

---

## 2. HTTP Strict Transport Security (HSTS)

HSTS forces connections to use HTTPS instead of HTTP, blocking protocol downgrade attacks (like SSL stripping) and cookie hijacking.

- **Required Header**: `Strict-Transport-Security`
- **Recommended Value**: `max-age=63072000; includeSubDomains; preload` (enforces HTTPS for 2 years across the site and all subdomains).

---

## 3. X-Content-Type-Options: nosniff

This header forces the browser to strictly follow the MIME types defined in the `Content-Type` headers, preventing MIME-type confusion attacks and executing unauthorized files as scripts.

- **Required Header**: `X-Content-Type-Options`
- **Required Value**: `nosniff`

---

## 4. X-Frame-Options & Frame-Ancestors

Protects users against clickjacking attacks by blocking other websites from embedding your site inside an `<iframe>`.

- **Standard Header**: `X-Frame-Options: SAMEORIGIN` (allows embedding only by pages on the same origin) or `DENY` (blocks all embedding).
- **Modern CSP replacement**: Use the CSP `frame-ancestors 'self'` directive, which is more granular and supported by all modern browsers.

---

## 5. Referrer-Policy

Controls how much referrer information (the URL from which the request originated) is sent along with outbound requests.

- **Recommended Value**: `strict-origin-when-cross-origin` (sends full path for same-origin, only the domain for cross-origin over HTTPS, and no header to HTTP origins).

---

## 6. Cross-Origin Resource Sharing (CORS)

CORS handles resource sharing requests between different origins.

- **Avoid Wildcards**: Never use `Access-Control-Allow-Origin: *` in combination with `Access-Control-Allow-Credentials: true`.
- **Explicit Origin Check**: Dynamically validate the incoming `Origin` request header against an allowed whitelist of domains on the server, and mirror that validated domain in the response header.
