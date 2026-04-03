"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import LoadingScreen, { type LoadingCompletePayload } from "./components/LoadingScreen";
import { Hero } from "./components/Hero";
import { Projects } from "./components/Projects";
import { Experience } from "./components/Experience";
import { Canvas } from "@react-three/fiber";
import { PipeSystem } from "./components/PipeSystem";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

export default function HomePage() {
  const [showLoading, setShowLoading] = useState(true);
  const [ignition, setIgnition] = useState<LoadingCompletePayload | null>(null);
  const [energized, setEnergized] = useState<Set<number>>(new Set());

  const handleLoadingComplete = useCallback((payload: LoadingCompletePayload) => {
    setIgnition(payload);
    setShowLoading(false);
  }, []);

  const handleTargetReached = useCallback((index: number) => {
    setEnergized((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  useEffect(() => {
    if (showLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showLoading]);

  // Define UI targets globally so PipeSystem can reach them across sections
  const targets = useMemo(() => [
    // Navbar targets (top row)
    { x: -0.4, y: 0.8 },
    { x: -0.15, y: 0.8 },
    { x: 0.15, y: 0.8 },
    { x: 0.4, y: 0.8 },
    // Hero Description area
    { x: -0.5, y: -0.3 },
    { x: -0.6, y: -0.1 },
    // Hero Image area
    { x: 0.5, y: -0.1 },
    { x: 0.55, y: 0.1 },
    // Random deep nodes for depth
    { x: -0.8, y: -0.6, z: -4 },
    { x: 0.8, y: -0.6, z: -4 },
    { x: 0, y: -0.5, z: -3 },
    // Projects Section hints
    { x: -0.7, y: -1.8, z: -2 },
    { x: 0.7, y: -2.2, z: -2 },
    { x: -0.3, y: -2.8, z: -4 },
    { x: 0.4, y: -3.2, z: -3 },
    // Experience Section hints
    { x: -0.8, y: -4.5, z: -3 },
    { x: 0.8, y: -5.0, z: -3 },
    { x: -0.1, y: -6.0, z: -4 },
    { x: 0.6, y: -6.5, z: -2 },
    // Bottom reach
    { x: -0.5, y: -8.0, z: -5 },
    { x: 0.5, y: -8.5, z: -4 },
    { x: 0, y: -9.5, z: -3 },
  ], []);

  return (
    <main className="min-h-screen bg-black overflow-x-hidden">
      {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      
      {/* Global Background 3D Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <PipeSystem ignition={ignition} targets={targets} onTargetReached={handleTargetReached} />
          <EffectComposer>
            <Bloom intensity={0.4} luminanceThreshold={0.5} mipmapBlur />
          </EffectComposer>
        </Canvas>
      </div>

      <div
        className={`relative z-10 transition-opacity duration-[800ms] ease-out ${
          showLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        <Hero 
          ignition={ignition} 
          energized={energized} 
          targets={targets} 
        />
        <Projects />
        <Experience />
      </div>
    </main>
  );
}
