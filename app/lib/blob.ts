import "server-only";

// 사진이 공개 URL로 노출되지 않도록 private 스토어를 기본으로 사용.
// public 스토어를 연결했다면 BLOB_ACCESS=public 으로 지정.
export const BLOB_ACCESS: "public" | "private" =
  process.env.BLOB_ACCESS === "public" ? "public" : "private";
