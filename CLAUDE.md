@AGENTS.md

# Portfolio Project Architecture & Guidelines

## Tech Stack
*   Framework: Next.js 16 (App Router, Turbopack)
*   Language: TypeScript
*   Styling: Tailwind CSS v4 (via `@config` to `tailwind.config.ts`)
*   Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (data/UI chrome)

## Design System — "Systems Console"
Dark, single-theme identity (no light mode toggle — deliberate, not an oversight)
built around the actual vocabulary of Kevin's projects: CI quality gates,
pass/fail evals, guardrails. Not a generic dark-mode-with-neon-accent template —
the two accent colors are semantically tied to real states (passing/at-risk),
never used decoratively.

*   `ink` #0b0e14 — background
*   `panel` #12161f — card/panel surface
*   `wire` #4a5468 — secondary text, borders, dividers
*   `mist` #e7eaf0 — primary text
*   `signal` #3ecf8e — "passing" / positive state only
*   `alert` #f0a93e — "risk" state only (reserved, not yet used on the page)

Signature element: the `EvalGate` component — a CI-status-strip styled exactly
like a GitHub Actions quality gate, but scored against Kevin as a person
instead of a build. Pulled directly from the actual "AI Quality Gate" badge
concept in the frontier-platform README.

## Developer Profile
*   Name: Kevin Jones
*   Headline: Full-Stack Developer & 3rd-Year Computer Science Engineering Student, SRM Institute of Science and Technology, Chennai
*   GitHub: https://github.com/JamesKevinJones
*   Featured projects (real repos, live on the homepage): frontier-platform, job-rag, riskpulse, memoryvault-ai — see `components/Projects.tsx` for sourced copy.
*   Other public repos not yet featured: folio, Netwok, rate-limiter, streakforge, CodeAut0 — candidates if the featured set changes.
*   Internships: Oasis Infobyte (`Temperature-Converter`, `Todo-App`) & CodSoft.

## Images
Source photos live in `public/images/`, all real (sent 2026-08-07):
*   `kevin-headshot-formal.jpg` — studio headshot, used in the hero "Operator" card.
*   `kevin-expo-candid.jpg`, `kevin-portrait-mural.jpg` — used in the About section.
*   `kevin-laptop-candid.jpg`, `kevin-portrait-casual.jpg`, `kevin-fullbody-casual.jpg`, `kevin-event-fullbody.jpg`, `kevin-beach-candid.jpg` — captured but not yet placed on the page; available for an About/gallery expansion.
*   Note: `kevin-laptop-candid.jpg` has phone gallery-app UI chrome (status bar, header) baked into the top of the frame from how it was screenshotted — crop before using prominently.
*   One photo (a mirror selfie) was deliberately excluded as not portfolio-appropriate; left untouched at the project root, not moved into `public/`.

## Not Yet Wired Up
*   **Contact info** — footer currently only links GitHub. No email is listed; the account email tied to this session reads as personal/informal, so I didn't publish it without confirmation. Tell me what email (or LinkedIn, etc.) you want listed and I'll add it.
*   **Supabase** (project ref `relgtrnwhadxdecxztvw`) — only needed if a DB-backed feature gets scoped (contact form, CMS). The Supabase MCP server and `npx skills add supabase/agent-skills` are available but need your explicit go-ahead before I add either.
*   **ImageKit.io** — only if image CDN needs outgrow `next/image`.
*   **Higgsfield AI Video Generator** — only if a hero/demo video becomes part of the design.

## Strict AI Coding Rules
1.  Write modular, reusable components.
2.  Use Tailwind for all styling; no custom CSS files unless absolutely necessary.
3.  Do not generate placeholder text (Lorem Ipsum); use the profile content provided above.
4.  Do not remove existing code when updating a file; provide the complete updated file.
