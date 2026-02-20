// 영상 표시 테스트 스크립트
const fs = require('fs');
const path = require('path');

console.log('=== 영상 표시 테스트 ===\n');

// 1. contents.json 읽기
const contentsPath = path.join(__dirname, 'data', 'contents.json');
const contents = JSON.parse(fs.readFileSync(contentsPath, 'utf-8'));

console.log(`📄 contents.json에 ${contents.length}개 콘텐츠 있음\n`);

// 2. VIDEO 타입 콘텐츠 찾기
const videos = contents.filter(c => c.type === 'VIDEO');
console.log(`🎬 VIDEO 타입: ${videos.length}개\n`);

videos.forEach((video, idx) => {
  console.log(`--- 영상 ${idx + 1} ---`);
  console.log(`ID: ${video.id}`);
  console.log(`제목: ${video.title}`);
  console.log(`Slug: ${video.slug}`);
  console.log(`Assets: ${JSON.stringify(video.assets)}`);
  
  // 3. 실제 파일 확인
  if (video.assets && video.assets.length > 0) {
    const assetId = video.assets[0];
    const videoPath = path.join(__dirname, 'public', 'uploads', assetId, 'index.mp4');
    
    if (fs.existsSync(videoPath)) {
      const stats = fs.statSync(videoPath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`✅ 파일 존재: ${videoPath}`);
      console.log(`📦 파일 크기: ${sizeMB}MB (${stats.size} bytes)`);
      
      if (stats.size === 10485760) {
        console.log(`⚠️  경고: 정확히 10MB - 파일이 잘렸을 가능성 있음!`);
      }
    } else {
      console.log(`❌ 파일 없음: ${videoPath}`);
    }
  }
  
  console.log(`URL: http://localhost:3000/a/${video.slug}`);
  console.log('');
});

// 4. 메인 페이지 표시 확인
console.log('=== 메인 페이지 표시 확인 ===');
console.log(`총 ${contents.length}개 콘텐츠가 메인 페이지에 표시되어야 함`);
console.log('');

// 5. 중복 slug 확인
const slugs = contents.map(c => c.slug);
const duplicates = slugs.filter((slug, idx) => slugs.indexOf(slug) !== idx);
if (duplicates.length > 0) {
  console.log(`⚠️  중복 slug 발견: ${[...new Set(duplicates)].join(', ')}`);
} else {
  console.log('✅ 중복 slug 없음');
}
