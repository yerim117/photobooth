"use client";

import { useState } from "react";
import IntroScreen from "./components/IntroScreen";
import CaptureScreen from "./components/CaptureScreen";
import PrintingScreen from "./components/PrintingScreen";
import PhotoCard from "./components/PhotoCard";

type AppState = "intro" | "shooting" | "printing" | "reveal";

export default function Home() {
  const [state, setState] = useState<AppState>("intro");
  const [photos, setPhotos] = useState<string[]>([]);
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");

  const handleStart = (t: string, m: string, s: string) => {
    setTo(t);
    setMessage(m);
    setSenderName(s);
    setState("shooting");
  };

  const handlePhotosComplete = (captured: string[]) => {
    setPhotos(captured);
    setState("printing");
  };

  const handleRetake = () => {
    setPhotos([]);
    setState("intro");
  };

  return (
    <main style={{ width: "100%", minHeight: "100vh", overflow: "hidden" }}>
      {state === "intro" && <IntroScreen onStart={handleStart} />}

      {state === "shooting" && (
        <CaptureScreen onComplete={(captured) => handlePhotosComplete(captured)} />
      )}

      {state === "printing" && (
        <PrintingScreen photos={photos} onDone={() => setState("reveal")} />
      )}

      {state === "reveal" && (
        <PhotoCard
          photos={photos}
          to={to}
          message={message}
          senderName={senderName}
          onRetake={handleRetake}
        />
      )}
    </main>
  );
}
