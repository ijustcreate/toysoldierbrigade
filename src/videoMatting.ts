import type { ChromaKeySettings } from "./types";

const clamp01 = (value: number) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

/** Reuses both buffers; strong motion catches up quickly without flickering at rest. */
export class PersonMaskSmoother {
  readonly rgba: Uint8ClampedArray<ArrayBuffer>;
  private readonly values: Float32Array;
  private initialized = false;

  constructor(pixelCount: number) {
    this.values = new Float32Array(pixelCount);
    this.rgba = new Uint8ClampedArray(pixelCount * 4);
    this.rgba.fill(255);
  }

  update(confidence: Float32Array, threshold: number, feather: number, elapsedMs = 100) {
    if (confidence.length !== this.values.length) throw new Error("Person mask dimensions changed");
    const lower = Math.max(.02, clamp01(threshold) - clamp01(feather) / 2);
    const upper = Math.min(.98, clamp01(threshold) + clamp01(feather) / 2);
    const range = Math.max(.01, upper - lower);
    const elapsed = Math.max(.25, Math.min(3, elapsedMs / 100));
    const steadyResponse = 1 - Math.pow(1 - .58, elapsed);
    const movingResponse = 1 - Math.pow(1 - .88, elapsed);
    for (let i = 0; i < confidence.length; i++) {
      const value = clamp01(confidence[i]);
      const old = this.values[i];
      const response = Math.abs(value - old) > .08 ? movingResponse : steadyResponse;
      const next = this.initialized ? old + (value - old) * response : value;
      this.values[i] = next;
      const edge = clamp01((next - lower) / range);
      this.rgba[i * 4 + 3] = Math.round(edge * edge * (3 - 2 * edge) * 255);
    }
    this.initialized = true;
    return this.rgba;
  }
}

/** Key in chroma space, retain source alpha, and remove spill of the chosen color. */
export function keyChromaPixels(pixels: Uint8ClampedArray, settings: ChromaKeySettings) {
  const hex = settings.color.replace("#", "");
  const full = hex.length === 3 ? hex.split("").map(c => c + c).join("") : hex;
  if (!/^[0-9a-f]{6}$/i.test(full)) return;
  const key = [0, 2, 4].map(offset => parseInt(full.slice(offset, offset + 2), 16) / 255);
  const keyCb = -.168736 * key[0] - .331264 * key[1] + .5 * key[2];
  const keyCr = .5 * key[0] - .418688 * key[1] - .081312 * key[2];
  const threshold = Math.max(.015, clamp01(settings.similarity) * .5);
  const feather = Math.max(.008, clamp01(settings.smoothness) * .45);
  const inner = threshold * threshold;
  const range = Math.max(.0001, (threshold + feather) ** 2 - inner);
  const dominant = key.indexOf(Math.max(...key));
  const otherA = (dominant + 1) % 3;
  const otherB = (dominant + 2) % 3;
  const coloredKey = key[dominant] - Math.max(key[otherA], key[otherB]) > .05;
  const spillStrength = clamp01(settings.spill);
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] === 0) continue;
    const red = pixels[i] / 255, green = pixels[i + 1] / 255, blue = pixels[i + 2] / 255;
    const cb = -.168736 * red - .331264 * green + .5 * blue - keyCb;
    const cr = .5 * red - .418688 * green - .081312 * blue - keyCr;
    const edge = Math.max(0, Math.min(1, (cb * cb + cr * cr - inner) / range));
    const alpha = edge * edge * (3 - 2 * edge);
    pixels[i + 3] = Math.round(pixels[i + 3] * alpha);
    if (coloredKey && spillStrength > 0 && alpha > 0 && alpha < 1) {
      const neutral = (pixels[i + otherA] + pixels[i + otherB]) / 2;
      pixels[i + dominant] -= Math.max(0, pixels[i + dominant] - neutral) * (1 - alpha) * spillStrength;
    }
  }
}
