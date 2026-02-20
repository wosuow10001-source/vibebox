// app/admin/login/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인 - Vibebox Admin",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 로그인 페이지는 AdminPageLayout을 사용하지 않음
  return <>{children}</>;
}
