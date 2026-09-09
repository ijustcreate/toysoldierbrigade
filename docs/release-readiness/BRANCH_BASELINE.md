# Version 2 baseline and rollback checkpoints

Prepared September 9, 2026, before Version 2 implementation.

## Preserved code

| Purpose | GitHub branch in ijustcreate/toysoldierbrigade | Commit |
|---|---|---|
| Version 1 — deployed site | `codex/v1-live-2026-09-09` | `ed53ce7aace3e64268b0cc70344164cd40e9ea87` |
| Version 1 — locally reviewed checkout | `codex/v1-local-2026-09-09` | `5288af2aaebdacd1ab48c0d5f5c26e97d03cd8cc` |
| Version 2 work | `codex/version-2` | Starts at the deployed Version 1 commit; later commits add planning and implementation |

Leave the two Version 1 backup branch tips unchanged. They are separate rollback references, not working branches. GitHub branch-protection/immutability settings have not been configured; the commit hashes above are the exact identity checks.

The live-site repository was verified through GitHub Pages configuration and the latest successful deployment workflow: `ijustcreate/toysoldierbrigade`, deployed from `main` at `ed53ce7` on September 6, 2026. The other configured remote, `ijustcreate/project-lantern`, has a different history and is not the Version 2 publishing target established here.

## Important change to the review baseline

The review and original task plan describe local commit `5288af2`, not deployed commit `ed53ce7`. The deployed line includes additional commits for concurrent-state merging, startup sync recovery, and durable recovery snapshots. The local line also has a unique site-sync change.

Before implementing any finding:

1. Reproduce it against the current Version 2 checkout.
2. Inspect the deployed recovery/merge helpers and their tests before replacing or duplicating them.
3. Compare the unique local branch change and preserve useful intent deliberately. Do not blindly merge/cherry-pick it over newer save behavior.
4. Update task/bug evidence to distinguish defects still present from behavior already addressed in the deployed baseline.

The review is evidence about its recorded commit, not a claim that every failure persists in the newer deployed code.

## Local backups

An independently verified Git bundle preserves complete histories for both Version 1 code branches:

`output/backups/pre-version-2-2026-09-09/pre-v2-code.bundle`

A read-only GET also captured the shared-state response:

`output/backups/pre-version-2-2026-09-09/shared-state-response.json`

The local backup directory contains a manifest with checksums and capture time. It is ignored by git. Do not commit or upload the private shared-state file. Do not use it as test input or a seed. Existing untracked `tmp/` work was left untouched.

**Backup limitations:** the state snapshot includes media references, but separately hosted asset payloads, external service configuration, credentials, and browser-local media/drafts are not all captured by this snapshot. The code bundle includes committed assets. L17 must establish the complete operational backup/recovery process. The state capture is a point-in-time copy, not permission to erase later staff edits.

## Working and release rules

- Keep all Version 2 work on `codex/version-2` or explicitly requested subordinate branches, never on the saved Version 1 branches.
- Do not push Version 2 changes to `main`: the existing workflow deploys pushes to `main` automatically.
- The user's requested endpoint is a ready-to-deploy candidate. Actual production deployment remains a separate explicit action.
- This baseline step creates branches and planning checkpoints; it does not claim fixes, completed acceptance tests, hardware readiness, or museum sign-off.
- Re-check the remote heads and exact artifact before any approved rollout. Do not force-push or overwrite remote history.

## How rollback will work

For code inspection, create a separate checkout/worktree at the saved commit without resetting the active workspace. For production code rollback, prepare a normal reviewed release/PR restoring the chosen compatible code baseline; verify its schema/protocol compatibility with the then-current data and service first. Deploy only with explicit authorization.

Rolling back frontend code and restoring museum data are separate operations. A code rollback must not seed or replace current board contents. Any requested live-data restore needs a specific target, a fresh read-only backup, and preservation/version checks for newer staff changes. Do not automatically restore the September 9 data snapshot merely because code is reverted.
