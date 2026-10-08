"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import Background from "./Background";

interface PhotoCardProps {
  photos: string[];
  to: string;
  message: string;
  senderName: string;
  onRetake: () => void;
}

// ── 사진 압축 (URL 공유용)
const compressPhoto = (dataUrl: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 480;
      let w = img.width, h = img.height;
      if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) { reject(new Error("canvas context 없음")); return; }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/jpeg", 0.45));
    };
    img.onerror = () => reject(new Error("이미지 로드 실패"));
    img.src = dataUrl;
  });

// ── Clipboard API를 못 쓰는 환경(인앱 브라우저, http 등)용 동기 복사
const copyWithExecCommand = (text: string): boolean => {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.top = "0";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, text.length); // iOS Safari는 select()만으로 선택되지 않음
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
};

// ── 환경 감지 (사진 저장 방식 선택용)
const isMobile = () =>
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPadOS

// 카카오톡·인스타그램 등 인앱 브라우저는 다운로드/파일 공유를 막는 경우가 많음
const isInAppBrowser = () =>
  /KAKAOTALK|Instagram|FBAN|FBAV|Line\/|NAVER\(inapp|DaumApps|everytimeApp|; wv\)/i.test(navigator.userAgent);

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob 실패"))), "image/png")
  );

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

export default function PhotoCard({ photos, to, message, senderName, onRetake }: PhotoCardProps) {
  const [saving, setSaving] = useState(false);
  const [front, setFront] = useState<"photo" | "letter">("photo");
  const captureWrapperRef = useRef<HTMLDivElement>(null);

  // ── 포토카드 디자인 그대로 캡처 (래퍼 기준으로 캡처해 회전 잘림 방지)
  // allowTaint를 켜면 캔버스가 오염돼 toDataURL이 SecurityError를 던질 수 있으므로 사용하지 않음
  const captureCard = useCallback(async (): Promise<HTMLCanvasElement> => {
    if (!captureWrapperRef.current) throw new Error("ref 없음");
    return await html2canvas(captureWrapperRef.current, {
      backgroundColor: "#FAF5E4",
      scale: 2,
      useCORS: true,
      logging: false,
    });
  }, []);

  // ── 링크 공유 (2단계)
  // 1) 첫 탭: 사진을 서버(Vercel Blob)에 올리고 짧은 링크 발급
  // 2) 두 번째 탭: 공유 시트/복사 실행
  // 모바일 브라우저는 탭 직후에만 공유·클립보드 API를 허용하므로, 업로드를 기다린 뒤가 아니라
  // 새 탭(사용자 제스처) 안에서 바로 호출해야 함.
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const createLink = async () => {
    setUploading(true);
    try {
      const compressed = await Promise.all(photos.filter(Boolean).map(compressPhoto));
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: compressed, to, message, senderName }),
      });
      if (!res.ok) throw new Error(`share API ${res.status}`);
      const { id } = (await res.json()) as { id: string };
      setShareUrl(`${window.location.origin}/share/${id}`);
    } catch (e) {
      console.error(e);
      alert("링크 생성에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setUploading(false);
    }
  };

  const sendLink = async (url: string) => {
    // 1) 모바일: 네이티브 공유 시트
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "포토카드가 도착했어요 💌", url });
        return;
      } catch (e) {
        if ((e as DOMException)?.name === "AbortError") return; // 사용자가 공유 시트를 닫음
      }
    }

    // 2) 동기 복사 — 제스처 안에서 바로 실행되므로 인앱 브라우저에서도 동작
    if (copyWithExecCommand(url)) {
      alert("링크가 복사됐어요! 원하는 곳에 붙여넣기 해주세요 🔗");
      return;
    }

    // 3) Clipboard API
    try {
      await navigator.clipboard.writeText(url);
      alert("링크가 복사됐어요! 원하는 곳에 붙여넣기 해주세요 🔗");
    } catch {
      window.prompt("아래 링크를 복사해 주세요 🔗", url);
    }
  };

  const shareLink = () => (shareUrl ? sendLink(shareUrl) : createLink());

  // ── 저장하기
  // 모바일은 공유 시트("이미지 저장")를 써야 하는데, 탭 직후에만 허용되므로
  // 카드 이미지를 미리 렌더링해 둠 (카드를 뒤집으면 전환 애니메이션 후 다시 렌더링)
  const preparedRef = useRef<{ front: string; blob: Blob } | null>(null);
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const blob = await canvasToBlob(await captureCard());
        if (!cancelled) preparedRef.current = { front, blob };
      } catch (e) {
        console.error(e);
      }
    }, 600); // transition(0.4s)이 끝난 뒤 캡처
    return () => { cancelled = true; clearTimeout(t); };
  }, [front, captureCard]);

  // 공유 시트/다운로드가 막힌 환경에서 띄우는 "길게 눌러 저장" 미리보기
  const [preview, setPreview] = useState<{ url: string; file: File } | null>(null);
  const closePreview = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const shareFile = async (file: File): Promise<"done" | "cancelled" | "failed"> => {
    if (!navigator.canShare?.({ files: [file] })) return "failed";
    try {
      await navigator.share({ files: [file] });
      return "done";
    } catch (e) {
      return (e as DOMException)?.name === "AbortError" ? "cancelled" : "failed";
    }
  };

  const downloadStrip = async () => {
    setSaving(true);
    try {
      const ready = preparedRef.current?.front === front ? preparedRef.current.blob : null;
      const blob = ready ?? (await canvasToBlob(await captureCard()));
      const file = new File([blob], "photocard.png", { type: "image/png" });

      if (!isMobile()) {
        downloadBlob(blob, "photocard.png");
        return;
      }

      // 모바일: 공유 시트 → 실패 시 길게 눌러 저장 안내
      if (!isInAppBrowser()) {
        const result = await shareFile(file);
        if (result !== "failed") return;
      }
      setPreview({ url: URL.createObjectURL(blob), file });
    } catch (e) {
      console.error(e);
      alert("이미지 저장에 실패했어요.");
    } finally {
      setSaving(false);
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
                color: "#342323",
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
                color: "#342323",
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
          { key: "save", label: saving ? "저장 중…" : "save photo", onClick: downloadStrip, disabled: saving },
          { key: "link", label: uploading ? "🔗 링크 만드는 중…" : shareUrl ? "📤 링크 보내기" : "share link", onClick: shareLink, disabled: uploading },
          { key: "retake", label: "retake photo", onClick: onRetake, disabled: false },
        ].map(({ key, label, onClick, disabled }) => (
          <button
            key={key}
            onClick={onClick}
            disabled={disabled}
            style={{
              padding: "10px 20px",
              background: "var(--white)",
              border: "1.5px solid var(--card-bg)",
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

      {/* 길게 눌러 저장 미리보기 (인앱 브라우저 등) */}
      {preview && (
        <div
          onClick={closePreview}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.8)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 16, padding: 24,
          }}
        >
          <p style={{ color: "#fff", fontSize: 17, textAlign: "center", lineHeight: 1.5 }}>
            사진을 길게 눌러 저장해 주세요 📸
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.url}
            alt="포토카드"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 8, WebkitTouchCallout: "default" }}
          />
          <div style={{ display: "flex", gap: 10 }} onClick={(e) => e.stopPropagation()}>
            {typeof navigator !== "undefined" && navigator.canShare?.({ files: [preview.file] }) && (
              <button
                onClick={() => shareFile(preview.file)}
                style={{ padding: "10px 20px", background: "#fff", border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer" }}
              >
                공유 / 저장
              </button>
            )}
            <button
              onClick={closePreview}
              style={{ padding: "10px 20px", background: "transparent", color: "#fff", border: "1.5px solid #fff", borderRadius: 8, fontSize: 16, cursor: "pointer" }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
