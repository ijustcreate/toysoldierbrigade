# P05 — Mature advanced broadcast, effects, and recording workflows

**Priority:** Post-launch; separately authorized

**Dependencies:** L20

**Likely code areas:** broadcast/media modules; effects; recording library; signaling; advanced UI

## Assignment prompt

Implement only task P05 after separate authorization. Read AGENTS.md, [task rules](../TASK_RULES.md), the [index](../README.md), and the accepted release evidence. Preserve production content and the accepted user workflows.

**Outcome:** Make advanced capabilities reliable where the museum has an approved real-world use case.

## Scope / to-dos

- [ ] Confirm actual operator workflows and recording consent/retention requirements before expanding features.
- [ ] Test real camera/microphone permissions, device unplugging, feedback, reconnection, and stop/return behavior.
- [ ] Validate museum network connectivity and add managed relay infrastructure only if needed and approved.
- [ ] Keep experimental tracking/effects behind a clear advanced workflow and provide export/storage cleanup controls with explicit destructive confirmation.

## Acceptance criteria

- [ ] Each enabled advanced workflow passes actual-device and network tests with a named staff owner.
- [ ] Recording location, portability, retention, and deletion consequences are explicit.
- [ ] Performance and failure handling protect the underlying recognition boards.

## Out of scope

No speculative effects, paid services, recording people, or media deletion without appropriate authorization.

## Required evidence

Provide before/after evidence, regression results, affected bug/changelog references, compatibility risks, and the completion report required by TASK_RULES.md. Do not treat this backlog entry as a launch blocker or permission to start.
