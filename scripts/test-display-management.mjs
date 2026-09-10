import assert from 'node:assert/strict';
import { nextDisplayNumber, removeConfiguredDisplay } from '../src/displayManagement.ts';

const fixture = {
  screens: { 'display-1': { label: 'Original' }, 'display-2': { label: 'Copy' }, 'display-3': { label: 'Other' } },
  boardOpenOwners: { 'display-2': { deviceId: 'test' }, 'display-3': { deviceId: 'other' } },
  schedules: [{ id: 'copy-only', target: 'display-2' }, { id: 'other', target: 'display-3' }, { id: 'all', target: 'all' }],
  boardPrograms: [{ id: 'retained-design', panels: [{ title: 'Authored text' }] }],
  donors: [{ id: 'retained-donor', name: 'Synthetic donor' }],
  userPreferences: [{ id: 'unchanged' }]
};
const before = structuredClone(fixture);
const result = removeConfiguredDisplay(fixture, 'display-2');
assert.deepEqual(fixture, before, 'deletion never mutates the incoming saved state');
assert.deepEqual(Object.keys(result.screens), ['display-1', 'display-3']);
assert.deepEqual(result.schedules, fixture.schedules.slice(1), 'keep other-display and all-display schedules');
assert.deepEqual(result.boardOpenOwners, { 'display-3': fixture.boardOpenOwners['display-3'] });
for (const key of ['boardPrograms', 'donors', 'userPreferences']) assert.strictEqual(result[key], fixture[key], `${key} stays untouched`);
assert.equal(nextDisplayNumber(result.screens), 4, 'adding after a middle deletion cannot overwrite the remaining display');
assert.strictEqual(removeConfiguredDisplay(result, 'missing'), result);
const last = { ...result, screens: { 'display-3': result.screens['display-3'] } };
assert.strictEqual(removeConfiguredDisplay(last, 'display-3'), last, 'protect the last display at confirmation time');
console.log('Display deletion scope, immutable state, last-display guard and collision-free IDs passed.');
