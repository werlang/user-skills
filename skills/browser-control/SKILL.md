---
name: browser-control
description: Decide how to drive a web browser and then do it — the user's real logged-in Chrome over CDP (scripts/cdp.mjs), chrome-devtools MCP with --autoConnect, agent-browser, a fresh isolated browser (Playwright/agent-browser), the Claude in Chrome extension, or no browser at all. Use for any task that opens, reads, clicks, fills, scripts, tests, records or screenshots a web page or web app, especially when it needs the user's existing session ("my tab", "where I'm logged in", internal/admin systems).
---

# Browser control

Pick the path with the decision table, then follow the shared discipline. Setup details for
every path: `references/setup.md`.

## 1. Decide

Ask, in order:

1. **Does it need a browser at all?** Public content, an API, a file → use web fetch / `curl` /
   the API directly. Stop here.
2. **Does it need the user's session** (logged-in site, internal system, a tab they already
   have open, data only visible to them)? → **real Chrome** (row A or B).
   Otherwise (public site, local dev server, QA of your own app, scraping) → **fresh isolated
   browser** (row C) — never use the user's Chrome for anonymous browsing.
3. **What kind of work is it?**

| | Work | Use | Why |
|---|---|---|---|
| **A** | Run code in the page: read/write data through the site's own API, inject a tool/script, repeatable checks, file uploads to a page tool, screenshots for review | `node scripts/cdp.mjs` (this skill) | any agent with a shell; full JS in the page; JSON out; exit codes; versionable; explains connection failures |
| **B** | Operate an unfamiliar UI by visible elements (click/fill by accessibility snapshot), follow console/network over time, performance traces, emulation | chrome-devtools MCP **with `--autoConnect`**, if the agent has it · else `agent-browser connect <ws>` · else (Claude only) the Claude in Chrome extension | persistent connection, element refs, built-in network/console/perf tools |
| **C** | Anything that must not touch the user's profile | `agent-browser` (load its guide: `agent-browser skills get core`) or Playwright / chrome-devtools MCP default (isolated profile) | clean, disposable, no risk to the user's tabs |
| **D** | A native desktop app window, not a web page | desktop GUI automation tooling | GUI automation outside the browser |

Mixing is fine: B to explore a screen, A to automate what you learned.
A chrome-devtools MCP **without** `--autoConnect` (or with `--isolated`) is row C, not B: it
launches its own Chrome without the user's logins — the usual reason "the agent can't do it".

## 2. Shared discipline (every path)

1. **Say where you are acting**: which tab/URL/account/document. Re-check it before any write —
   sites change ids and documents between sessions.
2. **Read first.** Look at the page state or fetch the data before changing anything.
3. **Learn before guessing.** Unknown request format? Install `scripts/recorder.js`, ask the user
   to do the action once by hand, read `window.__rec.calls`. Or search the site's own JS bundle
   for the endpoint/op name. Prefer this over trial-and-error writes.
4. **No write without approval** of the exact change. Then: backup the before-state, write,
   **re-read and compare every field you meant to change** (a 200/"ok" proves nothing), keep an
   undo path. Prove new write semantics on disposable data you create and delete in the same run.
5. **Look at the result.** Screenshot (`--shot`, `--clip`) and actually inspect it.
6. **Respect the user's browser.** Don't navigate, reload or close their tabs (use `--open` for
   your own tab and close it), don't trigger `alert/confirm/prompt` (they block everything),
   don't leave injected state or test data behind.
7. **Stop and ask** after 2 failed attempts at the same thing, when the browser asks for a
   permission ("Allow remote debugging?", site permission, login), or when a dialog is open.

## 3. Real Chrome via `scripts/cdp.mjs` (row A)

Prerequisite (once, by the user): Chrome 144+, `chrome://inspect/#remote-debugging` → enable.

```bash
S=<this skill>/scripts
node $S/cdp.mjs --list                                   # pages; pick a URL regex
node $S/cdp.mjs --tab 'host\.com/app' --expr 'document.title'
node $S/cdp.mjs --tab 'app' --pre helper.js --eval check.js
node $S/cdp.mjs --tab 'app' --pre $S/recorder.js --expr '"recording"'
node $S/cdp.mjs --tab 'app' --attach '#file=a.csv' --click 'button.go' --wait 2000 --expr 'window.result'
node $S/cdp.mjs --tab 'app' --expr '1' --shot /tmp/x.png --clip '#panel'
node $S/cdp.mjs --open 'https://host.com/page' --close --expr 'document.title'
```

- Each call is one short connection. Put state you need between calls on `window.*`
  (helpers via `--pre`), long code in files (`--eval file.js`), files via `--attach` — never
  giant shell strings.
- Expressions may return promises; the result must be JSON-serializable.
- Selectors in `--attach/--click/--clip` also search open shadow roots.
- Exit 2 prints what to fix. Most common: **"Allow remote debugging?"** waiting in Chrome
  (ask the user, retry once) and **sandbox can't read `DevToolsActivePort`** → set `CDP_WS`
  (`references/setup.md`).

## 4. Projects

A project can ship its own skill on top of this one (site-specific tab regex, auth token
discovery, injected tools, proven API semantics) and may vendor a copy of `scripts/cdp.mjs`.
Read the project skill first when it exists; this skill supplies the method.
