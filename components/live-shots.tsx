"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MQ, STAGGER } from "@/lib/animation-constants";
import { PROJECTS } from "@/lib/projects";

const SHOTS = PROJECTS.filter((p) => p.shot && p.live);

/**
 * The deployed projects as they actually run: the scenes above act out each refusal, these
 * are the real interfaces. Each picture links to its live site.
 */
export function LiveShots() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.utils.toArray<HTMLElement>(".ls-item").forEach((item) => {
          // Picture first, then its caption: two parts of one figure, not one fade.
          gsap.from(item.children, {
            y: 28,
            opacity: 0,
            duration: DURATION.base,
            ease: EASE.out,
            stagger: STAGGER.items,
            scrollTrigger: { trigger: item, start: "top 85%", toggleActions: "play none none none" },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="px-4 pb-8 pt-24 sm:px-6 md:px-10 md:pt-32">
      <h3 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[0.95] tracking-[-0.035em]">
        As they run today.
      </h3>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-bone/80">
        Screenshots of the live deployments, taken 17–19 October 2026. MemoryVault AI sits behind a
        Google sign-in, so it isn’t shown.
      </p>

      <ul className="mt-14 grid gap-x-8 gap-y-16 md:grid-cols-2">
        {SHOTS.map(({ slug, name, live, shot }) => (
          <li key={slug} className="ls-item">
            <a
              href={live}
              target="_blank"
              rel="noreferrer noopener"
              className="group block overflow-hidden rounded-2xl bg-ink-2"
            >
              <Image
                src={shot!.src}
                alt={shot!.alt}
                width={1440}
                height={900}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="aspect-[16/10] w-full object-cover object-left-top transition-transform duration-700 ease-expo-out group-hover:scale-[1.03]"
              />
            </a>
            <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <p className="font-display text-2xl font-medium tracking-[-0.02em]">{name}</p>
              <a
                href={live}
                target="_blank"
                rel="noreferrer noopener"
                className="label inline-flex items-center gap-1.5 text-mute transition-colors hover:text-neon"
              >
                Open live <ArrowUpRight size={14} aria-hidden="true" />
              </a>
              <p className="basis-full text-base leading-relaxed text-bone/80">{shot!.caption}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
