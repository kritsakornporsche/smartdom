(async () => {
  try {
    const pages = ['/', '/tenant', '/tenant/billing', '/signin', '/explore'];
    for (const page of pages) {
      console.log(`\n================ Testing ${page} ================`);
      const res = await fetch('http://kritsakorn.thddns.net:5993' + page);
      console.log(`HTTP ${res.status}`);
      const html = await res.text();
      
      const cssMatches = [...html.matchAll(/href="(\/_next\/static\/css\/[^"]+)"/g)].map(m => m[1]);
      const jsMatches = [...html.matchAll(/src="(\/_next\/static\/chunks\/[^"]+)"/g)].map(m => m[1]);
      
      console.log(`Found ${cssMatches.length} CSS files, ${jsMatches.length} JS chunk files`);
      for (const css of cssMatches) {
        const cRes = await fetch('http://kritsakorn.thddns.net:5993' + css);
        const cssContent = await cRes.text();
        console.log(`  CSS ${css} -> HTTP ${cRes.status} (${cRes.headers.get('content-type')}) Size: ${cssContent.length} bytes`);
      }
      for (const js of jsMatches.slice(0, 3)) {
        const jRes = await fetch('http://kritsakorn.thddns.net:5993' + js);
        console.log(`  JS ${js} -> HTTP ${jRes.status} (${jRes.headers.get('content-type')})`);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
})();
