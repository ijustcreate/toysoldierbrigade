# L04 — Separate paired display access from private staff state

**Priority:** P0

**Type:** Code / player protocol

**Dependencies:** L02, L03

**Review coverage:** R1; target architecture

**Likely code areas:** worker/bugs.ts; src/types.ts; src/host/lanternHost.ts; DisplayApp in src/App.tsx; signaling

## Assignment prompt

Implement only task L04, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Give each TV an identifiable read-only published feed without sending it private administration data.

## Scope / to-dos

- [ ] Define an allowlisted, versioned display payload containing only what rendering and approved scheduling require; exclude gift administration, contacts, internal notes, users, and audit history.
- [ ] Implement the approved pairing, credential storage, revocation, and replacement-device workflow. A player must not obtain staff write authority.
- [ ] Authenticate device signaling and bound message types/sizes; isolate display heartbeat/acknowledgement permissions from content mutation.
- [ ] Adapt the player to the new payload and maintain an explicit migration/compatibility path until staff app and both players are updated.
- [ ] Define publication IDs and acknowledgement fields used later by L11/L12. Document the contract so parallel work does not invent competing versions.

## Acceptance criteria

- [ ] Each synthetic player receives the correct assigned content with no excluded private fields, even nested in objects.
- [ ] A paired player cannot edit state, upload arbitrary assets, impersonate staff, or control another player outside the approved protocol.
- [ ] Revoked/unpaired devices fail safely; credential expiry and recovery do not reveal private content.
- [ ] The authenticated staff and player flows pass end-to-end tests together.

## Out of scope / authority boundary

No live pairing, production permissions rollout, donor content changes, or automatic reassignment of existing screens.

## Required handoff evidence

Display-payload schema, role/device tests, pairing/revocation runbook, and compatibility plan.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
