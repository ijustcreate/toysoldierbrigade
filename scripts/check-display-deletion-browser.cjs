/** Run through Playwright CLI on an isolated localhost browser only. */
async page => {
  const origin = 'http://127.0.0.1:5198';
  await page.route('**/*', route => route.request().url().startsWith(`${origin}/`) ? route.continue() : route.abort());
  await page.routeWebSocket('**/*', socket => socket.close());
  await page.goto(origin);
  await page.evaluate(async () => {
    const { initialState } = await import('/src/sampleData.ts');
    const { normalizeState } = await import('/src/host/lanternHost.ts');
    const state = structuredClone(initialState);
    state.screens = Object.fromEntries(['Original', 'Copy to delete', 'Keep me'].map((label, i) => {
      const id = `display-${i+1}`;
      return [id, { ...state.screens['display-1'], id, label, particleAnimationEnabled: true }];
    }));
    state.schedules = ['display-1', 'display-2', 'display-3', 'all'].map((target, i) => ({
      id: `synthetic-schedule-${i}`, name: `Synthetic schedule ${i}`, target, boardId: state.boardPrograms[0].id,
      contentType: 'board', days: [0,1,2,3,4,5,6], startTime: '00:00', endTime: '00:01', active: false
    }));
    state.boardOpenOwners = {};
    state.live.active = state.announcement.active = state.activeBlip.active = false;
    localStorage.setItem('project-lantern-state-v1', JSON.stringify(normalizeState(state)));
    localStorage.setItem('project-lantern-demo-data-version', '8');
  });
  await page.reload();
  const read = () => page.evaluate(() => JSON.parse(localStorage.getItem('project-lantern-state-v1')));
  const before = await read();
  await page.getByRole('button', { name: 'Edit Copy to delete', exact: true }).click();
  const drawer = page.locator('.screen-editor-drawer');
  await drawer.getByRole('button', { name: 'Delete display', exact: true }).click();
  const dialog = page.getByRole('alertdialog');
  if (!(await dialog.innerText()).includes('Copy to delete')) throw new Error('Confirmation must name the selected display');
  if (Object.keys((await read()).screens).length !== 3) throw new Error('Opening confirmation deleted a display');
  await dialog.screenshot({ path: 'output/playwright/delete-display-confirmation.png' });
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  if (JSON.stringify((await read()).screens) !== JSON.stringify(before.screens)) throw new Error('Cancel changed settings');
  await drawer.getByRole('button', { name: 'Delete display', exact: true }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete display', exact: true }).click();
  await page.getByRole('button', { name: 'Edit Copy to delete', exact: true }).waitFor({ state: 'detached' });
  await page.reload();
  await page.getByRole('button', { name: 'Edit Keep me', exact: true }).waitFor();
  const after = await read();
  if (Object.keys(after.screens).join(',') !== 'display-1,display-3') throw new Error('Wrong displays remain after reload');
  for (const key of ['boardPrograms', 'donors']) if (JSON.stringify(after[key]) !== JSON.stringify(before[key])) throw new Error(`${key} changed`);
  if (after.schedules.some(e => e.target === 'display-2') || after.schedules.length !== 3) throw new Error('Wrong schedule cleanup');
  if (JSON.stringify(after.screens['display-3']) !== JSON.stringify(before.screens['display-3'])) throw new Error('Other display settings changed');
  // The dashboard trash button uses the same confirmation and supports Escape.
  const originalCard = page.locator('.dashboard-display-tile').filter({ has: page.getByRole('button', { name: 'Edit Original', exact: true }) });
  await originalCard.getByRole('button', { name: 'Delete display', exact: true }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel', exact: true }).press('Escape');
  if (Object.keys((await read()).screens).length !== 2) throw new Error('Escape deleted a display');
  await originalCard.getByRole('button', { name: 'Delete display', exact: true }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete display', exact: true }).click();
  await page.getByRole('button', { name: 'Edit Original', exact: true }).waitFor({ state: 'detached' });
  await page.reload();
  await page.getByRole('button', { name: 'Edit Keep me', exact: true }).click();
  if (Object.keys((await read()).screens).join(',') !== 'display-3') throw new Error('Deleted default displays returned');
  if (await page.locator('.screen-editor-drawer').getByRole('button', { name: 'Delete display', exact: true }).isEnabled()) throw new Error('Last display must be protected');
  return { cancel: 'passed', confirm: 'passed', dashboardEscape: 'passed', persistence: 'passed', savedDesignsAndDonors: 'unchanged', lastDisplay: 'protected' };
}
