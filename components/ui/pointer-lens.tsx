"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MQ } from "@/lib/animation-constants";

type PointerLensProps = {
  /** What the visitor sees normally. */
  base: ReactNode;
  /** What the lens shows. Must lay out exactly like `base` (same box, same size). */
  reveal: ReactNode;
  /** When true the whole `reveal` layer is shown: the keyboard, touch and reduced-motion path. */
  open?: boolean;
  /** Lens diameter in px. cred.club uses a 250px radius on a 1190px-wide fold. */
  size?: number;
  /** Sweep the lens across once when the element first scrolls into view, as a hint. */
  hint?: boolean;
  className?: string;
  /** Test hook for the full reveal layer. */
  revealTestId?: string;
};

/**
 * A round lens that follows the pointer and shows a second layer through it.
 * Adapted from cred.club, which does this twice with two techniques: an SVG mask circle
 * whose cx/cy/r are tweened (bank-note fold) and a background-clip:text radial gradient
 * whose background-position follows the mouse (security fold). Both animate layout-level
 * properties. This version moves and scales two elements with transforms only:
 *
 *   lens  (overflow hidden, round)   translate to the pointer, scale 0 -> 1 to open
 *   inner (copy of `reveal`)         counter-translate and counter-scale (1/s about the
 *                                    pointer) so its content stays registered with `base`
 *
 * Fine pointers with motion allowed get the lens. Everyone else gets `open` only.
 */
export function PointerLens({
  base,
  reveal,
  open = false,
  size = 280,
  hint = false,
  className = "",
  revealTestId,
}: PointerLensProps) {
  const root = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(`${MQ.motion} and ${MQ.finePointer}`, () => {
        const r = root.current!;
        const l = lens.current!;
        const i = inner.current!;
        const half = size / 2;

        // The inner copy must be exactly the root's size so `reveal` wraps like `base`.
        const fit = () => gsap.set(i, { width: r.offsetWidth, height: r.offsetHeight });
        const ro = new ResizeObserver(fit);
        ro.observe(r);
        fit();

        const pos = { x: r.offsetWidth / 2, y: r.offsetHeight / 2 };
        const iris = { s: 0 };
        const apply = () => {
          const s = Math.max(iris.s, 0.001);
          gsap.set(l, { x: pos.x - half, y: pos.y - half, scale: s, autoAlpha: iris.s > 0.01 ? 1 : 0 });
          // Origin at the pointer (in the inner copy's own coordinates) keeps the point
          // under the lens centre fixed while the counter-scale undoes the lens scale.
          gsap.set(i, {
            x: -(pos.x - half),
            y: -(pos.y - half),
            scale: 1 / s,
            transformOrigin: `${pos.x}px ${pos.y}px`,
          });
        };
        apply();

        // power3.out chase: the lens trails the cursor by ~DURATION.follow and lands
        // softly, which reads as a physical loupe rather than a cursor replacement.
        const toX = gsap.quickTo(pos, "x", { duration: DURATION.follow, ease: EASE.out, onUpdate: apply });
        const toY = gsap.quickTo(pos, "y", { duration: DURATION.follow, ease: EASE.out, onUpdate: apply });

        // Pointer position in the root's own (unscaled) pixels. Dividing by the rendered
        // scale keeps the lens registered while an ancestor is mid-transform, e.g. the
        // about section's curtain scrubbing its image wrapper from scale 1.15 to 1.
        const local = (e: PointerEvent) => {
          const b = r.getBoundingClientRect();
          const kx = b.width / r.offsetWidth || 1;
          const ky = b.height / r.offsetHeight || 1;
          return { x: (e.clientX - b.left) / kx, y: (e.clientY - b.top) / ky };
        };

        let sweep: gsap.core.Timeline | null = null;

        const onEnter = (e: PointerEvent) => {
          sweep?.kill();
          const p = local(e);
          // Open from where the pointer entered, not from wherever the lens last was.
          gsap.set(pos, p);
          toX(p.x);
          toY(p.y);
          // expo.out iris: most of the opening happens in the first 150ms.
          gsap.to(iris, { s: 1, duration: DURATION.base, ease: EASE.expo, overwrite: true, onUpdate: apply });
        };
        const onMove = (e: PointerEvent) => {
          const p = local(e);
          toX(p.x);
          toY(p.y);
        };
        // power3.in close: accelerates shut, so leaving feels decisive (cred uses 1s; this is faster).
        const onLeave = () =>
          gsap.to(iris, { s: 0, duration: DURATION.fast, ease: EASE.in, overwrite: true, onUpdate: apply });

        r.addEventListener("pointerenter", onEnter);
        r.addEventListener("pointermove", onMove);
        r.addEventListener("pointerleave", onLeave);

        // Hint: one diagonal pass the first time the element is 70% up the screen,
        // echoing cred's 4s sweep to the bottom-right corner. power2.inOut on the travel so
        // it starts and ends at rest; the iris opens and closes around it.
        const st = hint
          ? ScrollTrigger.create({
              trigger: r,
              start: "top 70%",
              once: true,
              onEnter: () => {
                const w = r.offsetWidth;
                const h = r.offsetHeight;
                gsap.set(pos, { x: w * 0.2, y: h * 0.25 });
                sweep = gsap
                  .timeline({ onUpdate: apply })
                  .to(iris, { s: 1, duration: DURATION.base, ease: EASE.expo })
                  .to(pos, { x: w * 0.8, y: h * 0.75, duration: 1.6, ease: "power2.inOut" }, 0.1)
                  .to(iris, { s: 0, duration: DURATION.fast, ease: EASE.in }, ">-0.2");
              },
            })
          : null;

        return () => {
          ro.disconnect();
          st?.kill();
          sweep?.kill();
          r.removeEventListener("pointerenter", onEnter);
          r.removeEventListener("pointermove", onMove);
          r.removeEventListener("pointerleave", onLeave);
        };
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [size, hint] },
  );

  return (
    <div ref={root} className={`relative isolate overflow-hidden ${className}`}>
      {base}
      {/* Full reveal: CSS transitions opacity only. Reduced motion collapses it to instant. */}
      <div
        aria-hidden="true"
        data-testid={revealTestId}
        className={`absolute inset-0 transition-opacity duration-500 ease-expo-out ${open ? "opacity-100" : "opacity-0"}`}
      >
        {reveal}
      </div>
      <div
        ref={lens}
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-0 top-0 overflow-hidden rounded-full"
        style={{ width: size, height: size }}
      >
        <div ref={inner} className="absolute left-0 top-0">
          {reveal}
        </div>
      </div>
    </div>
  );
}
