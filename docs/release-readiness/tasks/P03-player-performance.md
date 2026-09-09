# P03 — Split player delivery and optimize measured bottlenecks

**Priority:** Post-launch; separately authorized

**Dependencies:** L20

**Likely code areas:** entry points; Vite configuration; fonts; display refresh protocol; heavy imports

## Assignment prompt

Implement only task P03 after separate authorization. Read AGENTS.md, [task rules](../TASK_RULES.md), the [index](../README.md), and the accepted release evidence. Preserve production content and the accepted user workflows.

**Outcome:** Reduce startup/network/resource cost using actual mini-PC measurements.

## Scope / to-dos

- [ ] Measure player/admin bundle, startup, memory, network, and animation/video behavior on the installed hardware.
- [ ] Split staff and player entry points; lazy-load broadcast, vision, and 3D modules where compatible with offline caching.
- [ ] Load only necessary font weights/families and avoid shipping developer history on the player path.
- [ ] Add version checks/conditional responses or deltas that preserve authority and offline recovery.

## Acceptance criteria

- [ ] Before/after measurements show a meaningful improvement without speculative claims.
- [ ] Offline restart, cache updates, authorization, and display-version tests remain green.
- [ ] No benefit is claimed solely from a smaller file without testing user-visible behavior.

## Out of scope

No new renderer, WebGPU/worker technology, or service replacement without measured need.

## Required evidence

Provide before/after evidence, regression results, affected bug/changelog references, compatibility risks, and the completion report required by TASK_RULES.md. Do not treat this backlog entry as a launch blocker or permission to start.
