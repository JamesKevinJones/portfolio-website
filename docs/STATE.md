# Project State

**Last updated:** 2026-08-15 by claude-code

## Where things stand

Full redesign shipped. The site was rebuilt onto StarMatch's design
architecture — neo-brutalist tokens, `.brut` primitive, Lenis+GSAP motion
layering, theme-in-DOM — and reorganised around the "what it refuses to do"
thesis.

Featured projects are now starmatch, frontier-platform, job-autopilot,
CodeAut0, job-rag and Memoryvault-ai. The previous EvalGate/console design and
its components are gone; `tailwind.config.ts` was dropped for native v4
`@theme`.

`job-autopilot` was published to GitHub as part of this work, with a fresh
single-commit history so no personal data ever entered it.

## In progress

- [ ] Nothing mid-edit.

## The exact next step

Nothing blocking. If the featured set changes, edit `lib/projects.ts` only —
and keep the rule that every `refuses` line is quotable from its source repo.

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
