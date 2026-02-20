const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.FALLBACK_PORT || 3002;

const DEMO_SETTINGS = {
  siteTitle: 'Vibebox (Fallback)',
  logoUrl: '',
  donateEnabled: true,
  donateLabel: '후원하기',
  donateUrl: 'https://ko-fi.com/',
  menu: [
    { name: '홈', url: '/' },
    { name: '블로그', url: '/tag/blog' },
  ],
  contents: [],
};

const DEMO_CONTENTS = [
  { id: '1', title: '데모 게시글 1', slug: 'demo-1', excerpt: '데모 콘텐츠입니다.' },
  { id: '2', title: '데모 게시글 2', slug: 'demo-2', excerpt: '두번째 데모입니다.' },
];

function sendJson(res, obj, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

function serveStaticFile(req, res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) return res.writeHead(404).end('Not found');
    const ext = path.extname(filePath).toLowerCase();
    const map = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.html': 'text/html; charset=utf-8',
    };
    res.writeHead(200, { 'Content-Type': map[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    // favicon
    if (url.pathname === '/favicon.ico') {
      const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
      const buf = Buffer.from(pngBase64, 'base64');
      res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': buf.length });
      res.end(buf);
      return;
    }

    // static uploads — serve directly from public/uploads
    if (url.pathname.startsWith('/uploads/')) {
      const p = path.join(process.cwd(), 'public', url.pathname.replace(/^\//, ''));
      return serveStaticFile(req, res, p);
    }

    if (url.pathname === '/api/admin/site-settings') {
      return sendJson(res, { ...DEMO_SETTINGS, contents: DEMO_CONTENTS.map(c => `/uploads/${c.slug}.jpg`) });
    }

    if (url.pathname === '/api/admin/assets/upload' && req.method === 'POST') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', async () => {
        try {
          const json = JSON.parse(body || '{}');
          const { filename, data } = json;
          if (!filename || !data) return sendJson(res, { error: 'invalid' }, 400);
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
          await fs.promises.mkdir(uploadsDir, { recursive: true });
          const matches = String(data).match(/^data:(.+);base64,(.+)$/);
          const base64 = matches ? matches[2] : String(data).replace(/^data:.*;base64,/, '');
          const buffer = Buffer.from(base64, 'base64');
          const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          const fp = path.join(uploadsDir, safeName);
          await fs.promises.writeFile(fp, buffer);
          return sendJson(res, { url: `/uploads/${safeName}` });
        } catch (err) {
          return sendJson(res, { error: String(err) }, 500);
        }
      });
      return;
    }

    if (url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!doctype html><html><head><meta charset="utf-8"><title>Vibebox Fallback</title></head><body><h1>${DEMO_SETTINGS.siteTitle}</h1><p>데모 콘텐츠 목록:</p><ul>${DEMO_CONTENTS.map(c => `<li><strong>${c.title}</strong> - ${c.excerpt}</li>`).join('')}</ul><p><a href="/admin">관리자</a></p></body></html>`);
      return;
    }

    if (url.pathname === '/admin') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!doctype html><html><head><meta charset="utf-8"><title>Vibebox Admin (Fallback)</title></head><body><h1>관리자 - 임시 모드</h1><p>설정: ${JSON.stringify(DEMO_SETTINGS)}</p><form id="uploadForm"><input id="file" type="file"/><button type="button" onclick="upload()">업로드</button></form><div id="res"></div><script>async function upload(){const f=document.getElementById('file').files[0];if(!f) return;const r=new FileReader();r.onload=async ()=>{const data=r.result;const filename=Date.now()+'-'+f.name;const resp=await fetch('/api/admin/assets/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({filename,data})});const j=await resp.json();document.getElementById('res').innerText=JSON.stringify(j);} ;r.readAsDataURL(f);}</script></body></html>`);
      return;
    }

    // Simple test page for uploaded sample content (admin-uploaded video/image)
    if (url.pathname === '/a/sample-content') {
      // asset id for sample content used in local data
      const videoPath = '/uploads/asset-693c90a1-6405-445d-9ad9-3c9b71f1c047/index.mp4';
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!doctype html><html><head><meta charset="utf-8"><title>Sample Content</title></head><body><h1>Sample Content Video</h1><video controls playsinline style="max-width:100%;height:auto;"><source src="${videoPath}" type="video/mp4">Your browser does not support video.</video></body></html>`);
      return;
    }

    // default 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(String(err));
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Fallback server listening on http://localhost:${PORT}`);
});
