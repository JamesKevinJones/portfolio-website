"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ArrowDown } from "lucide-react";
import { GithubMark } from "@/components/brand-icons";
import { PROFILE } from "@/lib/site";
import { PROJECTS } from "@/lib/projects";

const LIVE_COUNT = PROJECTS.filter((p) => p.status === "Live").length;

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    /*
      gsap.from() rather than gsap.to(): the markup is visible by default and
      the timeline animates in from a hidden state. If this effect never runs —
      JS disabled, a bundle error — the hero still reads. The opposite pattern
      leaves an invisible page behind a broken script.
    */
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-boot]", {
        y: 18,
        opacity: 0,
        duration: 0.5,
        stagger: 0.075,
      });
    }, root);

    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="border-b-[3px]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p data-boot className="label text-ink-soft dark:text-paper-dim">
          {PROFILE.name} · {PROFILE.place} · {PROFILE.study}
        </p>

        <h1
          data-boot
          className="mt-5 font-display text-[clamp(2.75rem,10vw,7rem)] font-black"
        >
          Systems that know
          <br />
          when to stop.
        </h1>

        <p
          data-boot
          className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl dark:text-paper-dim"
        >
          Six projects below. Each one is introduced by the thing it{" "}
          <span className="mark font-medium">refuses</span> to do — because
          that’s the decision that took the thinking. The rest is
          implementation.
        </p>

        <div data-boot className="mt-9 flex flex-wrap gap-3">
          <a
            href="#work"
            className="brut brut-press label flex items-center gap-2 bg-coral px-5 py-3 text-ink"
          >
            See the work
            <ArrowDown size={15} aria-hidden />
          </a>
          <a
            href={PROFILE.github}
            target="_blank"
            rel="noreferrer noopener"
            className="brut brut-press label flex items-center gap-2 px-5 py-3"
          >
            <GithubMark size={15} />
            GitHub
          </a>
        </div>

        {/* A count, not a claim. Both numbers come from the project list. */}
        <dl
          data-boot
          className="brut-sm mt-12 grid max-w-xl grid-cols-3 divide-x-[3px] divide-[var(--line)]"
        >
          {[
            ["Projects", String(PROJECTS.length)],
            ["Deployed", String(LIVE_COUNT)],
            ["Graduating", "2027"],
          ].map(([term, value]) => (
            <div key={term} className="px-4 py-3">
              <dt className="label text-ink-soft dark:text-paper-dim">{term}</dt>
              <dd className="mt-1 font-display text-2xl font-black">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
