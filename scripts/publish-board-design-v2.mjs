/** One-time, explicitly requested content authoring; never run during deployment. */
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { ASSETS, buildBoardVersions, appendBoardVersions } from "./board-design-v2.mjs";

const publish = process.argv.includes("--publish-new-boards");
const endpoint = process.env.LANTERN_V2_CONTENT_ENDPOINT?.replace(/\/bugs\/?$/, "").replace(/\/$/, "");
if (!endpoint || new URL(endpoint).protocol !== "https:") throw new Error("Set the verified LANTERN_V2_CONTENT_ENDPOINT HTTPS service URL.");
const folder = path.resolve("output/board-design-v2");
await mkdir(folder, { recursive: true });
const receiptPath = path.join(folder, "publication-receipt.json");
if (publish && await access(receiptPath).then(() => true, () => false)) throw new Error("This collection was already published. Do not rerun or resurrect deleted drafts.");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const stamp = () => new Date().toISOString().replace(/[:.]/g, "-");
async function snapshot() {
  const response = await fetch(`${endpoint}/state`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Read failed: ${response.status}`);
  const raw = await response.text(), data = JSON.parse(raw);
  if (!data.state?.boardPrograms || !data.updatedAt) throw new Error("Authoritative state/version missing; no write permitted.");
  const file = path.join(folder, `before-${stamp()}.json`);
  await writeFile(file, raw, { flag: "wx" });
  return { ...data, backup: file, sha256: hash(raw) };
}
const localUrls = Object.fromEntries(Object.entries(ASSETS).map(([key, file]) => [key, `/assets/boards-v2/${file}`]));
if (!publish) {
  const current = await snapshot();
  const boards = buildBoardVersions(current.state, localUrls);
  // An authoring artifact, not a mutation-test fixture or startup seed.
  await writeFile(path.join(folder, "draft-boards.json"), JSON.stringify(boards, null, 2));
  console.log(JSON.stringify({ mode: "read-only authoring preview", backup: current.backup, sha256: current.sha256,
    boards: boards.map(({ id, name, donorIds }) => ({ id, name, donors: donorIds.length })) }, null, 2));
} else {
  // Asset URLs are immutable. Retain a receipt to reuse uploads after a pre-write failure.
  const assetsPath = path.join(folder, "uploaded-assets.json");
  const assets = await readFile(assetsPath, "utf8").then(JSON.parse).catch(() => ({}));
  for (const [key, file] of Object.entries(ASSETS)) {
    const bytes = await readFile(path.resolve("public/assets/boards-v2", file));
    const sha256 = hash(bytes);
    if (assets[key]?.sha256 === sha256 && assets[key].endpoint === endpoint) continue;
    const response = await fetch(`${endpoint}/assets`, { method: "POST", headers: { "Content-Type": "image/png" }, body: bytes });
    const body = await response.json();
    if (!response.ok || !body.url) throw new Error(`Asset upload failed: ${response.status}`);
    assets[key] = { url: body.url, file, sha256, endpoint };
    await writeFile(assetsPath, JSON.stringify(assets, null, 2));
  }
  const urls = Object.fromEntries(Object.entries(assets).map(([key, asset]) => [key, asset.url]));
  let saved = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    const current = await snapshot();
    // Rebuild against the newest source IDs and memberships; deleted boards stay deleted.
    const boards = buildBoardVersions(current.state, urls);
    if (!boards.length) throw new Error("No missing versions. Inspect the existing collection before taking any action.");
    const next = appendBoardVersions(current.state, boards);
    const { boardPrograms: beforeBoards, ...beforeRest } = current.state;
    const { boardPrograms: nextBoards, ...nextRest } = next;
    if (!isDeepStrictEqual(beforeRest, nextRest) || !isDeepStrictEqual(beforeBoards, nextBoards.slice(0, beforeBoards.length))) throw new Error("Preservation assertion failed; no write performed.");
    const response = await fetch(`${endpoint}/state`, {
      method: "PUT", headers: { "Content-Type": "application/json", "X-Lantern-State-Version": current.updatedAt },
      body: JSON.stringify({ state: next })
    });
    if (response.status === 409) continue;
    if (!response.ok) throw new Error(`Creation failed: ${response.status}; inspect before retrying.`);
    const result = await response.json();
    const receipt = { createdAt: new Date().toISOString(), previousVersion: current.updatedAt,
      savedVersion: result.updatedAt, backup: current.backup, backupSha256: current.sha256,
      boards: boards.map(({ id, name, donorIds }) => ({ id, name, donors: donorIds.length })),
      originalBoardsPreserved: beforeBoards.length, schedulesAndDisplaysUnchanged: true };
    // Write the receipt before follow-up checks: a transient GET failure must not permit republishing.
    await writeFile(receiptPath, JSON.stringify(receipt, null, 2), { flag: "wx" });
    const verifyResponse = await fetch(`${endpoint}/state`, { cache: "no-store" });
    if (!verifyResponse.ok) throw new Error("Saved successfully; verification read failed. Inspect the receipt, do not rerun.");
    const verified = await verifyResponse.json();
    // JSON omits optional undefined fields on authored drafts. Compare the wire
    // representation, not the richer in-memory object, against the saved JSON.
    if (verified.updatedAt === result.updatedAt && !isDeepStrictEqual(verified.state, JSON.parse(JSON.stringify(next)))) throw new Error("Post-save integrity mismatch; inspect without restoring a snapshot.");
    const missing = boards.filter((board) => !verified.state.boardPrograms.some((item) => item.id === board.id));
    receipt.verification = { readVersion: verified.updatedAt, visibleNewBoards: boards.length - missing.length,
      concurrentChangeAfterSave: verified.updatedAt !== result.updatedAt };
    await writeFile(receiptPath, JSON.stringify(receipt, null, 2));
    console.log(JSON.stringify(receipt, null, 2));
    saved = true;
    break;
  }
  if (!saved) throw new Error("Museum state changed three times. No boards written; wait for a quiet edit window.");
}
