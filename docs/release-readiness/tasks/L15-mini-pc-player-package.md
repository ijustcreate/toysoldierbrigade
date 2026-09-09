# L15 — Prepare and verify one supported mini-PC player installation

**Priority:** P1

**Type:** Code / installation; human-assisted

**Dependencies:** L00, L11

**Review coverage:** R10; hardware deployment mismatch

**Likely code areas:** selected launcher/native wrapper; deployment/install scripts; player setup docs

## Assignment prompt

Implement only task L15, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Make the chosen player start reliably on both Glorin PCs and document how museum staff recover it.

## Scope / to-dos

- [ ] Implement only the player method chosen in L00. If native packaging is chosen, resolve/verify the toolchain rather than treating the failed cargo check as a completed build.
- [ ] Prepare a reversible installer/configuration procedure for fixed device identity, startup after power restoration, process restart, profile/cache location, logging, update windows, and recovery.
- [ ] Document one rotation mechanism, actual HDMI resolution/scaling, sleep/power behavior, OS clock, and PC/TV naming.
- [ ] Provide preflight/read-only checks before modifying PCs. Actual installation, system changes, remote access, and account setup require explicit authorization for the named machines.
- [ ] Verify museum ownership of administrator/recovery access without exposing credentials in logs or documentation.

## Acceptance criteria

- [ ] The selected artifact installs and launches on the actual target OS once access/authorization is provided.
- [ ] Reboot/process-close recovery works with the persistent cache; startup does not depend on the control laptop.
- [ ] Portrait and landscape assignments are deliberate, not double-rotated; actual output modes are recorded.
- [ ] Uninstall/rollback and manual recovery instructions are tested and understandable.

## Out of scope / authority boundary

No unapproved OS security weakening, broad system cleanup, changes to unrelated machines, or automatic production content assignment.

## Required handoff evidence

Installer/launcher artifact, reversible setup guide, redacted device inventory, and actual-device results; otherwise mark hardware acceptance pending.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
