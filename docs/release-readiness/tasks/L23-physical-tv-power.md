# L23 — Schedule physical TV standby and wake

**Priority:** User-required launch gate

**Dependencies:** L00, L09, L11, L12; verified actual TV-control transport

Read AGENTS.md, TASK_RULES.md and RELEASE_DECISIONS.md. This task is not complete when a browser paints black or reports a requested power state.

## Scope / acceptance

- [ ] Verify the installed TV model/settings and PC control path; research exact device support from primary documentation.
- [ ] Keep the PC/agent connected while the TV is off so remote web publication or the next scheduled start can wake it.
- [ ] Derive desired power from currently active published content, not any future schedule or unpublished editor draft.
- [ ] Use explicit power-on/standby commands where supported, not an unreliable blind toggle. Debounce/reconcile state to avoid repeated cycling.
- [ ] Authenticate/restrict any control transport according to the approved passwordless access decision. Do not expose LAN control ports to the internet.
- [ ] Test the transitions active → idle/off → new active board/wake, future scheduled start, interruption ending, network loss/reconnect and PC restart.
- [ ] Distinguish requested, confirmed, unsupported and unknown power states in diagnostics. A connection heartbeat does not prove the panel is on.
- [ ] Obtain the user's physical confirmation on both actual TVs. Provide a manual fallback if control is unsupported; do not mark automatic off/wake complete.

No unapproved adapter purchase, external account, TV setting change, PC installation or production content edits. If extra hardware is required, present the exact compatibility evidence and ask before acquiring it. Use synthetic schedules for mutation tests and preserve all live museum content.
