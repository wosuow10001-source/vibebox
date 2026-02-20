// app/api/public/slots/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { filterSlots } from "@/lib/slot-filter";

const DEMO_SLOTS = [
  { id: "slot-1", name: "Home Top", type: "BANNER", placement: "HOME_TOP", status: "ACTIVE", priority: 1, renderCount: 1250 },
  { id: "slot-2", name: "Hero Right", type: "NATIVE", placement: "HOME_HERO_RIGHT", status: "ACTIVE", priority: 2, renderCount: 890 },
  { id: "slot-4", name: "Footer", type: "BANNER", placement: "FOOTER", status: "ACTIVE", priority: 4, renderCount: 2100 },
];

export async function GET(req: NextRequest) {
  // DEV 모드: 항상 demo 데이터 반환
  if (process.env.DEV_LOGIN === "true") {
    const placement = new URL(req.url).searchParams.get("placement");
    const demoSlots = placement ? DEMO_SLOTS.filter(s => s.placement === placement) : DEMO_SLOTS;
    return NextResponse.json(demoSlots);
  }
  try {
    const { searchParams } = new URL(req.url);
    const placement = searchParams.get("placement");
    const device = (searchParams.get("device") as "mobile" | "desktop") || undefined;
    const pageType = searchParams.get("pageType") || undefined;

    const slots = await prisma.adSlot.findMany({
      where: {
        placement: placement || undefined,
        status: "ACTIVE",
      },
      orderBy: [{ priority: "asc" }],
    });

    const filtered = filterSlots(slots, { device, pageType });

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Get public slots error:", error);
    return NextResponse.json(
      { error: "슬롯 조회 실패" },
      { status: 500 }
    );
  }
}
