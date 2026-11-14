# Browser control — setup per path

## Real Chrome: enable remote debugging (all real-Chrome paths)

Chrome 144+: open `chrome://inspect/#remote-debugging` and enable the remote debugging server.
Chrome then writes `DevToolsActivePort` in the profile directory:

| OS | File |
|---|---|
| macOS | `~/Library/Application Support/Google/Chrome/DevToolsActivePort` |
| Linux | `~/.config/google-chrome/DevToolsActivePort` (Chromium: `~/.config/chromium/…`) |
| Windows | `%LOCALAPPDATA%\Google\Chrome\User Data\DevToolsActivePort` |

Line 1 = port, line 2 = browser path → `ws://127.0.0.1:<line1><line2>`.
In this mode `http://127.0.0.1:<port>/json/version` returns 404 (normal).
Alternative: Chrome started with `--remote-debugging-port=9222` (then `/json/version` works).

Each **new connection** may show **"Allow remote debugging?"** in Chrome and block until the
user answers. The bundled helper reuses one background connection across commands, so
approval is needed only when that connection is first established. A connection that
hangs right away is almost always a pending consent prompt.

The relay closes after **30 minutes idle**, measured from the last command client
exiting. Active commands suspend the timer. `--timeout` limits one command and
does not terminate the relay. `--status` neither starts Chrome nor resets idle time;
it reports `idleExpiresAt` (epoch milliseconds, null during active commands).
`--stop` closes the connection immediately. The next browser command starts a new
one and may require approval again. No command is automatically replayed after a
transport failure.

The relay requires macOS/Linux (Unix sockets), Node ≥ 22, and permission to use local
sockets and connect to Chrome. Its socket lives in an owner-only `0700` temporary
directory and has `0600` permissions; it exposes no HTTP/TCP listener. Same-user
processes can use it. Restricted agent sandboxes may need an approved shell call.
Relay identity includes the installed helper location and `CDP_WS`/`CDP_PORT`; keep
those overrides consistent for commands, status, and stop. Distinct copies of the
helper have separate relays. Chrome restart/disconnect or relay exit ends approval.
For an already-running older relay, use `--stop` before expecting updated behavior.

### Agent sandbox cannot read the file

Some agents' sandboxes deny reading other apps' profile folders (`EPERM`). Read it outside the
sandbox (or ask the user to `cat` it) and pass the endpoint:

```bash
export CDP_WS="ws://127.0.0.1:$(sed -n 1p "$F")$(sed -n 2p "$F")"   # F = the file above
```

The path changes when Chrome restarts — re-read it then.

## chrome-devtools MCP attached to the real Chrome (row B)

Add `--autoConnect` (needs the remote debugging toggle above; conflicts with `--isolated`):

| Agent | Config |
|---|---|
| OpenCode (`~/.config/opencode/opencode.json`) | `"mcp": { "chrome-devtools": { "type": "local", "command": ["npx", "-y", "chrome-devtools-mcp@latest", "--autoConnect"] } }` |
| Claude Code | `claude mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest --autoConnect` |
| Codex (`~/.codex/config.toml`) | `[mcp_servers.chrome-devtools]` `command = "npx"` `args = ["-y", "chrome-devtools-mcp@latest", "--autoConnect"]` |
| VS Code / Copilot (`mcp.json`) | `"chrome-devtools": { "command": "npx", "args": ["-y", "chrome-devtools-mcp@latest", "--autoConnect"] }` |

Other options of that server: `--wsEndpoint ws://…` (explicit endpoint, same as `CDP_WS`),
`--browserUrl http://127.0.0.1:9222` (only with `--remote-debugging-port`), `--channel`.
Without any of these it launches its **own** Chrome (isolated profile, no user logins).

## agent-browser

`agent-browser` (CLI) is self-documenting: `agent-browser skills get core` (and `--full`) before
use. Fresh browser by default (row C); `agent-browser connect <port|ws-url>` attaches to the
real Chrome (row B) with the same endpoint as above.

## Claude in Chrome extension (Claude only)

Tools `mcp__claude-in-chrome__*` act in the user's real Chrome through the extension (row B for
Claude). Follow Claude's built-in guidance for it: check open tabs first and work in a new tab,
wait for site permissions instead of working around them, avoid actions that raise browser
dialogs, stop and ask after repeated failures. Not available to other agents.

Relay startup is serialized. If an interrupted starter leaves a `.starting`
directory, setup fails with its path after five seconds. Remove that empty
directory only after confirming no helper is still starting, then retry a read.
