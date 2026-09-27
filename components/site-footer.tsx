"use client";

import { useRef } from "react";
import { GithubMark, LinkedinMark } from "@/components/brand-icons";
import { PROFILE } from "@/lib/site";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MQ, STAGGER } from "@/lib/animation-constants";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { LocalTime } from "@/components/ui/local-time";
import { useCopyEmail } from "@/lib/use-copy-email";

export function SiteFooter() {
  const root = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  // Same hook as the floating contact chip, so both copy and relabel identically.
  const { copied, copy } = useCopyEmail();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        SplitText.create(heading.current, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          // power4.out: heavier landing than section headings, this is the last word.
          // Plays when the footer's top crosses 75% and reverses if you scroll back up.
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 105,
              duration: DURATION.slow,
              ease: EASE.outStrong,
              stagger: STAGGER.lines,
              scrollTrigger: { trigger: root.current, start: "top 75%", toggleActions: "play none none reverse" },
            }),
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <footer ref={root} id="contact" className="relative overflow-hidden border-t border-line px-4 pb-10 pt-24 sm:px-6 md:px-10 md:pt-36">
      <p className="label flex gap-4 text-mute">
        <span className="text-neon">04</span>
        <span>Contact</span>
      </p>
      <h2
        ref={heading}
        className="split-pad mt-8 max-w-5xl font-display text-[clamp(2.6rem,8vw,7.5rem)] font-medium leading-[0.9] tracking-[-0.045em]"
      >
        Open to <span className="text-outline">internships</span> and graduate <span className="text-neon">roles.</span>
      </h2>
      <p className="mt-8 max-w-lg text-lg leading-relaxed text-mute">
        Third-year, graduating 2027. Chennai or remote. If you want to talk about any of the
        work above, the fastest route is email.
      </p>

      <div className="mt-14 flex flex-wrap items-center gap-8">
        <MagneticButton onClick={copy} ariaLabel={copied ? "Email copied" : "Copy email address"}>
          {/* Two stacked labels; the column slides up one line on copy. transform only. */}
          <span className="relative block h-[1.2em] overflow-hidden leading-[1.2em]">
            <span className={`flex flex-col transition-transform duration-500 ease-expo-out ${copied ? "-translate-y-1/2" : ""}`}>
              <span>Copy email</span>
              <span>Copied</span>
            </span>
          </span>
        </MagneticButton>
        <MagneticButton href={PROFILE.github} external variant="ghost" strength={0.5}>
          <GithubMark size={15} /> GitHub
        </MagneticButton>
        <MagneticButton href={PROFILE.linkedin} external variant="ghost" strength={0.5}>
          <LinkedinMark size={15} /> LinkedIn
        </MagneticButton>
        <a href={`mailto:${PROFILE.email}`} className="font-mono text-sm text-mute underline-offset-4 hover:text-neon hover:underline">
          {PROFILE.email}
        </a>
      </div>
      <p role="status" className="sr-only">
        {copied ? "Email address copied to clipboard" : ""}
      </p>

      <div className="label mt-24 flex flex-wrap justify-between gap-4 text-mute">
        <span>{PROFILE.fullName}</span>
        <span>
          Chennai · <LocalTime />
        </span>
        <span>Built with Next.js, GSAP and Lenis</span>
        <a href="#top" className="hover:text-neon">
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
