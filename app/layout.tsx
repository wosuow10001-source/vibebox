import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vibebox - 콘텐츠 플랫폼",
  description: "관리자 CMS + 공개 콘텐츠 포털",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
