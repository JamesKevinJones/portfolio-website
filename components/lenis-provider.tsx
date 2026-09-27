"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { LENIS, MQ } from "@/lib/animation-constants";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const LenisContext = createContext<Lenis | null>(null);

/** The live Lenis instance, or null when reduced motion keeps native scrolling. */
export const useLenis = () => useContext(LenisContext);

/**
 * Smooth scroll wrapper synchronized with ScrollTrigger.
 * - Lenis is driven by gsap.ticker (autoRaf off), so smooth scroll and every ScrollTrigger
 *   update in the same rAF: no one-frame lag between scroll position and pinned scenes.
 * - Every Lenis scroll event calls ScrollTrigger.update.
 * - Reduced motion: Lenis is never created; the page scrolls natively.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(MQ.motion, () => {
      const instance = new Lenis({ ...LENIS, autoRaf: false, anchors: true });
      instance.on("scroll", ScrollTrigger.update);

      // gsap.ticker passes seconds; Lenis expects milliseconds.
      const tick = (time: number) => instance.raf(time * 1000);
      gsap.ticker.add(tick);
      // Lag smoothing would make Lenis jump after a dropped frame; disable while it runs.
      gsap.ticker.lagSmoothing(0);
      setLenis(instance);

      return () => {
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33);
        instance.destroy();
        setLenis(null);
      };
    });

    // Webfonts change text metrics after first paint; re-measure every trigger once loaded.
    let alive = true;
    document.fonts?.ready.then(() => alive && ScrollTrigger.refresh());

    return () => {
      alive = false;
      mm.revert();
    };
  });

  // App Router navigations keep this provider mounted: reset scroll and re-measure
  // triggers once the new route's layout has painted.
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname, lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
