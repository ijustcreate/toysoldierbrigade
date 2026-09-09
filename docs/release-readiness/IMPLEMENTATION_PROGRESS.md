# Version 2 implementation progress — September 9, 2026

Branch: `codex/version-2`. The user has authorized publishing the current changes through the existing GitHub Pages workflow for live testing. The Version 1 backup branches remain unchanged; no live-state writes or museum-content edits are included.

## Current progress-release scope

Publish the accumulated L21/L22 changes and release-planning decisions described below. The user's open-access decision is recorded without implementing an invitation or login system. Scheduling and persistence investigation has not yet produced additional code fixes in this release. Final handoff, physical TV power control, native installer verification and remaining launch-hardening tasks are still open. Deployment completion must be verified separately against the exact GitHub Actions run and served assets.

## L21 / BUG-0390 — ready for test

- Removed the six tracked `vega-display` platform files and unused native ADB `fire_tv_key` command/registration.
- Updated active platform description/setup guidance for dedicated mini-PC players.
- Retained generic browser TV setup, rotation, native Windows display windows, and browser wake locks.
- Decoupled browser setup tests from the retired wrapper and added a PC-platform retirement check.
- Removed files remain recoverable from the Version 1 branches. No museum data/media/history was deleted.

## L22 / BUG-0391 — ready for test

- Added reusable **Under construction** notices in the staff tracking interface and marked room tracking consistently.
- Advanced tracking/costume tools start collapsed; opening them defaults to calibration. Existing costume/rig tools and their data remain available for later development.
- Tracking code remains implemented. Browser checks verified that its toggle can still be enabled/disabled and that keyboard expansion opens retained calibration controls.
- No live tracking settings, saved profiles, costumes, or media were rewritten by this change.

## Verification

- `npm run build`: passed (existing bundle-size and mixed import warnings remain).
- All 23 `scripts/test-*.mjs`: passed, including the newly added PC-platform test and deployed baseline's concurrent-merge test.
- `node scripts/phase4-effect-studio-fixture.mjs`: passed; custom costume/calibration preservation checked with synthetic data.
- Playwright on isolated `http://127.0.0.1:5197`, no configured shared endpoints: notice visibility, functioning tracking toggle, initially collapsed advanced tools, keyboard expansion, and default calibration all passed.
- Browser screenshots: `output/playwright/v2-scope/tracking-collapsed.png` and `tracking-expanded.png` (ignored local evidence, not required runtime assets).
- `cargo check --offline --locked`: still blocked by the existing Windows linker/toolchain problem, `LNK1104: cannot open file msvcrt.lib`. Native package is not verified or ready for installation.

These results cover the scope changes, not full Version 2 launch acceptance or actual tracking performance on the mini PCs.

## Remaining decisions/gates

- Access decision resolved: intentionally public editing, top-selectable users, equal editing rights, and remote access. The user declined private invites for now; no access barrier will be added. Access-control implementation is deferred, not a release blocker.
- Physical TV standby/wake requires a verified control transport and testing with the user on both installed PCs/TVs. Black rendering and browser wake locks do not satisfy that requirement.
- Other launch-hardening tasks remain open; the release is not yet ready to deploy.
