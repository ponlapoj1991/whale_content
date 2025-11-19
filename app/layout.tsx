import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Content Whale - เครื่องมือสร้างคอนเทนต์พลังวาฬ",
  description: "ระบบสร้างคอนเทนต์และภาพอัตโนมัติสำหรับเพจ พลังวาฬบางอย่าง",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
