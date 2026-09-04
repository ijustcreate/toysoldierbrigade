import type {
  BoardPanel,
  BoardDonorPresentation,
  DonorBoardProgram,
  DisplayProfile,
  RecognitionIcon
} from "./types";

export type DonorPresentationScope = Pick<DonorBoardProgram, "fontFamily" | "donorPresentation" | "donorStyles">
  | Pick<BoardPanel, "fontFamily" | "donorPresentation" | "donorStyles">;

export interface BoardPresentationFallbacks {
  fontFamily: NonNullable<DisplayProfile["fontFamily"]>;
  nameColor: string;
  accentColor: string;
}

export interface ResolvedBoardDonorPresentation {
  fontFamily: NonNullable<DisplayProfile["fontFamily"]>;
  nameColor: string;
  accentColor: string;
  highlight: NonNullable<BoardDonorPresentation["highlight"]>;
  underlineThickness?: number;
  underlineOffset?: number;
  underlineOpacity?: number;
  recognitionIcon: RecognitionIcon;
  recognitionIconImage?: string;
  animation: NonNullable<BoardDonorPresentation["animation"]>;
}

export function resolveBoardDonorPresentation(
  scope: DonorPresentationScope,
  donorId: string,
  fallbacks: BoardPresentationFallbacks
): ResolvedBoardDonorPresentation {
  const boardStyle = scope.donorPresentation ?? {};
  const donorStyle = scope.donorStyles?.[donorId] ?? {};
  return {
    fontFamily: donorStyle.fontFamily ?? boardStyle.fontFamily ?? scope.fontFamily ?? fallbacks.fontFamily,
    nameColor: donorStyle.nameColor ?? boardStyle.nameColor ?? fallbacks.nameColor,
    accentColor: donorStyle.accentColor ?? boardStyle.accentColor ?? fallbacks.accentColor,
    // "soft-highlight" was an older visual treatment. It is no longer
    // offered, so older boards fall back to a clean name rather than a box.
    highlight: (donorStyle.highlight ?? boardStyle.highlight) === "soft-highlight" ? "none" : donorStyle.highlight ?? boardStyle.highlight ?? "none",
    underlineThickness: donorStyle.underlineThickness ?? boardStyle.underlineThickness,
    underlineOffset: donorStyle.underlineOffset ?? boardStyle.underlineOffset,
    underlineOpacity: donorStyle.underlineOpacity ?? boardStyle.underlineOpacity,
    recognitionIcon: donorStyle.recognitionIcon ?? boardStyle.recognitionIcon ?? "star",
    recognitionIconImage: donorStyle.recognitionIconImage ?? boardStyle.recognitionIconImage,
    animation: donorStyle.animation ?? boardStyle.animation ?? "none"
  };
}

export function patchBoardDonorStyle(
  scope: DonorPresentationScope,
  donorId: string,
  patch: Partial<BoardDonorPresentation>
): Record<string, BoardDonorPresentation> | undefined {
  const current = scope.donorStyles?.[donorId] ?? {};
  return {
    ...(scope.donorStyles ?? {}),
    [donorId]: { ...current, ...patch }
  };
}

export function clearBoardDonorStyle(scope: DonorPresentationScope, donorId: string): Record<string, BoardDonorPresentation> | undefined {
  const donorStyles = { ...(scope.donorStyles ?? {}) };
  delete donorStyles[donorId];
  return Object.keys(donorStyles).length ? donorStyles : undefined;
}

export function boardUsesDonorAnimation(program?: DonorBoardProgram) {
  if (!program) return false;
  if ((program.panels ?? []).some((panel) => panel.type === "donors" && (
    (panel.donorPresentation?.animation && panel.donorPresentation.animation !== "none")
    || Object.values(panel.donorStyles ?? {}).some((style) => style.animation && style.animation !== "none")
  ))) return true;
  if (program.donorPresentation?.animation && program.donorPresentation.animation !== "none") return true;
  return Object.values(program.donorStyles ?? {}).some((style) => style.animation && style.animation !== "none");
}
