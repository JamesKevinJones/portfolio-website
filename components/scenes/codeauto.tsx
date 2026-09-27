import { gsap } from "@/lib/gsap";
import { EASE } from "@/lib/animation-constants";

const MONO = { fontSize: 9, letterSpacing: 1.6, className: "fill-mute font-mono" } as const;

function Node({ x, y, label, className = "" }: { x: number; y: number; label: string; className?: string }) {
  return (
    <g className={className}>
      <rect x={x} y={y} width="84" height="40" rx="8" className="fill-ink-3 stroke-bone/50" strokeWidth="1.5" />
      <text x={x + 42} y={y + 24} textAnchor="middle" {...MONO} className="fill-bone font-mono">
        {label}
      </text>
    </g>
  );
}

/**
 * CodeAuto won't run a workflow that doesn't check out. A run signal leaves Start, dies
 * at the gap before End, the margin numbers the issue and the offending node is selected.
 * Final pose: issue visible, End selected, signal gone.
 */
export function CodeautoScene() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true" focusable="false">
      <Node x={30} y={60} label="START" />
      <Node x={158} y={60} label="TASK" />
      <line x1="114" y1="80" x2="158" y2="80" className="stroke-bone/60" strokeWidth="1.5" />
      <path d="M242 80h24v70" className="fill-none stroke-bone/30" strokeWidth="1.5" strokeDasharray="4 5" />
      <g className="ca-end">
        <rect className="ca-select stroke-neon" x="284" y="170" width="96" height="52" rx="11" fill="none" strokeWidth="2" />
        <Node x={290} y={176} label="END" />
      </g>
      <circle className="ca-pulse fill-neon" cx="114" cy="80" r="5" opacity="0" />
      <g className="ca-issue">
        <rect x="18" y="170" width="236" height="52" rx="10" className="fill-ink-3 stroke-line" />
        <circle cx="40" cy="196" r="10" className="fill-neon" />
        <text x="40" y="199.5" textAnchor="middle" fontSize="10" className="fill-ink font-mono">
          1
        </text>
        <text x="58" y="199" {...MONO} className="fill-bone font-mono">
          NODE IS NOT CONNECTED
        </text>
      </g>
    </svg>
  );
}

export function playCodeauto(root: HTMLElement) {
  const q = gsap.utils.selector(root);
  const pulse = q(".ca-pulse");
  return (
    gsap
      .timeline()
      .set(pulse, { x: 0, y: 0, scale: 1, opacity: 1, transformOrigin: "50% 50%" })
      .set(q(".ca-issue"), { opacity: 0, x: -10 })
      .set(q(".ca-select"), { opacity: 0 })
      // power1.inOut on each leg: a signal travelling a wire, steady with soft corners.
      .to(pulse, { x: 44, duration: 0.3, ease: "power1.inOut" })
      .to(pulse, { x: 152, duration: 0.45, ease: "power1.inOut" })
      .to(pulse, { y: 70, duration: 0.3, ease: "power1.inOut" })
      // The signal hits the gap and dissipates.
      .to(pulse, { opacity: 0, scale: 2.4, duration: 0.3, ease: EASE.out })
      .to(q(".ca-issue"), { opacity: 1, x: 0, duration: 0.4, ease: EASE.out })
      .to(q(".ca-end"), { keyframes: { x: [0, -6, 6, -4, 3, 0] }, duration: 0.45, ease: "power1.out" }, "<")
      .to(q(".ca-select"), { opacity: 1, duration: 0.25, ease: EASE.out }, "<0.2")
  );
}
