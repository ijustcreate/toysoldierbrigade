# L17 — Build a safe backup and recovery procedure

**Priority:** P1

**Type:** Code / recovery tooling

**Dependencies:** L03, L10

**Review coverage:** R10

**Likely code areas:** new scoped backup/restore tooling; auditHistory.ts; recovery docs; asset manifests

## Assignment prompt

Implement only task L17, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Provide a recoverable state-and-media archive and demonstrate restoration without using live museum content as test input.

## Scope / to-dos

- [ ] Define a versioned archive with state, asset manifest/content as permitted, checksums, timestamps, and compatibility metadata; exclude credentials.
- [ ] Implement read-only backup/export and a restore tool with dry-run validation, explicit targets, stale-version protection, and a preview of intended changes.
- [ ] Demonstrate round-trip restore using wholly synthetic state and media in an isolated environment. Never use live state as a test fixture or seed.
- [ ] For any separately authorized production backup, verify protected storage/checksums/inventory read-only; do not restore it into a test environment under this task.
- [ ] Define museum ownership, secure storage, retention, recovery roles, and export-before-replace behavior for unsent local drafts. Do not describe compact audit summaries as restorable snapshots.

## Acceptance criteria

- [ ] A synthetic state-plus-assets backup round-trips without content/typography/schedule loss.
- [ ] Wrong environment, invalid checksum/schema, missing assets, stale version, or an unsafe target aborts before mutation.
- [ ] Recovery documentation clearly separates code rollback, local draft recovery, and production content restore.
- [ ] Production restoration always requires a specific later user request and a prior read-only backup.

## Out of scope / authority boundary

No live restore, live-as-fixture tests, scheduled automation creation, media deletion, or unapproved production backup distribution.

## Required handoff evidence

Synthetic restoration transcript, archive specification, guarded tooling, and ownership/retention checklist.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
