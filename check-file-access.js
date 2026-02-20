// check-file-access.js
const assetId = 'asset-33755eee-54fb-41c4-9a96-77867f0a149c';
const fileUrl = `http://localhost:3000/uploads/${assetId}/index.html`;

console.log('Testing file access:');
console.log('URL:', fileUrl);

fetch(fileUrl)
  .then(r => {
    console.log('Status:', r.status);
    console.log('Content-Type:', r.headers.get('content-type'));
    if(r.status === 200) {
      console.log('✓ File accessible');
    } else {
      console.log('✗ File returned ' + r.status);
    }
    return r.text();
  })
  .then(txt => {
    console.log('Content length:', txt.length);
    console.log('First 100 chars:', txt.substring(0, 100));
  })
  .catch(e => {
    console.log('✗ Error:', e.message);
  });
