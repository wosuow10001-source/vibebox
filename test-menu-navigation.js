// test-menu-navigation.js - 메뉴 네비게이션 테스트
const http = require('http');

function testPage(path, pageName) {
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
        const hasContent = data.includes('뇌파1');
        const hasMenu = data.includes('블로그');
        const hasTag = data.includes('#blog') || data.includes('blog');
        const contentCount = (data.match(/개의 콘텐츠/g) || []).length;
        
        resolve({
          path,
          pageName,
          statusCode: res.statusCode,
          hasContent,
          hasMenu,
          hasTag,
          contentCount
        });
      });
    });

    req.on('error', (e) => {
      resolve({
        path,
        pageName,
        error: e.message
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔍 메뉴 네비게이션 테스트 시작...\n');
  
  const tests = [
    { path: '/', name: '메인 페이지' },
    { path: '/tag/blog', name: '블로그 메뉴 (태그 페이지)' },
    { path: '/tag/portfolio', name: '포트폴리오 메뉴 (태그 페이지)' }
  ];
  
  for (const test of tests) {
    const result = await testPage(test.path, test.name);
    
    console.log(`\n📄 ${result.pageName} (${result.path})`);
    console.log(`   상태: ${result.statusCode === 200 ? '✅' : '❌'} ${result.statusCode}`);
    
    if (result.error) {
      console.log(`   ❌ 오류: ${result.error}`);
    } else {
      console.log(`   메뉴 표시: ${result.hasMenu ? '✅' : '❌'}`);
      console.log(`   콘텐츠 "뇌파1": ${result.hasContent ? '✅' : '❌'}`);
      console.log(`   태그 표시: ${result.hasTag ? '✅' : '❌'}`);
      
      if (result.path.includes('/tag/')) {
        if (result.hasContent) {
          console.log(`   ✅ 이 메뉴에 콘텐츠가 표시됩니다!`);
        } else {
          console.log(`   ⚠️  이 메뉴에 콘텐츠가 없습니다.`);
        }
      }
    }
  }
  
  console.log('\n\n📊 요약:');
  console.log('- 메인 페이지: http://localhost:3001');
  console.log('- 블로그 메뉴: http://localhost:3001/tag/blog');
  console.log('- 포트폴리오 메뉴: http://localhost:3001/tag/portfolio');
  console.log('\n💡 브라우저에서 헤더의 "블로그" 메뉴를 클릭하면 /tag/blog로 이동합니다.');
}

runTests();
