// app/api/admin/content/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('📥 GET /api/admin/content/[id] - ID:', id);
  
  // DEV mode: return demo data
  if (process.env.DEV_LOGIN === "true") {
    console.log('✅ DEV mode - loading from file');
    const { promises: fs } = await import('fs');
    const { join } = await import('path');
    const filePath = join(process.cwd(), 'data', 'contents.json');
    
    try {
      const file = await fs.readFile(filePath, 'utf-8');
      const contents = JSON.parse(file);
      if (!Array.isArray(contents)) {
        return NextResponse.json({ error: '콘텐츠 데이터 형식 오류' }, { status: 500 });
      }
      
      const content = contents.find((c: any) => String(c.id) === String(id));
      if (!content) {
        return NextResponse.json({ error: '콘텐츠를 찾을 수 없음' }, { status: 404 });
      }
      
      console.log('✅ DEV mode - content found:', content.title);
      return NextResponse.json(content);
    } catch (e) {
      console.error('❌ DEV mode - file read error:', e);
      return NextResponse.json({ error: '파일 읽기 실패' }, { status: 500 });
    }
  }

  try {
    const content = await prisma.content.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } }, assets: true },
    });

    if (!content) {
      console.warn('⚠️ Content not found:', id);
      return NextResponse.json(
        { error: "콘텐츠를 찾을 수 없음" },
        { status: 404 }
      );
    }

    console.log('✅ Content found:', content.id);
    return NextResponse.json(content);
  } catch (error) {
    console.error("❌ Get content error:", error);
    return NextResponse.json(
      { error: "콘텐츠 조회 실패" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('📤 PUT /api/admin/content/[id] - ID:', id);
  
  try {
    const data = await req.json();
    console.log('📝 Request body received:', { id, tagsCount: data.tags?.length || 0 });

    // DEV mode: 파일 기반 업데이트
    if (process.env.DEV_LOGIN === "true") {
      console.log('✅ DEV mode - updating file');
      const { promises: fs } = await import('fs');
      const { join } = await import('path');
      const filePath = join(process.cwd(), 'data', 'contents.json');
      
      let contents = [];
      try {
        const file = await fs.readFile(filePath, 'utf-8');
        contents = JSON.parse(file);
        if (!Array.isArray(contents)) contents = [];
      } catch (e) {
        contents = [];
      }

      const index = contents.findIndex((c: any) => String(c.id) === String(id));
      if (index === -1) {
        return NextResponse.json({ error: '콘텐츠를 찾을 수 없음' }, { status: 404 });
      }

      // 기존 콘텐츠 업데이트 (assets는 유지, 나머지만 업데이트)
      const { assets: newAssets, ...updateData } = data;
      
      contents[index] = {
        ...contents[index],
        ...updateData,
        id: contents[index].id, // ID는 유지
        assets: newAssets !== undefined ? newAssets : contents[index].assets, // assets는 명시적으로 전달된 경우만 업데이트
        updatedAt: new Date(),
      };

      await fs.writeFile(filePath, JSON.stringify(contents, null, 2), 'utf-8');
      
      console.log('✅ DEV mode - 콘텐츠 업데이트 완료:', contents[index].title);
      return NextResponse.json(contents[index]);
    }

    const { tags = [], ...updateData } = data;

    // 기존 태그 삭제
    await prisma.contentTag.deleteMany({ where: { contentId: id } });

    const content = await prisma.content.update({
      where: { id },
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
                create: {
                  name: tagName,
                  slug: tagName
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^\w-]/g, ""),
                },
              },
            },
          })),
        },
      },
      include: { tags: { include: { tag: true } }, assets: true },
    });

    console.log('✅ Content updated:', content.id);
    return NextResponse.json(content);
  } catch (error) {
    console.error("❌ Update content error:", error);
    return NextResponse.json(
      { error: "콘텐츠 수정 실패: " + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // DEV mode: 실제 data/contents.json에서 항목 삭제
  if (process.env.DEV_LOGIN === "true") {
    try {
      const { promises: fs } = await import('fs');
      const { join } = await import('path');
      const filePath = join(process.cwd(), 'data', 'contents.json');
      let contents = [];
      try {
        const file = await fs.readFile(filePath, 'utf-8');
        contents = JSON.parse(file);
        if (!Array.isArray(contents)) contents = [];
      } catch (e) {
        contents = [];
      }
      const beforeLen = contents.length;
      contents = contents.filter((c: any) => String(c.id) !== String(id));
      await fs.writeFile(filePath, JSON.stringify(contents, null, 2), 'utf-8');
      if (contents.length === beforeLen) {
        return NextResponse.json({ error: '삭제할 콘텐츠를 찾을 수 없음' }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
    }
  }

  try {
    await prisma.content.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete content error:", error);
    return NextResponse.json(
      { error: "콘텐츠 삭제 실패" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('🔧 PATCH /api/admin/content/[id] - ID:', id);
  
  try {
    const data = await req.json();
    console.log('📝 PATCH data:', data);

    // DEV mode: 파일 기반 태그 업데이트
    if (process.env.DEV_LOGIN === "true") {
      const { promises: fs } = await import('fs');
      const { join } = await import('path');
      const filePath = join(process.cwd(), 'data', 'contents.json');
      
      let contents = [];
      try {
        const file = await fs.readFile(filePath, 'utf-8');
        contents = JSON.parse(file);
        if (!Array.isArray(contents)) contents = [];
      } catch (e) {
        contents = [];
      }

      const index = contents.findIndex((c: any) => String(c.id) === String(id));
      if (index === -1) {
        return NextResponse.json({ error: '콘텐츠를 찾을 수 없음' }, { status: 404 });
      }

      // 태그 업데이트
      if (data.tags !== undefined) {
        contents[index].tags = data.tags;
      }

      await fs.writeFile(filePath, JSON.stringify(contents, null, 2), 'utf-8');
      
      console.log('✅ DEV mode - 태그 업데이트 완료');
      return NextResponse.json(contents[index]);
    }

    // DB mode: 태그만 업데이트
    if (data.tags !== undefined) {
      const { tags } = data;

      // 기존 태그 삭제
      await prisma.contentTag.deleteMany({ where: { contentId: id } });

      // 새 태그 추가
      const content = await prisma.content.update({
        where: { id },
        data: {
          tags: {
            create: tags.map((tagName: string) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: {
                    name: tagName,
                    slug: tagName
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^\w-]/g, ""),
                  },
                },
              },
            })),
          },
        },
        include: { tags: { include: { tag: true } }, assets: true },
      });

      console.log('✅ 태그 업데이트 완료:', content.id);
      return NextResponse.json(content);
    }

    return NextResponse.json({ error: '업데이트할 데이터가 없음' }, { status: 400 });
  } catch (error) {
    console.error("❌ PATCH content error:", error);
    return NextResponse.json(
      { error: "태그 업데이트 실패: " + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
