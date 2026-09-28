import { gsap } from "@/lib/gsap";
import { EASE } from "@/lib/animation-constants";

const MONO = { fontSize: 9, letterSpacing: 1.6, className: "fill-mute font-mono" } as const;
const TOP = 44;
const H = 150;
const W = 56;

/**
 * Illustrative levels only; no numbers are printed. Labels are the three floors named in
 * the refusal detail: term coverage, reranker score, grounding score.
 */
const METERS = [
  { x: 64, label: "TERMS", fill: 0.78, floor: 0.5 },
  { x: 172, label: "RERANK", fill: 0.66, floor: 0.42 },
  { x: 280, label: "GROUNDING", fill: 0.32, floor: 0.56 },
];

/** Frontier won't answer on weak evidence: three floors, one missed, and it says which. */
export function FrontierScene() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true" focusable="false">
      {METERS.map((m) => {
        const fh = m.fill * H;
        const floorY = TOP + H - m.floor * H;
        const missed = m.fill < m.floor;
        return (
          <g key={m.label}>
            <rect x={m.x} y={TOP} width={W} height={H} rx="6" className="fill-ink-3 stroke-bone/20" />
            <rect
              className={`fr-fill ${missed ? "fill-bone/35" : "fill-neon"}`}
              x={m.x}
              y={TOP + H - fh}
              width={W}
              height={fh}
              rx="6"
            />
            <line
              x1={m.x - 8}
              x2={m.x + W + 8}
              y1={floorY}
              y2={floorY}
              className="stroke-neon-2"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
            <text x={m.x + W / 2} y={TOP + H + 22} textAnchor="middle" {...MONO}>
              {m.label}
            </text>
          </g>
        );
      })}
      <g className="fr-verdict">
        <rect x="226" y="8" width="164" height="24" rx="12" className="fill-neon" />
        <text x="308" y="24" textAnchor="middle" fontSize="9" letterSpacing="1.4" className="fill-ink font-mono">
          MISSED: GROUNDING
        </text>
      </g>
    </svg>
  );
}

export function playFrontier(root: HTMLElement) {
  const q = gsap.utils.selector(root);
  return (
    gsap
      .timeline()
      .set(q(".fr-verdict"), { opacity: 0, y: 8 })
      // expo.out: levels shoot up and settle, like a reading stabilising. Staggered so
      // the eye checks each floor in turn and reaches grounding last.
      // The origin goes in the from vars: set only on the "to" side, GSAP's SVG smoothOrigin
      // kept the fills pinned at the top, so they grew downward until the last frame.
      .fromTo(
        q(".fr-fill"),
        { scaleY: 0, transformOrigin: "50% 100%" },
        { scaleY: 1, duration: 0.9, ease: EASE.expo, stagger: 0.18 },
      )
      .to(q(".fr-verdict"), { opacity: 1, y: 0, duration: 0.4, ease: EASE.out }, "-=0.2")
  );
}
