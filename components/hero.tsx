"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MQ, SCROLL } from "@/lib/animation-constants";
import { PROJECTS } from "@/lib/projects";
import { PROFILE } from "@/lib/site";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ParticleField } from "@/components/ui/particle-field";

const LIVE_COUNT = PROJECTS.filter((p) => p.status === "Live").length;

/**
 * The thesis as motion. On load, characters rise out of masks. On scroll the hero pins
 * and every row slides away and dims, except "stop.", which holds still. Hovering
 * "stop." freezes the particle field behind it. Reduced motion: the final composition,
 * nothing pinned.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        const split = SplitText.create(".hero-row", { type: "chars", mask: "chars" });

        // expo.out: characters launch fast and feather in, so the headline lands heavy
        // without a slow tail. 0.028s per char sets a 30-char headline in ~0.85s.
        const intro = gsap.timeline({ defaults: { ease: EASE.expo } });
        intro
          .from(split.chars, { yPercent: 115, rotate: 8, duration: DURATION.hero, stagger: 0.028 })
          .from(".hero-meta > *", { y: 18, opacity: 0, duration: DURATION.slow, stagger: 0.07 }, 0.55)
          .from(".hero-bg", { opacity: 0, scale: 1.08, duration: 2 }, 0);

        // Pin from the hero's top at the viewport top for 70% of a screen of scroll.
        // Linear eases (EASE.scrub): the scroll position is already the easing.
        const out = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=70%",
            pin: true,
            scrub: SCROLL.scrub,
          },
        });
        gsap.utils.toArray<HTMLElement>(".hero-drift").forEach((el, i) => {
          // Alternate directions so the block tears apart instead of sliding as one.
          out.to(el, { xPercent: i % 2 ? 28 : -28, opacity: 0.12, ease: EASE.scrub }, 0);
        });
        out
          .to(".hero-meta", { y: -40, opacity: 0, ease: EASE.scrub }, 0)
          .to(".hero-bg", { opacity: 0.35, ease: EASE.scrub }, 0);
        // .hero-stop is deliberately absent from this timeline.

        return () => split.revert();
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    // #top sits on a wrapper outside the pin: on the pinned section it resolves to the
    // pin's end (70% of a screen down), where the hero has already faded out.
    <div id="top">
      <section
        ref={root}
        className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden px-4 pb-10 pt-28 sm:px-6 md:px-10 md:pb-14"
      >
        <div className="hero-bg absolute inset-0 -z-10">
          <ParticleField spacing={24} radius={190} freezeSelector=".hero-stop" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--color-ink)_85%)]" />
        </div>

        <h1 className="font-display text-[clamp(2.6rem,11.5vw,11.5rem)] font-medium leading-[0.9] tracking-[-0.045em]">
          <span className="sr-only">Systems that know when to stop.</span>
          <span aria-hidden="true" className="block">
            <span className="hero-row block overflow-hidden whitespace-nowrap pb-[0.06em]">
              <span className="hero-drift inline-block">Systems</span>
            </span>
            <span className="hero-row block overflow-hidden whitespace-nowrap pb-[0.06em]">
              <span className="hero-drift text-outline inline-block pl-[8vw]">that know</span>
            </span>
            <span className="hero-row block overflow-hidden whitespace-nowrap pb-[0.06em]">
              <span className="hero-drift inline-block">when to</span>{" "}
              <span className="hero-stop inline-block cursor-default text-neon">stop.</span>
            </span>
          </span>
        </h1>

        <div className="hero-meta mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-lg leading-snug text-mute md:text-xl">
            Seven projects below. Each one is introduced by the thing it refuses to do, because
            that’s the decision that took the thinking.
          </p>
          <div className="flex flex-wrap items-center gap-8">
            <MagneticButton href="#work">
              See what they refuse <span aria-hidden="true">↓</span>
            </MagneticButton>
            <p className="label text-mute">
              {PROJECTS.length} projects · {LIVE_COUNT} deployed · graduating 2027
              <span className="hidden [@media(hover:hover)_and_(pointer:fine)]:inline"> · hover “stop.”</span>
            </p>
          </div>
        </div>
        <p className="sr-only">
          {PROFILE.name}, {PROFILE.place}, {PROFILE.study}.
        </p>
      </section>
    </div>
  );
}
