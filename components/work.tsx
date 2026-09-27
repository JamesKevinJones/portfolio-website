"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MQ, STAGGER } from "@/lib/animation-constants";
import { PROJECTS } from "@/lib/projects";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectPanel } from "@/components/project-panel";
import { runScene } from "@/components/scenes";

export function Work() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        gsap.utils.toArray<HTMLElement>(".wk-panel").forEach((panel) => {
          // Blocks settle up as the panel's top crosses 85% of the viewport: visible but
          // not yet at the fold. power3.out lands them without bounce.
          gsap.from(panel.querySelectorAll(".wk-reveal"), {
            y: 32,
            opacity: 0,
            duration: DURATION.base,
            ease: EASE.out,
            stagger: STAGGER.items,
            scrollTrigger: { trigger: panel, start: "top 85%", toggleActions: "play none none none" },
          });
          // The scene acts out its refusal once, when the stage is 70% down the screen,
          // i.e. comfortably in view. The Try button replays it after that.
          const stage = panel.querySelector<HTMLElement>("[data-stage]")!;
          ScrollTrigger.create({ trigger: stage, start: "top 70%", once: true, onEnter: () => runScene(stage) });
        });
      });

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
      <div className="wk-track relative flex flex-col gap-24 px-4 py-16 sm:px-6 md:px-10">
        {PROJECTS.map((project, i) => (
          <ProjectPanel key={project.slug} project={project} index={i} total={PROJECTS.length} />
        ))}
      </div>
    </section>
  );
}
