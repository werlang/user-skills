# Harness probes and role capabilities

Run these before dispatching a role, and again immediately before re-dispatching after a blocker.
Every probe is one shot, cheapest model call available, and prints the exact refusal text when it
fails — never a substitute model the owner did not name.

## One-shot availability probe

| Harness | Probe |
|---|---|
| `claude` | `claude -p "diga ok" --model <id> --effort <level>` |
| `codex` | `codex exec --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check -m <model> -c model_reasoning_effort="medium" "diga ok"` |
| `agy` | `agy --model <id> --effort <level> --output-format json --print="Responda apenas: ok"` |
| `opencode` | `opencode run --auto -m "opencode-go/<model>" "diga ok"` (add `--format json` for a parseable envelope) |

Unknown model ids arrive by name from the owner (`fable`, `gemini-4-neon-medium`, `gpt-6.2-sol`).
Probe the literal id; if it fails, quote the error and wait for a replacement instead of picking the
nearest known model.

## Owner shorthand → invocation

The owner names roles by family, not by flag (`"agy neon low"`, `"opencode ds 4.1 max"`). Resolve to exact
flags before probing, and echo the resolved form back when confirming the assignments:

| Said | Harness, model, effort |
|---|---|
| `agy neon low` | `agy --model gemini-4-neon --effort low` |
| `agy argon medium` | `agy --model gemini-4-argon --effort medium` |
| `opencode ds 4.1 max` | `opencode run --auto -m "opencode-go/deepseek-v4.1-flash#max"` |

A family name alone is **not** a model id: `agy --model neon` exits `status: ERROR` and prints every model with
its effort level. Read that list, take `<family>` plus the effort the owner named, re-probe — and never report
the family name as an unavailable model.

**On `agy` the effort is sometimes part of the id, and `--effort` is then refused.** Gemini ids take the flag
(`--model gemini-4-argon --effort medium`); Claude ids carry it (`--model claude-opus-5-5-medium`) and the same call with
`--effort medium` exits `invalid model selection …: --effort is not supported for model "claude-opus-5-5"`. Run
`agy models` and copy the **first column** — the display column (`Gemini 4 Argon (Medium)`) is not an id, and a guessed
punctuation variant (`claude-opus-5.5-medium`) fails the same way. Two probes settle any new id: the literal one, then the
opposite effort form.

## Full tech-lead invocation, brief on disk

```sh
agy --model gemini-4-neon --effort low --dangerously-skip-permissions \
    --add-dir "$REPO" --output-format json --log-file /tmp/techlead.log \
    --print="$(cat /tmp/techlead-brief.md)" > /tmp/techlead.json 2>/tmp/techlead.err
```

Without `--dangerously-skip-permissions` the run stops on the first tool approval and looks like a stall.
Keep the brief in a file: it carries the verified state and the review checklist, and passing it as one
`--print="$(cat …)"` argument avoids the flag-swallowing below. Run it with `background=true` plus a log
file, then confirm the process exists before telling the owner it was dispatched.

## Reading a refusal

- **"You've hit your usage limit … try again at HH:MM"** — a real quota wall. Carry the reset time
  verbatim, then re-read the clock at dispatch: the window may already be open by the time the
  brief is written.
- **The same text while a run of that harness is live** — a refused second session, not exhaustion.
  Check `ps -eo pid,etime,args | grep <harness>` first; if a session is running, the account is fine.
- **"Failed to authenticate: this login reached its time limit"** — an expired login, not a quota.
  It needs an interactive `claude auth login` by the owner; say so and do not retry in a loop.
- **The owner insists he just logged in and it worked for him** — the grant is stored **per user**:
  `~/.claude/.credentials.json` under the HOME of whoever ran the login. An agent whose shell runs
  as another user (root versus `ubuntu`) reads a different, stale file and keeps failing. Check that
  file's mtime and JSON (`accessToken`/`refreshToken` empty, `expiresAt: 0`, `loginEnded:
  "time_limit"`) and `ls -d /home/*/.claude` for a second store; a credential file rewritten at the
  moment of your own failed attempt is your attempt, not his login. The fix is `claude auth login`
  under the same user/HOME the dispatch runs as, or `claude setup-token` plus
  `CLAUDE_CODE_OAUTH_TOKEN` for unattended runs — quote the file evidence instead of retrying.

## Capability probe by role

Availability is not capability. A model can answer `ok` and still be unable to act:

- **Tech lead** — needs shell, file writes and the ability to invoke the other two harnesses. Probe
  with a real command: `agy … --add-dir <repo> --print="Rode no shell: git -C <repo> log --oneline -1 ."`.
- **Supervisor** — needs to read the tree and run the reproduction. Probe with a read command, and
  keep it read-only in the brief ("writes only `findings.md`").
- **Worker** — needs writes confined to one worktree. State the worktree path in the brief; a worker
  without one edits the wrong tree.

## `agy` invocation pitfalls

The prompt must be glued to the flag (`--print="…"`); passing it as a separate argument swallows the
next flag. `--json-schema` requires `--output-format json`, and `--add-dir` is what gives the model
sight of the repository. The stdout envelope carries `status`, `response`, `duration_seconds`,
`num_turns` and `usage` — read `duration_seconds` and the tail of `response` to detect a run that
stopped mid-delegation instead of trusting `status: SUCCESS`.

## Killing and sweeping

```sh
ps -eo pid,etime,args | grep -E "(claude|codex|agy|opencode)" | grep -v grep
kill -9 <wrapper_pid> <harness_pid> <worker_pid>
ps -p <pid> >/dev/null 2>&1 && echo alive || echo stopped
```

Never `pkill -f <pattern>`: the pattern matches the shell running the command itself. After a kill,
re-list and kill the worker CLI the harness spawned — it survives under `init` and keeps writing to
the worktree the next round is about to use.
