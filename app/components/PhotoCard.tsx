"use client";

import { useCallback, useRef, useState } from "react";
import html2canvas from "html2canvas";
import LZString from "lz-string";
import Background from "./Background";

interface PhotoCardProps {
  photos: string[];
  to: string;
  message: string;
  senderName: string;
  onRetake: () => void;
}

export default function PhotoCard({ photos, to, message, senderName, onRetake }: PhotoCardProps) {
  const [sharing, setSharing] = useState(false);
  const [front, setFront] = useState<"photo" | "letter">("photo");
  const captureWrapperRef = useRef<HTMLDivElement>(null);

  // ── 포토카드 디자인 그대로 캡처 (래퍼 기준으로 캡처해 회전 잘림 방지)
  const captureCard = useCallback(async (): Promise<HTMLCanvasElement> => {
    if (!captureWrapperRef.current) throw new Error("ref 없음");
    return await html2canvas(captureWrapperRef.current, {
      backgroundColor: "#FAF5E4",
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
    });
  }, []);

  // ── 사진 압축 (URL 공유용)
  const compressPhoto = (dataUrl: string): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 480;
        let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        c.getContext("2d")!.drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL("image/jpeg", 0.45));
      };
      img.src = dataUrl;
    });

  // ── 링크 공유
  const [linking, setLinking] = useState(false);
  const shareLink = async () => {
    setLinking(true);
    try {
      const compressed = await Promise.all(photos.map(compressPhoto));
      const payload = JSON.stringify({ photos: compressed, to, message, senderName });
      const encoded = LZString.compressToEncodedURIComponent(payload);
      const url = `${window.location.origin}/share/#${encoded}`;
      await navigator.clipboard.writeText(url);
      alert("링크가 복사됐어요! 원하는 곳에 붙여넣기 해주세요 🔗");
    } catch (e) {
      console.error(e);
      alert("링크 생성에 실패했어요.");
    } finally {
      setLinking(false);
    }
  };

  // ── 저장하기
  const downloadStrip = async () => {
    const canvas = await captureCard();
    const link = document.createElement("a");
    link.download = "photocard.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // ── 공유하기 (3단계 폴백)
  const shareStrip = async () => {
    setSharing(true);
    try {
      const canvas = await captureCard();
      const blob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b!), "image/png")
      );
      const file = new File([blob], "photocard.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      alert("이미지가 클립보드에 복사됐어요!\n원하는 곳에 붙여넣기 해주세요 🔗");
    } catch {
      const canvas = await captureCard();
      const link = document.createElement("a");
      link.download = "photocard.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setSharing(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        padding: "40px 24px",
        position: "relative",
      }}
    >
      <Background />

      {/* 캡처 래퍼 — 회전된 카드가 잘리지 않도록 충분한 padding 확보 */}
      <div ref={captureWrapperRef} style={{ padding: "60px 70px", position: "relative" }}>
      {/* 카드 두 장 겹침 컨테이너 */}
      {/* 페이퍼 카드(landscape) 위, 사진 스트립 아래에서 포개짐 */}
      <div style={{ position: "relative", width: 330, height: 620 }}>

        {/* 메시지 카드 — 가로형(landscape) 324:247 비율, 위쪽에 -10deg */}
        <div
          onClick={() => setFront("letter")}
          style={{
            position: "absolute",
            top: 20,
            left: 5,
            width: 318,
            height: 243,   /* 318 × (247/324) ≈ 243 */
            backgroundImage: "url('/papercard2.png')",
            backgroundSize: "170%",
            backgroundPosition: "50% 70%",
            borderRadius: 10,
            padding: "16px 18px 14px",
            transform: front === "letter"
              ? "rotate(-7deg) scale(1.05)"
              : "rotate(-10deg) scale(1)",
            transformOrigin: "center center",
            zIndex: front === "letter" ? 4 : 1,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            boxShadow: front === "letter"
              ? "0 10px 30px rgba(0,0,0,0.20)"
              : "0 3px 14px rgba(0,0,0,0.12)",
            cursor: front === "letter" ? "default" : "pointer",
            transition: "transform 0.4s cubic-bezier(0.34, 1.4, 0.64, 1), box-shadow 0.4s ease",
          }}
        >
          {to && (
            <p
              style={{
                fontSize: 19,
                color: "var(--brown)",
              }}
            >
              To. {to}
            </p>
          )}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p
              style={{
                fontSize: 19,
                color: "rgba(247, 173, 209, 0.9)",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                textAlign: "center",
              }}
            >
              {message || "메시지가 없어요."}
            </p>
          </div>
          {senderName && (
            <p
              style={{
                fontSize: 17,
                color: "var(--brown)",
                textAlign: "right",
                width: "100%",
              }}
            >
              From. {senderName}
            </p>
          )}
        </div>

        {/* 사진 스트립 — 페이퍼 카드 위에 포개져서 아래로, +4deg */}
        <div
          onClick={() => setFront("photo")}
          style={{
            position: "absolute",
            top: 100,
            left: 8,
            width: 285,
            backgroundImage: "url('/photocard-color.JPG')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 10,
            padding: "12px 12px 8px",
            transform: front === "photo"
              ? "rotate(4deg) scale(1.03)"
              : "rotate(6deg) scale(1)",
            transformOrigin: "top center",
            zIndex: front === "photo" ? 4 : 3,
            boxShadow: front === "photo"
              ? "0 10px 30px rgba(0,0,0,0.20)"
              : "0 4px 16px rgba(0,0,0,0.13)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            cursor: front === "photo" ? "default" : "pointer",
            transition: "transform 0.4s cubic-bezier(0.34, 1.4, 0.64, 1), box-shadow 0.4s ease",
          }}
        >
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                height: 190,
                background: "#f0f0f0",
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              {photos[i] ? (
                <img
                  src={photos[i]}
                  alt={`photo ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#bbb",
                    fontSize: 12,
                  }}
                >
                  photo {i + 1}
                </div>
              )}
            </div>
          ))}

          <p
            style={{
              fontSize: 24,
              color: "rgba(247, 173, 209, 0.9)",
              textAlign: "center",
              padding: "2px 0 4px",
            }}
          >
            ✨ To You ✨
          </p>
        </div>
      </div>
      </div>{/* captureWrapperRef 끝 */}

      {/* 버튼 행 */}
      <div
        style={{
          display: "flex",
          gap: 10,
          zIndex: 3,
          position: "relative",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          { label: "save photo", onClick: downloadStrip, disabled: false },
          { label: linking ? "🔗 링크 생성 중…" : "share link", onClick: shareLink, disabled: linking },
          { label: "retake photo", onClick: onRetake, disabled: false },
        ].map(({ label, onClick, disabled }) => (
          <button
            key={label}
            onClick={onClick}
            disabled={disabled}
            style={{
              padding: "10px 20px",
              background: "var(--white)",
              border: "1.5px solid var(--brown)",
              borderRadius: 8,
              fontSize: 16,
              color: "rgba(247, 173, 209, 0.9)",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.6 : 1,
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
