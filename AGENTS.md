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

Neo-brutalism, carried over from StarMatch so the two sites read as one hand:
3px ink borders, hard offset shadows, no blur and no gradients on UI chrome.
`.brut` is the single primitive everything is built from.

Tokens live in `app/globals.css` under `@theme` — there is **no
`tailwind.config.ts`**, this is native Tailwind v4. Surfaces are paper/ink;
accents are acid, volt, coral, mint, orchid, used flat and one per project.

Type: Archivo (display, 900) · Space Grotesk (body) · IBM Plex Mono (labels).

### Contrast rules that are already load-bearing

- **Only volt carries white text** (4.93:1). Coral looks like it should and
  does not — white on coral is 3.05:1 and fails AA; ink on coral is 6.46:1.
  `ACCENT_FG` in `lib/projects.ts` encodes this; measure before changing it.
- **`@custom-variant dark (&:is(.dark *));` at the top of `globals.css` is
  required.** Without it the `dark:` utilities follow the OS setting while the
  toggle moves `.dark`, and on an OS set to dark the light theme renders
  paper-on-paper at 1.14:1 — invisible text.

## Theme

Lives in the DOM, not React state. An inline script in `app/layout.tsx` sets
`data-theme` and `.dark` before first paint; the header button mutates them
directly and CSS swaps the icon. `suppressHydrationWarning` on `<html>` is
deliberate — the script makes client markup differ from the server's on purpose.

## Motion

Lenis (scroll, on the GSAP ticker) · GSAP ScrollTrigger (scroll-linked reveals).
Both branches sit inside `gsap.matchMedia`, so reduced-motion users register no
triggers at all.

Timelines use `gsap.from()`, never `gsap.to()` from a hidden state: the markup
is visible by default, so a bundle error leaves a readable page rather than a
blank one.

`ScrollTrigger` measures before web fonts land. `document.fonts.ready` triggers
a refresh — scoped inside the component effect, because at module scope it
fires before the triggers exist and leaves them broken.

## Layout

```
app/globals.css     tokens, .brut, .hazard, reduced-motion
app/layout.tsx      fonts, metadata, theme script, skip link, JSON-LD
lib/projects.ts     the six projects + the four principles — all page content
lib/site.ts         canonical URL and profile links
components/         hero · work · approach · about · site-header · site-footer
                    smooth-scroll (Lenis+GSAP) · brand-icons (inline SVG)
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

See `docs/VERIFY.md`. `npm run build` is the real gate; there is no test runner.
Contrast changes must be measured in the browser, in both themes, not eyeballed.
