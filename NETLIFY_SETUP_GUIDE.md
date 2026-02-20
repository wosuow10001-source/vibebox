# Netlify 배포 즉시 해결 가이드

## 🚨 현재 문제
관리자 페이지가 작동하지 않는 이유: **환경 변수 미설정**

## ✅ 즉시 해결 방법 (5분)

### 1단계: Netlify 환경 변수 설정

1. Netlify 대시보드 접속: https://app.netlify.com
2. 사이트 선택: `1vibebox`
3. **Site settings** → **Environment variables** 클릭
4. 다음 변수들을 **하나씩** 추가:

```
변수명: DEV_LOGIN
값: true

변수명: DEV_EVAL  
값: true

변수명: NEXT_PUBLIC_BASE_URL
값: https://1vibebox.netlify.app
```

### 2단계: 재배포

1. **Deploys** 탭으로 이동
2. **Trigger deploy** → **Deploy site** 클릭
3. 빌드 완료 대기 (약 2-3분)

### 3단계: 테스트

1. https://1vibebox.netlify.app/admin 접속
2. 관리자 페이지 확인

## ⚠️ 중요 제한사항

현재 설정(DEV_LOGIN=true)의 제한:
- ✅ 관리자 페이지 접근 가능
- ✅ 콘텐츠 조회 가능
- ❌ **콘텐츠 저장 불가** (파일 시스템 사용 불가)
- ❌ **파일 업로드 불가** (로컬 저장소 사용 불가)

## 🎯 프로덕션 준비 (데이터 저장 가능)

### 옵션 1: Supabase (무료, 추천)

1. **Supabase 가입**: https://supabase.com
2. **새 프로젝트 생성**
3. **Database URL 복사**: Settings → Database → Connection string
4. **Netlify 환경 변수 추가**:
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres
   JWT_SECRET=your-random-secret-key-here-min-32-chars
   ```
5. **로컬에서 마이그레이션**:
   ```bash
   # .env.local 파일 생성
   echo "DATABASE_URL=your-supabase-url" > .env.local
   
   # Prisma 마이그레이션
   npx prisma migrate deploy
   ```
6. **Netlify 재배포**

### 옵션 2: Neon (무료, 빠름)

1. **Neon 가입**: https://neon.tech
2. **새 프로젝트 생성**
3. **Connection string 복사**
4. 위의 Supabase와 동일한 단계 진행

## 📁 파일 업로드 설정 (선택)

### Cloudinary (무료, 간단)

1. **Cloudinary 가입**: https://cloudinary.com
2. **API 키 복사**: Dashboard → API Keys
3. **Netlify 환경 변수 추가**:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

## 🔍 문제 해결

### 관리자 페이지 404
- netlify.toml 파일이 프로젝트 루트에 있는지 확인
- Git에 커밋 후 푸시
- Netlify 재배포

### 빌드 실패
Netlify 빌드 로그 확인:
1. Deploys → 최신 배포 클릭
2. Deploy log 확인
3. 에러 메시지 확인

### 데이터 저장 안됨
- `DEV_LOGIN=true`는 읽기 전용
- 데이터베이스 연결 필요 (위의 Supabase/Neon 가이드 참조)

## 📋 체크리스트

현재 상태 확인:
- [ ] Netlify 환경 변수 설정 완료
- [ ] 재배포 완료
- [ ] 관리자 페이지 접속 가능
- [ ] 데이터베이스 연결 (저장 기능 필요 시)
- [ ] 파일 업로드 스토리지 설정 (업로드 필요 시)

## 🚀 다음 단계

1. **지금 당장**: 환경 변수만 설정 → 관리자 페이지 접근 가능
2. **이번 주**: 데이터베이스 연결 → 콘텐츠 저장 가능
3. **나중에**: 파일 스토리지 설정 → 파일 업로드 가능

## 💡 팁

- 로컬 개발: `npm run dev` (파일 기반)
- Netlify 배포: 데이터베이스 사용 권장
- 환경 변수 변경 후 항상 재배포 필요

## 📞 도움이 필요하면

1. Netlify 빌드 로그 확인
2. 브라우저 콘솔 에러 확인 (F12)
3. 환경 변수 설정 재확인
