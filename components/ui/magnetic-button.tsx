"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MQ } from "@/lib/animation-constants";

type MagneticButtonProps = {
  children: ReactNode;
  href?: string;
  /** Opens in a new tab with rel=noopener. */
  external?: boolean;
  onClick?: () => void;
  /** 0 to 1: how far the pill travels toward the cursor. */
  strength?: number;
  variant?: "solid" | "ghost";
  className?: string;
  ariaLabel?: string;
};

/**
 * Cursor-following pill. The hit zone extends 20px past the visible pill; pill and label
 * chase the pointer at different rates for depth and spring home on release. A neon disc
 * scales in from the entry point. Touch, coarse pointers and reduced motion get a static
 * pill with an instant neon hover.
 */
export function MagneticButton({
  children,
  href,
  external = false,
  onClick,
  strength = 0.35,
  variant = "solid",
  className = "",
  ariaLabel,
}: MagneticButtonProps) {
  const zone = useRef<HTMLSpanElement>(null);
  const pill = useRef<HTMLElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(`${MQ.motion} and ${MQ.finePointer}`, () => {
        const z = zone.current!;
        const p = pill.current!;
        const l = label.current!;
        const f = fill.current!;
        gsap.set(f, { scale: 0, x: 0, y: 0, xPercent: -50, yPercent: -50 });

        let follow: Record<"px" | "py" | "lx" | "ly", gsap.QuickToFunc> | null = null;
        // power3.out on quickTo: the pill catches up fast then eases in, so it feels
        // attached to the cursor without jitter. The label lags 0.1s more for parallax.
        const makeFollow = () => ({
          px: gsap.quickTo(p, "x", { duration: 0.5, ease: EASE.out }),
          py: gsap.quickTo(p, "y", { duration: 0.5, ease: EASE.out }),
          lx: gsap.quickTo(l, "x", { duration: 0.6, ease: EASE.out }),
          ly: gsap.quickTo(l, "y", { duration: 0.6, ease: EASE.out }),
        });

        const local = (e: PointerEvent) => {
          const r = p.getBoundingClientRect();
          return { x: e.clientX - r.left, y: e.clientY - r.top };
        };

        const onEnter = (e: PointerEvent) => {
          gsap.killTweensOf([p, l]);
          follow = makeFollow();
          gsap.set(f, local(e));
          gsap.to(f, { scale: 1, duration: DURATION.base, ease: EASE.out, overwrite: true });
        };

        const onMove = (e: PointerEvent) => {
          if (!follow) return;
          const zr = z.getBoundingClientRect();
          const dx = e.clientX - (zr.left + zr.width / 2);
          const dy = e.clientY - (zr.top + zr.height / 2);
          follow.px(dx * strength);
          follow.py(dy * strength);
          follow.lx(dx * strength * 0.45);
          follow.ly(dy * strength * 0.45);
        };

        const onLeave = (e: PointerEvent) => {
          follow = null;
          gsap.killTweensOf([p, l]);
          // Elastic release: overshoots home and settles, which is what sells "magnet".
          gsap.to([p, l], { x: 0, y: 0, duration: 1.3, ease: "elastic.out(1.1, 0.32)" });
          // power2.in: the disc accelerates out of the exit point, like it is pulled away.
          gsap.to(f, { ...local(e), scale: 0, duration: 0.45, ease: "power2.in", overwrite: true });
        };

        z.addEventListener("pointerenter", onEnter);
        z.addEventListener("pointermove", onMove);
        z.addEventListener("pointerleave", onLeave);
        return () => {
          z.removeEventListener("pointerenter", onEnter);
          z.removeEventListener("pointermove", onMove);
          z.removeEventListener("pointerleave", onLeave);
        };
      });

      return () => mm.revert();
    },
    { dependencies: [strength] },
  );

  const base =
    "relative inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-4 font-mono text-sm uppercase tracking-[0.18em] outline-none focus-visible:ring-2 focus-visible:ring-neon focus-visible:ring-offset-4 focus-visible:ring-offset-ink will-change-transform";
  const look =
    variant === "solid"
      ? "bg-bone text-ink motion-reduce:hover:bg-neon [@media(pointer:coarse)]:active:bg-neon"
      : "border border-line text-bone [@media(hover:hover)]:hover:text-ink motion-reduce:hover:bg-neon motion-reduce:hover:text-ink";

  const inner = (
    <>
      <span
        ref={fill}
        aria-hidden="true"
        style={{ transform: "scale(0)" }}
        className="pointer-events-none absolute left-0 top-0 aspect-square h-[260%] rounded-full bg-neon motion-reduce:hidden [@media(pointer:coarse)]:hidden"
      />
      <span ref={label} className="relative z-10 inline-flex items-center gap-3 will-change-transform">
        {children}
      </span>
    </>
  );

  return (
    <span ref={zone} className={`-m-5 inline-block p-5 ${className}`}>
      {href ? (
        <a
          ref={pill as RefObject<HTMLAnchorElement>}
          href={href}
          aria-label={ariaLabel}
          {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
          className={`${base} ${look}`}
        >
          {inner}
        </a>
      ) : (
        <button
          ref={pill as RefObject<HTMLButtonElement>}
          type="button"
          onClick={onClick}
          aria-label={ariaLabel}
          className={`${base} ${look}`}
        >
          {inner}
        </button>
      )}
    </span>
  );
}
