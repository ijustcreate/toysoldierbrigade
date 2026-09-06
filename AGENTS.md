# Project Lantern agent workflow

After every material code or configuration change:

1. Verify the change in proportion to its risk.
2. Run `npm run changelog -- add "Title" "What changed and why" --areas="Area one,Area two" --files="path/one,path/two" --tests="Verification performed"`.
3. Keep one changelog entry per cohesive user-facing change. Do not record read-only investigation.

Bug-specific analysis and progress must also be recorded with `npm run bugs -- work`.

For every user request that asks Codex to fix, correct, or improve existing behavior:

1. Before changing code, create a visible bug record entered by Codex with `npm run bugs -- add "Summary" "Details"`, unless an existing bug already covers the request.
2. Record analysis, implementation, and verification against that bug with `npm run bugs -- work`.
3. Move the record to `ready-for-test` after verification. Do not use the changelog as a substitute for the bug record.

## Live board data safety

- Treat the shared museum state as user-owned production data. Deployments, migrations, tests, seeds, and agent startup must never replace saved board content, layout, typography, schedules, or ongoing edits.
- Do not write to the live `/state` endpoint unless the user explicitly asks Codex to edit a specific board or another specific piece of live content. Code deployment authorization alone is not authorization to change board data.
- Before approved live-state work, capture a read-only backup. Use isolated local fixtures for mutation tests; never use live state as test or seed input.
- Preserve newer shared changes and reject stale whole-state writes. Do not bypass state-version preconditions or restore defaults over user-authored content.
