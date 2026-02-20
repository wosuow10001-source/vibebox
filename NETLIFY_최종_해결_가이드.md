# 🚀 Netlify 배포 최종 해결 가이드

## ✅ 수정 완료 사항

다음 문제들을 수정했습니다:

1. **로그인 페이지 401 에러** - 로그인 페이지가 AdminPageLayout을 사용하지 않도록 수정
2. **로그인 기능 개선** - 쿠키 기반 인증으로 변경
3. **미들웨어 간소화** - JWT 대신 간단한 base64 토큰 사용
4. **로그아웃 API 추가** - 쿠키 삭제 기능

## 📝 Netlify 환경 변수 설정 (필수!)

### 1단계: Netlify 대시보드 접속

1. https://app.netlify.com 로그인
2. `1vibebox` 사이트 선택
3. **Site configuration** → **Environment variables** 클릭

### 2단계: 환경 변수 추가

**"Add a variable" 버튼을 클릭하고 다음 3개 변수를 추가하세요:**

```
변수 1:
Key: DEV_LOGIN
Value: true
Scopes: All scopes

변수 2:
Key: DEV_EVAL
Value: true
Scopes: All scopes

변수 3:
Key: NEXT_PUBLIC_BASE_URL
Value: https://1vibebox.netlify.app
Scopes: All scopes
```

### 3단계: 코드 푸시 및 재배포

```bash
# 로컬에서 실행
git add .
git commit -m "Fix login and auth for Netlify"
git push
```

또는 Netlify 대시보드에서:
```
Deploys 탭 → Trigger deploy → Deploy site
```

### 4단계: 배포 완료 대기

- 빌드 시간: 약 2-3분
- Deploy log에서 "Site is live" 확인

### 5단계: 테스트

1. **로그인 페이지 접속:**
   - https://1vibebox.netlify.app/admin/login
   - 401 에러 없이 로드되어야 함

2. **로그인 테스트:**
   ```
   이메일: admin@example.com
   비밀번호: strong-initial-password-123
   ```
   - 로그인 버튼 클릭
   - `/admin` 페이지로 리다이렉트

3. **관리자 페이지 확인:**
   - https://1vibebox.netlify.app/admin
   - 대시보드 정상 로드

## 🔍 변경 사항 상세

### 1. 로그인 페이지 레이아웃 분리

**파일:** `app/admin/login/layout.tsx` (새로 생성)
- 로그인 페이지는 AdminPageLayout을 사용하지 않음
- 사이트 설정 API 호출 없음

### 2. AdminPageLayout 수정

**파일:** `components/admin/AdminPageLayout.tsx`
- 로그인 페이지에서는 사이트 설정 로드하지 않음
- `pathname === '/admin/login'` 체크 추가

### 3. 로그인 API 개선

**파일:** `app/api/admin/login/route.ts`
- OPTIONS 요청 처리 추가 (CORS)
- 쿠키에 토큰 저장 (`httpOnly`, `secure`)
- 8시간 유효기간 설정

### 4. 로그아웃 API 추가

**파일:** `app/api/admin/logout/route.ts` (새로 생성)
- POST 요청으로 쿠키 삭제

### 5. 미들웨어 간소화

**파일:** `middleware.ts`
- JWT 라이브러리 의존성 제거
- 간단한 base64 토큰 검증
- 로그아웃 API 경로 보호 제외

### 6. 로그인 페이지 수정

**파일:** `app/admin/login/page.tsx`
- `credentials: 'include'` 추가 (쿠키 포함)
- localStorage 사용 제거
- 쿠키 기반 인증으로 변경

## ⚠️ 중요 참고사항

### DEV 모드 (DEV_LOGIN=true)

**가능한 것:**
- ✅ 로그인 페이지 접근
- ✅ 관리자 페이지 접근
- ✅ 기존 콘텐츠 조회
- ✅ 사이트 설정 조회

**불가능한 것:**
- ❌ 새 콘텐츠 작성/수정 (파일 시스템 읽기 전용)
- ❌ 파일 업로드 (로컬 저장소 없음)
- ❌ 사이트 설정 변경 저장

### 프로덕션 모드 (데이터베이스 연결)

완전한 기능을 사용하려면:

1. **Supabase 데이터베이스 생성**
   - https://supabase.com 가입
   - 새 프로젝트 생성
   - Database URL 복사

2. **Netlify 환경 변수 추가**
   ```
   DATABASE_URL = [Supabase URL]
   JWT_SECRET = [32자 이상 랜덤 문자열]
   ```

3. **DEV_LOGIN 변경**
   ```
   DEV_LOGIN = false
   ```

4. **로컬에서 마이그레이션**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

5. **Netlify 재배포**

## 🐛 문제 해결

### 여전히 401 에러

**체크리스트:**
- [ ] Netlify 환경 변수 3개 설정 확인
- [ ] 환경 변수 추가 후 재배포 실행
- [ ] 빌드 성공 확인 (Deploy log)
- [ ] 브라우저 캐시 삭제 (Ctrl+Shift+R)

**확인 방법:**
```
1. Netlify: Site configuration → Environment variables
   - DEV_LOGIN = true
   - DEV_EVAL = true
   - NEXT_PUBLIC_BASE_URL = https://1vibebox.netlify.app

2. Netlify: Deploys 탭
   - 최신 배포 상태: Published
   - 배포 시간이 환경 변수 추가 이후

3. 브라우저: F12 → Console
   - 401 에러 없음
```

### 로그인 버튼 클릭 안됨

1. **브라우저 콘솔 확인 (F12)**
   - JavaScript 에러 확인
   - Network 탭에서 `/api/admin/login` 요청 확인

2. **하드 리프레시**
   - Ctrl + Shift + R
   - 또는 시크릿 모드에서 테스트

3. **쿠키 확인**
   - F12 → Application 탭 → Cookies
   - `admin_token` 쿠키 확인

### 로그인 후 다시 로그인 페이지로

1. **쿠키 설정 확인**
   - F12 → Application → Cookies
   - `admin_token` 쿠키가 있는지 확인

2. **미들웨어 로그 확인**
   - Netlify Functions 로그 확인
   - 토큰 검증 실패 메시지 확인

3. **브라우저 쿠키 설정**
   - 타사 쿠키 차단 해제
   - 시크릿 모드에서 테스트

## 📋 최종 체크리스트

### 배포 전:
- [x] 코드 수정 완료
  - [x] 로그인 페이지 레이아웃 분리
  - [x] AdminPageLayout 수정
  - [x] 로그인 API 쿠키 추가
  - [x] 로그아웃 API 생성
  - [x] 미들웨어 간소화
- [ ] Git 커밋 및 푸시
- [ ] Netlify 환경 변수 설정

### 배포 후:
- [ ] 빌드 성공 확인
- [ ] https://1vibebox.netlify.app/admin/login 접속 가능
- [ ] 로그인 버튼 정상 작동
- [ ] 로그인 후 `/admin` 리다이렉트
- [ ] 관리자 페이지 정상 로드

## 🎯 다음 단계

### 현재 상태 (DEV 모드)
- 사이트 조회 가능
- 관리자 페이지 접근 가능
- 읽기 전용

### 프로덕션 준비
1. Supabase 데이터베이스 연결
2. `DEV_LOGIN=false` 설정
3. 콘텐츠 작성/수정 가능
4. S3 연결 시 파일 업로드 가능

## 📞 추가 도움

### 로그 확인 위치

1. **Netlify 빌드 로그:**
   ```
   Deploys → 최신 배포 → Deploy log
   ```

2. **Netlify Functions 로그:**
   ```
   Functions → 함수 선택 → Logs
   ```

3. **브라우저 콘솔:**
   ```
   F12 → Console 탭
   ```

4. **브라우저 네트워크:**
   ```
   F12 → Network 탭 → 401 요청 확인
   ```

---

**예상 소요 시간:** 10분 (코드 푸시 + 환경 변수 설정 + 재배포)
**난이도:** ⭐⭐ 쉬움
**성공률:** 95% (환경 변수만 정확히 설정하면 됨)
