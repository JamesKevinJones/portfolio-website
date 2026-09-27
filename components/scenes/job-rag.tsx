import { gsap } from "@/lib/gsap";
import { EASE } from "@/lib/animation-constants";

const MONO = { fontSize: 9, letterSpacing: 1.6, className: "fill-mute font-mono" } as const;
const ROW = 42;
const TOP = 18;

/**
 * `from` is the row's slot before pruning, `to` after. Stale rows are drawn in their
 * original slot at opacity 0; fresh rows are drawn in their final slot and carry the
 * distance they close up as `data-shift`. Ages are illustrative, placed either side of
 * the documented 48-hour cut.
 */
const LISTINGS = [
  { age: "2H", stale: false, from: 0, to: 0 },
  { age: "11H", stale: false, from: 1, to: 1 },
  { age: "49H", stale: true, from: 2, to: 2 },
  { age: "20H", stale: false, from: 3, to: 2 },
  { age: "73H", stale: true, from: 4, to: 4 },
];

/** JobMatch RAG won't serve a stale listing: anything past 48 hours drops out of the index. */
export function JobRagScene() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true" focusable="false">
      {LISTINGS.map((l) => (
        // Outer <g> owns the slot; GSAP animates only the inner <g>, which has no
        // transform attribute for it to overwrite.
        <g key={l.age} transform={`translate(0 ${TOP + (l.stale ? l.from : l.to) * ROW})`}>
          <g
            className={l.stale ? "jr-stale" : l.from !== l.to ? "jr-shift" : undefined}
            data-shift={(l.from - l.to) * ROW}
            opacity={l.stale ? 0 : 1}
          >
            <rect x="40" y="0" width="320" height="34" rx="8" className="fill-ink-3 stroke-line" />
            <rect x="54" y="10" width="120" height="5" rx="2.5" className="fill-bone/60" />
            <rect x="54" y="20" width="80" height="4" rx="2" className="fill-bone/25" />
            <text x="344" y="21" textAnchor="end" {...MONO} className={`font-mono ${l.stale ? "fill-neon" : "fill-mute"}`}>
              {l.age}
            </text>
          </g>
        </g>
      ))}
      <text x="200" y="248" textAnchor="middle" {...MONO} className="jr-note fill-mute font-mono">
        PRUNED ON INGEST · OLDER THAN 48 HOURS
      </text>
    </svg>
  );
}

export function playJobRag(root: HTMLElement) {
  const q = gsap.utils.selector(root);
  return (
    gsap
      .timeline()
      .set(q(".jr-note"), { opacity: 0 })
      // fromTo renders its from-state immediately, so at t=0 the full list is showing.
      // power3.in: stale rows fall away with gravity.
      .fromTo(
        q(".jr-stale"),
        { opacity: 1, y: 0 },
        { opacity: 0, y: 18, duration: 0.45, ease: EASE.in, stagger: 0.12 },
        0.5,
      )
      // expo.out: the survivors close ranks quickly and settle.
      .fromTo(
        q(".jr-shift"),
        { y: (_i: number, el: SVGGElement) => Number(el.dataset.shift) },
        { y: 0, duration: 0.6, ease: EASE.expo },
      )
      .to(q(".jr-note"), { opacity: 1, duration: 0.3, ease: EASE.out }, "<")
  );
}
