import type { ShareData } from "../lib/share";

export type CardFace = "photo" | "letter";

interface CardStackProps {
  data: ShareData;
  front: CardFace;
  onFlip: (face: CardFace) => void;
}

const TRANSITION = "transform 0.4s cubic-bezier(0.34, 1.4, 0.64, 1), box-shadow 0.4s ease";
const SHADOW_FRONT = "0 10px 30px rgba(0,0,0,0.20)";

// 메시지 카드와 사진 스트립을 겹쳐 놓은 포토카드. 뒤쪽 카드를 탭하면 앞으로 나옴
export default function CardStack({ data, front, onFlip }: CardStackProps) {
  const { photos, to, message, senderName } = data;
  const letterFront = front === "letter";
  const photoFront = front === "photo";

  return (
    <div style={{ position: "relative", width: 330, height: 620 }}>
      {/* 메시지 카드 — 가로형 324:247 비율 */}
      <div
        onClick={() => onFlip("letter")}
        style={{
          position: "absolute",
          top: 20,
          left: 5,
          width: 318,
          height: 243,
          backgroundImage: "url('/papercard2.png')",
          backgroundSize: "170%",
          backgroundPosition: "50% 70%",
          borderRadius: 10,
          padding: "16px 18px 14px",
          transform: letterFront ? "rotate(-7deg) scale(1.05)" : "rotate(-10deg) scale(1)",
          transformOrigin: "center center",
          zIndex: letterFront ? 4 : 1,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          boxShadow: letterFront ? SHADOW_FRONT : "0 3px 14px rgba(0,0,0,0.12)",
          cursor: letterFront ? "default" : "pointer",
          transition: TRANSITION,
        }}
      >
        {to && <p style={{ fontSize: 19, color: "var(--ink)" }}>To. {to}</p>}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p
            style={{
              fontSize: 19,
              color: "var(--pink)",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              textAlign: "center",
            }}
          >
            {message || "메시지가 없어요."}
          </p>
        </div>
        {senderName && (
          <p style={{ fontSize: 17, color: "var(--ink)", textAlign: "right" }}>From. {senderName}</p>
        )}
      </div>

      {/* 사진 스트립 */}
      <div
        onClick={() => onFlip("photo")}
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
          transform: photoFront ? "rotate(4deg) scale(1.03)" : "rotate(6deg) scale(1)",
          transformOrigin: "top center",
          zIndex: photoFront ? 4 : 3,
          boxShadow: photoFront ? SHADOW_FRONT : "0 4px 16px rgba(0,0,0,0.13)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          cursor: photoFront ? "default" : "pointer",
          transition: TRANSITION,
        }}
      >
        {[0, 1].map((i) => (
          <div key={i} style={{ height: 190, background: "#f0f0f0", borderRadius: 6, overflow: "hidden" }}>
            {photos[i] ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL이라 next/image 최적화 불가
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
        <p style={{ fontSize: 24, color: "var(--pink)", textAlign: "center", padding: "2px 0 4px" }}>
          ✨ To You ✨
        </p>
      </div>
    </div>
  );
}
