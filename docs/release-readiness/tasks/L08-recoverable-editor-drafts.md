# L08 — Keep board drafts safe across navigation and restart

**Priority:** P1

**Type:** Code / editor UX

**Dependencies:** L06, L07

**Review coverage:** R3

**Likely code areas:** src/App.tsx editor/navigation; draft persistence module; LanternDialog.tsx; browser tests

## Assignment prompt

Implement only task L08, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Prevent silent draft loss while keeping unpublished edits separate from approved shared content.

## Scope / to-dos

- [ ] Persist drafts per board/device/user as appropriate to the approved access model, including base version needed by L07.
- [ ] Implement Save/Discard/Stay for in-app destructive navigation and appropriate browser reload/back protection; restore drafts after restart.
- [ ] Recover a stored draft against the latest published state through L07's conflict handling, not by replacing the whole shared document.
- [ ] Handle account changes, multiple boards, explicit discard, successful save cleanup, and unavailable draft storage safely.
- [ ] Make draft/published/pending labels truthful. Do not introduce a new global publish model without coordinating L04/L12.

## Acceptance criteria

- [ ] Changing a board name, visiting Donors, and returning does not silently lose the draft.
- [ ] Reload/restart recovers the draft; discard is explicit; successful publication clears only the corresponding committed draft.
- [ ] An older recovered draft cannot overwrite unrelated newer content.
- [ ] Keyboard-only users can complete all guard-dialog choices and recover focus.

## Out of scope / authority boundary

General undo/redo and protected-layout mode are P04; no auto-publication or live board edits.

## Required handoff evidence

Browser tests for navigation, restart, account change, conflict recovery, and storage failure.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
