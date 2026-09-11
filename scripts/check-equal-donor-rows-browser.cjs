/** Playwright CLI run-code --filename scripts/check-equal-donor-rows-browser.cjs.
 * Synthetic fixtures only; block remote HTTP and WebSocket traffic before loading.
 */
async (page) => {
  const origin = 'http://127.0.0.1:5199';
  const previousViewport = page.viewportSize() ?? await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
  try {
  await page.route('**/*', route => route.request().url().startsWith(`${origin}/`) ? route.continue() : route.abort());
  await page.routeWebSocket('**/*', socket => socket.close());
  await page.goto(origin);
  await page.evaluate(async () => {
    const { initialState } = await import('/src/sampleData.ts');
    const { normalizeState } = await import('/src/host/lanternHost.ts');
    const state = structuredClone(initialState);
    const board = structuredClone(state.boardPrograms.find(b => b.panels?.some(p => p.type === 'donors')));
    board.id = 'synthetic-equal-rows'; board.name = 'Equal donor row test'; board.orientation = 'Landscape';
    state.donors = Array.from({ length: 24 }, (_, i) => ({
      ...state.donors[0], id: `synthetic-${i}`, boardIds: [board.id],
      name: i >= 15 && i < 18 ? `Short ${i}` : `Alex and Jordan Example ${i}`,
      subtext: '', note: ''
    }));
    board.donorIds = state.donors.map(d => d.id);
    board.panels = [{ id: 'synthetic-list', type: 'donors', title: 'Synthetic list', size: 'feature', columns: 3, rows: 8,
      donorIds: board.donorIds, x: 5, y: 5, width: 90, height: 85, fontSize: 18, donorRowGap: 0, donorColumnGap: 3 }];
    state.boardPrograms = [board]; state.boardOpenOwners = {};
    for (const screen of Object.values(state.screens)) Object.assign(screen, { boardProgramId: board.id, orientation: 'Landscape', mountRotation: 'none' });
    state.schedules = [{ id: 'synthetic-schedule', name: 'Synthetic schedule', target: 'display-1', boardId: board.id,
      days: [0,1,2,3,4,5,6], startTime: '00:00', endTime: '23:59', active: true, contentType: 'board' }];
    state.announcement.active = state.activeBlip.active = state.live.active = false;
    // Store a complete current-schema fixture before checking rendering purity.
    localStorage.setItem('project-lantern-state-v1', JSON.stringify(normalizeState(state)));
    localStorage.setItem('project-lantern-demo-data-version', '8');
  });
  const before = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('project-lantern-state-v1'));
    return JSON.stringify({ boards: state.boardPrograms, donors: state.donors, schedules: state.schedules });
  });
  const results = [];
  for (const [surface, width, height, route] of [
    ['editor', 1500, 950, '/#/theme'],
    ['display', 1920, 1080, '/#/display/display-1?mount=none'],
    ['display-4k', 3840, 2160, '/#/display/display-1?mount=none']
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(`${origin}${route}`);
    await page.reload();
    const grid = page.locator('.direct-donor-grid').first();
    await grid.waitFor();
    await page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
    const metrics = await grid.evaluate(grid => {
      const names = [...grid.querySelectorAll('.direct-donor-name')];
      return {
        heights: names.filter((_, i) => i % 3 === 0).map(row => row.getBoundingClientRect().height),
        names: names.length,
        overflow: names.some(name => {
          const bounds = name.getBoundingClientRect();
          const range = document.createRange(); range.selectNodeContents(name.querySelector('.editable-board-text'));
          const text = range.getBoundingClientRect();
          return text.top < bounds.top - .2 || text.bottom > bounds.bottom + .2 || text.left < bounds.left - .2 || text.right > bounds.right + .2;
        })
      };
    });
    if (metrics.names !== 24 || metrics.heights.length !== 8) throw new Error(`Missing fixture names: ${JSON.stringify(metrics)}`);
    if (Math.max(...metrics.heights) - Math.min(...metrics.heights) > .2) throw new Error(`Unequal row heights: ${JSON.stringify(metrics)}`);
    if (metrics.overflow) throw new Error(`Text overflow on ${surface}`);
    await grid.screenshot({ path: `output/playwright/equal-donor-rows-${surface}.png` });
    results.push({ surface, ...metrics });
  }
  const after = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('project-lantern-state-v1'));
    return JSON.stringify({ boards: state.boardPrograms, donors: state.donors, schedules: state.schedules });
  });
  if (after !== before) {
    const index = [...before].findIndex((char, i) => char !== after[i]);
    throw new Error(`Rendering changed saved settings or content at ${index}: ${before.slice(index - 60, index + 160)} -> ${after.slice(index - 60, index + 160)}`);
  }
  return { results, savedSettingsAndContent: 'unchanged' };
  } finally {
    // Restore the normal preview after 4K checks, including assertion failures.
    await page.setViewportSize(previousViewport);
  }
}
