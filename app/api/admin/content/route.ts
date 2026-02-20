// DELETE: 콘텐츠 삭제 (DEV 모드)
export async function DELETE(req: NextRequest) {
  if (process.env.DEV_LOGIN === 'true') {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      if (!id) {
        return NextResponse.json({ error: 'id 파라미터 필요' }, { status: 400 });
      }
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
      // revalidate
      try {
        revalidatePath('/');
        revalidatePath('/admin/content');
      } catch (err) {}
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: '삭제 실패' }, { status: 500 });
    }
  }
  // PROD: 미구현
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
// app/api/admin/content/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from 'next/cache';
import { prisma } from "@/lib/prisma";

const DEMO_CONTENTS = [
  { id: "1", title: "Next.js 15 새 기능", slug: "nextjs-15-features", category: "TECH", status: "PUBLISHED", views: 1250, createdAt: new Date() },
  { id: "2", title: "React 19 마이그레이션 가이드", slug: "react-19-guide", category: "DEV", status: "DRAFT", views: 450, createdAt: new Date() },
  { id: "3", title: "TypeScript 최적화 팁", slug: "typescript-tips", category: "TECH", status: "PUBLISHED", views: 890, createdAt: new Date() },
];

export async function GET(req: NextRequest) {
  // DEV mode: return demo data without DB query
  if (process.env.DEV_LOGIN === "true") {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = 20;
    // 실제 업로드된 콘텐츠 파일 읽기
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
      // 최신순 정렬 및 페이징
      contents = contents.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      const paged = contents.slice((page - 1) * limit, page * limit);
      return NextResponse.json({
        contents: paged,
        total: contents.length,
        page,
        limit
      });
    } catch (e) {
      // fallback: 데모
      return NextResponse.json({
        contents: DEMO_CONTENTS,
        total: DEMO_CONTENTS.length,
        page,
        limit
      });
    }
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = 20;

    const [contents, total] = await prisma.$transaction([
      prisma.content.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { tags: { include: { tag: true } }, assets: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.content.count(),
    ]);

    return NextResponse.json({ contents, total, page, limit });
  } catch (error) {
    console.error("Get content error:", error);
    return NextResponse.json(
      { error: "콘텐츠 조회 실패" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {

  try {
    const body = await req.json();

    // DEV-mode: 실제 파일에 append
    if (process.env.DEV_LOGIN === 'true') {
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
      // slug 정규화 함수
      const normalizeSlug = (s: string) => {
        return (s || '')
          .toLowerCase()
          .replace(/\.[a-z0-9]+$/i, '') // 확장자 제거
          .replace(/[^\w\s-]/g, '') // 특수문자 제거
          .replace(/\s+/g, '-') // 공백을 대시로
          .replace(/-+/g, '-') // 중복 대시 제거
          .replace(/^-|-$/g, '') // 양쪽 대시 제거
          || 'untitled';
      };
      // 새 콘텐츠 객체 생성
      const now = new Date();
      const newContent = {
        id: String(Date.now()),
        title: body.title || 'Untitled',
        slug: body.slug ? normalizeSlug(body.slug) : normalizeSlug(body.title || ''),
        type: body.type || 'POST',
        description: body.description || '',
        excerpt: body.excerpt || '',
        content: body.body || '',
        body: body.body || '',
        coverImage: body.coverImage || '', // 썸네일 이미지
        status: body.status || 'PUBLISHED',
        views: 0,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
        tags: body.tags || [],
        assets: body.assetIds || [],
      };
      contents.unshift(newContent);
      await fs.writeFile(filePath, JSON.stringify(contents, null, 2), 'utf-8');
      return NextResponse.json(newContent, { status: 201 });
    }

    const { tags = [], assetIds = [], ...contentData } = body;

    // ensure required fields
    const title = (contentData.title as string) || 'Untitled';
    const slug = (contentData.slug as string) || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const type = (contentData.type as string) || 'POST';

    const content = await prisma.content.create({
      data: {
        title,
        slug,
        type: type as any,
        description: (contentData.description as string) || null,
        body: (contentData.body as string) || null,
        status: (contentData.status as any) || undefined,
        publishedAt: contentData.status === 'PUBLISHED' ? new Date() : contentData.publishedAt,
        seoTitle: contentData.seoTitle || null,
        seoDescription: contentData.seoDescription || null,
        tags: {
          create: (tags || []).map((tagName: string) => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: {
                  name: tagName,
                  slug: tagName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
                },
              },
            },
          })),
        },
      },
      include: { tags: { include: { tag: true } }, assets: true },
    });

    if (Array.isArray(assetIds) && assetIds.length > 0) {
      try {
        await prisma.asset.updateMany({
          where: { id: { in: assetIds } },
          data: { contentId: content.id },
        });
      } catch (err) {
        console.error('Failed to attach assets to content', err);
      }
    }

    // Revalidate important pages so public site shows the new content immediately
    try {
      revalidatePath('/');
      revalidatePath('/admin/content');
      // revalidate detail page for this content (posts route)
      if (content.slug) revalidatePath(`/p/${content.slug}`);
    } catch (err) {
      console.warn('Revalidation failed:', err);
    }

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('Create content error:', error);
    return NextResponse.json({ error: '콘텐츠 생성 실패' }, { status: 500 });
  }
}
