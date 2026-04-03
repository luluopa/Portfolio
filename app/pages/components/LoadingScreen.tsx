"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PROMPT = "~ $ ";
const COMMAND = "getUser()";
const RESULT_PREFIX = "=> ";
const RESULT_NAME = "John Doe";

const INITIAL_BOOT_MS = 700;
const PAUSE_AFTER_COMMAND_MS = 400;
const PAUSE_AFTER_RESULT_MS = 800;
const IGNITION_DURATION_MS = 900;

const TYPING_FAST_MS = 85;

function getTypingDelay(index: number): number {
  if (index === 0) return 320;
  if (index === 1) return 240;
  if (index === 2) return 180;
  if (index === 3) return 140;
  if (index === 4) return 110;
  return TYPING_FAST_MS;
}

export type IgnitionOrigin = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LoadingCompletePayload = {
  trigger: true;
  origin: IgnitionOrigin;
};

type Phase =
  | "typing-command"
  | "enter"
  | "typing-result"
  | "hold"
  | "exiting"
  | "done";

type LoadingScreenProps = {
  onComplete: (payload: LoadingCompletePayload) => void;
};

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<Phase>("typing-command");
  const [commandLength, setCommandLength] = useState(0);
  const [resultLength, setResultLength] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const terminalRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<IgnitionOrigin | null>(null);

  useEffect(() => {
    if (phase === "typing-command") {
      if (commandLength < COMMAND.length) {
        const delay =
          commandLength === 0 ? INITIAL_BOOT_MS : getTypingDelay(commandLength);
        const t = setTimeout(
          () => setCommandLength((n) => n + 1),
          delay
        );
        return () => clearTimeout(t);
      }
      setPhase("enter");
      return;
    }

    if (phase === "enter") {
      const t = setTimeout(() => {
        setShowCursor(false);
        setPhase("typing-result");
      }, PAUSE_AFTER_COMMAND_MS);
      return () => clearTimeout(t);
    }

    if (phase === "typing-result") {
      const fullResult = RESULT_PREFIX + RESULT_NAME;
      if (resultLength < fullResult.length) {
        const delay =
          resultLength === 0 ? 220 : getTypingDelay(resultLength);
        const t = setTimeout(
          () => setResultLength((n) => n + 1),
          delay
        );
        return () => clearTimeout(t);
      }
      setPhase("hold");
      return;
    }

    if (phase === "hold") {
      const t = setTimeout(() => {
        setPhase("exiting");
        setIsExiting(true);
      }, PAUSE_AFTER_RESULT_MS);
      return () => clearTimeout(t);
    }

    if (phase === "exiting") {
      const rect = terminalRef.current?.getBoundingClientRect();
      if (rect) {
        originRef.current = {
          x: rect.x + rect.width / 2,
          y: rect.y + rect.height / 2,
          width: rect.width,
          height: rect.height,
        };
      }
      const t = setTimeout(() => {
        setPhase("done");
        const origin = originRef.current ?? { x: 0, y: 0, width: 0, height: 0 };
        onComplete({ trigger: true, origin });
      }, IGNITION_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [phase, commandLength, resultLength, onComplete]);

  const cursorVisible = showCursor && (phase === "typing-command" || phase === "enter");

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-[900ms] ease-out ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="w-full max-w-xl px-6 sm:px-8">
        <motion.div
          ref={terminalRef}
          initial={false}
          animate={isExiting ? { scale: 2.5, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
          className="origin-center rounded-lg border border-white/10 bg-zinc-900/90 px-5 py-6 shadow-2xl backdrop-blur sm:px-6 sm:py-7"
          style={{
            boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 25px 50px -12px rgba(0,0,0,0.5)",
            willChange: "transform, opacity",
          }}
        >
          <div className="font-mono text-sm leading-relaxed sm:text-base">
            {/* User input: prompt + command in dimmed grey */}
            <div className="flex items-start gap-1 text-zinc-400">
              <span className="select-none">{PROMPT}</span>
              <span className="min-h-[1.5em] flex-1">
                {COMMAND.slice(0, commandLength)}
                {cursorVisible && (
                  <span
                    className="ml-0.5 inline-block h-4 w-2 animate-cursor-blink bg-zinc-400 align-middle"
                    aria-hidden
                  />
                )}
              </span>
            </div>
            {/* System response: high-contrast white */}
            {(phase === "typing-result" || phase === "hold" || phase === "exiting" || phase === "done") && (
              <div className="mt-1 text-white">
                {(RESULT_PREFIX + RESULT_NAME).slice(0, resultLength)}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
