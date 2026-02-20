# 영상 표시 문제 해결 가이드

## 발견된 추가 문제

### 1. generateStaticParams 필터링 오류
**문제**: `/a/[slug]` 페이지가 HTML_APP 타입만 생성하도록 필터링되어 있어서 VIDEO와 IMAGE 타입 페이지가 생성되지 않음

**원인**:
```typescript
// 잘못된 코드
.filter((c: any) => c && c.type === "HTML_APP")
```

**수정**:
```typescript
// 올바른 코드 - POST를 제외한 모든 타입 포함
.filter((c: any) => c && c.type && c.type !== "POST")
```

### 2. 타입 체크 오류
**문제**: 상세 페이지에서 HTML_APP만 허용하도록 체크하여 VIDEO/IMAGE가 차단됨

**수정 전**:
```typescript
if (!app || app.status !== "PUBLISHED" || app.type !== "HTML_APP") {
  return <div>앱을 찾을 수 없습니다.</div>;
}
```

**수정 후**:
```typescript
if (!app || app.status !== "PUBLISHED") {
  return <div>콘텐츠를 찾을 수 없습니다.</div>;
}
```

### 3. Console.error 패치 문제
**문제**: Next.js의 console wrapper와 충돌하여 "payload must be object" 에러 발생

**해결**: console.error 패치 코드를 완전히 제거 (Next.js가 자체적으로 처리)

## 수정된 파일

1. `app/(public)/a/[slug]/page.tsx`
   - generateStaticParams: POST를 제외한 모든 타입 포함
   - 타입 체크 완화: HTML_APP 전용 → 모든 타입 허용
   - generateMetadata: 타입 체크 제거

2. `app/layout.tsx`
   - console.error 패치 코드 제거

3. `app/api/admin/content/route.ts`
   - type 필드 저장 추가

4. `app/(public)/page.tsx`
   - asset- ID 필터링 추가

5. `components/public/SiteRenderer.tsx`
   - asset ID 타입 체크 개선

## 테스트 방법

### 1. 개발 서버 재시작
```bash
# 기존 서버 중지 (Ctrl+C)
# .next 폴더 삭제 (선택사항)
rm -rf .next

# 개발 서버 시작
npm run dev
```

### 2. 영상 페이지 접속
- 메인 페이지: http://localhost:3000
- 영상 상세 페이지: http://localhost:3000/a/sample-content

### 3. 확인 사항
✅ 메인 페이지에서 "사탄" 영상 카드가 보이는가?
✅ 영상 카드에 플레이 아이콘이 표시되는가?
✅ 영상 카드 클릭 시 `/a/sample-content`로 이동하는가?
✅ 상세 페이지에서 영상이 재생되는가?
✅ 콘솔에 "payload must be object" 에러가 없는가?

## 영상 파일 정보

```
경로: public/uploads/asset-58b598fc-ce03-4517-ad39-46c9f2031312/index.mp4
크기: 10.00 MB
타입: video/mp4
```

## 데이터 구조

```json
{
  "id": "1771487037132",
  "title": "사탄",
  "slug": "sample-content",
  "type": "VIDEO",
  "status": "PUBLISHED",
  "assets": ["asset-58b598fc-ce03-4517-ad39-46c9f2031312"]
}
```

## URL 구조

- 메인 페이지: `/`
- POST 타입: `/p/[slug]` (예: `/p/my-blog-post`)
- 기타 타입: `/a/[slug]` (예: `/a/sample-content`)
  - VIDEO
  - IMAGE
  - HTML_APP
  - PROJECT
  - GAME

## 렌더링 로직

`/a/[slug]` 페이지에서:

1. **VIDEO 타입**: `<video>` 태그로 직접 렌더링
2. **IMAGE 타입**: `<img>` 태그로 렌더링
3. **HTML_APP 타입**: `<iframe>` 샌드박스로 렌더링

```typescript
// DEV 모드에서 파일 경로 생성
const appUrl = `/uploads/${assetId}/index.mp4`;

// 렌더링
<video controls playsInline preload="metadata" src={appUrl}>
  <source src={appUrl} type="video/mp4" />
</video>
```

## 문제 해결 체크리스트

- [x] generateStaticParams에서 VIDEO 타입 포함
- [x] 타입 체크 완화 (HTML_APP 전용 → 모든 타입)
- [x] console.error 패치 제거
- [x] type 필드 저장 확인
- [x] 영상 파일 존재 확인
- [x] 데이터 구조 정리
- [ ] 개발 서버 재시작 필요
- [ ] 브라우저 캐시 삭제 권장

## 추가 권장사항

1. **브라우저 캐시 삭제**: Ctrl+Shift+R (하드 리프레시)
2. **개발자 도구 확인**: Network 탭에서 영상 파일 로드 확인
3. **콘솔 에러 확인**: 더 이상 "payload must be object" 에러가 없어야 함

## 예상 결과

메인 페이지에서 영상 카드를 클릭하면:
1. `/a/sample-content`로 이동
2. 페이지 상단에 제목 "사탄" 표시
3. 영상 플레이어가 표시되고 재생 가능
4. 전체 화면 버튼 작동
5. 콘솔에 에러 없음
