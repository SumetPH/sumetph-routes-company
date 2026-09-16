import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Company Route — Google Maps API Test",
  description: "ทดสอบเส้นทางรถยนต์ไปบริษัทตามสภาพจราจรปัจจุบัน",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
