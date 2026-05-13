"use client";

import { useEffect } from "react";
import Background from "./Background";

interface PrintingScreenProps {
  photos: string[];
  onDone: () => void;
}

export default function PrintingScreen({ photos, onDone }: PrintingScreenProps) {
  // 2.5초 후 자동으로 다음 화면으로
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        position: "relative",
      }}
    >
      <Background />

      <p
        style={{
          fontSize: 34,
          color: "rgba(255, 0, 123, 0.9)",
          zIndex: 1,
        }}
      >
        now printing...
      </p>

      {/* 사진 2컷 미리보기 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          border: "6px solid var(--gold)",
          padding: 12,
          borderRadius: 8,
          background: "#fff",
          zIndex: 1,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              width: 160,
              height: 120,
              background: "#f0f0f0",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            {photos[i] && (
              <img
                src={photos[i]}
                alt={`photo ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
