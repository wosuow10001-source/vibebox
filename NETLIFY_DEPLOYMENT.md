# Netlify 배포 가이드

## 문제점
Netlify에 배포 후 관리자 페이지가 작동하지 않는 이유:

1. **파일 시스템 접근 불가**: Netlify는 서버리스 환경으로 `data/contents.json` 같은 파일을 읽고 쓸 수 없음
2. **환경 변수 미설정**: `DEV_LOGIN=true` 등의 환경 변수가 설정되지 않음
3. **데이터베이스 필요**: 프로덕션 환경에서는 파일 대신 데이터베이스 사용 필요

## 해결 방법

### 방법 1: 환경 변수 설정 (임시 해결)

Netlify 대시보드에서 환경 변수 설정:

1. Netlify 사이트 → Site settings → Environment variables
2. 다음 변수 추가:

```
DEV_LOGIN=true
DEV_EVAL=true
NEXT_PUBLIC_BASE_URL=https://1vibebox.netlify.app
```

3. 재배포

**주의**: 이 방법은 파일 시스템을 사용하므로 데이터가 저장되지 않습니다.

### 방법 2: 데이터베이스 연결 (권장)

#### 2.1 무료 PostgreSQL 데이터베이스 생성

**Supabase (추천)**:
1. https://supabase.com 가입
2. 새 프로젝트 생성
3. Database URL 복사

**Neon (추천)**:
1. https://neon.tech 가입
2. 새 프로젝트 생성
3. Connection string 복사

#### 2.2 Netlify 환경 변수 설정

```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-secure-random-string-here
NEXT_PUBLIC_BASE_URL=https://1vibebox.netlify.app
```

#### 2.3 Prisma 마이그레이션 실행

로컬에서:
```bash
# .env.local 파일에 DATABASE_URL 추가
echo "DATABASE_URL=your-database-url" > .env.local

# 마이그레이션 실행
npx prisma migrate deploy

# 초기 데이터 생성 (선택)
npx prisma db seed
```

### 방법 3: Netlify Functions + KV Storage (고급)

Netlify KV를 사용하여 데이터 저장:

1. Netlify Blobs 활성화
2. API 라우트를 Netlify Functions로 변환
3. 파일 대신 KV에 데이터 저장

## 빠른 테스트 (데이터베이스 없이)

### netlify.toml 생성

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  DEV_LOGIN = "true"
  DEV_EVAL = "true"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 권장 배포 구조

```
로컬 개발: 파일 기반 (data/*.json)
  ↓
Netlify 배포: 데이터베이스 (PostgreSQL)
  ↓
파일 업로드: AWS S3 또는 Cloudinary
```

## 체크리스트

- [ ] 환경 변수 설정 (Netlify Dashboard)
- [ ] 데이터베이스 연결 (Supabase/Neon)
- [ ] Prisma 마이그레이션 실행
- [ ] 파일 업로드 스토리지 설정 (S3/Cloudinary)
- [ ] 빌드 성공 확인
- [ ] 관리자 로그인 테스트
- [ ] 콘텐츠 생성 테스트

## 문제 해결

### 관리자 페이지 404
- `netlify.toml`에 리다이렉트 규칙 추가
- 빌드 로그 확인

### 데이터 저장 안됨
- 데이터베이스 연결 확인
- 환경 변수 확인
- Prisma 마이그레이션 실행 확인

### 파일 업로드 실패
- S3 또는 Cloudinary 설정 필요
- 로컬 파일 시스템은 Netlify에서 작동하지 않음

## 다음 단계

1. **즉시 테스트**: 환경 변수만 설정 (데이터 저장 안됨)
2. **프로덕션 준비**: 데이터베이스 + S3 설정
3. **최적화**: CDN, 이미지 최적화, 캐싱

## 참고 링크

- Netlify 환경 변수: https://docs.netlify.com/environment-variables/overview/
- Supabase: https://supabase.com/docs
- Neon: https://neon.tech/docs
- Prisma: https://www.prisma.io/docs
