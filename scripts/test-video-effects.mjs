import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

async function moduleFrom(file) {
  const source = await readFile(new URL(`../src/${file}.ts`, import.meta.url), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2020 } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
}
const { keyChromaPixels, PersonMaskSmoother } = await moduleFrom('videoMatting');
const { smoothTrackingPoints } = await moduleFrom('trackingRuntime');
const key = { enabled: true, color: '#00ff00', similarity: .15, smoothness: .3, spill: .6 };
const solid = new Uint8ClampedArray([0,255,0,255, 230,150,110,255, 0,0,255,100, 255,0,0,0]);
keyChromaPixels(solid, key);
assert.equal(solid[3], 0, 'keyed green becomes transparent');
assert.deepEqual([...solid.slice(4,8)], [230,150,110,255], 'skin outside key range survives');
assert.equal(solid[11],100,'existing partial alpha is preserved');
assert.equal(solid[15],0,'transparent pixels stay transparent');
for (const dominant of [0,1,2]) {
  let testedEdge = false;
  for (let channel = 60; channel < 240; channel += 5) {
    const pixel = [50,50,50,255]; pixel[dominant] = channel;
    const uncleaned = new Uint8ClampedArray(pixel), cleaned = new Uint8ClampedArray(pixel);
    const color = ['#ff0000','#00ff00','#0000ff'][dominant];
    keyChromaPixels(uncleaned, {...key,color,spill:0});
    keyChromaPixels(cleaned, {...key,color});
    if (uncleaned[3] > 0 && uncleaned[3] < 255) {
      assert.ok(cleaned[dominant] <= uncleaned[dominant], 'despill never adds key color');
      assert.equal(cleaned[(dominant+1)%3],50,'despill does not remove an unrelated channel');
      assert.equal(cleaned[3],uncleaned[3]); testedEdge = true;
    }
  }
  assert.ok(testedEdge, 'exercise translucent key boundary');
}
const mask = new PersonMaskSmoother(3);
const first = mask.update(new Float32Array([0,.5,1]), .5,.2);
assert.deepEqual([first[3],first[7],first[11]],[0,128,255]);
assert.equal(mask.update(new Float32Array([1,.5,0]),.5,.2),first,'mask updates reuse the exact RGBA buffer');
assert.equal(first[3],255,'entering subject catches up without trails');
assert.equal(first[11],0,'departing subject leaves no stale silhouette');
mask.update(new Float32Array([NaN,Infinity,-1]),.5,.2);
assert.ok([...first].every(Number.isFinite));
assert.throws(()=>mask.update(new Float32Array(4),.5,.2));
const previous=[{x:0,y:0,z:0}], next=[{x:.01,y:.01,z:0}];
const fast=smoothTrackingPoints(previous,next,1,33);
const slow=smoothTrackingPoints(previous,next,1,100);
assert.ok(slow[0].x>fast[0].x && slow[0].x<.01,'low inference cadence does not add extra smoothing lag');
assert.deepEqual(previous,[{x:0,y:0,z:0}]);

const originalFetch=globalThis.fetch;
try {
  let requests=0;
  globalThis.fetch=async()=>{requests++; if(requests===1)throw new Error('offline'); return new Response(new Uint8Array([1,2,3]));};
  const vision=await moduleFrom('visionResources');
  assert.equal(await vision.getVisionModelAsset('face'),null);
  assert.deepEqual(await vision.getVisionModelAsset('face'),new Uint8Array([1,2,3]),'failed model preload can recover');
  const a=await vision.visionBaseOptions('face','GPU'),b=await vision.visionBaseOptions('face','CPU');
  assert.notEqual(a.modelAssetBuffer,b.modelAssetBuffer,'each task gets its own model buffer');
  a.modelAssetBuffer[0]=99; assert.equal(b.modelAssetBuffer[0],1);
  assert.equal(requests,2,'successful model downloads are reused');
} finally {globalThis.fetch=originalFetch;}

const size=256*256, confidence=new Float32Array(size).fill(.55), reused=new PersonMaskSmoother(size);
for(let i=0;i<20;i++) reused.update(confidence,.42,.18);
const began=performance.now(); for(let i=0;i<100;i++) reused.update(confidence,.42,.18);
console.log(JSON.stringify({ keyColors:3, retainedAlpha:true, maskBuffersReused:true, resourceRetry:true, smoothingCadence:true, maskUpdateMs:(performance.now()-began)/100 }));
