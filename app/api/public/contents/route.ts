// app/api/public/contents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = 20;

    // DEV mode: return demo data without DB query
    if (process.env.DEV_LOGIN === "true") {
      const demoContents = [
        {
          id: "1",
          title: "Next.js 15 새 기능",
          slug: "nextjs-15-features",
          type: "POST",
          status: "PUBLISHED",
          description: "Next.js 15의 최신 기능들을 소개합니다",
          tags: [{ tag: { name: "Next.js", slug: "nextjs" } }],
          assets: [],
          createdAt: new Date(),
        },
        {
          id: "2",
          title: "React 19 마이그레이션 가이드",
          slug: "react-19-guide",
          type: "POST",
          status: "PUBLISHED",
          description: "React 19로 업그레이드하는 방법",
          tags: [{ tag: { name: "React", slug: "react" } }],
          assets: [],
          createdAt: new Date(),
        },
      ];
      return NextResponse.json({
        contents: demoContents,
        total: demoContents.length,
        page,
      });
    }

    const where: any = { status: "PUBLISHED" };
    if (type) where.type = type;
    if (tag) {
      where.tags = { some: { tag: { slug: tag } } };
    }

    const [contents, total] = await prisma.$transaction([
      prisma.content.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { tags: { include: { tag: true } } },
        orderBy: { publishedAt: "desc" },
      }),
      prisma.content.count({ where }),
    ]);

    return NextResponse.json({ contents, total, page });
  } catch (error) {
    console.error("Get public contents error:", error);
    return NextResponse.json(
      { error: "콘텐츠 조회 실패" },
      { status: 500 }
    );
  }
}
