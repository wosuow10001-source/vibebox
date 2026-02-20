// check-satan-video.js - satan 동영상 상세 확인
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 Satan 동영상 상세 확인\n');

// 1. 파일 시스템에서 확인
console.log('📁 파일 시스템 확인:');
const videoPath = 'public/uploads/asset-0df5cc01-09ee-4b9e-a725-d362a7b48dc1/index.mp4';
try {
  const stats = fs.statSync(videoPath);
  const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`   파일 경로: ${videoPath}`);
  console.log(`   파일 크기: ${stats.size} bytes (${sizeInMB} MB)`);
  console.log(`   수정 시간: ${stats.mtime}`);
  
  if (stats.size === 10485760) {
    console.log(`   ⚠️  정확히 10MB = 2개 청크만 업로드됨`);
    console.log(`   ⚠️  원본 42.1MB가 아님!`);
  } else if (stats.size > 40000000) {
    console.log(`   ✅ 파일 크기가 정상적으로 보입니다`);
  }
} catch (e) {
  console.log(`   ❌ 파일을 찾을 수 없음: ${e.message}`);
}

// 2. contents.json 확인
console.log('\n📄 contents.json 확인:');
try {
  const contentsPath = 'data/contents.json';
  const contents = JSON.parse(fs.readFileSync(contentsPath, 'utf-8'));
  const satanContent = contents.find(c => c.title === 'satan' || c.slug === 'sample-content');
  
  if (satanContent) {
    console.log(`   제목: ${satanContent.title}`);
    console.log(`   슬러그: ${satanContent.slug}`);
    console.log(`   타입: ${satanContent.type}`);
    console.log(`   상태: ${satanContent.status}`);
    console.log(`   Assets: ${JSON.stringify(satanContent.assets)}`);
    console.log(`   썸네일: ${satanContent.coverImage || '없음'}`);
    console.log(`   태그: ${JSON.stringify(satanContent.tags)}`);
  } else {
    console.log(`   ❌ satan 콘텐츠를 찾을 수 없음`);
  }
} catch (e) {
  console.log(`   ❌ contents.json 읽기 실패: ${e.message}`);
}

// 3. 웹 페이지 확인
console.log('\n🌐 웹 페이지 확인:');
const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/a/sample-content',
  method: 'GET',
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const hasVideo = data.includes('<video');
    const hasSource = data.includes('asset-0df5cc01-09ee-4b9e-a725-d362a7b48dc1');
    
    console.log(`   상태 코드: ${res.statusCode}`);
    console.log(`   <video> 태그: ${hasVideo ? '✅' : '❌'}`);
    console.log(`   올바른 asset: ${hasSource ? '✅' : '❌'}`);
    
    console.log('\n📋 결론:');
    console.log('   1. 파일이 10MB로 잘려있음 (원본 42.1MB)');
    console.log('   2. 업로드 중 중단되었을 가능성');
    console.log('   3. 해결: 콘텐츠 삭제 후 재업로드 필요');
    console.log('\n💡 재업로드 방법:');
    console.log('   1. http://localhost:3001/admin/content → satan 콘텐츠 삭제');
    console.log('   2. http://localhost:3001/admin/upload-direct → 파일 재업로드');
    console.log('   3. 업로드 완료까지 페이지 닫지 말 것!');
  });
});

req.on('error', (e) => {
  console.error(`   ❌ 요청 실패: ${e.message}`);
});

req.end();
