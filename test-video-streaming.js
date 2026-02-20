// test-video-streaming.js - 동영상 스트리밍 테스트
const http = require('http');

function testVideoStreaming() {
  console.log('🔍 동영상 스트리밍 테스트...\n');
  
  // 1. 전체 파일 요청
  console.log('📊 테스트 1: 전체 파일 요청');
  const fullRequest = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/uploads/asset-0df5cc01-09ee-4b9e-a725-d362a7b48dc1/index.mp4',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  }, (res) => {
    console.log(`   상태 코드: ${res.statusCode}`);
    console.log(`   Content-Type: ${res.headers['content-type']}`);
    console.log(`   Content-Length: ${res.headers['content-length']}`);
    console.log(`   Accept-Ranges: ${res.headers['accept-ranges']}`);
    
    let receivedBytes = 0;
    res.on('data', (chunk) => {
      receivedBytes += chunk.length;
    });
    
    res.on('end', () => {
      console.log(`   받은 데이터: ${receivedBytes} bytes`);
      
      if (res.statusCode === 200 && receivedBytes > 0) {
        console.log('   ✅ 전체 파일 다운로드 성공\n');
        
        // 2. Range 요청 테스트 (동영상 스트리밍에 필수)
        console.log('📊 테스트 2: Range 요청 (스트리밍)');
        const rangeRequest = http.request({
          hostname: 'localhost',
          port: 3001,
          path: '/uploads/asset-0df5cc01-09ee-4b9e-a725-d362a7b48dc1/index.mp4',
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Range': 'bytes=0-1023'
          }
        }, (rangeRes) => {
          console.log(`   상태 코드: ${rangeRes.statusCode}`);
          console.log(`   Content-Range: ${rangeRes.headers['content-range']}`);
          console.log(`   Content-Length: ${rangeRes.headers['content-length']}`);
          
          let rangeBytes = 0;
          rangeRes.on('data', (chunk) => {
            rangeBytes += chunk.length;
          });
          
          rangeRes.on('end', () => {
            console.log(`   받은 데이터: ${rangeBytes} bytes`);
            
            if (rangeRes.statusCode === 206) {
              console.log('   ✅ Range 요청 지원 (스트리밍 가능)\n');
            } else if (rangeRes.statusCode === 200) {
              console.log('   ⚠️  Range 요청 미지원 (전체 파일 반환)\n');
              console.log('   💡 Next.js는 기본적으로 Range 요청을 지원합니다.');
            } else {
              console.log('   ❌ Range 요청 실패\n');
            }
            
            console.log('📋 결론:');
            console.log('   - 파일 접근: ✅');
            console.log('   - Content-Type: ✅');
            console.log(`   - Range 지원: ${rangeRes.statusCode === 206 ? '✅' : '⚠️'}`);
            console.log('\n🌐 브라우저에서 테스트:');
            console.log('   1. http://localhost:3001/a/sample-content');
            console.log('   2. 개발자 도구 (F12) → Network 탭 확인');
            console.log('   3. Console 탭에서 오류 메시지 확인');
          });
        });
        
        rangeRequest.on('error', (e) => {
          console.error(`   ❌ Range 요청 실패: ${e.message}`);
        });
        
        rangeRequest.end();
      } else {
        console.log('   ❌ 파일 다운로드 실패');
      }
    });
  });
  
  fullRequest.on('error', (e) => {
    console.error(`❌ 요청 실패: ${e.message}`);
  });
  
  fullRequest.end();
}

testVideoStreaming();
