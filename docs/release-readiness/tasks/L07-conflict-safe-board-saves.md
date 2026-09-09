# L07 — Prevent board saves from overwriting concurrent edits

**Priority:** P1

**Type:** Code / editing

**Dependencies:** L03, L05, L06

**Review coverage:** R2

**Likely code areas:** src/App.tsx ThemeStudio/saveBoard; sharedSaveQueue.ts; stateAuthority.ts; host publish boundary

## Assignment prompt

Implement only task L07, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Save precisely the edited entities while preserving unrelated newer work and surfacing true conflicts.

## Scope / to-dos

- [ ] Capture the draft base and actual edits. Replace stale whole-collection replacement with narrowly scoped operations or a tested three-way merge compatible with L03.
- [ ] Preserve the server's version precondition across every retry. Fetching a new version must not authorize replaying unrelated stale values.
- [ ] Handle updates, additions, deletions, reordering, and references without resurrecting deleted records or losing new records.
- [ ] Provide a conflict outcome that retains both versions and offers an explicit resolution path; do not silently choose local or remote.
- [ ] Move merge logic into a focused testable module; avoid a broad App.tsx refactor in this task.

## Acceptance criteria

- [ ] Two browser contexts: A drafts a board change, B changes a donor, A saves; both approved changes survive.
- [ ] Concurrent edits to another board, screen assignment, widgets, and newly added/deleted records are preserved or explicitly conflicted.
- [ ] Same-field conflicts retain both versions; no automatic last-write-wins bypass.
- [ ] Offline/reconnect and stale-retry cases cannot clobber newer shared content.

## Out of scope / authority boundary

No live-state tests, default restoration, manual bypass of version guards, or speculative collaborative-editor framework.

## Required handoff evidence

Two-context browser recordings/results and a merge/conflict test matrix.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
