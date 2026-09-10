import { writeFile } from "node:fs/promises";

/** Run with the Playwright CLI's page; never point this at the museum service. */
export async function checkBoardDesigns(page, start = 0, end = 22) {
  if (!page.url().startsWith("http://127.0.0.1:5197/")) throw new Error("Synthetic checks require the isolated localhost server.");
  await page.route("**/*", (route) => {
    const url = route.request().url();
    return url.startsWith("http://127.0.0.1:5197/") || /^(data|blob):/.test(url) ? route.continue() : route.abort();
  });
  await page.evaluate(async () => {
    const { initialState } = await import("/src/sampleData.ts");
    const { fixtureVersions } = await import("/scripts/board-design-v2-fixture.mjs");
    const state = { ...structuredClone(initialState), ...fixtureVersions(), schedules: [],
      announcement: { ...initialState.announcement, active: false }, activeBlip: { ...initialState.activeBlip, active: false },
      live: { ...initialState.live, active: false } };
    state.screens = structuredClone(initialState.screens);
    for (const screen of Object.values(state.screens)) Object.assign(screen, { particleAnimationEnabled: false, showSubtext: false, mountRotation: "none" });
    localStorage.setItem("project-lantern-state-v1", JSON.stringify(state));
    localStorage.setItem("project-lantern-demo-data-version", "8");
  });
  const ids = await page.evaluate(([start, end]) => JSON.parse(localStorage.getItem("project-lantern-state-v1")).boardPrograms.slice(start, end).map((board) => board.id), [start, end]);
  const results = [];
  for (const id of ids) {
    const { orientation, before } = await page.evaluate((id) => {
      const state = JSON.parse(localStorage.getItem("project-lantern-state-v1"));
      const board = state.boardPrograms.find((board) => board.id === id);
      Object.assign(state.screens["display-1"], { orientation: board.orientation, boardProgramId: id });
      state.schedules = [{ id: "synthetic-preview", name: "Synthetic preview", target: "display-1", boardId: id,
        days: [0, 1, 2, 3, 4, 5, 6], startTime: "00:00", endTime: "23:59", active: true, contentType: "board" }];
      localStorage.setItem("project-lantern-state-v1", JSON.stringify(state));
      return { orientation: board.orientation, before: JSON.stringify(board) };
    }, id);
    await page.setViewportSize(orientation === "Portrait" ? { width: 2160, height: 3840 } : { width: 3840, height: 2160 });
    await page.goto("http://127.0.0.1:5197/#/display/display-1?mount=none");
    await page.reload();
    const canvas = page.locator(".presentation-canvas");
    await canvas.waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    const result = await canvas.evaluate((canvas, id) => {
      const failures = [];
      for (const row of canvas.querySelectorAll(".direct-donor-name")) {
        const bounds = row.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(row.querySelector(".editable-board-text"));
        const text = range.getBoundingClientRect();
        if (text.top < bounds.top - .1 || text.bottom > bounds.bottom + .1 || text.left < bounds.left - .1 || text.right > bounds.right + .1) failures.push("Donor text outside row");
      }
      for (const element of canvas.querySelectorAll(".board-text,.direct-donor-grid")) {
        if (element.scrollHeight > element.clientHeight + 1 || element.scrollWidth > element.clientWidth + 1) failures.push(`Overflow: ${element.closest("[data-panel-id]").dataset.panelId}`);
      }
      return { id, donors: canvas.querySelectorAll(".direct-donor-name").length, failures,
        fittedFonts: [...canvas.querySelectorAll(".direct-donor-grid")].map((grid) => grid.dataset.fittedFontSize),
        textFonts: [...canvas.querySelectorAll(".board-text")].map((text) => ({ text: text.textContent, font: getComputedStyle(text).fontSize })) };
    }, id);
    const after = await page.evaluate((id) => JSON.stringify(JSON.parse(localStorage.getItem("project-lantern-state-v1")).boardPrograms.find((board) => board.id === id)), id);
    result.savedBoardUnchanged = before === after;
    await canvas.screenshot({ path: `output/playwright/${id}.png` });
    results.push(result);
  }
  await writeFile(`output/playwright/v2-checks-${start}-${end}.json`, JSON.stringify(results, null, 2));
  return results.map(({ id, donors, failures, fittedFonts, savedBoardUnchanged }) => ({ id, donors, failures, fittedFonts, savedBoardUnchanged }));
}
