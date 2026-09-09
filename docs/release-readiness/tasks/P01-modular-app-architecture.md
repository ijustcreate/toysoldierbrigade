# P01 — Extract feature workspaces from the application monolith

**Priority:** Post-launch; separately authorized

**Dependencies:** L20

**Likely code areas:** src/App.tsx; feature components; host boundaries

## Assignment prompt

Implement only task P01 after separate authorization. Read AGENTS.md, [task rules](../TASK_RULES.md), the [index](../README.md), and the accepted release evidence. Preserve production content and the accepted user workflows.

**Outcome:** Reduce App.tsx to a readable shell while preserving the accepted release behavior.

## Scope / to-dos

- [ ] Map feature ownership and state/effect dependencies before moving code.
- [ ] Extract one cohesive workspace per change with stable interfaces; prioritize editor, schedule, and display boundaries.
- [ ] Move side effects out of state updater callbacks and keep domain transformations pure.
- [ ] Remove legacy paths only after caller/runtime checks prove them unused.

## Acceptance criteria

- [ ] The complete release regression suite stays green after each extraction.
- [ ] Each extracted module has a single clear responsibility and no behavior/content migration.
- [ ] No new global state framework or cross-cutting rewrite is introduced without a separate decision.

## Out of scope

No visual redesign, feature removal by assumption, or live-data migration.

## Required evidence

Provide before/after evidence, regression results, affected bug/changelog references, compatibility risks, and the completion report required by TASK_RULES.md. Do not treat this backlog entry as a launch blocker or permission to start.
