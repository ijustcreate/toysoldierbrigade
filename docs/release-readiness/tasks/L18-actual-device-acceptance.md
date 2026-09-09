# L18 — Run final two-TV acceptance and a 48–72-hour soak test

**Priority:** Release gate

**Type:** Human-assisted verification

**Dependencies:** L02, L03, L04, L05, L06, L07, L08, L09, L10, L11, L12, L13, L14, L15, L16, L17

**Review coverage:** Full go/no-go checklist

**Likely code areas:** release evidence only; candidate artifact; device logs

## Assignment prompt

Implement only task L18, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Establish that the exact candidate works unattended on the actual museum installation.

## Scope / to-dos

- [ ] Record candidate commit/artifact, exact devices, browser/native version, OS/output settings, network, and test start/end times.
- [ ] Use isolated test accounts/feeds and synthetic content for mutation tests. Visually inspect approved live artwork read-only where authorized; never send test announcements to live visitors.
- [ ] Exercise power loss/recovery, internet loss, player restart, HDMI reconnect, control laptop closure, clock correctness, and approved scheduling/interruption flows.
- [ ] Inspect both actual 75-inch TVs at real viewing distances; museum staff sign off donor names, layout, contrast/legibility, and orientation.
- [ ] Run 48–72 hours of unattended observation with resource/health evidence. If later asked to monitor repeatedly, use the product's supported monitoring mechanism; this plan does not itself schedule anything.
- [ ] Record failures and route fixes back to the owning task; repeat affected tests and a justified soak interval on the final candidate.

## Acceptance criteria

- [ ] Both players recover automatically and retain approved cached content under the agreed failure scenarios.
- [ ] No unexpected blank board, content regression, sustained resource growth, or required manual intervention during the documented soak.
- [ ] All release-gate results are tied to the tested candidate; a subsequent material code change invalidates affected evidence.
- [ ] Unperformed hardware checks remain pending, never inferred from browser simulations.

## Out of scope / authority boundary

No hardware actions without authorization, live mutation tests, production deployment, or claiming elapsed soak time that did not occur.

## Required handoff evidence

Signed device matrix, timestamps, fault/recovery logs, real-screen photos as permitted, and pass/fail ledger.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
