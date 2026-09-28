import { gsap } from "@/lib/gsap";
import { EASE } from "@/lib/animation-constants";

const MONO = { fontSize: 9, letterSpacing: 1.6, className: "fill-mute font-mono" } as const;

/**
 * StarMatch refuses to upload your photo: there is no endpoint. The photo runs for the
 * network, hits the edge of the browser tab and springs back; the endpoint box is struck
 * out. Markup is the final pose.
 */
export function StarmatchScene() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true" focusable="false">
      <rect x="24" y="28" width="236" height="204" rx="14" className="fill-ink-3 stroke-bone/40" strokeWidth="1.5" />
      <line x1="24" y1="56" x2="260" y2="56" className="stroke-bone/20" />
      {[40, 54, 68].map((cx) => (
        <circle key={cx} cx={cx} cy="42" r="3.5" className="fill-bone/25" />
      ))}
      <text x="142" y="220" textAnchor="middle" {...MONO}>
        YOUR BROWSER TAB
      </text>
      <g className="sm-photo">
        <rect x="104" y="80" width="76" height="96" rx="8" className="fill-neon" />
        <circle cx="142" cy="116" r="15" className="fill-ink" />
        <path d="M116 168c6-20 46-20 52 0" className="fill-ink" />
      </g>
      <path d="M268 128h38" className="stroke-bone/30" strokeWidth="1.5" strokeDasharray="4 5" />
      <rect x="312" y="94" width="68" height="68" rx="10" className="fill-none stroke-bone/30" strokeWidth="1.5" strokeDasharray="4 4" />
      <text x="346" y="182" textAnchor="middle" {...MONO}>
        NO ENDPOINT
      </text>
      <path className="sm-x stroke-neon" d="M334 116l24 24M358 116l-24 24" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function playStarmatch(root: HTMLElement) {
  const q = gsap.utils.selector(root);
  const photo = q(".sm-photo");
  // The photo's right edge sits at x=180 and the tab wall at x=260: 70 units of travel
  // leaves 10 for the squash to close, so it visibly hits the wall.
  return (
    gsap
      .timeline()
      .set(q(".sm-x"), { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" })
      // power3.in: accelerates into the wall, which is what makes the impact read.
      .to(photo, { x: 70, duration: 0.55, ease: EASE.in })
      .to(photo, { scaleX: 0.86, transformOrigin: "100% 50%", duration: 0.1, ease: "power1.out" })
      // Elastic spring home: the refusal has recoil.
      .to(photo, { x: 0, scaleX: 1, duration: 1.2, ease: EASE.spring })
      // snapBack overshoots ~3% so the X lands like a stamp.
      .to(q(".sm-x"), { opacity: 1, scale: 1, duration: 0.45, ease: EASE.snapBack }, "<")
  );
}
