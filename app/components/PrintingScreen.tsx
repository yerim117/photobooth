"use client";

import { useEffect } from "react";
import Screen from "./Screen";

interface PrintingScreenProps {
  photos: string[];
  onDone: () => void;
}

const PRINT_DURATION_MS = 2500;

export default function PrintingScreen({ photos, onDone }: PrintingScreenProps) {
  useEffect(() => {
    const t = setTimeout(onDone, PRINT_DURATION_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <Screen padding={0}>
      <p style={{ fontSize: 34, color: "var(--pink)" }}>now printing...</p>

      {/* 사진 2컷 미리보기 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          border: "6px solid var(--pink)",
          padding: 12,
          borderRadius: 8,
          background: "#f5ebbf",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        }}
      >
        {[0, 1].map((i) => (
          <div key={i} style={{ width: 160, height: 120, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
            {photos[i] && (
              // eslint-disable-next-line @next/next/no-img-element -- data URL이라 next/image 최적화 불가
              <img
                src={photos[i]}
                alt={`photo ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>
        ))}
      </div>
    </Screen>
  );
}
