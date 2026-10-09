# Bug Heuristics — High-Risk Defect Patterns

Apply during Standards/Spec discovery alongside `code-smell-baseline.md`. Each item needs a runnable `input/state → actual vs expected` sketch with a realistic caller. No realistic caller = drop or Low.

## Backend — prioritize behavior, data, permission, money, stability risks

- **Over-broad guards** — acceptance criteria wider than the documented contract (auth, tenancy, ownership). Cue: guard condition missing a documented check; probe with a cross-user / cross-tenant / unauthenticated caller.
- **Lossy round-trips** — dates, money, or IDs converted through lossy forms. Cue: `toLocaleString`, float math on cents, `String(id)` normalizations; probe with DST boundary, fractional cent, case-variant ID.
- **Skipped defaults** — default applied in one layer, silently absent in another. Cue: `?? default` in writer but not reader (or vice versa); probe with omitted field.
- **Partial async success** — flow can partly succeed and leave inconsistent state. Cue: sequential awaits without transaction/saga/compensation; probe with mid-flow failure.
- **Retry/dedup hazards** — retry duplicates work or suppresses real errors. Cue: retry without idempotency key, dedup swallowing error detail; probe with duplicate delivery.
- **Optional-dep startup crash** — background/startup imports optional dep without isolation. Cue: top-level import of optional package outside try/guard; probe with dep missing.
- **Happy-path-only tests** — state machine has N branches, tests cover one. Cue: attachment of single-case test to multi-branch transition; probe with the uncovered branch.

Also watch: request validation/serialization/status mapping; workflow guards/retries/idempotency; expiry/scheduling/range math; persistence normalization/filtering/pagination/transaction boundaries; email/webhook/queue/storage/index/cache side effects; error wrapping that hides the failure mode.

## Frontend — prioritize user behavior, submitted data, visible state, shipped assets

- **Hook/selector drift** — markup hooks changed without matching selector/test updates. Cue: `data-testid` / class rename with stale `querySelector` / test selector; probe with the renamed element.
- **DOM-as-store** — domain data in `data-*` instead of JS structures. Cue: `getAttribute`, `dataset` reads carrying IDs/values/lookups; probe with stale attribute after re-render.
- **State/URL loss** — filters/pagination change UI without preserving state, defaults, or deep links. Cue: `setState` without router sync; probe with reload / back-button / shared link.
- **Unsafe redirects / stale auth** — flows trusting redirect targets or stale client state. Cue: `redirectTo` from query param without allowlist, token read once at boot; probe with external URL / expired token.
- **Unnormalized dates** — submitted without normalization or displayed with TZ drift. Cue: raw `<input type=datetime>` value sent as-is; probe with non-UTC locale.
- **Dead-end busy/error states** — controls disabled too early, never recover, or hide the message. Cue: `disabled` set before request with no `finally` reset; probe with failed submit → retry.
- **Build drift** — source changed but shipped bundle/CSS/asset not regenerated. Cue: `dist/` / checked-in output newer source than artifact; probe by rebuilding and diffing.
- **Markup-exists tests** — assertions prove rendering, never the interaction/failure/empty branch. Cue: `toBeInTheDocument()` with no event/failure coverage; probe with the failing branch.

Also watch: route-to-view/SSR/template/bundle-entry contracts; component state, tabs, modals, optimistic updates; login/logout/token persistence/gated routes; form validation/retry/recovery; focus order, labels, keyboard flows, disabled controls.

## How to use

- Include the applicable section in full in the Standards sub-agent brief based on diff paths (`api/`, `services/`, `workers/` → backend; `web/`, `components/`, `templates/` → frontend; both when crossing API↔client or schema↔model boundaries).
- Every probe still needs evidence: quote code, name the caller, state maintenance/user cost.
