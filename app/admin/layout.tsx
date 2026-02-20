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
  return <AdminPageLayout>{children}</AdminPageLayout>;
}
