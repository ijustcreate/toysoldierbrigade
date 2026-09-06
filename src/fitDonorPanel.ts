/** Measure in board coordinates, independent of preview zoom or TV scaling. */
export function fitDonorPanel(grid: HTMLElement) {
  if (!grid.clientWidth || !grid.clientHeight) return 0;
  const rows = Array.from(grid.querySelectorAll<HTMLElement>(".direct-donor-name"));
  if (!rows.length) return 0;
  const fits = (size: number) => {
    grid.style.setProperty("--donor-name-size", `${size}px`);
    return rows.every(row => {
      const bounds = row.getBoundingClientRect();
      return Array.from(row.querySelectorAll<HTMLElement>(".editable-board-text, small, .donor-name-line, img, .board-donor-preview-icon")).every(text => {
        const rect = text.getBoundingClientRect();
        return rect.top >= bounds.top - .1 && rect.bottom <= bounds.bottom + .1
          && rect.left >= bounds.left - .1 && rect.right <= bounds.right + .1
          && text.scrollWidth <= text.clientWidth + 1;
      });
    });
  };
  let low = .1, high = 240;
  for (let pass = 0; pass < 16; pass++) {
    const middle = (low + high) / 2;
    if (fits(middle)) low = middle;
    else high = middle;
  }
  const size = Math.floor(low * 10) / 10;
  fits(size);
  grid.dataset.fittedFontSize = String(size);
  return size;
}
