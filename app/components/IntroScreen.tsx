"use client";

import { useState } from "react";
import Background from "./Background";

interface IntroScreenProps {
  onStart: (to: string, message: string, senderName: string) => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");

  const labelStyle: React.CSSProperties = {
    fontStyle: "normal",
    fontSize: 24,
    fontWeight: 400,
    color: "#4B2E2B",
    display: "block",
    marginBottom: 4,
  };

  const inputStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1.5px dashed #ffffff",
    outline: "none",
    padding: "4px 2px 6px",
    fontSize: 20,
    fontWeight: 600,
    color: "#4B2E2B",
  };

  const fieldWrap: React.CSSProperties = {
    marginBottom: 20,
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: 24,
        position: "relative",
      }}
    >
      <Background />

      <div
        style={{
          width: 340,
          backgroundImage: "url('/paper-card.jpg')",
          backgroundSize: "120%",
          backgroundPosition: "center",
          borderRadius: 12,
          padding: "20px 20px 24px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* 헤더 */}
        <p
          style={{
            fontSize: 56,
            fontWeight: 400,
            color: "#4B2E2B",
            textAlign: "center",
            marginBottom: 20,
            lineHeight: 1.2,
          }}
        >
          Photo Booth
        </p>

        {/* To */}
        <div style={fieldWrap}>
          <label style={labelStyle}>To :</label>
          <input
            type="text"
            className="cursive-input"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Enter recipient name"
            maxLength={20}
            style={inputStyle}
          />
        </div>

        {/* Message */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Message :</label>
          <textarea
            className="cursive-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            maxLength={120}
            rows={2}
            style={{
              ...inputStyle,
              resize: "none",
              lineHeight: 1.7,
            }}
          />
        </div>

        {/* from */}
        <div style={{ ...fieldWrap, marginBottom: 0 }}>
          <label style={labelStyle}>from :</label>
          <input
            type="text"
            className="cursive-input"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
            style={inputStyle}
          />
        </div>
      </div>

      {/* 시작 버튼*/}
      <button
        onClick={() => onStart(to.trim(), message.trim(), senderName.trim())}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          width: 200,
          padding: "13px 0",
          background: "#4B2E2B",
          color: "#fff",
          border: "none",
          borderRadius: 16,
          fontSize: 18,
          fontWeight: 600,
          cursor: "pointer",
          zIndex: 1,
          boxShadow: "0 3px 10px rgba(75,46,43,0.35)",
        }}
      >
        <span style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "rgba(255, 237, 210, 0.8)",
          flexShrink: 0,
        }} />
        START
      </button>
    </div>
  );
}