---
name: web-frontend
description: Build or refactor reusable server-rendered web frontends using Express, render middleware, template variables, page entry files in src/js root, DOM-related component classes in components/, support helpers in helpers/, and API-backed entity classes in models/. Use when scaffolding or reorganizing frontend projects that consume an API through frontend model methods.
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

## References

- Read `references/frontend-structure.md` for the generic structure.
- Read `references/mini-project/` for a small starter frontend.
- Pair this with `css-standards` when styling the UI.
