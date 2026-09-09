# L13 — Finish essential staff controls and accessibility

**Priority:** P1

**Type:** Code / UI

**Dependencies:** L08, L09, L12

**Review coverage:** Surface review; announcement clipping; unnamed mobile navigation

**Likely code areas:** src/App.tsx; styles.css; LanternDialog.tsx; affected feature components

## Assignment prompt

Implement only task L13, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Make essential daily workflows understandable and usable at the agreed staff viewport without losing the museum's identity.

## Scope / to-dos

- [ ] Fix announcement control overflow, accessible navigation names, keyboard focus traps/restoration, and critical clipped/tiny controls.
- [ ] Standardize Save preset, Send now, Schedule, End now, and per-display targeting; use L12 status rather than decorative success labels.
- [ ] Keep donor public-name/program information easy to find and separate private administration fields under the approved roles.
- [ ] Explain Blips in plain language; organize restricted maintenance versus daily operations without removing approved features.
- [ ] Verify critical dialogs and affected primary workspaces at L00's supported viewport, 1440px desktop, and narrow-width accessibility smoke checks. Do not claim full mobile support unless tested.

## Acceptance criteria

- [ ] All essential actions remain reachable without offscreen clipping at the supported desktop size.
- [ ] Navigation and dialogs have meaningful accessible names; keyboard focus is trapped/restored correctly.
- [ ] A staff user can identify target TV, action, duration, publication state, and stop/recovery control without developer vocabulary.
- [ ] No unexpected layout regressions in dashboard, donors, editor, calendar, announcements, Brigade, and settings.

## Out of scope / authority boundary

No broad rebrand, global CSS rewrite, speculative dashboard features, or unapproved feature hiding.

## Required handoff evidence

Before/after screenshots, keyboard walkthrough, accessibility checks, and core workflow browser tests.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
