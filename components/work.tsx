"use client";

import { useEffect, useRef } from "react";
import type Lenis from "lenis";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MQ, SCROLL, STAGGER } from "@/lib/animation-constants";
import { PROJECTS } from "@/lib/projects";
import { useLenis } from "@/components/lenis-provider";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectPanel } from "@/components/project-panel";
import { poseScene, runScene } from "@/components/scenes";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Six projects, one screen each.
 * Walkthrough (MQ.walkthrough + motion): the pin wrapper pins and vertical scroll drives
 * the inner track sideways; each panel's blocks and scene play as it arrives.
 * Stacked (smaller or shorter screens): a vertical list with scroll reveals.
 * Reduced motion: the same list, final state, no triggers.
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
              // See Task 5: reveal at 85%, play the scene at 70%.
              gsap.from(panel.querySelectorAll(".wk-reveal"), {
                y: 32,
                opacity: 0,
                duration: DURATION.base,
                ease: EASE.out,
                stagger: STAGGER.items,
                scrollTrigger: { trigger: panel, start: "top 85%", toggleActions: "play none none none" },
              });
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

          const el = root.current!;
          const setProgress = gsap.quickSetter(el.querySelector(".wk-progress"), "scaleX");
          const digits = el.querySelector(".wk-digits");
          let current = -1;
          const distance = () => track.current!.scrollWidth - window.innerWidth;

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
              onUpdate: (self) => {
                setProgress(self.progress);
                const step = Math.min(panels.length - 1, Math.round(self.progress * (panels.length - 1)));
                if (step !== current) {
                  current = step;
                  // expo.out: the counter snaps to the new digit and feathers in.
                  gsap.to(digits, {
                    yPercent: (-100 / panels.length) * step,
                    duration: DURATION.base,
                    ease: EASE.expo,
                    overwrite: true,
                  });
                }
              },
            },
          });

          panels.forEach((panel, i) => {
            if (i > 0) {
              // Scrubbed against the horizontal track via containerAnimation: blocks rise
              // as the panel's left edge moves from 85% to 35% of the viewport width.
              gsap.from(panel.querySelectorAll(".wk-reveal"), {
                y: 40,
                opacity: 0,
                stagger: STAGGER.items,
                ease: EASE.scrub,
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: scroller,
                  start: "left 85%",
                  end: "left 35%",
                  scrub: true,
                },
              });
            }
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
          title="Six systems, and what each one won’t do."
          lede="Every refusal below is a documented decision in that project’s own README or agent context. Press the button on each one and ask it anyway."
        />
      </div>

      <div ref={pin} className="wk-pin relative walk:h-svh walk:overflow-clip">
        {/* HUD: walkthrough mode only. */}
        <div className="label pointer-events-none absolute inset-x-0 top-0 z-20 hidden items-center justify-between px-10 pt-16 text-mute walk:flex">
          <span>Keep scrolling →</span>
          <div className="flex items-center gap-4">
            <span className="flex h-[1.2em] overflow-hidden text-bone" aria-hidden="true">
              <span className="wk-digits flex flex-col leading-[1.2em] will-change-transform">
                {PROJECTS.map((p, i) => (
                  <span key={p.slug}>{pad(i + 1)}</span>
                ))}
              </span>
            </span>
            <span className="relative h-px w-40 bg-line">
              <span
                className="wk-progress absolute inset-0 origin-left bg-neon will-change-transform"
                style={{ transform: "scaleX(0)" }}
              />
            </span>
            <span>{pad(PROJECTS.length)}</span>
          </div>
        </div>

        <div
          ref={track}
          className="wk-track relative flex flex-col gap-24 px-4 py-16 sm:px-6 md:px-10 walk:h-full walk:w-max walk:flex-row walk:gap-0 walk:p-0 walk:will-change-transform"
        >
          {PROJECTS.map((project, i) => (
            <ProjectPanel key={project.slug} project={project} index={i} total={PROJECTS.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
