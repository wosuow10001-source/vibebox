// test-main-page.js - 메인 페이지 테스트
const http = require('http');

function testMainPage() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/',
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
      // 콘텐츠가 페이지에 있는지 확인
      const hasContent = data.includes('뇌파1');
      const hasNeuroIQ = data.includes('NeuroIQ') || data.includes('neuroiq');
      const hasTag = data.includes('#blog') || data.includes('blog');
      
      console.log(`\n📊 메인 페이지 분석:`);
      console.log(`- 콘텐츠 제목 "뇌파1" 포함: ${hasContent ? '✅' : '❌'}`);
      console.log(`- NeuroIQ 관련 내용: ${hasNeuroIQ ? '✅' : '❌'}`);
      console.log(`- 태그 표시: ${hasTag ? '✅' : '❌'}`);
      
      if (hasContent) {
        console.log(`\n✅ 성공! 메인 페이지에 콘텐츠가 표시되고 있습니다.`);
        console.log(`\n🌐 브라우저에서 확인: http://localhost:3001`);
      } else {
        console.log(`\n❌ 문제 발견: 콘텐츠가 메인 페이지에 표시되지 않습니다.`);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ 요청 실패: ${e.message}`);
  });

  req.end();
}

console.log('🔍 메인 페이지 테스트 시작...\n');
testMainPage();
