# Decisions

## The site is organised around constraints, not features

Reading back through the repos, the same shape kept appearing: the decision that
took the thinking was what each system refuses to do. Frontier Platform's
evidence floors, StarMatch's missing upload endpoint, Job Autopilot's refusal to
submit, CodeAuto's validation gate. Leading with the constraint says more about
engineering judgement than a feature list does.

Consequence: every `refuses` line must be quotable from the source repo. The
claim only carries weight because it is checkable.

## Neo-brutalism, shared with StarMatch

Deliberately the same design language as StarMatch rather than a new one per
project, so the two sites read as one designer. `.brut` is one primitive with
tokens behind it; dark mode inverts surfaces while the structure stays fixed.

Replaced the previous single-theme "systems console" identity, which was dark
only. The brutalist palette works in both themes, so the toggle came back.

## No tailwind.config.ts

Moved to native Tailwind v4 `@theme` in `globals.css`, matching StarMatch. One
place to read the tokens instead of two.

## `@custom-variant dark (&:is(.dark *))` is required

Tailwind v4's `dark:` variant defaults to `prefers-color-scheme`. The theme
toggle moves a `.dark` class. Without binding the variant to the class, the two
disagree and the light theme renders paper-on-paper at 1.14:1 on an OS set to
dark. Measured, not theoretical.

## Only volt carries white text

White on coral is 3.05:1 and fails AA despite looking dark enough. Ink on coral
is 6.46:1. `ACCENT_FG` encodes the measured pairing.

## Brand icons are inline SVG

lucide-react v1 dropped its brand icons. Inlining the two the site needs beat
adding a second icon package for two glyphs.

## The Vercel URL does not change

The deployment URL is on the resume and in every repo README. Work happens by
pushing to `main` on the existing repo, which redeploys the existing project.
Creating a new Vercel project would break every printed link.
