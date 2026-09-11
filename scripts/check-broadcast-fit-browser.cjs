/** Run with playwright-cli run-code --filename=... against the isolated Vite fixture. */
async (page) => {
  const origin = 'http://127.0.0.1:5200';
  await page.route('**/*', route => {
    const url = route.request().url();
    if (url === `${origin}/broadcast-fit-fixture`) return route.fulfill({ contentType: 'text/html', body: '<html><body><div id="fixture"></div></body></html>' });
    return url.startsWith(`${origin}/`) || /^(data|blob):/.test(url) ? route.continue() : route.abort();
  });
  await page.goto(`${origin}/broadcast-fit-fixture`);
  const results = await page.evaluate(async () => {
    // Load Vite's React preamble before importing the real component.
    const refresh = await import('/@react-refresh');
    refresh.default.injectIntoGlobalHook(window);
    window.$RefreshReg$ = () => {};
    window.$RefreshSig$ = () => type => type;
    window.__vite_plugin_react_preamble_installed__ = true;
    const React = (await import('/node_modules/.vite/deps/react.js')).default;
    const { createRoot } = (await import('/node_modules/.vite/deps/react-dom_client.js')).default;
    const { ChromaVideo } = await import('/src/components/ChromaVideo.tsx');
    const { initialState } = await import('/src/sampleData.ts');
    await import('/src/styles.css');
    const root = createRoot(document.getElementById('fixture'));
    const results = [];
    const source = document.createElement('canvas');
    const stream = source.captureStream(30);
    const paint = () => {
      const ctx = source.getContext('2d');
      ctx.fillStyle = '#15364a'; ctx.fillRect(0, 0, source.width, source.height);
      ctx.fillStyle = '#ff0000'; ctx.fillRect(0, 0, source.width, source.height * .1);
      ctx.fillStyle = '#0000ff'; ctx.fillRect(0, source.height * .9, source.width, source.height * .1);
    };
    const timer = setInterval(paint, 33);
    try {
      for (const processed of [false, true]) {
        root.render(React.createElement('div', { className: 'live-camera-transform', style: { inset: '20px', width: '340px', height: '540px', background: '#050d17' } }, React.createElement(ChromaVideo, {
          stream, chromaKey: initialState.live.chromaKey, effects: initialState.live.effects,
          crop: initialState.live.frame.crop, fitMode: initialState.live.frame.fitMode, renderToCanvas: processed
        })));
        for (const [width, height] of [[1080, 1920], [1920, 1080], [1024, 768], [1080, 1080]]) {
          source.width = width; source.height = height; paint();
          const deadline = performance.now() + 8000;
          let surface;
          while (performance.now() < deadline) {
            await new Promise(resolve => setTimeout(resolve, 50));
            const video = document.querySelector('video');
            surface = document.querySelector(processed ? 'canvas.chroma-video' : 'video.chroma-video');
            if (surface && video.videoWidth === width && video.videoHeight === height && (!processed || Math.abs(surface.width / surface.height - width / height) < .01)) break;
          }
          const video = document.querySelector('video');
          if (!surface || video.videoWidth !== width || video.videoHeight !== height || (processed && Math.abs(surface.width / surface.height - width / height) >= .01)) throw new Error('Source geometry did not settle');
          const style = getComputedStyle(surface);
          if (style.objectFit !== 'contain' || style.transform !== 'matrix(1, 0, 0, 1, 0, 0)') throw new Error(`Default framing clips: ${style.objectFit} ${style.transform}`);
          if (processed) {
            if (surface.width * surface.height > 640 * 360) throw new Error('Pixel budget exceeded');
            const ctx = surface.getContext('2d');
            const top = ctx.getImageData(surface.width / 2, 3, 1, 1).data;
            const bottom = ctx.getImageData(surface.width / 2, surface.height - 4, 1, 1).data;
            if (top[0] < 220 || bottom[2] < 220) throw new Error(`Source edges clipped at ${width}x${height}: ${top} / ${bottom}`);
          }
          results.push({ processed, source: `${width}x${height}`, output: processed ? `${surface.width}x${surface.height}` : 'native', fit: style.objectFit });
        }
      }
    } finally {
      clearInterval(timer); stream.getTracks().forEach(track => track.stop()); root.unmount();
    }
    return results;
  });
  return results;
}
