---
name: modern-web-guidance
description: Pinned local copy of the browser vendors' Modern Web Guidance (Chrome, Edge, Firefox and MDN teams), 209 guides on current HTML, CSS and client-side JS platform features. Use when implementing or fixing web UI, CSS layout or animation, forms, accessibility, client-side performance, dates and time zones, HTML sanitizing, passkeys, web components or built-in browser AI, before hand-rolling a component, writing a workaround or adding a front-end dependency. Not for backend, infrastructure, build tooling or tests.
license: Apache-2.0. Guides copied unmodified from GoogleChrome/modern-web-guidance; see LICENSE.txt.
---

# Modern Web Guidance

The guides in `guides/` steer implementations away from legacy patterns that dominate training data and toward native platform features, with browser-support data and fallbacks for each.

## Source and pinning

- Upstream: `https://github.com/GoogleChrome/modern-web-guidance`, commit `4dd968349e54ca45a05dd5c818fb035c9054b022` (2026-11-10), skill version `2026_11_09-5bcc021b`.
- The guides are vendored unmodified so they can be diffed against a later upstream commit. Refresh by replacing `guides/` with the upstream folder at a newer commit, rerunning the cross-reference check below, regenerating `references/index.md` with `python3 -I scripts/build-index.py`, and updating the commit line above.
- **Never run the upstream CLI** (`npx modern-web-guidance@latest …`). It fetches an unpinned package on every call. Everything it would return is already in this folder.

## Workflow

1. **Find the guide.** Search [`references/index.md`](references/index.md) for the user-visible capability or the feature name (`dialog`, `light dismiss`, `container query`, `autofill`, `INP`). Split compound tasks into one lookup per capability. If the domain wording does not match, translate it to the implied UI primitive ("confirm before deleting" → dialog). A plain text search across `guides/` is the fallback.
2. **Read it, plus its discipline guide.** Read the matching guide in full and the broader one for its area when it applies: `css`, `html`, `forms`, `accessibility`, `color`, `performance`, `security`, `motion`.
3. **Resolve cross-references locally.** Guides cite each other as `npx -y modern-web-guidance@latest retrieve "<id>"`. Treat that only as a pointer: read `guides/<category>/<id>.md` (the ID is the file name; the index gives the path).
4. **Apply, then verify.** Before finishing, check the code against the guide's DO/DON'T rules and its fallback requirements. Do not force unrequested features into the task.
5. **Mention it briefly.** When a guide changed the implementation, name the guide ID and the pitfall it avoided in the normal summary. No separate mandatory section is required.

## Precedence

- The project's own rules and our global standards win over these guides where they conflict. In particular, keep [`css-standards`](../css-standards/SKILL.md) rules such as the `!important` ban, the `data-*` rule, mobile-first `min-width` breakpoints and token ownership, and adapt the guide's example code to them.
- The guides are written in vanilla HTML, CSS and JS. Adapt them to the project's framework without dropping the native feature; for example, call `showModal()` through a ref and generate per-instance IDs and `anchor-name`s.
- Design direction stays with [`frontend-design`](../frontend-design/SKILL.md) and [`impeccable`](../impeccable/SKILL.md). These guides supply mechanics, not aesthetics.

## Browser support

The browser-support target is a project decision, recorded in the project's `AGENTS.md` or `CLAUDE.md`. If the project states one, use each guide's "Baseline since" and support data against it; a `Baseline YYYY` target accepts any feature whose Baseline year is at or before `YYYY`. If the project states none, follow the guides' default: Baseline Widely available features need no fallback, and anything newer must use the fallback the guide prescribes. When a fallback would be large or the target is unclear, ask the user rather than choosing one.

## Validation

Run from this skill directory after a refresh:

```sh
find guides -name '*.md' -exec basename {} .md \; | sort | uniq -d   # must print nothing
grep -rhoE 'retrieve "[^"]+"' guides | sed 's/retrieve "//;s/"$//' | tr ',' '\n' | sed 's/^ *//' | sort -u \
  | comm -23 - <(find guides -name '*.md' -exec basename {} .md \; | sort)   # must print nothing
```
