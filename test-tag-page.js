// test-tag-page.js - 태그 페이지 테스트
const http = require('http');

function testTagPage() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/tag/blog',
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
      const hasTag = data.includes('#blog') || data.includes('blog');
      const hasNeuroIQ = data.includes('NeuroIQ') || data.includes('neuroiq');
      
      console.log(`\n📊 태그 페이지 분석:`);
      console.log(`- 콘텐츠 제목 "뇌파1" 포함: ${hasContent ? '✅' : '❌'}`);
      console.log(`- 태그 "blog" 포함: ${hasTag ? '✅' : '❌'}`);
      console.log(`- NeuroIQ 관련 내용: ${hasNeuroIQ ? '✅' : '❌'}`);
      
      // 콘텐츠 카운트 확인
      const countMatch = data.match(/(\d+)개의 콘텐츠/);
      if (countMatch) {
        console.log(`- 콘텐츠 개수: ${countMatch[1]}개`);
      }
      
      if (hasContent && hasTag) {
        console.log(`\n✅ 성공! 태그 페이지에 콘텐츠가 표시되고 있습니다.`);
        console.log(`\n🌐 브라우저에서 확인: http://localhost:3001/tag/blog`);
      } else {
        console.log(`\n❌ 문제 발견: 콘텐츠가 태그 페이지에 표시되지 않습니다.`);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ 요청 실패: ${e.message}`);
  });

  req.end();
}

console.log('🔍 태그 페이지 테스트 시작...\n');
testTagPage();
