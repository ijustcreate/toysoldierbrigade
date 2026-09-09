# L11 — Persist a complete last-good player snapshot and recover safely

**Priority:** P1

**Type:** Code / player

**Dependencies:** L04, L06, L10

**Review coverage:** R5

**Likely code areas:** DisplayApp; displayStateRefresh.ts; host storage; player app-shell/cache implementation

## Assignment prompt

Implement only task L11, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Keep approved display content available through network failure and process restart.

## Scope / to-dos

- [ ] Persist the validated published snapshot and required assets atomically; activate a new version only when complete.
- [ ] Implement app-shell and asset availability for the chosen player route, not just JSON caching. Handle cache/storage quota and incomplete downloads explicitly.
- [ ] On cold start, render the last approved snapshot or a deliberate first-install safe screen—never silently use demo content as the museum board.
- [ ] Keep stale-refresh protection, bounded retries, and recovery behavior compatible with credentials, revocation, and approved offline policy.
- [ ] Define cache versioning/update behavior so deploying new code does not reset content or strand an old cache.

## Acceptance criteria

- [ ] A fresh paired player loads synthetic published content, goes offline, closes/reopens, and shows that same complete board.
- [ ] Missing assets, interrupted updates, corrupt cache, unavailable storage, and authentication renewal fail safely.
- [ ] Older responses cannot roll back newer accepted versions; reconnect converges to the newest approved version.
- [ ] No assumption that an ephemeral browser session preserves local state is left untested.

## Out of scope / authority boundary

Actual PC installation is L15; no live content seeding, caching private administration data, or claims of physical-device certification.

## Required handoff evidence

Cold-start/offline browser tests, cache lifecycle contract, and failure-injection results.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
