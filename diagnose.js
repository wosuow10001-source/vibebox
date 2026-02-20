// diagnose.js
const assetId = 'asset-33755eee-54fb-41c4-9a96-77867f0a149c';
const slug = 'neurioq-pro-ultimate-v2.html';

setTimeout(() => {
  fetch(`http://localhost:3000/a/${slug}`)
    .then(r => r.text())
    .then(html => {
      console.log('=== Diagnosis ===');
      
      // 1. Check if page loads
      if(html.includes('찾을 수 없습니다')) {
        console.log('✗ Page not found (404)');
        return;
      }
      if(html.includes('Internal Server Error')) {
        console.log('✗ Internal Server Error (500)');
        return;
      }
      console.log('✓ Page loads OK');
      
      // 2. Check if content title exists
      if(html.includes('뇌파')) {
        console.log('✓ Content title found');
      } else {
        console.log('✗ Content title missing');
      }
      
      // 3. Check if iframe exists
      if(html.includes('<iframe')) {
        console.log('✓ iframe element exists');
        
        // 4. Find iframe src
        const srcMatch = html.match(/src="([^"]*\.html[^"]*)"/);
        if(srcMatch) {
          const src = srcMatch[1];
          console.log('iframe src: ' + src);
          
          // 5. Test if src is accessible
          const testUrl = src.startsWith('/') ? `http://localhost:3000${src}` : src;
          fetch(testUrl)
            .then(r => {
              console.log(`${src} →  HTTP ${r.status}`);
            })
            .catch(e => console.log(`${src} → Error: ${e.message}`));
        } else {
          console.log('✗ Could not find src with .html');
          const anySrc = html.match(/src="([^"]+)"/);
          if(anySrc) {
            console.log('Found src: ' + anySrc[1].substring(0, 80));
          }
        }
      } else {
        console.log('✗ iframe element NOT found');
        if(html.includes('앱 파일을 찾을 수 없습니다')) {
          console.log('  → Reason: contentblock ("앱 파일을 찾을 수 없습니다")');
        }
      }
      
      // 6. Check sandbox attribute
      const sandboxMatch = html.match(/sandbox="([^"]*)"/);
      if(sandboxMatch) {
        const sandbox = sandboxMatch[1];
        console.log(`sandbox: "${sandbox}"`);
        if(sandbox.includes('allow-same-origin')) {
          console.log('✓ allow-same-origin present');
        } else {
          console.log('✗ allow-same-origin MISSING');
        }
      }
    })
    .catch(e => console.log('Fetch error: ' + e.message));
}, 1000);
