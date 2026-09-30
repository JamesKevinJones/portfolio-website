# Decisions

## The site is organised around constraints, not features

Reading back through the repos, the same shape kept appearing: the decision that
took the thinking was what each system refuses to do. Frontier Platform's
evidence floors, StarMatch's missing upload endpoint, Job Autopilot's refusal to
submit, CodeAuto's validation gate. Leading with the constraint says more about
engineering judgement than a feature list does.

Consequence: every `refuses` line must be quotable from the source repo. The
claim only carries weight because it is checkable.

## Neo-brutalism, shared with StarMatch (superseded 2026-09-27)

Deliberately the same design language as StarMatch rather than a new one per
project, so the two sites read as one designer. `.brut` is one primitive with
tokens behind it; dark mode inverts surfaces while the structure stays fixed.

Replaced the previous single-theme "systems console" identity, which was dark
only. The brutalist palette works in both themes, so the toggle came back.

## No tailwind.config.ts

Moved to native Tailwind v4 `@theme` in `globals.css`, matching StarMatch. One
place to read the tokens instead of two.

## `@custom-variant dark (&:is(.dark *))` is required (superseded 2026-09-27)

Tailwind v4's `dark:` variant defaults to `prefers-color-scheme`. The theme
toggle moves a `.dark` class. Without binding the variant to the class, the two
disagree and the light theme renders paper-on-paper at 1.14:1 on an OS set to
dark. Measured, not theoretical.

## Only volt carries white text (superseded 2026-09-27)

White on coral is 3.05:1 and fails AA despite looking dark enough. Ink on coral
is 6.46:1. `ACCENT_FG` encodes the measured pairing.

## Brand icons are inline SVG

lucide-react v1 dropped its brand icons. Inlining the two the site needs beat
adding a second icon package for two glyphs.

## The Vercel URL does not change

The deployment URL is on the resume and in every repo README. Work happens by
pushing to `main` on the existing repo, which redeploys the existing project.
Creating a new Vercel project would break every printed link.

## Motion Kit look replaces neo-brutalism (2026-09-27)

Kevin made the Motion Kit look his default across all his web apps. The site moved to
it: dark only, monochrome plus neon. The theme toggle, the five per-project accents
and the `dark:` variant binding went with the old system. StarMatch and this site no
longer share one visual language; the thesis and the content rules are what carry over.

## Refusals are demonstrated, not just stated (2026-09-27)

Each project has a scene that acts out its refusal and a Try button that asks for the
forbidden thing. The button's verb is UI copy; what it shows is the quoted refusal, so
the "quotable from source" rule still holds.

## The walkthrough only pins when a panel fits one screen (2026-09-27)

Horizontal pinning needs one project per screen. Below 1024×760, or with reduced
motion, the same panels render as a list. Clipping or hiding copy to make a panel fit
was rejected. (The plan said 700px; at 1024×700 the Frontier panel overflowed by
100px, so the floor was raised to 760.)

## Borrowed from cred.club (2026-09-27)

Scroll ink reveal, pointer lens, persistent contact chip, edge-fade rules, and scenes
that replay when you scroll back. Rebuilt on transforms and opacity with
contrast-safe resting states; CRED's serif, pure black, video folds and sharp corners
were deliberately not taken. Research: the CRED design-framework study in the project
files.

## Playwright end-to-end tests (2026-09-27)

The repo had no test runner and VERIFY.md asked for contrast, overflow and
reduced-motion checks by hand. They are now Playwright specs, run against the
production build with `npm run test:e2e:prod`.

## The header gets a scrim, not `mix-blend-difference` (2026-09-29)

The header has no bar, so it sits over whatever scrolls beneath it. The spec chose
`mix-blend-difference` on the row to keep it legible over the portrait and the neon
panels. That blend never did anything: the header is `position: fixed`, which makes it
its own stacking context, so the blend could only see the header's own empty contents.
Removing it left the screenshot byte-identical at 375 and 1440. Composited over the
About portrait, the labels measured 1.1:1.

Making the blend work by moving it onto the `<header>` was measured and rejected: it
lifts the worst case only to 2.2 to 2.5:1, because difference cancels over mid-tones
(skin, grey body copy). A feathered ink scrim (`.header-scrim`) is invisible over the
ink page and only appears where something bright is behind the row. A bar was rejected
because the design deliberately has none.

The CSS-colour contrast test in `page.spec.ts` reads the header as bone on ink and
cannot see this. `tests/e2e/header-legibility.spec.ts` measures composited pixels.

## agentshell is the seventh project (2026-09-29)

It is the clearest example of the thesis that was not yet on the page: a read-only
proposal mode that is a safety boundary rather than a hint. Its `AGENTS.md` says nothing
in the codebase executes agent output, which makes the refusal quotable like the others.

The claim stops at what is proven. agentshell also fails over between agent CLIs when one
is out of quota, but no real refusal has been observed from any of them, so the refusal
patterns are still guesses and that behaviour is not on the page. Facts are measured on
the day: 113 tests, 5 backends in `DEFAULT_CHAIN`, 1 dependency.

Appended as panel seven, not inserted, so the index-based tests for the other six keep
pointing at the same projects. The old "tabbing into panel six" test really guarded the
end of the pinned track, so it now targets the last panel and follows its links (this
one has no Live link, so it is one Shift+Tab back to the Try button, not two). Counts in
the tests read `PROJECTS.length` instead of a literal.

The five-accent palette concern raised earlier no longer applies: the Motion Kit look
has one neon accent and none per project.
