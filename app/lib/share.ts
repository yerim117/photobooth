export interface ShareData {
  photos: string[];
  to: string;
  message: string;
  senderName: string;
}

// 입력 폼(IntroScreen)의 maxLength와 맞춤
export const LIMITS = {
  photos: 2,
  photoBytes: 300_000, // 압축된 data URL 한 장당 최대 길이
  to: 20,
  message: 120,
  senderName: 20,
  bodyBytes: 1_000_000,
} as const;

// 공유 ID: 16바이트 랜덤 → base64url 22자
export const SHARE_ID_RE = /^[A-Za-z0-9_-]{22}$/;

export const sharePathname = (id: string) => `shares/${id}.json`;

// 외부(URL 해시, 저장소)에서 들어온 데이터를 화면에 쓰기 전 구조와 이미지 형식을 검증
export function parseShareData(raw: unknown): ShareData | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  if (!Array.isArray(r.photos)) return null;
  const photos = r.photos.filter(
    (p): p is string => typeof p === "string" && p.startsWith("data:image/")
  );
  return { photos, to: str(r.to), message: str(r.message), senderName: str(r.senderName) };
}

// 업로드용 엄격한 검증 — 누구나 API를 호출할 수 있으므로 크기·형식을 제한
export function validateUpload(raw: unknown): ShareData | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const { photos, to, message, senderName } = r;
  if (!Array.isArray(photos) || photos.length < 1 || photos.length > LIMITS.photos) return null;
  const photosOk = photos.every(
    (p) =>
      typeof p === "string" &&
      p.startsWith("data:image/jpeg;base64,") &&
      p.length <= LIMITS.photoBytes
  );
  if (!photosOk) return null;
  const strOk = (v: unknown, max: number) => typeof v === "string" && v.length <= max;
  if (!strOk(to, LIMITS.to) || !strOk(message, LIMITS.message) || !strOk(senderName, LIMITS.senderName)) {
    return null;
  }
  return { photos: photos as string[], to: to as string, message: message as string, senderName: senderName as string };
}
