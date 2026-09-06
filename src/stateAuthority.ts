function validTimestamp(value: string | null | undefined) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export const SHARED_STATE_VERSION_HEADER = "X-Lantern-State-Version";
export const MISSING_SHARED_STATE_VERSION = "missing";

export function sharedStateVersionHeaderValue(updatedAt: string | null) {
  return updatedAt ?? MISSING_SHARED_STATE_VERSION;
}

/** Keep the persisted version timestamp strictly increasing, even for same-millisecond writes. */
export function nextSharedStateUpdatedAt(expectedUpdatedAt: string | null, now = Date.now()) {
  const expectedTimestamp = validTimestamp(expectedUpdatedAt);
  return new Date(expectedTimestamp === null ? now : Math.max(now, expectedTimestamp + 1)).toISOString();
}

/** Preserve a durable browser save when shared sync failed after the edit. */
export function localStateIsNewer(localUpdatedAt: string | null, sharedUpdatedAt: string | null) {
  const localTimestamp = validTimestamp(localUpdatedAt);
  const sharedTimestamp = validTimestamp(sharedUpdatedAt);
  if (localTimestamp === null) return false;
  if (sharedTimestamp === null) return true;
  return localTimestamp > sharedTimestamp;
}
