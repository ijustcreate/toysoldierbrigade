/** Keep a live display from rolling back to its startup cache or an obsolete request. */
export function createDisplayStateRefreshGuard() {
  let revision = 0;
  let hasLiveState = false;
  return {
    begin: () => revision,
    receivedLiveUpdate() {
      hasLiveState = true;
      revision += 1;
    },
    accept(requestRevision: number, source: "shared" | "local") {
      if (requestRevision !== revision || (hasLiveState && source === "local")) return false;
      if (source === "shared") hasLiveState = true;
      return true;
    }
  };
}
