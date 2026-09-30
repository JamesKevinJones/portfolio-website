# Project State

**Last updated:** 2026-09-29 by claude-code

## Where things stand

Seven projects, on branch `feature/agentshell-project` (not yet merged): agentshell is
the seventh panel, appended last so no existing panel index shifts. Its refusal is "It
won't run what the agent proposes", quoted from agentshell's AGENTS.md ("nothing in the
codebase executes agent output"; `readonly` is a safety boundary). The blurb and refusal
deliberately say nothing about learning quota from a real refusal, because no real
refusal has ever been observed from the agent CLIs; only the mechanics are proven,
against fakes. Facts are measured: 113 tests (run 2026-09-29), 5 backends in
`DEFAULT_CHAIN`, 1 dependency in `pyproject.toml`. The Motion Kit look has no per-project
accents, so a seventh project needed no palette decision.

Shipped before that, on `main` at `331a135`: an audit pass that found one real defect.
The fixed header's labels measured 1.1:1 composited over the About portrait, because the
`mix-blend-difference` meant to keep them legible had never worked (a fixed header is its
own stacking context). Fixed with a feathered `.header-scrim`, plus a composited-pixel
regression test that fails without it (1.1 and 1.17 received) and passes with it. A dead
`--ease-snap-back` CSS token was removed, and `turbopack.root` is pinned so a stray
parent lockfile stops being inferred as the workspace root. Live and confirmed: the
deployed HTML carries `header-scrim` and no `mix-blend-difference`.

Everything else in the audit was clean: one `h1`, no heading skips, every landmark, no
unnamed controls, no sub-24px target without spacing exemption, no overflow at 375.
The detector's `.mesh` grid finding was left alone on purpose: mesh is in the house
style. Untouched: the header nav links are 17px tall. That passes WCAG 2.5.8 on the
spacing exemption, so it is a P3 for anyone who wants 44px.

The redesign itself: the site moved from
neo-brutalism to Kevin's Motion Kit look (dark, monochrome plus neon, grain). The
thesis is unchanged, but each project now acts it out: a small SVG scene plays its
refusal and a Try button asks for the forbidden thing. On screens at least 1024×760
the work section is a pinned horizontal walkthrough; elsewhere it is a list. The rules
are a Flip accordion. The About section has a pointer lens over the portrait and
ink-reveal copy, and a floating chip copies the email; these patterns were borrowed
from cred.club.

A Playwright suite (`tests/e2e/`) now covers what VERIFY.md used to ask for by hand.

## In progress

- [ ] `feature/agentshell-project` awaits a look at the new panel, then a merge.

## The exact next step

Look at the agentshell panel rendered, in the pinned walkthrough and in the phone list,
then merge `feature/agentshell-project` into `main`. Merging redeploys Vercel. If the
refusal claim ever needs to grow to include quota failover, that needs a real refusal
observed first; see agentshell's `docs/VERIFY.md`.

## Open questions

- `riskpulse` and `ai-class-optimizer-main` are not featured. Both are
  candidates if the set is widened to eight.
- The old `Kevin codes/portfolio/` folder is a stale pre-git scaffold that
  predates this repo. It is not the source of truth and can be deleted.

## Known traps

- `next dev` regenerates the `<!-- BEGIN:nextjs-agent-rules -->` block at the
  top of `AGENTS.md` and will duplicate it if the markers are removed.
- Windows is case-insensitive: writing `components/hero.tsx` overwrites a
  tracked `components/Hero.tsx` silently. Record case renames with
  `git rm --cached` plus `git add`.
- Contrast must be measured, not eyeballed. See `docs/VERIFY.md`.
- `mix-blend-mode` inside a `position: fixed` element blends against nothing: fixed
  is its own stacking context. Put the blend on the fixed element itself, and even
  then difference cancels over mid-tones. Verify blend effects by comparing pixels.
- Scroll positions sampled as a fraction of `scrollHeight` are wrong until every
  ScrollTrigger pin has refreshed. Scroll to the bottom and back before reading it.
- The e2e suite is load-sensitive at the default worker count: on a busy machine
  11 tests timed out at 45s, and all 11 passed on `--last-failed --workers=2`.
- Measuring in the embedded preview pane reads frozen transitions and never fires
  `loading="lazy"`; use Playwright for anything that needs real compositing.
- Next 16 crashes on the 8.3 path (`KEVINC~1`) with a libuv assertion. Use a `.cmd`
  wrapper that `cd /d`s into the real path.
- Only one `next dev` per folder: stop a preview server before running `npm run test:e2e`.
