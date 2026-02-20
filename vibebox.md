<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# 너는 시니어 풀스택 엔지니어이자 제품 설계자다. 아래 요구사항을 만족하는 웹 플랫폼을 MVP부터 운영 가능한 수준으로 설계하고 구현 계획 + 핵심 코드 골격을 만들어라.

0) 목표 요약
관리자가 관리자 페이지에서 “앱(HTML로 동작), 프로그램/프로젝트 폴더, 게임, 이미지, 영상, 게시글”을 업로드/게시하면 메인 사이트에서 사용자가 로그인 없이 바로 열람/사용할 수 있어야 한다.
관리자 페이지는 일반 사용자에게 노출되면 안 된다(검색엔진/AI 크롤러에도 노출 최소화).
관리자 페이지에서 메인 페이지의 디자인을 편집할 수 있어야 한다: 색상, 이미지, 메뉴(추가/삭제), 옵션(추가/삭제), 버튼(추가/삭제), 배경, 제목, 텍스트, 우측 상단 “커피값 후원” 버튼의 추가/삭제/변경.
메인에 게시된 콘텐츠(게시글/앱/프로그램 등)가 구글 및 AI 검색에 빠르게 노출되도록 SEO를 기본 내장하고, “태그”로도 쉽게 노출/분류되게 한다.
관리자가 업로드한 파일은 안전하게 저장되며, 공개 콘텐츠만 사용자에게 제공되어야 한다(업로드는 관리자만 가능).
1) 기술 스택(권장)
Front/Server: Next.js(App Router) + TypeScript
DB: PostgreSQL (Prisma ORM)
파일 저장소: S3 또는 GCS + CDN(CloudFront/Cloud CDN)
업로드 방식: “서버가 검증 후” 저장소 Signed URL / Pre-signed URL 발급 → 클라이언트가 저장소로 직접 업로드
인증: 관리자만 로그인(예: NextAuth 또는 자체 세션/JWT), 일반 사용자는 비로그인
SEO: sitemap.xml, robots.txt, 메타태그, 구조화데이터(JSON-LD)
2) 핵심 기능 요구사항
2.1 공개 메인(로그인 없음)
URL 구조:
/ : 메인(관리자가 구성한 섹션/메뉴/버튼/배경/텍스트 렌더)
/p/[slug] : 게시글/페이지
/a/[slug] : HTML 앱(샌드박스/iframe)
/asset/[id] : 다운로드/뷰(권한 정책 적용)
/tag/[tag] : 태그별 목록
콘텐츠 타입: post, html_app, project, game, image, video, link
각 콘텐츠는 title, slug, description, body, coverImage, tags[], status(draft/published), publishedAt, updatedAt 등을 가진다.
메인에서 “로그인 없이” 실행 가능한 HTML 앱:
업로드된 HTML을 그대로 호스팅하지 말고(보안 위험), 안전 정책:
가능하면 정적 파일(HTML/CSS/JS)을 “패키지(zip)”로 업로드 → 서버에서 검사(확장자/엔트리포인트/index.html) → 전용 경로로 배포
iframe + sandbox 옵션 적용(가능한 제한)
영상/이미지: 저장소에 올리고 공개 페이지는 CDN URL로 제공.
2.2 관리자 페이지(비노출)
관리자 UI 경로 예: /admin
강제 접근제어: 로그인 안 하면 401/리다이렉트
검색엔진/AI에 노출 방지:
robots.txt에서 /admin disallow 규칙 포함​
/admin 페이지에 noindex, nofollow 메타 적용
사이트맵(sitemap.xml)에 /admin 절대 포함하지 않기​
관리자 기능:
콘텐츠 CRUD (업로드/수정/삭제/발행/임시저장)
파일 업로드(이미지/영상/zip/기타) + 미리보기 + 용량 제한 + MIME 제한
태그 관리(추가/삭제/자동완성)
메인 페이지 빌더:
컬러 테마(primary/secondary/bg/text)
배경(색/이미지/그라데이션)
헤더/로고 이미지
메뉴 항목 리스트(추가/삭제, label + url)
옵션 리스트(추가/삭제, label + value)
버튼 리스트(추가/삭제, label + action(url/scroll/팝업))
우측 상단 “커피값 후원” 버튼(ON/OFF, label, link URL, 색상)
3) SEO / 빠른 노출 요건
발행(published)된 공개 콘텐츠만 인덱싱 대상
자동 sitemap.xml 생성(게시글/앱/태그/메인 등) + lastmod 포함​
robots.txt 제공(공개는 allow, admin은 disallow, sitemap 위치 명시)​
각 상세 페이지에:
고유한 title/description/og tags
canonical URL
구조화 데이터(JSON-LD):
게시글: Article 또는 BlogPosting
HTML 앱/프로그램 소개 페이지: WebApplication(또는 SoftwareApplication)
영상 페이지: VideoObject(제목/설명/썸네일/업로드일/재생 URL 등)
태그 페이지(/tag/[tag])도 색인 허용, 내부링크로 잘 연결(크롤링 경로 확보)
4) 보안 요건(필수)
업로드는 관리자만 가능
파일 접근 정책:
공개 콘텐츠에 첨부된 파일은 공개 URL 또는 제한적 signed URL로 제공
비공개(draft) 파일은 외부에서 접근 불가
Signed URL/Pre-signed URL 기반 업로드:
서버가 파일명/확장자/MIME/크기 제한 검증 후 “시간 제한된 업로드 URL” 발급
HTML 앱 실행 보안:
iframe sandbox 적용
업로드 zip은 화이트리스트 확장자만 허용
가능하면 CSP(Content-Security-Policy) 헤더 제공
5) 데이터 모델(Prisma 예시 스키마로 작성)
User(Admin)
SiteSettings(테마/메뉴/버튼/후원버튼 등 JSON)
Content(타입, slug, status, seo fields, tags relation)
Tag
Asset(파일 메타: storageKey, mime, size, publicFlag, linkedContentId)
6) 산출물(너의 출력 형식)
폴더 구조 제안(Next.js App Router 기준)
DB 스키마(Prisma)
핵심 API 라우트 설계:
POST /api/admin/login
POST /api/admin/assets/presign (업로드 URL 발급)
POST /api/admin/content / PUT / DELETE
POST /api/admin/site-settings
GET /sitemap.xml
GET /robots.txt
관리자 페이지 UI 주요 컴포넌트 목록
메인 렌더링 방식(사이트 설정 JSON 기반 섹션 렌더)
SEO 구현 코드 골격(robots/sitemap/메타/JSON-LD)
보안 체크리스트(취약점 포인트 포함)
“MVP 7일 구현 플랜” (일자별 작업)
7) 추가 제약
한국어 UI 기본
배포는 Vercel + (S3/GCS) 조합 또는 자체 서버 둘 다 가능하도록 추상화
가능한 한 라이브러리 의존은 과하지 않게, 대신 확장 가능하게 설계
이제 위 요구사항에 맞춰 구체적인 설계와 코드 골격을 작성해라. 2.3 수익화(광고/쿠폰/어필리에이트) 슬롯 시스템
목표: 메인 페이지 및 콘텐츠 상세 페이지에 “빈 공간”을 임의로 남기지 말고, 모든 여백/구획을 수익화 슬롯(Ad Slots) 으로 구성 가능하게 설계한다(단, UX를 해치지 않도록 콘텐츠 우선).
슬롯은 “관리자에서 ON/OFF, 위치, 타입, 우선순위, 기간, 노출 조건”을 설정할 수 있어야 한다.
슬롯 타입(최소 지원)
adsense(또는 광고 네트워크): 광고 유닛 ID/스크립트 키/포맷(반응형) 저장, 특정 영역에만 렌더링(자동광고가 아닌 “수동 슬롯” 우선).​
banner_image: 이미지 업로드 + 클릭 URL + 새창 여부 + UTM 자동추가 옵션
coupon_card: 쿠폰 제목/설명/코드/만료일/CTA 링크 + 카테고리/태그
affiliate_product: 상품명/가격(선택)/혜택 문구/이미지/구매 링크(어필리에이트) + 우선순위
text_link: 짧은 문구 + 링크(리스트 형태)
native_card: “추천/프로모션” 카드(게시글처럼 보이되 라벨 명확)
슬롯 위치(Placement) 표준화
메인 페이지 기본 배치 포인트(예시):
HOME_TOP (상단 폴드 근처 1개)
HOME_HERO_RIGHT (히어로 옆)
HOME_BELOW_MENU (메뉴 아래)
HOME_BETWEEN_SECTIONS (섹션 사이 반복 가능)
HOME_SIDEBAR_STICKY (데스크톱 스티키)
HOME_FOOTER (푸터 상단)
상세 페이지 배치 포인트:
DETAIL_TOP, DETAIL_MID, DETAIL_BOTTOM, DETAIL_SIDEBAR
각 placement는 “슬롯 여러 개”를 가질 수 있고, priority로 정렬하여 순서대로 렌더링한다.
노출 조건(Targeting)
디바이스: mobile/desktop/all
페이지: 홈만/특정 콘텐츠 타입만/특정 태그 포함 시만
일정: startAt, endAt
빈도 제한(선택): 세션당 1회, 하루 1회 등(쿠폰/배너에 유용)
2.4 관리자 기능(수익화 편집기)
관리자 페이지에 “수익화(Monetization)” 메뉴 추가:
슬롯 CRUD(추가/삭제/변경)
placement별 미리보기(메인 미리보기에서 슬롯 위치 확인)
드래그 앤 드롭으로 priority 변경
A/B 테스트(선택): 동일 placement에 2개 크리에이티브를 번갈아 노출(가중치)
슬롯별 통계(가능하면 MVP+):
노출/클릭/CTR(최소 배너/쿠폰/어필리에이트 링크는 자체 추적 가능)
광고 네트워크(AdSense)는 자체 리포트가 있으니, 내부에선 “slot render count” 정도만 기록
3.1 법/정책/컴플라이언스(필수)
어필리에이트 링크가 포함된 영역에는 “제휴 링크/광고 고지”를 눈에 잘 띄게, 링크 근처에, 쉬운 문장으로 표시하도록 시스템화한다(슬롯 속성 disclosureText, showDisclosure=true).
광고는 콘텐츠를 압도하지 않도록(과밀 배치 금지), 상단/본문의 균형을 지키는 기본 레이아웃 가드를 둔다(예: HOME_TOP 1개 + 섹션 사이 N개 제한).
8) 데이터 모델 확장(Prisma에 추가)
AdSlot(또는 MonetizationSlot) 테이블 추가:
id, type, placement, priority, status, startAt, endAt
deviceTarget, pageTarget, tagTarget
payloadJson(타입별 설정: adsense unit id, banner url, coupon data, affiliate url 등)
disclosureText, showDisclosure
ClickEvent(선택): slotId, url, ts, pagePath, referrer, userAgentHash
9) 산출물 추가(너의 출력에 포함)
“슬롯 렌더러” 컴포넌트 설계:
<SlotRenderer placement="HOME_TOP" context={...} /> 형태
서버에서 슬롯 목록을 가져와 조건 필터링 후 렌더
Next.js 라우트 전환 시 광고 슬롯 갱신 이슈가 생길 수 있으니(특히 스크립트형 광고), 라우트 변경 때 슬롯 초기화/재로드 전략을 제시하라. 그리고 바로 실행하고 수익화 시킬 수 있도록 개발해줘.

이제 전체 설계 문서와 코드 골격을 작성합니다. 매우 방대한 요구사항이므로 체계적으로 구성합니다.

***

# 🏗️ 풀스택 콘텐츠 플랫폼 설계 \& 구현 계획

> **Next.js 15 App Router + PostgreSQL(Prisma) + S3/GCS + Vercel** 기반, 관리자 전용 CMS + 공개 콘텐츠 포털 + 수익화 슬롯 시스템

***

## 📁 1. 폴더 구조

```
my-platform/
├── app/
│   ├── (public)/                    # 공개 라우트 그룹
│   │   ├── page.tsx                 # / 메인
│   │   ├── p/[slug]/page.tsx        # /p/[slug] 게시글
│   │   ├── a/[slug]/page.tsx        # /a/[slug] HTML 앱
│   │   ├── asset/[id]/route.ts      # /asset/[id] 파일 다운로드
│   │   ├── tag/[tag]/page.tsx       # /tag/[tag] 태그 목록
│   │   └── layout.tsx               # 공개 공통 레이아웃
│   │
│   ├── admin/                       # 관리자 라우트 (보호됨)
│   │   ├── layout.tsx               # 관리자 레이아웃 (noindex)
│   │   ├── page.tsx                 # 대시보드
│   │   ├── login/page.tsx
│   │   ├── content/
│   │   │   ├── page.tsx             # 콘텐츠 목록
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── site-settings/page.tsx   # 페이지 빌더
│   │   ├── monetization/            # 수익화 슬롯 관리
│   │   │   ├── page.tsx
│   │   │   └── [slotId]/page.tsx
│   │   └── assets/page.tsx
│   │
│   ├── api/
│   │   ├── admin/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── content/
│   │   │   │   ├── route.ts         # GET(목록) / POST(생성)
│   │   │   │   └── [id]/route.ts    # GET / PUT / DELETE
│   │   │   ├── assets/
│   │   │   │   ├── presign/route.ts # Presigned URL 발급
│   │   │   │   └── [id]/route.ts
│   │   │   ├── site-settings/route.ts
│   │   │   └── monetization/
│   │   │       ├── route.ts
│   │   │       └── [slotId]/route.ts
│   │   ├── public/
│   │   │   ├── contents/route.ts    # 공개 콘텐츠 조회
│   │   │   └── slots/route.ts       # 슬롯 조회(공개 필터링)
│   │   └── track/
│   │       └── click/route.ts       # 클릭 트래킹
│   │
│   ├── sitemap.ts                   # 자동 sitemap.xml
│   ├── robots.ts                    # robots.txt
│   └── layout.tsx                   # 루트 레이아웃
│
├── components/
│   ├── public/
│   │   ├── SiteRenderer.tsx         # 사이트 설정 JSON 렌더러
│   │   ├── SlotRenderer.tsx         # 수익화 슬롯 렌더러
│   │   ├── slots/
│   │   │   ├── AdSenseSlot.tsx
│   │   │   ├── BannerImageSlot.tsx
│   │   │   ├── CouponCardSlot.tsx
│   │   │   ├── AffiliateProductSlot.tsx
│   │   │   ├── TextLinkSlot.tsx
│   │   │   └── NativeCardSlot.tsx
│   │   ├── HtmlAppViewer.tsx        # iframe sandbox 렌더러
│   │   ├── JsonLd.tsx               # 구조화 데이터
│   │   └── DonateButton.tsx         # 커피값 후원 버튼
│   ├── admin/
│   │   ├── ContentEditor.tsx
│   │   ├── PageBuilder.tsx
│   │   ├── SlotEditor.tsx
│   │   ├── FileUploader.tsx
│   │   └── TagInput.tsx
│   └── ui/                          # shadcn/ui 기반 공통 컴포넌트
│
├── lib/
│   ├── auth.ts                      # 세션/JWT 유틸
│   ├── storage.ts                   # S3/GCS 추상화
│   ├── prisma.ts                    # Prisma 클라이언트
│   ├── seo.ts                       # 메타태그 생성 헬퍼
│   └── slot-filter.ts               # 슬롯 조건 필터링
│
├── prisma/
│   └── schema.prisma
├── middleware.ts                    # 관리자 라우트 보호
├── next.config.ts
└── .env.local
```


***

## 🗄️ 2. Prisma 스키마 (전체)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── 관리자 계정 ───────────────────────────────────────
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  role         Role     @default(ADMIN)
  createdAt    DateTime @default(now())
}

enum Role {
  ADMIN
  SUPER_ADMIN
}

// ─── 사이트 설정 (페이지 빌더) ──────────────────────────
model SiteSettings {
  id        String   @id @default("singleton")
  // 테마
  colorPrimary   String  @default("#6366f1")
  colorSecondary String  @default("#8b5cf6")
  colorBg        String  @default("#ffffff")
  colorText      String  @default("#111827")
  // 배경
  bgType         String  @default("color") // color | image | gradient
  bgValue        String  @default("#ffffff")
  // 헤더
  siteTitle      String  @default("My Platform")
  logoUrl        String?
  // 메뉴 / 버튼 / 옵션 - JSON 배열로 유연하게 관리
  menuItems      Json    @default("[]")   // [{label, url, order}]
  optionItems    Json    @default("[]")   // [{label, value}]
  buttonItems    Json    @default("[]")   // [{label, actionType, actionValue, style}]
  // 커피값 후원 버튼
  donateEnabled  Boolean @default(false)
  donateLabel    String  @default("☕ 커피값 후원")
  donateUrl      String  @default("")
  donateColor    String  @default("#f59e0b")
  // 섹션 레이아웃 (드래그 순서)
  sections       Json    @default("[]")   // [{type, contentType, limit, title}]
  updatedAt      DateTime @updatedAt
}

// ─── 콘텐츠 ────────────────────────────────────────────
model Content {
  id          String      @id @default(cuid())
  type        ContentType
  slug        String      @unique
  title       String
  description String?
  body        String?     // Markdown 또는 HTML
  coverImage  String?     // Asset.id 참조
  status      Status      @default(DRAFT)
  publishedAt DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  // SEO
  seoTitle       String?
  seoDescription String?
  seoKeywords    String?
  canonicalUrl   String?
  ogImage        String?
  // 관계
  tags    ContentTag[]
  assets  Asset[]
  @@index([status, publishedAt])
  @@index([type, status])
}

enum ContentType {
  POST
  HTML_APP
  PROJECT
  GAME
  IMAGE
  VIDEO
  LINK
}

enum Status {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Tag {
  id       String       @id @default(cuid())
  name     String       @unique
  slug     String       @unique
  contents ContentTag[]
}

model ContentTag {
  contentId String
  tagId     String
  content   Content @relation(fields: [contentId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([contentId, tagId])
}

// ─── 파일 에셋 ─────────────────────────────────────────
model Asset {
  id          String   @id @default(cuid())
  storageKey  String   @unique  // S3/GCS 키
  originalName String
  mime        String
  size        Int      // bytes
  publicFlag  Boolean  @default(false)
  cdnUrl      String?  // CDN 공개 URL
  contentId   String?
  content     Content? @relation(fields: [contentId], references: [id], onDelete: SetNull)
  createdAt   DateTime @default(now())
  @@index([contentId])
}

// ─── 수익화 슬롯 ────────────────────────────────────────
model AdSlot {
  id             String     @id @default(cuid())
  name           String
  type           SlotType
  placement      String     // HOME_TOP, DETAIL_MID 등
  priority       Int        @default(0)
  status         SlotStatus @default(ACTIVE)
  startAt        DateTime?
  endAt          DateTime?
  // 타게팅
  deviceTarget   String     @default("all")   // mobile | desktop | all
  pageTarget     String     @default("all")   // home | post | html_app | all
  tagTarget      String?    // 특정 태그 slug
  // 컨텐츠 (타입별 JSON)
  payloadJson    Json
  // 컴플라이언스
  disclosureText String?
  showDisclosure Boolean    @default(false)
  // 통계
  renderCount    Int        @default(0)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  clicks         ClickEvent[]
  @@index([placement, status, priority])
}

enum SlotType {
  ADSENSE
  BANNER_IMAGE
  COUPON_CARD
  AFFILIATE_PRODUCT
  TEXT_LINK
  NATIVE_CARD
}

enum SlotStatus {
  ACTIVE
  PAUSED
  SCHEDULED
  EXPIRED
}

// ─── 클릭 트래킹 ────────────────────────────────────────
model ClickEvent {
  id          String   @id @default(cuid())
  slotId      String
  slot        AdSlot   @relation(fields: [slotId], references: [id], onDelete: Cascade)
  url         String
  pagePath    String
  referrer    String?
  userAgentHash String?
  ts          DateTime @default(now())
  @@index([slotId, ts])
}
```


***

## 🔌 3. 핵심 API 라우트 구현

### 3.1 미들웨어 — 관리자 보호

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const token =
    req.cookies.get("admin_token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}
```


### 3.2 인증 — 로그인 API

```typescript
// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const token = await signToken({ userId: user.id, role: user.role });

  (await cookies()).set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8, // 8시간
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
```


### 3.3 인증 유틸

```typescript
// lib/auth.ts
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function signToken(payload: object) {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export const hashPassword = (pw: string) => bcrypt.hash(pw, 12);
export const comparePassword = (pw: string, hash: string) =>
  bcrypt.compare(pw, hash);
```


### 3.4 S3 Presigned URL 발급 API

```typescript
// app/api/admin/assets/presign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPresignedUploadUrl } from "@/lib/storage";
import { randomUUID } from "crypto";

// 허용 MIME 타입 화이트리스트
const ALLOWED_MIMES: Record<string, string[]> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
  video: ["video/mp4", "video/webm"],
  zip:   ["application/zip", "application/x-zip-compressed"],
  doc:   ["application/pdf", "text/plain"],
};
const ALL_ALLOWED = Object.values(ALLOWED_MIMES).flat();
const MAX_SIZE = 500 * 1024 * 1024; // 500MB

export async function POST(req: NextRequest) {
  const { fileName, mimeType, fileSize, contentType } = await req.json();

  if (!ALL_ALLOWED.includes(mimeType)) {
    return NextResponse.json({ error: "허용되지 않는 파일 형식" }, { status: 400 });
  }
  if (fileSize > MAX_SIZE) {
    return NextResponse.json({ error: "파일 크기 초과" }, { status: 400 });
  }

  const ext = fileName.split(".").pop()?.toLowerCase();
  const storageKey = `uploads/${contentType}/${randomUUID()}.${ext}`;

  const { uploadUrl, cdnUrl } = await getPresignedUploadUrl({
    key: storageKey,
    mimeType,
    expiresIn: 300, // 5분
  });

  return NextResponse.json({ uploadUrl, storageKey, cdnUrl });
}
```


### 3.5 스토리지 추상화 (S3/GCS 호환)

```typescript
// lib/storage.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const BUCKET = process.env.S3_BUCKET!;
const CDN_BASE = process.env.CDN_BASE_URL!; // https://cdn.yourdomain.com

export async function getPresignedUploadUrl({
  key, mimeType, expiresIn,
}: { key: string; mimeType: string; expiresIn: number }) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mimeType,
  });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn });
  const cdnUrl = `${CDN_BASE}/${key}`;
  return { uploadUrl, cdnUrl };
}

export async function getPresignedReadUrl(key: string, expiresIn = 3600) {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn });
}
```


### 3.6 콘텐츠 CRUD API

```typescript
// app/api/admin/content/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const [contents, total] = await prisma.$transaction([
    prisma.content.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: { tags: { include: { tag: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.content.count(),
  ]);

  return NextResponse.json({ contents, total, page });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { tags = [], ...contentData } = data;

  const content = await prisma.content.create({
    data: {
      ...contentData,
      publishedAt: contentData.status === "PUBLISHED" ? new Date() : null,
      tags: {
        create: tags.map((tagName: string) => ({
          tag: {
            connectOrCreate: {
              where: { name: tagName },
              create: {
                name: tagName,
                slug: tagName.toLowerCase().replace(/\s+/g, "-"),
              },
            },
          },
        })),
      },
    },
    include: { tags: { include: { tag: true } } },
  });

  return NextResponse.json(content, { status: 201 });
}
```

```typescript
// app/api/admin/content/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const { tags = [], ...updateData } = data;

  // 기존 태그 삭제 후 재연결
  await prisma.contentTag.deleteMany({ where: { contentId: params.id } });

  const content = await prisma.content.update({
    where: { id: params.id },
    data: {
      ...updateData,
      publishedAt:
        updateData.status === "PUBLISHED" && !updateData.publishedAt
          ? new Date()
          : updateData.publishedAt,
      tags: {
        create: tags.map((tagName: string) => ({
          tag: {
            connectOrCreate: {
              where: { name: tagName },
              create: { name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, "-") },
            },
          },
        })),
      },
    },
    include: { tags: { include: { tag: true } } },
  });

  return NextResponse.json(content);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.content.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
```


### 3.7 사이트 설정 API

```typescript
// app/api/admin/site-settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });
  return NextResponse.json(settings);
}
```


### 3.8 수익화 슬롯 CRUD

```typescript
// app/api/admin/monetization/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const slots = await prisma.adSlot.findMany({
    orderBy: [{ placement: "asc" }, { priority: "asc" }],
  });
  return NextResponse.json(slots);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const slot = await prisma.adSlot.create({ data });
  return NextResponse.json(slot, { status: 201 });
}
```

```typescript
// app/api/admin/monetization/[slotId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { slotId: string } }) {
  const data = await req.json();
  const slot = await prisma.adSlot.update({ where: { id: params.slotId }, data });
  return NextResponse.json(slot);
}

export async function DELETE(_: NextRequest, { params }: { params: { slotId: string } }) {
  await prisma.adSlot.delete({ where: { id: params.slotId } });
  return NextResponse.json({ ok: true });
}
```


### 3.9 클릭 트래킹 API

```typescript
// app/api/track/click/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

export async function POST(req: NextRequest) {
  const { slotId, url, pagePath } = await req.json();
  const ua = req.headers.get("user-agent") ?? "";
  const userAgentHash = createHash("sha256").update(ua).digest("hex").slice(0, 16);

  await prisma.clickEvent.create({
    data: { slotId, url, pagePath, referrer: req.headers.get("referer") ?? "", userAgentHash },
  });
  // renderCount 증가는 슬롯 렌더 시 별도 처리
  return NextResponse.json({ ok: true });
}
```


***

## 📄 4. SEO 구현

### 4.1 robots.ts

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_BASE_URL!;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/admin/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
```


### 4.2 sitemap.ts

```typescript
// app/sitemap.ts
import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_BASE_URL!;

  const contents = await prisma.content.findMany({
    where: { status: "PUBLISHED" },
    select: { type: true, slug: true, updatedAt: true },
  });

  const tags = await prisma.tag.findMany({
    select: { slug: true },
  });

  const contentUrls = contents.map((c) => ({
    url: `${base}/${c.type === "POST" ? "p" : "a"}/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const tagUrls = tags.map((t) => ({
    url: `${base}/tag/${t.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [
    { url: base, changeFrequency: "daily", priority: 1.0 },
    ...contentUrls,
    ...tagUrls,
  ];
}
```


### 4.3 메타태그 + JSON-LD 헬퍼

```typescript
// lib/seo.ts
import type { Metadata } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_URL!;

export function buildMetadata({
  title, description, ogImage, canonical, noIndex = false,
}: {
  title: string; description?: string; ogImage?: string;
  canonical?: string; noIndex?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: canonical ?? BASE },
    openGraph: {
      title, description, images: ogImage ? [ogImage] : [],
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

// JSON-LD 구조화 데이터
export function ArticleJsonLd({ content }: { content: any }) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: content.title,
    description: content.description,
    image: content.ogImage,
    datePublished: content.publishedAt,
    dateModified: content.updatedAt,
    url: `${BASE}/p/${content.slug}`,
  };
}

export function WebAppJsonLd({ content }: { content: any }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: content.title,
    description: content.description,
    url: `${BASE}/a/${content.slug}`,
    applicationCategory: "WebApplication",
  };
}

export function VideoJsonLd({ content, videoUrl }: { content: any; videoUrl: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: content.title,
    description: content.description,
    thumbnailUrl: content.coverImage,
    uploadDate: content.publishedAt,
    contentUrl: videoUrl,
    url: `${BASE}/p/${content.slug}`,
  };
}
```


### 4.4 관리자 페이지 noindex 레이아웃

```typescript
// app/admin/layout.tsx
import type { Metadata } from "next";
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```


***

## 🧩 5. 핵심 컴포넌트

### 5.1 HTML 앱 뷰어 (iframe sandbox)

```typescript
// components/public/HtmlAppViewer.tsx
"use client";
import { useEffect, useRef } from "react";

interface Props {
  cdnUrl: string;        // HTML 앱 index.html CDN URL
  title: string;
}

export function HtmlAppViewer({ cdnUrl, title }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <iframe
      ref={iframeRef}
      src={cdnUrl}
      title={title}
      // 핵심 sandbox: allow-scripts는 허용, allow-same-origin은 제거(XSS 방지)
      sandbox="allow-scripts allow-forms allow-popups allow-modals"
      className="w-full min-h-[600px] border-0 rounded-lg"
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}
```

> **보안 포인트**: `allow-same-origin`을 빼면 iframe 내 스크립트가 부모 DOM에 접근 불가.[^1_1][^1_2]

### 5.2 SlotRenderer — 수익화 슬롯

```typescript
// components/public/SlotRenderer.tsx
"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdSenseSlot } from "./slots/AdSenseSlot";
import { BannerImageSlot } from "./slots/BannerImageSlot";
import { CouponCardSlot } from "./slots/CouponCardSlot";
import { AffiliateProductSlot } from "./slots/AffiliateProductSlot";
import { TextLinkSlot } from "./slots/TextLinkSlot";
import { NativeCardSlot } from "./slots/NativeCardSlot";

interface SlotContext {
  device: "mobile" | "desktop";
  pageType: string;
  tags?: string[];
}

interface Props {
  placement: string;
  context?: SlotContext;
}

export function SlotRenderer({ placement, context }: Props) {
  const [slots, setSlots] = useState<any[]>([]);
  const pathname = usePathname();

  // 라우트 변경 시 슬롯 재로드 (광고 초기화 포함)
  useEffect(() => {
    fetch(`/api/public/slots?placement=${placement}`)
      .then((r) => r.json())
      .then((data) => setSlots(filterSlots(data, context)));
  }, [placement, pathname]); // pathname 의존성 → 라우트 변경 시 재실행

  if (!slots.length) return null;

  return (
    <div className="slot-container" data-placement={placement}>
      {slots.map((slot) => (
        <SlotItem key={slot.id} slot={slot} />
      ))}
    </div>
  );
}

function SlotItem({ slot }: { slot: any }) {
  const trackClick = (url: string) => {
    fetch("/api/track/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: slot.id, url, pagePath: window.location.pathname }),
    });
  };

  const disclosure = slot.showDisclosure && slot.disclosureText && (
    <p className="text-xs text-gray-400 mb-1">※ {slot.disclosureText}</p>
  );

  return (
    <div className="slot-item">
      {disclosure}
      {slot.type === "ADSENSE"           && <AdSenseSlot payload={slot.payloadJson} />}
      {slot.type === "BANNER_IMAGE"      && <BannerImageSlot payload={slot.payloadJson} onClickTrack={trackClick} />}
      {slot.type === "COUPON_CARD"       && <CouponCardSlot payload={slot.payloadJson} onClickTrack={trackClick} />}
      {slot.type === "AFFILIATE_PRODUCT" && <AffiliateProductSlot payload={slot.payloadJson} onClickTrack={trackClick} />}
      {slot.type === "TEXT_LINK"         && <TextLinkSlot payload={slot.payloadJson} onClickTrack={trackClick} />}
      {slot.type === "NATIVE_CARD"       && <NativeCardSlot payload={slot.payloadJson} onClickTrack={trackClick} />}
    </div>
  );
}

function filterSlots(slots: any[], context?: SlotContext) {
  const now = new Date();
  return slots.filter((s) => {
    if (s.startAt && new Date(s.startAt) > now) return false;
    if (s.endAt && new Date(s.endAt) < now) return false;
    if (context?.device && s.deviceTarget !== "all" && s.deviceTarget !== context.device) return false;
    if (context?.pageType && s.pageTarget !== "all" && s.pageTarget !== context.pageType) return false;
    return true;
  });
}
```


### 5.3 AdSense 슬롯 (라우트 변경 재초기화)

```typescript
// components/public/slots/AdSenseSlot.tsx
"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface Payload {
  adClient: string;  // ca-pub-XXXXXXXX
  adSlot: string;    // 슬롯 ID
  format: string;    // auto | rectangle | ...
}

export function AdSenseSlot({ payload }: { payload: Payload }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    // 라우트 변경 시 기존 ins 교체 → AdSense 재초기화
    if (!ref.current) return;
    ref.current.innerHTML = "";

    const ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.setAttribute("data-ad-client", payload.adClient);
    ins.setAttribute("data-ad-slot", payload.adSlot);
    ins.setAttribute("data-ad-format", payload.format ?? "auto");
    ins.setAttribute("data-full-width-responsive", "true");
    ref.current.appendChild(ins);

    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn("AdSense push error", e);
    }
  }, [pathname, payload.adSlot]); // ← 라우트 바뀔 때 재실행

  return <div ref={ref} className="adsense-wrapper my-4" />;
}
```


### 5.4 배너 이미지 슬롯

```typescript
// components/public/slots/BannerImageSlot.tsx
import Image from "next/image";

interface Payload {
  imageUrl: string;
  clickUrl: string;
  altText: string;
  openNewTab: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

function buildUrl(payload: Payload) {
  let url = payload.clickUrl;
  if (payload.utmSource) {
    const p = new URLSearchParams({
      utm_source: payload.utmSource ?? "platform",
      utm_medium: payload.utmMedium ?? "banner",
      utm_campaign: payload.utmCampaign ?? "slot",
    });
    url += (url.includes("?") ? "&" : "?") + p.toString();
  }
  return url;
}

export function BannerImageSlot({
  payload,
  onClickTrack,
}: {
  payload: Payload;
  onClickTrack: (url: string) => void;
}) {
  const finalUrl = buildUrl(payload);
  return (
    <a
      href={finalUrl}
      target={payload.openNewTab ? "_blank" : "_self"}
      rel="noopener noreferrer"
      onClick={() => onClickTrack(finalUrl)}
      className="block"
    >
      <Image
        src={payload.imageUrl}
        alt={payload.altText ?? "광고 배너"}
        width={728}
        height={90}
        className="w-full h-auto rounded"
      />
    </a>
  );
}
```


### 5.5 쿠폰 카드 슬롯

```typescript
// components/public/slots/CouponCardSlot.tsx
"use client";
import { useState } from "react";

interface Payload {
  title: string;
  description: string;
  code: string;
  expiresAt?: string;
  ctaLabel: string;
  ctaUrl: string;
  category?: string;
}

export function CouponCardSlot({ payload, onClickTrack }: {
  payload: Payload; onClickTrack: (url: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(payload.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired = payload.expiresAt && new Date(payload.expiresAt) < new Date();

  return (
    <div className={`border-2 border-dashed rounded-xl p-4 ${isExpired ? "opacity-50" : "border-yellow-400"}`}>
      {payload.category && (
        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full mb-2 inline-block">
          {payload.category}
        </span>
      )}
      <h3 className="font-bold text-lg">{payload.title}</h3>
      <p className="text-gray-600 text-sm mb-3">{payload.description}</p>
      <div className="flex gap-2 items-center mb-3">
        <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm flex-1 text-center">
          {payload.code}
        </code>
        <button
          onClick={copyCode}
          className="bg-yellow-400 text-black px-3 py-1 rounded text-sm font-medium"
        >
          {copied ? "✓ 복사됨" : "복사"}
        </button>
      </div>
      {payload.expiresAt && (
        <p className="text-xs text-gray-400 mb-2">
          만료: {new Date(payload.expiresAt).toLocaleDateString("ko-KR")}
          {isExpired && " (만료됨)"}
        </p>
      )}
      <a
        href={payload.ctaUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => onClickTrack(payload.ctaUrl)}
        className="block w-full bg-black text-white text-center py-2 rounded-lg text-sm font-medium"
      >
        {payload.ctaLabel}
      </a>
    </div>
  );
}
```


### 5.6 어필리에이트 상품 슬롯

```typescript
// components/public/slots/AffiliateProductSlot.tsx
import Image from "next/image";

interface Payload {
  productName: string;
  price?: string;
  benefit: string;
  imageUrl?: string;
  purchaseUrl: string;
  priority: number;
}

export function AffiliateProductSlot({ payload, onClickTrack }: {
  payload: Payload; onClickTrack: (url: string) => void;
}) {
  return (
    <div className="flex gap-3 p-3 border rounded-lg hover:shadow-md transition-shadow">
      {payload.imageUrl && (
        <Image
          src={payload.imageUrl}
          alt={payload.productName}
          width={80}
          height={80}
          className="rounded object-cover"
        />
      )}
      <div className="flex-1">
        <p className="font-semibold text-sm">{payload.productName}</p>
        {payload.price && <p className="text-blue-600 font-bold">{payload.price}</p>}
        <p className="text-xs text-gray-500 mt-1">{payload.benefit}</p>
        <a
          href={payload.purchaseUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => onClickTrack(payload.purchaseUrl)}
          className="mt-2 inline-block bg-orange-500 text-white text-xs px-3 py-1 rounded"
        >
          구매하기 →
        </a>
      </div>
    </div>
  );
}
```


***

## 🏠 6. 메인 페이지 렌더러

```typescript
// app/(public)/page.tsx
import { prisma } from "@/lib/prisma";
import { SiteRenderer } from "@/components/public/SiteRenderer";
import { SlotRenderer } from "@/components/public/SlotRenderer";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  return {
    title: settings?.siteTitle ?? "My Platform",
    description: "콘텐츠 플랫폼",
    robots: { index: true, follow: true },
  };
}

export default async function HomePage() {
  const [settings, contents] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    prisma.content.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 20,
      include: { tags: { include: { tag: true } } },
    }),
  ]);

  return (
    <>
      {/* 상단 슬롯 */}
      <SlotRenderer placement="HOME_TOP" />

      {/* 히어로 + 사이트 설정 기반 렌더 */}
      <SiteRenderer settings={settings} contents={contents} />

      {/* 푸터 슬롯 */}
      <SlotRenderer placement="HOME_FOOTER" />
    </>
  );
}
```

```typescript
// components/public/SiteRenderer.tsx
"use client";

interface SiteSettings {
  colorPrimary: string; colorBg: string; colorText: string;
  bgType: string; bgValue: string;
  siteTitle: string; logoUrl?: string;
  menuItems: Array<{ label: string; url: string }>;
  buttonItems: Array<{ label: string; actionType: string; actionValue: string; style: string }>;
  donateEnabled: boolean; donateLabel: string; donateUrl: string; donateColor: string;
  sections: Array<{ type: string; title: string; contentType?: string; limit?: number }>;
}

export function SiteRenderer({ settings, contents }: {
  settings: SiteSettings | null; contents: any[];
}) {
  const s = settings ?? {} as SiteSettings;

  return (
    <div style={{
      backgroundColor: s.bgType === "color" ? s.bgValue : undefined,
      backgroundImage: s.bgType === "gradient" ? s.bgValue : undefined,
      color: s.colorText,
    }}>
      {/* 헤더 */}
      <header className="flex justify-between items-center px-6 py-4 shadow"
        style={{ backgroundColor: s.colorPrimary }}>
        <div className="flex items-center gap-3">
          {s.logoUrl && <img src={s.logoUrl} alt="로고" className="h-8" />}
          <span className="text-xl font-bold text-white">{s.siteTitle}</span>
        </div>
        <nav className="flex gap-4">
          {s.menuItems?.map((m) => (
            <a key={m.url} href={m.url} className="text-white hover:opacity-80">{m.label}</a>
          ))}
        </nav>
        {/* 커피값 후원 버튼 */}
        {s.donateEnabled && (
          <a href={s.donateUrl} target="_blank" rel="noopener noreferrer"
            className="px-4 py-2 rounded-full font-medium text-sm text-black"
            style={{ backgroundColor: s.donateColor }}>
            {s.donateLabel}
          </a>
        )}
      </header>

      {/* 섹션 렌더 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {(s.sections ?? []).map((section, i) => (
          <ContentSection
            key={i}
            section={section}
            contents={contents.filter(
              (c) => !section.contentType || c.type === section.contentType
            ).slice(0, section.limit ?? 12)}
          />
        ))}
      </main>
    </div>
  );
}

function ContentSection({ section, contents }: { section: any; contents: any[] }) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{section.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contents.map((c) => (
          <ContentCard key={c.id} content={c} />
        ))}
      </div>
    </section>
  );
}

function ContentCard({ content }: { content: any }) {
  const href = content.type === "POST" || content.type === "VIDEO"
    ? `/p/${content.slug}` : `/a/${content.slug}`;

  return (
    <a href={href} className="group block border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
      {content.coverImage && (
        <img src={content.coverImage} alt={content.title} className="w-full h-48 object-cover" />
      )}
      <div className="p-4">
        <h3 className="font-semibold group-hover:text-blue-600">{content.title}</h3>
        {content.description && (
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{content.description}</p>
        )}
        <div className="flex gap-2 mt-3 flex-wrap">
          {content.tags?.map(({ tag }: any) => (
            <a key={tag.slug} href={`/tag/${tag.slug}`}
              className="text-xs bg-gray-100 px-2 py-1 rounded-full hover:bg-blue-100">
              #{tag.name}
            </a>
          ))}
        </div>
      </div>
    </a>
  );
}
```


***

## 🔒 7. 보안 체크리스트

| 항목 | 구현 방법 | 위험도 |
| :-- | :-- | :-- |
| 관리자 인증 | `httpOnly` JWT 쿠키 + 미들웨어 전수 검사 | 🔴 치명 |
| HTML 앱 XSS | iframe `sandbox`에서 `allow-same-origin` 제거 | 🔴 치명 |
| 파일 업로드 | MIME 화이트리스트 + 서버 검증 후 Presigned URL | 🔴 치명 |
| 비공개 파일 접근 | `publicFlag=false` 파일은 Signed Read URL만 발급 | 🔴 치명 |
| Admin 크롤러 노출 | robots.txt disallow + noindex 메타태그 | 🟠 높음 |
| SQL Injection | Prisma ORM(파라미터 바인딩 기본) | 🟠 높음 |
| CSRF | `sameSite: strict` 쿠키 + Origin 검사 | 🟠 높음 |
| Rate Limiting | API route에 IP 기반 rate limit(next-rate-limit) | 🟡 중간 |
| CSP 헤더 | `next.config.ts`에 Content-Security-Policy 설정 | 🟡 중간 |
| Zip Bomb | 압축 해제 전 사이즈 제한 + 파일 수 제한 | 🟡 중간 |

```typescript
// next.config.ts — CSP + 보안 헤더
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com",
      "img-src 'self' data: https://cdn.yourdomain.com blob:",
      "frame-src 'self' https://cdn.yourdomain.com",
      "connect-src 'self'",
    ].join("; "),
  },
];

export default {
  async headers() {
    return [
      { source: "/((?!admin).*)", headers: securityHeaders },
    ];
  },
};
```


***

## 📅 8. MVP 7일 구현 플랜

| 일자 | 목표 | 핵심 작업 |
| :-- | :-- | :-- |
| **Day 1** | 기반 셋업 | Next.js 프로젝트 생성, Prisma 스키마 + DB 마이그레이션, S3 버킷 설정, 환경 변수, 미들웨어 작성 |
| **Day 2** | 관리자 인증 + 파일 업로드 | 로그인 API + UI, Presigned URL 발급 API, FileUploader 컴포넌트, MIME 검증 |
| **Day 3** | 콘텐츠 CRUD | 콘텐츠 생성/수정/삭제 API, 태그 관리, 관리자 콘텐츠 에디터 UI(Markdown 에디터 연동) |
| **Day 4** | 공개 페이지 + SEO | 메인 페이지, `/p/[slug]`, `/a/[slug]`, `/tag/[tag]`, sitemap.ts, robots.ts, JSON-LD |
| **Day 5** | 사이트 빌더 | SiteSettings API, PageBuilder UI(색상/메뉴/버튼/후원버튼 편집기), SiteRenderer |
| **Day 6** | 수익화 슬롯 시스템 | AdSlot CRUD API, SlotRenderer 컴포넌트, 슬롯 5종 컴포넌트, 클릭 트래킹, 컴플라이언스 고지 |
| **Day 7** | 보안 강화 + 배포 | CSP 헤더, Rate Limiting, Vercel 배포, CloudFront CDN 연결, 최종 QA |


***

## ⚙️ 9. 환경 변수 (.env.local)

```bash
# DB
DATABASE_URL="postgresql://user:pass@host:5432/platform_db"

# JWT
JWT_SECRET="your-super-secret-key-min-32chars"

# AWS S3
AWS_REGION="ap-northeast-2"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
S3_BUCKET="your-bucket-name"

# CDN
CDN_BASE_URL="https://cdn.yourdomain.com"

# 공개 URL
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"

# 관리자 초기 계정 (시드용)
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="strong-initial-password"
```


***

## 🚀 10. 슬롯 렌더링 전략 (라우트 변경 이슈 해결)

Next.js App Router에서 클라이언트 사이드 라우트 전환 시 AdSense 같은 스크립트 기반 광고가 재초기화되지 않는 문제가 있습니다.  아래 3가지 전략을 조합 적용합니다.[^1_3][^1_4]

1. **`usePathname()` 의존성** — `AdSenseSlot`의 `useEffect`에 `pathname`을 의존성으로 넣어 라우트 변경 시 ins 태그를 DOM에서 제거 후 재삽입 → `adsbygoogle.push()` 재호출
2. **`key={pathname}` prop** — `SlotRenderer`를 `<SlotRenderer key={pathname} />` 형태로 사용하면 React가 컴포넌트를 완전히 언마운트/리마운트
3. **배너/쿠폰 슬롯** — 순수 React 컴포넌트이므로 라우트 변경 시 자동으로 재실행됨. 별도 처리 불필요
```typescript
// 사용 예시: 라우트 변경마다 완전 초기화
"use client";
import { usePathname } from "next/navigation";
import { SlotRenderer } from "@/components/public/SlotRenderer";

export function HomeSlots() {
  const pathname = usePathname();
  return (
    <>
      <SlotRenderer key={`${pathname}-HOME_TOP`} placement="HOME_TOP" />
      <SlotRenderer key={`${pathname}-HOME_FOOTER`} placement="HOME_FOOTER" />
    </>
  );
}
```


***

## 📦 패키지 설치 명령

```bash
# 핵심 패키지
npm install @prisma/client prisma
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install jose bcryptjs
npm install @types/bcryptjs

# 에디터 (Markdown)
npm install @uiw/react-md-editor

# UI (선택)
npx shadcn@latest init

# 개발 도구
npm install -D prisma typescript @types/node @types/react
```

이 설계는 **Vercel 배포 즉시 운영 가능**하며, S3 + CloudFront 조합으로 파일 CDN을 구성하고 Prisma를 통해 스키마 변경도 유연하게 처리할 수 있습니다.  수익화 슬롯은 어필리에이트/배너/쿠폰 영역에 **`rel="sponsored"` 속성**과 `disclosureText`로 법적 고지를 자동화하여 구글 정책과 공정거래위원회 가이드라인을 동시에 준수합니다.[^1_5][^1_6]
<span style="display:none">[^1_10][^1_11][^1_12][^1_13][^1_14][^1_15][^1_7][^1_8][^1_9]</span>

<div align="center">⁂</div>

[^1_1]: https://www.reddit.com/r/nextjs/comments/1cfmk1o/iframe_security_risk/

[^1_2]: https://www.reddit.com/r/reactjs/comments/1cfmkrs/iframe_security_risk/

[^1_3]: https://www.adeelhere.com/blog/2025-12-09-complete-nextjs-seo-guide-from-zero-to-hero

[^1_4]: https://dev.to/simplr_sh/nextjs-15-app-router-seo-comprehensive-checklist-3d3f

[^1_5]: https://neon.com/guides/next-upload-aws-s3

[^1_6]: https://www.alexefimenko.com/posts/file-storage-nextjs-postgres-s3

[^1_7]: https://www.averagedevs.com/blog/nextjs-seo-best-practices

[^1_8]: https://dev.to/movoid/nextjs-routing-in-2025-45mj

[^1_9]: https://python.plainenglish.io/seo-optimization-in-next-js-a-complete-practical-guide-for-2025-c035ac2f3aec

[^1_10]: https://www.mgphq.com/blog/nextjs-seo-checklist-2025-app-router

[^1_11]: https://kitemetric.com/blogs/next-js-routing-in-2025-app-router-vs-pages-router

[^1_12]: https://www.prisma.io/blog/fullstack-nextjs-graphql-prisma-4-1k1kc83x3v

[^1_13]: https://www.reddit.com/r/nextjs/comments/1c0r5ao/how_to_block_popup_banner_ads_and_video_ads_in/

[^1_14]: https://nextjs.org/docs/app

[^1_15]: https://www.inflearn.com/course/찍어먹는-next-풀코스

