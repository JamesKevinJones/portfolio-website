"use client";

import { useRef, useState } from "react";
import { Flip, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MQ } from "@/lib/animation-constants";
import { PRINCIPLES } from "@/lib/projects";
import { SectionHeading } from "@/components/ui/section-heading";

/**
 * Four rules, one open at a time. The heads are fixed-size buttons, so Flip only ever
 * translates them: when a story opens, the rows below glide down instead of jumping.
 * The story itself fades up. Reduced motion: the layout just changes.
 */
export function Approach() {
  const root = useRef<HTMLElement>(null);
  const snapshot = useRef<Flip.FlipState | null>(null);
  const [open, setOpen] = useState(0);

  const toggle = (i: number) => {
    // Record where every head is before React re-renders, so Flip can animate from here.
    snapshot.current = Flip.getState(root.current!.querySelectorAll("[data-rule-head]"));
    setOpen((cur) => (cur === i ? -1 : i));
  };

  useGSAP(
    () => {
      const state = snapshot.current;
      snapshot.current = null;
      if (!state) return;
      // Opening or closing a story changes the page height, so every trigger below this
      // list (About, the footer headline, the contact chip) must be re-measured.
      if (window.matchMedia(MQ.reduce).matches) {
        ScrollTrigger.refresh();
        return;
      }
      // power3.out over 0.6s: rows move quickly then settle, no overshoot, so the list
      // reads as re-flowing rather than bouncing. Refresh once the rows have landed.
      Flip.from(state, { duration: DURATION.base, ease: EASE.out, onComplete: () => ScrollTrigger.refresh() });
      // The story fades up just behind the rows so the eye lands on it last.
      gsap.from(root.current!.querySelectorAll("[data-rule-body]"), {
        opacity: 0,
        y: 12,
        duration: DURATION.base,
        ease: EASE.out,
        delay: 0.08,
      });
    },
    { dependencies: [open], scope: root },
  );

  return (
    <section ref={root} id="approach" className="scroll-mt-16 px-4 py-28 sm:px-6 md:px-10 md:py-40">
      <SectionHeading
        index="02"
        eyebrow="How I work"
        title="Four rules that cost something to learn."
        lede="Each one is committed to a docs file in the repo it came out of, alongside the failure that produced it."
      />

      <ul className="mt-16 border-b border-line md:mt-24">
        {PRINCIPLES.map(({ rule, body, source }, i) => {
          const isOpen = open === i;
          const id = `rule-${i + 1}`;
          return (
            <li key={rule}>
              <button
                type="button"
                data-rule-head
                aria-expanded={isOpen}
                aria-controls={id}
                onClick={() => toggle(i)}
                className="group flex w-full items-baseline gap-4 border-t border-line py-6 text-left sm:gap-8 md:py-8"
              >
                <span className="label shrink-0 text-neon sm:w-14">R/{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 font-display text-[clamp(1.5rem,3.4vw,2.8rem)] font-medium leading-[1.02] tracking-[-0.03em] transition-transform duration-500 ease-expo-out group-hover:translate-x-2">
                  {rule}
                </span>
                <span
                  aria-hidden="true"
                  className="font-mono text-xl text-mute transition-transform duration-500 ease-expo-out group-aria-expanded:rotate-45 group-aria-expanded:text-neon"
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div
                  id={id}
                  data-rule-body
                  className="grid gap-4 pb-10 sm:pl-[calc(3.5rem+2rem)] md:grid-cols-[2fr_1fr] md:gap-12"
                >
                  <p className="max-w-2xl text-lg leading-relaxed text-mute">{body}</p>
                  <p className="label text-bone/80 md:text-right">{source}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
