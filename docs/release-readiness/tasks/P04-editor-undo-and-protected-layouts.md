# P04 — Add reliable undo/redo and protected staff editing

**Priority:** Post-launch; separately authorized

**Dependencies:** L20

**Likely code areas:** board editor/domain commands; draft history; layout controls

## Assignment prompt

Implement only task P04 after separate authorization. Read AGENTS.md, [task rules](../TASK_RULES.md), the [index](../README.md), and the accepted release evidence. Preserve production content and the accepted user workflows.

**Outcome:** Make advanced board editing safer without changing approved published designs.

## Scope / to-dos

- [ ] Implement bounded per-board undo/redo for meaningful operations, including deletion and text/layout edits.
- [ ] Keep undo local to a draft; published/concurrent edits must still use the conflict-safe workflow.
- [ ] Add optional layout protection, alignment/snapping, and clear keyboard alternatives for hidden pointer gestures.
- [ ] Keep preflight feedback useful for long names, density, and readability.

## Acceptance criteria

- [ ] Undo/redo survives supported draft recovery and never rolls back unrelated shared edits.
- [ ] Locked layouts prevent accidental geometry changes while allowing approved content edits.
- [ ] History size/performance and keyboard workflows have behavioral tests.

## Out of scope

No live board restyling or automatic donor-content changes.

## Required evidence

Provide before/after evidence, regression results, affected bug/changelog references, compatibility risks, and the completion report required by TASK_RULES.md. Do not treat this backlog entry as a launch blocker or permission to start.
