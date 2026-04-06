"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 2;

const PROJECTS = [
  {
    title: "Project Zero: Distributed Ledger",
    category: "Blockchain / Go",
    description: "A high-performance distributed ledger implemented from scratch in Go. Features custom consensus algorithm and peer-to-peer networking.",
    tech: ["Go", "p2p", "Protocol Buffers", "LevelDB"],
    link: "#",
    image: "01"
  },
  {
    title: "Hydra: Real-time Data Pipeline",
    category: "Infrastructure / Rust",
    description: "Multi-tenant data ingestion platform processing billions of events daily with sub-second latency.",
    tech: ["Rust", "Apache Kafka", "Kubernetes", "Redis"],
    link: "#",
    image: "02"
  },
  {
    title: "Nexus: Observability Dashboard",
    category: "Full-stack / TypeScript",
    description: "Centralized monitoring platform for complex microservices architectures with real-time visualization of trace data.",
    tech: ["React", "FastAPI", "ClickHouse", "GraphQL"],
    link: "#",
    image: "03"
  },
  {
    title: "Aether: Serverless Framework",
    category: "Developer Tools / Python",
    description: "Internal tooling to simplify the deployment and management of serverless functions across multi-cloud environments.",
    tech: ["Python", "AWS Lambda", "Azure Functions", "Terraform"],
    link: "#",
    image: "04"
  }
];

export function Projects({ energized }: { energized?: Set<string> }) {
  const [currentPage, setCurrentPage] = useState(0);

  // IDs for Projects section targets: projects-title-1, projects-title-2, project-1, project-2
  const isTitleEnergized = energized?.has("projects-title-1") || energized?.has("projects-title-2");

  const totalPages = Math.ceil(PROJECTS.length / ITEMS_PER_PAGE);
  const currentProjects = PROJECTS.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <section id="projects" className="relative px-6 py-32 sm:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isTitleEnergized ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            style={{ willChange: "transform, opacity" }}
            className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs tracking-[0.3em] text-zinc-500 uppercase">
                Featured Work
              </span>
              <h2 className="font-sans text-5xl font-bold tracking-tight text-white sm:text-6xl">
                Projects
              </h2>
            </div>
            <p className="max-w-md text-lg text-zinc-400">
              A selection of recent technical projects focusing on systems design and high-scale applications.
            </p>
          </motion.div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`h-1 transition-all duration-300 ${
                    currentPage === i ? "w-8 bg-white" : "w-4 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
            <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
              {String(currentPage + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="mt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="grid grid-cols-1 gap-12 md:grid-cols-2"
            >
              {currentProjects.map((project, index) => {
                const globalIndex = currentPage * ITEMS_PER_PAGE + index;
                const projectId = `project-${globalIndex + 1}`;
                const isProjectEnergized = energized?.has(projectId) || isTitleEnergized;
                
                return (
                  <motion.div
                    key={globalIndex}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isProjectEnergized ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                    style={{ willChange: "transform, opacity" }}
                    className="group relative flex flex-col"
                  >
                    {/* Project Image Placeholder */}
                    <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/5 bg-zinc-900 shadow-2xl transition-all group-hover:border-white/10 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.02)]">
                      <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-zinc-800 to-black">
                        <span className="font-mono text-xs tracking-[0.3em] text-zinc-600 uppercase">
                          {project.image} // Preview
                        </span>
                      </div>
                      
                      {/* Decorative overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      
                      {/* Link Icon Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="h-12 w-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </div>
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="mt-8 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                          {project.category}
                        </span>
                      </div>
                      <h3 className="text-3xl font-bold text-white transition-colors group-hover:text-zinc-100">
                        {project.title}
                      </h3>
                      <p className="text-lg leading-relaxed text-zinc-400">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {project.tech.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] tracking-widest text-zinc-500 uppercase transition-colors group-hover:border-white/20 group-hover:text-zinc-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <a href={project.link} className="absolute inset-0 z-10" aria-label={`View project ${project.title}`} />
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
