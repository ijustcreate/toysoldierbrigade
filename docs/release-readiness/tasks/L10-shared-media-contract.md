# L10 — Keep media out of shared JSON and validate publication assets

**Priority:** P1

**Type:** Code / media storage

**Dependencies:** L03, L04

**Review coverage:** R4, R9; recording/local-media inconsistencies

**Likely code areas:** host media/upload helpers; schedule recording upload; recordingLibrary.ts; Worker assets; display payload

## Assignment prompt

Implement only task L10, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Ensure published media is valid, shareable, size-bounded, and available to the player before publication succeeds.

## Scope / to-dos

- [ ] Inventory image/audio/video paths and distinguish local draft recordings from shared display assets.
- [ ] Implement an approved reference-based asset flow compatible with storage/provider limits; prevent large data URLs or browser-only blob URLs from being published as if portable.
- [ ] Validate content type, byte size, and actual media readability/signatures where feasible. Handle upload failure and incomplete assets without corrupting the existing published board.
- [ ] Build the asset manifest needed by the player cache and backups. Preserve existing media references; any live migration needs separate authorization.
- [ ] If supporting shared recordings requires new paid storage or a material service change, present that decision or restrict publication clearly under L00's approved scope; do not silently add infrastructure.

## Acceptance criteria

- [ ] Another isolated player can load published assets without access to the editor's local IndexedDB/blob URLs.
- [ ] Failed, oversized, malformed, or partial uploads leave prior published content intact and do not report successful publication.
- [ ] State remains within L03's limit; local-only recordings are labeled honestly.
- [ ] Media manifest and access rules work with paired-player authorization.

## Out of scope / authority boundary

No bulk upload of museum assets, live reference migration, deletion/garbage collection of user media, or unapproved storage purchases.

## Required handoff evidence

Cross-context media tests, failure cases, manifest specification, and storage-limit documentation.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
