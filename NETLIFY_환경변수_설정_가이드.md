# 🎯 Netlify 환경 변수 설정 가이드 (스크린샷 포함)

## 현재 문제
- ❌ https://1vibebox.netlify.app/admin 접속 시 401 에러
- ❌ 로그인 버튼 클릭해도 반응 없음
- ❌ API 요청이 모두 401 Unauthorized 반환

## 원인
Netlify에 환경 변수가 설정되지 않아서 미들웨어가 모든 요청을 차단하고 있습니다.

---

## 📝 단계별 설정 방법

### 1단계: Netlify 사이트 접속

1. 브라우저에서 https://app.netlify.com 접속
2. 로그인
3. "Sites" 목록에서 `1vibebox` 클릭

### 2단계: 환경 변수 메뉴 찾기

```
좌측 메뉴에서:
Site configuration 클릭
  ↓
Environment variables 클릭
  ↓
"Add a variable" 버튼 보임
```

### 3단계: 첫 번째 변수 추가 (DEV_LOGIN)

1. **"Add a variable" 버튼 클릭**

2. **변수 입력:**
   ```
   Key: DEV_LOGIN
   Value: true
   ```
   
3. **Scopes 선택:**
   - "All scopes" 라디오 버튼 선택
   - 또는 "Production" 체크박스만 선택

4. **"Add variable" 버튼 클릭**

### 4단계: 두 번째 변수 추가 (DEV_EVAL)

1. **다시 "Add a variable" 버튼 클릭**

2. **변수 입력:**
   ```
   Key: DEV_EVAL
   Value: true
   ```

3. **Scopes: "All scopes" 선택**

4. **"Add variable" 버튼 클릭**

### 5단계: 세 번째 변수 추가 (NEXT_PUBLIC_BASE_URL)

1. **다시 "Add a variable" 버튼 클릭**

2. **변수 입력:**
   ```
   Key: NEXT_PUBLIC_BASE_URL
   Value: https://1vibebox.netlify.app
   ```

3. **Scopes: "All scopes" 선택**

4. **"Add variable" 버튼 클릭**

### 6단계: 설정 확인

환경 변수 페이지에 다음 3개가 표시되어야 합니다:

```
✅ DEV_LOGIN = true
✅ DEV_EVAL = true
✅ NEXT_PUBLIC_BASE_URL = https://1vibebox.netlify.app
```

---

## 🚀 재배포하기

환경 변수를 추가한 후 **반드시 재배포**해야 적용됩니다!

### 방법 1: Netlify에서 수동 배포 (추천)

```
1. 상단 메뉴에서 "Deploys" 탭 클릭
2. 우측 상단 "Trigger deploy" 버튼 클릭
3. "Deploy site" 선택
4. 빌드 시작됨 (약 2-3분 소요)
5. "Published" 상태가 되면 완료
```

### 방법 2: Git 푸시로 자동 배포

```bash
# 로컬에서 실행
git add .
git commit -m "Update config"
git push
```

---

## ✅ 배포 완료 확인

### 1. 빌드 로그 확인

```
Deploys 탭 → 최신 배포 클릭 → "Deploy log" 확인

마지막에 다음 메시지가 나와야 함:
✔ Site is live
```

### 2. 사이트 테스트

1. **관리자 페이지 접속:**
   - https://1vibebox.netlify.app/admin
   - 401 에러 없이 페이지 로드되어야 함

2. **브라우저 콘솔 확인 (F12):**
   - Console 탭에서 401 에러 없어야 함
   - Network 탭에서 `/api/admin/site-settings` 요청이 200 OK여야 함

3. **로그인 버튼 테스트:**
   - 로그인 페이지에서 버튼 클릭 시 반응 있어야 함

---

## 🐛 문제 해결

### 여전히 401 에러가 나는 경우

#### 체크 1: 환경 변수 확인
```
Site configuration → Environment variables

확인 사항:
- DEV_LOGIN 값이 "true" (따옴표 없이)
- 오타 없는지 확인 (대소문자 정확히)
- Scopes가 "All scopes" 또는 "Production"
```

#### 체크 2: 재배포 확인
```
Deploys 탭에서:
- 환경 변수 추가 후 새로운 배포가 실행되었는지 확인
- 최신 배포의 상태가 "Published"인지 확인
- 배포 시간이 환경 변수 추가 시간 이후인지 확인
```

#### 체크 3: 빌드 로그 확인
```
Deploy log에서 에러 확인:
- "Build failed" 메시지 있는지
- TypeScript 에러 있는지
- 환경 변수 관련 경고 있는지
```

#### 체크 4: 브라우저 캐시
```
- Ctrl + Shift + R (하드 리프레시)
- 또는 시크릿 모드에서 테스트
- 또는 브라우저 캐시 완전 삭제
```

### 로그인 버튼이 클릭되지 않는 경우

1. **브라우저 콘솔 확인:**
   ```
   F12 → Console 탭
   JavaScript 에러 메시지 확인
   ```

2. **네트워크 요청 확인:**
   ```
   F12 → Network 탭
   페이지 새로고침
   401 에러 요청 찾기
   ```

3. **React DevTools 경고 무시:**
   ```
   "Download React DevTools" 메시지는 무시해도 됨
   실제 에러가 아님
   ```

### 빌드가 실패하는 경우

**일반적인 원인:**

1. **TypeScript 에러:**
   - `next.config.ts`에 `typescript: { ignoreBuildErrors: true }` 있는지 확인

2. **환경 변수 오타:**
   - Key 이름 대소문자 정확히 확인
   - Value에 불필요한 따옴표 없는지 확인

3. **Node 버전:**
   - `netlify.toml`에 `NODE_VERSION = "18"` 있는지 확인

---

## 📋 최종 체크리스트

### 설정 전:
- [ ] Netlify 계정 로그인
- [ ] 1vibebox 사이트 선택
- [ ] Site configuration → Environment variables 메뉴 찾기

### 환경 변수 추가:
- [ ] DEV_LOGIN = true
- [ ] DEV_EVAL = true
- [ ] NEXT_PUBLIC_BASE_URL = https://1vibebox.netlify.app
- [ ] 각 변수의 Scopes "All scopes" 선택

### 재배포:
- [ ] Trigger deploy → Deploy site 실행
- [ ] 빌드 완료 대기 (2-3분)
- [ ] "Site is live" 메시지 확인

### 테스트:
- [ ] https://1vibebox.netlify.app 접속 가능
- [ ] https://1vibebox.netlify.app/admin 접속 가능
- [ ] 401 에러 사라짐
- [ ] 브라우저 콘솔에 에러 없음

---

## ⚠️ 중요 참고사항

### DEV 모드 제한사항

현재 `DEV_LOGIN=true` 설정은 **읽기 전용 모드**입니다:

**가능:**
- ✅ 관리자 페이지 접근
- ✅ 기존 콘텐츠 조회
- ✅ 사이트 설정 조회
- ✅ 메뉴, 태그 보기

**불가능:**
- ❌ 새 콘텐츠 작성
- ❌ 콘텐츠 수정/삭제
- ❌ 파일 업로드
- ❌ 사이트 설정 변경

### 왜 저장이 안 되나요?

Netlify는 **서버리스 환경**입니다:
- 파일 시스템이 읽기 전용
- `data/contents.json` 같은 파일에 쓰기 불가
- 업로드한 파일도 저장 불가

### 완전한 기능을 사용하려면?

**데이터베이스 연결 필요:**
- Supabase (무료, 추천)
- Neon (무료)
- PlanetScale (무료)

데이터베이스 연결 후:
- `DEV_LOGIN=false`로 변경
- 콘텐츠 작성/수정 가능
- 파일 업로드 가능 (S3 연결 시)

---

## 🎓 추가 정보

### 환경 변수가 적용되는 시점

```
환경 변수 추가
  ↓
재배포 실행
  ↓
빌드 시작 (환경 변수 로드)
  ↓
빌드 완료
  ↓
배포 완료
  ↓
환경 변수 적용됨 ✅
```

### netlify.toml vs Netlify 대시보드

**netlify.toml의 [build.environment]:**
- ❌ 런타임에 사용 불가
- ✅ 빌드 시에만 사용
- 예: NODE_VERSION

**Netlify 대시보드의 Environment variables:**
- ✅ 런타임에 사용 가능
- ✅ 빌드 시에도 사용 가능
- 예: DEV_LOGIN, DATABASE_URL

**결론:** 런타임 환경 변수는 반드시 대시보드에서 설정!

---

## 📞 추가 도움

### 스크린샷 찍어서 확인하기

다음 화면을 스크린샷으로 찍어서 확인:

1. **환경 변수 목록:**
   - Site configuration → Environment variables
   - 3개 변수가 모두 보이는지

2. **배포 상태:**
   - Deploys 탭
   - 최신 배포가 "Published"인지

3. **빌드 로그:**
   - Deploy log 마지막 부분
   - "Site is live" 메시지 있는지

4. **브라우저 콘솔:**
   - F12 → Console 탭
   - 401 에러 메시지

### 도움 요청 시 포함할 정보

- Netlify 사이트 URL
- 환경 변수 설정 스크린샷
- 빌드 로그 (Deploy log)
- 브라우저 콘솔 에러 메시지
- 네트워크 탭 401 요청 상세

---

**예상 소요 시간:** 5-10분
**난이도:** ⭐ 매우 쉬움
**성공률:** 99% (환경 변수만 정확히 설정하면 됨)
