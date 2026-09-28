import { gsap } from "@/lib/gsap";
import { EASE } from "@/lib/animation-constants";

const MONO = { fontSize: 9, letterSpacing: 1.6, className: "fill-mute font-mono" } as const;

const BUBBLES = [
  { x: 20, y: 40, w: 150 },
  { x: 60, y: 76, w: 130 },
  { x: 20, y: 112, w: 120 },
  { x: 50, y: 148, w: 150 },
  { x: 20, y: 184, w: 100 },
];

/** Chips use the three kinds of memory named in the blurb. */
const FACTS = [
  { y: 74, label: "FACT" },
  { y: 118, label: "PREFERENCE" },
  { y: 162, label: "PROJECT" },
];

/**
 * MemoryVault won't call the scrollback buffer memory: the chat scrolls away and fades,
 * and what survives is distilled into the vault. Final pose: faded chat, full vault.
 */
export function MemoryvaultScene() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true" focusable="false">
      {BUBBLES.map((b) => (
        <rect key={b.y} className="mv-bubble fill-bone/25" x={b.x} y={b.y} width={b.w} height="24" rx="12" opacity="0.14" />
      ))}
      <text x="110" y="236" textAnchor="middle" {...MONO}>
        SCROLLBACK
      </text>
      <rect x="232" y="40" width="150" height="180" rx="14" className="fill-ink-3 stroke-neon" strokeWidth="1.5" />
      <text x="307" y="60" textAnchor="middle" {...MONO} className="fill-neon font-mono">
        VAULT
      </text>
      {FACTS.map((f) => (
        <g key={f.label} className="mv-fact">
          <rect x="248" y={f.y} width="118" height="30" rx="8" className="fill-neon" />
          <text x="307" y={f.y + 19} textAnchor="middle" fontSize="9" letterSpacing="1.4" className="fill-ink font-mono">
            {f.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function playMemoryvault(root: HTMLElement) {
  const q = gsap.utils.selector(root);
  return (
    gsap
      .timeline()
      // power3.in: the conversation slides up and out like a buffer being discarded.
      .fromTo(
        q(".mv-bubble"),
        { opacity: 1, y: 0 },
        { opacity: 0.14, y: -14, duration: 0.5, ease: EASE.in, stagger: 0.08 },
        0.6,
      )
      // snapBack: each distilled fact lands in the vault with a small overshoot, so it
      // reads as kept.
      .fromTo(
        q(".mv-fact"),
        // Origin on the from side too, or SVG smoothOrigin offsets the chips as they scale.
        { x: -150, opacity: 0, scale: 0.7, transformOrigin: "50% 50%" },
        { x: 0, opacity: 1, scale: 1, duration: 0.7, ease: EASE.snapBack, stagger: 0.14 },
        0.4,
      )
  );
}
