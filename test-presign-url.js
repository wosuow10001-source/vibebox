// test-presign-url.js - Presign URL 테스트
const http = require('http');

function testPresign() {
  const postData = JSON.stringify({
    fileName: 'test-video.mp4',
    mimeType: 'video/mp4',
    fileSize: 42000000,
    category: 'video'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/admin/assets/presign',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Host': 'localhost:3001'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('🔍 Presign API 테스트\n');
      console.log(`상태 코드: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        try {
          const result = JSON.parse(data);
          console.log('\n📤 응답 데이터:');
          console.log(`   uploadUrl: ${result.uploadUrl}`);
          console.log(`   assetId: ${result.assetId}`);
          console.log(`   cdnUrl: ${result.cdnUrl}`);
          
          // URL 검증
          if (result.uploadUrl.includes('localhost:3001')) {
            console.log('\n✅ 올바른 포트 사용 (3001)');
          } else if (result.uploadUrl.includes('localhost:3000')) {
            console.log('\n❌ 잘못된 포트 사용 (3000)');
            console.log('   → 브라우저 강력 새로고침 필요 (Ctrl + Shift + R)');
          } else {
            console.log('\n⚠️  예상치 못한 URL 형식');
          }
        } catch (e) {
          console.log('\n❌ JSON 파싱 실패:', data);
        }
      } else {
        console.log('\n❌ 오류 응답:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ 요청 실패: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

testPresign();
