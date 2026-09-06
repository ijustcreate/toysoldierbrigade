/**
 * Merge a locally edited state with a newer shared state.
 *
 * Values unchanged locally take the shared copy. Values changed only locally
 * take the local copy. When both sides touched the same leaf, the active local
 * edit wins. Arrays of records with stable ids merge per record so an edit to
 * one board cannot erase an unrelated board saved by another operator.
 */
export function mergeConcurrentState<T>(baseline: T, local: T, shared: T): T {
  if (same(local, baseline)) return clone(shared);
  if (same(shared, baseline)) return clone(local);

  if (Array.isArray(baseline) && Array.isArray(local) && Array.isArray(shared)) {
    if (keyed(baseline) && keyed(local) && keyed(shared)) {
      return mergeKeyedArrays(baseline, local, shared) as T;
    }
    return clone(local);
  }

  if (plainObject(baseline) && plainObject(local) && plainObject(shared)) {
    const result: Record<string, unknown> = {};
    const keys = new Set([...Object.keys(baseline), ...Object.keys(local), ...Object.keys(shared)]);
    keys.forEach((key) => {
      const baselineHas = Object.prototype.hasOwnProperty.call(baseline, key);
      const localHas = Object.prototype.hasOwnProperty.call(local, key);
      const sharedHas = Object.prototype.hasOwnProperty.call(shared, key);
      if (!localHas && baselineHas) return; // Local deletion wins.
      if (!localHas && !baselineHas && sharedHas) { result[key] = clone(shared[key]); return; }
      if (!sharedHas && baselineHas && !same(local[key], baseline[key])) { result[key] = clone(local[key]); return; }
      if (!baselineHas) { result[key] = localHas ? clone(local[key]) : clone(shared[key]); return; }
      if (localHas && sharedHas) result[key] = mergeConcurrentState(baseline[key], local[key], shared[key]);
    });
    return result as T;
  }

  return clone(local);
}

type KeyedRecord = Record<string, unknown> & { id: string };

function mergeKeyedArrays(baseline: KeyedRecord[], local: KeyedRecord[], shared: KeyedRecord[]) {
  const baselineById = new Map(baseline.map((item) => [item.id, item]));
  const localById = new Map(local.map((item) => [item.id, item]));
  const sharedById = new Map(shared.map((item) => [item.id, item]));
  const order = [...local.map((item) => item.id), ...shared.map((item) => item.id).filter((id) => !localById.has(id))];
  return order.flatMap((id) => {
    const before = baselineById.get(id);
    const localItem = localById.get(id);
    const sharedItem = sharedById.get(id);
    if (before && !localItem) return []; // Local deletion wins, including a collision.
    if (!before) return localItem ? [clone(localItem)] : sharedItem ? [clone(sharedItem)] : [];
    if (!sharedItem) return localItem && !same(localItem, before) ? [clone(localItem)] : [];
    if (!localItem) return [];
    return [mergeConcurrentState(before, localItem, sharedItem)];
  });
}

function keyed(value: unknown[]): value is KeyedRecord[] {
  return value.every((item) => plainObject(item) && typeof item.id === "string");
}

function plainObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function same(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function clone<T>(value: T): T {
  return value === undefined ? value : structuredClone(value);
}
