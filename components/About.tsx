"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function About() {
  const rootRef = useRef<HTMLDivElement>(null);
  const photoNearRef = useRef<HTMLDivElement>(null);
  const photoFarRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".about-copy",
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power3.out",
            scrollTrigger: { trigger: rootRef.current, start: "top 80%" },
          },
        );

        gsap.to(photoNearRef.current, {
          y: -24,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });

        gsap.to(photoFarRef.current, {
          y: 18,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".about-copy", { opacity: 1, y: 0 });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="mx-auto max-w-4xl px-6 py-10 sm:px-8 sm:py-14">
      <div className="mb-6 flex items-baseline gap-3 font-mono text-xs text-wire">
        <span className="text-signal">#</span>
        <span>about</span>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[1fr_auto] sm:gap-10">
        <p className="about-copy max-w-lg text-[15px] leading-relaxed text-mist/90">
          Third-year Computer Science Engineering student at SRM Institute of
          Science and Technology, Chennai. Most of what I build lives at the
          intersection of AI and infrastructure — retrieval systems, agent
          workflows, and the guardrails that keep them honest. Recent work
          spans a datathon on IBM Z, a CockroachDB × AWS hackathon, and a
          handful of self-directed platforms built to production standards,
          not demo standards.
        </p>

        <div className="flex items-start gap-3">
          <figure ref={photoNearRef} className="w-28 shrink-0 sm:w-32">
            <div className="glass overflow-hidden rounded">
              <Image
                src="/images/kevin-expo-candid.jpg"
                alt="Kevin at a hardware expo, testing new gear"
                width={1156}
                height={650}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <figcaption className="mt-1.5 font-mono text-[10px] text-wire">
              hardware expo
            </figcaption>
          </figure>
          <figure ref={photoFarRef} className="mt-6 w-28 shrink-0 sm:w-32">
            <div className="glass overflow-hidden rounded">
              <Image
                src="/images/kevin-portrait-mural.jpg"
                alt="Kevin, portrait"
                width={853}
                height={1280}
                className="aspect-[4/3] w-full object-cover object-top"
              />
            </div>
            <figcaption className="mt-1.5 font-mono text-[10px] text-wire">
              between projects
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
