"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { MQ } from "@/lib/animation-constants";

type VelocityMarqueeProps = {
  items: string[];
  /** Cruise speed in % of one copy per second. */
  speed?: number;
  className?: string;
};

/**
 * Infinite ticker whose speed and direction follow scroll velocity, then decay back to
 * cruise. Position is integrated on GSAP's ticker and wrapped, so a direction flip never
 * stalls. Reduced motion: one static, wrapping copy.
 */
export function VelocityMarquee({ items, speed = 1.6, className = "" }: VelocityMarqueeProps) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        const setX = gsap.quickSetter(track.current, "xPercent");
        const setSkew = gsap.quickSetter(track.current, "skewX", "deg");
        // Two identical copies: wrapping between -50% and 0 loops seamlessly.
        const wrap = gsap.utils.wrap(-50, 0);
        const state = { pos: 0, dir: -1, boost: 0 };
        let visible = true;

        const st = ScrollTrigger.create({
          trigger: root.current,
          // Active from the ticker's top entering the viewport bottom until its bottom
          // leaves the top: the ticker only integrates while you can see it.
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (visible = self.isActive),
          onUpdate: (self) => {
            state.dir = self.direction === 1 ? -1 : 1;
            // 250px/s of scroll velocity = +1x speed, capped at +14x so a flick reads as a
            // gust, not a teleport.
            const kick = gsap.utils.clamp(0, 14, Math.abs(self.getVelocity()) / 250);
            state.boost = Math.max(state.boost, kick);
          },
        });

        const tick = (_t: number, dt: number) => {
          if (!visible) return;
          // Frame-rate independent exponential decay back to cruise speed.
          state.boost *= Math.pow(0.93, dt / 16.667);
          state.pos = wrap(state.pos + state.dir * (speed + state.boost * speed) * (dt / 1000));
          setX(state.pos);
          setSkew(state.dir * -state.boost * 0.5);
        };
        gsap.ticker.add(tick);

        return () => {
          gsap.ticker.remove(tick);
          st.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  const copy = (loop: boolean) => (
    <div
      data-copy={loop ? "loop" : "main"}
      aria-hidden={loop || undefined}
      className={`flex shrink-0 items-center motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:gap-y-3 motion-reduce:px-5 ${loop ? "motion-reduce:hidden" : ""}`}
    >
      {items.map((item, i) => (
        <span key={item} className="flex items-center">
          <span className={i % 2 ? "text-outline" : ""}>{item}</span>
          <span className="mx-[0.5em] inline-block size-[0.2em] rounded-full bg-neon" aria-hidden="true" />
        </span>
      ))}
    </div>
  );

  return (
    <div ref={root} data-marquee className={`overflow-hidden border-y border-line py-6 ${className}`}>
      <div
        ref={track}
        className="flex w-max font-display text-[clamp(1.8rem,5vw,4.5rem)] font-medium leading-none tracking-[-0.03em] will-change-transform motion-reduce:w-full motion-reduce:flex-wrap"
      >
        {copy(false)}
        {copy(true)}
      </div>
    </div>
  );
}
