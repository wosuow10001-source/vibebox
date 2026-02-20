# 빌드 문제 해결 가이드

## 문제 상황
`.next` 폴더가 손상되어 빌드 파일들이 제대로 생성되지 않음

## 해결 방법

### 1단계: 서버 완전히 중지
터미널에서 `Ctrl + C` 여러 번 눌러서 완전히 중지

### 2단계: 캐시 및 빌드 폴더 삭제
```bash
# PowerShell에서 실행
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
```

### 3단계: node_modules 재설치 (선택사항, 문제가 계속되면)
```bash
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install
```

### 4단계: 개발 서버 재시작
```bash
npm run dev
```

## 빠른 해결 (권장)

터미널에서 다음 명령어를 순서대로 실행:

```bash
# 1. 서버 중지 (Ctrl+C)

# 2. .next 삭제
Remove-Item -Recurse -Force .next

# 3. 서버 재시작
npm run dev
```

## 문제가 계속되면

### 완전 재설치
```bash
# 1. 서버 중지
# 2. 모든 캐시 삭제
Remove-Item -Recurse -Force .next, node_modules

# 3. 재설치
npm install

# 4. 서버 시작
npm run dev
```

## 예상 결과

서버가 정상적으로 시작되면:
```
✓ Starting...
✓ Ready in 3s
○ Compiling / ...
✓ Compiled / in 2s
```

브라우저에서 http://localhost:3000 접속 시:
- ✅ 페이지가 로드됨
- ✅ 500 에러 없음
- ✅ "사탄" 영상 카드 표시

## 주의사항

- 서버를 완전히 중지한 후 폴더를 삭제하세요
- Windows에서는 파일이 잠겨있을 수 있으니 서버를 확실히 중지하세요
- node_modules 재설치는 시간이 걸릴 수 있습니다 (5-10분)

## 문제 원인

Next.js 개발 서버가 실행 중일 때 코드를 수정하면 빌드 캐시가 손상될 수 있습니다.
특히 다음 경우에 발생:
- 서버 실행 중 파일 구조 변경
- 빌드 중 서버 강제 종료
- 디스크 공간 부족
