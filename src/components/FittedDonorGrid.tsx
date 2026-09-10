import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { fitDonorPanel } from "../fitDonorPanel";

/** Shared by the editor and read-only board presentations. */
export function FittedDonorGrid({ style, children }: { style: CSSProperties; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    let active = true;
    let frame = 0;
    const fit = () => { if (active) fitDonorPanel(grid); };
    const queueFit = () => {
      if (!active) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    fit();
    const observer = new ResizeObserver(queueFit);
    observer.observe(grid);
    void document.fonts.ready.then(queueFit);
    document.fonts.addEventListener("loadingdone", queueFit);
    // Uploaded recognition icons can acquire their dimensions after rendering.
    grid.addEventListener("load", queueFit, true);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", queueFit);
      grid.removeEventListener("load", queueFit, true);
    };
  }, [style, children]);
  return <div ref={ref} className="direct-donor-grid" style={style}>{children}</div>;
}
