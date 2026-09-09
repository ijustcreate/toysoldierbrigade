# L02 — Enforce authenticated staff permissions at the service boundary

**Priority:** P0

**Type:** Code / security

**Dependencies:** L00, L01

**Review coverage:** R1

**Likely code areas:** worker/bugs.ts; src/host/lanternHost.ts; src/App.tsx user/session UI; deployment configuration

## Assignment prompt

Implement only task L02, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Prevent anonymous or unauthorized callers from reading administrative state or changing museum content/control operations.

## Scope / to-dos

- [ ] Implement the approved identity approach from L00 with server-side verification, expiration/revocation handling, and the agreed role matrix.
- [ ] Cover every applicable route: administrative state, assets, live/WebSocket signaling, bug operations, and control messages. Audit actual route coverage; CORS and state-version headers are not authentication.
- [ ] Remove the local selectable name as a source of trusted audit identity. Preserve useful display names while deriving identity from the authenticated principal.
- [ ] Provide clear signed-out/session-expired behavior that preserves recoverable drafts and does not bypass permissions.
- [ ] Prepare a staged rollout and rollback procedure so access changes do not unexpectedly strand existing players. Do not provision accounts or activate production policies without explicit approval.

## Acceptance criteria

- [ ] Anonymous requests cannot obtain private state or mutate any protected route, including direct non-browser requests and WebSocket/control attempts.
- [ ] Authorized and unauthorized roles pass a route-by-role integration test matrix; forged client identity does not alter audit ownership.
- [ ] Secrets do not enter frontend bundles, logs, URLs, screenshots, or the repository.
- [ ] Session expiry/revocation and local development behavior are tested without an unauthenticated production bypass.

## Out of scope / authority boundary

No production rollout, account creation, unrelated security redesign, or live donor changes.

## Required handoff evidence

Authorization matrix, synthetic integration results, redacted configuration instructions, and rollout/rollback plan.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
