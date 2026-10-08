"use client";

import { useState } from "react";
import Screen from "./Screen";
import { LIMITS } from "../lib/share";

interface IntroScreenProps {
  onStart: (to: string, message: string, senderName: string) => void;
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 4,
  fontSize: 24,
  color: "var(--brown)",
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
  color: "var(--brown)",
  resize: "none",
};

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
  multiline?: boolean;
}

function Field({ id, label, value, onChange, placeholder, maxLength, multiline }: FieldProps) {
  const common = {
    id,
    value,
    placeholder,
    maxLength,
    style: inputStyle,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
  };
  return (
    <div>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      {multiline ? <textarea rows={2} {...common} /> : <input type="text" {...common} />}
    </div>
  );
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");

  return (
    <Screen gap={20}>
      <div
        style={{
          width: 340,
          backgroundImage: "url('/paper-card.jpg')",
          backgroundSize: "120%",
          backgroundPosition: "center",
          borderRadius: 12,
          padding: "20px 20px 24px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <p style={{ fontSize: 56, color: "var(--brown)", textAlign: "center", lineHeight: 1.2 }}>
          Photo Booth
        </p>
        <Field
          id="intro-to"
          label="To :"
          value={to}
          onChange={setTo}
          placeholder="Enter recipient name"
          maxLength={LIMITS.to}
        />
        <Field
          id="intro-message"
          label="Message :"
          value={message}
          onChange={setMessage}
          placeholder="Type your message..."
          maxLength={LIMITS.message}
          multiline
        />
        <Field
          id="intro-from"
          label="from :"
          value={senderName}
          onChange={setSenderName}
          placeholder="Enter your name"
          maxLength={LIMITS.senderName}
        />
      </div>

      <button
        onClick={() => onStart(to.trim(), message.trim(), senderName.trim())}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          width: 200,
          padding: "13px 0",
          background: "var(--brown)",
          color: "#fff",
          border: "none",
          borderRadius: 16,
          fontSize: 18,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 3px 10px rgba(75,46,43,0.35)",
        }}
      >
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(255, 237, 210, 0.8)" }} />
        START
      </button>
    </Screen>
  );
}
