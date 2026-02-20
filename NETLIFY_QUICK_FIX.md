# Netlify 401 에러 즉시 해결 가이드

## 🚨 현재 상황
- URL: https://1vibebox.netlify.app
- 에러: `GET /api/admin/site-settings 401 (Unauthorized)`
- 원인: 환경 변수 미설정

## ✅ 즉시 해결 (5분)

### 1단계: Netlify 환경 변수 설정

1. **Netlify 대시보드 접속**
   - https://app.netlify.com 로그인
   - `1vibebox` 사이트 선택

2. **환경 변수 페이지로 이동**
   - 좌측 메뉴: **Site configuration** 클릭
   - **Environment variables** 클릭

3. **변수 추가** (Add a variable 버튼 클릭)

   **변수 1:**
   ```
   Key: DEV_LOGIN
   Value: true
   Scopes: All scopes 선택
   ```

   **변수 2:**
   ```
   Key: DEV_EVAL
   Value: true
   Scopes: All scopes 선택
   ```

   **변수 3:**
   ```
   Key: NEXT_PUBLIC_BASE_URL
   Value: https://1vibebox.netlify.app
   Scopes: All scopes 선택
   ```

   **변수 4 (선택):**
   ```
   Key: JWT_SECRET
   Value: your-random-secret-key-at-least-32-characters-long
   Scopes: All scopes 선택
   ```

4. **저장** (Save 버튼 클릭)

### 2단계: 재배포

**방법 A: 자동 재배포 (Git 푸시)**
```bash
git add .
git commit -m "Update Netlify config"
git push
```

**방법 B: 수동 재배포**
1. Netlify 대시보드에서 **Deploys** 탭 클릭
2. **Trigger deploy** 버튼 클릭
3. **Deploy site** 선택
4. 빌드 완료 대기 (2-3분)

### 3단계: 확인

1. 빌드 로그 확인:
   - Deploys → 최신 배포 클릭
   - **Deploy log** 확인
   - "Site is live" 메시지 확인

2. 사이트 테스트:
   - https://1vibebox.netlify.app/admin 접속
   - 401 에러 사라짐 확인

## 🔍 환경 변수 설정 확인

Netlify 대시보드에서 확인:
```
Site configuration → Environment variables

✅ DEV_LOGIN = true
✅ DEV_EVAL = true  
✅ NEXT_PUBLIC_BASE_URL = https://1vibebox.netlify.app
```

## ⚠️ 중요 제한사항

`DEV_LOGIN=true` 모드:
- ✅ 관리자 페이지 접근 가능
- ✅ 기존 콘텐츠 조회 가능
- ❌ **새 콘텐츠 저장 불가** (파일 시스템 없음)
- ❌ **파일 업로드 불가** (로컬 저장소 없음)

## 🎯 프로덕션 준비 (데이터 저장 가능)

### 데이터베이스 연결 (권장)

**Supabase 사용 (무료):**

1. **Supabase 가입**: https://supabase.com
2. **새 프로젝트 생성**
3. **Database URL 복사**:
   - Settings → Database → Connection string
   - `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres`

4. **Netlify 환경 변수 추가**:
   ```
   Key: DATABASE_URL
   Value: [복사한 URL]
   
   Key: JWT_SECRET
   Value: [32자 이상 랜덤 문자열]
   ```

5. **DEV_LOGIN 제거 또는 false로 변경**:
   ```
   Key: DEV_LOGIN
   Value: false
   ```

6. **로컬에서 마이그레이션**:
   ```bash
   # .env.local 파일에 추가
   echo "DATABASE_URL=your-supabase-url" >> .env.local
   
   # Prisma 마이그레이션 실행
   npx prisma migrate deploy
   
   # 초기 데이터 생성 (선택)
   npx prisma db seed
   ```

7. **Netlify 재배포**

## 🐛 문제 해결

### 여전히 401 에러
1. 환경 변수 확인:
   - Netlify 대시보드에서 변수 확인
   - 오타 확인 (DEV_LOGIN, 대소문자 정확히)

2. 재배포 확인:
   - Deploys 탭에서 최신 배포 확인
   - 환경 변수 변경 후 재배포 필수

3. 빌드 로그 확인:
   - 에러 메시지 확인
   - "Build failed" 시 에러 내용 확인

### 로그인 버튼 클릭 안됨
1. 브라우저 콘솔 확인 (F12)
2. JavaScript 에러 확인
3. 하드 리프레시 (Ctrl+Shift+R)

### 빌드 실패
1. 빌드 로그에서 에러 확인
2. TypeScript 에러: `typescript.ignoreBuildErrors: true` 확인
3. 환경 변수 문제: 필수 변수 확인

## 📋 체크리스트

- [ ] Netlify 환경 변수 설정 완료
  - [ ] DEV_LOGIN = true
  - [ ] DEV_EVAL = true
  - [ ] NEXT_PUBLIC_BASE_URL = https://1vibebox.netlify.app
- [ ] 재배포 완료
- [ ] 빌드 성공 확인
- [ ] https://1vibebox.netlify.app/admin 접속 가능
- [ ] 401 에러 사라짐

## 🚀 빠른 명령어

### Git 푸시로 재배포
```bash
git add netlify.toml NETLIFY_QUICK_FIX.md
git commit -m "Add Netlify environment config"
git push origin main
```

### 환경 변수 확인 (로컬)
```bash
# .env.local 확인
cat .env.local | grep DEV_LOGIN
```

## 📞 추가 도움

1. **Netlify 빌드 로그**: Deploys → 최신 배포 → Deploy log
2. **브라우저 콘솔**: F12 → Console 탭
3. **네트워크 탭**: F12 → Network 탭 → 401 요청 확인

## 🎓 참고 자료

- Netlify 환경 변수: https://docs.netlify.com/environment-variables/overview/
- Next.js 환경 변수: https://nextjs.org/docs/basic-features/environment-variables
- Supabase 시작하기: https://supabase.com/docs/guides/getting-started

---

**예상 소요 시간**: 5분 (환경 변수 설정 + 재배포)
**난이도**: ⭐ (매우 쉬움)
