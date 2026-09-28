# Project State

**Last updated:** 2026-09-27 by claude-code

## Where things stand

Redesign on branch `redesign/motion-kit`, open as a draft PR. The site moved from
neo-brutalism to Kevin's Motion Kit look (dark, monochrome plus neon, grain). The
thesis is unchanged, but each project now acts it out: a small SVG scene plays its
refusal and a Try button asks for the forbidden thing. On screens at least 1024×760
the work section is a pinned horizontal walkthrough; elsewhere it is a list. The rules
are a Flip accordion. The About section has a pointer lens over the portrait and
ink-reveal copy, and a floating chip copies the email; these patterns were borrowed
from cred.club.

A Playwright suite (`tests/e2e/`) now covers what VERIFY.md used to ask for by hand.

## In progress

- [ ] Draft PR awaiting Kevin's review of the Vercel preview.

## The exact next step

Review the Vercel preview on the PR, then merge to deploy.

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
