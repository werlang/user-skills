# Offline write queue (PWA)

A screen that says "salvo" before the network agreed is a lie the user will discover in the
teachers' room. These are the invariants that survive review; every one of them has been shipped
broken at least once by a worker that only tested the happy path.

## Order of operations for one write

1. Build the intent in memory: an `id` for the entity, one **idempotency key** for the intent, the payload.
2. Persist it — and await the **storage transaction's commit**, not the request's success.
3. Only then show the confirmation ("Salvo neste celular; envio pendente").
4. Flush: send with the same key; on success mark `accepted` and keep the server response.
5. On retry, resend a **byte-identical** body with the **same** key.

## Pitfalls that survive unit tests

- **Resolve on commit, not on request success.** `IDBRequest.onsuccess` fires before the transaction
  commits; a later `onabort` leaves a confirmed intention that was never stored. Resolve in
  `transaction.oncomplete`, reject in `onerror` and `onabort`, and surface the failure to the screen.
- **One idempotency key per intent, reused on every attempt.** Derive any dependent id from that key
  (`id = f(key)`), never generate it fresh inside the send path: a retry with a new child id sends a
  different body, and the server answers the replay with a body-hash conflict instead of the stored
  response.
- **Cap check and insert in the same transaction.** Counting in one transaction and inserting in
  another allows 501 rows at a 500 cap under two tabs; under concurrency both pass the check.
- **Undo means two different things.** *Never sent* → delete the queued item, done. *Sent, response
  lost* → enqueue an undo operation that depends on the original. Treating any queued item as
  "never sent" deletes a write the server already accepted: the UI says "desfeito" and the debt stays.
- **Person switch is a security boundary, not a refresh.** Close the database on `versionchange`; treat
  `deleteDatabase` `onblocked` as failure (another tab still holds the queue); stamp every queued
  operation with its person and have the BFF reject a declared person that differs from the session
  (409) **before** calling the API; never flush person A's queue with person B's cookie.
- **No secrets in Cache Storage.** A server-rendered page that embeds a PIX key, token or balance is
  personal data: exclude those paths from the navigation cache by path *and* by a content check, bump
  the shell version so old caches are dropped, and serve the offline version of those screens from
  IndexedDB, namespaced per person. A cached shell must never be served to a different person.
- **Errors must survive the user moving on.** Writing the failure into the DOM node of the item the
  user just replaced loses it (the node is gone, the operation is `needs_attention`, the person saw
  "Registrado"). Keep failed/attention operations in a persistent list rendered from queue state.
- **Backoff and `Retry-After`.** 2/4/8/16/32/60 s with jitter; respect `429 Retry-After`; park a
  definite 4xx (except 401/408/429) as `needs_attention` without blocking unrelated operations; on 401
  pause the queue and re-identify rather than retrying with a stale cookie.
- **Background Sync is a bonus, not the mechanism.** Flush on load, on `visibilitychange`, on `online`
  and on a timer; iOS has no Background Sync.

## Verifying it

- Unit-test the queue as a pure module: enqueue → flush → retry → cancel, ordering, cap, dependency.
- Then exercise it in a real browser with the API stopped: enqueue, kill the tab, reopen, confirm the
  item survives and is sent exactly once.
- After a person switch, assert both the isolation (old queue and shell gone) and the refusal (a write
  stamped with the other person's id gets 409).
- Reopen a personal page that was visited online, with the network off: it must render data, not an
  empty shell.
