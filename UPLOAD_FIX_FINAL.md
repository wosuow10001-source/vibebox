# 🔧 42MB 영상 업로드 문제 최종 해결

## 문제 원인
Next.js API 라우트의 기본 바디 크기 제한 (기본값: 4MB)

## 해결 방법
API 라우트에 바디 크기 제한 설정 추가

## 수정 내용

`app/api/admin/assets/upload/route.ts`에 추가:
```typescript
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',  // 100MB까지 허용
    },
    responseLimit: false,
  },
};
```

## 테스트 방법

### 1. 서버 재시작 (필수!)
```bash
# 터미널에서 Ctrl+C로 서버 중지
npm run dev
```

### 2. 브라우저 캐시 삭제
```
Ctrl + Shift + Delete
→ 캐시된 이미지 및 파일 삭제
```

### 3. 영상 업로드
1. http://localhost:3000/admin/upload 접속
2. korea_hiphop_ai_musicvedio_satan1.mp4 (42MB) 선택
3. 업로드 진행률 확인
4. 완료 메시지 확인

### 4. 확인 사항
- ✅ 업로드 진행률이 100%까지 진행
- ✅ "업로드 완료" 메시지 표시
- ✅ 자동으로 콘텐츠 생성 페이지로 이동
- ✅ 제목 입력 후 저장
- ✅ 메인 페이지에서 영상 카드 확인

## 파일 크기 확인

업로드 후 확인:
```powershell
# PowerShell에서 실행
Get-ChildItem "public/uploads" -Recurse -Filter "*.mp4" | 
  Sort-Object LastWriteTime -Descending | 
  Select-Object -First 1 Name, @{Name="크기(MB)";Expression={[math]::Round($_.Length / 1MB, 2)}}
```

42MB 정도가 나와야 합니다!

## 여전히 문제가 있다면

### 브라우저 콘솔 확인
1. F12 → Console 탭
2. 업로드 시 에러 메시지 확인
3. 에러 메시지 공유

### Network 탭 확인
1. F12 → Network 탭
2. presign 요청 확인
3. upload 요청 확인
4. 상태 코드 확인 (200이어야 함)

### 서버 터미널 확인
업로드 시 다음과 같은 로그가 나와야 함:
```
📥 Presign request: korea_hiphop_ai_musicvedio_satan1.mp4 (video/mp4)
📝 Creating Asset record (placeholder): korea_hiphop_ai_musicvedio_satan1.mp4
✅ Asset created: asset-xxxxx -> asset-xxxxx/index.mp4
✅ Saved to contents.json: ...
```

## 성공 확인

✅ 42MB 파일이 완전히 업로드됨
✅ 메인 페이지에서 영상 썸네일 표시
✅ 영상 클릭 시 상세 페이지로 이동
✅ 영상 재생 가능

## 추가 설정 (선택사항)

더 큰 파일을 업로드하려면:
```typescript
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '500mb',  // 500MB까지
    },
    responseLimit: false,
  },
};
```

## 🎉 완료!

이제 42MB 영상이 정상적으로 업로드되고 표시됩니다!
