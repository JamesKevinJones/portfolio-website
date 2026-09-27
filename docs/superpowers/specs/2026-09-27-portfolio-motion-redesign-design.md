# Portfolio redesign: Motion Kit language, refusals you can try

**Date:** 2026-09-27 · **Requested by:** Kevin · **Repo:** JamesKevinJones/portfolio-website

## Why

Kevin's words: turn the portfolio into "something that doesn't scream AI slop and is
really creative and intuitive and interactive to use", built on his house design
language (the Motion Kit look, preview https://claude.ai/artifact/Wty5i9xBZMaqMrCmnxAXtF).

The current site already has the one thing most portfolios lack: a real argument.
Every project is introduced by what it **refuses** to do, and every refusal is quoted
from that project's own repo. What reads as generic is the presentation: a static
two-column card grid, a hero with a stat strip, four equal boxes of principles. The
redesign keeps the argument and makes the page *demonstrate* it instead of listing it.

## What "not AI slop" means here (the tests we hold every section to)

1. **Motion that says something about the content.** No effect ships just because the
   kit has it. Each interaction is a small demonstration of the thesis.
2. **The visitor gets to push.** Each project has one button that asks the system to
   do the thing it refuses. It refuses, visibly. That's the interaction people will
   remember and the reason to click.
3. **No invented copy.** Refusal lines, facts and rules come verbatim from
   `lib/projects.ts`. New UI copy is limited to button verbs and labels.
4. **No gradient-card grid, no emoji bullets, no "Hi, I'm" hero, no fake metrics.**

## Design language (from Motion Kit, unchanged)

- Palette: ink `#0a0a0b`, ink-2 `#111113`, ink-3 `#18181b`, line `#26262a`, bone
  `#ededea`, mute `#8b8b92`, neon `#c8ff2e` (primary), neon-2 `#8a6bff` (secondary).
  Dark only.
- Type: Space Grotesk (display and body, tight negative tracking, outline text via
  `-webkit-text-stroke`), JetBrains Mono for 11px uppercase labels at 0.2em tracking.
- Texture: fixed grain overlay (7%, overlay blend), 48px mesh on stage panels, soft
  radial neon glows on the page background.
- Shape: rounded-2xl/3xl panels with 1px line borders, pill buttons.
- Motion: GSAP + ScrollTrigger + SplitText + Flip, Lenis on the GSAP ticker;
  transform and opacity only; `useGSAP` + `gsap.matchMedia`; reduced motion renders
  the final state.

The neo-brutalist system (3px borders, offset shadows, five per-project accents, light
theme toggle) is retired. The hazard stripe survives, recoloured neon/ink, and keeps
its rule: it appears on the refusal band and nowhere else.

## Page, top to bottom

### Header (fixed)
Mono 11px row with `mix-blend-difference`: neon dot + "Kevin Jones" (KJ on phones),
"Chennai · 14:32 IST" live local time (desktop), nav Work / Rules / About / Contact.
A 1px neon hairline under it scrubs with page progress.

### 1. Hero — "Systems that know when to stop."
- Three rows of display type, sentence case: `Systems` / `that know` (outline,
  indented) / `when to` **`stop.`** (neon). Characters rise in through masks on load.
- Behind it, the Motion Kit particle field. It already repels the pointer.
- **The thesis as motion:** the hero pins briefly. As you scroll, every row slides
  sideways and fades, except the word "stop." — it stays exactly where it is.
- **Hover "stop." and the particle field freezes.** A mono hint on pointer devices
  says "hover stop." Nothing else on the page is labelled like a tutorial.
- Meta row: one-line intro (existing hero copy), magnetic "See what they refuse" button,
  mono facts line "6 projects · 5 deployed · graduating 2027".

### 2. Refusal ticker
Velocity marquee of the six refusal headlines, verbatim ("It won't upload your
photo." ...), alternating solid and outline, speed and skew follow scroll velocity.

### 3. Work — pinned walkthrough, one project per screen
- Desktop (≥1024 wide and ≥700 tall, motion allowed): the section pins and vertical
  scroll drives a horizontal track of six panels, with a rolling 01–06 counter and
  progress rail.
- Every other viewport, and reduced motion: a vertical list of the same panels.
- Each panel: index and domain, project name, blurb, the **refusal band** (hazard
  stripe, "Refuses" label, headline, detail), facts, stack, Live/Source links, and a
  **stage**: a small SVG scene that acts out the refusal.
- The scene plays once when the panel arrives. Under it, a pill button asks the system
  to do the forbidden thing. Pressing it replays the scene and the button shakes "no".
  A status line reads "Refused. It won't upload your photo." and counts repeat
  attempts ("Refused ×3."). The status is an `aria-live` region.

| Project | Button | Scene |
| --- | --- | --- |
| StarMatch | Upload my photo | Photo runs for the network, hits the edge of the browser tab, springs back. "No endpoint" box gets an X. |
| Frontier Platform | Answer anyway | Three meters (terms, rerank, grounding) fill; grounding stops below its floor; chip "Missed: grounding". |
| Job Autopilot | Submit it for me | Application card slides toward Submit, a neon gate drops, card drops into the human review queue. |
| CodeAuto | Run the workflow | A run signal leaves Start, reaches the gap before End and dies; margin issue "1 · node is not connected"; End node shakes and gets selected. |
| JobMatch RAG | Show every listing | Five listings with ages; the 49h and 73h rows drop out, the rest close ranks; "pruned · older than 48h". |
| MemoryVault AI | Save the scrollback | Chat bubbles scroll up and fade; fact, preference and project chips fly into the vault and stay. |

Scene labels only use words already in that project's blurb or refusal detail.

### 4. Rules — Flip accordion
"Four rules that cost something to learn." Four large rule lines (R/01–R/04). Clicking
one opens its story and source file; the rows below glide down (GSAP Flip, translate
only). The first is open by default.

### 5. About
Existing copy. The portrait is a masked curtain reveal on scroll. Hover (or tap) the
portrait to swap the formal headshot for the mural portrait, which is in the repo but
unused today. Expo photo below it. The stack list reads as mono rows.

### 6. Contact (footer)
"Open to internships and graduate roles." in masked kinetic lines. A magnetic pill copies
the email to the clipboard, and its label rolls to "Copied". Ghost magnetic buttons go to
GitHub and LinkedIn. The bottom row holds the name, Chennai time, "Built with Next.js,
GSAP and Lenis" and a link back to the top.

## Non-negotiables carried over from AGENTS.md
- Refusal lines are quotable from source repos; facts are measured; copy lives in
  `lib/projects.ts` and `lib/site.ts`.
- Markup is the final state; GSAP animates *from* hidden. A failed bundle leaves a
  readable page.
- ScrollTrigger refreshes after fonts load.
- The Vercel URL does not change. Work lands through a PR; merging to `main` deploys.
- `npm run lint` and `npm run build` pass. Playwright end-to-end tests are added
  (the repo had no runner) and cover the checks `docs/VERIFY.md` asked for by hand.

## Out of scope
New projects, new copy beyond button verbs, a blog, CMS, analytics, WebGL/Three.js
(canvas 2D is enough here and keeps the bundle small).
