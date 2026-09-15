/** Run with playwright-cli run-code against an isolated Vite server. */
async(page)=>{
 await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:5200/')||/^(data|blob):/.test(r.request().url())?r.continue():r.abort());
 await page.routeWebSocket(/wss:\/\//,s=>s.close());
 await page.goto('http://127.0.0.1:5200/#/dashboard');
 await page.getByRole('button',{name:'Announcements',exact:true}).waitFor();
 const before=await page.evaluate(async()=>{const {loadLanternState}=await import('/src/host/lanternHost.ts');const s=loadLanternState();return JSON.stringify({boards:s.boardPrograms,announcement:s.announcement,saved:s.savedAnnouncements,blips:s.savedBlips});});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.evaluate(()=>{window.__webglAttempts=0;const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){if(/webgl/.test(kind)){window.__webglAttempts++;return null;}return original.call(this,kind,...args);};});
 const nav=page.getByRole('navigation',{name:'Announcement tools'});
 for(let i=0;i<3;i++){
  await page.getByRole('button',{name:'Announcements',exact:true}).click();
  await nav.getByRole('button',{name:/^Messages/}).click();
  await page.locator('.announcement-monitor canvas.wall-canvas').waitFor();
  await nav.getByRole('button',{name:/^Blips/}).click();
  await page.locator('.blip-preview-frame canvas.wall-canvas').waitFor();
  await page.getByRole('button',{name:'Settings',exact:true}).click();
 }
 if(await page.evaluate(()=>window.__webglAttempts)!==0)throw Error('Default previews still allocate WebGL');
 await page.getByRole('button',{name:'Announcements',exact:true}).click();await nav.getByRole('button',{name:/^Messages/}).click();
 await page.getByRole('button',{name:'3D',exact:true}).click();
 await page.locator('.announcement-monitor.mode-2d').waitFor();
 await nav.getByRole('button',{name:/^Blips/}).click();
 await page.locator('.blip-preview-frame canvas.wall-canvas').waitFor();
 await page.reload();
 await nav.getByRole('button',{name:/^Messages/}).click();
 await page.getByRole('button',{name:'3D',exact:true}).click();
 await page.locator('.announcement-monitor.mode-3d canvas.wall-canvas').waitFor();
 await page.getByRole('button',{name:'2D',exact:true}).click();
 const canvas=page.locator('.announcement-monitor.mode-2d canvas.wall-canvas');
 await canvas.waitFor();
 if(!await canvas.evaluate(c=>Boolean(c.getContext('2d'))))throw Error('2D/3D switch reused an incompatible canvas');
 await nav.getByRole('button',{name:/^Blips/}).click();
 const after=await page.evaluate(async()=>{const {loadLanternState}=await import('/src/host/lanternHost.ts');const s=loadLanternState();return JSON.stringify({boards:s.boardPrograms,announcement:s.announcement,saved:s.savedAnnouncements,blips:s.savedBlips});});
 if(before!==after)throw Error('Saved content changed');if(errors.length)throw Error(errors.join('\n'));
 await page.screenshot({path:'output/playwright/announcements-fixed.png',fullPage:true});
 return {navigationCycles:3,defaultWebGLRequests:0,failed3DFallback:'2D',savedContent:'unchanged',pageErrors:errors};
}
