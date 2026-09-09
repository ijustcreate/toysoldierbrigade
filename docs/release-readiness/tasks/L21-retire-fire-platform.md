# L21 — Retire Fire/Vega compatibility for the PC installation

**Priority:** User-approved launch scope

**Dependencies:** L00's confirmed hardware/platform decision

**Bug:** BUG-0390

Read AGENTS.md, TASK_RULES.md and RELEASE_DECISIONS.md before continuing. Implement only retirement of the obsolete platform integrations.

## Scope / acceptance

- [ ] Remove the six tracked Vega wrapper/build/test files and the unused ADB Fire TV native command.
- [ ] Remove stale platform support claims from active setup documentation and package metadata.
- [ ] Retain generic TV setup, physical-orientation correction, browser wake-lock behavior, web remote access, and Windows display support.
- [ ] Keep relevant browser setup tests while removing assertions for the retired wrapper.
- [ ] Pass the production build, platform-retirement test, generic display/orientation/wake-lock tests, and browser smoke check.
- [ ] Report native compilation separately if the known Windows toolchain issue prevents verification.

Do not remove museum data, assets, historical changelog/bug records, or useful platform-independent recovery code. Deleted platform files remain recoverable from the Version 1 branches.
