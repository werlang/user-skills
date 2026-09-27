# Input Validation & Output Escaping

Unvalidated input and unescaped output are the source of most security bugs (Injection, XSS, SSRF, File Traversal). Follow these secure coding patterns to prevent them.

---

## 1. Input Validation (Sanitization & Whitelisting)

- **Validate Type, Length, Format**: Ensure every input parameter conforms to strict rules before processing.
  - Verify data types (e.g., cast numeric IDs to integers).
  - Enforce maximum string lengths.
  - Use regular expressions for complex patterns (e.g., emails, phone numbers).
- **Whitelisting**: When input should fall within a set of known values (e.g., sorting columns, filter options), use a strict whitelist array and reject anything else.
  ```php
  // PHP Example: Whitelisting sorting order
  $allowed_sorts = ['id', 'name', 'created_at'];
  $sort = in_array($_GET['sort'], $allowed_sorts) ? $_GET['sort'] : 'id';
  ```

---

## 2. SQL Injection (SQLi) Prevention

Never concatenate or interpolate user input directly into database queries.

- **Prepared Statements / Parameterized Queries**: Always use parameters (`?` or named placeholders) to separate SQL logic from data.
  ```php
  // PHP PDO Example: Secure prepared statement
  $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
  $stmt->execute(['email' => $email]);
  $user = $stmt->fetch();
  ```
  ```javascript
  // Node.js mysql2 Example: Secure parameterized query
  const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  ```
- **Avoid Dynamic Column/Table Names**: If you must build dynamic queries where table or column names are selected dynamically, use strict whitelisting.

---

## 3. Cross-Site Scripting (XSS) Mitigation

XSS occurs when untrusted input is reflected in the web browser without proper encoding.

- **HTML Entity Encoding**: Escape dynamic variables before inserting them into HTML content.
  - **PHP**: Use `htmlspecialchars($value, ENT_QUOTES, 'UTF-8')`.
  - **Node/Mustache**: Templates automatically escape using `{{value}}`. Avoid triple curly braces `{{{value}}}` or raw blocks unless the content was sanitized via a library.
- **Client-Side Sanitation**: If rendering user-generated HTML, always run the input through a sanitization library like **DOMPurify** before injecting it into the DOM.
- **Context-Specific Escaping**: If outputting data inside a `<script>` block, HTML attribute, CSS, or URL, use specific encoding suited for that context.
  ```javascript
  // Good: Outputting a JS safe payload
  const safeData = JSON.parse(document.getElementById('template-vars').textContent);
  ```

---

## 4. Server-Side Request Forgery (SSRF) Protection

SSRF occurs when a server fetches a remote URL provided by the user, allowing attackers to access internal network services.

- **Whitelist Allowed Domains**: If possible, only allow fetches to a predefined list of external domains.
- **Block Private IP Ranges**: Reject requests targeting localhost, local subnets, or cloud metadata endpoints:
  - Private ranges: `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.
  - Cloud Metadata (IMDS): `169.254.169.254`.
- **DNS Resolution Check**: Perform DNS resolution on the target host and verify the resulting IP address is public before executing the HTTP request (to prevent DNS pinning/rebinding bypasses).

---

## 5. Directory Traversal & File Inclusion

Avoid dynamic file path construction using raw user parameters.

- **Avoid Direct Pathing**: Never pass user input directly into file inclusion functions (e.g., `include()`, `require()`, `fs.readFile()`).
- **Path Isolation & Resolution**: If user input determines a filename, resolve the absolute path and verify it starts with the intended base directory.
  ```javascript
  // Node.js Example: Prevent directory traversal
  const path = require('path');
  const baseDir = path.resolve('/var/www/uploads');
  const targetPath = path.resolve(baseDir, req.query.file);
  
  if (!targetPath.startsWith(baseDir)) {
      throw new Error("Access Denied: Path Traversal Detected");
  }
  ```
  ```php
  // PHP Example: Using realpath
  $baseDir = '/var/www/uploads/';
  $targetPath = realpath($baseDir . $_GET['file']);
  
  if ($targetPath === false || strpos($targetPath, $baseDir) !== 0) {
      die("Access Denied");
  }
  ```

---

## 6. Safe File Upload Handling

Accepting user file uploads introduces risks of remote code execution (uploading `.php`, `.js`, or executable files), Stored XSS (via SVGs or HTML attachments), Denial of Service (unbounded file sizes), and server directory overwrites.

### Secure File Upload Checklist:
1. **Never Trust User Filenames or MIME Types**:
   - Attackers spoof `Content-Type: image/jpeg` when sending PHP scripts.
   - Never use the original filename directly. Always generate a random UUID on the server:
     ```javascript
     const safeFilename = `${crypto.randomUUID()}.${allowedExtension}`;
     ```
2. **Magic Byte / File Signature Validation**:
   - Inspect the file buffer's initial bytes to verify its true binary signature, rather than trusting the extension or client MIME type:
     ```javascript
     // Node.js example using file-type
     import { fileTypeFromBuffer } from 'file-type';

     const type = await fileTypeFromBuffer(fileBuffer);
     const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

     if (!type || !allowedMimes.includes(type.mime)) {
       throw new Error('Invalid file format');
     }
     ```
3. **Store Files Outside the Webroot**:
   - Never store uploads in a directory directly served by the web server (e.g. `public/uploads`). Storing an executable file in a web-accessible directory allows direct execution via URL navigation (`https://example.com/uploads/shell.php`).
   - Store files in dedicated private cloud storage (AWS S3, Cloudflare R2) and serve them via pre-signed temporary URLs or through a streaming download controller.
4. **SVG File Warning (Stored XSS Risk)**:
   - SVGs are XML documents that can embed `<script>` tags. If a user opens an SVG directly in a browser, embedded JavaScript executes in the user's session!
   - If SVGs must be supported:
     - Sanitize SVG contents using a dedicated sanitizer (e.g., `DOMPurify` with SVG profile).
     - Or serve SVGs with `Content-Disposition: attachment; filename="..."` and `Content-Type: application/octet-stream` so browsers force a download rather than inline rendering.
5. **Strict Size Limits**:
   - Enforce maximum upload size at both the reverse proxy (e.g., `client_max_body_size 10M;` in Nginx) and in application middleware (e.g., `multer({ limits: { fileSize: 10 * 1024 * 1024 } })`) to prevent memory exhaustion DoS.

---

## 7. Unsafe Code Execution & Prototype Pollution (JS/Node)

JavaScript applications are particularly vulnerable to prototype pollution and dynamic code evaluation.

### 1. Ban Dynamic Code Evaluation
Never pass untrusted user strings into dynamic evaluators:
- **Forbidden**: `eval()`, `new Function()`, `setTimeout(string)`, `setInterval(string)`.
- **Why**: Allows arbitrary code execution in the application context.

### 2. Prototype Pollution Mitigation
Prototype pollution occurs when user-controlled properties (such as `__proto__`, `constructor`, or `prototype`) are recursively merged into target objects, modifying the base JavaScript `Object.prototype` and affecting all objects across the Node.js process.

- **Vulnerable Pattern**:
  ```javascript
  // BAD: Naive recursive merge functions that process untrusted keys
  function naiveMerge(target, source) {
    for (let key in source) {
      if (typeof source[key] === 'object') {
        if (!target[key]) target[key] = {};
        naiveMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }
  ```
- **Defense Standards**:
  - Filter dangerous keys before merging: Reject keys named `__proto__`, `constructor`, and `prototype`.
  - Use `Object.create(null)` for key-value dictionary maps that do not inherit from `Object.prototype`.
  - Freeze base prototypes in security-critical workers: `Object.freeze(Object.prototype)`.
  - Use modern, patched utility libraries (e.g., Lodash >= 4.17.21) or language-native shallow copy (`Object.assign({}, ...)` with whitelisted DTOs).

### 3. Safe JSON Handling
Always wrap `JSON.parse()` in a `try/catch` block to handle malformed JSON gracefully without crashing the server thread. Avoid custom reviver functions that perform dynamic function instantiation.

