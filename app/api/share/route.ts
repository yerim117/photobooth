import { randomBytes } from "node:crypto";
import { put } from "@vercel/blob";
import { BLOB_ACCESS } from "../../lib/blob";
import { LIMITS, sharePathname, validateUpload } from "../../lib/share";

// 포토카드 저장 → 짧은 공유 ID 발급
export async function POST(req: Request) {
  const body = await req.text();
  if (body.length > LIMITS.bodyBytes) {
    return Response.json({ error: "too_large" }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(body);
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const data = validateUpload(raw);
  if (!data) {
    return Response.json({ error: "invalid_data" }, { status: 400 });
  }

  const id = randomBytes(16).toString("base64url");
  try {
    await put(sharePathname(id), JSON.stringify(data), {
      access: BLOB_ACCESS,
      contentType: "application/json",
      addRandomSuffix: false,
    });
  } catch (e) {
    console.error("blob put 실패", e);
    return Response.json({ error: "storage_failed" }, { status: 500 });
  }

  return Response.json({ id });
}
