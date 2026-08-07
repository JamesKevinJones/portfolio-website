"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";

const metrics = [
  { label: "frontier-platform", detail: "99 tests passing" },
  { label: "job-rag", detail: "hybrid retrieval" },
  { label: "riskpulse", detail: "Datathon 2026" },
  { label: "memoryvault-ai", detail: "live on Vercel" },
];

export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(
          ".hero-name",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.6 },
        )
          .fromTo(
            ".hero-headline",
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.5 },
            "-=0.32",
          )
          .fromTo(
            ".hero-sub",
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.5 },
            "-=0.28",
          )
          .fromTo(
            ".hero-chip",
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.35, stagger: 0.07 },
            "-=0.22",
          )
          .fromTo(
            ".hero-photo",
            { opacity: 0, scale: 0.94 },
            { opacity: 1, scale: 1, duration: 0.6 },
            "-=0.55",
          );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [".hero-name", ".hero-headline", ".hero-sub", ".hero-chip", ".hero-photo"],
          { opacity: 1, y: 0, scale: 1 },
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="mx-auto max-w-4xl px-6 pt-16 pb-12 sm:px-8 sm:pt-24">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-12">
        <div>
          <h1 className="hero-name font-display text-4xl font-semibold leading-[1.05] tracking-tight text-mist sm:text-5xl">
            Kevin Jones
          </h1>
          <p className="hero-headline mt-4 max-w-xl font-display text-xl font-medium leading-snug text-mist/90 sm:text-2xl">
            I build AI systems that know when to say no
            <span className="cursor-blink text-signal">_</span>
          </p>
          <p className="hero-sub mt-4 max-w-lg text-[15px] leading-relaxed text-wire">
            Full-stack developer &amp; 3rd-year Computer Science Engineering
            student, building governed AI platforms, RAG pipelines, and
            real-time risk systems — with the guardrails to prove they work.
          </p>

          <ul className="mt-7 flex flex-wrap gap-2 font-mono text-xs">
            {metrics.map((m) => (
              <li
                key={m.label}
                className="hero-chip rounded border border-wire/30 bg-panel px-2.5 py-1.5 text-wire"
              >
                <span className="text-mist">{m.label}</span>
                <span className="text-wire/60"> · </span>
                {m.detail}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-photo justify-self-start sm:justify-self-end">
          <div className="glass glass-hover w-40 overflow-hidden rounded sm:w-48">
            <Image
              src="/images/kevin-headshot-formal.jpg"
              alt="Kevin Jones"
              width={1080}
              height={1434}
              priority
              className="aspect-[1080/1434] w-full object-cover object-top"
            />
            <div className="flex items-center justify-between border-t border-wire/20 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-wire">
              <span>Operator</span>
              <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
