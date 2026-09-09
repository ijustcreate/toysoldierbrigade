# Version 2 — museum decisions

Recorded from the user's September 9, 2026 answers. These decisions supersede earlier proposals in the review and task cards. Version 2 work stays on `codex/version-2` with the original Version 1 checkpoints preserved.

## Current progress-release authorization

The user subsequently requested: "push all changes to the live site so i can test the current status." This authorizes committing/pushing the current relevant project changes and updating the existing GitHub Pages site through `toysoldier/main`. It does not authorize changing live museum content, restoring backups, or representing unfinished launch tasks as complete. No additional scheduling or persistence fixes were included merely because they were being investigated when the request arrived.

This is a user-requested progress release for testing, not the L18–L20 final handoff/sign-off. Keep the existing public access and backend service configuration unchanged. The live code can move forward while the saved Version 1 branch tips remain untouched.

## Confirmed

- Keep public editing and the selectable user list at the top of the site. Everyone who can access the site has equal editing/publishing rights. No passwords, private invite links, or Google/Microsoft account requirement. The user explicitly prioritizes easy access for this release.
- Preserve web editing from outside the museum as well as on its local network. Do not make the control center LAN-only or require opening inbound ports on the museum network.
- Both display PCs will have reliable museum internet. The user can perform actual-device acceptance this week; an exact appointment is not yet set.
- Use a dedicated mini PC at each onn 75-inch TV: main hall landscape, entrance portrait.
- Full puppets are not a launch requirement. Keep tracking implemented and available, visibly labeled **Under construction**. Do not delete tracking code, saved calibration, costume data, or media.
- Remove the old Kindle/Fire platform compatibility work. Retain generic browser TV routes, native Windows display support, portrait rotation, and relevant recovery behavior.
- Physically turn TVs off outside scheduled display activity and allow them to wake when an active board is added/published or its scheduled start arrives. A black page does not satisfy physical power-off.

## Hardware recovered from the earlier discussion

The selected listing is [Glorlin Ryzen 5 6600H mini PC](https://www.amazon.com/dp/B0GXTWKFHL), with 16 GB RAM and 512 GB SSD as recorded in the earlier hardware conversation. No new shopping decision is required. Verify the delivered configuration and Windows edition on the actual machines; the older thread included multiple different PC recommendations, so do not attribute another model's Windows edition to this one.

The earlier discussion also recorded uncertainty about this listing's cooling/Wi-Fi reliability and recommended testing one unit. That is a reason to test the delivered machines, not authorization to replace the user's hardware choice.

## Access boundary — resolved: intentionally open editing

The name selector records attribution, not verified identity. The user explicitly declined the proposed private staff invite link: access restrictions are deferred. Do not implement login, invitation, device authorization, or differentiated staff roles as part of this release.

Anyone who discovers the public URL can edit; this is the user's accepted tradeoff, not an unresolved release question. Describe the editor as open, not authenticated or protected. Retain remote access, equal editing rights, state validation, concurrency safeguards, and data minimization. These reliability improvements must not introduce a new access barrier.

L02 records this decision; deferred access-control implementation is not a dependency blocking L03 or the launch. A later access-control project requires a new user decision.

## Physical TV power — hardware integration gate

Keep each PC awake and connected while its TV is in standby so it can receive new schedules/boards and issue wake commands. Resolve current display activity first; future scheduled content or an unpublished draft should not immediately wake a TV. After an interruption, recompute current activity and turn the TV off only when nothing approved is active. These are implementation assumptions to verify with the user during acceptance.

Physical off/wake needs a tested control transport: compatible HDMI-CEC hardware or a verified TV control interface. A browser wake lock, black canvas, or Windows display-sleep command alone must not be reported as a confirmed TV power state.

[Pulse-Eight's official USB-CEC documentation](https://support.pulse-eight.com/support/solutions/articles/30000048842-usb-cec-adapter-user-manual) describes a PC/TV on/off control path. This establishes a possible mechanism, not compatibility of the installed Glorlin/onn combination. No adapter purchase, TV setting change, or unverified TV API is authorized by this research.

L23 owns this integration and actual-TV acceptance. Unsupported/unverified hardware must be reported honestly, with a manual fallback, rather than claiming the automatic power requirement is complete.

## Remaining release boundaries

- Preserve existing broadcast, ordinary effects, and recording functionality; the user only deferred full puppets. Do not silently remove the rest.
- Keep the Version 1 backup branches unchanged. Re-check review failures against the deployed-code baseline before fixing them.
- No live mutation tests, data reset, or default restoration. The current progress release is explicitly authorized above; later deployments still require their own applicable authorization.
- The final candidate is not ready to deploy until the agreed core tests and actual-device gates pass. Tracking's experimental status does not excuse failures in normal boards or broadcasts.
