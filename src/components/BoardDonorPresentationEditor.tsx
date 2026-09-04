import { useEffect, useMemo, useState } from "react";
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
  onPatchDonor: (donorId: string, patch: Partial<BoardDonorPresentation>) => void;
  onClearDefaults: () => void;
  onClearDonor: (donorId: string) => void;
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
  onPatchDonor,
  onClearDefaults,
  onClearDonor
}: BoardDonorPresentationEditorProps) {
  const [selectedDonorId, setSelectedDonorId] = useState("");
  useEffect(() => {
    if (selectedDonorId && !donors.some((donor) => donor.id === selectedDonorId)) setSelectedDonorId("");
  }, [donors, selectedDonorId]);

  const selectedDonor = donors.find((donor) => donor.id === selectedDonorId);
  const presentation = useMemo(
    () => resolveBoardDonorPresentation(scope, selectedDonorId, fallbacks),
    [fallbacks, scope, selectedDonorId]
  );
  const explicit = selectedDonorId ? scope.donorStyles?.[selectedDonorId] : scope.donorPresentation;
  const patch = (value: Partial<BoardDonorPresentation>) => selectedDonorId
    ? onPatchDonor(selectedDonorId, value)
    : onPatchDefaults(value);
  const reset = () => selectedDonorId ? onClearDonor(selectedDonorId) : onClearDefaults();
  const previewName = selectedDonor?.name ?? "Board donor name";

  return <div className="board-donor-presentation-editor">
    <label className="field">
      <span>Style scope</span>
      <select value={selectedDonorId} onChange={(event) => setSelectedDonorId(event.target.value)}>
        <option value="">Panel default · all names</option>
        {donors.map((donor) => <option value={donor.id} key={donor.id}>{donor.name}</option>)}
      </select>
      <small>{selectedDonor ? `Overrides only ${selectedDonor.name} in this donor list.` : "Sets the starting presentation for every name in this donor list."}</small>
    </label>

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

    <button type="button" className="command-button secondary compact" disabled={!explicit || !Object.values(explicit).some((value) => value != null)} onClick={reset}>
      {selectedDonor ? "Use panel defaults" : "Use panel font and palette defaults"}
    </button>
  </div>;
}
