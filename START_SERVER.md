# 개발 서버 시작 가이드

## .next 폴더 삭제 완료 ✅

빌드 캐시가 삭제되었습니다. 이제 개발 서버를 시작하세요.

## 서버 시작 방법

### 방법 1: npm 사용
```bash
npm run dev
```

### 방법 2: 포트 지정
```bash
npm run dev -- -p 3000
```

## 예상 출력

```
> vibebox@0.1.0 dev
> next dev

  ▲ Next.js 15.5.12
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.5s
```

## 서버 시작 후 테스트

1. **메인 페이지**: http://localhost:3000
   - "사탄" 영상 카드가 보여야 함
   - 플레이 아이콘(▶) 표시

2. **영상 상세 페이지**: http://localhost:3000/a/sample-content
   - 영상 플레이어가 표시되어야 함
   - 재생 버튼 클릭 시 영상 재생

3. **직접 영상 URL**: http://localhost:3000/uploads/asset-58b598fc-ce03-4517-ad39-46c9f2031312/index.mp4
   - 영상이 직접 재생되어야 함

## 문제 해결

### 포트가 이미 사용 중인 경우
```bash
# 다른 포트로 시작
npm run dev -- -p 3001
```

### 여전히 에러가 발생하는 경우
```bash
# node_modules 재설치
rm -rf node_modules
npm install
npm run dev
```

### Windows에서 포트 충돌 해결
```powershell
# 3000 포트 사용 중인 프로세스 찾기
netstat -ano | findstr :3000

# 프로세스 종료 (PID는 위 명령어 결과에서 확인)
taskkill /PID <PID> /F
```

## 성공 확인

✅ 서버가 http://localhost:3000 에서 실행됨
✅ 콘솔에 에러 없음
✅ 브라우저에서 페이지 로드됨
✅ 영상이 정상 재생됨

## 다음 단계

서버가 시작되면:
1. 브라우저에서 http://localhost:3000 접속
2. "사탄" 영상 카드 클릭
3. 영상 재생 확인
4. 전체 화면 버튼 테스트

모든 것이 정상 작동하면 수정이 완료된 것입니다! 🎉
