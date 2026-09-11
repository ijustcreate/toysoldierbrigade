import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildLegacyWoodWall, syntheticLegacyWall, WALL_ASSETS } from './legacy-star-wall-design.mjs';
const source = syntheticLegacyWall(), original = structuredClone(source);
const result = buildLegacyWoodWall(source);
assert.deepEqual(source, original);
assert.equal(result.id, source.id);
assert.equal(result.active, source.active);
assert.deepEqual(result.donorIds, source.donorIds);
assert.equal(result.panels.filter(p => p.type === 'image').length, 22);
assert.equal(result.panels.filter(p => p.id.endsWith('-wood-label')).length, 22);
assert.deepEqual(result.panels.filter(p => p.id.endsWith('-wood-label')).map(p => p.title), source.panels.map(p => p.title));
assert.equal(new Set(result.panels.map(p => p.id)).size, result.panels.length);
for (const donorId of source.donorIds) {
  const pair = result.panels.filter(p => p.groupId === donorId + '-wood-group');
  assert.equal(pair.length, 2);
  assert.deepEqual(pair.map(p => p.type), ['image', 'text']);
}
for (const p of result.panels) {
  assert.ok(p.x >= 0 && p.y >= 0 && p.x + p.width <= 100 && p.y + p.height <= 100, p.id);
  assert.ok(!p.id.endsWith('-star-image') && !p.id.endsWith('-star-text'), 'No old CSS hooks');
}
assert.equal(result.donorScrollEnabled, false);
assert.throws(() => buildLegacyWoodWall({ ...source, donorIds: source.donorIds.slice(1) }), /22/);
assert.throws(() => buildLegacyWoodWall({ ...source, panels: [] }), /Missing/);
for (const [key, file] of Object.entries(WALL_ASSETS)) {
  const bytes = await readFile(`public/assets/legacy-star-wall-v2/${file}`);
  assert.ok(bytes.readUInt32BE(16) >= 900 && bytes.readUInt32BE(20) >= 1200);
  if (key === 'star') assert.equal(bytes[25], 6, 'Transparent RGBA star, not a flattened background');
}
console.log('PASS: preservation, 22 editable grouped stars, geometry, no legacy scaling, fail-closed membership, and asset dimensions/alpha.');
