import assert from "node:assert/strict";
import { buildBoardVersions, appendBoardVersions, ASSETS } from "./board-design-v2.mjs";
import { designFixture } from "./board-design-v2-fixture.mjs";
const state = designFixture(), before = structuredClone(state);
const boards = buildBoardVersions(state, ASSETS);
assert.equal(boards.length, 22);
assert.deepEqual(state, before, "authoring must not mutate sources");
const appended = appendBoardVersions(state, boards);
assert.deepEqual(appended.boardPrograms.slice(0, state.boardPrograms.length), before.boardPrograms);
assert.equal(appended.schedules, state.schedules);
assert.equal(appended.screens, state.screens);
assert.equal(appended.donors, state.donors);
assert.deepEqual(buildBoardVersions(appended, ASSETS), [], "idempotent creation never overwrites an existing V2");
assert.throws(() => appendBoardVersions(appended, boards), /overwrite/);
const deleted = { ...state, boardPrograms: state.boardPrograms.slice(1) };
assert.equal(buildBoardVersions(deleted, ASSETS).length, boards.length - 1, "never recreate a deleted source");
const full = boards.filter((board) => /^board-v2-toy-soldier-(portrait|landscape)/.test(board.id));
assert.equal(full.length, 2);
for (const board of full) assert.equal(board.donorIds.length, 31);
for (const board of boards) {
  assert.equal(board.active, false, "new designs remain unscheduled review drafts");
  assert.equal(board.donorScrollEnabled, false);
  assert.ok(board.backgroundImage);
  const logo = board.panels.find((panel) => panel.type === "image" && panel.imageUrl === "/assets/childrens-museum-stockton.png");
  assert.ok(logo, `${board.id} includes the museum logo`);
  assert.equal(logo.imageFit, "contain");
  assert.equal(board.backgroundCrop.scale, 1);
  assert.equal(board.backgroundCrop.x, 50);
  assert.equal(board.backgroundCrop.y, 50);
  assert.equal(board.backgroundCrop.rotation, 0);
  if (board.palette === "legacy-navy" && board.orientation === "Portrait") assert.ok(board.backgroundImage.endsWith("toy-soldier-navy-portrait-v2.png"), `${board.id} uses portrait art`);
  if (board.palette === "legacy-navy" && board.orientation === "Landscape") assert.ok(board.backgroundImage.endsWith("toy-soldier-navy-landscape-v2.png"), `${board.id} uses landscape art`);
  assert.equal(new Set(board.panels.map((panel) => panel.id)).size, board.panels.length);
  for (const panel of board.panels) {
    assert.ok(["text", "donors", "image"].includes(panel.type), "no legacy multi-field text boxes");
    assert.ok(panel.x >= 0 && panel.y >= 0 && panel.x + panel.width <= 100.01 && panel.y + panel.height <= 100.01, `${panel.id} stays on screen`);
    if (panel.type === "donors") assert.ok(panel.rows * panel.columns >= panel.donorIds.length, "all selected donors have a visible cell");
  }
}
const changedMembership = structuredClone(state);
changedMembership.donors[0].givingLevelId = "new-level";
assert.throws(() => buildBoardVersions(changedMembership, ASSETS), /giving levels/, "unexpected membership requires review, not silent omission");
const inactiveMembership = structuredClone(state);
inactiveMembership.donors[30].active = false;
assert.equal(buildBoardVersions(inactiveMembership, ASSETS)[0].donorIds.length, 31, "retain inactive membership selections; renderer respects donor visibility without reactivation");
console.log("V2 design checks passed: 22 drafts, complete 31-member rosters, no scrolling, original-state preservation, deletion safety, idempotency, modern editable panels.");
