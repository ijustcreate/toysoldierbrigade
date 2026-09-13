import { useMemo } from "react";
import type {
  BoardDonorAnimation,
  BoardDonorHighlight,
  BoardDonorPresentation,
  DisplayProfile,
  RecognitionIcon
} from "../types";
import { resolveBoardDonorPresentation, type BoardPresentationFallbacks, type DonorPresentationScope } from "../boardPresentation";

type FontFamily = NonNullable<DisplayProfile["fontFamily"]>;

interface BoardDonorPresentationEditorProps {
  scope: DonorPresentationScope;
  fallbacks: BoardPresentationFallbacks;
  fontOptions: FontFamily[];
  fontLabels: Record<FontFamily, string>;
  iconsVisible: boolean;
  onIconsVisibleChange: (visible: boolean) => void;
  iconPlacement: "left" | "right" | "above" | "below" | "both";
  onIconPlacementChange: (placement: "left" | "right" | "above" | "below" | "both") => void;
  onPatchDefaults: (patch: Partial<BoardDonorPresentation>) => void;
}

const underlineLabels: Record<Exclude<BoardDonorHighlight, "soft-highlight">, string> = {
  none: "None",
  "fine-underline": "Fine underline",
  "bold-underline": "Bold underline",
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

export function FontPicker({ value, options, labels, onChange }: { value: FontFamily; options: FontFamily[]; labels: Record<FontFamily, string>; onChange: (value: FontFamily) => void }) {
  return <details className="font-picker">
    <summary><span style={{ fontFamily: value }}>{labels[value]}</span></summary>
    <div className="font-picker-options" role="listbox" aria-label="Display font">
      {options.map((font) => <button type="button" role="option" aria-selected={font === value} key={font} style={{ fontFamily: font }} onClick={(event) => { onChange(font); event.currentTarget.closest("details")?.removeAttribute("open"); }}>{labels[font]}</button>)}
    </div>
  </details>;
}

export function BoardDonorPresentationEditor({
  scope,
  fallbacks,
  fontOptions,
  fontLabels,
  iconsVisible,
  onIconsVisibleChange,
  iconPlacement,
  onIconPlacementChange,
  onPatchDefaults,
}: BoardDonorPresentationEditorProps) {
  const presentation = useMemo(
    () => resolveBoardDonorPresentation(scope, "", fallbacks),
    [fallbacks, scope]
  );
  const patch = (value: Partial<BoardDonorPresentation>) => onPatchDefaults(value);

  return <div className="board-donor-presentation-editor">
    <label className="field">
      <span>Display font</span>
      <FontPicker value={presentation.fontFamily} options={fontOptions} labels={fontLabels} onChange={(fontFamily) => patch({ fontFamily })} />
    </label>

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
      <label className="field board-donor-line-color"><span>Line color</span><input type="color" value={presentation.accentColor} onChange={(event) => patch({ accentColor: event.target.value })} /></label>
    </div>}

    <label className="field">
      <span>Recognition icon</span>
      <select value={presentation.recognitionIcon} onChange={(event) => patch({ recognitionIcon: event.target.value as RecognitionIcon })}>
        {(Object.keys(iconLabels) as RecognitionIcon[]).map((value) => <option value={value} key={value}>{value === "none" ? "None" : `${recognitionIconGlyph(value)}  ${iconLabels[value]}`}</option>)}
      </select>
    </label>
    <div className="board-donor-icon-toggles"><label className="switch-row"><input type="checkbox" checked={iconsVisible} onChange={(event) => onIconsVisibleChange(event.target.checked)} /><span>Show icons</span></label>{iconsVisible && <label className="switch-row"><input type="checkbox" checked={iconPlacement === "both"} onChange={(event) => onIconPlacementChange(event.target.checked ? "both" : "left")} /><span>Both sides</span></label>}</div>

  </div>;
}
