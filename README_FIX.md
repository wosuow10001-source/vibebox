# 🚨 빌드 에러 해결 방법

## 현재 문제
`.next` 빌드 캐시가 손상되어 500 Internal Server Error 발생

## ✅ 해결 방법 (선택하세요)

### 방법 1: 자동 스크립트 (추천) ⭐

1. 현재 실행 중인 서버를 **완전히 중지** (`Ctrl + C`)
2. PowerShell에서 실행:
```powershell
.\fix-and-start.ps1
```

### 방법 2: 수동 실행

1. 서버 중지 (`Ctrl + C`)
2. 다음 명령어 실행:
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

## 📋 단계별 가이드

### 1️⃣ 서버 중지
- 터미널에서 `Ctrl + C` 누르기
- "Terminate batch job (Y/N)?" 나오면 `Y` 입력
- 프로세스가 완전히 종료될 때까지 대기

### 2️⃣ .next 폴더 삭제
```powershell
Remove-Item -Recurse -Force .next
```

### 3️⃣ 서버 재시작
```powershell
npm run dev
```

### 4️⃣ 브라우저 접속
http://localhost:3000

## ✅ 성공 확인

터미널에 다음과 같이 표시되면 성공:
```
✓ Ready in 3s
○ Compiling / ...
✓ Compiled / in 2s
```

브라우저에서:
- ✅ 페이지가 로드됨
- ✅ "사탄" 영상 카드가 보임
- ✅ 500 에러 없음

## 🔧 문제가 계속되면

### 완전 재설치 (5-10분 소요)
```powershell
# 서버 중지 후
Remove-Item -Recurse -Force .next, node_modules
npm install
npm run dev
```

## ⚠️ 주의사항

1. **서버를 완전히 중지**한 후 폴더를 삭제하세요
2. "파일이 사용 중" 에러가 나면 서버가 아직 실행 중입니다
3. 여러 터미널에서 서버를 실행했다면 모두 중지하세요

## 📞 여전히 문제가 있나요?

다음 정보를 공유해주세요:
1. 터미널의 전체 에러 메시지
2. `npm run dev` 실행 후 출력
3. 브라우저 콘솔의 에러 메시지
