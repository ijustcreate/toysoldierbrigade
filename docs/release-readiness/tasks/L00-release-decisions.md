# L00 — Confirm release scope, access model, and hardware target

**Priority:** Required

**Type:** Decision / read-only

**Dependencies:** None

**Review coverage:** R1, R8, R10; hardware and scope decisions

**Likely code areas:** README.md; package.json; src-tauri/; deployment documentation

## Assignment prompt

Implement only task L00, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Produce a museum-approved release contract before architecture choices or feature restrictions are implemented.

## Scope / to-dos

- [ ] Confirm exact Glorin model, operating system/edition, memory, graphics/HDMI capabilities, museum network owner, and the two physical TV locations. Record unverified facts as unknown.
- [ ] Agree who may administer, edit, publish, and operate broadcasts. Recommend an authentication approach compatible with the existing hosting, including player credential lifecycle and recovery. Document the chosen approach rather than silently choosing an external service.
- [ ] Confirm which launch workflows are mandatory. Recommend boards, donors, calendar, announcements, and basic recovery as the core; do not disable existing advanced features without approval.
- [ ] Agree after-hours content, interruption priority/return behavior, staff-supported viewport, museum time zone, and who approves final donor wording/artwork.
- [ ] Record external-service costs, account changes, PC configuration, and deployment actions that need separate authorization.

## Acceptance criteria

- [ ] A decision register separates confirmed decisions, proposed defaults, and unresolved choices with owners.
- [ ] Authentication and player deployment choices include rationale, rollout compatibility, and a recovery path.
- [ ] No unresolved dependency is represented as an approved decision; downstream tasks can identify exactly what is blocked.

## Out of scope / authority boundary

No code changes, accounts provisioned, feature removal, device changes, deployments, or live-state edits.

## Required handoff evidence

Decision register and named acceptance owner. Hardware details must come from verified specifications or the actual PCs, not guesses.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
