"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Ban } from "lucide-react";
import { PROJECTS, type Project } from "@/lib/projects";

function ProjectCard({ project }: { project: Project }) {
  const { refuses } = project;

  return (
    <article
      data-card
      className="group/card brut flex flex-col"
    >
      {/* Accent rule. One colour per project, so the grid is scannable by hue
          before a word is read. */}
      <div className="h-2 bg-neon" aria-hidden />

      <div className="flex flex-1 flex-col p-5 sm:p-7">
        <p className="label flex items-center gap-2 text-ink-soft dark:text-paper-dim">
          {project.domain}
          <span aria-hidden>·</span>
          <span
            className={`bg-neon text-ink px-1.5 py-0.5`}
          >
            {project.status}
          </span>
        </p>

        <h3 className="mt-3 font-display text-3xl font-black sm:text-4xl">
          {project.name}
        </h3>

        <p className="mt-3 text-ink-soft dark:text-paper-dim">
          {project.blurb}
        </p>

        {/*
          The signature. Hazard striping is used on this element and nowhere
          else on the site, which is what keeps it reading as a warning label
          rather than texture.
        */}
        <div className="brut-sm mt-6 overflow-hidden">
          <div className="hazard hazard-live h-3" aria-hidden />
          <div className="p-4">
            <p className="label flex items-center gap-1.5">
              <Ban size={13} aria-hidden />
              Refuses
            </p>
            <p className="mt-2 font-display text-xl font-extrabold sm:text-2xl">
              {refuses.headline}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft dark:text-paper-dim">
              {refuses.detail}
            </p>
          </div>
        </div>

        <ul className="mt-6 space-y-1.5">
          {project.facts.map((fact) => (
            <li key={fact} className="label flex gap-2">
              <span aria-hidden className="text-ink-soft dark:text-paper-dim">
                —
              </span>
              {fact}
            </li>
          ))}
        </ul>

        <p className="mt-5 font-mono text-xs text-ink-soft dark:text-paper-dim">
          {project.stack.join("  ·  ")}
        </p>

        {/* Pushed to the card foot so buttons align across a row. */}
        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer noopener"
              className={`brut-sm brut-press label flex items-center gap-1.5 px-4 py-2.5 bg-neon text-ink`}
            >
              Live
              <ArrowUpRight size={14} aria-hidden />
            </a>
          )}
          <a
            href={project.source}
            target="_blank"
            rel="noreferrer noopener"
            className="brut-sm brut-press label flex items-center gap-1.5 px-4 py-2.5"
          >
            Source
            <ArrowUpRight size={14} aria-hidden />
          </a>
        </div>
      </div>
    </article>
  );
}

export function Work() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.registerPlugin(ScrollTrigger);

      /*
        batch() reveals whatever is on screen together rather than firing one
        trigger per card, so a fast scroll doesn’t leave a trail of elements
        animating in behind the viewport.
      */
      ScrollTrigger.batch("[data-card]", {
        start: "top 88%",
        onEnter: (batch) =>
          gsap.from(batch, {
            y: 28,
            opacity: 0,
            duration: 0.55,
            ease: "power3.out",
            stagger: 0.09,
            overwrite: true,
          }),
      });

      /*
        ScrollTrigger measures before web fonts land, so a display face
        swapping in after layout leaves every start position stale. Scoped
        inside the effect: at module scope this fires before the triggers
        exist and leaves them broken.
      */
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    }, root);

    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="work" className="border-b-[3px] scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="label text-ink-soft dark:text-paper-dim">Selected work</p>
        <h2 className="mt-4 max-w-3xl font-display text-[clamp(2rem,6vw,3.75rem)] font-black">
          Six systems, and what each one won’t do.
        </h2>
        <p className="mt-5 max-w-2xl text-ink-soft dark:text-paper-dim">
          Every refusal below is a documented decision in that project’s own
          README or agent context — not a claim written for this page.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
