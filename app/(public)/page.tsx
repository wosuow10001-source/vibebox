// app/(public)/page.tsx
// Lazy-load Prisma to avoid throwing during module evaluation if DB config is missing
async function tryGetPrisma() {
  try {
    const mod = await import("@/lib/prisma");
    return (mod as any).prisma;
  } catch (err) {
    console.warn("prisma import failed (using demo data):", err?.message ?? err);
    return null;
  }
}
import { SiteRenderer } from "@/components/public/SiteRenderer";
import { SlotRenderer } from "@/components/public/SlotRenderer";
import { CurrentAppViewer } from "@/components/public/CurrentAppViewer";
import { ContentGridViewer } from "@/components/public/ContentGridViewer";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { promises as fs } from "fs";
import { join } from "path";

export async function generateMetadata(): Promise<Metadata> {
  // DEV mode: return demo metadata (skip DB)
  if (process.env.DEV_LOGIN === "true") {
    return buildMetadata({
      title: "Vibebox CMS Platform",
      description: "성공적으로 작동하는 CMS 플랫폼",
    });
  }
  
  try {
    const prisma = await tryGetPrisma();
    if (!prisma) {
      return buildMetadata({ title: "Vibebox Platform", description: "관리자가 제공하는 다양한 콘텐츠와 서비스" });
    }
    const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    return buildMetadata({ title: settings?.siteTitle ?? "Vibebox Platform", description: "관리자가 제공하는 다양한 콘텐츠와 서비스" });
  } catch (error) {
    console.warn("Database connection failed in metadata:", error);
    return buildMetadata({ title: "Vibebox Platform", description: "관리자가 제공하는 다양한 콘텐츠와 서비스" });
  }
}

const DEMO_SETTINGS = {
  id: "singleton",
  siteTitle: "Vibebox CMS Platform",
  siteDescription: "성공적으로 작동하는 CMS 플랫폼",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.ico",
  primaryColor: "#3b82f6",
  secondaryColor: "#1f2937",
  headerEnabled: true,
  footerEnabled: true,
  sidebarEnabled: true,
  sections: [
    {
      title: "최신 콘텐츠",
      description: "새로 작성된 게시글과 파일들",
      icon: "📰",
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const DEMO_CONTENTS = [
  {
    id: "1",
    title: "Next.js 15 새 기능",
    slug: "nextjs-15-features",
    excerpt: "Next.js 15의 최신 기능들을 소개합니다",
    content: "<p>이 플랫폼은 완전히 기능하는 CMS 시스템입니다.</p>",
    status: "PUBLISHED",
    views: 150,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [],
  },
  {
    id: "2",
    title: "React 19 마이그레이션 가이드",
    slug: "react-19-guide",
    excerpt: "React 19로 업그레이드하는 방법을 안내합니다",
    content: "<p>모든것이 준비되었습니다.</p>",
    status: "PUBLISHED",
    views: 120,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [],
  },
];

export default async function HomePage() {
  // DEV_LOGIN=true: 파일 기반 데이터만 사용 (DB 접근 금지)
  if (process.env.DEV_LOGIN === "true") {
    let contents = DEMO_CONTENTS;
    let settings = DEMO_SETTINGS;

    // 콘텐츠 읽기
    try {
      const filePath = join(process.cwd(), "data", "contents.json");
      const file = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(file);
      if (Array.isArray(parsed)) {
        // 모든 콘텐츠 표시 (asset- ID 포함)
        contents = parsed.map((c) => ({ 
          ...c, 
          type: c.type || 'POST',
          description: c.description || c.excerpt || '',
        }));
        
        // 고정된 콘텐츠를 먼저 표시
        contents.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          // 같은 고정 상태면 날짜순
          return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
        });
      }
    } catch (e) {
      console.warn("Failed to read contents.json:", e);
    }

    // 사이트 설정 읽기
    try {
      const settingsPath = join(process.cwd(), "data", "site-settings.json");
      const settingsFile = await fs.readFile(settingsPath, "utf-8");
      const parsedSettings = JSON.parse(settingsFile);
      settings = parsedSettings;
    } catch (e) {
      console.warn("Failed to read site-settings.json, using defaults:", e);
    }

    return (
      <>
        <SlotRenderer placement="HOME_TOP" context={{ pageType: "home" }} />
        <SiteRenderer settings={settings} contents={contents} />
        <SlotRenderer placement="HOME_FOOTER" context={{ pageType: "home" }} />
      </>
    );
  }

  // Prod mode: try DB
  let settings: any = null;
  let contents: any[] = [];
  let hasActiveApp = false;
  let activeApp: any = null;

  try {
    const prisma = await tryGetPrisma();
    if (prisma) {
      try {
        activeApp = await prisma.app.findFirst({
          where: { isActive: true },
          orderBy: { updatedAt: "desc" },
        });
        hasActiveApp = !!activeApp;
      } catch (dbErr) {
        console.warn("Error checking for active app:", dbErr);
      }
    }
  } catch (err) {
    console.warn("Error checking for active app:", err);
  }

  if (hasActiveApp && activeApp) {
    try {
      return (
        <CurrentAppViewer 
          appId={activeApp.id}
          name={activeApp.name}
          publicUrl={activeApp.publicPath}
          htmlContent={activeApp.htmlContent}
        />
      );
    } catch (renderErr) {
      console.warn("Error rendering CurrentAppViewer:", renderErr);
    }
  }

  try {
    const prisma = await tryGetPrisma();
    if (!prisma) {
      console.warn("prisma not available, using demo fallback");
      settings = DEMO_SETTINGS;
      contents = DEMO_CONTENTS;
    } else {
      [settings, contents] = await Promise.all([
        prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
        prisma.content.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
          take: 20,
          include: { tags: { include: { tag: true } } },
        }),
      ]);
    }
  } catch (error) {
    console.warn("Database connection failed:", error);
    settings = DEMO_SETTINGS;
    contents = DEMO_CONTENTS;
  }

  return (
    <>
      <SlotRenderer placement="HOME_TOP" context={{ pageType: "home" }} />
      <SiteRenderer settings={settings} contents={contents} />
      <SlotRenderer placement="HOME_FOOTER" context={{ pageType: "home" }} />
    </>
  );
}
