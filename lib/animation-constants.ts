/**
 * animation-constants.ts
 * Single source of truth for motion timing. Pure data (no GSAP import) so it can be
 * shared by GSAP code, CSS transitions and tailwind.config.ts alike.
 */

/** Cubic-bezier control points [x1, y1, x2, y2]. */
export type Bezier = readonly [number, number, number, number];

/**
 * Custom curves, registered with GSAP's CustomEase in lib/gsap.ts under the same keys
 * and exposed to Tailwind as `ease-<key>` for CSS transitions.
 */
export const BEZIER = {
  /** Expo-like out: very fast launch, long feathered settle. Hero reveals, large moves. */
  expoOut: [0.16, 1, 0.3, 1],
  /** Softer quart out. Default UI entrances where expo feels too aggressive. */
  quartOut: [0.25, 1, 0.5, 1],
  /** Gentle in-out for crossfades that start and end at rest (modal, page swap). */
  smooth: [0.65, 0, 0.35, 1],
  /** Overshoots ~3% before settling. Magnetic releases, toggles, playful pops. */
  snapBack: [0.34, 1.56, 0.64, 1],
} as const satisfies Record<string, Bezier>;

export type BezierName = keyof typeof BEZIER;

/** `cubic-bezier(...)` string for CSS / Tailwind / Web Animations. */
export const toCssBezier = ([x1, y1, x2, y2]: Bezier) => `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;

/**
 * GSAP ease names. Use these instead of string literals so every component shares the
 * same vocabulary. Custom keys resolve once lib/gsap.ts has registered them.
 */
export const EASE = {
  /** Default entrance: power3.out decelerates hard enough to feel premium but not sluggish. */
  out: "power3.out",
  /** Heavier landing for display type and big blocks. */
  outStrong: "power4.out",
  /** Maximum snap: covers ~90% of the distance in the first third of the duration. */
  expo: "expo.out",
  /** Exits accelerate away; pair with a short duration. */
  in: "power3.in",
  /** Custom curves (see BEZIER). */
  expoOut: "expoOut",
  quartOut: "quartOut",
  smooth: "smooth",
  snapBack: "snapBack",
  /** Elastic spring for pointer release (amplitude 1, period 0.4). */
  spring: "elastic.out(1, 0.4)",
  /** Scrubbed timelines only: the scroll position is already the easing. */
  scrub: "none",
} as const;

/** Durations in seconds (GSAP). Multiply by 1000 for CSS/ms. */
export const DURATION = {
  instant: 0.15,
  fast: 0.35,
  base: 0.6,
  slow: 0.9,
  hero: 1.2,
  /** Pointer followers (quickTo). Low so the element tracks without lag. */
  follow: 0.45,
} as const;

/** Stagger intervals in seconds. */
export const STAGGER = {
  /** Per character: fast enough that a 12-char word lands in ~0.3s. */
  chars: 0.025,
  words: 0.06,
  lines: 0.1,
  /** Cards and grid items. */
  items: 0.08,
} as const;

/** Shared distances for reveals, in yPercent or px as named. */
export const DISTANCE = {
  /** Masked line/char reveals start fully below their mask. */
  maskYPercent: 110,
  /** Unmasked fade-ups travel a short distance so they read as settle, not slide. */
  fadeUpPx: 40,
} as const;

/**
 * ScrollTrigger presets. start/end read as "<element edge> <viewport edge>".
 */
export const SCROLL = {
  /** Fire when the element's top passes 85% down the viewport: just visible, not at the fold. */
  reveal: { start: "top 85%", toggleActions: "play none none reverse" },
  /** Scrub smoothing in seconds; 1 = playhead takes 1s to catch up (with Lenis, keep it low). */
  scrub: 0.8,
} as const;

/** Media queries for gsap.matchMedia(). Every animated component branches on these. */
export const MQ = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 768px)",
  mobile: "(max-width: 767px)",
  finePointer: "(hover: hover) and (pointer: fine)",
  /**
   * Horizontal pinned walkthrough: wide AND tall enough that one project panel fits a
   * screen. Must match the `walk` custom variant in app/globals.css exactly.
   */
  walkthrough: "(min-width: 1024px) and (min-height: 760px)",
  /** Everything the walkthrough query excludes. `not all and` negates the whole query. */
  stacked: "not all and (min-width: 1024px) and (min-height: 760px)",
} as const;

/** Lenis defaults. lerp 0.1 = each frame closes 10% of the gap to the target. */
export const LENIS = {
  lerp: 0.1,
  wheelMultiplier: 1,
  touchMultiplier: 1.2,
} as const;
