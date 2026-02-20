const slug = 'NeuroIQ Pro Ultimate v2.html';
const encoded = encodeURIComponent(slug).replace(/%20/g, '-');
console.log('Testing slug:', encoded);

fetch(`http://localhost:3000/a/${encoded}`)
  .then(r => r.text())
  .then(html => {
    console.log('=== Page Check ===');
    console.log('Page length:', html.length);
    console.log('Has "찾을 수 없습니다":', html.includes('찾을 수 없습니다'));
    console.log('Has "Internal Server Error":', html.includes('Internal Server Error'));
    console.log('Has iframe:', html.includes('<iframe'));
    
    // Check slug normalization
    if(html.includes('NeuroIQ')) {
      console.log('✓ Title found in page');
    } else {
      console.log('✗ Title NOT found - page might be 404');
    }
    
    // Find iframe src
    const iframeMatch = html.match(/src="([^"]*index\.html[^"]*)"/);
    if(iframeMatch) {
      console.log('✓ iframe src:', iframeMatch[1]);
    } else {
      console.log('✗ No iframe with index.html src found');
      // Try to find ANY iframe src
      const anySrc = html.match(/src="([^"]+)"/);
      if(anySrc) console.log('  Found other src:', anySrc[1]);
    }
  })
  .catch(e => console.error('Error:', e.message));
