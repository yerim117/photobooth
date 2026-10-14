import type { ReactNode } from "react";

interface ScreenProps {
  children: ReactNode;
  gap?: number;
  padding?: number | string;
}

// 화면 배경 레이어 (PhotoCard의 사진 저장 캡처에서도 재사용)
export const SCREEN_BG_STYLE: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: -1,
  backgroundImage: "url('/bg.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  opacity: 0.4,
};

// 배경 이미지 위에 내용을 세로 중앙 정렬하는 전체 화면 레이아웃
export default function Screen({ children, gap = 24, padding = 24 }: ScreenProps) {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap,
        padding,
        position: "relative",
      }}
    >
      <div style={SCREEN_BG_STYLE} />
      {children}
    </div>
  );
}
