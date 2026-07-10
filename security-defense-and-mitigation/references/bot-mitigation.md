# Bot Mitigation & Scraping Protection

Automated bots crawl websites to scrape data, perform brute-force/credential-stuffing attacks, and submit spam. This document outlines standard techniques to detect and mitigate malicious automated activity.

---

## 1. Honeypots (Decoy Inputs & Endpoints)

Honeypots leverage the fact that automated bots parse HTML directly and fill out all inputs, ignoring CSS styles that hide them from human users.

### HTML/CSS Honeypot Fields
Add a hidden input field that a human user cannot see or interact with, but a bot will likely fill.

#### Implementation Pattern:
1. **HTML Form**:
   ```html
   <!-- Honeypot field: Must look like a legitimate field name but be hidden -->
   <div class="field-decoy" aria-hidden="true" style="display: none; absolute; left: -9999px; height: 0; width: 0; overflow: hidden;">
       <label for="user_website_validate">Website</label>
       <input type="text" id="user_website_validate" name="user_website_validate" tabindex="-1" autocomplete="off" />
   </div>
   ```
2. **Backend Validation**:
   - Check if the field is present and has any value.
   - If it is populated, **reject the request**.
   - *Tip*: Instead of returning an error message that alerts the bot developer, consider returning a simulated "Success" or a generic `200 OK` (silent discard), or a standard slow-down/rate-limit response.
   ```php
   // PHP Example
   if (!empty($_POST['user_website_validate'])) {
       // Log the bot submission details (IP, User Agent)
       error_log("Bot submission detected from IP: " . $_SERVER['REMOTE_ADDR']);
       // Fail silently or respond with a generic success
       header("HTTP/1.1 200 OK");
       echo json_encode(["status" => "success", "message" => "Obrigado!"]);
       exit;
   }
   ```

### Decoy API Endpoints
Create routes in your routing file for known bot scanners (e.g., `/wp-admin.php`, `/.env`, `/admin/config.php`) that immediately flag the source IP address or blacklist it on a Web Application Firewall (WAF).

---

## 2. Rate Limiting

Rate limiting restricts the volume of requests to protect resource usage and stop brute-force/scraping attempts.

### Best Practices:
- **Tiered Limits**: Apply generic rate limits globally (e.g., 100 requests/minute per IP) and strict rate limits on sensitive endpoints (e.g., login, registration, password reset - 5 requests/minute).
- **HTTP 429 Status Code**: Always return an HTTP `429 Too Many Requests` status code when a rate limit is exceeded.
- **Retry-After Header**: Include a `Retry-After: <seconds>` header to instruct cooperative clients when they can retry.

#### Express (Node.js) Example:
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  statusCode: 429,
  headers: true, // Return standard rate-limit info headers
});

app.use('/api/login', loginLimiter);
```

---

## 3. CAPTCHAs & Automated Challenges

When bot activity is high or on critical forms, verify human status via challenge-response mechanisms.

- **Prefer Privacy-First Solutions**: Use Cloudflare Turnstile or hCaptcha instead of traditional CAPTCHAs to preserve user experience and accessibility.
- **Backend Verification**: Never trust the frontend validation. The Turnstile/CAPTCHA token must be verified on the backend before processing the request.
  ```php
  // Verify hCaptcha/Turnstile token on the backend
  $response = file_get_contents("https://challenges.cloudflare.com/turnstile/v0/siteverify", false, ...);
  $responseData = json_decode($response);
  if (!$responseData->success) {
      // Reject submission
  }
  ```

---

## 4. Behavioral & Interaction Analysis

Analyze user actions to distinguish bots from human users.

- **Submission Speed (Time-to-Submit)**: Record the timestamp when the form renders. If a form is submitted in under 1.5 seconds, it is highly likely a bot.
- **Header Fingerprinting**: Inspect request headers. Flag or block requests with mismatching or generic User-Agent headers, missing `Accept-Language`, or headless environment properties (e.g. `navigator.webdriver === true`).
