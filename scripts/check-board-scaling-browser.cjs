/** Playwright CLI run-code --filename scripts/check-board-scaling-browser.cjs.
 * Uses invented V2 fixtures in an isolated browser; blocks all external traffic.
 */
async (page) => {
  const origin = 'http://127.0.0.1:5197';
  const previousViewport = page.viewportSize() ?? await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
  try {
  await page.route('**/*', route => {
    const url = route.request().url();
    return url.startsWith(`${origin}/`) || /^(data|blob):/.test(url) ? route.continue() : route.abort();
  });
  await page.goto(origin);
  await page.evaluate(async () => {
    const { initialState } = await import('/src/sampleData.ts');
    const { fixtureVersions } = await import('/scripts/board-design-v2-fixture.mjs');
    const state = { ...structuredClone(initialState), ...fixtureVersions(), screens: structuredClone(initialState.screens), boardOpenOwners: {} };
    state.live.active = state.announcement.active = state.activeBlip.active = false;
    localStorage.setItem('project-lantern-state-v1', JSON.stringify(state));
    localStorage.setItem('project-lantern-demo-data-version', '8');
  });
  const boards = await page.evaluate(() => JSON.parse(localStorage.getItem('project-lantern-state-v1')).boardPrograms.map(b => ({ id: b.id, orientation: b.orientation })));
  const sizes = [[3840,2160], [1800,900], [1366,768], [800,600], [390,844], [320,568], [2160,3840], [1920,1080]];
  const results = [];
  for (const board of boards) {
    const saved = await page.evaluate(({ id, orientation }) => {
      const state = JSON.parse(localStorage.getItem('project-lantern-state-v1'));
      // Deliberately use the other screen format: the board must keep its own ratio.
      Object.assign(state.screens['display-1'], { orientation: orientation === 'Portrait' ? 'Landscape' : 'Portrait', boardProgramId: id, mountRotation: 'none' });
      state.schedules = [{ id: 'synthetic-scaling', name: 'Synthetic scaling', target: 'display-1', boardId: id, days: [0,1,2,3,4,5,6], startTime: '00:00', endTime: '23:59', active: true, contentType: 'board' }];
      localStorage.setItem('project-lantern-state-v1', JSON.stringify(state));
      return JSON.stringify(state.boardPrograms);
    }, board);
    await page.goto(`${origin}/#/display/display-1?mount=none`);
    await page.reload();
    await page.locator('.presentation-canvas').waitFor();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
    });
    let baseline;
    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const metrics = await page.locator('.presentation-canvas').evaluate(canvas => {
        const r = canvas.getBoundingClientRect();
        return {
          x: r.x, y: r.y, width: r.width, height: r.height,
          authoredWidth: canvas.offsetWidth, authoredHeight: canvas.offsetHeight,
          panels: [...canvas.querySelectorAll('.direct-board-panel')].map(panel => {
            const p = panel.getBoundingClientRect();
            return [(p.x-r.x)/r.width, (p.y-r.y)/r.height, p.width/r.width, p.height/r.height];
          }),
          fonts: [...canvas.querySelectorAll('.board-text')].map(text => getComputedStyle(text).fontSize)
        };
      });
      const expected = board.orientation === 'Portrait' ? [405,720] : [960,540];
      const failures = [];
      if (metrics.authoredWidth !== expected[0] || metrics.authoredHeight !== expected[1]) failures.push('Authored dimensions changed');
      if (Math.abs(metrics.width/metrics.height - expected[0]/expected[1]) > .001) failures.push('Aspect ratio distorted');
      if (metrics.x < -1 || metrics.y < -1 || metrics.x+metrics.width > width+1 || metrics.y+metrics.height > height+1) failures.push('Board clipped');
      if (Math.abs(metrics.x+metrics.width/2-width/2) > 1 || Math.abs(metrics.y+metrics.height/2-height/2) > 1) failures.push('Board off center');
      if (baseline) {
        if (metrics.panels.some((p,i) => p.some((v,j) => Math.abs(v-baseline.panels[i][j]) > .001))) failures.push('Panel layout shifted');
        if (JSON.stringify(metrics.fonts) !== JSON.stringify(baseline.fonts)) failures.push('Typography reflowed');
      } else baseline = metrics;
      if (failures.length) throw new Error(`${board.id} at ${width}x${height}: ${failures.join(', ')} ${JSON.stringify(metrics)}`);
      if (board.id.includes('about') && width === 390 || board.id.includes('about') && width === 1800) {
        await page.screenshot({ path: `output/playwright/scaling-${board.id}-${width}.png` });
      }
      results.push({ board: board.id, width, height });
    }
    const after = await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('project-lantern-state-v1')).boardPrograms));
    if (saved !== after) throw new Error('Presentation changed saved boards');
  }
  // A sideways-mounted screen swaps the available axes before the board is fitted.
  for (const mount of ['clockwise', 'counterclockwise']) {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(`${origin}/#/display/display-1?mount=${mount}`);
    await page.reload();
    await page.locator('.presentation-canvas').waitFor();
    const rect = await page.locator('.presentation-canvas').boundingBox();
    if (!rect || rect.x < -1 || rect.y < -1 || rect.x+rect.width > 1367 || rect.y+rect.height > 769) throw new Error(`Mounted board clipped: ${mount}`);
  }
  return { passed: results.length, boards: boards.length, sizes, mountedChecks: 2, savedBoardsUnchanged: true };
  } finally {
    // Failed checks must not leave the user's preview at a simulated 4K size.
    await page.setViewportSize(previousViewport);
  }
}
