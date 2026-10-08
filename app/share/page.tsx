"use client";

// 예전 방식(/share#<압축 데이터>) 링크 호환용. 새 링크는 /share/[id] 사용.
import { useMemo, useSyncExternalStore } from "react";
import LZString from "lz-string";
import SharedCard, { ShareNotice } from "../components/SharedCard";
import { parseShareData, type ShareData } from "../lib/share";

// URL 해시를 외부 스토어로 구독 (서버 렌더링 시에는 null → loading 표시)
const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const getHash = () => window.location.hash.slice(1);
const getServerHash = () => null;

function decodeShareHash(hash: string): ShareData | null {
  try {
    if (!hash) return null;
    const decompressed = LZString.decompressFromEncodedURIComponent(hash);
    if (!decompressed) return null;
    return parseShareData(JSON.parse(decompressed));
  } catch {
    return null;
  }
}

export default function LegacySharePage() {
  const hash = useSyncExternalStore(subscribeHash, getHash, getServerHash);
  const data = useMemo(() => (hash === null ? null : decodeShareHash(hash)), [hash]);

  if (hash === null) return <ShareNotice text="loading..." fontSize={28} />;
  if (!data) return <ShareNotice text="링크가 유효하지 않아요 💌" />;
  return <SharedCard data={data} />;
}
