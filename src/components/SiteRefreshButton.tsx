import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import { hasPendingSharedSave, loadSharedLanternStateSnapshot } from "../host/lanternHost";

export const SITE_REFRESH_REQUEST = "lantern-site-refresh-request";

export function SiteRefreshButton({ className = "command-button secondary" }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  const refresh = async () => {
    if (!window.dispatchEvent(new Event(SITE_REFRESH_REQUEST, { cancelable: true }))) return;
    if (hasPendingSharedSave()) {
      window.alert("Changes are still syncing. Wait for saving to finish, then refresh.");
      return;
    }
    setBusy(true);
    try {
      // Read only: a refresh must never publish the device's cached state.
      const snapshot = await loadSharedLanternStateSnapshot({ updateSyncContext: false });
      if (!snapshot.state) throw new Error("The latest shared data is unavailable. Your current screen has been kept open.");
      const url = new URL(window.location.href);
      url.searchParams.set("lantern-refresh", String(Date.now()));
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error("The latest site build could not be loaded. Please try again.");
      // Recheck after network waits in case an operator edited while refreshing.
      if (hasPendingSharedSave() || !window.dispatchEvent(new Event(SITE_REFRESH_REQUEST, { cancelable: true }))) return;
      window.location.replace(url.href);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Refresh failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return <button type="button" className={className} disabled={busy} onClick={() => void refresh()} title="Load the latest shared data and published site build"><RefreshCcw size={17} /><span>{busy ? "Refreshing…" : "Refresh"}</span></button>;
}
