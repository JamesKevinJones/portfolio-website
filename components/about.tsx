"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MQ, SCROLL, STAGGER } from "@/lib/animation-constants";
import { STACK } from "@/lib/projects";
import { PROFILE } from "@/lib/site";
import { SectionHeading } from "@/components/ui/section-heading";
import { InkReveal } from "@/components/ui/ink-reveal";
import { PointerLens } from "@/components/ui/pointer-lens";

export function About() {
  const root = useRef<HTMLElement>(null);
  const [mural, setMural] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.utils.toArray<HTMLElement>(".ab-frame").forEach((frame) => {
          // Curtain: the wrapper rises into the frame while the photo counter-moves, so the
          // image appears to hold still as the mask opens. Scrubbed from the frame's top at
          // 90% of the viewport to 40%; linear because scroll is the easing.
          gsap
            .timeline({ scrollTrigger: { trigger: frame, start: "top 90%", end: "top 40%", scrub: SCROLL.scrub } })
            .from(frame.querySelector(".ab-curtain"), { yPercent: 100, ease: EASE.scrub }, 0)
            .from(frame.querySelectorAll(".ab-img"), { yPercent: -100, scale: 1.15, ease: EASE.scrub }, 0);
        });
        // Stack rows settle in as the list's top crosses 85%: power3.out, no bounce.
        gsap.from(".ab-row", {
          y: 24,
          opacity: 0,
          duration: DURATION.base,
          ease: EASE.out,
          stagger: STAGGER.items,
          scrollTrigger: { trigger: ".ab-stack", start: "top 85%" },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about" className="scroll-mt-16 px-4 py-28 sm:px-6 md:px-10 md:py-40">
      <SectionHeading index="03" eyebrow="About" title="I build the boring parts on purpose." />

      <div className="mt-16 grid gap-14 md:mt-24 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div>
          {/* Bone, not mute: InkReveal holds unread words at 0.5 opacity (≈4.7:1, the old
              mute) and lights them to full bone as they scroll past. Reduced motion: plain bone. */}
          <div className="ab-copy max-w-2xl space-y-5 text-lg leading-relaxed text-bone">
            <InkReveal>
              I’m Kevin — a third-year computer science engineering student at SRM Institute of
              Science and Technology, Ramapuram, working out of Chennai.
            </InkReveal>
            <InkReveal>
              Most of what I build is retrieval, evaluation and automation: the machinery that
              decides whether an answer is good enough to show someone. That machinery is where
              the failures live, so it’s where I spend the time — writing the gate, the benchmark
              and the rejection log before the interface that sits on top.
            </InkReveal>
            <InkReveal>
              I write the reasoning down as I go. Every project here carries a decisions file
              explaining why it works the way it does, which is the only reason the rules in the
              section above are quotable.
            </InkReveal>
          </div>

          <dl className="ab-stack mt-12 border-t border-line">
            {STACK.map(([term, value]) => (
              <div key={term} className="ab-row grid gap-1 border-b border-line py-4 sm:grid-cols-[8rem_1fr] sm:gap-6">
                <dt className="label text-neon">{term}</dt>
                <dd className="font-mono text-sm leading-relaxed text-bone">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-6">
          <button
            type="button"
            aria-pressed={mural}
            aria-label={`Portrait of ${PROFILE.fullName}. Swap photo`}
            onClick={() => setMural((m) => !m)}
            className="ab-frame group relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-line bg-ink-2"
          >
            <div className="ab-curtain absolute inset-0 overflow-hidden">
              {/* One wrapper for the curtain's counter-move; the lens inside measures its own
                  box, so the curtain's scale never knocks the two photos out of register.
                  Fine pointers: the mural shows through a lens that follows the cursor (and
                  sweeps once as a hint). Press/Enter/tap swaps the whole photo via `open`. */}
              <div className="ab-img absolute inset-0">
                <PointerLens
                  hint
                  open={mural}
                  revealTestId="portrait-mural"
                  className="h-full w-full"
                  base={
                    <Image
                      src="/images/kevin-headshot-formal.jpg"
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="object-cover"
                    />
                  }
                  reveal={
                    <Image
                      src="/images/kevin-portrait-mural.jpg"
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="object-cover"
                    />
                  }
                />
              </div>
            </div>
            <span className="label absolute bottom-4 left-4 rounded-full bg-ink/85 px-3 py-1.5 text-bone">
              Hover or tap to swap
            </span>
          </button>

          <div className="ab-frame relative ml-auto aspect-[16/9] w-2/3 overflow-hidden rounded-3xl border border-line bg-ink-2">
            <div className="ab-curtain absolute inset-0 overflow-hidden">
              <div className="ab-img absolute inset-0">
                <Image
                  src="/images/kevin-expo-candid.jpg"
                  alt={`${PROFILE.fullName} presenting a project at an expo`}
                  fill
                  sizes="(min-width: 1024px) 26vw, 66vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
