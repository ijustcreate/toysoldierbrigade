# L16 — Make regression, Worker, and release checks mandatory

**Priority:** P1

**Type:** Code / CI

**Dependencies:** L01

**Review coverage:** R10; tests absent from CI; tooling audit

**Likely code areas:** .github/workflows/deploy-pages.yml; package.json; test scripts; Worker type-check configuration

## Assignment prompt

Implement only task L16, following the scope and acceptance criteria below. First read AGENTS.md, [task rules](../TASK_RULES.md), the [task index](../README.md), and completed dependency evidence. For decision/verification/deployment tasks, perform that stated task type rather than assuming code implementation. No implementation has been authorized by the existence of this card.

**Outcome:** Prevent a build-only green result from being mistaken for release readiness.

## Scope / to-dos

- [ ] Add explicit frontend and Worker type checks, the complete regression command, core browser tests, asset validation, and build checks to CI.
- [ ] Make production publishing depend on successful required checks; keep test credentials/endpoints isolated from museum production state.
- [ ] Track L01's known failures until owning fixes pass; final release cannot hide skipped known failures or source-only substitutes for critical behavioral tests.
- [ ] Triage current dependency advisories with reviewed compatible updates and regression evidence; do not run forced upgrades/downgrades indiscriminately.
- [ ] Document candidate tagging/artifact identification, environment separation, and backward-compatible code rollback without data reset. Changing workflow files does not authorize a deployment.

## Acceptance criteria

- [ ] A failing critical regression or Worker type error blocks publishing.
- [ ] CI cannot seed or mutate live state; secrets are not exposed to untrusted jobs.
- [ ] All required launch tests pass on the final candidate; any deferred non-critical issue has an explicit owner/approval.
- [ ] Artifact/commit identity is reproducible and rollback instructions preserve current museum data.

## Out of scope / authority boundary

No push/deploy, remote migration, broad dependency modernization, or disabling checks to obtain green.

## Required handoff evidence

CI configuration, local equivalent results, advisory disposition, and release/rollback procedure.

Use the completion-report template in TASK_RULES.md. Keep local fixes, production deployment, live-content editing, and museum acceptance distinct.
