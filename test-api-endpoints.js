// test-api-endpoints.js - API 엔드포인트 테스트
const http = require('http');

function testEndpoint(path, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          path,
          method,
          statusCode: res.statusCode,
          success: res.statusCode < 400
        });
      });
    });

    req.on('error', (e) => {
      resolve({
        path,
        method,
        error: e.message
      });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🔍 API 엔드포인트 테스트\n');
  
  const tests = [
    { path: '/api/admin/content', method: 'GET', name: '콘텐츠 목록' },
    { path: '/api/admin/assets/presign', method: 'POST', name: 'Presign URL', body: {
      fileName: 'test.mp4',
      mimeType: 'video/mp4',
      fileSize: 1000000,
      category: 'video'
    }},
    { path: '/api/admin/site-settings', method: 'GET', name: '사이트 설정' },
  ];
  
  for (const test of tests) {
    const result = await testEndpoint(test.path, test.method, test.body);
    
    console.log(`📌 ${test.name} (${test.method} ${test.path})`);
    if (result.error) {
      console.log(`   ❌ 오류: ${result.error}`);
    } else {
      console.log(`   상태: ${result.statusCode} ${result.success ? '✅' : '❌'}`);
    }
  }
  
  console.log('\n📋 결론:');
  console.log('   - 모든 API가 200-299 상태 코드를 반환하면 정상');
  console.log('   - 404가 나오면 서버 재시작 필요');
  console.log('   - 500이 나오면 서버 로그 확인 필요');
}

runTests();
