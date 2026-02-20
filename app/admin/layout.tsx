import type { Metadata } from "next";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 로그인 페이지는 AdminPageLayout 없이 렌더링
  // 하위 layout.tsx에서 처리됨
  return <AdminPageLayout>{children}</AdminPageLayout>;
}
