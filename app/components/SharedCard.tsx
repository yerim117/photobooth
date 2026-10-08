"use client";

import { useState } from "react";
import Background from "./Background";
import type { ShareData } from "../lib/share";

// 링크 오류 / 로딩 등 안내 문구 화면
export function ShareNotice({ text, fontSize = 36 }: { text: string; fontSize?: number }) {
  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 12, position: "relative",
    }}>
      <Background />
      <p style={{ fontSize, color: "var(--card-bg)" }}>
        {text}
      </p>
    </div>
  );
}

// 받는 사람이 보는 포토카드
export default function SharedCard({ data }: { data: ShareData }) {
  const [front, setFront] = useState<"photo" | "letter">("photo");
  const { photos, to, message, senderName } = data;

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 32, padding: "40px 24px", position: "relative",
    }}>
      <Background />

      {/* 카드 두 장 겹침 컨테이너 */}
      <div style={{ position: "relative", width: 330, height: 620 }}>

        {/* 메시지 카드 */}
        <div
          onClick={() => setFront("letter")}
          style={{
            position: "absolute",
            top: 20, left: 5,
            width: 318, height: 243,
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
            display: "flex", flexDirection: "column", gap: 8,
            boxShadow: front === "letter"
              ? "0 10px 30px rgba(0,0,0,0.20)"
              : "0 3px 14px rgba(0,0,0,0.12)",
            cursor: front === "letter" ? "default" : "pointer",
            transition: "transform 0.4s cubic-bezier(0.34, 1.4, 0.64, 1), box-shadow 0.4s ease",
          }}
        >
          {to && (
            <p style={{ fontSize: 19, color: "#342323" }}>
              To. {to}
            </p>
          )}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{
              fontSize: 19, color: "var(--card-bg)",
              lineHeight: 1.7, whiteSpace: "pre-wrap", textAlign: "center",
            }}>
              {message || "메시지가 없어요."}
            </p>
          </div>
          {senderName && (
            <p style={{
              fontSize: 17, color: "#342323",
              textAlign: "right", width: "100%",
            }}>
              From. {senderName}
            </p>
          )}
        </div>

        {/* 사진 스트립 */}
        <div
          onClick={() => setFront("photo")}
          style={{
            position: "absolute",
            top: 100, left: 8, width: 285,
            backgroundImage: "url('/photocard-color.JPG')",
            backgroundSize: "cover", backgroundPosition: "center",
            borderRadius: 10, padding: "12px 12px 8px",
            transform: front === "photo"
              ? "rotate(4deg) scale(1.03)"
              : "rotate(6deg) scale(1)",
            transformOrigin: "top center",
            zIndex: front === "photo" ? 4 : 3,
            boxShadow: front === "photo"
              ? "0 10px 30px rgba(0,0,0,0.20)"
              : "0 4px 16px rgba(0,0,0,0.13)",
            display: "flex", flexDirection: "column", gap: 10,
            cursor: front === "photo" ? "default" : "pointer",
            transition: "transform 0.4s cubic-bezier(0.34, 1.4, 0.64, 1), box-shadow 0.4s ease",
          }}
        >
          {[0, 1].map((i) => (
            <div key={i} style={{ height: 190, background: "#f0f0f0", borderRadius: 6, overflow: "hidden" }}>
              {photos[i] ? (
                <img
                  src={photos[i]}
                  alt={`photo ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{
                  width: "100%", height: "100%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#bbb", fontSize: 12,
                }}>
                  photo {i + 1}
                </div>
              )}
            </div>
          ))}
          <p style={{
            fontSize: 24, color: "var(--card-bg)",
            textAlign: "center", padding: "2px 0 4px",
          }}>
            ✨ To You ✨
          </p>
        </div>
      </div>

      {/* 안내 문구 */}
      <p style={{
        fontSize: 20, color: "var(--card-bg)",
        opacity: 0.7, zIndex: 3,
      }}>
        tap to flip 💌
      </p>
    </div>
  );
}
