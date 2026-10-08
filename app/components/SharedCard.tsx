"use client";

import { useState } from "react";
import CardStack, { type CardFace } from "./CardStack";
import Screen from "./Screen";
import type { ShareData } from "../lib/share";

// 링크 오류 / 로딩 등 안내 문구 화면
export function ShareNotice({ text, fontSize = 36 }: { text: string; fontSize?: number }) {
  return (
    <Screen gap={12} padding={0}>
      <p style={{ fontSize, color: "var(--pink)" }}>{text}</p>
    </Screen>
  );
}

// 받는 사람이 보는 포토카드
export default function SharedCard({ data }: { data: ShareData }) {
  const [front, setFront] = useState<CardFace>("photo");

  return (
    <Screen gap={32} padding="40px 24px">
      <CardStack data={data} front={front} onFlip={setFront} />
      <p style={{ fontSize: 20, color: "var(--pink)", opacity: 0.7, zIndex: 3 }}>tap to flip 💌</p>
    </Screen>
  );
}
