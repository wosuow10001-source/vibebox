// test-detail-page.js - 상세 페이지 테스트
const http = require('http');

function testDetailPage() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/a/neuroiq-pro-ultimate-v2',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`✅ 상태 코드: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      // HTML 앱이 로드되는지 확인
      const hasIframe = data.includes('<iframe');
      const hasAssetPath = data.includes('asset-f7389f72-2885-4cbb-a012-913fdf8842ed');
      const hasNeuroIQ = data.includes('NeuroIQ') || data.includes('뇌파');
      
      console.log(`\n📊 상세 페이지 분석:`);
      console.log(`- iframe 태그 포함: ${hasIframe ? '✅' : '❌'}`);
      console.log(`- 올바른 asset 경로: ${hasAssetPath ? '✅' : '❌'}`);
      console.log(`- 콘텐츠 제목 포함: ${hasNeuroIQ ? '✅' : '❌'}`);
      
      if (hasIframe && hasAssetPath) {
        console.log(`\n✅ 성공! HTML 앱이 올바르게 로드됩니다.`);
        console.log(`\n🌐 브라우저에서 확인: http://localhost:3001/a/neuroiq-pro-ultimate-v2`);
      } else {
        console.log(`\n❌ 문제 발견: HTML 앱이 제대로 로드되지 않습니다.`);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ 요청 실패: ${e.message}`);
  });

  req.end();
}

console.log('🔍 상세 페이지 테스트 시작...\n');
testDetailPage();
