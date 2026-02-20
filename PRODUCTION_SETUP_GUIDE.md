# 🚀 프로덕션 환경 설정 가이드

Netlify에서 완전한 기능을 사용하려면 데이터베이스와 파일 스토리지를 연결해야 합니다.

---

## 📦 필요한 서비스

### 1. 데이터베이스 (필수)
- **Supabase** (추천, 무료) - PostgreSQL
- 또는 **Neon** (무료) - PostgreSQL
- 또는 **PlanetScale** (무료) - MySQL

### 2. 파일 스토리지 (필수)
- **AWS S3** (유료, 저렴)
- 또는 **Cloudflare R2** (무료 10GB)
- 또는 **Cloudinary** (무료 25GB)

---

## 🗄️ 옵션 1: Supabase + Cloudflare R2 (추천, 가장 쉬움)

### 장점
- ✅ 둘 다 무료 플랜 제공
- ✅ 설정이 간단
- ✅ 한국 리전 지원 (Supabase)

### A. Supabase 데이터베이스 설정

#### 1단계: Supabase 가입
1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인

#### 2단계: 새 프로젝트 생성
1. "New Project" 클릭
2. 정보 입력:
   ```
   Name: vibebox
   Database Password: [강력한 비밀번호 생성]
   Region: Northeast Asia (Seoul)
   ```
3. "Create new project" 클릭 (1-2분 소요)

#### 3단계: Database URL 복사
1. 좌측 메뉴에서 **Settings** 클릭
2. **Database** 클릭
3. **Connection string** 섹션에서 **URI** 탭 선택
4. 전체 URL 복사:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
   ```

#### 4단계: Netlify 환경 변수 추가
1. https://app.netlify.com → 1vibebox
2. Site configuration → Environment variables
3. 변수 추가:
   ```
   Key: DATABASE_URL
   Value: [복사한 Supabase URL]
   ```

### B. Cloudflare R2 파일 스토리지 설정

#### 1단계: Cloudflare 가입
1. https://dash.cloudflare.com 접속
2. 계정 생성 (무료)

#### 2단계: R2 버킷 생성
1. 좌측 메뉴에서 **R2** 클릭
2. "Create bucket" 클릭
3. 버킷 이름 입력: `vibebox-uploads`
4. Location: Automatic
5. "Create bucket" 클릭

#### 3단계: API 토큰 생성
1. R2 페이지에서 **Manage R2 API Tokens** 클릭
2. "Create API token" 클릭
3. 정보 입력:
   ```
   Token name: vibebox-token
   Permissions: Object Read & Write
   ```
4. "Create API Token" 클릭
5. 다음 정보 복사 (한 번만 표시됨!):
   ```
   Access Key ID: [복사]
   Secret Access Key: [복사]
   Endpoint: [복사] (예: https://[account-id].r2.cloudflarestorage.com)
   ```

#### 4단계: Netlify 환경 변수 추가
```
Key: AWS_REGION
Value: auto

Key: AWS_ACCESS_KEY_ID
Value: [R2 Access Key ID]

Key: AWS_SECRET_ACCESS_KEY
Value: [R2 Secret Access Key]

Key: S3_BUCKET
Value: vibebox-uploads

Key: S3_ENDPOINT
Value: [R2 Endpoint URL]

Key: CDN_BASE_URL
Value: https://[account-id].r2.cloudflarestorage.com/vibebox-uploads
```

---

## 🗄️ 옵션 2: Supabase + AWS S3 (전통적)

### A. Supabase 설정
위의 "옵션 1 - A" 참고

### B. AWS S3 설정

#### 1단계: AWS 계정 생성
1. https://aws.amazon.com 접속
2. "Create an AWS Account" 클릭
3. 신용카드 등록 필요 (무료 티어 사용 가능)

#### 2단계: S3 버킷 생성
1. AWS Console → S3 서비스
2. "Create bucket" 클릭
3. 정보 입력:
   ```
   Bucket name: vibebox-uploads-[랜덤숫자]
   Region: Asia Pacific (Seoul) ap-northeast-2
   Block Public Access: 체크 해제 (공개 읽기 허용)
   ```
4. "Create bucket" 클릭

#### 3단계: CORS 설정
1. 생성한 버킷 클릭
2. **Permissions** 탭
3. **CORS** 섹션에서 Edit 클릭
4. 다음 입력:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://1vibebox.netlify.app"],
    "ExposeHeaders": ["ETag"]
  }
]
```

#### 4단계: IAM 사용자 생성
1. AWS Console → IAM 서비스
2. Users → Add users
3. 정보 입력:
   ```
   User name: vibebox-s3-user
   Access type: Programmatic access
   ```
4. Permissions: "Attach existing policies directly"
5. 정책 선택: `AmazonS3FullAccess`
6. Create user
7. **Access key ID**와 **Secret access key** 복사 (한 번만 표시!)

#### 5단계: Netlify 환경 변수 추가
```
Key: AWS_REGION
Value: ap-northeast-2

Key: AWS_ACCESS_KEY_ID
Value: [IAM Access Key ID]

Key: AWS_SECRET_ACCESS_KEY
Value: [IAM Secret Access Key]

Key: S3_BUCKET
Value: vibebox-uploads-[랜덤숫자]

Key: CDN_BASE_URL
Value: https://vibebox-uploads-[랜덤숫자].s3.ap-northeast-2.amazonaws.com
```

---

## 🗄️ 옵션 3: Neon + Cloudinary (가장 간단)

### A. Neon 데이터베이스 설정

#### 1단계: Neon 가입
1. https://neon.tech 접속
2. GitHub 계정으로 로그인

#### 2단계: 프로젝트 생성
1. "Create a project" 클릭
2. 정보 입력:
   ```
   Project name: vibebox
   Region: AWS Asia Pacific (Singapore)
   ```
3. "Create project" 클릭

#### 3단계: Connection String 복사
1. Dashboard에서 **Connection Details** 확인
2. **Connection string** 복사:
   ```
   postgresql://[user]:[password]@[host]/[database]?sslmode=require
   ```

#### 4단계: Netlify 환경 변수 추가
```
Key: DATABASE_URL
Value: [복사한 Neon URL]
```

### B. Cloudinary 이미지 호스팅 설정

#### 1단계: Cloudinary 가입
1. https://cloudinary.com 접속
2. "Sign Up for Free" 클릭

#### 2단계: 대시보드에서 정보 확인
1. Dashboard → Account Details
2. 다음 정보 복사:
   ```
   Cloud name: [복사]
   API Key: [복사]
   API Secret: [복사]
   ```

#### 3단계: Netlify 환경 변수 추가
```
Key: CLOUDINARY_CLOUD_NAME
Value: [Cloud name]

Key: CLOUDINARY_API_KEY
Value: [API Key]

Key: CLOUDINARY_API_SECRET
Value: [API Secret]
```

---

## ⚙️ 공통 설정

### 1. DEV 모드 비활성화

Netlify 환경 변수에서:
```
DEV_LOGIN = false (또는 삭제)
DEV_EVAL = false (또는 삭제)
```

### 2. JWT Secret 설정

강력한 랜덤 문자열 생성:
```bash
# 로컬에서 실행
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Netlify 환경 변수 추가:
```
Key: JWT_SECRET
Value: [생성된 랜덤 문자열]
```

### 3. 데이터베이스 마이그레이션

로컬에서 실행:
```bash
# .env.local 파일에 DATABASE_URL 추가
echo "DATABASE_URL=your-database-url" >> .env.local

# Prisma 마이그레이션 실행
npx prisma migrate deploy

# 관리자 계정 생성
npx prisma db seed
```

### 4. Netlify 재배포

환경 변수 추가 후:
1. Deploys 탭
2. Trigger deploy → Deploy site
3. 빌드 완료 대기

---

## ✅ 설정 완료 확인

### 테스트 체크리스트

- [ ] https://1vibebox.netlify.app/login 접속
- [ ] 로그인 성공 (이메일/비밀번호)
- [ ] 관리자 페이지 접근
- [ ] 새 콘텐츠 작성 가능
- [ ] 파일 업로드 가능
- [ ] 이미지가 정상적으로 표시됨

---

## 💰 비용 예상

### 옵션 1: Supabase + Cloudflare R2
- Supabase: 무료 (500MB DB, 1GB 전송)
- Cloudflare R2: 무료 (10GB 저장, 무제한 전송)
- **총 비용: $0/월**

### 옵션 2: Supabase + AWS S3
- Supabase: 무료
- AWS S3: ~$0.50/월 (10GB 저장, 100GB 전송)
- **총 비용: ~$0.50/월**

### 옵션 3: Neon + Cloudinary
- Neon: 무료 (3GB 저장)
- Cloudinary: 무료 (25GB 저장, 25GB 전송)
- **총 비용: $0/월**

---

## 🆘 도움이 필요하면

각 단계에서 막히면:
1. 스크린샷 찍기
2. 에러 메시지 복사
3. 어느 단계에서 막혔는지 알려주기

---

## 📝 추천 순서

**가장 쉬운 순서:**
1. **Neon + Cloudinary** (옵션 3) - 신용카드 불필요
2. **Supabase + Cloudflare R2** (옵션 1) - 신용카드 불필요
3. **Supabase + AWS S3** (옵션 2) - AWS 신용카드 필요

**어떤 옵션을 선택하시겠어요?**
