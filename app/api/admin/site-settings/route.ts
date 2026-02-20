// app/api/admin/site-settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";

// Lazy-load Prisma to avoid module-load failures when DATABASE_URL is missing
async function getPrisma() {
  try {
    const mod = await import("@/lib/prisma");
    return (mod as any).prisma;
  } catch (err) {
    console.warn("prisma not available:", err?.message ?? err);
    return null;
  }
}

const DEMO_SETTINGS = {
  id: "singleton",
  siteTitle: "Vibebox",
  logoUrl: "",
  colorPrimary: "#3B82F6",
  colorSecondary: "#10B981",
  colorBg: "#FFFFFF",
  colorText: "#1F2937",
  bgType: "color",
  bgValue: "",
  donateEnabled: true,
  donateLabel: "☕ 커피 한잔 후원하기",
  donateUrl: "https://ko-fi.com/",
  donateColor: "#FF6B6B",
  menu: [
    { name: "홈", url: "/" },
    { name: "블로그", url: "/tag/blog" },
    { name: "포트폴리오", url: "/tag/portfolio" },
  ],
  buttons: [
    { text: "구독하기", url: "https://example.com/subscribe", color: "#3B82F6" },
  ],
  sections: [
    { title: "환영합니다", description: "Vibebox에 오신 것을 환영합니다!", icon: "👋" },
  ],
};

const SETTINGS_FILE = join(process.cwd(), 'data', 'site-settings.json');

export async function GET() {
  try {
    // DEV 모드: 파일에서 읽기
    if (process.env.DEV_LOGIN === "true") {
      try {
        const fileData = readFileSync(SETTINGS_FILE, 'utf-8');
        return NextResponse.json(JSON.parse(fileData));
      } catch {
        // 파일이 없으면 기본 설정 반환
        return NextResponse.json(DEMO_SETTINGS);
      }
    }

    const prisma = await getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "prisma unavailable" }, { status: 500 });
    }
    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton" },
      update: {},
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Get settings error:", error);
    if (process.env.DEV_LOGIN === "true") {
      return NextResponse.json(DEMO_SETTINGS);
    }
    return NextResponse.json({ error: "설정 조회 실패" }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  let data;
  try {
    data = await req.json();
    
    // DEV 모드: 파일로 저장
    if (process.env.DEV_LOGIN === "true" && data) {
      const settingsData = { id: "singleton", ...data };
      writeFileSync(SETTINGS_FILE, JSON.stringify(settingsData, null, 2));
      console.log('✅ 사이트 설정 저장:', SETTINGS_FILE);
      return NextResponse.json(settingsData);
    }

    const prisma = await getPrisma();
    if (!prisma) {
      return NextResponse.json({ error: "prisma unavailable" }, { status: 500 });
    }
    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", ...data },
      update: data,
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Update settings error:", error);
    if (process.env.DEV_LOGIN === "true" && data) {
      return NextResponse.json({ id: "singleton", ...data });
    }
    return NextResponse.json({ error: "설정 저장 실패" }, { status: 500 });
  }
}
