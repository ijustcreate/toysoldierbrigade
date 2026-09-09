# Project Lantern — launch plan and Codex task backlog

**Prepared September 9, 2026. Status: Version 2 implementation started; the user authorized an intermediate live release to test current progress. Final handoff gates remain open.**

**Version 2 preparation:** [branch baselines and rollback safeguards](BRANCH_BASELINE.md) preserve both the reviewed local code and the deployed site. Version 2 starts from the deployed commit `ed53ce7`, which includes recovery changes absent from the original review. Reproduce findings on this baseline before fixing them; current implementation begins with the explicitly approved platform and tracking scope.

This turns the pre-launch review into **24 launch tasks and 6 post-launch tasks**. Each task has an individual assignment prompt, bounded scope, dependencies, acceptance criteria, authority limits, and required evidence. IDs are stable so you can say “work on L07” without repeating the review. The user's [confirmed release decisions](RELEASE_DECISIONS.md) supersede earlier recommendations: selectable equal-access users, no passwords, remote web editing, physical TV off/wake, tracking under construction, and retirement of Fire compatibility.

The aim is a dependable museum installation, not a rewrite: one landscape 75-inch TV in the main hall and one portrait 75-inch TV near the entrance, each with its own Glorin mini PC. Exact PC/OS/output details and physical installation suitability remain to be verified.

The original [review report](../../output/playwright/release-review/RELEASE_REVIEW_2026-09-09.md) contains detailed evidence. That report/screenshots are ignored local artifacts and may not exist in a new worktree; these task cards restate the required behaviors and do not depend on those artifacts.

## Recommended first assignments

1. **L00 — decisions:** lock down release scope, staff access, player setup, and after-hours behavior.
2. **L01 — regression foundation:** make the reported failures reproducible with safe synthetic tests.
3. **L03 — validated writes:** L02 is resolved as intentionally open editing; authentication is deferred and must not block reliability work.
4. **L05 and L06 — preservation and persistence**, with serialized integration because both touch the host.
5. Continue through the dependencies below, prioritizing data protection before visual polish.

This is a work breakdown, not a promise that all tasks fit into one week. The **48–72-hour actual-device soak test is real elapsed time**. Reserve room for fixes and retesting. If the safety gates cannot pass before handoff, reduce scope explicitly or move the handoff date; do not mark unperformed tests complete.

## How to assign a task

Open an individual card and use its assignment prompt, or send:

> Work on Lantern task L07. Read AGENTS.md, docs/release-readiness/TASK_RULES.md, docs/release-readiness/README.md, and docs/release-readiness/tasks/L07-conflict-safe-board-saves.md. Verify dependencies against the current code, implement only that task, run its acceptance tests, and report the results. Do not deploy or modify live museum content.

For a **separate Codex task**, explicitly request creation and give the task ID. This planning step created files only: it did not create sidebar tasks, start agents, schedule monitoring, or authorize implementation.

Before launching separate worktrees, ensure these planning files are included in the checkout supplied to them. Version 2 preparation checkpoints them on `codex/version-2`; a task created from an older branch may otherwise lack the plan. Verify the selected checkout rather than assuming the files are present.

Read [TASK_RULES.md](TASK_RULES.md) for production safety, required bug/changelog work, and the completion report. Every implementation task must follow repository instructions. Existing live data must never become a test fixture or be replaced as part of deploying code.

## Phase overview

| Phase | Tasks | Exit gate |
|---|---|---|
| 1. Decisions and test foundation | L00, L01; begin L16 CI scaffolding | Agreed target/contracts; failures reproducible without production data |
| 2. Protect saved work | L02–L08 | Preserve approved open access; validated writes; no silent overwrite or draft loss |
| 3. Correct scheduling and make players recover | L09–L12, L15 | Consistent schedule behavior; shareable media; durable offline recovery; truthful device state |
| 4. Finish staff controls and release safeguards | L13, L14, L16, L17 | Usable controls/artwork checks; required CI; synthetic restore rehearsal |
| 5. Prove the installation and hand off | L18, L19 | Actual-device acceptance/soak and staff sign-off on the exact candidate |
| 6. Authorized production release | L20 | Explicit deployment approval; safe rollout; read-only post-release verification |
| Later, separately scoped | P01–P06 | Maintainability and advanced capabilities without jeopardizing launch |

The phases summarize intent. **The dependency column below is authoritative**; tasks such as L09 and early CI/documentation preparation can proceed before an entire earlier phase is finished.

## Launch task register

All tasks start **Planned**. The checklist means accepted completion, not “someone wrote code.” Keep this table as the canonical status register.

| Done | ID / task | Priority | Depends on | State |
|---|---|---|---|---|
| [ ] | [L00 — Confirm release scope, access model, and hardware target](tasks/L00-release-decisions.md) | Required | None | Access/scope resolved; power transport and actual PC setup pending |
| [ ] | [L01 — Make the review failures reproducible in isolated tests](tasks/L01-regression-foundation.md) | P1 | None | Planned |
| [ ] | [L02 — Preserve the approved open-access model](tasks/L02-staff-authentication.md) | Compatibility | Decision resolved | Public editing confirmed; authentication deferred; retain regression checks |
| [ ] | [L03 — Validate shared writes and enforce a safe storage contract](tasks/L03-validated-state-writes.md) | P1 | L01; L02 decision resolved | Planned |
| [ ] | [L04 — Give displays a minimal rendering feed](tasks/L04-read-only-paired-players.md) | P1 | L03 | Planned; no new access barrier |
| [ ] | [L05 — Stop normal loading from rewriting approved content](tasks/L05-non-destructive-migrations.md) | P1 | L01 | Planned |
| [ ] | [L06 — Unify durable saves and expose storage failures honestly](tasks/L06-honest-durable-persistence.md) | P1 | L01 | Planned |
| [ ] | [L07 — Prevent board saves from overwriting concurrent edits](tasks/L07-conflict-safe-board-saves.md) | P1 | L03, L05, L06 | Planned |
| [ ] | [L08 — Keep board drafts safe across navigation and restart](tasks/L08-recoverable-editor-drafts.md) | P1 | L06, L07 | Planned |
| [ ] | [L09 — Correct schedule units and unify what each display should show](tasks/L09-schedule-and-interruption-correctness.md) | P1 | L00, L01 | Planned |
| [ ] | [L10 — Keep media out of shared JSON and validate publication assets](tasks/L10-shared-media-contract.md) | P1 | L03, L04 | Planned |
| [ ] | [L11 — Persist a complete last-good player snapshot and recover safely](tasks/L11-offline-player-recovery.md) | P1 | L04, L06, L10 | Planned |
| [ ] | [L12 — Show truthful save, publication, and per-TV delivery status](tasks/L12-publish-and-display-health.md) | P1 | L04, L07, L11 | Planned |
| [ ] | [L13 — Finish essential staff controls and accessibility](tasks/L13-staff-ui-accessibility.md) | P1 | L08, L09, L12 | Planned |
| [ ] | [L14 — Repair bundled asset defects and add board preflight checks](tasks/L14-board-visual-preflight.md) | P1 | L04, L10 | Planned |
| [ ] | [L15 — Prepare and verify one supported mini-PC player installation](tasks/L15-mini-pc-player-package.md) | P1 | L00, L11 | Planned |
| [ ] | [L16 — Make regression, Worker, and release checks mandatory](tasks/L16-ci-and-release-gates.md) | P1 | L01 | Planned |
| [ ] | [L17 — Build a safe backup and recovery procedure](tasks/L17-backup-and-recovery.md) | P1 | L03, L10 | Planned |
| [ ] | [L18 — Run final two-TV acceptance and a 48–72-hour soak test](tasks/L18-actual-device-acceptance.md) | Release gate | L02, L03, L04, L05, L06, L07, L08, L09, L10, L11, L12, L13, L14, L15, L16, L17 | Planned |
| [ ] | [L19 — Finish staff documentation and rehearse independent operation](tasks/L19-staff-handoff-and-signoff.md) | Release gate | L13, L15, L17, L18 | Planned |
| [ ] | [L20 — Deploy the approved candidate and complete handoff](tasks/L20-controlled-release.md) | Release gate | L18, L19 | Planned |
| [ ] | [L21 — Retire Fire/Vega compatibility](tasks/L21-retire-fire-platform.md) | User-approved | L00 confirmed scope | Ready for test; BUG-0390; native toolchain check still blocked |
| [ ] | [L22 — Mark retained tracking under construction](tasks/L22-tracking-release-status.md) | User-approved | L00 confirmed scope | Ready for test; BUG-0391; browser/fixtures pass |
| [ ] | [L23 — Physical TV off/wake](tasks/L23-physical-tv-power.md) | Release gate | L00, L09, L11, L12; verified hardware | Transport investigation pending |

Suggested states: **Planned → In progress → Ready for test → Verified**, or **Blocked: named missing input**. A task with passing local tests may still be ready-for-test pending hardware or staff evidence. Record bug IDs and evidence when work happens; no implementation bug records were created merely to write this plan.

## Dependency map

The critical data/player path is:

```text
L00 decisions + L01 tests
  → L02 preserve intentionally open access (decision resolved)
  → L03 validated writes
  → L04 minimal non-mutating player feed
  → L10 shared media
  → L11 durable offline player
  → L12 device / publication status
  → L13 essential staff UI

L01 → L05 preservation + L06 durable saves
  → L07 conflict-safe editing (also needs L03)
  → L08 draft recovery → L13

L00 + L01 → L09 scheduling → L13
L00 + L11 → L15 actual player installation
L04 + L10 → L14 artwork preflight
L03 + L10 → L17 backup / restore tooling
L01 → L16 CI foundation (final gate requires every critical test green)

L02–L17 → L18 actual-device acceptance / soak
L18 + staff/operations work → L19 staff sign-off
L18 + L19 + explicit release approval → L20 deployment
```

## Separate-task coordination and file ownership

These are *potential* work lanes if separate work is requested, not permission to start parallel agents automatically.

| Shared area | Task sequence / integration rule |
|---|---|
| Worker and API contract | L03 → L04, preserving L02's open-access decision; then coordinate L10 and L12 against the same published contract |
| Host/storage/normalization | L05 and L06 serialize edits to lanternHost.ts; integrate both before L07/L11 |
| Main application file | L07 → L08; merge L09 before L12/L13; avoid simultaneous broad App.tsx edits |
| Media/cache | L10 → L11; L17 consumes the same media manifest |
| CI/tests/docs | L01/L16 and early L19 drafting can progress independently, then rerun against integrated code |
| Assets/font validation | L14 can be isolated once L10's contract is stable; no global style rewrite |

Use one integration owner and rerun the entire suite after combining task results. Separate branches/worktrees do not eliminate semantic conflicts. Broad extraction of App.tsx and CSS belongs after launch, not in the middle of the data-preservation fixes.

## Decisions register

**Updated:** use [RELEASE_DECISIONS.md](RELEASE_DECISIONS.md) as the authoritative register. Access is resolved as intentionally public; private invitations and authentication are deferred. L18 now also requires L21, L22 and L23 acceptance.

No decision below is assumed approved merely because a recommendation appears here.

| Decision | Recommended starting point | Owner / status | Blocks |
|---|---|---|---|
| D1: launch feature scope | Preserve normal boards, broadcasts, effects and recording; full puppets deferred; tracking under construction; Fire retired | User confirmed | Required workflows still need verification |
| D2: staff access | Intentionally public editing, equal rights, selectable names, no passwords or private invites | User confirmed; authentication deferred | Not a blocker for reliability work |
| D3: after-hours / interruption policy | Physical TV off without active scheduled content; wake for active published content; recompute after interruptions | User confirmed; hardware transport unverified | L09, L23 |
| D4: PC/OS/player method | Verify both Glorin PCs; choose one supported persistent player installation | User / installer; unresolved | L15 |
| D5: approved board content | Museum approves final names, programs, artwork, locations, and viewing-distance legibility | Museum content owner; unresolved | L14 final artwork list, L18 |
| D6: operational ownership | Museum owns hosting/repository/device recovery and support responsibilities | Museum administrator; unresolved | L19/L20 |
| D7: staff viewport and advanced recording policy | Declare supported admin screen size; recording consent/retention only if those features are in scope | Museum; unresolved | L13; P05 if promoted |

If advanced broadcast/effects/recording is required for launch, **promote the relevant P05 scope into a launch task**: change its dependencies from L20 to the necessary L00/L10/L12/L15 foundations and add it to L18's prerequisites. Do not create a dependency cycle or leave enabled required features unverified. Likewise, any post-launch item demonstrated necessary for safety becomes an explicit launch task rather than being quietly deferred.

## Findings-to-task traceability

| Review finding | Owning tasks |
|---|---|
| R1 — anonymous administrative state / missing permissions | L02, L04 |
| R2 — concurrent board save overwrites donor edits | L07 |
| R3 — draft navigation loss | L08; richer undo later in P04 |
| R4 — malformed state / storage size mismatch | L03, L10 |
| R5 — cold-start/offline player gap | L11, L15, L18 |
| R6 — false persistence success | L06, L12 |
| R7 — normalization changes approved schedules | L05 |
| R8 — schedule units / fallback disagreement | L09 |
| R9 — corrupt asset / clipping / font consistency | L14; final actual-screen approval L18 |
| R10 — weak release / recovery / handoff evidence | L15–L20 |
| Staff workflow and accessibility critique | L08, L12, L13, L19 |
| Monolithic code/CSS, bundle weight, advanced features | P01–P06 unless promoted for a specific launch requirement |

## Release gates — all mandatory for the approved scope

- [ ] The user-approved passwordless access boundary is implemented and documented truthfully; selectable names are not represented as verified identity. Any intentionally public editing is explicitly acknowledged before release.
- [ ] Concurrent editing preserves unrelated newer work and retains both sides of true conflicts.
- [ ] Drafts survive navigation/restart; save status is based on completed operations.
- [ ] Invalid/oversized/stale writes leave the last good state unchanged.
- [ ] Current-version loading preserves authored content, typography, assignments, and schedules.
- [ ] Schedule durations, priorities, expiry, and fallback match museum policy on both players.
- [ ] Published assets are valid and portable; both players retain a complete last-good offline copy.
- [ ] Device/publication status is truthful, with no claim that software telemetry proves TV power.
- [ ] Core controls pass the agreed desktop/keyboard/accessibility checks.
- [ ] Both actual TVs pass final visual approval and automatic recovery tests.
- [ ] Both TVs physically turn off without active scheduled content and wake for new active published content; an awake PC receives changes while the panel is off. L23 has actual-device evidence.
- [ ] A documented 48–72-hour soak passes on the exact release candidate; affected evidence is repeated after material changes.
- [ ] Synthetic state-and-media backup restoration passes; the protected production backup procedure and ownership are established without using live data as test input.
- [ ] CI gates the complete critical suite and Worker type checking; no hidden skipped launch failures.
- [ ] Museum staff pass the independent task walkthrough and accept ownership/support documentation.
- [ ] The exact production candidate/environment is explicitly authorized before deployment; deploying code never grants permission to replace live content.

## Post-launch register

These tasks are deliberately separated from the deadline-critical fixes. None has been started.

| Done | ID / task | Depends on | State |
|---|---|---|---|
| [ ] | [P01 — Extract feature workspaces from the application monolith](tasks/P01-modular-app-architecture.md) | L20 | Deferred / not started |
| [ ] | [P02 — Consolidate the design system and reduce CSS overrides](tasks/P02-css-design-system.md) | L20 | Deferred / not started |
| [ ] | [P03 — Split player delivery and optimize measured bottlenecks](tasks/P03-player-performance.md) | L20 | Deferred / not started |
| [ ] | [P04 — Add reliable undo/redo and protected staff editing](tasks/P04-editor-undo-and-protected-layouts.md) | L20 | Deferred / not started |
| [ ] | [P05 — Mature advanced broadcast, effects, and recording workflows](tasks/P05-broadcast-effects-and-recording.md) | L20 | Deferred / not started |
| [ ] | [P06 — Retire obsolete paths and simplify maintenance information](tasks/P06-maintenance-and-release-history.md) | L20 | Deferred / not started |

## What was created in this planning step

- This index, sequencing, decision register, and release gates.
- One reusable rules/definition-of-done document.
- Originally 21 launch cards; now 24 with the approved platform, tracking and physical-power scope, plus 6 post-launch cards.

The original planning step did not alter application code. Implementation has now begun with the explicit L21/L22 scope changes; follow the current status and evidence rather than the original planning snapshot. The user's subsequent request authorizes publishing this progress to the existing live site, not changing saved museum content or declaring final handoff complete. A task card alone still does not authorize deployment.
