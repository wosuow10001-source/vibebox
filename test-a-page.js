// test-a-page.js
fetch('http://localhost:3000/a/neurioq-pro-ultimate-v2.html')
  .then(r => {
    console.log('Status:', r.status);
    return r.text();
  })
  .then(html => {
    console.log('Page length:', html.length);
    
    // Check basic content
    if(html.includes('찾을 수 없습니다')) {
      console.log('❌ 404: Content not found');
      return;
    }
    if(html.includes('Internal Server Error')) {
      console.log('❌ 500: Internal Server Error');
      return;
    }
    
    console.log('✓ Page loaded successfully');
    
    // Find iframe
    const iframeMatch = html.match(/<iframe[^>]*src="([^"]*)"[^>]*>/);
    if(iframeMatch) {
      console.log('iframe src:', iframeMatch[1]);
      // Try to fetch it
      fetch(iframeMatch[1])
        .then(r => {
          console.log('iframe target status:', r.status);
          if(r.status === 404) {
            console.log('❌ iframe src returns 404');
          } else if(r.status === 200) {
            console.log('✓ iframe src accessible');
          }
          return r.text();
        })
        .then(content => {
          console.log('iframe content length:', content.length);
        })
        .catch(e => console.log('iframe fetch error:', e.message));
    } else {
      console.log('❌ No iframe found in page');
      // Report what we see
      if(html.includes('HtmlAppViewer')) {
        console.log('  (HtmlAppViewer component exists)');
      }
      if(html.includes('uploads')) {
        console.log('  (uploads path found in page)');
      }
    }
  })
  .catch(e => console.error('fetch error:', e.message));
