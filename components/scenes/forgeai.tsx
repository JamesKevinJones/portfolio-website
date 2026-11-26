import { gsap } from "@/lib/gsap";
import { EASE } from "@/lib/animation-constants";

const MONO = { fontSize: 9, letterSpacing: 1.6, className: "fill-mute font-mono" } as const;

/**
 * ForgeAI won't take the model's word for it: the model hands over a quote, the guard
 * scans the source for it and finds nothing, the quote shakes and drops into the
 * rejected tray, and a neon strike crosses it out. Final pose: the struck-out quote sits
 * in the tray and the scan line is gone. Quote home is (115,200) by centre; it starts
 * under the model at (79,110), an offset of (-36,-90), and waits beside the source at an
 * offset of (100,-100). Labels use only words from the project's blurb and refusal.
 */
export function ForgeaiScene() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true" focusable="false">
      <rect x="24" y="28" width="110" height="60" rx="10" className="fill-ink-3 stroke-bone/40" strokeWidth="1.5" />
      <text x="79" y="62" textAnchor="middle" {...MONO}>
        MODEL
      </text>

      <rect x="272" y="28" width="104" height="146" rx="8" className="fill-ink-3 stroke-bone/40" strokeWidth="1.5" />
      {[48, 66, 84, 102, 120, 138, 156].map((y, i) => (
        <rect key={y} x="286" y={y} width={[74, 60, 70, 52, 66, 58, 44][i]} height="5" rx="2.5" className="fill-bone/25" />
      ))}
      <text x="324" y="194" textAnchor="middle" {...MONO}>
        SOURCE
      </text>
      <rect className="fa-scan fill-neon" x="280" y="160" width="88" height="3" rx="1.5" opacity="0" />

      <rect x="24" y="170" width="200" height="62" rx="10" className="fill-none stroke-bone/30" strokeWidth="1.5" strokeDasharray="4 4" />
      <text x="124" y="250" textAnchor="middle" {...MONO}>
        REJECTED
      </text>

      <g className="fa-quote">
        <rect x="40" y="184" width="150" height="32" rx="7" className="fill-bone" />
        <text x="52" y="203" className="fill-ink font-mono" fontSize="8" letterSpacing="1.2">
          QUOTE
        </text>
        <rect x="92" y="197" width="40" height="6" rx="3" className="fill-ink/40" />
        <rect x="138" y="197" width="40" height="6" rx="3" className="fill-ink/40" />
      </g>
      <line className="fa-strike stroke-neon" x1="34" y1="200" x2="196" y2="200" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function playForgeai(root: HTMLElement) {
  const q = gsap.utils.selector(root);
  const quote = q(".fa-quote");
  const scan = q(".fa-scan");
  const strike = q(".fa-strike");
  return (
    gsap
      .timeline()
      // Opening pose. SVG: set transformOrigin with the scale, or the strike grows from the wrong end.
      .set(strike, { scaleX: 0, transformOrigin: "0% 50%" })
      // expo.out: the model hands the quote over fast and it settles beside the source.
      .fromTo(quote, { x: -36, y: -90, opacity: 0 }, { x: 100, y: -100, opacity: 1, duration: 0.8, ease: EASE.expo })
      // Linear scan, top to bottom of the source: it is a read, not a movement.
      .fromTo(scan, { y: -112, opacity: 1 }, { y: 0, opacity: 1, duration: 0.9, ease: "none" }, "-=0.2")
      .to(scan, { opacity: 0, duration: 0.2 })
      // No match: a short shake, then the quote drops into the tray.
      .to(quote, { x: "+=6", duration: 0.06, repeat: 3, yoyo: true, ease: "power1.inOut" })
      .to(quote, { x: 0, y: 0, duration: 0.7, ease: EASE.expo })
      .to(strike, { scaleX: 1, duration: 0.35, ease: EASE.out }, "-=0.2")
  );
}
