import "../globals.css";
import { PageLayout } from "@/components/public/PageLayout";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageLayout>{children}</PageLayout>;
}
