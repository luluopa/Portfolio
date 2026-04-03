"use client";

import { Canvas } from "@react-three/fiber";
import { PipeSystem } from "./PipeSystem";
// 1. Only import the types that actually exist in LoadingScreen
import type { LoadingCompletePayload } from "./LoadingScreen";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useRef, useMemo } from "react";
import { Navbar } from "./Navbar";
import { motion } from "framer-motion";

// 2. Define HeroProps here (or export it from here if other files need it)
export type HeroProps = {
  ignition?: LoadingCompletePayload | null;
};

export function Hero({ ignition }: HeroProps) {
  // Define UI targets for the pipeline system
  const targets = useMemo(() => [
    // Navbar targets (top row)
    { x: -0.4, y: 0.8 },
    { x: -0.15, y: 0.8 },
    { x: 0.15, y: 0.8 },
    { x: 0.4, y: 0.8 },
    // Image/Avatar area
    { x: -0.5, y: -0.1 },
    { x: -0.55, y: 0.1 },
    // Description/CTA area
    { x: 0.5, y: -0.3 },
    { x: 0.6, y: -0.1 },
    // Deeper/Random nodes
    { x: -0.8, y: -0.6, z: -4 },
    { x: 0.8, y: -0.6, z: -4 },
    { x: 0, y: -0.5, z: -3 },
  ], []);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center bg-black overflow-hidden px-6 pt-24 sm:px-12">
      <Navbar />

      {/* The 3D Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <PipeSystem ignition={ignition} targets={targets} />
          
          <EffectComposer>
            <Bloom 
              intensity={1.5} 
              luminanceThreshold={0.1} 
              mipmapBlur 
            />
          </EffectComposer>
        </Canvas>
      </div>

      {/* The Content Layer */}
      <div className="relative z-10 grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Left Side: Professional Profile Image Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          className="flex justify-center lg:justify-start"
        >
          <div className="group relative">
            {/* Animated decorative borders */}
            <div className="absolute -inset-4 rounded-2xl border border-white/5 opacity-50 transition-all duration-700 group-hover:border-white/20" />
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            
            <div className="relative h-72 w-64 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl transition-transform duration-700 group-hover:scale-[1.02] sm:h-96 sm:w-80">
              {/* Profile Placeholder (or Image if provided) */}
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-zinc-800 to-black">
                <span className="font-mono text-[10px] tracking-widest text-zinc-600 uppercase">
                  Profile // Image
                </span>
              </div>
              
              {/* Overlay vignette */}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>
        </motion.div>

        {/* Right Side: Identity & CTA */}
        <div className="flex flex-col items-center lg:items-start">
          <motion.h1
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-center font-sans text-7xl font-bold tracking-tight text-white sm:text-8xl lg:text-left"
          >
            John Doe
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-6 flex flex-col items-center gap-4 sm:flex-row lg:items-start"
          >
            <span className="font-mono text-sm tracking-widest text-zinc-400 uppercase">
              Senior Systems Architect
            </span>
            <div className="hidden h-px w-8 bg-zinc-800 sm:block sm:self-center" />
            <span className="font-mono text-sm tracking-widest text-zinc-500 uppercase">
              Berlin, DE
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1.2 }}
            className="mt-8 max-w-md text-center text-lg leading-relaxed text-zinc-400 lg:text-left"
          >
            Building high-performance distributed systems with focus on observability and developer experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-12 flex items-center gap-8"
          >
            <button className="group relative overflow-hidden rounded-full border border-white px-8 py-3 transition-colors hover:bg-white">
              <span className="relative z-10 font-mono text-xs font-bold tracking-widest text-white transition-colors group-hover:text-black uppercase">
                View Projects
              </span>
            </button>
            
            <a href="#contact" className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase transition-colors hover:text-white">
              Get in touch
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
