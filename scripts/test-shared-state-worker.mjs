import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "lantern-worker-test-"));
const bundledWorker = path.join(temporaryDirectory, "worker.mjs");

class SharedStateDatabase {
  constructor(row = null) { this.row = row; }

  prepare(sql) {
    const database = this;
    return {
      values: [],
      bind(...values) { this.values = values; return this; },
      async first() {
        if (!database.row) return null;
        if (/SELECT updated_at FROM shared_state/.test(sql)) return { updated_at: database.row.updated_at };
        throw new Error(`Unexpected first(): ${sql}`);
      },
      async run() {
        if (/INSERT INTO shared_state/.test(sql)) {
          if (database.row) return { meta: { changes: 0 } };
          database.row = { updated_at: this.values[0], state_json: this.values[1] };
          return { meta: { changes: 1 } };
        }
        if (/UPDATE shared_state/.test(sql)) {
          if (!database.row || database.row.updated_at !== this.values[2]) return { meta: { changes: 0 } };
          database.row = { updated_at: this.values[0], state_json: this.values[1] };
          return { meta: { changes: 1 } };
        }
        throw new Error(`Unexpected run(): ${sql}`);
      }
    };
  }
}

function stateRequest(marker, version) {
  const headers = { "Content-Type": "application/json", Origin: "https://ijustcreate.github.io" };
  if (version !== undefined) headers["X-Lantern-State-Version"] = version;
  return new Request("https://worker.example/state", {
    method: "PUT",
    headers,
    body: JSON.stringify({ state: { marker } })
  });
}

try {
  await build({ entryPoints: [path.resolve("worker/bugs.ts")], outfile: bundledWorker, bundle: true, platform: "node", format: "esm", logLevel: "silent" });
  const { saveSharedState } = await import(`${pathToFileURL(bundledWorker).href}?${Date.now()}`);

  const currentVersion = "2026-09-06T01:41:38.446Z";
  const database = new SharedStateDatabase({ updated_at: currentVersion, state_json: JSON.stringify({ marker: "current" }) });
  const env = { BUGS_DB: database };

  const legacyResponse = await saveSharedState(stateRequest("legacy-overwrite"), env);
  assert.equal(legacyResponse.status, 428, "an old deployed client without a precondition must be rejected");
  assert.equal(JSON.parse(database.row.state_json).marker, "current");

  const staleResponse = await saveSharedState(stateRequest("stale-overwrite", "2026-09-06T01:40:00.000Z"), env);
  assert.equal(staleResponse.status, 409, "a stale client must not replace a newer board snapshot");
  assert.equal(JSON.parse(database.row.state_json).marker, "current");
  assert.equal((await staleResponse.json()).updatedAt, currentVersion);

  const savedResponse = await saveSharedState(stateRequest("explicit-save", currentVersion), env);
  assert.equal(savedResponse.status, 200);
  const savedBody = await savedResponse.json();
  assert.equal(JSON.parse(database.row.state_json).marker, "explicit-save");
  assert.ok(Date.parse(savedBody.updatedAt) > Date.parse(currentVersion));
  assert.equal(savedResponse.headers.get("X-Lantern-State-Version"), savedBody.updatedAt);

  const racingResponse = await saveSharedState(stateRequest("racing-stale-save", currentVersion), env);
  assert.equal(racingResponse.status, 409, "only the first writer based on a version can win");
  assert.equal(JSON.parse(database.row.state_json).marker, "explicit-save");

  const emptyDatabase = new SharedStateDatabase();
  const insertedResponse = await saveSharedState(stateRequest("first-save", "missing"), { BUGS_DB: emptyDatabase });
  assert.equal(insertedResponse.status, 200);
  assert.equal(JSON.parse(emptyDatabase.row.state_json).marker, "first-save");

  console.log("Shared-state optimistic concurrency checks passed.");
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
