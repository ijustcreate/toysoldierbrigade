/** Fit rendered names without modifying the saved panel, font size or roster. */
export function fitDonorPanel(grid: HTMLElement): number {
  if (!grid.clientWidth || !grid.clientHeight) return 0;
  const names = Array.from(grid.querySelectorAll<HTMLElement>(".direct-donor-name"));
  grid.style.removeProperty("--donor-fitted-size");
  if (!names.length) return 0;

  // The authored size and existing column cap remain the upper bound. Never
  // enlarge text just because this panel has more room than it needs.
  const maximum = Number.parseFloat(getComputedStyle(names[0]).fontSize);
  if (!Number.isFinite(maximum) || maximum <= 0) return 0;
  const contents = names.map((name) => ({
    name,
    elements: Array.from(name.querySelectorAll<HTMLElement>(
      ".editable-board-text, small, .donor-name-line, img, .board-donor-preview-icon"
    ))
  }));
  // Tight line-height can place letter ascenders/descenders outside an element's
  // line box. Measure text ranges too, rather than accepting a clipped first row.
  const textRanges = new Map<HTMLElement, Range>();
  for (const { elements } of contents) {
    for (const element of elements) {
      if (!element.matches?.(".editable-board-text, .donor-name-line, small")) continue;
      const range = element.ownerDocument.createRange();
      range.selectNodeContents(element);
      textRanges.set(element, range);
    }
  }
  const fits = (size: number) => {
    grid.style.setProperty("--donor-fitted-size", `${size}px`);
    return grid.scrollHeight <= grid.clientHeight + 1
      && grid.scrollWidth <= grid.clientWidth + 1
      && contents.every(({ name, elements }) => {
        const bounds = name.getBoundingClientRect();
        // Both rectangles use the same preview/TV scale, including editor zoom.
        return elements.every((element) => {
          const rect = element.getBoundingClientRect();
          const textRect = textRanges.get(element)?.getBoundingClientRect();
          const textFits = !textRect || (textRect.top >= bounds.top && textRect.bottom <= bounds.bottom
            && textRect.left >= bounds.left && textRect.right <= bounds.right);
          return textFits && rect.top >= bounds.top && rect.bottom <= bounds.bottom
            && rect.left >= bounds.left && rect.right <= bounds.right
            && element.scrollWidth <= element.clientWidth + 1;
        });
      });
  };

  let size = maximum;
  if (!fits(maximum)) {
    let low = 0;
    let high = maximum;
    for (let pass = 0; pass < 12; pass += 1) {
      const middle = (low + high) / 2;
      if (fits(middle)) low = middle;
      else high = middle;
    }
    size = Math.floor(low * 100) / 100;
    fits(size);
  }
  grid.dataset.fittedFontSize = String(size);
  return size;
}
