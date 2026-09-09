# L06 — Unify durable saves and expose storage failures honestly

**Priority:** P1

**Type:** Code / persistence

**Dependencies:** L01

**Review coverage:** R6

**Likely code areas:** src/host/lanternHost.ts save functions; sharedSaveQueue.ts; persistence callers; storage tests

## Assignment prompt

Implement only task L06, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Return success only after the intended persistence operation has actually succeeded.

## Scope / to-dos

- [ ] Consolidate saveLanternState/saveLanternStateDurably behavior around awaited typed outcomes without adding another competing persistence API.
- [ ] Audit callers and distinguish local draft persisted, shared save accepted, pending sync, conflict, and failed persistence.
- [ ] Preserve the last good copy during localStorage/IndexedDB fallback, quota exhaustion, interrupted writes, and cleanup.
- [ ] Ensure retry and recovery do not silently clear unsent work, downgrade shared authority, or claim a shared save while offline.
- [ ] Keep data-access changes scoped; expose status information for L08/L12 rather than redesigning the whole UI.

## Acceptance criteria

- [ ] Both local stores unavailable yields an explicit failure, never true/saved.
- [ ] Fallback failures preserve recoverable data and produce an actionable state.
- [ ] Successful writes are acknowledged only after completion; pending/failure states remain distinguishable.
- [ ] Storage, shared-save-queue, and state-authority regressions pass.

## Out of scope / authority boundary

No global storage reset, live-state replacement, unrelated UI redesign, or offline publication as if it were server-confirmed.

## Required handoff evidence

Failure-injection tests, updated persistence contract, and a caller audit.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
