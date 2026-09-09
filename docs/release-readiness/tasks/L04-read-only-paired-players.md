# L04 — Give displays a minimal rendering feed

Read `../RELEASE_DECISIONS.md` first. The user chose intentionally open editing and deferred access restrictions. A minimal display payload reduces unnecessary data transfer and coupling; it does not make the public staff state private. Do not require pairing credentials or login for launch.

**Priority:** P1

**Type:** Code / player protocol

**Dependencies:** L03; L02's open-access decision is resolved

**Review coverage:** R1; target architecture

**Likely code areas:** worker/bugs.ts; src/types.ts; src/host/lanternHost.ts; DisplayApp in src/App.tsx; signaling

## Assignment prompt

Implement only task L04, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Give each TV an identifiable rendering feed that omits unnecessary administration data, without changing staff access.

## Scope / to-dos

- [ ] Define an allowlisted, versioned display payload containing only what rendering and approved scheduling require; exclude gift administration, contacts, internal notes, users, and audit history.
- [ ] Keep display assignment and replacement usable without a new authentication or pairing barrier. The player rendering path must not mutate board content.
- [ ] Validate and bound signaling message types/sizes; keep display heartbeat/acknowledgement operations separate from content mutation. Do not describe device identifiers as authenticated identities.
- [ ] Adapt the player to the new payload and maintain an explicit migration/compatibility path until staff app and both players are updated.
- [ ] Define publication IDs and acknowledgement fields used later by L11/L12. Document the contract so parallel work does not invent competing versions.

## Acceptance criteria

- [ ] Each synthetic player receives the correct assigned content with no excluded private fields, even nested in objects.
- [ ] Normal player operation performs no board-content writes. Document that the intentionally public editor/API remains reachable; do not claim server-enforced player/staff isolation.
- [ ] Missing/invalid display assignments fail safely without rewriting saved boards or auto-reassigning devices.
- [ ] Open staff and player flows pass end-to-end tests together, including fresh-device access and reconnection.

## Out of scope / authority boundary

No live pairing, production permissions rollout, donor content changes, or automatic reassignment of existing screens.

## Required handoff evidence

Display-payload schema, data-minimization and non-mutating player tests, device setup instructions, and compatibility plan.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
