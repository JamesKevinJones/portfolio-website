"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { MQ } from "@/lib/animation-constants";

type ParticleFieldProps = {
  /** Grid pitch in CSS pixels. */
  spacing?: number;
  /** Pointer influence radius in CSS pixels. */
  radius?: number;
  /** Displacement strength at the pointer. */
  force?: number;
  accent?: string;
  base?: string;
  /**
   * While the pointer is over the element matching this selector, the field stops:
   * the ticker is removed and the last frame stays on the canvas. The hero points it at
   * the word "stop.".
   */
  freezeSelector?: string;
  className?: string;
};

/**
 * Ambient particle grid on a single canvas. Points drift on a slow sine field and are
 * repelled by the pointer, then settle back on a damped spring. The loop runs on GSAP's
 * ticker, pauses offscreen, and renders a single static frame under reduced motion.
 */
export function ParticleField({
  spacing = 26,
  radius = 170,
  force = 46,
  accent = "#c8ff2e",
  base = "#ededea",
  freezeSelector,
  className = "",
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const mm = gsap.matchMedia();

    mm.add({ motion: MQ.motion, reduce: MQ.reduce }, (mmCtx) => {
      const animate = Boolean(mmCtx.conditions?.motion);
      // Per point: home x, home y, x, y, vx, vy
      let pts = new Float32Array(0);
      let count = 0;
      let w = 0;
      let h = 0;
      let dpr = 1;
      const pointer = { x: -1e5, y: -1e5, clientX: -1e5, clientY: -1e5, heat: 0 };
      let visible = true;
      let running = false;
      let frozen = false;

      const build = () => {
        const rect = canvas.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = rect.width;
        h = rect.height;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const cols = Math.ceil(w / spacing) + 1;
        const rows = Math.ceil(h / spacing) + 1;
        const offX = (w - (cols - 1) * spacing) / 2;
        const offY = (h - (rows - 1) * spacing) / 2;
        count = cols * rows;
        pts = new Float32Array(count * 6);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const i = (r * cols + c) * 6;
            const x = offX + c * spacing;
            const y = offY + r * spacing;
            pts[i] = x;
            pts[i + 1] = y;
            pts[i + 2] = x;
            pts[i + 3] = y;
          }
        }
        if (!animate) draw(0);
      };

      const draw = (t: number) => {
        ctx.clearRect(0, 0, w, h);
        const r2 = radius * radius;
        const k = 0.08; // spring stiffness
        const damp = 0.82;

        ctx.fillStyle = base;
        ctx.globalAlpha = 0.16;
        ctx.beginPath();
        for (let n = 0; n < count; n++) {
          const i = n * 6;
          const hx = pts[i];
          const hy = pts[i + 1];
          let tx = hx;
          let ty = hy;
          if (animate) {
            tx += Math.sin(t * 0.0005 + hy * 0.018) * 3;
            ty += Math.cos(t * 0.0004 + hx * 0.014) * 3;
            const dx = hx - pointer.x;
            const dy = hy - pointer.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < r2 && d2 > 0.01) {
              const d = Math.sqrt(d2);
              const falloff = 1 - d / radius;
              const push = falloff * falloff * force * pointer.heat;
              tx += (dx / d) * push;
              ty += (dy / d) * push;
            }
            pts[i + 4] = (pts[i + 4] + (tx - pts[i + 2]) * k) * damp;
            pts[i + 5] = (pts[i + 5] + (ty - pts[i + 3]) * k) * damp;
            pts[i + 2] += pts[i + 4];
            pts[i + 3] += pts[i + 5];
          }
          ctx.rect(pts[i + 2] - 0.75, pts[i + 3] - 0.75, 1.5, 1.5);
        }
        ctx.fill();

        if (!animate || pointer.heat < 0.01) {
          ctx.globalAlpha = 1;
          return;
        }

        // Accent pass: only points inside the pointer radius, brighter and larger toward the center.
        ctx.fillStyle = accent;
        for (let n = 0; n < count; n++) {
          const i = n * 6;
          const dx = pts[i + 2] - pointer.x;
          const dy = pts[i + 3] - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > r2) continue;
          const f = 1 - Math.sqrt(d2) / radius;
          const s = 1 + f * 2.2;
          ctx.globalAlpha = f * pointer.heat;
          ctx.fillRect(pts[i + 2] - s / 2, pts[i + 3] - s / 2, s, s);
        }
        ctx.globalAlpha = 1;
      };

      const tick = (time: number) => {
        // Map the last pointer position into canvas space once per frame (one layout read, no writes).
        const rect = canvas.getBoundingClientRect();
        pointer.x = pointer.clientX - rect.left;
        pointer.y = pointer.clientY - rect.top;
        draw(time * 1000);
      };

      const setRunning = () => {
        const next = animate && visible && !frozen && document.visibilityState === "visible";
        if (next === running) return;
        running = next;
        if (running) gsap.ticker.add(tick);
        else gsap.ticker.remove(tick);
      };

      const freezeEl = freezeSelector ? document.querySelector(freezeSelector) : null;
      const onFreeze = () => {
        frozen = true;
        setRunning();
      };
      const onThaw = () => {
        frozen = false;
        setRunning();
      };

      const heatTo = gsap.quickTo(pointer, "heat", { duration: 0.6, ease: "power2.out" });
      const onMove = (e: PointerEvent) => {
        pointer.clientX = e.clientX;
        pointer.clientY = e.clientY;
        heatTo(1);
      };
      const onLeave = () => heatTo(0);

      const ro = new ResizeObserver(build);
      ro.observe(canvas);
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        setRunning();
      });
      io.observe(canvas);
      // A ScrollTrigger pin on an ancestor (the hero) reparents it into a pin-spacer.
      // Chrome then reports one 0×0, not-intersecting entry and never fires again, which
      // parked the loop with a blank canvas. Re-observing after each refresh, once the
      // pins are in place, gets a fresh entry that reflects what is really on screen.
      const reobserve = () => {
        io.unobserve(canvas);
        io.observe(canvas);
      };
      ScrollTrigger.addEventListener("refresh", reobserve);
      document.addEventListener("visibilitychange", setRunning);
      if (animate && freezeEl) {
        freezeEl.addEventListener("pointerenter", onFreeze);
        freezeEl.addEventListener("pointerleave", onThaw);
      }
      if (animate) {
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
      }
      build();
      setRunning();

      return () => {
        gsap.ticker.remove(tick);
        ro.disconnect();
        io.disconnect();
        ScrollTrigger.removeEventListener("refresh", reobserve);
        document.removeEventListener("visibilitychange", setRunning);
        freezeEl?.removeEventListener("pointerenter", onFreeze);
        freezeEl?.removeEventListener("pointerleave", onThaw);
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
      };
    });

    return () => mm.revert();
  }, { dependencies: [spacing, radius, force, accent, base, freezeSelector] });

  return <canvas ref={canvasRef} aria-hidden="true" className={`block h-full w-full ${className}`} />;
}
