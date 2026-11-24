"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ } from "@/lib/animation-constants";
import { PROFILE } from "@/lib/site";
import { FIELD_PULL_EVENT } from "@/components/ui/particle-field";
import type { PullChain as Scene } from "./pull-chain-scene";

/**
 * A ball chain hanging into the hero with an edge-lit tag on the end. Pull the tag down
 * and the switch clicks: the particle field behind the headline stops, pull again and it
 * runs. The thesis as a toy.
 *
 * The canvas takes no pointer events, so the hero scrolls and hovers as before; only an
 * invisible handle kept over the tag does (touch-none, so dragging it doesn't scroll).
 * three.js is imported lazily. Reduced motion, no WebGL or no JS: nothing renders, and
 * the hero is unchanged.
 */
export function PullChain({ className = "" }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const handle = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(MQ.motion, () => {
      let alive = true;
      let scene: Scene | null = null;
      let ro: ResizeObserver | null = null;
      const tick = (_time: number, deltaMs: number) => scene?.tick(deltaMs / 1000);

      (async () => {
        const { createPullChain } = await import("./pull-chain-scene");
        const root = wrap.current, cv = canvas.current, hd = handle.current;
        if (!alive || !root || !cv || !hd) return;
        const css = getComputedStyle(document.body);
        const font = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
        try {
          scene = await createPullChain({
            canvas: cv,
            handle: hd,
            fonts: {
              display: font("--font-display", "sans-serif"),
              mono: font("--font-mono", "monospace"),
            },
            content: { initials: "KJ", name: PROFILE.name, role: PROFILE.role, place: PROFILE.place },
            colors: {
              ink2: "#111113",
              line: "#26262a",
              bone: "#ededea",
              mute: "#8b8b92",
              neon: "#c8ff2e",
            },
            onToggle: (stopped) =>
              window.dispatchEvent(new CustomEvent(FIELD_PULL_EVENT, { detail: { stopped } })),
          });
        } catch {
          return; // no WebGL: leave the hero as it was
        }
        if (!alive) {
          scene.destroy();
          return;
        }
        const s = scene;
        ro = new ResizeObserver(([entry]) => s.resize(entry.contentRect.width, entry.contentRect.height));
        ro.observe(root);
        gsap.ticker.add(tick);
        root.dataset.state = "live";
      })();

      return () => {
        alive = false;
        gsap.ticker.remove(tick);
        ro?.disconnect();
        scene?.destroy();
        // A switched-off field shouldn't outlive the switch.
        window.dispatchEvent(new CustomEvent(FIELD_PULL_EVENT, { detail: { stopped: false } }));
        if (wrap.current) delete wrap.current.dataset.state;
      };
    });

    return () => mm.revert();
  });

  return (
    <div
      ref={wrap}
      aria-hidden="true"
      data-testid="pull-chain"
      className={`pointer-events-none absolute inset-0 ${className}`}
    >
      <canvas ref={canvas} className="block h-full w-full" />
      <div
        ref={handle}
        data-testid="pull-chain-handle"
        data-lenis-prevent
        className="pointer-events-auto absolute left-0 top-0 hidden cursor-grab touch-none"
      />
    </div>
  );
}
