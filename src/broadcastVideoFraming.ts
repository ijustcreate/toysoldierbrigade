import type { LiveVideoFrame } from "./types";

/** Resize from a fixed opposite edge; corner drags keep the original aspect ratio. */
export function resizeBroadcastFrame(frame: LiveVideoFrame, edge: string, dx: number, dy: number, proportional = edge.length === 2): LiveVideoFrame {
  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  const west = edge.includes("w"), north = edge.includes("n");
  let { x, y, width, height } = frame;
  if (proportional) {
    const horizontal = (west ? -dx : dx) / width;
    const vertical = (north ? -dy : dy) / height;
    const delta = edge === "n" || edge === "s" ? vertical : edge === "e" || edge === "w" ? horizontal
      : Math.abs(horizontal) >= Math.abs(vertical) ? horizontal : vertical;
    const maximum = Math.min((west ? x + width : 100 - x) / width, (north ? y + height : 100 - y) / height);
    const scale = clamp(1 + delta, Math.min(maximum, Math.max(10 / width, 10 / height)), maximum);
    width *= scale;
    height *= scale;
    if (west) x = frame.x + frame.width - width;
    if (north) y = frame.y + frame.height - height;
  } else {
    if (edge.includes("e")) width = clamp(width + dx, 10, 100 - x);
    if (edge.includes("s")) height = clamp(height + dy, 10, 100 - y);
    if (west) { x = clamp(x + dx, 0, x + width - 10); width = frame.x + frame.width - x; }
    if (north) { y = clamp(y + dy, 0, y + height - 10); height = frame.y + frame.height - y; }
  }
  return { ...frame, x, y, width, height, maskShape: frame.maskShape === "square" && !proportional ? "rectangle" : frame.maskShape };
}

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
