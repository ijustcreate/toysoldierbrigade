# L01 — Make the review failures reproducible in isolated tests

**Priority:** P1

**Type:** Code / tests

**Dependencies:** None

**Review coverage:** R2–R8; test coverage gap

**Likely code areas:** scripts/test-*.mjs; test fixtures; package.json; src/stateAuthority.ts; worker/bugs.ts

## Assignment prompt

Implement only task L01, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Create an offline-safe behavioral regression foundation that demonstrates the reported failures and supports subsequent fixes.

## Scope / to-dos

- [ ] Re-run the current build and all scripts/test-*.mjs; inventory meaningful assertions versus source-text checks.
- [ ] Create synthetic fixtures for concurrent donor/board edits, draft navigation loss, invalid JSON writes, current-version schedule mutation, unavailable storage, player offline restart, and schedule duration units.
- [ ] Make test servers use isolated databases/storage and explicit non-production endpoints; fail fast on a configured production endpoint.
- [ ] Provide one documented command for regression execution. Browser tests need deterministic clocks, separate browser contexts where applicable, and fixture cleanup.
- [ ] Record currently failing cases explicitly. Establish a visible baseline rather than hiding failures or making assertions match the defects; owning fix tasks make them required green gates.

## Acceptance criteria

- [ ] Every specified counterexample has an executable reproduction or a precise pending browser-test case owned by a named downstream task.
- [ ] Tests cannot accidentally mutate the live Worker/state endpoint.
- [ ] Baseline output identifies expected existing failures separately from new regressions; none can be silently skipped for final release.

## Out of scope / authority boundary

No production fixes beyond minimal testability seams; no real museum data in fixtures; no dependency/framework replacement.

## Required handoff evidence

Baseline commands/results, synthetic fixtures, and a failure-to-task mapping.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
