// scripts/e2e-upload.js
// Simple E2E: request presign, PUT index.html, verify file, create content
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const presignRes = await fetch('http://localhost:3000/api/admin/assets/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'index.html', mimeType: 'text/html', fileSize: 1024 }),
    });
    const presign = await presignRes.json();
    console.log('presign:', presign);
    if (!presign.uploadUrl) throw new Error('no uploadUrl in presign response');

    const html = '<!doctype html><html><head><meta charset="utf-8"><title>Test App</title></head><body><h1>Uploaded App</h1></body></html>';

    const uploadRes = await fetch(presign.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/html', 'Content-Length': String(Buffer.byteLength(html)) },
      body: html,
    });
    const uploadText = await uploadRes.text();
    console.log('upload status', uploadRes.status, uploadText);

    const assetId = presign.assetId;
    const expected = path.join(process.cwd(), 'public', 'uploads', String(assetId), 'index.html');
    console.log('expected file:', expected);
    const exists = fs.existsSync(expected);
    console.log('file exists:', exists);
    if (exists) console.log('file head:\n', fs.readFileSync(expected, 'utf8').slice(0, 200));

    // create content linking asset
    const createRes = await fetch('http://localhost:3000/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'E2E Test', slug: 'e2e-test', status: 'PUBLISHED', tags: [], assetIds: [assetId] }),
    });
    const created = await createRes.json();
    console.log('created content:', created);
    process.exit(0);
  } catch (err) {
    console.error('E2E error:', err);
    process.exit(2);
  }
}

run();
