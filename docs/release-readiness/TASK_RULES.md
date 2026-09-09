# Rules for every Lantern release task

This backlog was requested as a plan. Writing a task card does not start implementation, create a Codex task, authorize delegation, or authorize deployment.

## Before starting an assigned task

1. Read the repository AGENTS.md completely and inspect the current git status. Preserve unrelated changes.
2. Read this file, the assigned card, and the dependency results in README.md. Re-check current code: the review baseline was September 9, 2026, commit `5288af2`, not a guarantee of the checkout you will receive.
3. If a required decision is unresolved, do safe investigation/test preparation and report the exact missing decision. Do not invent museum approval.
4. Work only on the assigned card. Separate Codex tasks or subagents are not created unless the user explicitly requests them or applicable higher-priority instructions allow them.
5. Existing supporting artifacts under `output/` are ignored by git and may not exist in a fresh worktree. Each card states its own required behavior; tests must recreate synthetic evidence rather than depend on those local artifacts.

## Production data is not test data

- Never write live `/state`, seed a live database, normalize saved museum content, or use live state as mutation-test/seed input.
- Code/configuration deployment authorization is not authorization to change a board, schedule, donor, screen assignment, typography, or other live content.
- Specific approved live-content work requires a read-only backup first. Preserve newer edits and retain version preconditions.
- Use synthetic fixtures, isolated credentials/storage/databases, and explicit local/staging endpoints for tests. Test harnesses should reject production endpoints.
- Do not restore a real museum backup into test fixtures. Rehearse restoration with synthetic archives; inspect any separately authorized production backup only through protected read-only checks.
- No account creation, billing change, external messaging, production deployment, or PC/network modification unless explicitly authorized for that operation.
- Never put donor private data, credentials, tokens, or backup contents in commits, screenshots, chat output, or task evidence.

## Bug and changelog workflow

Follow AGENTS.md, not an invented alternative:

- Before a behavior fix, locate an existing covering bug or create a visible Codex-entered bug with `npm run bugs -- add "Summary" "Details"`.
- Record analysis, implementation, and verification with `npm run bugs -- work`. Inspect the CLI help for the actual work/status syntax.
- After verification, mark the bug `ready-for-test`; this is not museum acceptance or permission to mark it verified/closed.
- After each cohesive material code/configuration change, run `npm run changelog -- add "Title" "What changed and why" --areas="Area one,Area two" --files="path/one,path/two" --tests="Verification performed"`.
- One changelog entry per cohesive user-facing change. Do not create entries for read-only investigation. Do not use the changelog as a substitute for the bug record.
- Planning documents in this backlog are not implementation completion and did not create bug records.

## Definition of done for a code task

- The card's behavioral acceptance criteria pass in the declared environment.
- Tests demonstrate user-visible behavior, not only that a source string exists.
- Relevant baseline regressions and builds pass; test omissions and hardware limitations are explicit.
- No unrelated refactor, framework migration, visual redesign, seed mutation, or added service is bundled in.
- Error paths, recovery, concurrency, and backward compatibility are verified in proportion to risk.
- Provide changed files, commands/results, bug ID(s), changelog entry, screenshots where relevant, remaining risks, and compatibility/rollback notes.
- Update the task index when authorized to maintain the backlog. Mark code `ready-for-test` until the appropriate acceptance owner verifies it. A passing browser simulation is not on-site sign-off.

## Coordination

Many tasks touch App.tsx, lanternHost.ts, or worker/bugs.ts. Prefer serial integration for each file/contract. When separate work is explicitly requested, use isolated branches/worktrees and stable interfaces; do not allow independent tasks to invent conflicting publication or schema formats.

One integration owner is responsible for combining changes and rerunning the complete suite. Do not claim a branch passed integration simply because its individual tests passed. Do not auto-commit, push, merge, or deploy unless that action is requested.

## Task completion report template

- Task ID and state: implemented / ready-for-test / verified / blocked.
- Scope completed and deliberately excluded.
- Changed files and relevant bug/changelog references.
- Acceptance criteria: pass/fail/not run, with commands or evidence paths.
- Synthetic versus actual-device environment.
- Known risks, user decisions, and dependencies unblocked.
- Exact next action; no unrequested follow-on implementation.
