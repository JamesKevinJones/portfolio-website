"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const checks = [
  {
    label: "Open source",
    detail: "30+ public repos, actively maintained",
  },
  {
    label: "Datathon 2026",
    detail: "riskpulse — real-time payment risk, built for IBM Z",
  },
  {
    label: "CI-gated",
    detail: "frontier-platform fails its own build on quality regressions",
  },
  {
    label: "Currently",
    detail: "3rd-year CSE student, Chennai — open to internships",
  },
];

export function EvalGate() {
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLLIElement>(".gate-row");

      const updateCounter = () => {
        const counter = counterRef.current;
        if (!counter) return;
        const passing = rows.filter((row) =>
          row.classList.contains("is-passing"),
        ).length;
        counter.textContent = `${passing} / ${rows.length} passing`;
        counter.classList.toggle("all-passing", passing === rows.length);
      };

      const setRowState = (row: HTMLLIElement, passing: boolean) => {
        if (row.classList.contains("is-passing") === passing) return;
        row.classList.toggle("is-passing", passing);
        const glyph = row.querySelector(".gate-glyph");
        if (glyph) glyph.textContent = passing ? "✓" : "–";
      };

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        rows.forEach((row) => setRowState(row, false));
        updateCounter();

        ScrollTrigger.create({
          trigger: rootRef.current,
          start: "top 100px",
          end: `+=${rows.length * 320}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const target = Math.round(self.progress * rows.length);
            rows.forEach((row, i) => setRowState(row, i < target));
            updateCounter();
          },
        });

        // Web fonts settle after the first measurement pass; re-measure so the
        // pin distance matches the final laid-out height.
        document.fonts?.ready.then(() => ScrollTrigger.refresh());
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        rows.forEach((row) => setRowState(row, true));
        updateCounter();
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="mx-auto max-w-4xl px-6 py-16 sm:px-8 sm:py-24">
      <div className="glass overflow-hidden rounded-lg">
        <div className="flex items-center gap-2 border-b border-wire/20 px-4 py-2.5 font-mono text-xs text-wire">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-wire/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-wire/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-wire/40" />
          </span>
          <span className="ml-1">quality-gate.yml</span>
          <span
            ref={counterRef}
            className="gate-counter ml-auto rounded border border-wire/30 px-2 py-0.5 text-wire"
          >
            0 / {checks.length} passing
          </span>
        </div>
        <ul className="divide-y divide-wire/15">
          {checks.map((c) => (
            <li
              key={c.label}
              className="gate-row flex flex-col gap-1 px-4 py-5 sm:flex-row sm:items-baseline sm:gap-4"
            >
              <span className="flex shrink-0 items-center gap-2 font-mono text-xs sm:w-40">
                <span className="gate-glyph" aria-hidden>
                  –
                </span>
                {c.label}
              </span>
              <span className="text-sm text-mist/80">{c.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
