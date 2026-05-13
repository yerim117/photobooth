import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "포토부스",
  description: "2컷 사진 스트립",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
