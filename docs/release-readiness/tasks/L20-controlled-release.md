# L20 — Deploy the approved candidate and complete handoff

**Priority:** Release gate

**Type:** Deployment; explicit approval required

**Dependencies:** L18, L19

**Review coverage:** Final launch gate

**Likely code areas:** approved release artifacts/workflows; deployment runbook; release record

## Assignment prompt

Implement only task L20, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Release only the tested, approved candidate without changing the museum's saved content.

## Scope / to-dos

- [ ] Verify all mandatory tasks, decisions, release-gate tests, backups, museum sign-offs, and named owners. Review actual current code/configuration before release.
- [ ] Request explicit authorization identifying candidate commit/artifact and destination environment before any production deploy, account activation, or device rollout.
- [ ] Use the staged compatibility sequence agreed in L02/L04; activate authenticated staff/paired players without exposing private data during transition.
- [ ] Deploy code/configuration only within approved scope. Do not seed, migrate, rename, reassign, or otherwise write live board content under deployment authorization.
- [ ] Perform safe read-only post-deployment checks: versions, expected display identities, health, and intended visuals. If content correction is needed, request authorization for the specific record/change.
- [ ] Record release identity, time, observed health, known limitations, and support ownership. Use the pre-approved code rollback procedure if necessary, preserving current museum data.

## Acceptance criteria

- [ ] The deployed artifact matches the accepted candidate and authorized environment.
- [ ] Both actual players show the expected approved content/version; administrative/private access remains protected.
- [ ] No saved board content/layout/typography/schedules were replaced during deployment.
- [ ] The museum receives final documentation, ownership information, and a release/support record.

## Out of scope / authority boundary

No deploy without explicit authorization; no live-state writes bundled into release; no unapproved emergency rollback or database restore.

## Required handoff evidence

Authorization reference, release/deployment record, read-only health/visual checks, and handoff acknowledgement.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
