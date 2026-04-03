"use client";

import type { LoadingCompletePayload } from "./LoadingScreen";
import { Navbar } from "./Navbar";
import { motion, AnimatePresence } from "framer-motion";

export type HeroProps = {
  ignition?: LoadingCompletePayload | null;
  energized: Set<number>;
  targets: Array<{ x: number, y: number, z?: number }>;
};

export function Hero({ energized, targets }: HeroProps) {
  // Helper to check if a group of targets is energized
  // Indices: 0-3 (Navbar), 4-5 (Text/CTA), 6-7 (Image)
  const isNavbarEnergized = targets.slice(0, 4).some((_, i) => energized.has(i));
  const isContentEnergized = targets.slice(4, 6).some((_, i) => energized.has(i + 4));
  const isImageEnergized = targets.slice(6, 8).some((_, i) => energized.has(i + 6));

  return (
    <section id="about" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 sm:px-12">
      {/* Navbar: Appears when any of its targets are reached */}
      <AnimatePresence>
        {isNavbarEnergized && <Navbar />}
      </AnimatePresence>

      {/* The Content Layer */}
      <div className="relative z-10 grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Left Side: Identity & CTA */}
        <div className="flex flex-col items-center lg:items-start">
          {/* The Name: Origin point, always visible but with initial energy flash */}
          <motion.h1
            initial={{ opacity: 0, x: -20, filter: "brightness(1)" }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              filter: ["brightness(1)", "brightness(2.5)", "brightness(1)"],
              scale: [1, 1.02, 1]
            }}
            transition={{ 
              duration: 1.2, 
              ease: [0.23, 1, 0.32, 1],
              filter: { duration: 0.6, delay: 0.1 },
              scale: { duration: 2, repeat: Infinity, repeatType: "reverse" }
            }}
            className="text-center font-sans text-7xl font-bold tracking-tight text-white sm:text-8xl lg:text-left"
          >
            John Doe
          </motion.h1>
          
          {/* Subtext and Description: Appear when content targets are energized */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isContentEnergized ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
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
            animate={isContentEnergized ? { opacity: 1 } : {}}
            transition={{ duration: 1 }}
            className="mt-8 max-w-md text-center text-lg leading-relaxed text-zinc-400 lg:text-left"
          >
            Building high-performance distributed systems with focus on observability and developer experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isContentEnergized ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
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

        {/* Right Side: Professional Profile Image Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: "brightness(1)" }}
          animate={isImageEnergized ? { 
            opacity: 1, 
            scale: 1, 
            filter: ["brightness(1)", "brightness(2)", "brightness(1)"] 
          } : {}}
          transition={{ 
            opacity: { duration: 1 },
            scale: { duration: 1 },
            filter: { duration: 0.6 }
          }}
          className="flex justify-center lg:justify-end"
        >
          <div className="group relative">
            <div className="absolute -inset-4 rounded-2xl border border-white/5 opacity-50 transition-all duration-700 group-hover:border-white/20" />
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            
            <div className="relative h-72 w-64 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl transition-transform duration-700 group-hover:scale-[1.02] sm:h-96 sm:w-80">
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-zinc-800 to-black">
                <span className="font-mono text-[10px] tracking-widest text-zinc-600 uppercase">
                  Profile // Image
                </span>
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
