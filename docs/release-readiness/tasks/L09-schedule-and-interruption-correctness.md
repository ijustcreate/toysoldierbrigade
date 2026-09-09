# L09 — Correct schedule units and unify what each display should show

**Priority:** P1

**Type:** Code / scheduling

**Dependencies:** L00, L01

**Review coverage:** R8; after-hours/priority mismatch

**Likely code areas:** src/scheduleResolution.ts; src/App.tsx scheduleBlip and scheduled resolvers; schedule UI

## Assignment prompt

Implement only task L09, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Make calendar duration, countdown, display selection, and return-to-board behavior agree.

## Scope / to-dos

- [ ] Use explicit time-unit helpers/types. Correct minute/hour mistakes in Blip creation and scheduled announcement/Blip duration calculations.
- [ ] Apply L00's agreed after-hours, overlap, manual interruption, dismissal, and return-to-board policy consistently to dashboard previews and players.
- [ ] Validate dates, recurrence, start/end times, and unsupported overnight ranges rather than accepting ambiguous behavior.
- [ ] Use an injectable clock for deterministic boundary tests; document the approved museum time-zone/OS clock contract.
- [ ] Preserve existing saved schedules; a code fix is not authorization to rewrite their hours or durations.

## Acceptance criteria

- [ ] A two-minute Blip at 12:00 ends at 12:02; a sixty-minute schedule produces a sixty-minute duration.
- [ ] Start/end boundaries, countdown/reveal, dismissal, overlapping targets, recurrence, and return-to-board pass deterministic tests.
- [ ] Preview and player agree on active/fallback content at the same instant.
- [ ] Invalid ranges are rejected clearly; saved authored schedules remain unchanged by normal loading.

## Out of scope / authority boundary

No live schedule repair, new scheduling product, or unapproved after-hours policy.

## Required handoff evidence

Time-unit/boundary test matrix and side-by-side preview/player assertions.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
