import { gsap } from "@/lib/gsap";
import { EASE } from "@/lib/animation-constants";

const MONO = { fontSize: 9, letterSpacing: 1.6, className: "fill-mute font-mono" } as const;

/**
 * agentshell won't run what the agent proposes: the proposal drops out of the agent and
 * lands in the input buffer, the cursor blinks, and the Enter key is nudged but never
 * pressed. The RUN pane stays empty. Final pose: the proposal sits in the buffer.
 * Proposal home is (104,180) by centre; it starts under the agent at (76,100), an offset
 * of (-28,-80). Labels use only words from the project's blurb and refusal.
 */
export function AgentshellScene() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true" focusable="false">
      <rect x="24" y="28" width="104" height="60" rx="10" className="fill-ink-3 stroke-bone/40" strokeWidth="1.5" />
      <text x="76" y="62" textAnchor="middle" {...MONO}>
        AGENT
      </text>
      <rect x="248" y="28" width="128" height="88" rx="10" className="fill-none stroke-bone/30" strokeWidth="1.5" strokeDasharray="4 4" />
      <text x="312" y="76" textAnchor="middle" {...MONO}>
        RUN
      </text>
      <rect x="24" y="152" width="352" height="56" rx="10" className="fill-ink-3 stroke-bone/40" strokeWidth="1.5" />
      <text x="200" y="232" textAnchor="middle" {...MONO}>
        INPUT BUFFER
      </text>
      <g className="as-proposal">
        <rect x="38" y="166" width="132" height="28" rx="7" className="fill-bone" />
        <rect x="48" y="177" width="22" height="6" rx="3" className="fill-ink/55" />
        <rect x="76" y="177" width="38" height="6" rx="3" className="fill-ink/40" />
        <rect x="120" y="177" width="34" height="6" rx="3" className="fill-ink/40" />
      </g>
      <rect className="as-cursor fill-neon" x="178" y="168" width="4" height="24" rx="1" />
      <g className="as-enter">
        <rect x="296" y="164" width="64" height="32" rx="7" className="fill-none stroke-bone/40" strokeDasharray="4 4" />
        <text x="328" y="184" textAnchor="middle" {...MONO}>
          ENTER
        </text>
      </g>
    </svg>
  );
}

export function playAgentshell(root: HTMLElement) {
  const q = gsap.utils.selector(root);
  const proposal = q(".as-proposal");
  const cursor = q(".as-cursor");
  const enter = q(".as-enter");
  return (
    gsap
      .timeline()
      .set(cursor, { opacity: 0 })
      // expo.out: a fast launch from the agent and a long settle into the buffer.
      .fromTo(proposal, { x: -28, y: -80, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.8, ease: EASE.expo })
      // Linear on the blink: it is a clock tick, not a movement. Ends at 1, as marked up.
      .set(cursor, { opacity: 1 })
      .to(cursor, { keyframes: { opacity: [0.1, 1, 0.1, 1] }, duration: 0.7, ease: "none" })
      // The key is nudged, never pressed: it grows and comes straight back, and nothing runs.
      .fromTo(
        enter,
        { scale: 1, transformOrigin: "50% 50%" },
        { scale: 1.1, duration: 0.22, repeat: 1, yoyo: true, ease: "power2.out" },
        "<0.15",
      )
  );
}
