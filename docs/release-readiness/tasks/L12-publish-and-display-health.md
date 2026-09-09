# L12 — Show truthful save, publication, and per-TV delivery status

**Priority:** P1

**Type:** Code / operations UI

**Dependencies:** L04, L07, L11

**Review coverage:** R6, R10; misleading System ready

**Likely code areas:** dashboard; shared save status; paired-player heartbeat/ack; host signaling

## Assignment prompt

Implement only task L12, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Let staff distinguish saved work from content actually received and rendered by each player.

## Scope / to-dos

- [ ] Use L04's publication IDs and device identity; report last contact, received version, render-ready version, pending/error state, and next scheduled content.
- [ ] Replace unconditional System ready with evidence-based states. Distinguish stale heartbeat from confirmed failure.
- [ ] Separate local preview/window controls from remote player controls with clear labels.
- [ ] Ensure acknowledgements occur after validating/loading the intended content, not merely opening a connection.
- [ ] Keep telemetry minimal and authenticated; do not send private donor information in health messages. Explain that software readiness cannot prove the TV is powered on.

## Acceptance criteria

- [ ] Two simulated players show independent version/status; an offline player is never marked updated.
- [ ] Failed asset/render preparation prevents a rendered-version acknowledgement.
- [ ] Save local, save shared, publish pending, and player ready are distinguishable and recover correctly after reconnect.
- [ ] Dashboard labels identify main-hall versus entrance players without relying on local window indexes.

## Out of scope / authority boundary

No live display renaming/reassignment, always-green synthetic health, or external monitoring subscription.

## Required handoff evidence

Two-player status tests, stale/failed acknowledgement cases, and dashboard screenshots.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
