# P02 — Consolidate the design system and reduce CSS overrides

**Priority:** Post-launch; separately authorized

**Dependencies:** L20

**Likely code areas:** src/styles.css; component CSS; shared UI controls

## Assignment prompt

Implement only task P02 after separate authorization. Read AGENTS.md, [task rules](../TASK_RULES.md), the [index](../README.md), and the accepted release evidence. Preserve production content and the accepted user workflows.

**Outcome:** Keep the museum's visual identity while making styles predictable and maintainable.

## Scope / to-dos

- [ ] Inventory typography, spacing, colors, status styles, buttons, dialogs, and layout primitives.
- [ ] Introduce a restrained token/component layer and migrate one surface at a time.
- [ ] Remove redundant overrides only with rendered regression evidence.
- [ ] Preserve Brigade identity and approved display typography; improve consistency rather than rebranding.

## Acceptance criteria

- [ ] Key desktop and 4K screenshots remain approved; accessibility does not regress.
- [ ] Duplicate/important overrides decrease through verified changes, not blanket removal.
- [ ] New shared controls have documented states and keyboard behavior.

## Out of scope

No wholesale restyle, new branding, or speculative theme proliferation.

## Required evidence

Provide before/after evidence, regression results, affected bug/changelog references, compatibility risks, and the completion report required by TASK_RULES.md. Do not treat this backlog entry as a launch blocker or permission to start.
