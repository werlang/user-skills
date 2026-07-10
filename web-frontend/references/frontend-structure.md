# Frontend Structure Reference

This reference defines a reusable structure for server-rendered web frontends.

## Folder Layout

```text
web/
  app.js
  middleware/
    render.js
  src/
    js/
      home.js
      components/
      helpers/
      models/
```

## Rules

- Root page files in `src/js/` bootstrap each page.
- `components/` contains DOM-related classes.
- `helpers/` contains support utilities such as `Api`, `LocalData`, and `TemplateVar`.
- `models/` contains entity classes that call the API.
- Render middleware injects server-side values into the browser.

## Bootstrap

- Start from `references/mini-project/web/app.js`.
- Keep API calls inside frontend models and helper classes.