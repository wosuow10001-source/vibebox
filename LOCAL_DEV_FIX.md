# 로컬 개발 환경 401 에러 해결

## 문제
`/api/admin/site-settings` 요청 시 401 에러 발생

## 원인
환경 변수 `DEV_LOGIN=true`가 제대로 로드되지 않음

## 즉시 해결 방법

### 방법 1: 개발 서버 재시작 (가장 간단)

```bash
# 현재 실행 중인 서버 중지 (Ctrl+C)
# .next 폴더 삭제
Remove-Item -Recurse -Force .next

# 개발 서버 재시작
npm run dev
```

### 방법 2: .env.local 확인

`.env.local` 파일에 다음이 있는지 확인:

```env
DEV_LOGIN=true
```

**주의**: 
- 따옴표 없이: `DEV_LOGIN=true` ✅
- 따옴표 있으면: `DEV_LOGIN="true"` ❌ (문자열로 인식될 수 있음)

### 방법 3: 환경 변수 직접 설정

PowerShell에서:
```powershell
$env:DEV_LOGIN="true"
npm run dev
```

또는 package.json 수정:
```json
"scripts": {
  "dev": "DEV_LOGIN=true next dev",
}
```

Windows에서는:
```json
"scripts": {
  "dev": "set DEV_LOGIN=true && next dev",
}
```

### 방법 4: 미들웨어 임시 비활성화 (테스트용)

`middleware.ts` 파일 수정:

```typescript
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 임시: 모든 요청 허용
  console.log(`✅ Allowing all requests (DEV MODE)`);
  return NextResponse.next();
  
  // ... 나머지 코드
}
```

## 확인 방법

1. 개발 서버 시작
2. 터미널에서 다음 로그 확인:
   ```
   🔍 Middleware check for: /api/admin/site-settings (devMode=true)
   ✅ DEV mode: bypassing auth for /api/admin/site-settings
   ```

3. 브라우저 콘솔에서 401 에러 사라짐

## 여전히 안 되면

### 디버깅 단계

1. **환경 변수 확인**:
   ```typescript
   // middleware.ts 맨 위에 추가
   console.log('🔧 DEV_LOGIN:', process.env.DEV_LOGIN);
   console.log('🔧 All env:', Object.keys(process.env).filter(k => k.includes('DEV')));
   ```

2. **미들웨어 로그 확인**:
   - 터미널에서 `devMode=true` 확인
   - `devMode=false`면 환경 변수 문제

3. **캐시 완전 삭제**:
   ```bash
   Remove-Item -Recurse -Force .next
   Remove-Item -Recurse -Force node_modules/.cache
   npm run dev
   ```

## 프로덕션 배포 시

Netlify/Vercel에서는 환경 변수를 대시보드에서 설정:
```
DEV_LOGIN = true
```

**주의**: 프로덕션에서 `DEV_LOGIN=true`는 보안 위험!
- 개발/테스트용으로만 사용
- 실제 서비스에서는 데이터베이스 + 인증 사용

## 권장 설정

### 로컬 개발
```env
# .env.local
DEV_LOGIN=true
DEV_EVAL=true
```

### 프로덕션
```env
# Netlify/Vercel 환경 변수
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
DEV_LOGIN=false  # 또는 설정하지 않음
```

## 체크리스트

- [ ] `.env.local` 파일에 `DEV_LOGIN=true` 있음
- [ ] 개발 서버 재시작함
- [ ] `.next` 폴더 삭제함
- [ ] 터미널에서 `devMode=true` 로그 확인
- [ ] 브라우저에서 401 에러 사라짐
- [ ] 관리자 페이지 정상 작동

## 빠른 테스트

```bash
# 1. 서버 중지
# 2. 캐시 삭제
Remove-Item -Recurse -Force .next

# 3. 환경 변수 확인
Get-Content .env.local | Select-String "DEV_LOGIN"

# 4. 서버 시작
npm run dev

# 5. 브라우저에서 http://localhost:3000/admin 접속
```
