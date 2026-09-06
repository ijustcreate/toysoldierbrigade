export const DISPLAY_WAKE_LOCK_RETRY_MS = 60_000;

/**
 * Keep an unattended browser display awake when the browser exposes the
 * Screen Wake Lock API. Fire TV / Silk can still enforce system-level idle
 * policy, so callers must treat this as a best-effort enhancement rather than
 * simulated user activity.
 */
export function startDisplayWakeLock() {
  let disposed = false;
  let requesting = false;
  let wakeLock: WakeLockSentinel | null = null;

  const requestWakeLock = async () => {
    if (disposed || requesting || document.visibilityState !== "visible" || wakeLock && !wakeLock.released) return;
    if (!("wakeLock" in navigator)) return;

    requesting = true;
    try {
      const nextWakeLock = await navigator.wakeLock.request("screen");
      if (disposed || document.visibilityState !== "visible") {
        void nextWakeLock.release().catch(() => undefined);
        return;
      }
      wakeLock = nextWakeLock;
      nextWakeLock.addEventListener("release", () => {
        if (wakeLock === nextWakeLock) wakeLock = null;
      }, { once: true });
    } catch {
      // The browser or Fire OS may reject the request because of its own power
      // policy. The retry pulse below gives a later visible page another chance.
      wakeLock = null;
    } finally {
      requesting = false;
    }
  };

  const requestWhenVisible = () => {
    if (document.visibilityState === "visible") void requestWakeLock();
  };

  void requestWakeLock();
  const retryPulse = window.setInterval(requestWhenVisible, DISPLAY_WAKE_LOCK_RETRY_MS);
  window.addEventListener("focus", requestWhenVisible);
  document.addEventListener("visibilitychange", requestWhenVisible);

  return () => {
    disposed = true;
    window.clearInterval(retryPulse);
    window.removeEventListener("focus", requestWhenVisible);
    document.removeEventListener("visibilitychange", requestWhenVisible);
    if (wakeLock && !wakeLock.released) void wakeLock.release().catch(() => undefined);
    wakeLock = null;
  };
}
