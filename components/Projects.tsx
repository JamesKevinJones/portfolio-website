"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ProjectPanel } from "./ProjectPanel";

const projects = [
  {
    name: "frontier-platform",
    status: "99 tests · CI-gated",
    skim: "A governed AI platform that refuses to answer when the evidence is weak — three services wired to a CI gate that fails the build if answer quality drops.",
    deepDive:
      "Grounded retrieval, a multi-agent workflow with cost budgets and human escalation, and the guardrail library both import — evaluated by a suite that blocks merges on regression.",
    stack: "Python 3.11/3.12, React + TypeScript",
    repoHref: "https://github.com/JamesKevinJones/frontier-platform",
  },
  {
    name: "job-rag",
    status: "hybrid retrieval",
    skim: "Natural-language job search over scraped remote listings — results stream back as structured cards, not a wall of text.",
    deepDive:
      "Cheerio scrape of RemoteOK/Remotive, a portable JSON vector index, hybrid metadata-prefilter and vector ranking, tool-calling responses via the Vercel AI SDK.",
    stack: "Next.js, TypeScript, Tailwind, Gemini embeddings",
    repoHref: "https://github.com/JamesKevinJones/job-rag",
  },
  {
    name: "riskpulse",
    status: "Datathon 2026 · IBM Z",
    skim: "A live payment-risk co-pilot for IBM Z — streams transactions, scores risk in real time, and lets an operator approve, hold, or escalate.",
    deepDive:
      "Rules plus IsolationForest scoring over a streamed transaction feed, FastAPI backend, React frontend, deployable via Docker straight onto LinuxONE.",
    stack: "Python, FastAPI, React, IBM Z / LinuxONE",
    repoHref: "https://github.com/JamesKevinJones/riskpulse",
    liveHref: "https://frontend-iota-liart-1hrf2xeg9u.vercel.app",
  },
  {
    name: "memoryvault-ai",
    status: "live · CockroachDB + Bedrock",
    skim: "Persistent memory for AI agents — durable facts and preferences that survive across sessions, not just chat scrollback.",
    deepDive:
      "CockroachDB for durable storage, semantic search plus AWS Bedrock for retrieval and reasoning, automatic retrieval injected into every prompt. Built for the CockroachDB × AWS Agentic Memory Hackathon.",
    stack: "Next.js, CockroachDB, AWS Bedrock, Auth.js",
    repoHref: "https://github.com/JamesKevinJones/Memoryvault-ai",
    liveHref: "https://memoryvault-ai-delta.vercel.app",
  },
];

export function Projects() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(".project-panel", { opacity: 0, y: 24 });
        ScrollTrigger.batch(".project-panel", {
          start: "top 85%",
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.1,
              ease: "power3.out",
            }),
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".project-panel", { opacity: 1, y: 0 });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="mx-auto max-w-4xl px-6 py-10 sm:px-8 sm:py-14">
      <div className="mb-6 flex items-baseline gap-3 font-mono text-xs text-wire">
        <span className="text-signal">$</span>
        <span>ls ~/projects --featured</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {projects.map((p) => (
          <ProjectPanel key={p.name} {...p} />
        ))}
      </div>
    </section>
  );
}
