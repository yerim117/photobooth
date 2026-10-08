"use client";

import { shareWithSheet } from "../lib/browser";

interface SavePreviewProps {
  url: string;
  file: File;
  onClose: () => void;
}

const buttonStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 8,
  fontSize: 16,
  cursor: "pointer",
};

// 다운로드·공유 시트가 막힌 환경(인앱 브라우저 등)에서 "길게 눌러 저장"을 안내하는 오버레이
export default function SavePreview({ url, file, onClose }: SavePreviewProps) {
  const canShare = typeof navigator !== "undefined" && !!navigator.canShare?.({ files: [file] });

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
      }}
    >
      <p style={{ color: "#fff", fontSize: 17, textAlign: "center", lineHeight: 1.5 }}>
        사진을 길게 눌러 저장해 주세요 📸
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element -- blob URL이라 next/image 최적화 불가 */}
      <img
        src={url}
        alt="포토카드"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 8, WebkitTouchCallout: "default" }}
      />
      <div style={{ display: "flex", gap: 10 }} onClick={(e) => e.stopPropagation()}>
        {canShare && (
          <button
            onClick={() => shareWithSheet({ files: [file] })}
            style={{ ...buttonStyle, background: "#fff", border: "none" }}
          >
            공유 / 저장
          </button>
        )}
        <button
          onClick={onClose}
          style={{ ...buttonStyle, background: "transparent", color: "#fff", border: "1.5px solid #fff" }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
