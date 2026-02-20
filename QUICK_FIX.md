# 빠른 해결 방법

## 현재 상황
`.next` 빌드 캐시가 손상되어 500 에러 발생

## 해결 방법 (3단계)

### 방법 1: PowerShell 스크립트 사용 (가장 쉬움)

1. **서버 중지**: 터미널에서 `Ctrl + C`

2. **스크립트 실행**:
```powershell
.\fix-and-start.ps1
```

### 방법 2: 수동 실행

1. **서버 중지**: 터미널에서 `Ctrl + C`

2. **.next 삭제**:
```powershell
Remove-Item -Recurse -Force .next
```

3. **서버 재시작**:
```powershell
npm run dev
```

## 예상 소요 시간
- .next 삭제: 5초
- 서버 재시작: 10-30초
- 첫 페이지 컴파일: 5-10초

## 성공 확인

터미널에 다음과 같이 표시되면 성공:
```
✓ Ready in 3s
○ Compiling / ...
✓ Compiled / in 2s
```

브라우저에서 http://localhost:3000 접속:
- ✅ 페이지가 로드됨
- ✅ "사탄" 영상 카드 표시
- ✅ 콘솔에 에러 없음

## 문제가 계속되면

### 완전 재설치 (5-10분 소요)
```powershell
# 1. 서버 중지 (Ctrl+C)

# 2. 모든 캐시 삭제
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules

# 3. 재설치
npm install

# 4. 서버 시작
npm run dev
```

## 주의사항

⚠️ **서버를 완전히 중지한 후** 폴더를 삭제하세요
⚠️ Windows에서 "파일이 사용 중" 에러가 나면 서버가 아직 실행 중입니다
⚠️ 여러 터미널에서 서버를 실행했다면 모두 중지하세요
