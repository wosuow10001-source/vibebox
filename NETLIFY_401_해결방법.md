# 🚨 Netlify 401 에러 해결 방법

## 문제 상황
- 사이트: https://1vibebox.netlify.app
- 에러: `GET /api/admin/site-settings 401 (Unauthorized)`
- 로그인 버튼 클릭해도 아무 반응 없음

## 원인
Netlify에서 런타임 환경 변수가 설정되지 않아서 미들웨어가 인증을 요구하고 있습니다.

## ✅ 해결 방법 (5분 소요)

### 1단계: Netlify 대시보드에서 환경 변수 설정

1. **Netlify 로그인**
   - https://app.netlify.com 접속
   - 로그인 후 `1vibebox` 사이트 선택

2. **환경 변수 메뉴로 이동**
   ```
   Site configuration (좌측 메뉴)
   → Environment variables 클릭
   → Add a variable 버튼 클릭
   ```

3. **다음 3개 변수를 추가하세요:**

   **첫 번째 변수:**
   ```
   Key: DEV_LOGIN
   Value: true
   ```
   - Scopes: "All scopes" 선택
   - Add variable 클릭

   **두 번째 변수:**
   ```
   Key: DEV_EVAL
   Value: true
   ```
   - Scopes: "All scopes" 선택
   - Add variable 클릭

   **세 번째 변수:**
   ```
   Key: NEXT_PUBLIC_BASE_URL
   Value: https://1vibebox.netlify.app
   ```
   - Scopes: "All scopes" 선택
   - Add variable 클릭

4. **저장 확인**
   - 3개 변수가 모두 목록에 표시되는지 확인

### 2단계: 사이트 재배포

환경 변수를 추가한 후 반드시 재배포해야 합니다.

**방법 1: Netlify 대시보드에서 수동 배포**
```
1. Deploys 탭 클릭
2. "Trigger deploy" 버튼 클릭
3. "Deploy site" 선택
4. 빌드 완료 대기 (약 2-3분)
```

**방법 2: Git 푸시로 자동 배포**
```bash
git add .
git commit -m "Update Netlify config"
git push
```

### 3단계: 배포 완료 확인

1. **빌드 로그 확인**
   ```
   Deploys 탭 → 최신 배포 클릭 → Deploy log 확인
   "Site is live" 메시지가 나오면 성공
   ```

2. **사이트 테스트**
   - https://1vibebox.netlify.app/admin 접속
   - 401 에러 없이 관리자 페이지가 로드되어야 함
   - 로그인 버튼이 정상 작동해야 함

## 🔍 환경 변수 설정 확인 방법

Netlify 대시보드에서:
```
Site configuration → Environment variables

확인 사항:
✅ DEV_LOGIN = true
✅ DEV_EVAL = true
✅ NEXT_PUBLIC_BASE_URL = https://1vibebox.netlify.app
```

## ⚠️ 중요: DEV 모드 제한사항

현재 `DEV_LOGIN=true` 모드는 읽기 전용입니다:

**가능한 것:**
- ✅ 관리자 페이지 접근
- ✅ 기존 콘텐츠 조회
- ✅ 사이트 설정 조회

**불가능한 것:**
- ❌ 새 콘텐츠 작성/수정 (파일 시스템 없음)
- ❌ 파일 업로드 (로컬 저장소 없음)
- ❌ 사이트 설정 변경 저장

## 🎯 완전한 기능을 위한 데이터베이스 연결 (선택사항)

콘텐츠 작성/수정이 필요하면 데이터베이스를 연결해야 합니다.

### Supabase 무료 데이터베이스 사용

1. **Supabase 가입**
   - https://supabase.com 접속
   - 무료 계정 생성

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - 프로젝트 이름, 비밀번호 설정
   - Region: Northeast Asia (Seoul) 선택

3. **Database URL 복사**
   ```
   Settings → Database → Connection string
   "URI" 탭에서 전체 URL 복사
   예: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```

4. **Netlify에 데이터베이스 환경 변수 추가**
   ```
   Key: DATABASE_URL
   Value: [복사한 Supabase URL]
   
   Key: JWT_SECRET
   Value: [32자 이상 랜덤 문자열]
   예: my-super-secret-jwt-key-12345678901234567890
   ```

5. **DEV_LOGIN 변경**
   ```
   Key: DEV_LOGIN
   Value: false  (또는 변수 삭제)
   ```

6. **로컬에서 데이터베이스 초기화**
   ```bash
   # .env.local 파일에 DATABASE_URL 추가
   echo "DATABASE_URL=your-supabase-url" >> .env.local
   
   # Prisma 마이그레이션 실행
   npx prisma migrate deploy
   
   # 관리자 계정 생성 (선택)
   npx prisma db seed
   ```

7. **Netlify 재배포**

## 🐛 문제 해결

### 여전히 401 에러가 나는 경우

**체크리스트:**
- [ ] Netlify 환경 변수가 정확히 설정되었는지 확인
  - DEV_LOGIN = true (따옴표 없이)
  - DEV_EVAL = true
  - NEXT_PUBLIC_BASE_URL = https://1vibebox.netlify.app
- [ ] 환경 변수 추가 후 재배포했는지 확인
- [ ] 빌드가 성공했는지 확인 (Deploy log에서 "Site is live")
- [ ] 브라우저 캐시 삭제 (Ctrl+Shift+R로 하드 리프레시)

**빌드 로그 확인:**
```
Deploys → 최신 배포 클릭 → Deploy log
에러 메시지가 있는지 확인
```

### 로그인 버튼이 클릭되지 않는 경우

1. **브라우저 콘솔 확인**
   - F12 키 누르기
   - Console 탭에서 JavaScript 에러 확인

2. **네트워크 요청 확인**
   - F12 → Network 탭
   - 페이지 새로고침
   - 401 에러가 있는 요청 확인

3. **캐시 문제**
   - Ctrl+Shift+R (하드 리프레시)
   - 또는 시크릿 모드에서 테스트

### 빌드가 실패하는 경우

**일반적인 원인:**
- TypeScript 에러: `next.config.ts`에 `typescript.ignoreBuildErrors: true` 확인
- 환경 변수 오타: 대소문자 정확히 확인
- Node 버전: `netlify.toml`에 NODE_VERSION = "18" 확인

## 📋 최종 체크리스트

배포 전:
- [ ] Netlify 환경 변수 3개 설정 완료
- [ ] 변수 이름과 값 오타 없음 확인
- [ ] Scopes "All scopes" 선택 확인

배포 후:
- [ ] 빌드 성공 확인
- [ ] https://1vibebox.netlify.app 접속 가능
- [ ] https://1vibebox.netlify.app/admin 접속 가능
- [ ] 401 에러 사라짐
- [ ] 로그인 버튼 정상 작동

## 🎓 추가 정보

**왜 netlify.toml에 환경 변수를 넣으면 안 되나요?**
- `[build.environment]`는 빌드 시에만 사용됩니다
- 런타임 환경 변수는 Netlify 대시보드에서 설정해야 합니다
- Next.js 미들웨어는 런타임에 실행되므로 대시보드 설정이 필요합니다

**DEV_LOGIN 모드는 무엇인가요?**
- 데이터베이스 없이 파일 기반으로 동작하는 개발 모드입니다
- 로컬에서는 `data/` 폴더에 JSON 파일로 저장됩니다
- Netlify에서는 파일 시스템이 읽기 전용이라 조회만 가능합니다

**프로덕션 모드로 전환하려면?**
- Supabase 같은 데이터베이스를 연결하세요
- `DEV_LOGIN=false`로 변경하세요
- 관리자 로그인 기능이 활성화됩니다

## 📞 도움이 더 필요하면

1. Netlify 빌드 로그 확인
2. 브라우저 개발자 도구 (F12) 확인
3. 환경 변수 설정 스크린샷 확인

---

**예상 소요 시간:** 5분
**난이도:** ⭐ 매우 쉬움
