// app/(public)/a/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { buildMetadata, WebAppJsonLd } from "@/lib/seo";
import { HtmlAppViewer } from "@/components/public/HtmlAppViewer";
import { JsonLd } from "@/components/public/JsonLd";
import { SlotRenderer } from "@/components/public/SlotRenderer";
import type { Metadata } from "next";

const DEMO_APPS: { [key: string]: any } = {
  "nextjs-15-features": {
    id: "1",
    title: "Next.js 15 새 기능",
    slug: "nextjs-15-features",
    type: "HTML_APP",
    status: "PUBLISHED",
    description: "Next.js 15의 새로운 기능 데모",
    body: "<p>HTML App 데모</p>",
    assets: [],
    tags: [],
  },
  "react-19-guide": {
    id: "2",
    title: "React 19 마이그레이션 가이드",
    slug: "react-19-guide",
    type: "HTML_APP",
    status: "PUBLISHED",
    description: "React 19 마이그레이션 데모",
    body: "<p>HTML App 데모</p>",
    assets: [],
    tags: [],
  },
};

export async function generateStaticParams() {
  // DEV mode: use file fallback to avoid initializing Prisma when no DB is configured
  if (process.env.DEV_LOGIN === "true") {
    try {
      const filePath = path.join(process.cwd(), "data", "contents.json");
      const raw = fs.readFileSync(filePath, "utf-8");
      const contents = JSON.parse(raw || "[]");
      return contents
        .filter((c: any) => c && c.type && c.type !== "POST")
        .map((c: any) => ({ slug: c.slug }));
    } catch (err) {
      console.warn("generateStaticParams (asset pages) DEV fallback failed", err);
      return Object.keys(DEMO_APPS).map((s) => ({ slug: s }));
    }
  }

  try {
    const apps = await prisma.content.findMany({
      where: { 
        status: "PUBLISHED", 
        type: { not: "POST" }
      },
      select: { slug: true },
    });
    return apps.map((a) => ({ slug: a.slug }));
  } catch (error) {
    console.warn('generateStaticParams (asset pages) DB error, returning empty array', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  // DEV mode: file fallback
  if (process.env.DEV_LOGIN === "true") {
    const filePath = path.join(process.cwd(), "data", "contents.json");
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const contents = JSON.parse(raw || "[]");
      const app = contents.find((c: any) => c && c.slug === slug);
      if (!app) {
        if (DEMO_APPS[slug]) {
          const demoApp = DEMO_APPS[slug];
          return buildMetadata({
            title: demoApp.seoTitle || demoApp.title,
            description: demoApp.seoDescription || demoApp.description,
            ogImage: demoApp.ogImage,
          });
        }
        return { title: "Not Found" };
      }

      return buildMetadata({
        title: app.seoTitle || app.title,
        description: app.seoDescription || app.description,
        ogImage: app.ogImage || app.coverImage,
      });
    } catch (e) {
      if (DEMO_APPS[slug]) {
        const demoApp = DEMO_APPS[slug];
        return buildMetadata({
          title: demoApp.seoTitle || demoApp.title,
          description: demoApp.seoDescription || demoApp.description,
          ogImage: demoApp.ogImage,
        });
      }
      return { title: "Not Found" };
    }
  }

  try {
    const app = await prisma.content.findUnique({ where: { slug } });
    if (!app || app.status !== "PUBLISHED") {
      return { title: "Not Found" };
    }
    return buildMetadata({
      title: app.seoTitle || app.title,
      description: app.seoDescription || app.description,
      ogImage: app.ogImage || app.coverImage,
    });
  } catch (error) {
    console.warn('generateMetadata (asset page) DB error:', error);
    return { title: "Not Found" };
  }
}

export default async function AppPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // DEV mode: file fallback
  if (process.env.DEV_LOGIN === "true") {
    // 1. 파일에서 콘텐츠 읽기
    const filePath = path.join(process.cwd(), "data", "contents.json");
    let contents = [];
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      contents = JSON.parse(raw);
    } catch (e) {
      // fallback: 데모
      if (DEMO_APPS[slug]) {
        const app = DEMO_APPS[slug];
        return (
          <>
            <JsonLd data={WebAppJsonLd({ content: app })} />
            <SlotRenderer placement="DETAIL_TOP" context={{ pageType: "html_app" }} />
            <div className="max-w-7xl mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold mb-2">{app.title}</h1>
              {app.description && <p className="text-gray-600 mb-6">{app.description}</p>}
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-4">
                <p className="text-center text-gray-500">(DEV 모드 - HTML App 데모)</p>
              </div>
            </div>
            <SlotRenderer placement="DETAIL_MID" />
            <SlotRenderer placement="DETAIL_BOTTOM" />
          </>
        );
      }
      return <div className="text-center py-20">콘텐츠를 찾을 수 없습니다.</div>;
    }
    // 2. slug로 콘텐츠 찾기 (normalize, DEV 모드: 상태 무관)
    function normalizeSlug(s: string) {
      return (s || "").toString().trim().replace(/\s+/g, "-").replace(/\/+$/, "").toLowerCase();
    }
    const normSlug = normalizeSlug(slug);
    const app = contents.find((c: any) => normalizeSlug(c.slug) === normSlug);
    if (!app) {
      return <div className="text-center py-20">콘텐츠를 찾을 수 없습니다.</div>;
    }
    // 3. type 결정 (DB의 type이 있으면 우선 사용)
    let fileType = "html";
    let appUrl = "";
    let fileName = "";
    
    // DB/JSON에서 type 읽기
    if (app.type === 'VIDEO') {
      fileType = 'video';
    } else if (app.type === 'IMAGE') {
      fileType = 'image';
    } else if (app.type === 'HTML_APP' || app.type === 'PROJECT' || app.type === 'GAME') {
      fileType = 'html';
    } else if (app.type === 'POST') {
      fileType = 'html';
    }
    
    // asset에서 파일 찾기
    if (app.assets && app.assets.length > 0) {
      const asset = app.assets[0];
      const assetId = typeof asset === "string" ? asset : asset.id;
      const assetDir = path.join(process.cwd(), 'public', 'uploads', assetId);

      try {
        const files = fs.readdirSync(assetDir);
        const indexFile = files.find(f => f.startsWith('index.'));
        
        if (indexFile) {
          fileName = indexFile;
          appUrl = `/uploads/${assetId}/${fileName}`;
          
          // type이 없으면 확장자로 결정
          if (!app.type) {
            const ext = indexFile.split('.').pop()?.toLowerCase() || '';
            if (/mp4|webm|mov|avi/.test(ext)) {
              fileType = 'video';
            } else if (/jpg|jpeg|png|gif|webp|svg/.test(ext)) {
              fileType = 'image';
            } else {
              fileType = 'html';
            }
          }
        }
      } catch (dirErr) {
        appUrl = "";
        fileType = "html";
      }
    }

    if (!appUrl) {
      return <div className="text-center py-20">앱 파일을 찾을 수 없습니다.</div>;
    }

    // 파일 타입에 따라 다른 렌더링
    const renderContent = () => {
      if (fileType === 'video') {
        const ext = (appUrl || '').split('.').pop()?.toLowerCase() || '';
        const mime = ext === 'webm' ? 'video/webm' : ext === 'mov' ? 'video/quicktime' : 'video/mp4';
        return (
          <video
            controls
            playsInline
            preload="metadata"
            className="w-full h-auto"
            style={{ maxHeight: '600px' }}
          >
            <source src={appUrl} type={mime} />
            브라우저가 동영상을 지원하지 않습니다.
          </video>
        );
      } else if (fileType === 'image') {
        return (
          <img
            src={appUrl}
            alt={app.title}
            className="w-full h-auto rounded-lg"
          />
        );
      } else {
        return <HtmlAppViewer cdnUrl={appUrl} title={app.title} />;
      }
    };
    
    return (
      <>
        <JsonLd data={WebAppJsonLd({ content: app })} />
        <SlotRenderer placement="DETAIL_TOP" context={{ pageType: "html_app" }} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">{app.title}</h1>
          {app.description && <p className="text-gray-600 mb-6">{app.description}</p>}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            {renderContent()}
          </div>
        </div>
        <SlotRenderer placement="DETAIL_MID" />
        <SlotRenderer placement="DETAIL_BOTTOM" />
      </>
    );
  }

  try {
    const app = await prisma.content.findUnique({
      where: { slug },
      include: { assets: true, tags: { include: { tag: true } } },
    });

    if (!app || app.status !== "PUBLISHED") {
      return <div className="text-center py-20">콘텐츠를 찾을 수 없습니다.</div>;
    }

    // 파일 타입에 따라 다른 에셋 찾기
    let appUrl = "";
    let fileType = "html";
    
    const htmlAsset = app.assets.find((a) => a.originalName.endsWith(".html"));
    const videoAsset = app.assets.find((a) => /\.(mp4|webm|mov|avi)$/i.test(a.originalName));
    const imageAsset = app.assets.find((a) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(a.originalName));
    
    if (htmlAsset) {
      appUrl = htmlAsset.cdnUrl || "";
      fileType = 'html';
    } else if (videoAsset) {
      appUrl = videoAsset.cdnUrl || "";
      fileType = 'video';
    } else if (imageAsset) {
      appUrl = imageAsset.cdnUrl || "";
      fileType = 'image';
    } else if (app.assets.length > 0) {
      appUrl = app.assets[0].cdnUrl || "";
      const ext = app.assets[0].originalName.split('.').pop()?.toLowerCase();
      fileType = /mp4|webm|mov|avi/.test(ext || '') ? 'video' : 
                 /jpg|jpeg|png|gif|webp|svg/.test(ext || '') ? 'image' : 'html';
    }

    if (!appUrl) {
      return <div className="text-center py-20">앱 파일을 찾을 수 없습니다.</div>;
    }

    // 파일 타입에 따라 다른 렌더링
    const renderContent = () => {
      if (fileType === 'video') {
        const ext = (appUrl || '').split('.').pop()?.toLowerCase() || '';
        const mime = ext === 'webm' ? 'video/webm' : ext === 'mov' ? 'video/quicktime' : 'video/mp4';
        return (
          <video
            controls
            playsInline
            preload="metadata"
            className="w-full h-auto"
            style={{ maxHeight: '600px' }}
          >
            <source src={appUrl} type={mime} />
            브라우저가 동영상을 지원하지 않습니다.
          </video>
        );
      } else if (fileType === 'image') {
        return (
          <img
            src={appUrl}
            alt={app.title}
            className="w-full h-auto rounded-lg"
          />
        );
      } else {
        return <HtmlAppViewer cdnUrl={appUrl} title={app.title} />;
      }
    };

    return (
      <>
        <JsonLd data={WebAppJsonLd({ content: app })} />
        <SlotRenderer placement="DETAIL_TOP" context={{ pageType: "html_app" }} />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">{app.title}</h1>
          {app.description && <p className="text-gray-600 mb-6">{app.description}</p>}

          <div className="flex gap-2 mb-6 flex-wrap">
            {app.tags.map(({ tag }) => (
              <a
                key={tag.slug}
                href={`/tag/${tag.slug}`}
                className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full"
              >
                #{tag.name}
              </a>
            ))}
          </div>

        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            {renderContent()}
          </div>
        </div>

        <SlotRenderer placement="DETAIL_MID" />
        <SlotRenderer placement="DETAIL_BOTTOM" />
      </>
    );
  } catch (error) {
    console.error('AppPage DB error:', error);
    return <div className="text-center py-20">문제가 발생했습니다. 나중에 다시 시도해주세요.</div>;
  }
}
