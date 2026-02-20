# Netlify 환경 변수 설정 단계별 가이드

## 📍 현재 위치
https://1vibebox.netlify.app - 401 에러 발생 중

## 🎯 목표
환경 변수 설정하여 관리자 페이지 접근 가능하게 만들기

---

## 단계 1: Netlify 대시보드 접속

1. 브라우저에서 https://app.netlify.com 접속
2. 로그인
3. 사이트 목록에서 **1vibebox** 클릭

---

## 단계 2: 환경 변수 페이지로 이동

### 방법 A: 새 UI (2024)
1. 좌측 메뉴에서 **Site configuration** 클릭
2. **Environment variables** 클릭

### 방법 B: 구 UI
1. 상단 탭에서 **Site settings** 클릭
2. 좌측 메뉴에서 **Build & deploy** 클릭
3. **Environment** 섹션 찾기
4. **Edit variables** 버튼 클릭

---

## 단계 3: 환경 변수 추가

### 변수 1: DEV_LOGIN

1. **Add a variable** 또는 **New variable** 버튼 클릭
2. 입력:
   ```
   Key: DEV_LOGIN
   Values: 
     - Production: true
     - Deploy Previews: true
     - Branch deploys: true
   ```
3. **Create variable** 클릭

### 변수 2: DEV_EVAL

1. **Add a variable** 버튼 클릭
2. 입력:
   ```
   Key: DEV_EVAL
   Values:
     - Production: true
     - Deploy Previews: true
     - Branch deploys: true
   ```
3. **Create variable** 클릭

### 변수 3: NEXT_PUBLIC_BASE_URL

1. **Add a variable** 버튼 클릭
2. 입력:
   ```
   Key: NEXT_PUBLIC_BASE_URL
   Values:
     - Production: https://1vibebox.netlify.app
     - Deploy Previews: https://1vibebox.netlify.app
     - Branch deploys: https://1vibebox.netlify.app
   ```
3. **Create variable** 클릭

### 변수 4: JWT_SECRET (선택사항)

1. **Add a variable** 버튼 클릭
2. 입력:
   ```
   Key: JWT_SECRET
   Values:
     - Production: your-super-secret-key-must-be-at-least-32-characters-long-12345
     - Deploy Previews: (같은 값)
     - Branch deploys: (같은 값)
   ```
3. **Create variable** 클릭

---

## 단계 4: 설정 확인

환경 변수 목록에서 확인:

```
✅ DEV_LOGIN
   Production: true
   
✅ DEV_EVAL
   Production: true
   
✅ NEXT_PUBLIC_BASE_URL
   Production: https://1vibebox.netlify.app
```

---

## 단계 5: 재배포

### 방법 A: Git 푸시 (권장)

터미널에서:
```bash
# 변경사항 커밋
git add .
git commit -m "Add Netlify environment variables"

# 푸시 (자동 재배포 트리거)
git push origin main
```

### 방법 B: 수동 재배포

1. Netlify 대시보드 상단 **Deploys** 탭 클릭
2. 우측 상단 **Trigger deploy** 버튼 클릭
3. **Deploy site** 선택
4. 배포 시작 확인

---

## 단계 6: 빌드 모니터링

1. **Deploys** 탭에서 최신 배포 확인
2. 상태가 **Building** → **Published** 로 변경될 때까지 대기 (2-3분)
3. 빌드 로그 확인:
   - 배포 항목 클릭
   - **Deploy log** 확인
   - 에러 없이 완료되는지 확인

### 성공 메시지 예시:
```
✔ Build succeeded
✔ Site is live
✔ https://1vibebox.netlify.app
```

---

## 단계 7: 테스트

1. **새 탭**에서 https://1vibebox.netlify.app/admin 접속
2. 하드 리프레시: **Ctrl+Shift+R** (Windows) 또는 **Cmd+Shift+R** (Mac)
3. 확인:
   - ✅ 401 에러 사라짐
   - ✅ 관리자 페이지 로드됨
   - ✅ 로그인 페이지 또는 대시보드 표시

---

## 🔍 문제 해결

### 여전히 401 에러가 나타남

**원인 1: 환경 변수 오타**
- Netlify 대시보드에서 변수명 재확인
- `DEV_LOGIN` (대문자, 언더스코어)
- 값: `true` (소문자, 따옴표 없음)

**원인 2: 재배포 안됨**
- Deploys 탭에서 최신 배포 시간 확인
- 환경 변수 변경 후 배포가 새로 시작되었는지 확인

**원인 3: 캐시 문제**
- 브라우저 캐시 삭제
- 시크릿/프라이빗 모드로 테스트
- 하드 리프레시 (Ctrl+Shift+R)

### 빌드 실패

**TypeScript 에러:**
```
next.config.ts에서 확인:
typescript: { ignoreBuildErrors: true }
```

**환경 변수 에러:**
- 필수 변수 누락 확인
- 변수명 오타 확인

### 로그인 버튼 작동 안함

**JavaScript 에러 확인:**
1. F12 → Console 탭
2. 빨간색 에러 메시지 확인
3. 에러 내용 복사하여 검색

**네트워크 에러 확인:**
1. F12 → Network 탭
2. 로그인 버튼 클릭
3. 실패한 요청 확인 (빨간색)
4. 상태 코드 확인 (401, 404, 500 등)

---

## 📋 최종 체크리스트

### 환경 변수 설정
- [ ] Netlify 대시보드 접속
- [ ] Site configuration → Environment variables
- [ ] DEV_LOGIN = true 추가
- [ ] DEV_EVAL = true 추가
- [ ] NEXT_PUBLIC_BASE_URL = https://1vibebox.netlify.app 추가
- [ ] 변수 저장 확인

### 재배포
- [ ] Git 푸시 또는 수동 배포
- [ ] 빌드 시작 확인
- [ ] 빌드 성공 확인 (Published)
- [ ] 배포 시간 확인 (최근)

### 테스트
- [ ] https://1vibebox.netlify.app/admin 접속
- [ ] 하드 리프레시 (Ctrl+Shift+R)
- [ ] 401 에러 사라짐
- [ ] 페이지 정상 로드

---

## 🎓 추가 정보

### 환경 변수 우선순위
```
1. Production (프로덕션 배포)
2. Deploy Previews (PR 미리보기)
3. Branch deploys (브랜치별 배포)
```

### 환경 변수 적용 시점
- 환경 변수 변경 후 **반드시 재배포** 필요
- 기존 배포에는 적용되지 않음
- 새 배포부터 적용됨

### DEV_LOGIN=true 제한사항
- 읽기 전용 모드
- 데이터 저장 불가
- 파일 업로드 불가
- 프로덕션에서는 데이터베이스 사용 권장

---

## 🚀 다음 단계

### 즉시 (환경 변수만)
- ✅ 관리자 페이지 접근
- ✅ 기존 콘텐츠 조회
- ❌ 새 콘텐츠 저장 불가

### 나중에 (데이터베이스)
- ✅ 콘텐츠 저장 가능
- ✅ 파일 업로드 가능
- ✅ 완전한 CMS 기능

---

**예상 소요 시간**: 5-10분
**난이도**: ⭐ 매우 쉬움
**필요한 것**: Netlify 계정, Git 저장소
