"use client";

import { useState, useCallback } from "react";
import LoadingScreen, { type LoadingCompletePayload } from "./components/LoadingScreen";
import { Hero } from "./components/Hero";

export default function HomePage() {
  const [showLoading, setShowLoading] = useState(true);
  const [ignition, setIgnition] = useState<LoadingCompletePayload | null>(null);

  const handleLoadingComplete = useCallback((payload: LoadingCompletePayload) => {
    setIgnition(payload);
    setShowLoading(false);
  }, []);

  return (
    <>
      {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      <div
        className={`transition-opacity duration-[800ms] ease-out ${
          showLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        <Hero ignition={ignition} />
      </div>
    </>
  );
}
