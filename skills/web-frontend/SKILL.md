---
name: web-frontend
description: Build or refactor reusable server-rendered web frontends using Express, render middleware, template variables, page entry files in src/js root, DOM-related component classes in components/, support helpers in helpers/, and API-backed entity classes in models/. Automatically triggers frontend-design, impeccable, and css-standards when building or styling UI pages, and security-defense-and-mitigation for web security headers, secure cookies, and CSRF protection. Use when scaffolding or reorganizing frontend projects that consume an API through frontend model methods.
---

# Web Frontend

Use this skill when the web layer should follow this structure:

- Express web server.
- Render middleware for shared server-to-browser variables.
- Page entry files in `src/js` root.
- `components/` for DOM classes.
- `helpers/` for support utilities.
- `models/` for frontend entities that call the API.
- ESM only.
- Named exports only.

## Required Structure

```text
web/
	app.js
	middleware/
	src/
		js/
			home.js
			components/
			helpers/
			models/
```

## Responsibilities

- `web/app.js`: configure Express, templates, static assets, page routes, and render middleware.
- `middleware/render.js`: inject template vars into the page.
- `src/js/*.js`: page bootstrap files.
- `src/js/components/`: classes that own DOM behavior and rendering.
- `src/js/helpers/`: API wrapper, `LocalData`, `TemplateVar`, translators, or similar support code.
- `src/js/models/`: entity classes that call the API through the helper.

## Rules

- Frontend code reaches the API through model methods.
- Page files should not scatter raw endpoint calls everywhere.
- Use a helper that exposes `get`, `post`, `put`, and `delete`.
- Use `LocalData` for browser persistence.
- Use `TemplateVar` for server-injected runtime values.
- Keep DOM-specific logic inside components.
- Never store application data in DOM `data-*` attributes. Data attributes are for framework selectors and DOM behavior hooks only. All domain data (IDs, values, lookup mappings) must live in dedicated JavaScript structures — plain objects, Maps, or class properties. When rendering a list of selectable items, build a lookup map keyed by element ID or index and resolve data from the map at interaction time instead of reading `getAttribute('data-*')`.
- **Maintainability & Simplicity**: Default to simple, direct, non-overengineered frontend code. Avoid unnecessary wrapper components, duplicate network requests, or excessive abstraction layers. Keep UI behavior clear, safe, and performant.

## Automatic Companion Skills

- **UI & Page Design**: When building, redesigning, or styling web pages and views:
  - Automatically apply [`frontend-design`](../frontend-design/SKILL.md) for distinctive creative direction, deliberate typography, and custom palette tokens instead of generic templates.
  - Automatically apply [`impeccable`](../impeccable/SKILL.md) for production-grade craft, surface-mode execution (`Persuade` / `Operate` / `Read` / `Experience`), responsive polish, accessibility, and micro-interactions.
  - Automatically apply [`css-standards`](../css-standards/SKILL.md) for shared CSS tokens (`var(--font-*)`), scoped component nesting under `web/src/css/`, and brand consistency.
  - Run [`ui-ux-auditor`](../ui-ux-auditor/SKILL.md) to validate end-to-end user journeys and catch friction in the rendered browser view.
- **Frontend Security & Hardening**: When configuring `web/app.js`, sessions, cookies, or templates:
  - Automatically apply [`security-defense-and-mitigation`](../security-defense-and-mitigation/SKILL.md): enforce multi-tier HTTP security headers (CSP, HSTS, X-Content-Type-Options, X-Frame-Options), secure session cookie attributes (`HttpOnly; Secure; SameSite=Strict`), CSRF protection on forms, and XSS auto-escaping in templates.
- **Object-Oriented Architecture**:
  - Apply [`clean-code-and-oop`](../clean-code-and-oop/SKILL.md) when structuring component classes, event listeners, and API model wrappers.

## References

- Read `references/frontend-structure.md` for the generic structure.
- Read `references/mini-project/` for a small starter frontend.
- Pair with [`frontend-design`](../frontend-design/SKILL.md), [`impeccable`](../impeccable/SKILL.md), [`css-standards`](../css-standards/SKILL.md), [`clean-code-and-oop`](../clean-code-and-oop/SKILL.md), and [`security-defense-and-mitigation`](../security-defense-and-mitigation/SKILL.md).
