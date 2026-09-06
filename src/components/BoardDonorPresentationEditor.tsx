import { useMemo } from "react";
import type {
  BoardDonorAnimation,
  BoardDonorHighlight,
  BoardDonorPresentation,
  Donor,
  DisplayProfile,
  RecognitionIcon
} from "../types";
import { resolveBoardDonorPresentation, type BoardPresentationFallbacks, type DonorPresentationScope } from "../boardPresentation";

type FontFamily = NonNullable<DisplayProfile["fontFamily"]>;

interface BoardDonorPresentationEditorProps {
  scope: DonorPresentationScope;
  donors: Donor[];
  fallbacks: BoardPresentationFallbacks;
  fontOptions: FontFamily[];
  fontLabels: Record<FontFamily, string>;
  iconsVisible: boolean;
  onIconsVisibleChange: (visible: boolean) => void;
  iconPlacement: "left" | "right" | "above" | "below";
  onIconPlacementChange: (placement: "left" | "right" | "above" | "below") => void;
  onPatchDefaults: (patch: Partial<BoardDonorPresentation>) => void;
  onClearDefaults: () => void;
}

const underlineLabels: Record<Exclude<BoardDonorHighlight, "soft-highlight">, string> = {
  none: "None",
  "fine-underline": "Fine underline",
  "soft-underline": "Soft underline"
};

const iconLabels: Record<RecognitionIcon, string> = {
  none: "None",
  star: "Star",
  heart: "Heart",
  leaf: "Leaf",
  sparkle: "Sparkle",
  diamond: "Diamond",
  crown: "Crown",
  laurel: "Laurel",
  sun: "Sun"
};

export function recognitionIconGlyph(icon: RecognitionIcon) {
  return ({
    none: "",
    star: "★",
    heart: "♥",
    leaf: "◆",
    sparkle: "✦",
    diamond: "◇",
    crown: "♛",
    laurel: "❧",
    sun: "☀"
  } satisfies Record<RecognitionIcon, string>)[icon];
}

export function AnimatedDonorName({ name, animation }: { name: string; animation: BoardDonorAnimation }) {
  if (animation !== "letter-wave") return <span className="board-donor-name-text">{name}</span>;
  return <span className="board-donor-name-text board-letter-wave" aria-label={name}>{Array.from(name).map((letter, index) => <span aria-hidden="true" style={{ "--letter-index": index } as React.CSSProperties} key={`${letter}-${index}`}>{letter === " " ? "\u00a0" : letter}</span>)}</span>;
}

export function BoardDonorPresentationEditor({
  scope,
  donors,
  fallbacks,
  fontOptions,
  fontLabels,
  iconsVisible,
  onIconsVisibleChange,
  iconPlacement,
  onIconPlacementChange,
  onPatchDefaults,
  onClearDefaults
}: BoardDonorPresentationEditorProps) {
  const presentation = useMemo(
    () => resolveBoardDonorPresentation(scope, "", fallbacks),
    [fallbacks, scope]
  );
  const patch = (value: Partial<BoardDonorPresentation>) => onPatchDefaults(value);
  const previewName = donors[0]?.name ?? "Board donor name";

  return <div className="board-donor-presentation-editor">
    <p className="field-note">These settings apply to every donor in this list.</p>

    <div
      className={`board-donor-style-preview board-highlight-${presentation.highlight} icon-${iconPlacement}`}
      style={{
        "--board-donor-name": presentation.nameColor,
        "--board-donor-accent": presentation.accentColor,
        "--board-donor-underline-thickness": `${presentation.underlineThickness ?? (presentation.highlight === "soft-underline" ? 3 : 1)}px`,
        "--board-donor-underline-offset": `${presentation.underlineOffset ?? 0}px`,
        "--board-donor-underline-opacity": `${presentation.underlineOpacity ?? (presentation.highlight === "soft-underline" ? 48 : 78)}%`,
        fontFamily: presentation.fontFamily
      } as React.CSSProperties}
      aria-label={`${previewName} presentation preview`}
    >
      {iconsVisible && presentation.recognitionIcon !== "none" && (presentation.recognitionIconImage
        ? <img src={presentation.recognitionIconImage} alt="" />
        : <span className="board-donor-preview-icon" aria-hidden="true">{recognitionIconGlyph(presentation.recognitionIcon)}</span>)}
      <AnimatedDonorName name={previewName} animation="none" />
    </div>

    <label className="field">
      <span>Display font</span>
      <select value={presentation.fontFamily} onChange={(event) => patch({ fontFamily: event.target.value as FontFamily })}>
        {fontOptions.map((font) => <option value={font} key={font}>{fontLabels[font]}</option>)}
      </select>
    </label>

    <div className="board-donor-color-grid">
      <label className="field"><span>Name color</span><input type="color" value={presentation.nameColor} onChange={(event) => patch({ nameColor: event.target.value })} /></label>
      <label className="field"><span>Accent color</span><input type="color" value={presentation.accentColor} onChange={(event) => patch({ accentColor: event.target.value })} /></label>
    </div>

    <label className="field">
      <span>Underline</span>
      <select value={presentation.highlight} onChange={(event) => patch({ highlight: event.target.value as BoardDonorHighlight })}>
        {(Object.keys(underlineLabels) as Array<Exclude<BoardDonorHighlight, "soft-highlight">>).map((value) => <option value={value} key={value}>{underlineLabels[value]}</option>)}
      </select>
    </label>
    {presentation.highlight !== "none" && <div className="board-donor-underline-controls">
      <label><span>Thickness</span><input type="range" min="1" max="8" value={presentation.underlineThickness ?? (presentation.highlight === "soft-underline" ? 3 : 1)} onChange={(event) => patch({ underlineThickness: Number(event.target.value) })} /><b>{presentation.underlineThickness ?? (presentation.highlight === "soft-underline" ? 3 : 1)} px</b></label>
      <label><span>Offset</span><input type="range" min="0" max="16" value={presentation.underlineOffset ?? 0} onChange={(event) => patch({ underlineOffset: Number(event.target.value) })} /><b>{presentation.underlineOffset ?? 0} px</b></label>
      <label><span>Opacity</span><input type="range" min="10" max="100" value={presentation.underlineOpacity ?? (presentation.highlight === "soft-underline" ? 48 : 78)} onChange={(event) => patch({ underlineOpacity: Number(event.target.value) })} /><b>{presentation.underlineOpacity ?? (presentation.highlight === "soft-underline" ? 48 : 78)}%</b></label>
    </div>}

    <label className="field">
      <span>Recognition icon</span>
      <select value={presentation.recognitionIcon} onChange={(event) => patch({ recognitionIcon: event.target.value as RecognitionIcon })}>
        {(Object.keys(iconLabels) as RecognitionIcon[]).map((value) => <option value={value} key={value}>{iconLabels[value]}</option>)}
      </select>
    </label>
    <label className="switch-row"><input type="checkbox" checked={iconsVisible} onChange={(event) => onIconsVisibleChange(event.target.checked)} /><span>Show recognition icons in this donor list</span></label>
    {iconsVisible && <label className="field"><span>Icon position</span><select value={iconPlacement} onChange={(event) => onIconPlacementChange(event.target.value as typeof iconPlacement)}><option value="left">Left of name</option><option value="right">Right of name</option><option value="above">Above name</option><option value="below">Below name</option></select></label>}

    <button type="button" className="command-button secondary compact" disabled={!scope.donorPresentation || !Object.values(scope.donorPresentation).some((value) => value != null)} onClick={onClearDefaults}>Use panel font and palette defaults</button>
  </div>;
}
