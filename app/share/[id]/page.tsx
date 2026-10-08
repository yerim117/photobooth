import type { Metadata } from "next";
import { get } from "@vercel/blob";
import SharedCard, { ShareNotice } from "../../components/SharedCard";
import { BLOB_ACCESS } from "../../lib/blob";
import { parseShareData, SHARE_ID_RE, sharePathname, type ShareData } from "../../lib/share";

// 메신저 링크 미리보기용
export const metadata: Metadata = {
  title: "포토카드가 도착했어요 💌",
  description: "2컷 포토부스에서 보낸 사진과 메시지를 확인해 보세요.",
};

async function loadShare(id: string): Promise<ShareData | null> {
  if (!SHARE_ID_RE.test(id)) return null;
  try {
    const result = await get(sharePathname(id), { access: BLOB_ACCESS });
    if (!result || result.statusCode !== 200) return null;
    return parseShareData(await new Response(result.stream).json());
  } catch (e) {
    console.error("blob get 실패", e);
    return null;
  }
}

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await loadShare(id);
  if (!data) return <ShareNotice text="링크가 유효하지 않아요 💌" />;
  return <SharedCard data={data} />;
}
