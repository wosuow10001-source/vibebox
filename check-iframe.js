// check-iframe.js
fetch('http://localhost:3000/a/e2e-test')
  .then(r => r.text())
  .then(html => {
    const iframeMatch = html.match(/src="([^"]*)"/);
    console.log('iframe src:', iframeMatch?.[1]);
    const sandboxMatch = html.match(/sandbox="([^"]*)"/);
    console.log('sandbox attr:', sandboxMatch?.[1]);
    console.log('has allow-same-origin:', html.includes('allow-same-origin'));
    // Also check if the uploaded file path appears
    console.log('has /uploads/:', html.includes('/uploads/'));
  })
  .catch(e => console.error('fetch error:', e.message));
