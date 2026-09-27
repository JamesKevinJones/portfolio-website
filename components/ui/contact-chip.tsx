"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MQ } from "@/lib/animation-constants";
import { useCopyEmail } from "@/lib/use-copy-email";

type ContactChipProps = {
  /** Chip appears once this section's top reaches the bottom of the screen. */
  showFrom?: string;
  /** ...and gets out of the way once this section's top reaches 85% of the screen. */
  hideAt?: string;
};

/**
 * Floating glass pill, bottom-right, that copies the email from anywhere between the
 * hero and the footer. Adapted from cred.club's fixed "download CRED" QR chip: a
 * persistent, quiet call to action that never competes with the fold headline. It hides
 * while the hero is on screen (the hero has its own buttons) and once the real contact
 * section arrives, so it never duplicates a visible action.
 * Hidden means visibility: hidden (autoAlpha), so it also leaves the tab order.
 */
export function ContactChip({ showFrom = "#work", hideAt = "#contact" }: ContactChipProps) {
  const chip = useRef<HTMLDivElement>(null);
  const { copied, copy } = useCopyEmail();

  useGSAP(
    () => {
      const el = chip.current!;
      gsap.set(el, { autoAlpha: 0, yPercent: 150 });

      const mm = gsap.matchMedia();
      // Motion: slide up from below the fold with power3.out, drop away with power3.in.
      // Reduced motion: the same show/hide, instantly.
      mm.add({ motion: MQ.motion, reduce: MQ.reduce }, (ctx) => {
        const still = Boolean(ctx.conditions?.reduce);
        const show = (on: boolean) =>
          gsap.to(el, {
            autoAlpha: on ? 1 : 0,
            yPercent: on ? 0 : 150,
            duration: still ? 0 : on ? DURATION.base : DURATION.fast,
            ease: on ? EASE.out : EASE.in,
            overwrite: true,
          });

        const st = ScrollTrigger.create({
          trigger: showFrom,
          start: "top bottom", // first pixel of the section enters the screen
          endTrigger: hideAt,
          end: "top 85%", // the contact section is clearly arriving
          onToggle: (self) => show(self.isActive),
        });
        return () => st.kill();
      });

      return () => mm.revert();
    },
    { dependencies: [showFrom, hideAt] },
  );

  return (
    <div
      ref={chip}
      className="invisible fixed bottom-4 right-4 z-40 md:bottom-8 md:right-8"
    >
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Email copied" : "Copy email address"}
        className="label flex items-center gap-2 rounded-full sm:gap-3 border border-line bg-ink/70 px-4 py-3 text-bone backdrop-blur-md transition-colors duration-300 hover:border-neon"
      >
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-neon" />
        {/* Phones get a compact "@" pill so the chip never reaches a panel's Try button
            (checked at 375×667 in page.spec.ts); the words stay for screen readers. */}
        <span aria-hidden="true" className="sm:hidden">
          {copied ? "✓" : "@"}
        </span>
        <span aria-live="polite" className="sr-only sm:not-sr-only">
          {copied ? "Copied" : "Copy email"}
        </span>
      </button>
    </div>
  );
}
