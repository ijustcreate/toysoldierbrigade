# L03 — Validate shared writes and enforce a safe storage contract

**Priority:** P1

**Type:** Code / API

**Dependencies:** L01, L02

**Review coverage:** R4; Worker type-check failure

**Likely code areas:** worker/bugs.ts; worker/schema.sql if needed locally; src/types.ts; state serialization; Worker tests

## Assignment prompt

Implement only task L03, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Ensure invalid requests can never replace the museum's last good state.

## Scope / to-dos

- [ ] Parse and validate request envelopes and versioned state/command schemas at runtime. Reject malformed JSON, invalid references, unsupported versions, invalid time values, and unexpected shapes with actionable errors.
- [ ] Preserve optimistic concurrency and atomicity. Do not strip or rewrite approved content to make validation pass; define compatible handling for legitimate legacy/optional fields.
- [ ] Measure actual UTF-8 bytes, bound streaming/body reads, and align the accepted payload limit with the verified storage design rather than the current nominal 8 MB allowance.
- [ ] Fix the nullable request-body Worker type error and establish a strict Worker type-check command.
- [ ] Test boundary behavior with local D1-compatible storage where possible, not only an unconstrained mock database.

## Acceptance criteria

- [ ] The malformed envelope {"state":{"invalid":}} is rejected; the prior state/version remains unchanged.
- [ ] Missing/stale version, invalid references, Unicode byte boundaries, oversized/chunked requests, and unsupported schema versions produce deterministic failures without partial writes.
- [ ] Valid existing synthetic documents round-trip without dropping authored content.
- [ ] Frontend build, Worker strict type check, and relevant integration tests pass.

## Out of scope / authority boundary

No remote schema migration, database replacement, production repairs, or bulk normalization of saved museum content.

## Required handoff evidence

Schema contract, size-limit rationale, strict type-check output, and unchanged-state assertions for rejected requests.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
