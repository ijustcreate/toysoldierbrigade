import "./TrackingNotice.css";

/** Release status only: this notice must never enable, disable or reset tracking. */
export function TrackingNotice() {
  return <aside className="tracking-development-notice" role="note" aria-label="Tracking development status">
    <strong>Under construction</strong>
    <span>Tracking remains available for testing. Results may vary; full puppet authoring is deferred from this release.</span>
  </aside>;
}
