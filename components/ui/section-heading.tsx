"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { EASE, MQ, STAGGER } from "@/lib/animation-constants";

type SectionHeadingProps = { index: string; eyebrow: string; title: string; lede?: string };

/** Section heading whose lines rise out of masks, scrubbed to the heading entering view. */
export function SectionHeading({ index, eyebrow, title, lede }: SectionHeadingProps) {
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        SplitText.create(heading.current, {
          type: "lines",
          mask: "lines",
          // Re-splits on resize and font load so line breaks stay correct.
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 105,
              stagger: STAGGER.lines,
              ease: EASE.out,
              // Starts as the block's top crosses 85% of the viewport (just visible) and
              // finishes by 45%, so the heading is fully set before it reaches centre.
              scrollTrigger: { trigger: root.current, start: "top 85%", end: "top 45%", scrub: 0.5 },
            }),
        });
        gsap.from(root.current!.querySelectorAll(".sh-fade"), {
          opacity: 0,
          y: 20,
          stagger: STAGGER.lines,
          ease: "power2.out",
          scrollTrigger: { trigger: root.current, start: "top 80%", end: "top 50%", scrub: 0.5 },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid gap-6 md:grid-cols-[1fr_2fr] md:gap-10">
      <p className="sh-fade label flex gap-4 text-mute md:pt-3">
        <span className="text-neon">{index}</span>
        <span>{eyebrow}</span>
      </p>
      <div>
        <h2
          ref={heading}
          className="split-pad font-display text-[clamp(2.4rem,6vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.04em]"
        >
          {title}
        </h2>
        {lede && <p className="sh-fade mt-6 max-w-xl text-lg leading-relaxed text-mute">{lede}</p>}
      </div>
    </div>
  );
}
