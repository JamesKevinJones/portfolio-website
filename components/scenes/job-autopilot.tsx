import { gsap } from "@/lib/gsap";
import { EASE } from "@/lib/animation-constants";

const MONO = { fontSize: 9, letterSpacing: 1.6, className: "fill-mute font-mono" } as const;

/**
 * Job Autopilot won't submit: the application heads for Submit, a gate drops, and it
 * lands in the human review queue instead. Final pose: card in the queue.
 * Card home is (168,180); on the track it sits at (30,66), an offset of (-138,-114).
 */
export function JobAutopilotScene() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true" focusable="false">
      <line x1="24" y1="86" x2="376" y2="86" className="stroke-bone/20" strokeWidth="1.5" />
      <rect x="300" y="66" width="76" height="40" rx="8" className="fill-none stroke-bone/40" strokeDasharray="4 4" />
      <text x="338" y="90" textAnchor="middle" {...MONO}>
        SUBMIT
      </text>
      <g className="ja-gate">
        <rect x="278" y="46" width="10" height="80" rx="3" className="fill-neon" />
      </g>
      <rect x="150" y="168" width="226" height="64" rx="10" className="fill-ink-3 stroke-bone/30" />
      <text x="263" y="252" textAnchor="middle" {...MONO}>
        HUMAN REVIEW QUEUE
      </text>
      {[242, 306].map((x) => (
        <rect key={x} x={x} y="180" width="56" height="40" rx="6" className="fill-bone/15" />
      ))}
      <g className="ja-card">
        <rect x="168" y="180" width="64" height="40" rx="6" className="fill-bone" />
        <rect x="176" y="190" width="36" height="4" rx="2" className="fill-ink/60" />
        <rect x="176" y="199" width="46" height="4" rx="2" className="fill-ink/35" />
        <rect x="176" y="208" width="28" height="4" rx="2" className="fill-ink/35" />
      </g>
    </svg>
  );
}

export function playJobAutopilot(root: HTMLElement) {
  const q = gsap.utils.selector(root);
  const card = q(".ja-card");
  const gate = q(".ja-gate");
  return (
    gsap
      .timeline()
      .set(gate, { y: -60, opacity: 0 })
      // power2.inOut: the card sets off and slows on approach, as if it saw the gate.
      // x 38 puts its right edge at 270, just short of the gate at 278.
      .fromTo(card, { x: -138, y: -114 }, { x: 38, duration: 0.9, ease: "power2.inOut" })
      // The gate drops mid-approach; snapBack overshoot makes it slam.
      .to(gate, { y: 0, opacity: 1, duration: 0.35, ease: EASE.snapBack }, 0.4)
      // expo.out into the queue: a decisive re-route, not a drift.
      .to(card, { x: 0, y: 0, duration: 0.7, ease: EASE.expo }, "+=0.15")
  );
}
