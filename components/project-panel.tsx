"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Ban } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ } from "@/lib/animation-constants";
import type { Project } from "@/lib/projects";
import { SCENES, runScene } from "@/components/scenes";

type ProjectPanelProps = { project: Project; index: number; total: number };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * One project: copy on the left, the stage on the right. The Try button asks the system
 * for the thing it refuses; the scene replays the refusal, the button shakes "no" and the
 * status line announces it (aria-live), counting repeat attempts.
 */
export function ProjectPanel({ project, index, total }: ProjectPanelProps) {
  const panel = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [tries, setTries] = useState(0);
  const { Scene } = SCENES[project.slug];
  const { contextSafe } = useGSAP({ scope: panel });

  const attempt = () => {
    setTries((n) => n + 1);
    if (window.matchMedia(MQ.reduce).matches) return;
    // contextSafe at click time (not during render) so these tweens join the panel's
    // GSAP context and are reverted on unmount.
    contextSafe(() => {
      runScene(stage.current!);
      // A head-shake: decaying keyframes, power2.out so the last wobble is the smallest.
      gsap.fromTo(
        button.current,
        { x: 0 },
        { keyframes: { x: [0, -10, 9, -6, 4, 0] }, duration: 0.5, ease: "power2.out", overwrite: true },
      );
    })();
  };

  const status =
    tries === 0 ? "" : `Refused${tries > 1 ? ` ×${tries}` : ""}. ${project.refuses.headline}`;

  return (
    <article
      ref={panel}
      aria-labelledby={`${project.slug}-name`}
      className="wk-panel group/panel relative walk:h-full walk:w-[88vw] walk:shrink-0 walk:px-10 walk:pb-10 walk:pt-20"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12 walk:h-full">
        <div className="flex flex-col gap-5 walk:gap-4">
          <p className="wk-reveal label flex flex-wrap items-center gap-3 text-mute">
            <span className="text-neon">
              {pad(index + 1)} / {pad(total)}
            </span>
            <span>{project.domain}</span>
            <span className="rounded-full border border-line px-2 py-0.5">{project.status}</span>
          </p>
          <h3
            id={`${project.slug}-name`}
            className="wk-reveal font-display text-[clamp(2.4rem,5vw,4.8rem)] font-medium walk:text-[clamp(2.4rem,4vw,4.8rem)] leading-[0.92] tracking-[-0.04em]"
          >
            {project.name}
          </h3>
          <p className="wk-reveal max-w-xl text-base leading-relaxed text-mute">{project.blurb}</p>

          {/* The refusal band. The only place on the site the hazard stripe appears. */}
          <div className="wk-reveal overflow-hidden rounded-2xl border border-line bg-ink-2">
            <div className="hazard hazard-live h-2" aria-hidden="true" />
            <div className="p-5 walk:p-4">
              <p className="label flex items-center gap-2 text-neon">
                <Ban size={13} aria-hidden="true" /> Refuses
              </p>
              <p className="mt-2 font-display text-[clamp(1.35rem,2.2vw,1.9rem)] font-medium leading-tight tracking-[-0.02em]">
                {project.refuses.headline}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-mute">{project.refuses.detail}</p>
            </div>
          </div>

          <div className="wk-reveal flex flex-wrap gap-x-8 gap-y-3">
            <ul className="space-y-1">
              {project.facts.map((fact) => (
                <li key={fact} className="label flex gap-2">
                  <span aria-hidden="true" className="text-neon">
                    —
                  </span>
                  {fact}
                </li>
              ))}
            </ul>
            <p className="font-mono text-xs leading-relaxed text-mute">{project.stack.join(" · ")}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:justify-center">
          <div className="wk-reveal mesh overflow-hidden rounded-3xl border border-line bg-ink-2">
            <div
              ref={stage}
              data-stage
              data-scene={project.slug}
              data-state="refused"
              // Height follows width, so very wide, short screens (2560×760) pushed the Try row
              // and links off the pinned panel. Cap it to what the screen leaves: 100svh minus
              // the panel's padding (7.5rem), the stage footer, the gap and the links row.
              className="aspect-[400/260] w-full p-4 text-bone walk:max-h-[calc(100svh-17rem)]"
            >
              <Scene />
            </div>
            <div data-stage-footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4">
              <button
                ref={button}
                type="button"
                onClick={attempt}
                className="label rounded-full bg-bone px-5 py-3 text-ink transition-colors duration-300 hover:bg-neon"
              >
                {project.attempt}
              </button>
              <p role="status" className="label min-h-[2.75em] basis-full leading-snug text-neon walk:min-h-[1em] walk:basis-auto">
                {status}
              </p>
            </div>
          </div>
          <div className="wk-reveal flex flex-wrap gap-3">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer noopener"
                className="label inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 transition-colors hover:border-neon hover:text-neon"
              >
                Live <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            )}
            <a
              href={project.source}
              target="_blank"
              rel="noreferrer noopener"
              className="label inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 transition-colors hover:border-neon hover:text-neon"
            >
              Source <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
