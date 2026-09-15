import type { LivePresentation, LiveDisplayLayout, DisplayProfile } from "./types";
import { mergeConcurrentState } from "./concurrentStateMerge";

type Screen = Pick<DisplayProfile, "id" | "orientation">;

export function broadcastProfileKey(live: LivePresentation, screen: Screen) {
  return `${screen.id}:${screen.orientation}:${live.cameraOrientation ?? "Landscape"}`;
}

export function liveCompositionForDisplay(live: LivePresentation, screen: Screen): LivePresentation {
  const legacy = live.displayLayouts?.[screen.id];
  const profile = live.framingProfiles?.[broadcastProfileKey(live, screen)];
  return { ...live, ...legacy, ...profile, frame: profile?.frame ?? legacy?.frame ?? live.frame };
}

/** Apply only the authored gesture differences to the latest frame. */
export function patchBroadcastLayout(live: LivePresentation, screen: Screen, patch: LiveDisplayLayout, baseline?: LivePresentation["frame"], orientation = live.cameraOrientation ?? "Landscape"): LivePresentation {
  const context = { ...live, cameraOrientation: orientation };
  const key = broadcastProfileKey(context, screen);
  const effective = liveCompositionForDisplay(context, screen);
  const frame = patch.frame && baseline
    ? mergeConcurrentState(baseline, patch.frame, effective.frame)
    : patch.frame;
  return {
    ...live,
    framingProfiles: {
      ...live.framingProfiles,
      [key]: { ...live.framingProfiles?.[key], ...patch, ...(frame ? { frame } : {}) }
    }
  };
}
