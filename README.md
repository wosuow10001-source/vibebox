# 🚀 Vibebox - 콘텐츠 플랫폼 CMS

> Next.js 기반 관리자 CMS + 공개 포털 + 수익화 슬롯 시스템

## 📋 설치 및 설정

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음을 입력하세요:

```bash
# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/vibebox_db"

# JWT
JWT_SECRET="your-super-secret-key-must-be-at-least-32-characters-long-12345"

# AWS S3
AWS_REGION="ap-northeast-2"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
S3_BUCKET="your-bucket"

# CDN
CDN_BASE_URL="https://cdn.yourdomain.com"

# 공개 URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# 관리자 초기 계정
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="strong-initial-password-123"
```

### 개발 모드 설정 (중요)

- `DEV_LOGIN`:
	- 개발 중 데이터베이스가 준비되지 않았을 때 편의를 위해 임시 로그인 흐름을 허용합니다. 반드시 로컬 개발 전용으로만 사용하세요.
- `DEV_EVAL`:
	- 일부 개발용 빌드/툴(webpack/next)이 `eval()` 또는 `new Function()`을 사용하는 경우 브라우저 개발자 도구의 스택트레이스와 소스맵을 위해 `unsafe-eval`을 일시적으로 CSP에 허용해야 할 수 있습니다.
	- `next.config.ts`에는 `NODE_ENV !== 'production' || DEV_EVAL === 'true'` 조건일 때만 `script-src`에 `'unsafe-eval'`이 추가되도록 되어 있습니다. 운영 환경에서는 절대 `DEV_EVAL=true`를 설정하지 마세요.

안전 권고:
- 운영(Production)에서는 `JWT_SECRET`을 안전한 비밀값으로 설정하고, `DEV_LOGIN`과 `DEV_EVAL`은 비활성화하세요.
- 가능하면 개발 중에도 `DEV_EVAL`을 `false`로 유지하고, 개발자 도구 관련 문제는 `devtool` 설정 조정으로 해결하세요.

예시 파일: 프로젝트 루트의 `.env.example`를 참고해 `.env.local`을 만드세요.

### 2. 의존성 설치

```bash
npm install
```

### 3. 데이터베이스 마이그레이션

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. 개발 서버 시작

```bash
npm run dev
```

- **공개 사이트**: http://localhost:3000
- **관리자 페이지**: http://localhost:3000/admin
- **로그인**: admin@example.com / strong-initial-password-123

---

## 🏗️ 폴더 구조

```
app/
├── (public)/           # 공개 라우트
│   ├── page.tsx        # / 메인
│   ├── p/[slug]        # /p/[slug] 게시글
│   ├── a/[slug]        # /a/[slug] HTML 앱
│   ├── tag/[tag]       # /tag/[tag] 태그별
├── admin/              # 관리자 라우트 (보호됨)
│   ├── content/        # 콘텐츠 관리
│   ├── monetization/   # 수익화 슬롯
│   ├── site-settings/  # 사이트 설정
├── api/
│   ├── admin/          # 관리자 API
│   ├── public/         # 공개 API
│   ├── track/          # 트래킹 API
└── ...

components/
├── public/
│   ├── SlotRenderer.tsx      # 수익화 슬롯 렌더러
│   ├── SiteRenderer.tsx      # 메인 페이지 렌더러
│   ├── slots/
│   │   ├── AdSenseSlot.tsx
│   │   ├── BannerImageSlot.tsx
│   │   ├── CouponCardSlot.tsx
│   │   └── ...

lib/
├── auth.ts            # 인증
├── storage.ts         # S3/GCS
├── seo.ts             # SEO 헬퍼
└── slot-filter.ts     # 슬롯 필터링

prisma/
├── schema.prisma      # DB 스키마
└── seed.ts            # 초기 데이터
```

---

## 🔐 주요 기능

### 관리자 기능

- ✅ 콘텐츠 CRUD (게시글, 앱, 프로젝트, 이미지, 영상, 링크)
- ✅ 파일 업로드 (Presigned URL 기반 S3/GCS)
- ✅ 태그 관리
- ✅ 사이트 설정 (색상, 로고, 메뉴, 후원 버튼)
- ✅ 수익화 슬롯 (광고, 배너, 쿠폰, 어필리에이트, 텍스트 링크)

### 공개 기능

- ✅ 로그인 없는 콘텐츠 열람
- ✅ 정적 HTML 앱 (iframe sandbox)
- ✅ 태그 기반 필터링
- ✅ SEO 최적화 (sitemap.xml, robots.txt, JSON-LD)

### 수익화

- ✅ 6가지 슬롯 타입 (AdSense, 배너, 쿠폰, 어필리에이트, 텍스트, 네이티브)
- ✅ 배치 관리 (10개 표준 위치)
- ✅ 타게팅 (기기, 페이지, 태그, 날짜)
- ✅ 클릭 트래킹
- ✅ 컴플라이언스 고지 (sponsored 레이블)

---

## 📝 API 엔드포인트

### 관리자 인증

```bash
POST /api/admin/login
POST /api/admin/logout
```

### 콘텐츠

```bash
GET    /api/admin/content              # 목록
POST   /api/admin/content              # 생성
PUT    /api/admin/content/[id]         # 수정
DELETE /api/admin/content/[id]         # 삭제
```

### 파일

```bash
POST /api/admin/assets/presign         # Presigned URL 발급
```

### 수익화

```bash
GET    /api/admin/monetization         # 모든 슬롯
POST   /api/admin/monetization         # 슬롯 생성
PUT    /api/admin/monetization/[id]    # 수정
DELETE /api/admin/monetization/[id]    # 삭제
```

### 공개

```bash
GET /api/public/slots?placement=...    # 슬롯 조회
GET /api/public/contents?tag=...       # 콘텐츠 조회
POST /api/track/click                  # 클릭 트래킹
```

### SEO

```bash
GET /robots.txt                        # 크롤러 규칙
GET /sitemap.xml                       # 사이트맵
```

---

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Storage**: AWS S3 / Google Cloud Storage
- **Auth**: JWT + httpOnly Cookies
- **Deployment**: Vercel + CloudFront / Cloud CDN

---

## 🔒 보안

- ✅ 관리자 라우트 미들웨어 보호
- ✅ HTML 앱 iframe sandbox
- ✅ MIME 타입 화이트리스트
- ✅ Presigned URL (5분 만료)
- ✅ CSP 헤더
- ✅ robots.txt disallow /admin
- ✅ 비공개 콘텐츠 접근 제한

---

## 📦 배포 (Vercel)

```bash
# 1. GitHub에 업로드
git push origin main

# 2. Vercel에서 new project 생성
# → 환경 변수 설정
# → 데이터베이스 연결 (예: AWS RDS)

# 3. 배포
vercel --prod
```

---

## 🚀 다음 단계

1. **데이터베이스 설정**: PostgreSQL DB 생성 & 마이그레이션
2. **S3 버킷**: AWS S3 버킷 + IAM 권한 설정
3. **CDN**: CloudFront 배포 설정
4. **관리자 계정**: 초기 관리자 가입
5. **콘텐츠 작성**: 게시글 및 앱 업로드
6. **공개**: 도메인 연결 후 운영 시작

---

## 📚 추가 기능 (향후)

- [ ] 다국어 지원
- [ ] 테마 커스터마이징
- [ ] 광고 네트워크 통계
- [ ] A/B 테스트
- [ ] 이메일 알림
- [ ] 사용자 댓글
- [ ] 구글 애널리틱스 통합

---

문의: support@vibebox.com
