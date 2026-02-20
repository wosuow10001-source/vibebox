// 중복 콘텐츠 제거 스크립트
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'data', 'contents.json');

try {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const contents = JSON.parse(raw);

  console.log(`📊 총 콘텐츠 수: ${contents.length}`);

  // slug 기준으로 중복 제거 (최신 것만 유지)
  const uniqueContents = [];
  const seenSlugs = new Set();

  // 최신순으로 정렬 (createdAt 기준)
  contents.sort((a, b) => {
    const dateA = new Date(a.createdAt || a.publishedAt || 0);
    const dateB = new Date(b.createdAt || b.publishedAt || 0);
    return dateB - dateA; // 최신이 먼저
  });

  for (const content of contents) {
    const slug = content.slug || content.id;
    
    if (!seenSlugs.has(slug)) {
      uniqueContents.push(content);
      seenSlugs.add(slug);
    } else {
      console.log(`🗑️  중복 제거: ${content.title} (ID: ${content.id})`);
    }
  }

  console.log(`✅ 중복 제거 후: ${uniqueContents.length}개`);
  console.log(`🗑️  제거된 항목: ${contents.length - uniqueContents.length}개`);

  // 백업 생성
  const backupPath = path.join(process.cwd(), 'data', `contents.backup.${Date.now()}.json`);
  fs.writeFileSync(backupPath, raw, 'utf-8');
  console.log(`💾 백업 생성: ${backupPath}`);

  // 중복 제거된 데이터 저장
  fs.writeFileSync(filePath, JSON.stringify(uniqueContents, null, 2), 'utf-8');
  console.log(`✅ 저장 완료: ${filePath}`);

} catch (error) {
  console.error('❌ 오류:', error);
  process.exit(1);
}
