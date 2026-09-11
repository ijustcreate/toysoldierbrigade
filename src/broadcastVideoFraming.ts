import type { LiveVideoFrame } from "./types";

/** Keep the whole source and bound processing to the existing 640 × 360 budget. */
export function broadcastProcessingSize(width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return { width: 640, height: 360 };
  }
  const scale = Math.min(1, 640 / Math.max(width, height), Math.sqrt(640 * 360 / (width * height)));
  return { width: Math.max(1, Math.floor(width * scale)), height: Math.max(1, Math.floor(height * scale)) };
}

/** A deliberate Fit action also clears the pan/zoom that could still hide edges. */
export function fitWholeBroadcastSource(frame: LiveVideoFrame): LiveVideoFrame {
  return {
    ...frame,
    fitMode: "fit",
    crop: { scale: 1, x: 0, y: 0 },
    cropEdges: { top: 0, right: 0, bottom: 0, left: 0 },
    rotation: 0
  };
}
