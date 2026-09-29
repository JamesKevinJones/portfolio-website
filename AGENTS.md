<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Portfolio — agent context

Kevin Jones's personal site. Next.js 16 + React 19 + Tailwind v4, static, on
Vercel. One page: hero, work, approach, about, footer.

## The thesis, and why it constrains edits

The site's argument is that **the interesting decision in a system is what it
refuses to do**. Every project is introduced by its constraint, not its feature
list.

- **Never write a `refuses` line that isn't in the source repo.** Each one is
  quoted from that project's own README or AGENTS.md. If it can't be pointed
  at, it doesn't go on the page. This is the whole credibility of the design.
- **Hazard striping appears on the refusal band and nowhere else.** The moment
  it becomes texture, it stops reading as a warning label.
- **Numbers must be measured.** `facts` entries carry real values (99 tests,
  1,341 postings, ≥70% top-1). No invented precision.

## Design system

Kevin's house style, the Motion Kit look (preview
https://claude.ai/artifact/Wty5i9xBZMaqMrCmnxAXtF): monochrome ink, one neon accent,
grain and mesh for depth. Dark only.

Tokens live in `app/globals.css` under `@theme` (native Tailwind v4, no
`tailwind.config.ts`): ink `#0a0a0b`, ink-2 `#111113`, ink-3 `#18181b`, line
`#26262a`, bone `#ededea`, mute `#8b8b92`, neon `#c8ff2e`, neon-2 `#8a6bff`.

Type: Space Grotesk (display and body) · JetBrains Mono (`.label`, 11px, 0.2em).

The hazard stripe (`.hazard`, neon on ink) is on the refusal band and nowhere else.

## Motion

Import GSAP from `@/lib/gsap` (plugins and custom eases registered once) and timing
from `@/lib/animation-constants` (`EASE`, `DURATION`, `STAGGER`, `SCROLL`, `MQ`).
Lenis lives in `components/lenis-provider.tsx`, on the GSAP ticker; `useLenis()` returns
it, or null under reduced motion.

- Every component wraps GSAP in `useGSAP` + `gsap.matchMedia`; reduced motion registers
  no triggers and renders the final state.
- Markup is the final state; animate with `from`/`fromTo`. A bundle error leaves a
  readable page.
- Transform and opacity only. `ease: "none"` (`EASE.scrub`) only on scrubbed timelines.
- Never put `will-change: transform` on an ancestor of a pinned element; it breaks
  pinning.
- `MQ.walkthrough` in `lib/animation-constants.ts` and the `walk` custom variant in
  `app/globals.css` describe the same media query. Change both or neither.
- Deep links: the browser jumps to `/#about` before the walkthrough pin inserts its
  spacer, so `lenis-provider.tsx` lands on the hash once more after the first
  `ScrollTrigger.refresh()`. Keep that if you touch the provider.
- Borrowed from cred.club (see `docs/DECISIONS.md`): `ui/ink-reveal` (about copy),
  `ui/pointer-lens` (portrait), `ui/contact-chip` (floating copy-email pill, shares
  `lib/use-copy-email.ts` with the footer) and `.rule-fade` hairlines. Same rules as
  everything else: transform and opacity only, readable resting state.

## Refusal scenes

`components/scenes/<project>.tsx` each export an `aria-hidden` SVG drawn in its final
refused pose and a `play(root)` timeline that starts with `set`/`fromTo` for its
initial pose. `components/scenes/index.ts` maps `SceneKey` to both; `runScene()` kills a
running timeline before replaying, so the Try button can be mashed safely. Scene labels
use only words from that project's blurb or refusal detail.

## Layout

```
app/globals.css           tokens, walk variant, grain/mesh/hazard, reduced motion
app/layout.tsx            fonts, metadata, grain overlay, LenisProvider, skip link, JSON-LD
lib/projects.ts           six projects (+ attempt verbs), four principles, STACK
lib/site.ts               canonical URL and profile links
lib/gsap.ts               plugin registration · lib/animation-constants.ts timing
lib/use-copy-email.ts     clipboard hook shared by the footer and the contact chip
components/ui/            magnetic-button · section-heading · particle-field ·
                          velocity-marquee · local-time · contact-chip ·
                          ink-reveal · pointer-lens
components/scenes/        one refusal scene per project + registry
components/               hero · work · project-panel · approach · about ·
                          site-header · site-footer · lenis-provider · brand-icons
tests/e2e/                Playwright specs
```

`lib/projects.ts` is the content layer. Edit copy there, not in the components.

`brand-icons.tsx` exists because lucide-react v1 dropped its brand icons —
don't reintroduce `import { Github } from "lucide-react"`, it doesn't exist.

## Deploying

Pushing to `main` on `JamesKevinJones/portfolio-website` redeploys the existing
Vercel project. **Keep that link:** creating a new Vercel project would change
the URL, which is printed on the resume and in every repo README.

Deploying is not pushing — after a push, fetch the live URL and confirm the
change is in the response.

## Verifying

See `docs/VERIFY.md`. `npm run lint`, `npm run build` and `npm run test:e2e:prod`
must all pass. The Playwright suite covers contrast, 375px overflow, reduced motion,
no-JS and keyboard focus inside the pinned walkthrough. It also measures the header's
composited pixels over the portrait, because the header has no bar and CSS colours alone
cannot see what is behind it. Do not reintroduce `mix-blend-difference` on the header
row: inside a fixed element it blends against nothing.
