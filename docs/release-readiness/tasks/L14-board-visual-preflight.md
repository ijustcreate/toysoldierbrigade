# L14 — Repair bundled asset defects and add board preflight checks

**Priority:** P1

**Type:** Code / visual verification

**Dependencies:** L04, L10

**Review coverage:** R9; font determinism

**Likely code areas:** public/assets/donor-icons/toy-soldier.png; src/main.tsx fonts; board renderer/editor; asset tests

## Assignment prompt

Implement only task L14, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Catch missing assets and clipping before a board reaches visitors, without automatically redesigning approved content.

## Scope / to-dos

- [ ] Recover the corrupted toy-soldier PNG from a verified original/history/source if available. Do not silently redraw or substitute the museum's illustration.
- [ ] Verify offered font families/weights are deterministically available; preserve approved typography and disclose missing originals.
- [ ] Add or improve missing-asset, text-overflow, safe-bound, and minimum-legibility preflight signals using synthetic boards.
- [ ] Render representative landscape 3840×2160 and portrait 2160×3840 fixtures, including long donor names, accented characters, maximum roster sizes, and missing media.
- [ ] Prepare an explicit museum-artwork approval list for L18. Existing live content may be visually inspected read-only; changes to named boards require separate approval.

## Acceptance criteria

- [ ] Bundled raster validation passes or any unavailable original is explicitly blocked with no silent replacement.
- [ ] Representative boards have no unnoticed clipped text/missing media at both orientations.
- [ ] Warnings identify the affected panel/asset and do not auto-change staff-approved layout.
- [ ] Browser results are labeled as browser evidence, not physical-TV sign-off.

## Out of scope / authority boundary

No live artwork edits, wholesale font replacement, broad redesign, or AI-generated replacement branding without approval.

## Required handoff evidence

Asset validation, font inventory, 4K screenshots, and preflight test matrix.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
