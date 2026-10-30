# Project State

**Last updated:** 2026-10-30 by claude-code

## Where things stand

**Newest, committed on branch `fix/review-feedback`, not pushed: a pass on a reviewer's feedback** ("same transition
everywhere", "too many elements", "hard to read"; reasoning in `docs/DECISIONS.md`,
2026-10-30). Copy no longer animates anywhere. The ticker, walkthrough HUD, header clock,
floating email chip and the About ink reveal are removed. The hero and footer outline words
are solid, and project facts are sentence case. The desktop walkthrough now snaps to a
whole panel. Next step: run `/security-review` on the branch's diff against `main`, then
merge to `main` and push (that deploys), then confirm the change on the live URL.

**Newest: the taste-skill pass, live on `main` at `73aa410` (2026-10-18), confirmed on the
deployed site: the new block renders, all four screenshots return 200, no console errors.** A taste-skill pass that keeps the
Motion Kit look and fixes what was wrong in any style (full reasoning in
`docs/DECISIONS.md`, "Taste-skill audit"): labels 11px to 13px, running text from mute
to `text-bone/80`, a wider copy column in the walkthrough (which also fixes a 7px
overrun Frontier already had at 1024×760 on `main`), section headings within two lines
from 375 to 1920, and a new "As they run today." block of four real screenshots of the
live deployments at the end of Work. Verified 2026-10-17: `npm run lint` clean,
`npm run test:e2e:prod` 60/60 (that run includes `next build`); the taste inspector went
from 14 FAIL to 11, all remaining ones being the kept house style, the deliberate
three-row hero, or a covered-text false positive probed in a real browser.

Earlier:
The security-review gate is added on branch `chore/security-gate`, committed locally and
not pushed. It is `.claude/commands/security-review.md` (the real gate, run before a
push) plus `.github/workflows/security.yml` (a CI backstop that only runs on pull
requests), both scaffolded by `_agent-framework/init-agent-context.ps1`, and a `GEMINI.md`
pointer. This repo had no `.github/` at all before, so it has never had any CI: the e2e
suite runs only by hand. The four git commands the slash command runs were checked here
(`origin/HEAD` resolves to `main`, all exit 0). The workflow needs a `CLAUDE_API_KEY`
repo secret before it can run, and stays red on pull requests until Kevin sets it.

Seven projects, live on `main` at `8c7e30c` and confirmed on the deployed site (7 panels,
Try works, desktop and 375px phone checked): agentshell is
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

- [ ] `chore/security-gate` is one commit ahead of `main`, not pushed.

## The exact next step

Taste pass: shipped. The JobMatch screenshot was retaken uncropped on 2026-10-19 (16:10,
answer prose included) after job-rag's plain-text fix. Follow-up, not blocking: retake a
screenshot if that project's UI changes (how each was staged is in DECISIONS). The merged
branch `design/taste-fixes` was deleted on 2026-10-18.

For the older security-gate branch:

1. Kevin sets the secret himself, never in chat: `gh secret set CLAUDE_API_KEY --repo
   JamesKevinJones/portfolio-website`.
2. Run `/security-review` on the pending diff, then merge `chore/security-gate` and push.
   The workflow file needs a token with the `workflow` scope, or the push is refused.
3. Consider pinning `anthropics/claude-code-security-review@main` in the workflow to a
   commit SHA: a moving ref receives the API key. That is the framework's canonical
   template, so change it there too or the copies drift.

If the agentshell refusal claim ever needs to grow to include quota failover, that needs
a real refusal observed first; see agentshell's `docs/VERIFY.md`.

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
