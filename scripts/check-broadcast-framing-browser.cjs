/** Run via playwright-cli run-code against an isolated local Vite server. */
async (page) => {
 await page.route('**/*', route => route.request().url().startsWith('http://127.0.0.1:5200/') || /^(data|blob):/.test(route.request().url()) ? route.continue() : route.abort());
 await page.routeWebSocket(/wss:\/\//, socket => socket.close());
 await page.goto('http://127.0.0.1:5200/#/live');
 await page.getByRole('tab',{name:'Frame & crop',exact:true}).click();


 const errors=[];page.on('pageerror', e=>errors.push(e.message));
 const before=await page.evaluate(async()=>{ const {loadLanternState}=await import('/src/host/lanternHost.ts'); return JSON.stringify(loadLanternState().boardPrograms); });
 const display=page.getByRole('combobox',{name:'Display to frame',exact:true});
 const camera=page.getByRole('combobox',{name:'Camera source orientation',exact:true});
 const left=page.getByRole('slider',{name:/^Left Video position/});
 const results=[];
 for(const [screen,source,x] of [['display-1','Landscape',7],['display-2','Landscape',9],['display-1','Portrait',11],['display-2','Portrait',13]]){
   await display.selectOption(screen);await camera.selectOption(source);await left.focus();await left.press('Home');
   for(let i=0;i<x;i++)await left.press('ArrowRight');
   if(Number(await left.inputValue())!==x)throw Error('Slider edit failed '+screen+source);
   results.push({screen,source,x});
 }
 for(const r of results){ await display.selectOption(r.screen);await camera.selectOption(r.source);if(Number(await left.inputValue())!==r.x)throw Error('Profile reverted '+JSON.stringify(r)); }
 await page.getByRole('tab',{name:'Source',exact:true}).click();await page.getByRole('tab',{name:'Frame & crop',exact:true}).click();
 if(Number(await left.inputValue())!==13)throw Error('Tab switch reverted frame');
 const frame=page.locator('.persistent-live-preview .direct-live-frame');
 const box=await frame.boundingBox();if(!box)throw Error('No frame');
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2-12,box.y+box.height/2,{steps:8});await page.mouse.up();
 const moved=Number(await left.inputValue());if(moved===13)throw Error('Drag did not commit');
 await page.reload();await page.getByRole('tab',{name:'Frame & crop',exact:true}).click();await display.selectOption('display-2');
 if(Math.abs(Number(await left.inputValue())-moved)>.01)throw Error('Reload reverted drag');
 const after=await page.evaluate(async()=>{const {loadLanternState}=await import('/src/host/lanternHost.ts');return JSON.stringify(loadLanternState().boardPrograms);});
 if(before!==after)throw Error('Board data changed');if(errors.length)throw Error(errors.join('\n'));
 await page.screenshot({path:'output/playwright/broadcast-framing.png',fullPage:true});
 return {profiles:results,dragX:moved,reload:'preserved',boards:'unchanged',pageErrors:errors};
}

