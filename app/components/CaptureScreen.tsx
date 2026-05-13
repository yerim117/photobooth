"use client";

import { useRef, useEffect, useState, useCallback } from "react";

type Phase = "init" | "ready" | "countdown" | "flash" | "pause" | "done";

interface CaptureScreenProps {
  onComplete: (photos: string[]) => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function CaptureScreen({ onComplete }: CaptureScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shootingStarted = useRef(false);

  const [phase, setPhase] = useState<Phase>("init");
  const [count, setCount] = useState(3);
  const [countKey, setCountKey] = useState(0);
  const [shotIndex, setShotIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 카메라 초기화
  useEffect(() => {
    let stream: MediaStream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 960, facingMode: "user" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise<void>((res) => {
            videoRef.current!.oncanplay = () => res();
          });
        }
        setPhase("ready");
      } catch {
        setError("카메라 접근 권한이 필요합니다. 브라우저 주소창 옆 카메라 아이콘을 클릭해 허용해주세요.");
      }
    })();
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  // 사진 캡처 (좌우반전 = 셀카)
  const capturePhoto = useCallback((): string => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return "";
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.restore();
    return canvas.toDataURL("image/jpeg", 0.92);
  }, []);

  // 촬영 시퀀스: ready 상태가 되면 자동 시작
  useEffect(() => {
    if (phase !== "ready" || shootingStarted.current) return;
    shootingStarted.current = true;

    const shoot = async () => {
      await sleep(1000); // 카메라 안정화 대기

      const photos: string[] = [];

      for (let shot = 0; shot < 2; shot++) {
        setShotIndex(shot);

        // 카운트다운 3 → 2 → 1
        setPhase("countdown");
        for (let i = 3; i >= 1; i--) {
          setCount(i);
          setCountKey((k) => k + 1);
          await sleep(950);
        }

        // 플래시 → 사진 캡처
        setPhase("flash");
        await sleep(80);
        photos.push(capturePhoto());
        await sleep(500);

        // 2번째 촬영 전 짧은 브레이크
        if (shot < 1) {
          setPhase("pause");
          await sleep(1200);
        }
      }

      setPhase("done");
      await sleep(300);
      onComplete(photos);
    };

    shoot();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (error) {
    return (
      <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#000", color: "#fff", gap: 16, padding: 24, textAlign: "center" }}>
        <p style={{ color: "#f87171" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: "#000" }}>
      {/* 카메라 피드 (약간 어둡게) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)",
          filter: "brightness(0.6)",
        }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* 흰 플래시 */}
      {phase === "flash" && (
        <div className="flash-anim" style={{ position: "absolute", inset: 0, background: "#fff", zIndex: 30 }} />
      )}

      {/* 카운트다운 숫자 */}
      {phase === "countdown" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}>
          <span
            key={countKey}
            className="count-anim"
            style={{ fontSize: "clamp(140px, 25vw, 200px)", color: "rgba(247, 173, 209, 0.9)", fontStyle: "italic", lineHeight: 1 }}
          >
            {count}
          </span>
        </div>
      )}

      {/* 준비 중 */}
      {phase === "init" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}>
          <p style={{ color: "rgba(247, 173, 209, 0.9)", fontSize: 18 }}>Ready...</p>
        </div>
      )}

      {/* 다음 사진 준비 안내 */}
      {phase === "pause" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}>
          <p style={{ color: "rgba(247, 173, 209, 0.9)", fontSize: 24, fontStyle: "italic" }}>
            Next!
          </p>
        </div>
      )}

      {/* 촬영 진행 표시 (1/2, 2/2) */}
      {(phase === "countdown" || phase === "pause") && (
        <div style={{ position: "absolute", top: 24, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 20 }}>
          <span style={{ color: "rgba(247, 173, 209, 0.9)", fontSize: 14, letterSpacing: "0.2em" }}>
            {shotIndex + 1} / 2
          </span>
        </div>
      )}

      {/* 점 인디케이터 (우하단) */}
      <div style={{ position: "absolute", bottom: 32, right: 32, display: "flex", gap: 10, zIndex: 20 }}>
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              width: 10, height: 10, borderRadius: "50%",
              background: i < shotIndex ? "#fff" : i === shotIndex && phase !== "init" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
