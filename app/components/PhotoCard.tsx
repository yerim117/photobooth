"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import CardStack, { type CardFace } from "./CardStack";
import SavePreview from "./SavePreview";
import Screen from "./Screen";
import type { ShareData } from "../lib/share";
import {
  canvasToBlob,
  compressPhoto,
  copyWithExecCommand,
  downloadBlob,
  isInAppBrowser,
  isIOS,
  shareWithSheet,
} from "../lib/browser";

interface PhotoCardProps extends ShareData {
  onRetake: () => void;
}

const FILE_NAME = "photocard.png";

export default function PhotoCard({ onRetake, ...data }: PhotoCardProps) {
  const { photos, to, message, senderName } = data;
  const [front, setFront] = useState<CardFace>("photo");
  const captureRef = useRef<HTMLDivElement>(null);

  // ── 포토카드 디자인 그대로 캡처 (회전된 카드가 잘리지 않도록 padding 있는 래퍼 기준)
  const captureCard = useCallback(async (): Promise<Blob> => {
    if (!captureRef.current) throw new Error("ref 없음");
    const canvas = await html2canvas(captureRef.current, {
      backgroundColor: "#FAF5E4",
      scale: 2,
      useCORS: true,
      logging: false,
    });
    return canvasToBlob(canvas);
  }, []);

  // ── 링크 공유 (2단계)
  // 모바일 브라우저는 탭 직후에만 공유·클립보드 API를 허용하므로
  // 첫 탭에서 업로드해 링크를 만들고, 두 번째 탭에서 공유 시트/복사를 실행
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
    const result = await shareWithSheet({ title: "포토카드가 도착했어요 💌", url });
    if (result !== "failed") return;

    if (copyWithExecCommand(url)) {
      alert("링크가 복사됐어요! 원하는 곳에 붙여넣기 해주세요 🔗");
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      alert("링크가 복사됐어요! 원하는 곳에 붙여넣기 해주세요 🔗");
    } catch {
      window.prompt("아래 링크를 복사해 주세요 🔗", url);
    }
  };

  // ── 사진 저장
  // iOS는 공유 시트("이미지 저장")를 탭 직후에만 띄울 수 있어서 카드 이미지를 미리 만들어 둠
  // (카드를 뒤집으면 전환 애니메이션 0.4s가 끝난 뒤 다시 생성)
  const preparedRef = useRef<{ front: CardFace; blob: Blob } | null>(null);
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const blob = await captureCard();
        if (!cancelled) preparedRef.current = { front, blob };
      } catch (e) {
        console.error(e);
      }
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [front, captureCard]);

  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<{ url: string; file: File } | null>(null);

  const closePreview = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const savePhoto = async () => {
    setSaving(true);
    try {
      const prepared = preparedRef.current;
      const blob = prepared?.front === front ? prepared.blob : await captureCard();
      const file = new File([blob], FILE_NAME, { type: "image/png" });
      const showPreview = () => setPreview({ url: URL.createObjectURL(blob), file });

      if (isInAppBrowser()) {
        showPreview(); // 다운로드·파일 공유가 막혀 있음
      } else if (isIOS()) {
        if ((await shareWithSheet({ files: [file] })) === "failed") showPreview();
      } else {
        downloadBlob(blob, FILE_NAME); // PC·Android
      }
    } catch (e) {
      console.error(e);
      alert("이미지 저장에 실패했어요.");
    } finally {
      setSaving(false);
    }
  };

  const buttons = [
    { key: "save", label: saving ? "저장 중…" : "save photo", onClick: savePhoto, disabled: saving },
    {
      key: "link",
      label: uploading ? "🔗 링크 만드는 중…" : shareUrl ? "📤 링크 보내기" : "share link",
      onClick: () => (shareUrl ? sendLink(shareUrl) : createLink()),
      disabled: uploading,
    },
    { key: "retake", label: "retake photo", onClick: onRetake, disabled: false },
  ];

  return (
    <Screen gap={32} padding="40px 24px">
      <div ref={captureRef} style={{ padding: "60px 70px", position: "relative" }}>
        <CardStack data={data} front={front} onFlip={setFront} />
      </div>

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
        {buttons.map(({ key, label, onClick, disabled }) => (
          <button
            key={key}
            onClick={onClick}
            disabled={disabled}
            style={{
              padding: "10px 20px",
              background: "#fff",
              border: "1.5px solid var(--pink)",
              borderRadius: 8,
              fontSize: 16,
              color: "var(--pink)",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.6 : 1,
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {preview && <SavePreview url={preview.url} file={preview.file} onClose={closePreview} />}
    </Screen>
  );
}
