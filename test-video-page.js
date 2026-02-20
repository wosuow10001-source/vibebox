// test-video-page.js - 동영상 페이지 테스트
const http = require('http');

function testVideoPage() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/a/sample-content',
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
      // 동영상 관련 요소 확인
      const hasVideoTag = data.includes('<video');
      const hasControls = data.includes('controls');
      const hasSource = data.includes('<source');
      const hasAssetPath = data.includes('asset-0df5cc01-09ee-4b9e-a725-d362a7b48dc1');
      const hasMp4 = data.includes('.mp4');
      const hasVideoType = data.includes('video/mp4') || data.includes('video/');
      
      console.log(`\n📊 동영상 페이지 분석:`);
      console.log(`- <video> 태그: ${hasVideoTag ? '✅' : '❌'}`);
      console.log(`- controls 속성: ${hasControls ? '✅' : '❌'}`);
      console.log(`- <source> 태그: ${hasSource ? '✅' : '❌'}`);
      console.log(`- 올바른 asset 경로: ${hasAssetPath ? '✅' : '❌'}`);
      console.log(`- .mp4 파일: ${hasMp4 ? '✅' : '❌'}`);
      console.log(`- video MIME type: ${hasVideoType ? '✅' : '❌'}`);
      
      // 실제 video 태그 추출
      const videoMatch = data.match(/<video[^>]*>[\s\S]*?<\/video>/);
      if (videoMatch) {
        console.log(`\n📹 Video 태그 내용:`);
        console.log(videoMatch[0].substring(0, 300) + '...');
      }
      
      if (hasVideoTag && hasControls && hasSource && hasAssetPath) {
        console.log(`\n✅ 성공! 동영상이 올바르게 렌더링됩니다.`);
        console.log(`\n🌐 브라우저에서 확인: http://localhost:3001/a/sample-content`);
        console.log(`\n💡 동영상 파일 직접 접근: http://localhost:3001/uploads/asset-0df5cc01-09ee-4b9e-a725-d362a7b48dc1/index.mp4`);
      } else {
        console.log(`\n❌ 문제 발견: 동영상이 제대로 렌더링되지 않습니다.`);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ 요청 실패: ${e.message}`);
  });

  req.end();
}

console.log('🔍 동영상 페이지 테스트 시작...\n');
testVideoPage();
