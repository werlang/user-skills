# How much of a coding agent's subscription is left

Use when the user asks for agent usage, quota, limits or reset times, or when a session has to answer "can I still
work?" across several agents on one machine — the desktop Herdr app answers it in its status bar; a phone app, a TUI or
a script needs the same numbers without that UI.

## Where the desktop keeps its answer

The gauge is a mod (`herdr-usage-status`), not a core feature: a `main.js` drawing a 28 px bar plus one helper script per
provider, polled on its own interval, cached to hidden `.cache-*.json` files beside the mod, and contributed to the layout
as a `status` block through `mod.json`. Read the installed mod before writing anything — it is the reference for the
endpoints, the header names and the response shapes the vendors actually accept, and it names the shape of the answer the
user is used to (used %, `% left`, reset countdown, `live`/`cached`/`stale`).

Anatomy worth knowing when you open it: `View` subclasses from `gpui-kit` (imported as `import { View, div, svg } from
"gpui-kit"`), the app's own modules from `herdr` (`spaces, agents, theme, run, window, keys, exec, appHome`), helpers
resolved relative to `appHome()`, and a panel opened on click. Nothing there is reusable outside that runtime — what you
copy is the knowledge, not the code.

## Why it does not port as it is

The helpers are macOS-shaped: the Claude one shells out to `security find-generic-password` for the login Keychain, and a
portable implementation cannot. Everything else (HTTP to a usage endpoint, a local CLI, a JWT in a config file) is
platform-independent, so reimplement the readers around the credential **locations of each platform**, and keep the
provider a module rather than a branch inside one script.

## Provider sources, in the order the CLIs keep them

- **claude** — the OAuth token Claude Code stores: an environment override if the user has one, else
  `~/.claude/.credentials.json`, else the macOS Keychain (`Claude Code-credentials`). Then
  `api.anthropic.com/api/oauth/usage` with the CLI's own beta header (`anthropic-beta: oauth-2025-04-20`) and a
  `claude-code/<version>` User-Agent; the interesting fields are `five_hour`, `seven_day`, `seven_day_opus`,
  `seven_day_sonnet`, each `{utilization, resets_at}`.
- **codex** — `$CODEX_HOME/auth.json` (else `~/.codex/auth.json`), then `chatgpt.com/backend-api/wham/usage` with the
  bearer plus `ChatGPT-Account-Id` read from the token's claims when `auth.json` omits it. Windows are reported by **slot**:
  `primary_window` is the 5-hour one, `secondary_window` the weekly one, and a window may carry `used_percent`,
  `percent_left`, `reset_at`/`resets_at` or `reset_after_seconds` — normalise all four shapes instead of reading one.
- **opencode** — no credential to read: ask the local daemon, `opencode api GET /api/experimental/usage/limits`, which
  answers `data.go.{rolling,weekly,monthly}` as `{percent, limited, resetsAt}` (milliseconds) plus the workspace name. If
  the daemon answers, the user is signed in.
- **copilot** — the CLI's own SDK next to the installed `copilot` binary (`@github/copilot-*/copilot-sdk`),
  `client.rpc.account.getQuota()`, then `premium_interactions`/`premium_requests`/`chat` snapshots. Optional everywhere:
  absent is normal, not an error to report.

## Rules that make the numbers trustworthy

- **Never refresh a token the CLI owns.** The rotation belongs to the CLI, and a meter that refreshes races it and rotates
  the credential behind the CLI's back. An expired session is a reported reason, never a repair.
- **A provider that fails is data, not an exception.** One provider unreachable must not empty the document: a Linux box
  without Claude still has to show Codex and OpenCode. Exit non-zero only on a usage error (an unknown provider name).
- **"Could not ask" and "nothing left" are different answers.** Keep them apart in the output (`ok: false` + reason +
  elapsed ms) instead of rendering a failing provider as 0 % — that is the bug every naive meter ships.
- **Cache the last good answer per provider and label it.** On a failure keep the previous numbers with `cached: true` and
  the reason as `warning`, so a 429 does not turn the gauge into an alarm; put the cache under a private directory
  (`~/.cache/<tool>/`, mode 600) and expire it (a week is enough for a limit that resets inside it).
- **No secret in the output.** Utilization percentages, reset timestamps and a plan name only — never a token, an account
  id or a raw response body.
- Platform detection stays out of the providers that do not need it: only the Claude credential lookup branches on
  `sys.platform`.

## The portable implementation

`scripts/agent-limits.py` is that reader: `python3 agent-limits.py [--pretty] [provider ...]` prints one JSON document
`{generated_at, host, platform, providers: {<name>: {ok, windows, …}}}`, with `windows` per provider (`five_hour`,
`seven_day` for the token-based ones; `rolling`, `weekly`, `monthly` for OpenCode). Verified on macOS and on Linux; the
only provider that behaves differently per platform is Claude, and its failure message says which location it looked at.

Prove it the way any peer integration is proved: run it on the host in question, then stub each provider in a test and
assert the three invariants — a raising provider does not remove the others, an unknown name is a usage error, and a
cached fallback keeps `ok: true` with its `warning`. Normalise the window shapes with their own unit tests
(`percent_left: 30` means 70 % spent, `reset_after_seconds` is a countdown against the clock at read time) — those two
conversions are where a meter silently reports half the usage it should.
