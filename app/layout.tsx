import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "2컷 포토부스",
  description: "2컷 사진을 찍고, 메시지를 담아 공유할 수 있는 웹 포토부스입니다.",
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
