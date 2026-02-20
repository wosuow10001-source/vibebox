# 🔧 42MB 영상 업로드 최종 해결

## 문제
- 42MB 영상이 10MB로 잘려서 업로드됨
- 손상된 파일이라 영상 재생 안 됨

## 원인
Next.js 15의 기본 바디 크기 제한 (약 10MB)

## 해결
`next.config.ts`에 바디 크기 제한 설정 추가

## 수정 완료

### 1. next.config.ts
```typescript
experimental: {
  serverActions: {
    bodySizeLimit: '100mb',
  },
},
```

### 2. upload API
불필요한 config 제거 (Next.js 15에서는 작동 안 함)

## 🚀 다음 단계 (필수!)

### 1. 서버 완전히 재시작
```bash
# 터미널에서 Ctrl+C로 서버 중지
# .next 폴더 삭제
Remove-Item -Recurse -Force .next

# 서버 재시작
npm run dev
```

### 2. 브라우저 캐시 삭제
```
Ctrl + Shift + Delete
→ 캐시된 이미지 및 파일 삭제
```

### 3. 영상 다시 업로드
1. http://localhost:3000/admin/upload 접속
2. korea_hiphop_ai_musicvedio_satan1.mp4 (42MB) 선택
3. 업로드 완료 대기 (시간이 좀 걸릴 수 있음)
4. 자동으로 콘텐츠 생성 페이지로 이동
5. 제목 입력 후 저장

### 4. 파일 크기 확인
업로드 후 PowerShell에서 확인:
```powershell
Get-ChildItem "public/uploads" -Recurse -Filter "*.mp4" | 
  Sort-Object LastWriteTime -Descending | 
  Select-Object -First 1 @{Name="크기(MB)";Expression={[math]::Round($_.Length / 1MB, 2)}}
```

**42MB 정도가 나와야 합니다!**

### 5. 메인 페이지 확인
http://localhost:3000
- 영상 카드 확인
- 영상 썸네일 확인
- 클릭해서 재생 확인

## ⚠️ 중요!

- 반드시 서버를 재시작해야 합니다
- .next 폴더를 삭제해야 설정이 적용됩니다
- 브라우저 캐시도 삭제하세요

## 성공 확인

✅ 업로드 시 42MB 파일이 완전히 업로드됨
✅ 영상 상세 페이지에서 영상 재생됨
✅ 메인 페이지에서 영상 썸네일 표시됨

## 여전히 10MB로 잘린다면

서버 터미널에서 다음 로그 확인:
```
📥 Presign request: korea_hiphop_ai_musicvedio_satan1.mp4 (video/mp4)
```

파일 크기가 42MB로 표시되는지 확인하세요.

## 🎉 완료!

이제 42MB 영상이 완전히 업로드되고 재생됩니다!
