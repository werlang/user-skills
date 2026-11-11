# herdr-core / `hc`

`herdr-core` is the detached server that owns terminals. `hc` is its CLI alias (`~/.local/bin/hc -> herdr-core`), so every command here works as `hc ...`. Verified layout on the rpi5: single static ELF, `hc --version` → `hc 0.1.14`.

This is core/server administration. Driving panes and agents that belong to a user's TUI session is still client work and stays behind the `HERDR_ENV=1` rule in SKILL.md; inspection, install and update of the core do not.

## Surface (condensed from `hc --help`)

Terminals:

- `hc run <cmd|template> [task]` — run it and wait like a shell; `--bg` does not wait
- `hc ls` (`--all` includes finished), `hc get <t>`, `hc read <t>`, `hc attach [t]` (ctrl+\ detaches)
- `hc kill <t>`, `hc rm <t>`, `hc label <t> k=v...`, `hc keep <t> [--off]` (replace a lost program with a shell)
- `hc send <t> <text>`, `hc keys <t> <keys...>`, `hc interrupt <t>`, `hc wait <t>` (`--output X`, `--children`)
- `hc put <t> <file>`

Without a terminal:

- `hc exec [--on <machine>] <cmd>` — prints exactly what the command wrote, exits with its code; `-i` feeds stdin
- `hc file read|write|edit [--on <machine>] <path>` — `--old X --new Y` for exact replacement

More:

- `hc templates`, `hc events` (follow changes live)
- `hc server start|stop|status|restart` — stopping *parks* kept terminals; the next core start gives them shells again
- `hc update [--version X.Y.Z] [--from <file>] [--force]`
- `hc machine add|ls|login|update|rename|rm` — other machines reached over ssh

## Update semantics

`hc update` swaps this binary and restarts, and terminals keep running. `--version X` means *at least* X — nothing changes when the installed build is already that or newer. `--force` is required to install an older build or another protocol generation; saved state only moves forward.

## State and sockets

- state: `~/.local/state/herdr-core/<session>/` → `terminals.json`, `peers.json`, `docs.json`, `core.json`, `core.log`, `screens/`, `execs/`
- runtime: `/run/user/<uid>/herdr-core/<session>.sock` plus `<session>.holder.<id>.sock`
- default session name: `default`

`terminals.json` is the record of every terminal the core ever ran: `argv`, `cwd`, `state` (`finished` once dead), `pid`, `exit_code`, `keep`, `labels`. Dead entries persist — a non-empty list is not proof anything is running; cross-check with `ps`.

## Machine links

`hc machine ls` lists saved remote profiles in JSON; an empty list is normal on a host that is only ever *reached* rather than reaching out, and it is not a pane inventory. The inbound direction shows up in `ps` as `herdr-core connect` (with `serve` and `hold`) inside the ssh session that spawned it — that is how another machine's Herdr drives this host's core over the tailnet.

## Installing on a new host

```sh
curl -fsSL https://releases.herdr.dev/core/install.sh -o /tmp/hc-install.sh
sh /tmp/hc-install.sh        # or pipe straight to sh
```

- Reads `<releases>/core/latest.json`, takes the `os-arch` entry, verifies the tarball's sha256, and runs the extracted binary once before installing — an unrunnable build fails at install time instead of at first use.
- Writes `~/.local/bin/herdr-core` and creates `~/.local/bin/hc` only when no `hc` already exists there; an existing install is swapped through `hc update --from`, so its running terminals survive.
- Knobs: `HC_INSTALL_DIR` (e.g. `/usr/local/bin`), `HC_VERSION=x.y.z` to pin, `HERDR_RELEASES_URL` for a mirror.
- A fresh install starts no core; the first client call does. Builds exist for Linux and macOS on x86_64 and aarch64 (Windows x86_64) — "no build for this arch" is not the explanation for a failure on `amd64`/`arm64`.

## Proving a host is ready for a remote client

A client that drives this host over SSH runs `hc connect` in a **non-login** shell: no `~/.profile`, so `~/.local/bin` is usually absent from `PATH` and the client reports a missing core rather than a PATH problem.

```sh
sudo ln -sf "$HOME/.local/bin/hc" /usr/local/bin/hc      # or install with HC_INSTALL_DIR=/usr/local/bin
ssh host 'command -v hc; hc --version'                    # must answer on a fresh connection
```

Then prove the wire the client speaks, from the machine that will hold the client's key:

```sh
printf '{"jsonrpc":"2.0","id":1,"method":"hello"}\n' | ssh host 'hc connect'
```

Read `generation` (clients gate on an exact value), `version`, `features` and the `methods` list, then call two or three methods the client uses. Measured on 0.1.19 against a 0.1.18 fixture set: `terminal.run`/`send`/`read`, `machine.exec`, `doc.get`/`doc.set` and `events.subscribe` (`{channel, seq, terminals}`) are unchanged, and `terminal.interrupt` still answers `{"key":"ctrl+c","outcome":"exited"}`.

Check the terminal entries too when the client renders its own list: agent terminals carry `status` as `{app, state}`, plain programs as a string, and a strict client drops the whole snapshot when a single entry does not decode — a shape change reads to the user as "no agents".

## Errors

Usage errors are JSON: `{"error":{"kind":"usage","message":...,"hint":"see `hc --help`"}}`, often with a near-miss suggestion. `hc status` does not exist; server state is `hc server status`, terminals are `hc ls`.
