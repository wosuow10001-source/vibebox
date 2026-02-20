// e2e-test-simple.js
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const presignBody = JSON.stringify({
      fileName: 'test-app.html',
      mimeType: 'text/html',
      fileSize: 1024,
    });

    console.log('1️⃣ Requesting presign...');
    const presignRes = await fetch('http://localhost:3000/api/admin/assets/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: presignBody,
    });
    const presign = await presignRes.json();
    console.log('✅ Presign response:', {
      uploadUrl: presign.uploadUrl?.substring(0, 80),
      assetId: presign.assetId,
      storageKey: presign.storageKey,
    });

    if (!presign.uploadUrl) {
      console.log('❌ No uploadUrl in presign response');
      process.exit(1);
    }

    console.log('\n2️⃣ Uploading file...');
    const html = fs.readFileSync('test-app.html', 'utf8');
    const uploadRes = await fetch(presign.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/html' },
      body: html,
    });
    console.log('Upload status:', uploadRes.status);
    const uploadData = await uploadRes.json();
    console.log('✅ Upload response:', uploadData);

    const assetId = presign.assetId;
    const expectedPath = path.join(process.cwd(), 'public', 'uploads', String(assetId), 'index.html');
    console.log('\n3️⃣ Checking file on disk...');
    console.log('Expected path:', expectedPath);
    const exists = fs.existsSync(expectedPath);
    console.log(exists ? '✅ File exists' : '❌ File NOT found');

    console.log('\n4️⃣ Creating content...');
    const contentRes = await fetch('http://localhost:3000/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test App Simple',
        slug: 'test-app-simple',
        status: 'PUBLISHED',
        tags: [],
        assetIds: [assetId],
      }),
    });
    const content = await contentRes.json();
    console.log('✅ Content created:', { id: content.id, title: content.title, assets: content.assets?.length });

    console.log('\n5️⃣ Checking API list...');
    const listRes = await fetch('http://localhost:3000/api/admin/content');
    const list = await listRes.json();
    const found = list.contents.find((c) => c.id === content.id);
    console.log(found ? '✅ Content found in list' : '❌ Content NOT in list');

    console.log('\n6️⃣ Testing detail page...');
    const pageRes = await fetch('http://localhost:3000/a/test-app-simple');
    console.log('Detail page status:', pageRes.status);
    const html2 = await pageRes.text();
    if (html2.includes('찾을 수 없습니다')) {
      console.log('❌ 404 page not found');
    } else if (html2.includes('Test App Simple')) {
      console.log('✅ Detail page renders');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

run();
