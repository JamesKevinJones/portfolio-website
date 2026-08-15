<div align="center">

# Portfolio — Kevin Jones

### Most portfolios list what the work does. This one leads with what it won't.

A personal site built around one argument: the interesting decision in a system
is the constraint, not the feature. Six projects, each introduced by the thing
it refuses to do.

**[→ Open the live site](https://portfolio-website-eight-kappa-iwtiz3w2ef.vercel.app)**

![Next.js](https://img.shields.io/badge/next.js-16-1B2632?labelColor=0B1016)
![TypeScript](https://img.shields.io/badge/typescript-5-1B2632?labelColor=0B1016)
![Tailwind](https://img.shields.io/badge/tailwind-v4-1B2632?labelColor=0B1016)
![GSAP](https://img.shields.io/badge/gsap-ScrollTrigger-3FD0C9?labelColor=0B1016)
![License](https://img.shields.io/badge/license-MIT-1B2632?labelColor=0B1016)

</div>

---

## The idea

Every developer portfolio reaches for the same three moves: a gradient hero, a
grid of cards, a terminal-green accent. None of them say anything about the
person.

Reading back through my own repos, the same shape kept appearing. Frontier
Platform refuses to answer when its evidence floors aren't met. StarMatch has no
upload endpoint, so the privacy claim is architectural rather than promised. Job
Autopilot deliberately stops short of submitting anything. CodeAuto won't run a
workflow that fails validation.

In each case the constraint was the part that took the thinking. So the site is
organised around it: every project card leads with a hazard-striped **Refuses**
band stating what that system will not do, and the feature list comes after.

**Every refusal on the page is quoted from that project's own README or agent
context.** If a constraint can't be pointed at in the source repo, it doesn't go
on the site — which is the only reason the claim is worth anything.

## Featured

| Project | Refuses |
| --- | --- |
| [StarMatch](https://github.com/JamesKevinJones/starmatch) | to upload your photo — no endpoint exists |
| [Frontier Platform](https://github.com/JamesKevinJones/frontier-platform) | to answer when the evidence is weak |
| [Job Autopilot](https://github.com/JamesKevinJones/job-autopilot) | to submit the application |
| [CodeAuto](https://github.com/JamesKevinJones/CodeAut0) | to run a workflow that doesn't check out |
| [JobMatch RAG](https://github.com/JamesKevinJones/job-rag) | to serve a stale listing |
| [MemoryVault AI](https://github.com/JamesKevinJones/Memoryvault-ai) | to call the scrollback buffer memory |

## Design system

Neo-brutalism, shared with [StarMatch](https://github.com/JamesKevinJones/starmatch)
so the two sites read as one hand: 3px ink borders, hard offset shadows, no blur
and no gradients on any UI chrome. `.brut` is the single primitive the whole
interface is built from.

| Token | Value | Role |
| --- | --- | --- |
| `paper` / `ink` | `#f4f1ea` / `#0b0b0b` | Surfaces, inverted in dark mode |
| `acid` | `#ddf247` | Highlight, hazard stripe |
| `volt` | `#4d5bff` | Primary action, focus ring |
| `coral` | `#ff5c4d` | Secondary action |
| `mint` · `orchid` | `#4ee6a8` · `#d78dff` | Per-project accents |

One accent per project, so the grid is scannable by hue before a word is read.
Hazard striping is used on the refusal band and nowhere else — the moment it
becomes texture it stops reading as a warning label.

**Type:** Archivo (display, 900) · Space Grotesk (body) · IBM Plex Mono (labels
and data).

## Two bugs worth writing down

Both were invisible in code review and obvious the moment contrast was actually
measured in the browser.

**White on coral fails AA.** Coral (`#ff5c4d`) reads as a dark accent and looks
like it should carry white text. It measures **3.05:1** — below the 4.5 floor.
Ink on the same colour is 6.46:1. Only volt is genuinely dark enough for white
(4.93:1). `ACCENT_FG` in `lib/projects.ts` now encodes the measured pairing
rather than the intuitive one.

**The theme toggle and the `dark:` variant disagreed.** Tailwind v4's `dark:`
variant defaults to `prefers-color-scheme`, but the toggle moves a `.dark`
class. On a machine set to dark, switching the site to light left
`dark:text-paper-dim` applied over the light paper background — **1.14:1**,
text effectively invisible. The fix is one line, and it has to be there:

```css
@custom-variant dark (&:is(.dark *));
```

## Motion

Lenis for scroll, driven by the GSAP ticker rather than its own rAF loop — two
loops on different clocks disagree by a frame, which shows up as jitter.
ScrollTrigger handles the scroll-linked reveals.

Both sit inside `gsap.matchMedia`, so `prefers-reduced-motion` users register no
triggers at all. Timelines use `gsap.from()` rather than animating out of a
hidden state, so a bundle error leaves a readable page instead of a blank one.

## Running it

```bash
npm install
npm run dev
```

```bash
npm run build
```

## Structure

```
app/globals.css     design tokens, .brut primitive, reduced-motion
app/layout.tsx      fonts, metadata, pre-paint theme script, skip link
lib/projects.ts     the six projects and four principles — all page content
components/         hero · work · approach · about · header · footer
```

Copy lives in `lib/projects.ts`, not in the components.

## Contact

[LinkedIn](https://www.linkedin.com/in/jameskevinjones/) ·
[GitHub](https://github.com/JamesKevinJones) ·
[Email](mailto:kj6384647@gmail.com)

## License

MIT — see [LICENSE](LICENSE). The code is free to learn from; the photographs
and written content are not.
