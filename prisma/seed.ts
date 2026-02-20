// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 관리자 계정 생성
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "strong-initial-password-123";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(adminPassword);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        role: "SUPER_ADMIN",
      },
    });
    console.log(`✓ Admin user created: ${adminEmail}`);
  }

  // 기본 사이트 설정 생성
  const existingSettings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });

  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        id: "singleton",
        siteTitle: "Vibebox Platform",
        colorPrimary: "#6366f1",
        colorSecondary: "#8b5cf6",
        donateEnabled: false,
        sections: [
          {
            type: "grid",
            title: "최신 콘텐츠",
            contentType: "POST",
            limit: 12,
          },
        ],
      },
    });
    console.log("✓ Site settings initialized");
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
