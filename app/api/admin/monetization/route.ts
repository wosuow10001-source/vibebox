// app/api/admin/monetization/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_SLOTS = [
  { id: "slot-1", name: "Home Top", type: "BANNER", placement: "HOME_TOP", status: "ACTIVE", priority: 1, renderCount: 1250 },
  { id: "slot-2", name: "Hero Right", type: "NATIVE", placement: "HOME_HERO_RIGHT", status: "ACTIVE", priority: 2, renderCount: 890 },
  { id: "slot-3", name: "Article Sidebar", type: "SIDEBAR", placement: "ARTICLE_SIDEBAR", status: "INACTIVE", priority: 3, renderCount: 450 },
  { id: "slot-4", name: "Footer", type: "BANNER", placement: "FOOTER", status: "ACTIVE", priority: 4, renderCount: 2100 },
];

export async function GET() {
  try {
    const slots = await prisma.adSlot.findMany({
      orderBy: [{ placement: "asc" }, { priority: "asc" }],
    });
    return NextResponse.json(slots);
  } catch (error) {
    console.error("Get slots error:", error);
    // DEV mode: return demo slots instead of error
    if (process.env.DEV_LOGIN === "true") {
      return NextResponse.json(DEMO_SLOTS);
    }
    return NextResponse.json(
      { error: "슬롯 조회 실패" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const slot = await prisma.adSlot.create({ data });
    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    console.error("Create slot error:", error);
    return NextResponse.json(
      { error: "슬롯 생성 실패" },
      { status: 500 }
    );
  }
}
