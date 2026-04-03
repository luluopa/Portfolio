"use client";

import { motion } from "framer-motion";

const EXPERIENCES = [
  {
    role: "Senior Systems Architect",
    company: "TechScale Solutions",
    period: "2023 — Present",
    description: "Architecting high-availability distributed systems using Go, Kubernetes, and gRPC. Reduced infrastructure latency by 40% through microservices optimization and advanced caching strategies.",
    skills: ["Go", "Kubernetes", "gRPC", "Redis", "Prometheus"]
  },
  {
    role: "Backend Engineer",
    company: "CloudFlow Inc",
    period: "2020 — 2023",
    description: "Developed and maintained event-driven architectures with Node.js and AWS (Lambda, SNS/SQS). Scaled data processing pipelines handling 5M+ events per minute.",
    skills: ["Node.js", "AWS", "Terraform", "PostgreSQL", "Kafka"]
  },
  {
    role: "Software Developer",
    company: "Binary Labs",
    period: "2018 — 2020",
    description: "Full-stack development for enterprise-level applications. Led the migration of a legacy monolithic system to a scalable React and Python/FastAPI architecture.",
    skills: ["React", "FastAPI", "Docker", "MongoDB", "TypeScript"]
  }
];

export function Experience() {
  return (
    <section id="experience" className="relative px-6 py-32 sm:px-12">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs tracking-[0.3em] text-zinc-500 uppercase">
              Career Timeline
            </span>
            <h2 className="font-sans text-5xl font-bold tracking-tight text-white sm:text-6xl">
              Professional Experience
            </h2>
          </div>
          <p className="max-w-md text-lg text-zinc-400">
            A track record of building robust systems and solving complex architectural challenges.
          </p>
        </motion.div>

        <div className="mt-24 space-y-12">
          {EXPERIENCES.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="group relative grid grid-cols-1 gap-8 rounded-2xl border border-white/5 bg-zinc-900/40 p-8 transition-all hover:border-white/10 hover:bg-zinc-900/60 lg:grid-cols-4 lg:p-12"
            >
              {/* Period */}
              <div className="lg:col-span-1">
                <span className="font-mono text-sm tracking-wider text-zinc-500 uppercase">
                  {exp.period}
                </span>
              </div>

              {/* Core Content */}
              <div className="lg:col-span-2">
                <h3 className="text-2xl font-bold text-white transition-colors group-hover:text-zinc-100">
                  {exp.role}
                </h3>
                <p className="mt-2 font-mono text-sm tracking-widest text-zinc-400 uppercase">
                  {exp.company}
                </p>
                <p className="mt-6 text-lg leading-relaxed text-zinc-400">
                  {exp.description}
                </p>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap items-start gap-2 lg:col-span-1 lg:justify-end">
                {exp.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] tracking-widest text-zinc-500 uppercase transition-colors hover:border-white/20 hover:text-zinc-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Subtle background detail */}
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 bg-zinc-900/20 blur-[120px]" />
    </section>
  );
}
