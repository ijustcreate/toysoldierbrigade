# L02 — Preserve the approved open-access model

**Status:** Decision resolved; access-control implementation deferred by the user.

**Dependencies:** None remaining for the access decision. Regression testing belongs with L01/L16.

**Review coverage:** R1, explicitly accepted public-access tradeoff

## Assignment prompt

Read AGENTS.md, ../TASK_RULES.md and ../RELEASE_DECISIONS.md. Preserve public web editing, the top user selector, equal editing/publishing rights, and access from anywhere. The user declined private staff invite links for now. Do not add passwords, invites, account login, device authorization, or unequal roles. This card replaces the original authentication proposal; it does not authorize building that proposal.

## Scope / to-dos

- [x] Record the explicit decision to keep editing intentionally public and defer access restrictions.
- [ ] Keep names as attribution, never represented as verified identity or different authority.
- [ ] Preserve direct remote browser access without LAN-only restrictions or inbound museum port forwarding.
- [ ] Retain validation, concurrency safety, recovery, and minimal display payloads without imposing authentication.

## Acceptance criteria

- [ ] A fresh browser can open the staff site without an invitation, password, or external account.
- [ ] Every selectable user can edit/publish equally; changing the name does not confer extra rights.
- [ ] Remote browser access and player reconnect/recovery pass isolated tests.
- [x] Public access is documented truthfully; deferred authentication is not a launch gate.

## Out of scope

No authentication implementation, production access-policy changes, live-content edits, or deployment. Revisit access restrictions only when the user requests them.

## Required evidence

The recorded user decision and open-access compatibility tests as the remaining release work is integrated. Do not claim security isolation that the intentionally open service does not enforce.
