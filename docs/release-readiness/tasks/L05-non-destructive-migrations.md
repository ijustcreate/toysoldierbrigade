# L05 — Stop normal loading from rewriting approved content

**Priority:** P1

**Type:** Code / data preservation

**Dependencies:** L01

**Review coverage:** R7

**Likely code areas:** src/host/lanternHost.ts normalizeState; src/sampleData.ts; phase3Schedule.ts; preservation tests

## Assignment prompt

Implement only task L05, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Make current-version state loading preservation-safe and separate seeds from deliberate migrations.

## Scope / to-dos

- [ ] Reproduce the existing schedule-portrait-board fixture at current contentVersion: 09:00–16:00 must remain unchanged after loading/normalization.
- [ ] Inventory normalization rules that alter hours, donor categories, program membership, vocabulary, board panels, typography, backgrounds, or assignments.
- [ ] Separate new-install seed creation, safe structural defaults, and explicit version-gated migrations. Eliminate recurring museum-policy edits from ordinary loads.
- [ ] Make migrations deterministic and idempotent, with a documented field-level change contract and recovery requirements.
- [ ] Expand synthetic preservation fixtures across current and older supported versions, including custom and seed-derived IDs.

## Acceptance criteria

- [ ] Current-version authored content is unchanged after repeated normalization, including exact approved hours and board geometry.
- [ ] Supported migrations run only for their declared source versions and change only documented fields.
- [ ] New installation seeds still work without being applied over existing records.
- [ ] No live state is read into mutation tests or written by the migration test harness.

## Out of scope / authority boundary

No real museum content migration, bulk cleanup, reclassification, default restoration, or destructive schema changes.

## Required handoff evidence

Migration inventory, before/after synthetic diffs, idempotence assertions, and preservation regression results.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
