# Failure modes seen in practice

## Dispatch and liveness

- Sending the task to an agent that is still booting, then assuming it arrived.
- Pasting the brief into a pane and trusting that it was submitted. A long paste
  plus one Enter loses the Enter, and a CLI that self-updates on start eats the
  first one; the text sits in the input box looking delivered. Send the text,
  then Enter as its own keystroke, then confirm the agent is in a working state.
- Reading "the call reported started" as "the worker started". The proof is a
  first `working:` line within a minute; twenty minutes of a quiet pane is a
  dispatch failure to investigate, not work in progress.
- Discovering the worker's model and effort after round one.
- Spending premium turns on "still working, waiting again".

## Brief quality

- Writing a brief that contradicts itself: a compile-SDK floor on one line, and
  dependencies on another that require a higher one. Read the brief as the build
  will, check every version it names against every other one, and name the exact
  command set that may not change.
- Leaving a gate bendable. A worker resolves a red gate the cheapest way — opts
  out of the very feature being migrated, re-records the reference images to
  match the new output, or accepts a toolchain default that silently drops a
  whole suite from the gate. Require a `decision(assumed):` line before any of
  that moves, and diff the command set, not only the test count.
- Writing acceptance criteria the environment cannot produce (a host that is
  down, a credential that no longer exists). Check the door opens before you
  make a row depend on it.

## Evidence and verification

- Treating a green run on one platform as evidence for another: reference images,
  fonts, signing and device behaviour belong to the platform that owns them. Run
  the code loop where it is fast, collect the evidence where it is
  authoritative, and say which machine produced which number.
- Accepting "dependency bumped" as a fact. Read what moved: bytecode level (a
  JVM 21 artifact will not load in a JVM 17 test runner), minimum compile SDK,
  and the transitive classpath — a library can pull its own Compose or material
  version over the app's BOM. Ask for the resolved classpath diff.
- Treating unit tests as proof that the app runs. A library/activity mismatch
  compiles, passes a thousand tests and crashes on launch; a smoke run on the
  target device is a gate, not a nice-to-have.
- Acting on a review comment without checking it against the current tree. After
  a rebase or an amended base, findings describe a head that no longer exists:
  verify with a command, answer with that command, then resolve the thread.
- Restating someone else's sentence as your own claim. If a comment, a commit
  message or a PR body asserts a fact, put the command that proves it next to
  it; reviewers read claims literally and they are usually right.
- Accepting "done" whose evidence contradicts the screenshot.
- Trusting a worker report read from scrollback that was truncated.
- Treating a passing load check as proof the feature works.

## Budget

- Starting a long round without checking the account's remaining usage. A cap
  mid-round leaves the branch at `incomplete:` and the restart waits for the
  reset; check the meter before a multi-hour job, and say the reset date in the
  report.
