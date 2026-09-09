# L19 — Finish staff documentation and rehearse independent operation

**Priority:** Release gate

**Type:** Documentation / human acceptance

**Dependencies:** L13, L15, L17, L18

**Review coverage:** R10; help, ownership, backlog

**Likely code areas:** README.md; staff quick-start/troubleshooting docs; in-app help; release issue ledger

## Assignment prompt

Implement only task L19, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Enable museum staff to operate and recover the system without the original developer present.

## Scope / to-dos

- [ ] Draft the guide earlier if useful, but finalize it against the tested L18 candidate: donor change, board draft/preview/publish, scheduling, announcements, stop interruption, blank-screen recovery, and escalation.
- [ ] Replace obsolete Fire TV/prototype instructions with the approved mini-PC procedure. Label preview, shared save, player readiness, and backup/restore accurately.
- [ ] Reconcile existing bug records into a concise release ledger; do not bulk-close ready-for-test records without evidence or use changelog entries as proof of acceptance.
- [ ] Record museum account ownership, billing responsibility, recovery access, backup location/retention, update responsibility, and support contact without storing secrets.
- [ ] Observe a staff member completing core tasks using the guide without coaching; record obstacles and re-test necessary fixes.

## Acceptance criteria

- [ ] A museum staff member completes the essential workflow and basic recovery using the documentation.
- [ ] Every launch issue is verified, explicitly deferred with scope/owner, or blocking; no unresolved P0/data-loss issue is accepted by vague wording.
- [ ] Account and support ownership is acknowledged by the museum.
- [ ] Help and README match the actual installed candidate and known limitations.

## Out of scope / authority boundary

No fabricated staff sign-off, bulk bug closure, credential disclosure, new training platform, or content edits outside approved tests.

## Required handoff evidence

Quick-start and recovery guide, observed usability checklist, release issue ledger, and museum sign-off.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
