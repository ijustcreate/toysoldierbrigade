import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./NamesPerRowField.css";

export function NamesPerRowField({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  const commit = (next: number) => {
    const normalized = Math.max(1, Math.min(99, Math.round(next)));
    setDraft(String(normalized));
    if (normalized !== value) onChange(normalized);
  };

  return <div className="field names-per-row-field">
    <span>Names in each row</span>
    <div className="names-per-row-stepper">
      <button type="button" aria-label="Decrease names in each row" disabled={value <= 1} onClick={() => commit(value - 1)}><ChevronLeft size={16} /></button>
      <input type="number" aria-label="Names in each row" min={1} max={99} step={1} value={draft}
        onChange={(event) => {
          const raw = event.currentTarget.value;
          setDraft(raw);
          const next = Number(raw);
          if (raw !== "" && Number.isInteger(next) && next >= 1 && next <= 99 && next !== value) onChange(next);
        }}
        onBlur={() => {
          const next = Number(draft);
          if (draft.trim() && Number.isFinite(next)) commit(next);
          else setDraft(String(value));
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") { setDraft(String(value)); event.preventDefault(); }
        }} />
      <button type="button" aria-label="Increase names in each row" disabled={value >= 99} onClick={() => commit(value + 1)}><ChevronRight size={16} /></button>
    </div>
  </div>;
}
