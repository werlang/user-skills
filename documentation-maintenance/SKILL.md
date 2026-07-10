---
name: documentation-maintenance
description: Keep project documentation, agent guidance, comments, and validation instructions synchronized with the real implementation. Use after any feature, refactor, bug fix, test change, dependency/config/runtime update, API or UI contract change, file-layout change, environment variable change, build/deploy workflow change, or durable project convention update that could make README files, docs, AGENTS.md, .github/copilot-instructions.md, .agents skills/prompts, comments, JSDoc/docstrings, or checked-in guidance stale.
---

# Documentation Maintenance

Use this skill as the final consistency pass for changes that may alter how people or agents understand, run, test, operate, or extend a project.

## Core Rule

Treat documentation and agent guidance as part of the implementation. If code, tests, configuration, commands, contracts, routes, schemas, workflows, or conventions change, check whether the relevant docs and guidance still describe the real project. Update stale guidance in the same pass.

Treat code comments and doc comments as part of the same consistency pass. If touched code has stale, incomplete, misleading, or noisy comments, update them with the implementation instead of leaving separate readability debt.

## Discovery

Start from the repository in front of you. Do not assume a specific stack, directory layout, package manager, documentation style, or agent convention.

Check only files relevant to the current diff, using this order:

- Root orientation files such as `README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `docs/**`, package READMEs, or project-specific guides.
- Agent guidance such as `.github/copilot-instructions.md`, `.agents/**`, prompts, skills, and other checked-in AI instructions.
- Runtime and validation references such as package scripts, Compose files, Dockerfiles, CI workflows, Makefiles, environment examples, deployment guides, and test docs.
- API, UI, CLI, data, or configuration contract docs that mention changed names, routes, commands, flags, schemas, environment variables, files, or user-facing behavior.
- Touched code comments and doc comments for exported functions, class methods, constructors, materially changed private helpers, and non-trivial local logic.

Skip edits only after verifying that existing docs and comments still match the implementation.

## Update Workflow

1. Identify the behavior, contract, workflow, or convention delta from the diff.
2. Search for stale references with targeted `rg` queries using changed route names, command names, package scripts, env vars, filenames, class/function names, config keys, UI labels, schema fields, and user-facing terms.
3. Read the nearest documentation owner before editing. Prefer the document that already owns the topic.
4. Update the narrowest accurate owner first. Do not spread the same detail across many docs unless each location needs it for discoverability.
5. Keep public docs practical and user-facing. Put deep implementation contracts, agent workflow detail, and maintenance rules in developer or agent guidance.
6. If the rule affects future agent behavior, update the relevant checked-in agent guide, skill, prompt, or Copilot instruction.
7. Review touched code comments before finishing: complete doc comments, remove comments that narrate obvious statements, and add focused local comments where ordering, invariants, fallback logic, edge cases, or non-obvious constraints are hard to infer.
8. Validate references by checking that mentioned files, commands, routes, scripts, env vars, and docs exist or are intentionally described as external.
9. Run the lightest reliable validation available for the kind of change. If no runtime validation is appropriate, run syntax, link/path, or targeted search checks and report that scope.

## Comment And Doc Comment Standard

Use the host language's native documentation style: JSDoc for JavaScript/TypeScript, docstrings for Python, XML docs for C#, rustdoc for Rust, Javadoc/KDoc for Java/Kotlin, and so on.

- Every touched exported function, public class method, constructor, and materially changed private helper should have a current doc comment unless the surrounding codebase clearly uses a different standard.
- Doc comments should include a concise description, each argument with a useful description, and the return value. When relevant, document thrown errors, side effects, async behavior, mutation, persistence, events, or important invariants.
- Prefer precise domain types over vague placeholders such as `*`, `Object`, `Function`, `mixed`, or `any` when the local shape is known. When exact structural types would be noisy, document the important fields and behavior in prose.
- Keep local comments sparse and explanatory. Add them around non-obvious ordering, cache precedence, data normalization, state transitions, concurrency, retries, validation boundaries, DOM timing, security constraints, migrations, and edge-case handling.
- Remove or rewrite comments that describe the next line mechanically, mention abandoned ideas, contradict the code, or preserve obsolete behavior.

## Ownership Heuristics

- Setup, install, and first-run changes usually belong in the root README and any getting-started guide.
- Commands, scripts, Docker, CI, deployment, and environment changes usually belong near the runtime docs and the files that define those commands.
- API, CLI, event, database, schema, cache, and integration contract changes usually belong in contract docs, route/command docs, generated OpenAPI or schema files, and relevant tests/guides.
- UI behavior, accessibility, i18n, browser state, and user-flow changes usually belong in user-facing docs only when users need to know them; otherwise update developer or test guidance.
- Test layout, coverage expectations, fixtures, and validation workflows usually belong in testing docs and agent/developer guidance.
- Cross-cutting conventions usually belong in root agent guidance, Copilot instructions, contribution docs, or a focused skill/prompt.
- Code comment and doc comment quality should be fixed in the touched files and captured in durable guidance only when it changes future expectations.

## Done Criteria

- Stale docs found by targeted search are updated, or explicitly left unchanged because they still match the implementation.
- New or changed commands, paths, env vars, routes, schemas, flags, workflows, and behavior notes are documented in the correct owner.
- Agent/developer guidance remains concise and does not duplicate large public-doc sections.
- Touched code has useful, current doc comments and only high-signal local comments.
- Final response names the docs, guidance, or comments changed, or states that the documentation check found no required edits.
