// 브라우저 전용 유틸 (클라이언트 컴포넌트에서만 사용)

// 공유 링크 업로드용 사진 압축
export const compressPhoto = (dataUrl: string): Promise<string> =>
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

export const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob 실패"))), "image/png")
  );

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

// Clipboard API를 못 쓰는 환경(인앱 브라우저, http 등)용 동기 복사
export const copyWithExecCommand = (text: string): boolean => {
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

// 공유 시트 호출. 사용자가 닫으면 "cancelled", 지원 안 되거나 실패하면 "failed"
export const shareWithSheet = async (data: ShareData): Promise<"done" | "cancelled" | "failed"> => {
  if (typeof navigator.share !== "function") return "failed";
  if (data.files && !navigator.canShare?.(data)) return "failed";
  try {
    await navigator.share(data);
    return "done";
  } catch (e) {
    return (e as DOMException)?.name === "AbortError" ? "cancelled" : "failed";
  }
};

export const isIOS = () =>
  /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPadOS

// 카카오톡·인스타그램 등 인앱 브라우저는 다운로드/파일 공유를 막는 경우가 많음
export const isInAppBrowser = () =>
  /KAKAOTALK|Instagram|FBAN|FBAV|Line\/|NAVER\(inapp|DaumApps|everytimeApp|; wv\)/i.test(navigator.userAgent);
