// app/api/track/click/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { slotId, url, pagePath } = await req.json();

    if (!slotId || !url) {
      return NextResponse.json(
        { error: "필수 데이터 누락" },
        { status: 400 }
      );
    }

    const ua = req.headers.get("user-agent") ?? "";
    const userAgentHash = createHash("sha256")
      .update(ua)
      .digest("hex")
      .slice(0, 16);

    await prisma.$transaction([
      prisma.clickEvent.create({
        data: {
          slotId,
          url,
          pagePath: pagePath || "/",
          referrer: req.headers.get("referer") ?? "",
          userAgentHash,
        },
      }),
      // renderCount 업데이트
      prisma.adSlot.update({
        where: { id: slotId },
        data: { renderCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Track click error:", error);
    return NextResponse.json(
      { error: "트래킹 실패" },
      { status: 500 }
    );
  }
}
