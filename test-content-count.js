// test-content-count.js - 각 페이지의 콘텐츠 개수 확인
const http = require('http');

function testPage(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // "X개의 콘텐츠" 패턴 찾기
        const countMatch = data.match(/(\d+)개의 콘텐츠/);
        const count = countMatch ? parseInt(countMatch[1]) : null;
        
        // 실제 콘텐츠 카드 개수 세기 (더 정확한 방법)
        const cardMatches = data.match(/class="[^"]*group block bg-white rounded-lg/g);
        const actualCards = cardMatches ? cardMatches.length : 0;
        
        // 특정 콘텐츠 확인
        const has뇌파1 = data.includes('뇌파1');
        const hasNeuroIQ = data.includes('NeuroIQ') || data.includes('neuroiq');
        
        resolve({
          path,
          statusCode: res.statusCode,
          displayedCount: count,
          actualCards,
          has뇌파1,
          hasNeuroIQ
        });
      });
    });

    req.on('error', (e) => {
      resolve({
        path,
        error: e.message
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔍 각 페이지의 콘텐츠 개수 확인...\n');
  
  const pages = [
    { path: '/', name: '메인 페이지' },
    { path: '/tag/blog', name: '블로그 메뉴' },
    { path: '/tag/portfolio', name: '포트폴리오 메뉴' }
  ];
  
  for (const page of pages) {
    const result = await testPage(page.path);
    
    console.log(`\n📄 ${page.name} (${page.path})`);
    
    if (result.error) {
      console.log(`   ❌ 오류: ${result.error}`);
    } else {
      console.log(`   상태: ${result.statusCode === 200 ? '✅' : '❌'} ${result.statusCode}`);
      console.log(`   표시된 개수: ${result.displayedCount !== null ? result.displayedCount + '개' : '정보 없음'}`);
      console.log(`   실제 카드 수: ${result.actualCards}개`);
      console.log(`   "뇌파1" 포함: ${result.has뇌파1 ? '✅' : '❌'}`);
      console.log(`   NeuroIQ 포함: ${result.hasNeuroIQ ? '✅' : '❌'}`);
      
      if (result.displayedCount === 0) {
        console.log(`   ⚠️  이 메뉴에는 콘텐츠가 없습니다.`);
      } else if (result.displayedCount > 0) {
        console.log(`   ✅ 이 메뉴에 ${result.displayedCount}개의 콘텐츠가 있습니다!`);
      }
    }
  }
  
  console.log('\n\n📊 결론:');
  console.log('브라우저에서 확인하세요:');
  console.log('- 메인: http://localhost:3001');
  console.log('- 블로그: http://localhost:3001/tag/blog (콘텐츠 있음)');
  console.log('- 포트폴리오: http://localhost:3001/tag/portfolio (콘텐츠 없음)');
}

runTests();
