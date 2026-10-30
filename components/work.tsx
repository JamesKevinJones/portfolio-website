"use client";

import { useEffect, useRef } from "react";
import type Lenis from "lenis";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { EASE, MQ, SCROLL } from "@/lib/animation-constants";
import { PROJECTS } from "@/lib/projects";
import { useLenis } from "@/components/lenis-provider";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectPanel } from "@/components/project-panel";
import { LiveShots } from "@/components/live-shots";
import { poseScene, runScene } from "@/components/scenes";

/**
 * One screen per project.
 * Walkthrough (MQ.walkthrough + motion): the pin wrapper pins and vertical scroll drives
 * the inner track sideways, settling on one panel whenever you stop; each panel's scene
 * plays as it arrives.
 * Stacked (smaller or shorter screens): a vertical list; each scene plays as it arrives.
 * Reduced motion: the same list, final state, no triggers.
 * The copy itself never animates: the sideways track and the scenes are this section's
 * motion, and text that fades in while it moves is hard to read.
 */
export function Work() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  // Read inside the focus handler without rebuilding the pin when Lenis mounts.
  const lenisRef = useRef<Lenis | null>(null);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        { walk: `${MQ.walkthrough} and ${MQ.motion}`, stack: `${MQ.stacked} and ${MQ.motion}` },
        (ctx) => {
          const { walk } = ctx.conditions as { walk: boolean; stack: boolean };
          const panels = gsap.utils.toArray<HTMLElement>(".wk-panel");
          const stageOf = (panel: HTMLElement) => panel.querySelector<HTMLElement>("[data-stage]")!;

          if (!walk) {
            panels.forEach((panel) => {
              poseScene(stageOf(panel));
              ScrollTrigger.create({
                trigger: stageOf(panel),
                start: "top 70%",
                // Replays when the visitor scrolls back up to it (CRED-style fold reset);
                // runScene kills any run still in flight, so re-entry never stacks.
                onEnter: () => runScene(stageOf(panel)),
                onEnterBack: () => runScene(stageOf(panel)),
              });
            });
            // The context revert restores each scene's final pose; say so on the stage too.
            return () => panels.forEach((panel) => (stageOf(panel).dataset.state = "refused"));
          }

          const distance = () => track.current!.scrollWidth - window.innerWidth;

          // When scrolling stops, settle on one panel so nobody reads two half panels.
          // Lean 0.3 of a panel the way you were scrolling: a fifth of a panel is enough to
          // move on, so a short flick never springs back. No lean when the scroll began
          // outside the pin, or overshooting its start would skip panel one. Where it began
          // is recorded on scrollStart, edges inclusive: panel one at rest sits exactly on
          // the pin's start, which isActive and onEnter count as outside.
          let startedAt = 0;
          const onScrollStart = () => (startedAt = window.scrollY);
          ScrollTrigger.addEventListener("scrollStart", onScrollStart);
          const snapTo = (value: number, self?: ScrollTrigger) => {
            const st = self!;
            const arrived = startedAt < st.start - 1 || startedAt > st.end + 1;
            const points = panels.map((p) => gsap.utils.clamp(0, 1, p.offsetLeft / distance()));
            const lean = arrived ? 0 : st.direction * (points[1] - points[0]) * 0.3;
            return gsap.utils.snap(points, value + lean);
          };

          // Linear x tween scrubbed by scroll (EASE.scrub): scroll position is the easing.
          // Pins when the wrapper's top meets the viewport top and holds for exactly the
          // track's overflow width, so the last panel ends flush with the right edge.
          const scroller = gsap.to(track.current, {
            x: () => -distance(),
            ease: EASE.scrub,
            scrollTrigger: {
              trigger: pin.current,
              pin: true,
              scrub: SCROLL.scrub,
              start: "top top",
              end: () => `+=${distance()}`,
              invalidateOnRefresh: true,
              anticipatePin: 1,
              // inertia off: snap from where the page stopped, not a velocity projection.
              snap: { snapTo, delay: 0.15, duration: { min: 0.3, max: 0.6 }, ease: EASE.smooth, inertia: false },
            },
          });

          panels.forEach((panel) => {
            // Play when the panel's left edge passes 55% of the screen, i.e. when it
            // owns most of the viewport. Panel one is already there at pin start.
            poseScene(stageOf(panel));
            ScrollTrigger.create({
              trigger: panel,
              containerAnimation: scroller,
              start: "left 55%",
              // Replays on the way back too (onEnterBack); runScene kills a run in flight.
              onEnter: () => runScene(stageOf(panel)),
              onEnterBack: () => runScene(stageOf(panel)),
            });
          });

          // Keyboard: focus inside an off-screen panel scrolls the page to the point where
          // that panel is on screen. overflow-clip on the pin stops the browser from
          // scrolling the wrapper sideways itself.
          const onFocus = (e: FocusEvent) => {
            const panel = (e.target as HTMLElement).closest<HTMLElement>(".wk-panel");
            const st = scroller.scrollTrigger;
            if (!panel || !st) return;
            const progress = gsap.utils.clamp(0, 1, panel.offsetLeft / distance());
            const y = st.start + progress * (st.end - st.start);
            if (Math.abs(window.scrollY - y) < 4) return;
            if (lenisRef.current) lenisRef.current.scrollTo(y, { immediate: true });
            else window.scrollTo(0, y);
            // Skip the scrub lag so the focused element is on screen now, not in 0.8s:
            // sync triggers to the new scroll position, then finish the scrub tween.
            ScrollTrigger.update();
            st.getTween()?.progress(1);
          };
          const t = track.current!;
          t.addEventListener("focusin", onFocus);
          return () => {
            t.removeEventListener("focusin", onFocus);
            ScrollTrigger.removeEventListener("scrollStart", onScrollStart);
            panels.forEach((panel) => (stageOf(panel).dataset.state = "refused"));
          };
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="work" className="relative scroll-mt-16">
      <div className="px-4 pb-10 sm:px-6 md:px-10">
        <SectionHeading
          index="01"
          eyebrow="Selected work"
          title="Seven systems, and what each one won’t do."
          lede="Every refusal below is a documented decision in that project’s own README or agent context. Press the button on each one and ask it anyway."
        />
      </div>

      {/* No HUD: each panel already says "01 / 07" and the header line shows progress. */}
      <div ref={pin} className="wk-pin relative walk:h-svh walk:overflow-clip">
        <div
          ref={track}
          className="wk-track relative flex flex-col gap-24 px-4 py-16 sm:px-6 md:px-10 walk:h-full walk:w-max walk:flex-row walk:gap-0 walk:p-0 walk:will-change-transform"
        >
          {PROJECTS.map((project, i) => (
            <ProjectPanel key={project.slug} project={project} index={i} total={PROJECTS.length} />
          ))}
        </div>
      </div>

      <LiveShots />
    </section>
  );
}
