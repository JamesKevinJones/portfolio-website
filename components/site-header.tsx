"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE, MQ } from "@/lib/animation-constants";
import { LocalTime } from "@/components/ui/local-time";

const NAV = [
  { href: "#work", label: "Work" },
  { href: "#approach", label: "Rules" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

/**
 * Fixed mono header with no bar, so it sits over whatever scrolls beneath it. The
 * feathered `.header-scrim` keeps it legible there: over the About portrait, plain bone
 * text measured 1.1:1 composited. A `mix-blend-difference` on the row used to be here for
 * that; it never did anything, because a fixed header is its own stacking context and the
 * blend could only see the header's empty contents. Moved onto the header it does work,
 * but difference cancels over mid-tones and still bottoms out near 2.2:1, so it is a scrim.
 * The hairline under the row is page progress.
 */
export function SiteHeader() {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      // Linear (EASE.scrub) because scroll position is already the easing. start 0 /
      // end "max" spans the whole document; scrub 0.3 just smooths wheel steps.
      gsap.fromTo(
        bar.current,
        { scaleX: 0 },
        { scaleX: 1, ease: EASE.scrub, scrollTrigger: { start: 0, end: "max", scrub: 0.3 } },
      );
    });
    return () => mm.revert();
  });

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div aria-hidden="true" className="header-scrim pointer-events-none absolute inset-x-0 top-0 h-26" />
      <div className="label relative flex items-center justify-between gap-4 px-4 py-4 text-bone sm:px-6 md:px-10">
        <a href="#top" className="flex items-center gap-2">
          <span className="inline-block size-2 rounded-full bg-neon" aria-hidden="true" />
          <span className="sm:hidden">KJ</span>
          <span className="hidden sm:inline">Kevin Jones</span>
        </a>
        <span className="hidden md:inline">
          Chennai · <LocalTime />
        </span>
        <nav aria-label="Sections" className="flex gap-4 sm:gap-8">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="opacity-70 transition-opacity hover:opacity-100">
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      <div
        ref={bar}
        data-testid="scroll-progress"
        aria-hidden="true"
        style={{ transform: "scaleX(0)" }}
        className="h-px origin-left bg-neon motion-reduce:hidden"
      />
    </header>
  );
}
