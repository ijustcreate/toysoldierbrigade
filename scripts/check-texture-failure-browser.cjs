async(page)=>{
 await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:5200/')||/^(data|blob):/.test(r.request().url())?r.continue():r.abort());
 await page.routeWebSocket(/wss:\/\//,s=>s.close());
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.__textureFailures=0;
  for(const Type of [window.WebGLRenderingContext,window.WebGL2RenderingContext]){
   if(!Type)continue;
   const original=Type.prototype.texImage2D;
   Type.prototype.texImage2D=function(...args){
    if(args.some(a=>a instanceof HTMLCanvasElement || typeof OffscreenCanvas !== 'undefined' && a instanceof OffscreenCanvas)){
     window.__textureFailures++;
     throw new DOMException("Failed to execute 'texImage2D': Tainted canvases may not be loaded.",'SecurityError');
    }
    return original.apply(this,args);
   };
  }
 });
 await page.goto('http://127.0.0.1:5200/#/dashboard');
 await page.getByRole('button',{name:'Announcements',exact:true}).waitFor();
 await page.getByRole('button',{name:'2D',exact:true}).first().click();
 await page.waitForFunction(()=>window.__textureFailures>0 && [...document.querySelectorAll('canvas.wall-canvas')].some(c=>c.getContext('2d')),null,{timeout:15000});
 const before=await page.evaluate(async()=>{const {loadLanternState}=await import('/src/host/lanternHost.ts');return JSON.stringify(loadLanternState().boardPrograms);});
 await page.getByRole('button',{name:'Announcements',exact:true}).click();
 const nav=page.getByRole('navigation',{name:'Announcement tools'});
 await nav.getByRole('button',{name:/^Blips/}).click();
 await page.locator('.blip-preview-frame canvas.wall-canvas').waitFor();
 await page.goto('http://127.0.0.1:5200/#/live');
 await page.waitForFunction(()=>window.__textureFailures>0 && [...document.querySelectorAll('canvas.wall-canvas')].some(c=>c.getContext('2d')),null,{timeout:15000});
 const after=await page.evaluate(async()=>{const {loadLanternState}=await import('/src/host/lanternHost.ts');return JSON.stringify(loadLanternState().boardPrograms);});
 if(before!==after)throw Error('Board content changed');
 if(errors.length)throw Error(errors.join('\n'));
 await page.screenshot({path:'output/playwright/texture-fallback.png',fullPage:true});
 return {textureFailures:await page.evaluate(()=>window.__textureFailures),pageErrors:errors,boards:'unchanged',live:'Canvas 2D recovered'};
}
