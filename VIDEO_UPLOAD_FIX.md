# 42MB 영상 업로드 문제 해결

## 문제
- 42MB 영상 파일이 업로드 시 ~10MB로 잘려서 저장됨
- 영상 플레이어에서 재생 불가 (검은 화면)

## 원인
Next.js 15의 기본 API 라우트 바디 크기 제한 (~10MB)이 대용량 파일 업로드를 차단함

## 해결 방법
청크 업로드 시스템 구현:
- 10MB 이상 파일은 자동으로 5MB 청크로 분할
- 각 청크를 순차적으로 업로드
- 서버에서 청크를 조합하여 완전한 파일 생성

## 변경된 파일
1. `app/api/admin/assets/upload-chunk/route.ts` (신규)
   - 청크 업로드 처리 API
   - 임시 파일에 청크 추가
   - 마지막 청크 수신 시 최종 파일 생성

2. `app/admin/upload/page.tsx`
   - 파일 크기 체크 (10MB 기준)
   - 대용량: 청크 업로드
   - 소용량: 기존 방식 유지
   - 실시간 진행률 표시

3. `next.config.ts`
   - bodySizeLimit을 2GB로 증가 (Server Actions용)

## 사용 방법
1. 관리자 페이지 → 콘텐츠 업로드
2. 영상 파일 선택 (최대 2GB)
3. 자동으로 청크 업로드 진행
4. 완료 후 메인 페이지에서 영상 확인

## 테스트
42MB 영상 파일 `korea_hiphop_ai_musicvedio_satan1.mp4` 업로드 후:
- 파일 크기 확인: `public/uploads/[assetId]/index.mp4`
- 메인 페이지에서 썸네일 표시 확인
- 상세 페이지에서 영상 재생 확인
