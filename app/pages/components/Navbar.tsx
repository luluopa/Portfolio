"use client";

import { motion } from "framer-motion";

const NAV_ITEMS = [
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Contact", href: "#contact" },
];

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="flex items-center gap-8 rounded-full border border-white/10 bg-black/20 px-8 py-3 backdrop-blur-xl"
      >
        <div className="mr-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_white]" />
          <span className="font-mono text-xs font-bold tracking-widest text-white uppercase">
            LexVita
          </span>
        </div>

        <ul className="flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="font-mono text-[10px] font-medium tracking-wider text-zinc-400 uppercase transition-colors hover:text-white"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </motion.nav>
    </header>
  );
}
