// test-video-file-access.js - 동영상 파일 직접 접근 테스트
const http = require('http');

function testVideoFileAccess() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/uploads/asset-0df5cc01-09ee-4b9e-a725-d362a7b48dc1/index.mp4',
    method: 'HEAD', // HEAD 요청으로 파일 존재 확인
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📊 동영상 파일 접근 테스트:`);
    console.log(`   상태 코드: ${res.statusCode}`);
    console.log(`   Content-Type: ${res.headers['content-type']}`);
    console.log(`   Content-Length: ${res.headers['content-length']} bytes`);
    
    if (res.statusCode === 200) {
      const sizeInMB = (parseInt(res.headers['content-length'] || '0') / (1024 * 1024)).toFixed(2);
      console.log(`   파일 크기: ${sizeInMB} MB`);
      console.log(`\n✅ 동영상 파일에 접근 가능합니다!`);
      console.log(`\n🎬 브라우저에서 직접 재생 테스트:`);
      console.log(`   http://localhost:3001/uploads/asset-0df5cc01-09ee-4b9e-a725-d362a7b48dc1/index.mp4`);
    } else if (res.statusCode === 404) {
      console.log(`\n❌ 파일을 찾을 수 없습니다 (404)`);
    } else {
      console.log(`\n⚠️  예상치 못한 상태 코드: ${res.statusCode}`);
    }
  });

  req.on('error', (e) => {
    console.error(`❌ 요청 실패: ${e.message}`);
  });

  req.end();
}

console.log('🔍 동영상 파일 직접 접근 테스트...\n');
testVideoFileAccess();
