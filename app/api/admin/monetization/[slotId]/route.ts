// app/api/admin/monetization/[slotId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  const { slotId } = await params;
  
  try {
    const data = await req.json();
    
    // DEV mode: return demo response
    if (process.env.DEV_LOGIN === "true") {
      return NextResponse.json({
        id: slotId,
        ...data,
        updatedAt: new Date(),
      });
    }
    
    const slot = await prisma.adSlot.update({
      where: { id: slotId },
      data,
    });
    return NextResponse.json(slot);
  } catch (error) {
    console.error("Update slot error:", error);
    return NextResponse.json(
      { error: "슬롯 수정 실패" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  const { slotId } = await params;
  
  // DEV mode: return success
  if (process.env.DEV_LOGIN === "true") {
    return NextResponse.json({ ok: true });
  }
  
  try {
    await prisma.adSlot.delete({ where: { id: slotId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete slot error:", error);
    return NextResponse.json(
      { error: "슬롯 삭제 실패" },
      { status: 500 }
    );
  }
}
