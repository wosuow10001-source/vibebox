# 프로젝트 수정 사항 요약

## 발견된 문제점

### 1. 메인 페이지에서 영상이 안 보이는 문제
- **원인**: 
  - `data/contents.json`에 중복된 콘텐츠 항목 (asset-로 시작하는 ID)
  - 콘텐츠 생성 시 `type` 필드가 누락됨
  - 메인 페이지에서 asset- ID를 가진 항목도 표시하려고 시도

### 2. 콘텐츠 타입 정보 누락
- **원인**: 
  - `app/api/admin/content/route.ts`의 DEV 모드에서 콘텐츠 생성 시 `type` 필드를 저장하지 않음
  - 업로드 페이지에서 콘텐츠 생성 페이지로 이동할 때 `type` 파라미터를 전달하지 않음

### 3. 데이터 구조 불일치
- **원인**: 
  - `data/contents.json`에 실제 콘텐츠와 asset 메타데이터가 섞여 있음
  - `description` 필드와 `excerpt` 필드가 혼용됨

## 수정 내용

### 1. 메인 페이지 필터링 개선 (`app/(public)/page.tsx`)
```typescript
// 중복 제거: asset-로 시작하는 ID는 제외 (실제 콘텐츠만 표시)
contents = parsed
  .filter((c) => !c.id.startsWith('asset-'))
  .map((c) => ({ 
    ...c, 
    type: c.type || 'POST',
    description: c.description || c.excerpt || '',
  }));
```

### 2. 콘텐츠 생성 API 수정 (`app/api/admin/content/route.ts`)
```typescript
const newContent = {
  id: String(Date.now()),
  title: body.title || 'Untitled',
  slug: body.slug ? normalizeSlug(body.slug) : normalizeSlug(body.title || ''),
  type: body.type || 'POST',  // ✅ type 필드 추가
  description: body.description || '',
  excerpt: body.excerpt || '',
  content: body.body || '',
  body: body.body || '',
  status: body.status || 'PUBLISHED',
  // ... 나머지 필드
};
```

### 3. 업로드 페이지 수정 (`app/admin/upload/page.tsx`)
```typescript
// type 파라미터 추가
router.push(`/admin/content/new?assetIds=${ids}&assetUrls=${urls}&slug=${encodeURIComponent(autoSlug)}&title=${encodeURIComponent(autoSlug)}&type=${type}`);
```

### 4. 콘텐츠 생성 페이지 수정 (`app/admin/content/new/page.tsx`)
```typescript
// URL에서 type 파라미터 받기
const typeParam = params.get('type');
if (typeParam && CONTENT_TYPES.includes(typeParam)) {
  setFormData((prev) => ({ ...prev, type: typeParam }));
}
```

### 5. SiteRenderer 컴포넌트 수정 (`components/public/SiteRenderer.tsx`)
```typescript
// asset ID 타입 체크 개선
const assetId = typeof content.assets[0] === 'string' ? content.assets[0] : content.assets[0]?.id;
if (assetId) {
  thumbUrl = `/uploads/${assetId}/index.png`;
}
```

### 6. 데이터 파일 정리 (`data/contents.json`)
- asset-로 시작하는 중복 항목 제거
- 모든 콘텐츠에 `type`, `description`, `body` 필드 추가
- 데이터 구조 일관성 확보

### 7. HtmlAppViewer 개선 (`components/public/HtmlAppViewer.tsx`)
- 버튼에 `type="button"` 속성 추가 (폼 제출 방지)

## 테스트 방법

### 1. 영상 업로드 테스트
1. `/admin/upload` 페이지로 이동
2. "영상 업로드" 버튼 클릭
3. MP4, WebM, MOV 등의 영상 파일 선택
4. 업로드 완료 후 자동으로 콘텐츠 생성 페이지로 이동
5. 제목, 설명 등 입력 후 저장
6. 메인 페이지(`/`)에서 영상 카드 확인
7. 영상 카드 클릭하여 상세 페이지(`/a/[slug]`)에서 영상 재생 확인

### 2. 메인 페이지 확인
1. 메인 페이지(`/`)에서 모든 콘텐츠가 표시되는지 확인
2. VIDEO 타입 콘텐츠에 플레이 아이콘이 표시되는지 확인
3. 중복된 항목이 없는지 확인

### 3. 상세 페이지 확인
1. VIDEO 타입: `/a/[slug]`에서 `<video>` 태그로 재생되는지 확인
2. IMAGE 타입: `/a/[slug]`에서 이미지가 표시되는지 확인
3. HTML_APP 타입: `/a/[slug]`에서 iframe으로 렌더링되는지 확인

## 남은 경고 (중요하지 않음)

### CSS 인라인 스타일 경고
- 동적 스타일링이 필요한 부분 (색상, 배경 등)
- 사용자 설정에 따라 변경되는 스타일
- 기능에는 영향 없음

## 파일 구조

```
public/uploads/
  ├── asset-58b598fc-ce03-4517-ad39-46c9f2031312/
  │   └── index.mp4  (영상 파일)
  ├── asset-a4e07009-f6f7-4cb6-bb45-b2041ba31c1b/
  │   └── index.png  (이미지 파일)
  └── asset-02c92b10-59a7-4867-baa4-fa53bd770c4c/
      └── index.html (HTML 앱)

data/
  └── contents.json  (콘텐츠 메타데이터)
```

## 주요 개선 사항

1. ✅ 영상 업로드 후 메인 페이지에서 정상 표시
2. ✅ 콘텐츠 타입 정보 자동 설정
3. ✅ 중복 콘텐츠 제거
4. ✅ 데이터 구조 일관성 확보
5. ✅ 업로드 플로우 개선 (type 자동 전달)
6. ✅ 에러 처리 개선

## 다음 단계 권장사항

1. **썸네일 생성**: 영상 업로드 시 자동으로 썸네일 이미지 생성
2. **진행률 표시**: 대용량 파일 업로드 시 실시간 진행률 표시
3. **파일 검증**: 업로드 전 파일 형식 및 크기 검증 강화
4. **에러 복구**: 업로드 실패 시 재시도 기능
5. **배치 업로드**: 여러 파일 동시 업로드 최적화
