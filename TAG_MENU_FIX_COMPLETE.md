# 태그/메뉴 이동 기능 수정 완료 ✅

## 문제 상황
- 콘텐츠 관리에서 태그를 추가했지만 태그 페이지(`/tag/blog`)에 콘텐츠가 표시되지 않음
- 메인 페이지에도 콘텐츠가 제대로 반영되지 않음

## 원인 분석
`data/contents.json` 파일에서 콘텐츠의 `assets` 필드가 비어있었음:
```json
{
  "id": "1771542936015",
  "title": "뇌파1",
  "slug": "neuroiq-pro-ultimate-v2",
  "type": "HTML_APP",
  "tags": ["blog"],
  "assets": []  // ❌ 비어있음
}
```

HTML_APP 타입 콘텐츠는 반드시 `assets` 배열에 HTML 파일의 asset ID가 포함되어야 합니다.

## 해결 방법
1. 업로드된 HTML 파일의 asset ID 확인: `asset-f7389f72-2885-4cbb-a012-913fdf8842ed`
2. `data/contents.json` 파일 수정하여 assets 배열에 추가:
```json
{
  "assets": [
    "asset-f7389f72-2885-4cbb-a012-913fdf8842ed"
  ]
}
```

## 테스트 결과
✅ 메인 페이지 (`http://localhost:3001`): 콘텐츠 표시됨
✅ 태그 페이지 (`http://localhost:3001/tag/blog`): 콘텐츠 표시됨
✅ 상세 페이지 (`http://localhost:3001/a/neuroiq-pro-ultimate-v2`): HTML 앱 로드됨

## 향후 주의사항
### 콘텐츠 업로드 시
- HTML 앱을 업로드할 때는 반드시 "저장" 버튼을 클릭하여 콘텐츠 생성
- 업로드만 하고 저장하지 않으면 assets가 비어있는 상태로 저장됨

### 태그 추가 시
- 콘텐츠 관리 페이지에서 "📂 메뉴로 이동" 버튼 사용
- 사이트 설정의 메뉴에서 빠른 선택 가능
- 직접 입력도 가능

### 문제 발생 시 체크리스트
1. `data/contents.json` 파일에서 해당 콘텐츠의 `assets` 배열 확인
2. `public/uploads/` 폴더에 해당 asset 폴더가 존재하는지 확인
3. `.next` 폴더 삭제 후 서버 재시작
4. 브라우저 캐시 삭제

## 서버 정보
- 현재 포트: 3001 (3000이 사용 중이어서 자동으로 변경됨)
- DEV 모드: 파일 기반 저장 (`data/contents.json`)

## 관련 파일
- `data/contents.json` - 콘텐츠 데이터
- `app/(public)/tag/[tag]/page.tsx` - 태그 페이지
- `app/admin/content/page.tsx` - 콘텐츠 관리 (태그 추가 UI)
- `app/api/admin/content/[id]/route.ts` - 콘텐츠 수정 API
- `components/public/SiteRenderer.tsx` - 콘텐츠 카드 렌더링
