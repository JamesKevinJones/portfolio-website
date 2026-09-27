# Portfolio Motion Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Kevin's portfolio in the Motion Kit design language so each project's refusal is something the visitor can watch and try, not just read.

**Architecture:** Same Next.js 16 App Router single page, same content layer (`lib/projects.ts`, `lib/site.ts`). The neo-brutalist tokens are replaced with the Motion Kit tokens in `app/globals.css` (native Tailwind v4 `@theme`). The motion foundation (`lib/gsap.ts`, `lib/animation-constants.ts`, `components/lenis-provider.tsx`) is copied from Kevin's `next-motion-starter`. Each project gets a small SVG "scene" component plus a `play()` timeline, registered in `components/scenes/index.ts`; the Work section renders them inside a pinned horizontal walkthrough on large screens and a vertical list elsewhere.

**Tech Stack:** Next.js 16.3, React 19.2, TypeScript 5, Tailwind v4, GSAP 3.15 (ScrollTrigger, SplitText, Flip, CustomEase), @gsap/react 2, Lenis 1.3, next/font (Space Grotesk, JetBrains Mono), Playwright 1.56.1 for end-to-end tests.

**Spec:** `docs/superpowers/specs/2026-09-27-portfolio-motion-redesign-design.md`

## Global Constraints

- Branch: `redesign/motion-kit` off `main`. Never push to `main`; the PR's Vercel preview is the review surface. Merging to `main` redeploys `https://portfolio-website-eight-kappa-iwtiz3w2ef.vercel.app`, and that URL must not change.
- Read `node_modules/next/dist/docs/` for any Next API you are unsure of (AGENTS.md: "This is NOT the Next.js you know").
- Copy: every `refuses` headline and detail, every `facts` entry and every principle is used verbatim from `lib/projects.ts`. New copy is limited to button verbs, section labels and scene labels made of words already in that project's blurb or refusal detail. No invented numbers.
- Hazard striping (`.hazard`) appears on the refusal band and nowhere else.
- Tokens (exact): ink `#0a0a0b`, ink-2 `#111113`, ink-3 `#18181b`, line `#26262a`, bone `#ededea`, mute `#8b8b92`, neon `#c8ff2e`, neon-2 `#8a6bff`. Dark only.
- Fonts: Space Grotesk (display and body) and JetBrains Mono (labels), both through `next/font/google`.
- Motion: all GSAP inside `useGSAP` (or its `contextSafe`) with `gsap.matchMedia`; animate only x, y, xPercent, yPercent, scale, scaleX, scaleY, rotation, opacity; eases from `EASE` in `lib/animation-constants.ts`; `ease: "none"` only on scrubbed timelines; comment every ease choice and every trigger start/end. Markup is the final state; animate with `from`/`fromTo`.
- Reduced motion: no ScrollTrigger pins, no Lenis, final state rendered, every interaction still works.
- Dependencies: add `@gsap/react@^2.1.2` and dev `@playwright/test@1.56.1`; remove `motion` (unused). Nothing else.
- File names are kebab-case (Windows is case-insensitive, see docs/STATE.md).
- Accessibility floors: 4.5:1 for body and label text, 3:1 for text 24px and larger; `scrollWidth === clientWidth` at 375px.
- `npm run lint` and `npm run build` pass with no errors at the end of every task.
- Kevin runs Windows PowerShell 5: in anything written for him use `npm.cmd` and `npx.cmd`, one command per line, no `&&`. Commands in this plan are written for the Linux executor.
- Commit messages end with the attribution lines the session provides.

## Review Focus

1. **Reduced motion.** A visitor with `prefers-reduced-motion: reduce` sees all six projects as a readable list, every scene in its final "refused" pose, no pinned sections, and the Try buttons still announce the refusal. (Tests: Task 4, Task 6, Task 10.)
2. **Phone width (375px).** Giant hero type, the marquee and the horizontal track are the likeliest things to push the page sideways; the page must never scroll horizontally and no hero row may be clipped. (Tests: Task 4, Task 10.)
3. **Keyboard inside the pinned track.** Tabbing to a link in panel 6 while the track is translated must bring panel 6 on screen, not leave focus on an invisible element. (Test: Task 6.)
4. **Short laptop screens.** At 1024×700 every panel's content must fit its screen; below that height the list layout takes over. (Test: Task 6.)
5. **Mashing the Try button.** Five fast clicks must leave the scene in its final pose, the status saying "Refused ×5.", and no stacked or half-finished timelines. (Test: Task 5.)

---

## File Structure

```
app/
  globals.css                 REWRITE  Motion Kit tokens, walk variant, grain/mesh/hazard, reduced motion
  layout.tsx                  REWRITE  fonts, metadata, grain overlay, LenisProvider, header/footer
  page.tsx                    MODIFY   hero, ticker, work, approach, about
lib/
  animation-constants.ts      CREATE   copied from next-motion-starter + walkthrough queries
  gsap.ts                     CREATE   copied from next-motion-starter (plugin registration)
  projects.ts                 MODIFY   drop accents, add `attempt`, typed slugs, STACK moved here
  site.ts                     unchanged
components/
  lenis-provider.tsx          CREATE   copied from next-motion-starter, replaces smooth-scroll.tsx
  smooth-scroll.tsx           DELETE
  ui/magnetic-button.tsx      CREATE   ported from motion-kit
  ui/section-heading.tsx      CREATE   ported from motion-kit
  ui/particle-field.tsx       CREATE   ported from motion-kit + freeze target
  ui/velocity-marquee.tsx     CREATE   ported from motion-kit
  ui/local-time.tsx           CREATE   Chennai clock via useSyncExternalStore
  scenes/starmatch.tsx        CREATE   scene + play()
  scenes/frontier.tsx         CREATE
  scenes/job-autopilot.tsx    CREATE
  scenes/codeauto.tsx         CREATE
  scenes/job-rag.tsx          CREATE
  scenes/memoryvault.tsx      CREATE
  scenes/index.ts             CREATE   SCENES registry + runScene()
  project-panel.tsx           CREATE   one project: copy, refusal band, stage, Try button
  site-header.tsx             REWRITE
  hero.tsx                    REWRITE
  work.tsx                    REWRITE  (Task 5 list, Task 6 pinned track)
  approach.tsx                REWRITE  Flip accordion
  about.tsx                   REWRITE
  site-footer.tsx             REWRITE  contact
  brand-icons.tsx             unchanged
playwright.config.ts          CREATE
tests/e2e/*.spec.ts           CREATE   one spec per task
docs/ AGENTS.md README.md     MODIFY   Task 10
```

---

### Task 1: Motion foundation and Motion Kit tokens

**Files:**
- Create: `lib/animation-constants.ts`, `lib/gsap.ts`, `components/lenis-provider.tsx`, `playwright.config.ts`, `tests/e2e/foundation.spec.ts`
- Rewrite: `app/globals.css`, `app/layout.tsx`
- Modify: `components/site-header.tsx` (remove theme toggle only), `package.json`, `.gitignore`
- Delete: `components/smooth-scroll.tsx`

**Interfaces:**
- Produces: `EASE`, `DURATION`, `STAGGER`, `DISTANCE`, `SCROLL`, `MQ` (with `MQ.walkthrough`, `MQ.stacked`), `BEZIER` from `@/lib/animation-constants`; `gsap`, `ScrollTrigger`, `SplitText`, `Flip`, `CustomEase`, `TextPlugin`, `useGSAP` from `@/lib/gsap`; `LenisProvider`, `useLenis(): Lenis | null` from `@/components/lenis-provider`. Tailwind utilities: `bg-ink`, `bg-ink-2`, `bg-ink-3`, `border-line`, `text-bone`, `text-mute`, `text-neon`, `bg-neon`, `text-neon-2`, `font-display`, `font-mono`, `ease-expo-out`, `ease-snap-back`, variant `walk:`. CSS classes: `.label`, `.grain`, `.mesh`, `.text-outline`, `.split-pad`, `.hazard`, `.hazard-live`.

- [ ] **Step 1: Create the branch and install dependencies**

```bash
cd portfolio-website
git checkout -b redesign/motion-kit
npm install @gsap/react@^2.1.2
npm install -D @playwright/test@1.56.1
npm uninstall motion
```

In the cloud container Chromium is preinstalled for Playwright 1.56.1. On Kevin's machine run `npx.cmd playwright install chromium` once.

- [ ] **Step 2: Add scripts and ignore test output**

In `package.json` replace the `scripts` block with:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test:e2e": "playwright test",
    "test:e2e:prod": "playwright test"
  },
```

Append to `.gitignore`:

```
# playwright
/test-results/
/playwright-report/
```

- [ ] **Step 3: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
// `npm run test:e2e:prod` tests the production build; plain `test:e2e` uses the dev
// server for a fast loop. Reading the npm script name keeps this cross-platform
// (PowerShell has no inline `VAR=1 cmd` syntax).
const prod = process.env.npm_lifecycle_event === "test:e2e:prod" || !!process.env.CI;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45_000,
  expect: { timeout: 6_000 },
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: prod ? `npm run build && npm run start -- -p ${PORT}` : `npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
```

- [ ] **Step 4: Write the failing test**

Create `tests/e2e/foundation.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("page sits on Motion Kit ink with grain and no theme toggle", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(10, 10, 11)");
  await expect(page.locator("body")).toHaveCSS("color", "rgb(237, 237, 234)");
  await expect(page.locator(".grain")).toHaveCount(1);
  await expect(page.getByRole("button", { name: /theme/i })).toHaveCount(0);
});

test("display type is Space Grotesk and labels are JetBrains Mono", async ({ page }) => {
  await page.goto("/");
  const h1Font = await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily);
  expect(h1Font).toContain("Space Grotesk");
  const monoFont = await page.evaluate(() => {
    const probe = document.createElement("span");
    probe.className = "label";
    document.body.append(probe);
    const family = getComputedStyle(probe).fontFamily;
    probe.remove();
    return family;
  });
  expect(monoFont).toContain("JetBrains Mono");
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npx playwright test tests/e2e/foundation.spec.ts`
Expected: FAIL. Background is `rgb(244, 241, 234)` (paper) and the theme button exists.

- [ ] **Step 6: Create `lib/animation-constants.ts`**

Copy `/mnt/project-files/next-motion-starter/lib/animation-constants.ts` verbatim, then replace its `MQ` block with:

```ts
/** Media queries for gsap.matchMedia(). Every animated component branches on these. */
export const MQ = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 768px)",
  mobile: "(max-width: 767px)",
  finePointer: "(hover: hover) and (pointer: fine)",
  /**
   * Horizontal pinned walkthrough: wide AND tall enough that one project panel fits a
   * screen. Must match the `walk` custom variant in app/globals.css exactly.
   */
  walkthrough: "(min-width: 1024px) and (min-height: 700px)",
  /** Everything the walkthrough query excludes. `not all and` negates the whole query. */
  stacked: "not all and (min-width: 1024px) and (min-height: 700px)",
} as const;
```

- [ ] **Step 7: Create `lib/gsap.ts`**

Copy `/mnt/project-files/next-motion-starter/lib/gsap.ts` verbatim. Its full content is:

```ts
/**
 * One place to import GSAP from. Registers every plugin once and the custom eases from
 * animation-constants, so components never re-register or hardcode curves.
 */
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { TextPlugin } from "gsap/TextPlugin";
import { useGSAP } from "@gsap/react";
import { BEZIER } from "./animation-constants";

if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase, Flip, ScrollTrigger, SplitText, TextPlugin, useGSAP);
  gsap.config({ force3D: true });

  for (const [name, [x1, y1, x2, y2]] of Object.entries(BEZIER)) {
    CustomEase.create(name, `M0,0 C${x1},${y1} ${x2},${y2} 1,1`);
  }
}

export { gsap, CustomEase, Flip, ScrollTrigger, SplitText, TextPlugin, useGSAP };
```

- [ ] **Step 8: Create `components/lenis-provider.tsx`**

Copy `/mnt/project-files/next-motion-starter/components/lenis-provider.tsx` verbatim (it imports `LENIS`, `MQ` from `@/lib/animation-constants` and `gsap`, `ScrollTrigger`, `useGSAP` from `@/lib/gsap`, which now exist). Then delete the old wrapper:

```bash
git rm components/smooth-scroll.tsx
```

- [ ] **Step 9: Rewrite `app/globals.css`**

```css
@import "tailwindcss";

/*
  Motion Kit design language, Kevin's house style: monochrome ink, one neon accent,
  grain and mesh for depth. Dark only, so there is no theme toggle to keep in sync and
  no `dark:` variant in use anywhere.
*/
@theme {
  --color-ink: #0a0a0b;
  --color-ink-2: #111113;
  --color-ink-3: #18181b;
  --color-line: #26262a;
  --color-bone: #ededea;
  --color-mute: #8b8b92;
  --color-neon: #c8ff2e;
  --color-neon-2: #8a6bff;

  --font-display: var(--font-space), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains), ui-monospace, SFMono-Regular, monospace;

  /* CSS mirrors of BEZIER in lib/animation-constants.ts, for hover transitions. */
  --ease-expo-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-snap-back: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/*
  Horizontal walkthrough layout. Must match MQ.walkthrough in
  lib/animation-constants.ts: wide AND tall enough for one panel per screen, and only
  when motion is allowed. Every other case gets the stacked list.
*/
@custom-variant walk {
  @media (min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference) {
    @slot;
  }
}

@layer base {
  html {
    background: var(--color-ink);
    color: var(--color-bone);
    color-scheme: dark;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    /* Lenis drives scrolling; native smooth scroll would fight it. */
    scroll-behavior: auto;
  }

  body {
    font-family: var(--font-display);
    background:
      radial-gradient(60vw 40vw at 85% -10%, color-mix(in oklab, var(--color-neon-2) 16%, transparent), transparent 70%),
      radial-gradient(50vw 40vw at -10% 30%, color-mix(in oklab, var(--color-neon) 7%, transparent), transparent 70%),
      var(--color-ink);
    overflow-x: clip;
  }

  h1,
  h2,
  h3 {
    text-wrap: balance;
  }

  ::selection {
    background: var(--color-neon);
    color: var(--color-ink);
  }

  :focus-visible {
    outline: 2px solid var(--color-neon);
    outline-offset: 4px;
  }
}

@layer components {
  .label {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  /* Static film grain. Painted once, never animated. */
  .grain {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
    background-size: 220px 220px;
  }

  /* 48px mesh for stage panels. */
  .mesh {
    background-image:
      linear-gradient(to right, color-mix(in oklab, var(--color-bone) 6%, transparent) 1px, transparent 1px),
      linear-gradient(to bottom, color-mix(in oklab, var(--color-bone) 6%, transparent) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  .text-outline {
    -webkit-text-stroke: 1px var(--color-bone);
    color: transparent;
  }

  /* SplitText masks clip at the line box; give descenders room without shifting layout. */
  .split-pad > * {
    padding-bottom: 0.14em;
    margin-bottom: -0.14em;
  }

  /*
    The refusal band's warning tape, recoloured neon on ink. Used on the refusal band
    and nowhere else: the moment it becomes texture it stops reading as a warning.
  */
  .hazard {
    background-image: repeating-linear-gradient(
      45deg,
      var(--color-neon) 0 10px,
      var(--color-ink) 10px 20px
    );
  }

  /*
    Drift one full period on panel hover so the tape reads as live. 28.284px is the
    20px stripe period measured along the x axis (20 × √2), which makes the loop seamless.
  */
  @keyframes hazard-drift {
    to {
      background-position: 28.284px 0;
    }
  }

  .group\/panel:hover .hazard-live {
    animation: hazard-drift 1.4s linear infinite;
  }
}

/*
  Every animation is opt-out. The GSAP code branches on the same query, but killing
  CSS animation here catches anything it missed.
*/
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 10: Rewrite `app/layout.tsx`**

```tsx
import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "@/components/lenis-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE_URL, PROFILE } from "@/lib/site";

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

const DESCRIPTION =
  "Kevin Jones builds governed AI, retrieval and automation systems — and documents what each one refuses to do. Full-stack developer and third-year CS engineering student in Chennai.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kevin Jones — systems that know when to stop",
    template: "%s · Kevin Jones",
  },
  description: DESCRIPTION,
  keywords: [
    "Kevin Jones",
    "full-stack developer",
    "governed AI",
    "retrieval augmented generation",
    "guardrails",
    "Next.js",
    "Python",
  ],
  authors: [{ name: PROFILE.fullName, url: PROFILE.github }],
  creator: PROFILE.fullName,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Kevin Jones",
    title: "Kevin Jones — systems that know when to stop",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Kevin Jones — systems that know when to stop",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: SITE_URL },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: PROFILE.fullName,
  alternateName: PROFILE.name,
  url: SITE_URL,
  jobTitle: PROFILE.role,
  description: DESCRIPTION,
  sameAs: [PROFILE.github, PROFILE.linkedin],
  address: { "@type": "PostalAddress", addressLocality: "Chennai", addressCountry: "IN" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${space.variable} ${jetbrains.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main"
          className="label sr-only rounded-full bg-neon px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
        >
          Skip to content
        </a>
        {/* Grain sits above everything but takes no input. 7% overlay is felt, not seen. */}
        <div
          aria-hidden="true"
          className="grain pointer-events-none fixed inset-0 z-[60] opacity-[0.07] mix-blend-overlay"
        />
        <LenisProvider>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </LenisProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 11: Remove the theme toggle from `components/site-header.tsx`**

The theme icons' CSS is gone, so the button goes now (Task 3 rewrites the whole header). Make exactly three deletions:

1. The import line `import { Moon, Sun } from "lucide-react";`
2. The `toggle` function together with the doc comment above it.
3. The `<button type="button" onClick={toggle} ...>...</button>` element together with the `{/* Icons swap via CSS ... */}` comment above it.

Leave everything else in the file as it is.

- [ ] **Step 12: Run the tests to verify they pass**

Run: `npx playwright test tests/e2e/foundation.spec.ts`
Expected: 2 passed.

- [ ] **Step 13: Lint and build**

Run: `npm run lint` then `npm run build`
Expected: both exit 0. (The old components still use brutalist class names that no longer exist; Tailwind ignores unknown classes, so the page looks unstyled in places until later tasks. That is expected.)

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: Motion Kit tokens, GSAP/Lenis foundation and Playwright harness"
```

---

### Task 2: Content layer for the new design

**Files:**
- Modify: `lib/projects.ts`, `components/work.tsx` (accent references only), `components/about.tsx` (STACK import only)
- Test: `tests/e2e/content.spec.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `type SceneKey = "starmatch" | "frontier-platform" | "job-autopilot" | "codeaut0" | "job-rag" | "memoryvault-ai"`; `Project` with `slug: SceneKey` and `attempt: string` (no `accent`); `PROJECTS: Project[]`; `PRINCIPLES` unchanged; `STACK: readonly (readonly [string, string])[]`. `ACCENT_BG`, `ACCENT_FG` and `Accent` are deleted.

- [ ] **Step 1: Write the failing test**

Create `tests/e2e/content.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { PROJECTS, PRINCIPLES, STACK } from "../../lib/projects";

test("every project has a quoted refusal, a short attempt verb and a unique slug", () => {
  expect(PROJECTS).toHaveLength(6);
  expect(new Set(PROJECTS.map((p) => p.slug)).size).toBe(PROJECTS.length);
  for (const p of PROJECTS) {
    // Refusal headlines are quoted from source repos and all share this shape.
    expect(p.refuses.headline).toMatch(/^It won’t .+\.$/);
    expect(p.attempt.length).toBeGreaterThan(0);
    // The Try pill has to fit beside the status line on a 375px phone.
    expect(p.attempt.length).toBeLessThanOrEqual(22);
    expect(p).not.toHaveProperty("accent");
  }
});

test("principles and stack survive the move", () => {
  expect(PRINCIPLES).toHaveLength(4);
  expect(STACK.map(([term]) => term)).toEqual(["Languages", "Frontend", "Backend", "AI", "Infra"]);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/e2e/content.spec.ts`
Expected: FAIL with an import error for `STACK` (not exported) or the `attempt` assertions.

- [ ] **Step 3: Update `lib/projects.ts`**

3a. Replace everything from `export type Accent = ...` down to and including the closing `};` of `ACCENT_FG` with:

```ts
/** One key per project. Also the key into the scene registry in components/scenes. */
export type SceneKey =
  | "starmatch"
  | "frontier-platform"
  | "job-autopilot"
  | "codeaut0"
  | "job-rag"
  | "memoryvault-ai";

export type Project = {
  slug: SceneKey;
  name: string;
  /** Mono eyebrow. Domain and shipping state — both are facts, not decoration. */
  domain: string;
  status: "Live" | "CLI";
  blurb: string;
  refuses: { headline: string; detail: string };
  /**
   * The Try button: a request for the one thing this system refuses to do. UI copy,
   * not a claim: pressing it only replays the refusal quoted above. 22 characters max
   * so the pill fits beside its status line on a phone.
   */
  attempt: string;
  /** Short measured facts. Numbers only where a real number exists. */
  facts: string[];
  stack: string[];
  live?: string;
  source: string;
};
```

3b. In each project object delete the `accent: "...",` line and add an `attempt` line directly after the `refuses: { ... },` block:

| slug | line to add |
| --- | --- |
| `starmatch` | `attempt: "Upload my photo",` |
| `frontier-platform` | `attempt: "Answer anyway",` |
| `job-autopilot` | `attempt: "Submit it for me",` |
| `codeaut0` | `attempt: "Run the workflow",` |
| `job-rag` | `attempt: "Show every listing",` |
| `memoryvault-ai` | `attempt: "Save the scrollback",` |

3c. Append at the end of the file:

```ts
/** The stack list in About. Grouped by layer, plain text, no logos. */
export const STACK = [
  ["Languages", "Python · TypeScript · SQL · C++"],
  ["Frontend", "Next.js · React · Tailwind · GSAP · visx"],
  ["Backend", "FastAPI · Node · Drizzle · SQLite · Postgres"],
  ["AI", "RAG · reranking · embeddings · Bedrock · Gemini"],
  ["Infra", "Vercel · Docker · GitHub Actions"],
] as const;
```

- [ ] **Step 4: Keep the old components compiling**

In `components/work.tsx`:
- change the import to `import { PROJECTS, type Project } from "@/lib/projects";`
- change `const { refuses, accent } = project;` to `const { refuses } = project;`
- replace every `${ACCENT_BG[accent]} ${ACCENT_FG[accent]}` with `bg-neon text-ink`
- replace `` className={`h-2 ${ACCENT_BG[accent]}`} `` with `className="h-2 bg-neon"`

In `components/about.tsx`: delete the local `const STACK = [...]` block and add `import { STACK } from "@/lib/projects";`.

(Tasks 5 and 8 rewrite both files; this step only keeps the build green.)

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx playwright test tests/e2e/content.spec.ts`
Expected: 2 passed.

- [ ] **Step 6: Lint, build, commit**

```bash
npm run lint
npm run build
git add -A
git commit -m "feat: attempt verbs and typed scene keys in the content layer"
```

---

### Task 3: Shared UI primitives and the fixed header

**Files:**
- Create: `components/ui/magnetic-button.tsx`, `components/ui/section-heading.tsx`, `components/ui/local-time.tsx`
- Rewrite: `components/site-header.tsx`
- Modify: `components/site-footer.tsx` (add `id="contact"` to `<footer>` only)
- Test: `tests/e2e/header.spec.ts`

**Interfaces:**
- Consumes: `gsap`, `SplitText`, `useGSAP` from `@/lib/gsap`; `EASE`, `DURATION`, `STAGGER`, `MQ`, `SCROLL` from `@/lib/animation-constants`.
- Produces:
  - `MagneticButton(props: { children: ReactNode; href?: string; external?: boolean; onClick?: () => void; strength?: number; variant?: "solid" | "ghost"; className?: string; ariaLabel?: string })`
  - `SectionHeading(props: { index: string; eyebrow: string; title: string; lede?: string })`
  - `LocalTime(): JSX.Element` renders `HH:MM IST` (Asia/Kolkata), `--:-- IST` on the server.
  - Header nav targets: `#work`, `#approach`, `#about`, `#contact`; brand link `#top`.

- [ ] **Step 1: Write the failing test**

Create `tests/e2e/header.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("header is fixed, links only to sections that exist, and shows Chennai time", async ({ page }) => {
  await page.goto("/");
  const header = page.locator("header").first();
  await expect(header).toHaveCSS("position", "fixed");

  const nav = header.getByRole("navigation", { name: "Sections" });
  const hrefs = await nav.getByRole("link").evaluateAll((links) =>
    links.map((a) => a.getAttribute("href")),
  );
  expect(hrefs).toEqual(["#work", "#approach", "#about", "#contact"]);
  for (const href of hrefs) {
    await expect(page.locator(href!)).toHaveCount(1);
  }

  await expect(header.getByTestId("local-time")).toHaveText(/^\d{2}:\d{2} IST$/);
});

test("scroll progress hairline scales with the page", async ({ page }) => {
  await page.goto("/");
  const bar = page.getByTestId("scroll-progress");
  await page.mouse.wheel(0, 2000);
  await expect
    .poll(async () => bar.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a))
    .toBeGreaterThan(0.05);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/e2e/header.spec.ts`
Expected: FAIL. The header is `sticky`, there is no `Sections` nav label and no `local-time` test id.

- [ ] **Step 3: Create `components/ui/local-time.tsx`**

```tsx
"use client";

import { useSyncExternalStore } from "react";

const format = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const read = () => format.format(Date.now());

/** Ticks every 15s; the string only changes once a minute, so React re-renders once a minute. */
const subscribe = (onChange: () => void) => {
  const id = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(id);
};

/**
 * Kevin's local time. useSyncExternalStore renders the server snapshot during hydration
 * and swaps to the real clock right after, so there is no hydration mismatch and no
 * setState inside an effect.
 */
export function LocalTime() {
  const time = useSyncExternalStore(subscribe, read, () => "--:--");
  return (
    <span data-testid="local-time" className="tabular-nums">
      {time} IST
    </span>
  );
}
```

- [ ] **Step 4: Create `components/ui/magnetic-button.tsx`**

Port of `/mnt/project-files/motion-kit/src/components/MagneticButton.tsx` with Next's `"use client"`, the shared imports, and `external`/`ariaLabel` props:

```tsx
"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MQ } from "@/lib/animation-constants";

type MagneticButtonProps = {
  children: ReactNode;
  href?: string;
  /** Opens in a new tab with rel=noopener. */
  external?: boolean;
  onClick?: () => void;
  /** 0 to 1: how far the pill travels toward the cursor. */
  strength?: number;
  variant?: "solid" | "ghost";
  className?: string;
  ariaLabel?: string;
};

/**
 * Cursor-following pill. The hit zone extends 20px past the visible pill; pill and label
 * chase the pointer at different rates for depth and spring home on release. A neon disc
 * scales in from the entry point. Touch, coarse pointers and reduced motion get a static
 * pill with an instant neon hover.
 */
export function MagneticButton({
  children,
  href,
  external = false,
  onClick,
  strength = 0.35,
  variant = "solid",
  className = "",
  ariaLabel,
}: MagneticButtonProps) {
  const zone = useRef<HTMLSpanElement>(null);
  const pill = useRef<HTMLElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(`${MQ.motion} and ${MQ.finePointer}`, () => {
        const z = zone.current!;
        const p = pill.current!;
        const l = label.current!;
        const f = fill.current!;
        gsap.set(f, { scale: 0, x: 0, y: 0, xPercent: -50, yPercent: -50 });

        let follow: Record<"px" | "py" | "lx" | "ly", gsap.QuickToFunc> | null = null;
        // power3.out on quickTo: the pill catches up fast then eases in, so it feels
        // attached to the cursor without jitter. The label lags 0.1s more for parallax.
        const makeFollow = () => ({
          px: gsap.quickTo(p, "x", { duration: 0.5, ease: EASE.out }),
          py: gsap.quickTo(p, "y", { duration: 0.5, ease: EASE.out }),
          lx: gsap.quickTo(l, "x", { duration: 0.6, ease: EASE.out }),
          ly: gsap.quickTo(l, "y", { duration: 0.6, ease: EASE.out }),
        });

        const local = (e: PointerEvent) => {
          const r = p.getBoundingClientRect();
          return { x: e.clientX - r.left, y: e.clientY - r.top };
        };

        const onEnter = (e: PointerEvent) => {
          gsap.killTweensOf([p, l]);
          follow = makeFollow();
          gsap.set(f, local(e));
          gsap.to(f, { scale: 1, duration: DURATION.base, ease: EASE.out, overwrite: true });
        };

        const onMove = (e: PointerEvent) => {
          if (!follow) return;
          const zr = z.getBoundingClientRect();
          const dx = e.clientX - (zr.left + zr.width / 2);
          const dy = e.clientY - (zr.top + zr.height / 2);
          follow.px(dx * strength);
          follow.py(dy * strength);
          follow.lx(dx * strength * 0.45);
          follow.ly(dy * strength * 0.45);
        };

        const onLeave = (e: PointerEvent) => {
          follow = null;
          gsap.killTweensOf([p, l]);
          // Elastic release: overshoots home and settles, which is what sells "magnet".
          gsap.to([p, l], { x: 0, y: 0, duration: 1.3, ease: "elastic.out(1.1, 0.32)" });
          // power2.in: the disc accelerates out of the exit point, like it is pulled away.
          gsap.to(f, { ...local(e), scale: 0, duration: 0.45, ease: "power2.in", overwrite: true });
        };

        z.addEventListener("pointerenter", onEnter);
        z.addEventListener("pointermove", onMove);
        z.addEventListener("pointerleave", onLeave);
        return () => {
          z.removeEventListener("pointerenter", onEnter);
          z.removeEventListener("pointermove", onMove);
          z.removeEventListener("pointerleave", onLeave);
        };
      });

      return () => mm.revert();
    },
    { dependencies: [strength] },
  );

  const base =
    "relative inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-4 font-mono text-sm uppercase tracking-[0.18em] outline-none focus-visible:ring-2 focus-visible:ring-neon focus-visible:ring-offset-4 focus-visible:ring-offset-ink will-change-transform";
  const look =
    variant === "solid"
      ? "bg-bone text-ink motion-reduce:hover:bg-neon [@media(pointer:coarse)]:active:bg-neon"
      : "border border-line text-bone [@media(hover:hover)]:hover:text-ink motion-reduce:hover:bg-neon motion-reduce:hover:text-ink";

  const inner = (
    <>
      <span
        ref={fill}
        aria-hidden="true"
        style={{ transform: "scale(0)" }}
        className="pointer-events-none absolute left-0 top-0 aspect-square h-[260%] rounded-full bg-neon motion-reduce:hidden [@media(pointer:coarse)]:hidden"
      />
      <span ref={label} className="relative z-10 inline-flex items-center gap-3 will-change-transform">
        {children}
      </span>
    </>
  );

  return (
    <span ref={zone} className={`-m-5 inline-block p-5 ${className}`}>
      {href ? (
        <a
          ref={pill as RefObject<HTMLAnchorElement>}
          href={href}
          aria-label={ariaLabel}
          {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
          className={`${base} ${look}`}
        >
          {inner}
        </a>
      ) : (
        <button
          ref={pill as RefObject<HTMLButtonElement>}
          type="button"
          onClick={onClick}
          aria-label={ariaLabel}
          className={`${base} ${look}`}
        >
          {inner}
        </button>
      )}
    </span>
  );
}
```

- [ ] **Step 5: Create `components/ui/section-heading.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { EASE, MQ, STAGGER } from "@/lib/animation-constants";

type SectionHeadingProps = { index: string; eyebrow: string; title: string; lede?: string };

/** Section heading whose lines rise out of masks, scrubbed to the heading entering view. */
export function SectionHeading({ index, eyebrow, title, lede }: SectionHeadingProps) {
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        SplitText.create(heading.current, {
          type: "lines",
          mask: "lines",
          // Re-splits on resize and font load so line breaks stay correct.
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 105,
              stagger: STAGGER.lines,
              ease: EASE.out,
              // Starts as the block's top crosses 85% of the viewport (just visible) and
              // finishes by 45%, so the heading is fully set before it reaches centre.
              scrollTrigger: { trigger: root.current, start: "top 85%", end: "top 45%", scrub: 0.5 },
            }),
        });
        gsap.from(root.current!.querySelectorAll(".sh-fade"), {
          opacity: 0,
          y: 20,
          stagger: STAGGER.lines,
          ease: "power2.out",
          scrollTrigger: { trigger: root.current, start: "top 80%", end: "top 50%", scrub: 0.5 },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid gap-6 md:grid-cols-[1fr_2fr] md:gap-10">
      <p className="sh-fade label flex gap-4 text-mute md:pt-3">
        <span className="text-neon">{index}</span>
        <span>{eyebrow}</span>
      </p>
      <div>
        <h2
          ref={heading}
          className="split-pad font-display text-[clamp(2.4rem,6vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.04em]"
        >
          {title}
        </h2>
        {lede && <p className="sh-fade mt-6 max-w-xl text-lg leading-relaxed text-mute">{lede}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Rewrite `components/site-header.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE, MQ } from "@/lib/animation-constants";
import { LocalTime } from "@/components/ui/local-time";

const NAV = [
  { href: "#work", label: "Work" },
  { href: "#approach", label: "Rules" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

/**
 * Fixed mono header. mix-blend-difference keeps it legible over the neon stage panels
 * and the photos without a background bar. The hairline under it is page progress.
 */
export function SiteHeader() {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      // Linear (EASE.scrub) because scroll position is already the easing. start 0 /
      // end "max" spans the whole document; scrub 0.3 just smooths wheel steps.
      gsap.fromTo(
        bar.current,
        { scaleX: 0 },
        { scaleX: 1, ease: EASE.scrub, scrollTrigger: { start: 0, end: "max", scrub: 0.3 } },
      );
    });
    return () => mm.revert();
  });

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="label flex items-center justify-between gap-4 px-4 py-4 text-bone mix-blend-difference sm:px-6 md:px-10">
        <a href="#top" className="flex items-center gap-2">
          <span className="inline-block size-2 rounded-full bg-neon" aria-hidden="true" />
          <span className="sm:hidden">KJ</span>
          <span className="hidden sm:inline">Kevin Jones</span>
        </a>
        <span className="hidden md:inline">
          Chennai · <LocalTime />
        </span>
        <nav aria-label="Sections" className="flex gap-4 sm:gap-8">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="opacity-70 transition-opacity hover:opacity-100">
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      <div
        ref={bar}
        data-testid="scroll-progress"
        aria-hidden="true"
        style={{ transform: "scaleX(0)" }}
        className="h-px origin-left bg-neon motion-reduce:hidden"
      />
    </header>
  );
}
```

- [ ] **Step 7: Give the footer its anchor**

In `components/site-footer.tsx` change `<footer className="border-t-[3px]">` to `<footer id="contact" className="border-t-[3px]">`. (Task 9 rewrites the footer.)

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npx playwright test tests/e2e/header.spec.ts`
Expected: 2 passed.

- [ ] **Step 9: Lint, build, commit**

```bash
npm run lint
npm run build
git add -A
git commit -m "feat: magnetic button, section heading, Chennai clock and fixed header"
```

---

### Task 4: Hero where "stop." stops, and the refusal ticker

**Files:**
- Create: `components/ui/particle-field.tsx`, `components/ui/velocity-marquee.tsx`
- Rewrite: `components/hero.tsx`
- Modify: `app/page.tsx`
- Test: `tests/e2e/hero.spec.ts`

**Interfaces:**
- Consumes: `MagneticButton` (Task 3); `PROJECTS` (Task 2); `gsap`, `ScrollTrigger`, `SplitText`, `useGSAP`; `EASE`, `DURATION`, `STAGGER`, `SCROLL`, `MQ`.
- Produces:
  - `ParticleField(props: { spacing?: number; radius?: number; force?: number; accent?: string; base?: string; freezeSelector?: string; className?: string })`: while the pointer is over the element matching `freezeSelector`, the field stops rendering.
  - `VelocityMarquee(props: { items: string[]; speed?: number; className?: string })`, root carries `data-marquee`.
  - Hero DOM hooks: `section#top`, `.hero-drift` (rows that move on scroll), `.hero-stop` (the word that does not).

- [ ] **Step 1: Write the failing test**

Create `tests/e2e/hero.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("hero reads as one sentence to assistive tech", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    "Systems that know when to stop.",
  );
  await expect(page.locator("section#top .hero-stop")).toHaveText("stop.");
});

test("scrolling moves every row except the word stop.", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1600); // let the character intro finish
  const stop = page.locator(".hero-stop");
  const drift = page.locator(".hero-drift").first();
  const before = { stop: await stop.boundingBox(), drift: await drift.boundingBox() };

  await page.mouse.wheel(0, 350);
  await page.waitForTimeout(1200); // Lenis + scrub catch-up

  const after = { stop: await stop.boundingBox(), drift: await drift.boundingBox() };
  // The hero is pinned while this happens, so "stop." holds its screen position...
  expect(Math.abs(after.stop!.x - before.stop!.x)).toBeLessThan(2);
  expect(Math.abs(after.stop!.y - before.stop!.y)).toBeLessThan(2);
  // ...while the first row has slid sideways.
  expect(Math.abs(after.drift!.x - before.drift!.x)).toBeGreaterThan(20);
});

test("reduced motion: no pin, no Lenis, final composition", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("section#top")).toBeVisible();
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator("html.lenis")).toHaveCount(0);
  // Marquee shows one copy only; the duplicate used for looping is hidden.
  await expect(page.locator("[data-marquee] [data-copy='loop']")).toBeHidden();
});

test("375px: hero rows and ticker never push the page sideways", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.waitForTimeout(1600);
  const overflow = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    rows: [...document.querySelectorAll<HTMLElement>(".hero-row")].map(
      (row) => row.scrollWidth - row.clientWidth,
    ),
  }));
  expect(overflow.page).toBe(0);
  for (const r of overflow.rows) expect(r).toBeLessThanOrEqual(0);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/e2e/hero.spec.ts`
Expected: FAIL. There is no `section#top` or `.hero-stop`.

- [ ] **Step 3: Create `components/ui/particle-field.tsx`**

Port of `/mnt/project-files/motion-kit/src/components/ParticleField.tsx`. Copy that file's body verbatim, then make exactly these changes:

3a. First line `"use client";`, imports become:

```tsx
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ } from "@/lib/animation-constants";
```

3b. Props type gains:

```tsx
  /**
   * While the pointer is over the element matching this selector, the field stops:
   * the ticker is removed and the last frame stays on the canvas. The hero points it at
   * the word "stop.".
   */
  freezeSelector?: string;
```

and the function signature destructures `freezeSelector,` after `base = "#ededea",`. Add `freezeSelector` to the `dependencies` array.

3c. Inside `mm.add(...)`, after `let running = false;` add:

```tsx
      let frozen = false;
```

3d. Replace the `setRunning` function with:

```tsx
      const setRunning = () => {
        const next = animate && visible && !frozen && document.visibilityState === "visible";
        if (next === running) return;
        running = next;
        if (running) gsap.ticker.add(tick);
        else gsap.ticker.remove(tick);
      };

      const freezeEl = freezeSelector ? document.querySelector(freezeSelector) : null;
      const onFreeze = () => {
        frozen = true;
        setRunning();
      };
      const onThaw = () => {
        frozen = false;
        setRunning();
      };
```

3e. After `document.addEventListener("visibilitychange", setRunning);` add:

```tsx
      if (animate && freezeEl) {
        freezeEl.addEventListener("pointerenter", onFreeze);
        freezeEl.addEventListener("pointerleave", onThaw);
      }
```

and in the cleanup function add:

```tsx
        freezeEl?.removeEventListener("pointerenter", onFreeze);
        freezeEl?.removeEventListener("pointerleave", onThaw);
```

- [ ] **Step 4: Create `components/ui/velocity-marquee.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { MQ } from "@/lib/animation-constants";

type VelocityMarqueeProps = {
  items: string[];
  /** Cruise speed in % of one copy per second. */
  speed?: number;
  className?: string;
};

/**
 * Infinite ticker whose speed and direction follow scroll velocity, then decay back to
 * cruise. Position is integrated on GSAP's ticker and wrapped, so a direction flip never
 * stalls. Reduced motion: one static, wrapping copy.
 */
export function VelocityMarquee({ items, speed = 1.6, className = "" }: VelocityMarqueeProps) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        const setX = gsap.quickSetter(track.current, "xPercent");
        const setSkew = gsap.quickSetter(track.current, "skewX", "deg");
        // Two identical copies: wrapping between -50% and 0 loops seamlessly.
        const wrap = gsap.utils.wrap(-50, 0);
        const state = { pos: 0, dir: -1, boost: 0 };
        let visible = true;

        const st = ScrollTrigger.create({
          trigger: root.current,
          // Active from the ticker's top entering the viewport bottom until its bottom
          // leaves the top: the ticker only integrates while you can see it.
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (visible = self.isActive),
          onUpdate: (self) => {
            state.dir = self.direction === 1 ? -1 : 1;
            // 250px/s of scroll velocity = +1x speed, capped at +14x so a flick reads as a
            // gust, not a teleport.
            const kick = gsap.utils.clamp(0, 14, Math.abs(self.getVelocity()) / 250);
            state.boost = Math.max(state.boost, kick);
          },
        });

        const tick = (_t: number, dt: number) => {
          if (!visible) return;
          // Frame-rate independent exponential decay back to cruise speed.
          state.boost *= Math.pow(0.93, dt / 16.667);
          state.pos = wrap(state.pos + state.dir * (speed + state.boost * speed) * (dt / 1000));
          setX(state.pos);
          setSkew(state.dir * -state.boost * 0.5);
        };
        gsap.ticker.add(tick);

        return () => {
          gsap.ticker.remove(tick);
          st.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  const copy = (loop: boolean) => (
    <div
      data-copy={loop ? "loop" : "main"}
      aria-hidden={loop || undefined}
      className={`flex shrink-0 items-center motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:gap-y-3 motion-reduce:px-5 ${loop ? "motion-reduce:hidden" : ""}`}
    >
      {items.map((item, i) => (
        <span key={item} className="flex items-center">
          <span className={i % 2 ? "text-outline" : ""}>{item}</span>
          <span className="mx-[0.5em] inline-block size-[0.2em] rounded-full bg-neon" aria-hidden="true" />
        </span>
      ))}
    </div>
  );

  return (
    <div ref={root} data-marquee className={`overflow-hidden border-y border-line py-6 ${className}`}>
      <div
        ref={track}
        className="flex w-max font-display text-[clamp(1.8rem,5vw,4.5rem)] font-medium leading-none tracking-[-0.03em] will-change-transform motion-reduce:w-full motion-reduce:flex-wrap"
      >
        {copy(false)}
        {copy(true)}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Rewrite `components/hero.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MQ, SCROLL } from "@/lib/animation-constants";
import { PROJECTS } from "@/lib/projects";
import { PROFILE } from "@/lib/site";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ParticleField } from "@/components/ui/particle-field";

const LIVE_COUNT = PROJECTS.filter((p) => p.status === "Live").length;

/**
 * The thesis as motion. On load, characters rise out of masks. On scroll the hero pins
 * and every row slides away and dims, except "stop.", which holds still. Hovering
 * "stop." freezes the particle field behind it. Reduced motion: the final composition,
 * nothing pinned.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        const split = SplitText.create(".hero-row", { type: "chars", mask: "chars" });

        // expo.out: characters launch fast and feather in, so the headline lands heavy
        // without a slow tail. 0.028s per char sets a 30-char headline in ~0.85s.
        const intro = gsap.timeline({ defaults: { ease: EASE.expo } });
        intro
          .from(split.chars, { yPercent: 115, rotate: 8, duration: DURATION.hero, stagger: 0.028 })
          .from(".hero-meta > *", { y: 18, opacity: 0, duration: DURATION.slow, stagger: 0.07 }, 0.55)
          .from(".hero-bg", { opacity: 0, scale: 1.08, duration: 2 }, 0);

        // Pin from the hero's top at the viewport top for 70% of a screen of scroll.
        // Linear eases (EASE.scrub): the scroll position is already the easing.
        const out = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=70%",
            pin: true,
            scrub: SCROLL.scrub,
          },
        });
        gsap.utils.toArray<HTMLElement>(".hero-drift").forEach((el, i) => {
          // Alternate directions so the block tears apart instead of sliding as one.
          out.to(el, { xPercent: i % 2 ? 28 : -28, opacity: 0.12, ease: EASE.scrub }, 0);
        });
        out
          .to(".hero-meta", { y: -40, opacity: 0, ease: EASE.scrub }, 0)
          .to(".hero-bg", { opacity: 0.35, ease: EASE.scrub }, 0);
        // .hero-stop is deliberately absent from this timeline.

        return () => split.revert();
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="top"
      className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden px-4 pb-10 pt-28 sm:px-6 md:px-10 md:pb-14"
    >
      <div className="hero-bg absolute inset-0 -z-10">
        <ParticleField spacing={24} radius={190} freezeSelector=".hero-stop" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--color-ink)_85%)]" />
      </div>

      <h1 className="font-display text-[clamp(2.6rem,11.5vw,11.5rem)] font-medium leading-[0.9] tracking-[-0.045em]">
        <span className="sr-only">Systems that know when to stop.</span>
        <span aria-hidden="true" className="block">
          <span className="hero-row block overflow-hidden whitespace-nowrap pb-[0.06em]">
            <span className="hero-drift inline-block">Systems</span>
          </span>
          <span className="hero-row block overflow-hidden whitespace-nowrap pb-[0.06em]">
            <span className="hero-drift text-outline inline-block pl-[8vw]">that know</span>
          </span>
          <span className="hero-row block overflow-hidden whitespace-nowrap pb-[0.06em]">
            <span className="hero-drift inline-block">when to</span>{" "}
            <span className="hero-stop inline-block cursor-default text-neon">stop.</span>
          </span>
        </span>
      </h1>

      <div className="hero-meta mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <p className="max-w-md text-lg leading-snug text-mute md:text-xl">
          Six projects below. Each one is introduced by the thing it refuses to do, because
          that’s the decision that took the thinking.
        </p>
        <div className="flex flex-wrap items-center gap-8">
          <MagneticButton href="#work">
            See what they refuse <span aria-hidden="true">↓</span>
          </MagneticButton>
          <p className="label text-mute">
            {PROJECTS.length} projects · {LIVE_COUNT} deployed · graduating 2027
            <span className="hidden [@media(hover:hover)_and_(pointer:fine)]:inline"> · hover “stop.”</span>
          </p>
        </div>
      </div>
      <p className="sr-only">
        {PROFILE.name}, {PROFILE.place}, {PROFILE.study}.
      </p>
    </section>
  );
}
```

Note on the intro copy: it is the existing hero sentence with the trailing "The rest is implementation." dropped for length. Do not add new claims.

- [ ] **Step 6: Mount the ticker in `app/page.tsx`**

```tsx
import { Hero } from "@/components/hero";
import { Work } from "@/components/work";
import { Approach } from "@/components/approach";
import { About } from "@/components/about";
import { VelocityMarquee } from "@/components/ui/velocity-marquee";
import { PROJECTS } from "@/lib/projects";

export default function Home() {
  return (
    <>
      <Hero />
      {/* The six refusal headlines, verbatim, as a teaser for the walkthrough. */}
      <VelocityMarquee items={PROJECTS.map((p) => p.refuses.headline)} className="my-16 md:my-24" />
      <Work />
      <Approach />
      <About />
    </>
  );
}
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx playwright test tests/e2e/hero.spec.ts`
Expected: 4 passed. If the 375px test reports a row overflowing, lower the `11.5vw` in the `h1` clamp in steps of 0.5vw until it passes, and note the final value in the commit message.

- [ ] **Step 8: Lint, build, commit**

```bash
npm run lint
npm run build
git add -A
git commit -m "feat: kinetic hero where stop. holds still, and the refusal ticker"
```

---

### Task 5: Refusal scenes, project panels and the Try button

**Files:**
- Create: `components/scenes/starmatch.tsx`, `components/scenes/frontier.tsx`, `components/scenes/job-autopilot.tsx`, `components/scenes/codeauto.tsx`, `components/scenes/job-rag.tsx`, `components/scenes/memoryvault.tsx`, `components/scenes/index.ts`, `components/project-panel.tsx`
- Rewrite: `components/work.tsx` (stacked list; Task 6 adds the pinned track)
- Test: `tests/e2e/work-panels.spec.ts`

**Interfaces:**
- Consumes: `SceneKey`, `Project`, `PROJECTS` (Task 2); `SectionHeading` (Task 3); `gsap`, `ScrollTrigger`, `useGSAP`; `EASE`, `DURATION`, `STAGGER`, `MQ`.
- Produces:
  - Each scene file exports `XScene(): JSX.Element` (an `aria-hidden` SVG, viewBox `0 0 400 260`, markup in the final refused pose) and `playX(root: HTMLElement): gsap.core.Timeline`.
  - `SCENES: Record<SceneKey, { Scene: () => JSX.Element; play: (root: HTMLElement) => gsap.core.Timeline }>`
  - `runScene(stage: HTMLElement): gsap.core.Timeline`: kills any running timeline for that stage, sets `data-state="playing"`, back to `"refused"` on complete.
  - `ProjectPanel(props: { project: Project; index: number; total: number })` renders `article.wk-panel` containing `.wk-reveal` blocks, `[data-stage][data-scene=<slug>][data-state]`, a Try `<button>` named by `project.attempt`, and a `role="status"` line.
  - `Work()` renders `section#work` with `.wk-track` holding six panels.

- [ ] **Step 1: Write the failing test**

Create `tests/e2e/work-panels.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { PROJECTS } from "../../lib/projects";

// Phone viewport: stacked list mode, so every panel is reachable by normal scrolling.
test.use({ viewport: { width: 390, height: 844 } });

test("six panels, each with its quoted refusal and its own scene", async ({ page }) => {
  await page.goto("/");
  const panels = page.locator("#work article.wk-panel");
  await expect(panels).toHaveCount(6);
  for (const [i, p] of PROJECTS.entries()) {
    const panel = panels.nth(i);
    await expect(panel.getByRole("heading", { level: 3 })).toHaveText(p.name);
    await expect(panel).toContainText(p.refuses.headline);
    await expect(panel).toContainText(p.refuses.detail);
    const stage = panel.locator("[data-stage]");
    await expect(stage).toHaveAttribute("data-scene", p.slug);
    await expect(stage.locator("svg[aria-hidden='true']")).toHaveCount(1);
  }
  // The hazard stripe lives on refusal bands only: exactly one per panel, none elsewhere.
  await expect(page.locator(".hazard")).toHaveCount(6);
  await expect(page.locator("#work .wk-panel .hazard")).toHaveCount(6);
});

test("pressing Try replays the refusal and announces it", async ({ page }) => {
  await page.goto("/");
  const panel = page.locator("#work article.wk-panel").first();
  const status = panel.getByRole("status");
  await expect(status).toHaveText("");

  await panel.getByRole("button", { name: "Upload my photo" }).click();
  await expect(status).toHaveText("Refused. It won’t upload your photo.");
  await expect(panel.locator("[data-stage]")).toHaveAttribute("data-state", "playing");
  await expect(panel.locator("[data-stage]")).toHaveAttribute("data-state", "refused", {
    timeout: 5000,
  });
});

test("mashing Try never stacks timelines", async ({ page }) => {
  await page.goto("/");
  const panel = page.locator("#work article.wk-panel").nth(2); // Job Autopilot
  const button = panel.getByRole("button", { name: "Submit it for me" });
  for (let i = 0; i < 5; i++) await button.click({ delay: 20 });

  await expect(panel.getByRole("status")).toHaveText("Refused ×5. It won’t submit the application.");
  const stage = panel.locator("[data-stage]");
  await expect(stage).toHaveAttribute("data-state", "refused", { timeout: 5000 });
  // Final pose: the card sits in the review queue with no leftover transform.
  const cardTransform = await stage
    .locator(".ja-card")
    .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform));
  expect(Math.abs(cardTransform.e)).toBeLessThan(0.5);
  expect(Math.abs(cardTransform.f)).toBeLessThan(0.5);
});

test("reduced motion: Try still answers, scene stays in its final pose", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const panel = page.locator("#work article.wk-panel").nth(3); // CodeAuto
  await panel.getByRole("button", { name: "Run the workflow" }).click();
  await expect(panel.getByRole("status")).toHaveText(
    "Refused. It won’t run a workflow that doesn’t check out.",
  );
  await expect(panel.locator("[data-stage]")).toHaveAttribute("data-state", "refused");
  await expect(panel.locator(".ca-issue")).toBeVisible();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/e2e/work-panels.spec.ts`
Expected: FAIL. No `article.wk-panel` elements exist.

- [ ] **Step 3: Create `components/scenes/starmatch.tsx`**

```tsx
import { gsap } from "@/lib/gsap";
import { EASE } from "@/lib/animation-constants";

const MONO = { fontSize: 9, letterSpacing: 1.6, className: "fill-mute font-mono" } as const;

/**
 * StarMatch refuses to upload your photo: there is no endpoint. The photo runs for the
 * network, hits the edge of the browser tab and springs back; the endpoint box is struck
 * out. Markup is the final pose.
 */
export function StarmatchScene() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true" focusable="false">
      <rect x="24" y="28" width="236" height="204" rx="14" className="fill-ink-3 stroke-bone/40" strokeWidth="1.5" />
      <line x1="24" y1="56" x2="260" y2="56" className="stroke-bone/20" />
      {[40, 54, 68].map((cx) => (
        <circle key={cx} cx={cx} cy="42" r="3.5" className="fill-bone/25" />
      ))}
      <text x="142" y="220" textAnchor="middle" {...MONO}>
        YOUR BROWSER TAB
      </text>
      <g className="sm-photo">
        <rect x="104" y="80" width="76" height="96" rx="8" className="fill-neon" />
        <circle cx="142" cy="116" r="15" className="fill-ink" />
        <path d="M116 168c6-20 46-20 52 0" className="fill-ink" />
      </g>
      <path d="M268 128h38" className="stroke-bone/30" strokeWidth="1.5" strokeDasharray="4 5" />
      <rect x="312" y="94" width="68" height="68" rx="10" className="fill-none stroke-bone/30" strokeWidth="1.5" strokeDasharray="4 4" />
      <text x="346" y="182" textAnchor="middle" {...MONO}>
        NO ENDPOINT
      </text>
      <path className="sm-x stroke-neon" d="M334 116l24 24M358 116l-24 24" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function playStarmatch(root: HTMLElement) {
  const q = gsap.utils.selector(root);
  const photo = q(".sm-photo");
  // The photo's right edge sits at x=180 and the tab wall at x=260: 70 units of travel
  // leaves 10 for the squash to close, so it visibly hits the wall.
  return (
    gsap
      .timeline()
      .set(q(".sm-x"), { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" })
      // power3.in: accelerates into the wall, which is what makes the impact read.
      .to(photo, { x: 70, duration: 0.55, ease: EASE.in })
      .to(photo, { scaleX: 0.86, transformOrigin: "100% 50%", duration: 0.1, ease: "power1.out" })
      // Elastic spring home: the refusal has recoil.
      .to(photo, { x: 0, scaleX: 1, duration: 1.2, ease: EASE.spring })
      // snapBack overshoots ~3% so the X lands like a stamp.
      .to(q(".sm-x"), { opacity: 1, scale: 1, duration: 0.45, ease: EASE.snapBack }, "<")
  );
}
```

- [ ] **Step 4: Create `components/scenes/frontier.tsx`**

```tsx
import { gsap } from "@/lib/gsap";
import { EASE } from "@/lib/animation-constants";

const MONO = { fontSize: 9, letterSpacing: 1.6, className: "fill-mute font-mono" } as const;
const TOP = 44;
const H = 150;
const W = 56;

/**
 * Illustrative levels only; no numbers are printed. Labels are the three floors named in
 * the refusal detail: term coverage, reranker score, grounding score.
 */
const METERS = [
  { x: 64, label: "TERMS", fill: 0.78, floor: 0.5 },
  { x: 172, label: "RERANK", fill: 0.66, floor: 0.42 },
  { x: 280, label: "GROUNDING", fill: 0.32, floor: 0.56 },
];

/** Frontier won't answer on weak evidence: three floors, one missed, and it says which. */
export function FrontierScene() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true" focusable="false">
      {METERS.map((m) => {
        const fh = m.fill * H;
        const floorY = TOP + H - m.floor * H;
        const missed = m.fill < m.floor;
        return (
          <g key={m.label}>
            <rect x={m.x} y={TOP} width={W} height={H} rx="6" className="fill-ink-3 stroke-bone/20" />
            <rect
              className={`fr-fill ${missed ? "fill-bone/35" : "fill-neon"}`}
              x={m.x}
              y={TOP + H - fh}
              width={W}
              height={fh}
              rx="6"
            />
            <line
              x1={m.x - 8}
              x2={m.x + W + 8}
              y1={floorY}
              y2={floorY}
              className="stroke-neon-2"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
            <text x={m.x + W / 2} y={TOP + H + 22} textAnchor="middle" {...MONO}>
              {m.label}
            </text>
          </g>
        );
      })}
      <g className="fr-verdict">
        <rect x="226" y="8" width="164" height="24" rx="12" className="fill-neon" />
        <text x="308" y="24" textAnchor="middle" fontSize="9" letterSpacing="1.4" className="fill-ink font-mono">
          MISSED: GROUNDING
        </text>
      </g>
    </svg>
  );
}

export function playFrontier(root: HTMLElement) {
  const q = gsap.utils.selector(root);
  return (
    gsap
      .timeline()
      .set(q(".fr-verdict"), { opacity: 0, y: 8 })
      // expo.out: levels shoot up and settle, like a reading stabilising. Staggered so
      // the eye checks each floor in turn and reaches grounding last.
      .fromTo(
        q(".fr-fill"),
        { scaleY: 0 },
        { scaleY: 1, transformOrigin: "50% 100%", duration: 0.9, ease: EASE.expo, stagger: 0.18 },
      )
      .to(q(".fr-verdict"), { opacity: 1, y: 0, duration: 0.4, ease: EASE.out }, "-=0.2")
  );
}
```

- [ ] **Step 5: Create `components/scenes/job-autopilot.tsx`**

```tsx
import { gsap } from "@/lib/gsap";
import { EASE } from "@/lib/animation-constants";

const MONO = { fontSize: 9, letterSpacing: 1.6, className: "fill-mute font-mono" } as const;

/**
 * Job Autopilot won't submit: the application heads for Submit, a gate drops, and it
 * lands in the human review queue instead. Final pose: card in the queue.
 * Card home is (168,180); on the track it sits at (30,66), an offset of (-138,-114).
 */
export function JobAutopilotScene() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true" focusable="false">
      <line x1="24" y1="86" x2="376" y2="86" className="stroke-bone/20" strokeWidth="1.5" />
      <rect x="300" y="66" width="76" height="40" rx="8" className="fill-none stroke-bone/40" strokeDasharray="4 4" />
      <text x="338" y="90" textAnchor="middle" {...MONO}>
        SUBMIT
      </text>
      <g className="ja-gate">
        <rect x="278" y="46" width="10" height="80" rx="3" className="fill-neon" />
      </g>
      <rect x="150" y="168" width="226" height="64" rx="10" className="fill-ink-3 stroke-bone/30" />
      <text x="263" y="252" textAnchor="middle" {...MONO}>
        HUMAN REVIEW QUEUE
      </text>
      {[242, 306].map((x) => (
        <rect key={x} x={x} y="180" width="56" height="40" rx="6" className="fill-bone/15" />
      ))}
      <g className="ja-card">
        <rect x="168" y="180" width="64" height="40" rx="6" className="fill-bone" />
        <rect x="176" y="190" width="36" height="4" rx="2" className="fill-ink/60" />
        <rect x="176" y="199" width="46" height="4" rx="2" className="fill-ink/35" />
        <rect x="176" y="208" width="28" height="4" rx="2" className="fill-ink/35" />
      </g>
    </svg>
  );
}

export function playJobAutopilot(root: HTMLElement) {
  const q = gsap.utils.selector(root);
  const card = q(".ja-card");
  const gate = q(".ja-gate");
  return (
    gsap
      .timeline()
      .set(gate, { y: -60, opacity: 0 })
      // power2.inOut: the card sets off and slows on approach, as if it saw the gate.
      // x 38 puts its right edge at 270, just short of the gate at 278.
      .fromTo(card, { x: -138, y: -114 }, { x: 38, duration: 0.9, ease: "power2.inOut" })
      // The gate drops mid-approach; snapBack overshoot makes it slam.
      .to(gate, { y: 0, opacity: 1, duration: 0.35, ease: EASE.snapBack }, 0.4)
      // expo.out into the queue: a decisive re-route, not a drift.
      .to(card, { x: 0, y: 0, duration: 0.7, ease: EASE.expo }, "+=0.15")
  );
}
```

- [ ] **Step 6: Create `components/scenes/codeauto.tsx`**

```tsx
import { gsap } from "@/lib/gsap";
import { EASE } from "@/lib/animation-constants";

const MONO = { fontSize: 9, letterSpacing: 1.6, className: "fill-mute font-mono" } as const;

function Node({ x, y, label, className = "" }: { x: number; y: number; label: string; className?: string }) {
  return (
    <g className={className}>
      <rect x={x} y={y} width="84" height="40" rx="8" className="fill-ink-3 stroke-bone/50" strokeWidth="1.5" />
      <text x={x + 42} y={y + 24} textAnchor="middle" {...MONO} className="fill-bone font-mono">
        {label}
      </text>
    </g>
  );
}

/**
 * CodeAuto won't run a workflow that doesn't check out. A run signal leaves Start, dies
 * at the gap before End, the margin numbers the issue and the offending node is selected.
 * Final pose: issue visible, End selected, signal gone.
 */
export function CodeautoScene() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true" focusable="false">
      <Node x={30} y={60} label="START" />
      <Node x={158} y={60} label="TASK" />
      <line x1="114" y1="80" x2="158" y2="80" className="stroke-bone/60" strokeWidth="1.5" />
      <path d="M242 80h24v70" className="fill-none stroke-bone/30" strokeWidth="1.5" strokeDasharray="4 5" />
      <g className="ca-end">
        <rect className="ca-select stroke-neon" x="284" y="170" width="96" height="52" rx="11" fill="none" strokeWidth="2" />
        <Node x={290} y={176} label="END" />
      </g>
      <circle className="ca-pulse fill-neon" cx="114" cy="80" r="5" opacity="0" />
      <g className="ca-issue">
        <rect x="18" y="170" width="236" height="52" rx="10" className="fill-ink-3 stroke-line" />
        <circle cx="40" cy="196" r="10" className="fill-neon" />
        <text x="40" y="199.5" textAnchor="middle" fontSize="10" className="fill-ink font-mono">
          1
        </text>
        <text x="58" y="199" {...MONO} className="fill-bone font-mono">
          NODE IS NOT CONNECTED
        </text>
      </g>
    </svg>
  );
}

export function playCodeauto(root: HTMLElement) {
  const q = gsap.utils.selector(root);
  const pulse = q(".ca-pulse");
  return (
    gsap
      .timeline()
      .set(pulse, { x: 0, y: 0, scale: 1, opacity: 1, transformOrigin: "50% 50%" })
      .set(q(".ca-issue"), { opacity: 0, x: -10 })
      .set(q(".ca-select"), { opacity: 0 })
      // power1.inOut on each leg: a signal travelling a wire, steady with soft corners.
      .to(pulse, { x: 44, duration: 0.3, ease: "power1.inOut" })
      .to(pulse, { x: 152, duration: 0.45, ease: "power1.inOut" })
      .to(pulse, { y: 70, duration: 0.3, ease: "power1.inOut" })
      // The signal hits the gap and dissipates.
      .to(pulse, { opacity: 0, scale: 2.4, duration: 0.3, ease: EASE.out })
      .to(q(".ca-issue"), { opacity: 1, x: 0, duration: 0.4, ease: EASE.out })
      .to(q(".ca-end"), { keyframes: { x: [0, -6, 6, -4, 3, 0] }, duration: 0.45, ease: "power1.out" }, "<")
      .to(q(".ca-select"), { opacity: 1, duration: 0.25, ease: EASE.out }, "<0.2")
  );
}
```

- [ ] **Step 7: Create `components/scenes/job-rag.tsx`**

```tsx
import { gsap } from "@/lib/gsap";
import { EASE } from "@/lib/animation-constants";

const MONO = { fontSize: 9, letterSpacing: 1.6, className: "fill-mute font-mono" } as const;
const ROW = 42;
const TOP = 18;

/**
 * `from` is the row's slot before pruning, `to` after. Stale rows are drawn in their
 * original slot at opacity 0; fresh rows are drawn in their final slot and carry the
 * distance they close up as `data-shift`. Ages are illustrative, placed either side of
 * the documented 48-hour cut.
 */
const LISTINGS = [
  { age: "2H", stale: false, from: 0, to: 0 },
  { age: "11H", stale: false, from: 1, to: 1 },
  { age: "49H", stale: true, from: 2, to: 2 },
  { age: "20H", stale: false, from: 3, to: 2 },
  { age: "73H", stale: true, from: 4, to: 4 },
];

/** JobMatch RAG won't serve a stale listing: anything past 48 hours drops out of the index. */
export function JobRagScene() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true" focusable="false">
      {LISTINGS.map((l) => (
        // Outer <g> owns the slot; GSAP animates only the inner <g>, which has no
        // transform attribute for it to overwrite.
        <g key={l.age} transform={`translate(0 ${TOP + (l.stale ? l.from : l.to) * ROW})`}>
          <g
            className={l.stale ? "jr-stale" : l.from !== l.to ? "jr-shift" : undefined}
            data-shift={(l.from - l.to) * ROW}
            opacity={l.stale ? 0 : 1}
          >
            <rect x="40" y="0" width="320" height="34" rx="8" className="fill-ink-3 stroke-line" />
            <rect x="54" y="10" width="120" height="5" rx="2.5" className="fill-bone/60" />
            <rect x="54" y="20" width="80" height="4" rx="2" className="fill-bone/25" />
            <text x="344" y="21" textAnchor="end" {...MONO} className={`font-mono ${l.stale ? "fill-neon" : "fill-mute"}`}>
              {l.age}
            </text>
          </g>
        </g>
      ))}
      <text className="jr-note" x="200" y="248" textAnchor="middle" {...MONO}>
        PRUNED ON INGEST · OLDER THAN 48 HOURS
      </text>
    </svg>
  );
}

export function playJobRag(root: HTMLElement) {
  const q = gsap.utils.selector(root);
  return (
    gsap
      .timeline()
      .set(q(".jr-note"), { opacity: 0 })
      // fromTo renders its from-state immediately, so at t=0 the full list is showing.
      // power3.in: stale rows fall away with gravity.
      .fromTo(
        q(".jr-stale"),
        { opacity: 1, y: 0 },
        { opacity: 0, y: 18, duration: 0.45, ease: EASE.in, stagger: 0.12 },
        0.5,
      )
      // expo.out: the survivors close ranks quickly and settle.
      .fromTo(
        q(".jr-shift"),
        { y: (_i: number, el: SVGGElement) => Number(el.dataset.shift) },
        { y: 0, duration: 0.6, ease: EASE.expo },
      )
      .to(q(".jr-note"), { opacity: 1, duration: 0.3, ease: EASE.out }, "<")
  );
}
```

- [ ] **Step 8: Create `components/scenes/memoryvault.tsx`**

```tsx
import { gsap } from "@/lib/gsap";
import { EASE } from "@/lib/animation-constants";

const MONO = { fontSize: 9, letterSpacing: 1.6, className: "fill-mute font-mono" } as const;

const BUBBLES = [
  { x: 20, y: 40, w: 150 },
  { x: 60, y: 76, w: 130 },
  { x: 20, y: 112, w: 120 },
  { x: 50, y: 148, w: 150 },
  { x: 20, y: 184, w: 100 },
];

/** Chips use the three kinds of memory named in the blurb. */
const FACTS = [
  { y: 74, label: "FACT" },
  { y: 118, label: "PREFERENCE" },
  { y: 162, label: "PROJECT" },
];

/**
 * MemoryVault won't call the scrollback buffer memory: the chat scrolls away and fades,
 * and what survives is distilled into the vault. Final pose: faded chat, full vault.
 */
export function MemoryvaultScene() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true" focusable="false">
      {BUBBLES.map((b) => (
        <rect key={b.y} className="mv-bubble fill-bone/25" x={b.x} y={b.y} width={b.w} height="24" rx="12" opacity="0.14" />
      ))}
      <text x="110" y="236" textAnchor="middle" {...MONO}>
        SCROLLBACK
      </text>
      <rect x="232" y="40" width="150" height="180" rx="14" className="fill-ink-3 stroke-neon" strokeWidth="1.5" />
      <text x="307" y="60" textAnchor="middle" {...MONO} className="fill-neon font-mono">
        VAULT
      </text>
      {FACTS.map((f) => (
        <g key={f.label} className="mv-fact">
          <rect x="248" y={f.y} width="118" height="30" rx="8" className="fill-neon" />
          <text x="307" y={f.y + 19} textAnchor="middle" fontSize="9" letterSpacing="1.4" className="fill-ink font-mono">
            {f.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function playMemoryvault(root: HTMLElement) {
  const q = gsap.utils.selector(root);
  return (
    gsap
      .timeline()
      // power3.in: the conversation slides up and out like a buffer being discarded.
      .fromTo(
        q(".mv-bubble"),
        { opacity: 1, y: 0 },
        { opacity: 0.14, y: -14, duration: 0.5, ease: EASE.in, stagger: 0.08 },
        0.6,
      )
      // snapBack: each distilled fact lands in the vault with a small overshoot, so it
      // reads as kept.
      .fromTo(
        q(".mv-fact"),
        { x: -150, opacity: 0, scale: 0.7 },
        { x: 0, opacity: 1, scale: 1, transformOrigin: "50% 50%", duration: 0.7, ease: EASE.snapBack, stagger: 0.14 },
        0.4,
      )
  );
}
```

- [ ] **Step 9: Create `components/scenes/index.ts`**

```ts
import type { JSX } from "react";
import type { SceneKey } from "@/lib/projects";
import type { gsap } from "@/lib/gsap";
import { StarmatchScene, playStarmatch } from "./starmatch";
import { FrontierScene, playFrontier } from "./frontier";
import { JobAutopilotScene, playJobAutopilot } from "./job-autopilot";
import { CodeautoScene, playCodeauto } from "./codeauto";
import { JobRagScene, playJobRag } from "./job-rag";
import { MemoryvaultScene, playMemoryvault } from "./memoryvault";

type SceneDef = {
  Scene: () => JSX.Element;
  play: (root: HTMLElement) => gsap.core.Timeline;
};

export const SCENES: Record<SceneKey, SceneDef> = {
  starmatch: { Scene: StarmatchScene, play: playStarmatch },
  "frontier-platform": { Scene: FrontierScene, play: playFrontier },
  "job-autopilot": { Scene: JobAutopilotScene, play: playJobAutopilot },
  codeaut0: { Scene: CodeautoScene, play: playCodeauto },
  "job-rag": { Scene: JobRagScene, play: playJobRag },
  "memoryvault-ai": { Scene: MemoryvaultScene, play: playMemoryvault },
};

const running = new WeakMap<HTMLElement, gsap.core.Timeline>();

/**
 * Plays a stage's refusal. Any timeline already running on that stage is killed first,
 * so repeated presses restart cleanly instead of stacking. Every play() starts with
 * set()/fromTo() for its initial pose, so a restart from a half-finished pose is safe.
 * Call from inside a GSAP context (useGSAP or contextSafe) so it is reverted on unmount.
 */
export function runScene(stage: HTMLElement) {
  const key = stage.dataset.scene as SceneKey;
  running.get(stage)?.kill();
  stage.dataset.state = "playing";
  const tl = SCENES[key].play(stage);
  tl.eventCallback("onComplete", () => {
    stage.dataset.state = "refused";
  });
  running.set(stage, tl);
  return tl;
}
```

- [ ] **Step 10: Create `components/project-panel.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Ban } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { EASE, MQ } from "@/lib/animation-constants";
import type { Project } from "@/lib/projects";
import { SCENES, runScene } from "@/components/scenes";

type ProjectPanelProps = { project: Project; index: number; total: number };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * One project: copy on the left, the stage on the right. The Try button asks the system
 * for the thing it refuses; the scene replays the refusal, the button shakes "no" and the
 * status line announces it (aria-live), counting repeat attempts.
 */
export function ProjectPanel({ project, index, total }: ProjectPanelProps) {
  const panel = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [tries, setTries] = useState(0);
  const { Scene } = SCENES[project.slug];
  const { contextSafe } = useGSAP({ scope: panel });

  const attempt = contextSafe(() => {
    setTries((n) => n + 1);
    if (window.matchMedia(MQ.reduce).matches) return;
    runScene(stage.current!);
    // A head-shake: decaying keyframes, power2.out so the last wobble is the smallest.
    gsap.fromTo(
      button.current,
      { x: 0 },
      { keyframes: { x: [0, -10, 9, -6, 4, 0] }, duration: 0.5, ease: "power2.out", overwrite: true },
    );
  });

  const status =
    tries === 0 ? "" : `Refused${tries > 1 ? ` ×${tries}` : ""}. ${project.refuses.headline}`;

  return (
    <article
      ref={panel}
      aria-labelledby={`${project.slug}-name`}
      className="wk-panel group/panel relative walk:h-full walk:w-[88vw] walk:shrink-0 walk:px-10 walk:pb-10 walk:pt-28"
    >
      <div className="grid gap-8 walk:h-full walk:grid-cols-[1fr_1.1fr] walk:gap-12">
        <div className="flex flex-col gap-5">
          <p className="wk-reveal label flex flex-wrap items-center gap-3 text-mute">
            <span className="text-neon">
              {pad(index + 1)} / {pad(total)}
            </span>
            <span>{project.domain}</span>
            <span className="rounded-full border border-line px-2 py-0.5">{project.status}</span>
          </p>
          <h3
            id={`${project.slug}-name`}
            className="wk-reveal font-display text-[clamp(2.4rem,5vw,4.8rem)] font-medium leading-[0.92] tracking-[-0.04em]"
          >
            {project.name}
          </h3>
          <p className="wk-reveal max-w-xl text-base leading-relaxed text-mute">{project.blurb}</p>

          {/* The refusal band. The only place on the site the hazard stripe appears. */}
          <div className="wk-reveal overflow-hidden rounded-2xl border border-line bg-ink-2">
            <div className="hazard hazard-live h-2" aria-hidden="true" />
            <div className="p-5">
              <p className="label flex items-center gap-2 text-neon">
                <Ban size={13} aria-hidden="true" /> Refuses
              </p>
              <p className="mt-2 font-display text-[clamp(1.35rem,2.2vw,1.9rem)] font-medium leading-tight tracking-[-0.02em]">
                {project.refuses.headline}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-mute">{project.refuses.detail}</p>
            </div>
          </div>

          <div className="wk-reveal flex flex-wrap gap-x-8 gap-y-3">
            <ul className="space-y-1">
              {project.facts.map((fact) => (
                <li key={fact} className="label flex gap-2">
                  <span aria-hidden="true" className="text-neon">
                    —
                  </span>
                  {fact}
                </li>
              ))}
            </ul>
            <p className="font-mono text-xs leading-relaxed text-mute">{project.stack.join(" · ")}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 walk:justify-center">
          <div className="wk-reveal mesh overflow-hidden rounded-3xl border border-line bg-ink-2">
            <div
              ref={stage}
              data-stage
              data-scene={project.slug}
              data-state="refused"
              className="aspect-[400/260] w-full p-4 text-bone"
            >
              <Scene />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4">
              <button
                ref={button}
                type="button"
                onClick={attempt}
                className="label rounded-full bg-bone px-5 py-3 text-ink transition-colors duration-300 hover:bg-neon"
              >
                {project.attempt}
              </button>
              <p role="status" className="label min-h-[1em] text-neon">
                {status}
              </p>
            </div>
          </div>
          <div className="wk-reveal flex flex-wrap gap-3">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer noopener"
                className="label inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 transition-colors hover:border-neon hover:text-neon"
              >
                Live <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            )}
            <a
              href={project.source}
              target="_blank"
              rel="noreferrer noopener"
              className="label inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 transition-colors hover:border-neon hover:text-neon"
            >
              Source <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 11: Rewrite `components/work.tsx` (stacked list)**

```tsx
"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MQ, STAGGER } from "@/lib/animation-constants";
import { PROJECTS } from "@/lib/projects";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectPanel } from "@/components/project-panel";
import { runScene } from "@/components/scenes";

export function Work() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        gsap.utils.toArray<HTMLElement>(".wk-panel").forEach((panel) => {
          // Blocks settle up as the panel's top crosses 85% of the viewport: visible but
          // not yet at the fold. power3.out lands them without bounce.
          gsap.from(panel.querySelectorAll(".wk-reveal"), {
            y: 32,
            opacity: 0,
            duration: DURATION.base,
            ease: EASE.out,
            stagger: STAGGER.items,
            scrollTrigger: { trigger: panel, start: "top 85%", toggleActions: "play none none none" },
          });
          // The scene acts out its refusal once, when the stage is 70% down the screen,
          // i.e. comfortably in view. The Try button replays it after that.
          const stage = panel.querySelector<HTMLElement>("[data-stage]")!;
          ScrollTrigger.create({ trigger: stage, start: "top 70%", once: true, onEnter: () => runScene(stage) });
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="work" className="relative scroll-mt-16">
      <div className="px-4 pb-10 sm:px-6 md:px-10">
        <SectionHeading
          index="01"
          eyebrow="Selected work"
          title="Six systems, and what each one won’t do."
          lede="Every refusal below is a documented decision in that project’s own README or agent context. Press the button on each one and ask it anyway."
        />
      </div>
      <div className="wk-track relative flex flex-col gap-24 px-4 py-16 sm:px-6 md:px-10">
        {PROJECTS.map((project, i) => (
          <ProjectPanel key={project.slug} project={project} index={i} total={PROJECTS.length} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 12: Run the tests to verify they pass**

Run: `npx playwright test tests/e2e/work-panels.spec.ts`
Expected: 4 passed.

- [ ] **Step 13: Lint, build, commit**

```bash
npm run lint
npm run build
git add -A
git commit -m "feat: six refusal scenes with a Try button on every project"
```

---

### Task 6: Pinned horizontal walkthrough

**Files:**
- Rewrite: `components/work.tsx`
- Test: `tests/e2e/walkthrough.spec.ts`

**Interfaces:**
- Consumes: `ProjectPanel`, `runScene` (Task 5); `useLenis` (Task 1); `MQ.walkthrough`, `MQ.stacked`, the `walk:` variant (Task 1).
- Produces: in walkthrough mode `#work .wk-pin` is pinned (wrapped in `.pin-spacer`) and `.wk-track` translates on x. HUD hooks `.wk-digits`, `.wk-progress`.

- [ ] **Step 1: Write the failing test**

Create `tests/e2e/walkthrough.spec.ts`:

```ts
import { test, expect, type Page } from "@playwright/test";

const workPinned = (page: Page) => page.locator("#work .pin-spacer");

test.describe("desktop 1440×900", () => {
  test("work pins and vertical scroll drives the track sideways", async ({ page }) => {
    await page.goto("/");
    await expect(workPinned(page)).toHaveCount(1);
    await page.locator("#work").scrollIntoViewIfNeeded();
    const track = page.locator("#work .wk-track");
    const x0 = await track.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).e);
    await page.mouse.wheel(0, 1500);
    await expect
      .poll(async () => track.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).e))
      .toBeLessThan(x0 - 300);
  });

  test("tabbing into panel six brings it on screen", async ({ page }) => {
    await page.goto("/");
    const source = page.locator("#work article.wk-panel").nth(5).getByRole("link", { name: /Source/ });
    await source.focus();
    await expect(source).toBeFocused();
    await expect(source).toBeInViewport({ ratio: 1 });
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(page.locator("#work article.wk-panel").nth(5).getByRole("button")).toBeInViewport();
  });
});

test("1024×700: every panel's content fits its screen", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 700 });
  await page.goto("/");
  await expect(workPinned(page)).toHaveCount(1);
  const overflows = await page
    .locator("#work article.wk-panel")
    .evaluateAll((panels) => panels.map((p) => p.scrollHeight - p.clientHeight));
  for (const o of overflows) expect(o).toBeLessThanOrEqual(1);
});

test("1280×640: too short to pin, so it falls back to the list", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 640 });
  await page.goto("/");
  await expect(workPinned(page)).toHaveCount(0);
  await expect(page.locator("#work article.wk-panel")).toHaveCount(6);
});

test("reduced motion: plain list, nothing pinned anywhere", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  const tops = await page
    .locator("#work article.wk-panel")
    .evaluateAll((panels) => panels.map((p) => p.getBoundingClientRect().top));
  for (let i = 1; i < tops.length; i++) expect(tops[i]).toBeGreaterThan(tops[i - 1]);
});

test("no JavaScript: every refusal is still on the page", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("#work article.wk-panel")).toHaveCount(6);
  await expect(page.getByText("It won’t upload your photo.").first()).toBeVisible();
  await context.close();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/e2e/walkthrough.spec.ts`
Expected: FAIL. The desktop pin test and the 1024×700 test find no `.pin-spacer`.

- [ ] **Step 3: Rewrite `components/work.tsx` with both modes**

```tsx
"use client";

import { useEffect, useRef } from "react";
import type Lenis from "lenis";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MQ, SCROLL, STAGGER } from "@/lib/animation-constants";
import { PROJECTS } from "@/lib/projects";
import { useLenis } from "@/components/lenis-provider";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectPanel } from "@/components/project-panel";
import { runScene } from "@/components/scenes";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Six projects, one screen each.
 * Walkthrough (MQ.walkthrough + motion): the pin wrapper pins and vertical scroll drives
 * the inner track sideways; each panel's blocks and scene play as it arrives.
 * Stacked (smaller or shorter screens): a vertical list with scroll reveals.
 * Reduced motion: the same list, final state, no triggers.
 */
export function Work() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  // Read inside the focus handler without rebuilding the pin when Lenis mounts.
  const lenisRef = useRef<Lenis | null>(null);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        { walk: `${MQ.walkthrough} and ${MQ.motion}`, stack: `${MQ.stacked} and ${MQ.motion}` },
        (ctx) => {
          const { walk } = ctx.conditions as { walk: boolean; stack: boolean };
          const panels = gsap.utils.toArray<HTMLElement>(".wk-panel");
          const stageOf = (panel: HTMLElement) => panel.querySelector<HTMLElement>("[data-stage]")!;

          if (!walk) {
            panels.forEach((panel) => {
              // See Task 5: reveal at 85%, play the scene at 70%.
              gsap.from(panel.querySelectorAll(".wk-reveal"), {
                y: 32,
                opacity: 0,
                duration: DURATION.base,
                ease: EASE.out,
                stagger: STAGGER.items,
                scrollTrigger: { trigger: panel, start: "top 85%", toggleActions: "play none none none" },
              });
              ScrollTrigger.create({
                trigger: stageOf(panel),
                start: "top 70%",
                once: true,
                onEnter: () => runScene(stageOf(panel)),
              });
            });
            return;
          }

          const el = root.current!;
          const setProgress = gsap.quickSetter(el.querySelector(".wk-progress"), "scaleX");
          const digits = el.querySelector(".wk-digits");
          let current = -1;
          const distance = () => track.current!.scrollWidth - window.innerWidth;

          // Linear x tween scrubbed by scroll (EASE.scrub): scroll position is the easing.
          // Pins when the wrapper's top meets the viewport top and holds for exactly the
          // track's overflow width, so the last panel ends flush with the right edge.
          const scroller = gsap.to(track.current, {
            x: () => -distance(),
            ease: EASE.scrub,
            scrollTrigger: {
              trigger: pin.current,
              pin: true,
              scrub: SCROLL.scrub,
              start: "top top",
              end: () => `+=${distance()}`,
              invalidateOnRefresh: true,
              anticipatePin: 1,
              onUpdate: (self) => {
                setProgress(self.progress);
                const step = Math.min(panels.length - 1, Math.round(self.progress * (panels.length - 1)));
                if (step !== current) {
                  current = step;
                  // expo.out: the counter snaps to the new digit and feathers in.
                  gsap.to(digits, {
                    yPercent: (-100 / panels.length) * step,
                    duration: DURATION.base,
                    ease: EASE.expo,
                    overwrite: true,
                  });
                }
              },
            },
          });

          panels.forEach((panel, i) => {
            if (i > 0) {
              // Scrubbed against the horizontal track via containerAnimation: blocks rise
              // as the panel's left edge moves from 85% to 35% of the viewport width.
              gsap.from(panel.querySelectorAll(".wk-reveal"), {
                y: 40,
                opacity: 0,
                stagger: STAGGER.items,
                ease: EASE.scrub,
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: scroller,
                  start: "left 85%",
                  end: "left 35%",
                  scrub: true,
                },
              });
            }
            // Play once when the panel's left edge passes 55% of the screen, i.e. when it
            // owns most of the viewport. Panel one is already there at pin start.
            ScrollTrigger.create({
              trigger: panel,
              containerAnimation: scroller,
              start: "left 55%",
              once: true,
              onEnter: () => runScene(stageOf(panel)),
            });
          });

          // Keyboard: focus inside an off-screen panel scrolls the page to the point where
          // that panel is on screen. overflow-clip on the pin stops the browser from
          // scrolling the wrapper sideways itself.
          const onFocus = (e: FocusEvent) => {
            const panel = (e.target as HTMLElement).closest<HTMLElement>(".wk-panel");
            const st = scroller.scrollTrigger;
            if (!panel || !st) return;
            const progress = gsap.utils.clamp(0, 1, panel.offsetLeft / distance());
            const y = st.start + progress * (st.end - st.start);
            if (Math.abs(window.scrollY - y) < 4) return;
            if (lenisRef.current) lenisRef.current.scrollTo(y, { immediate: true });
            else window.scrollTo(0, y);
            // Skip the scrub lag so the focused element is on screen now, not in 0.8s.
            scroller.progress(progress);
          };
          const t = track.current!;
          t.addEventListener("focusin", onFocus);
          return () => t.removeEventListener("focusin", onFocus);
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="work" className="relative scroll-mt-16">
      <div className="px-4 pb-10 sm:px-6 md:px-10">
        <SectionHeading
          index="01"
          eyebrow="Selected work"
          title="Six systems, and what each one won’t do."
          lede="Every refusal below is a documented decision in that project’s own README or agent context. Press the button on each one and ask it anyway."
        />
      </div>

      <div ref={pin} className="wk-pin relative walk:h-svh walk:overflow-clip">
        {/* HUD: walkthrough mode only. */}
        <div className="label pointer-events-none absolute inset-x-0 top-0 z-20 hidden items-center justify-between px-10 pt-16 text-mute walk:flex">
          <span>Keep scrolling →</span>
          <div className="flex items-center gap-4">
            <span className="flex h-[1.2em] overflow-hidden text-bone" aria-hidden="true">
              <span className="wk-digits flex flex-col leading-[1.2em] will-change-transform">
                {PROJECTS.map((p, i) => (
                  <span key={p.slug}>{pad(i + 1)}</span>
                ))}
              </span>
            </span>
            <span className="relative h-px w-40 bg-line">
              <span
                className="wk-progress absolute inset-0 origin-left bg-neon will-change-transform"
                style={{ transform: "scaleX(0)" }}
              />
            </span>
            <span>{pad(PROJECTS.length)}</span>
          </div>
        </div>

        <div
          ref={track}
          className="wk-track relative flex flex-col gap-24 px-4 py-16 sm:px-6 md:px-10 walk:h-full walk:w-max walk:flex-row walk:gap-0 walk:p-0 walk:will-change-transform"
        >
          {PROJECTS.map((project, i) => (
            <ProjectPanel key={project.slug} project={project} index={i} total={PROJECTS.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

Note: `.wk-track` must not get `will-change: transform` outside walk mode, and no ancestor of `.wk-pin` may have `will-change: transform` (it breaks pinning; see Motion Kit notes).

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx playwright test tests/e2e/walkthrough.spec.ts tests/e2e/work-panels.spec.ts`
Expected: all passed.

If the 1024×700 fit test fails, raise the height floor from 700px to 760px in **both** `MQ.walkthrough`/`MQ.stacked` (`lib/animation-constants.ts`) and the `walk` variant (`app/globals.css`), change the test's viewport to 1024×760 and the fallback test to 1280×700, and re-run. Do not clamp or hide copy to make it fit.

- [ ] **Step 5: Lint, build, commit**

```bash
npm run lint
npm run build
git add -A
git commit -m "feat: pinned horizontal walkthrough with keyboard-safe focus"
```

---

### Task 7: Rules as a Flip accordion

**Files:**
- Rewrite: `components/approach.tsx`
- Test: `tests/e2e/approach.spec.ts`

**Interfaces:**
- Consumes: `PRINCIPLES` (unchanged); `SectionHeading`; `Flip`, `gsap`, `useGSAP`; `DURATION`, `EASE`, `MQ`.
- Produces: `section#approach` with four `button[data-rule-head]` (with `aria-expanded`, `aria-controls`) and at most one `[data-rule-body]`.

- [ ] **Step 1: Write the failing test**

Create `tests/e2e/approach.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { PRINCIPLES } from "../../lib/projects";

test("rules open one at a time and show their source file", async ({ page }) => {
  await page.goto("/#approach");
  const heads = page.locator("#approach [data-rule-head]");
  const body = page.locator("#approach [data-rule-body]");
  await expect(heads).toHaveCount(4);
  await expect(heads.nth(0)).toHaveAttribute("aria-expanded", "true");

  await heads.nth(2).click();
  await expect(heads.nth(2)).toHaveAttribute("aria-expanded", "true");
  await expect(heads.nth(0)).toHaveAttribute("aria-expanded", "false");
  await expect(body).toHaveCount(1);
  await expect(body).toContainText(PRINCIPLES[2].body);
  await expect(body).toContainText(PRINCIPLES[2].source);

  await heads.nth(2).click();
  await expect(body).toHaveCount(0);
});

test("keyboard: Enter toggles a rule", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const head = page.locator("#approach [data-rule-head]").nth(1);
  await head.focus();
  await page.keyboard.press("Enter");
  await expect(head).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(`#${await head.getAttribute("aria-controls")}`)).toBeVisible();
});

test("rule heads keep their size while the list re-flows", async ({ page }) => {
  await page.goto("/#approach");
  const heads = page.locator("#approach [data-rule-head]");
  const before = await heads.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
  await heads.nth(3).click();
  await page.waitForTimeout(150); // mid-Flip
  const during = await heads.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
  during.forEach((h, i) => expect(Math.abs(h - before[i])).toBeLessThan(1));
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/e2e/approach.spec.ts`
Expected: FAIL. No `[data-rule-head]` elements.

- [ ] **Step 3: Rewrite `components/approach.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";
import { Flip, gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MQ } from "@/lib/animation-constants";
import { PRINCIPLES } from "@/lib/projects";
import { SectionHeading } from "@/components/ui/section-heading";

/**
 * Four rules, one open at a time. The heads are fixed-size buttons, so Flip only ever
 * translates them: when a story opens, the rows below glide down instead of jumping.
 * The story itself fades up. Reduced motion: the layout just changes.
 */
export function Approach() {
  const root = useRef<HTMLElement>(null);
  const snapshot = useRef<Flip.FlipState | null>(null);
  const [open, setOpen] = useState(0);

  const toggle = (i: number) => {
    // Record where every head is before React re-renders, so Flip can animate from here.
    snapshot.current = Flip.getState(root.current!.querySelectorAll("[data-rule-head]"));
    setOpen((cur) => (cur === i ? -1 : i));
  };

  useGSAP(
    () => {
      const state = snapshot.current;
      snapshot.current = null;
      if (!state || window.matchMedia(MQ.reduce).matches) return;
      // power3.out over 0.6s: rows move quickly then settle, no overshoot, so the list
      // reads as re-flowing rather than bouncing.
      Flip.from(state, { duration: DURATION.base, ease: EASE.out });
      // The story fades up just behind the rows so the eye lands on it last.
      gsap.from(root.current!.querySelectorAll("[data-rule-body]"), {
        opacity: 0,
        y: 12,
        duration: DURATION.base,
        ease: EASE.out,
        delay: 0.08,
      });
    },
    { dependencies: [open], scope: root },
  );

  return (
    <section ref={root} id="approach" className="scroll-mt-16 px-4 py-28 sm:px-6 md:px-10 md:py-40">
      <SectionHeading
        index="02"
        eyebrow="How I work"
        title="Four rules that cost something to learn."
        lede="Each one is committed to a docs file in the repo it came out of, alongside the failure that produced it."
      />

      <ul className="mt-16 border-b border-line md:mt-24">
        {PRINCIPLES.map(({ rule, body, source }, i) => {
          const isOpen = open === i;
          const id = `rule-${i + 1}`;
          return (
            <li key={rule}>
              <button
                type="button"
                data-rule-head
                aria-expanded={isOpen}
                aria-controls={id}
                onClick={() => toggle(i)}
                className="group flex w-full items-baseline gap-4 border-t border-line py-6 text-left sm:gap-8 md:py-8"
              >
                <span className="label shrink-0 text-neon">R/{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 font-display text-[clamp(1.5rem,3.4vw,2.8rem)] font-medium leading-[1.02] tracking-[-0.03em] transition-transform duration-500 ease-expo-out group-hover:translate-x-2">
                  {rule}
                </span>
                <span
                  aria-hidden="true"
                  className="font-mono text-xl text-mute transition-transform duration-500 ease-expo-out group-aria-expanded:rotate-45 group-aria-expanded:text-neon"
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div
                  id={id}
                  data-rule-body
                  className="grid gap-4 pb-10 sm:pl-[calc(3.5rem+2rem)] md:grid-cols-[2fr_1fr] md:gap-12"
                >
                  <p className="max-w-2xl text-lg leading-relaxed text-mute">{body}</p>
                  <p className="label text-bone/80 md:text-right">{source}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx playwright test tests/e2e/approach.spec.ts`
Expected: 3 passed.

- [ ] **Step 5: Lint, build, commit**

```bash
npm run lint
npm run build
git add -A
git commit -m "feat: rules as a Flip accordion"
```

---

### Task 8: About with a curtain reveal and a portrait you can swap

**Files:**
- Rewrite: `components/about.tsx`
- Test: `tests/e2e/about.spec.ts`

**Interfaces:**
- Consumes: `STACK` (Task 2), `PROFILE`; `SectionHeading`; `gsap`, `useGSAP`; `DURATION`, `EASE`, `MQ`, `SCROLL`, `STAGGER`.
- Produces: `section#about`; `button[aria-pressed]` named "…Swap photo"; `[data-testid="portrait-mural"]`.

- [ ] **Step 1: Write the failing test**

Create `tests/e2e/about.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("portrait swaps from the keyboard and the stack is listed", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const swap = page.getByRole("button", { name: /swap photo/i });
  await expect(swap).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByTestId("portrait-mural")).toHaveCSS("opacity", "0");

  await swap.focus();
  await page.keyboard.press("Enter");
  await expect(swap).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("portrait-mural")).toHaveCSS("opacity", "1");

  await expect(page.locator("#about dt")).toHaveText(["Languages", "Frontend", "Backend", "AI", "Infra"]);
  await expect(page.locator("#about")).toContainText("SRM Institute of Science and Technology, Ramapuram");
});

test("photos are revealed by scrolling, not left hidden", async ({ page }) => {
  await page.goto("/");
  await page.locator("#about").scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 600);
  const curtain = page.locator("#about .ab-curtain").first();
  await expect
    .poll(async () => curtain.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).f))
    .toBeLessThan(5);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/e2e/about.spec.ts`
Expected: FAIL. No "Swap photo" button.

- [ ] **Step 3: Rewrite `components/about.tsx`**

```tsx
"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MQ, SCROLL, STAGGER } from "@/lib/animation-constants";
import { STACK } from "@/lib/projects";
import { PROFILE } from "@/lib/site";
import { SectionHeading } from "@/components/ui/section-heading";

export function About() {
  const root = useRef<HTMLElement>(null);
  const [mural, setMural] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.utils.toArray<HTMLElement>(".ab-frame").forEach((frame) => {
          // Curtain: the wrapper rises into the frame while the photo counter-moves, so the
          // image appears to hold still as the mask opens. Scrubbed from the frame's top at
          // 90% of the viewport to 40%; linear because scroll is the easing.
          gsap
            .timeline({ scrollTrigger: { trigger: frame, start: "top 90%", end: "top 40%", scrub: SCROLL.scrub } })
            .from(frame.querySelector(".ab-curtain"), { yPercent: 100, ease: EASE.scrub }, 0)
            .from(frame.querySelectorAll(".ab-img"), { yPercent: -100, scale: 1.15, ease: EASE.scrub }, 0);
        });
        // Stack rows settle in as the list's top crosses 85%: power3.out, no bounce.
        gsap.from(".ab-row", {
          y: 24,
          opacity: 0,
          duration: DURATION.base,
          ease: EASE.out,
          stagger: STAGGER.items,
          scrollTrigger: { trigger: ".ab-stack", start: "top 85%" },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about" className="scroll-mt-16 px-4 py-28 sm:px-6 md:px-10 md:py-40">
      <SectionHeading index="03" eyebrow="About" title="I build the boring parts on purpose." />

      <div className="mt-16 grid gap-14 md:mt-24 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div>
          <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-mute">
            <p>
              I’m Kevin — a third-year computer science engineering student at SRM Institute of
              Science and Technology, Ramapuram, working out of Chennai.
            </p>
            <p>
              Most of what I build is retrieval, evaluation and automation: the machinery that
              decides whether an answer is good enough to show someone. That machinery is where
              the failures live, so it’s where I spend the time — writing the gate, the benchmark
              and the rejection log before the interface that sits on top.
            </p>
            <p>
              I write the reasoning down as I go. Every project here carries a decisions file
              explaining why it works the way it does, which is the only reason the rules in the
              section above are quotable.
            </p>
          </div>

          <dl className="ab-stack mt-12 border-t border-line">
            {STACK.map(([term, value]) => (
              <div key={term} className="ab-row grid gap-1 border-b border-line py-4 sm:grid-cols-[8rem_1fr] sm:gap-6">
                <dt className="label text-neon">{term}</dt>
                <dd className="font-mono text-sm leading-relaxed text-bone">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-6">
          <button
            type="button"
            aria-pressed={mural}
            aria-label={`Portrait of ${PROFILE.fullName}. Swap photo`}
            onClick={() => setMural((m) => !m)}
            className="ab-frame group relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-line bg-ink-2"
          >
            <div className="ab-curtain absolute inset-0 overflow-hidden">
              <div className="ab-img absolute inset-0">
                <Image
                  src="/images/kevin-headshot-formal.jpg"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
              {/* CSS transitions opacity only; GSAP owns this element's transform. */}
              <div
                data-testid="portrait-mural"
                className={`ab-img absolute inset-0 transition-opacity duration-500 ease-expo-out [@media(hover:hover)]:group-hover:opacity-100 ${mural ? "opacity-100" : "opacity-0"}`}
              >
                <Image
                  src="/images/kevin-portrait-mural.jpg"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
            <span className="label absolute bottom-4 left-4 rounded-full bg-ink/85 px-3 py-1.5 text-bone">
              Hover or tap to swap
            </span>
          </button>

          <div className="ab-frame relative ml-auto aspect-[16/9] w-2/3 overflow-hidden rounded-3xl border border-line bg-ink-2">
            <div className="ab-curtain absolute inset-0 overflow-hidden">
              <div className="ab-img absolute inset-0">
                <Image
                  src="/images/kevin-expo-candid.jpg"
                  alt={`${PROFILE.fullName} presenting a project at an expo`}
                  fill
                  sizes="(min-width: 1024px) 26vw, 66vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx playwright test tests/e2e/about.spec.ts`
Expected: 2 passed.

- [ ] **Step 5: Lint, build, commit**

```bash
npm run lint
npm run build
git add -A
git commit -m "feat: about section with curtain reveals and a swappable portrait"
```

---

### Task 9: Contact footer with copy-to-clipboard

**Files:**
- Rewrite: `components/site-footer.tsx`
- Test: `tests/e2e/contact.spec.ts`

**Interfaces:**
- Consumes: `MagneticButton`, `LocalTime` (Task 3); `GithubMark`, `LinkedinMark`; `PROFILE`; `gsap`, `SplitText`, `useGSAP`; `DURATION`, `EASE`, `MQ`, `STAGGER`.
- Produces: `footer#contact`; a button named "Copy email address" that becomes "Email copied".

- [ ] **Step 1: Write the failing test**

Create `tests/e2e/contact.spec.ts`:

```ts
import { test, expect } from "@playwright/test";
import { PROFILE } from "../../lib/site";

test("copy email puts the address on the clipboard and says so", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("button", { name: "Copy email address" }).click();
  await expect(page.getByRole("button", { name: "Email copied" })).toBeVisible();
  await expect(page.locator("#contact [role='status']")).toHaveText("Email address copied to clipboard");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(PROFILE.email);
});

test("contact links point at the real profiles", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer#contact");
  await expect(footer.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", PROFILE.github);
  await expect(footer.getByRole("link", { name: /LinkedIn/ })).toHaveAttribute("href", PROFILE.linkedin);
  await expect(footer.getByRole("link", { name: PROFILE.email })).toHaveAttribute("href", `mailto:${PROFILE.email}`);
  await expect(footer.getByRole("heading", { level: 2 })).toHaveText("Open to internships and graduate roles.");
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/e2e/contact.spec.ts`
Expected: FAIL. No "Copy email address" button.

- [ ] **Step 3: Rewrite `components/site-footer.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { GithubMark, LinkedinMark } from "@/components/brand-icons";
import { PROFILE } from "@/lib/site";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { DURATION, EASE, MQ, STAGGER } from "@/lib/animation-constants";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { LocalTime } from "@/components/ui/local-time";

export function SiteFooter() {
  const root = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard blocked (insecure context or permissions): hand off to the mail client.
      window.location.href = `mailto:${PROFILE.email}`;
    }
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        SplitText.create(heading.current, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          // power4.out: heavier landing than section headings, this is the last word.
          // Plays when the footer's top crosses 75% and reverses if you scroll back up.
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 105,
              duration: DURATION.slow,
              ease: EASE.outStrong,
              stagger: STAGGER.lines,
              scrollTrigger: { trigger: root.current, start: "top 75%", toggleActions: "play none none reverse" },
            }),
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <footer ref={root} id="contact" className="relative overflow-hidden border-t border-line px-4 pb-10 pt-24 sm:px-6 md:px-10 md:pt-36">
      <p className="label flex gap-4 text-mute">
        <span className="text-neon">04</span>
        <span>Contact</span>
      </p>
      <h2
        ref={heading}
        className="split-pad mt-8 max-w-5xl font-display text-[clamp(2.6rem,8vw,7.5rem)] font-medium leading-[0.9] tracking-[-0.045em]"
      >
        Open to <span className="text-outline">internships</span> and graduate <span className="text-neon">roles.</span>
      </h2>
      <p className="mt-8 max-w-lg text-lg leading-relaxed text-mute">
        Third-year, graduating 2027. Chennai or remote. If you want to talk about any of the
        work above, the fastest route is email.
      </p>

      <div className="mt-14 flex flex-wrap items-center gap-8">
        <MagneticButton onClick={copy} ariaLabel={copied ? "Email copied" : "Copy email address"}>
          {/* Two stacked labels; the column slides up one line on copy. transform only. */}
          <span className="relative block h-[1.2em] overflow-hidden leading-[1.2em]">
            <span className={`flex flex-col transition-transform duration-500 ease-expo-out ${copied ? "-translate-y-1/2" : ""}`}>
              <span>Copy email</span>
              <span>Copied</span>
            </span>
          </span>
        </MagneticButton>
        <MagneticButton href={PROFILE.github} external variant="ghost" strength={0.5}>
          <GithubMark size={15} /> GitHub
        </MagneticButton>
        <MagneticButton href={PROFILE.linkedin} external variant="ghost" strength={0.5}>
          <LinkedinMark size={15} /> LinkedIn
        </MagneticButton>
        <a href={`mailto:${PROFILE.email}`} className="font-mono text-sm text-mute underline-offset-4 hover:text-neon hover:underline">
          {PROFILE.email}
        </a>
      </div>
      <p role="status" className="sr-only">
        {copied ? "Email address copied to clipboard" : ""}
      </p>

      <div className="label mt-24 flex flex-wrap justify-between gap-4 text-mute">
        <span>{PROFILE.fullName}</span>
        <span>
          Chennai · <LocalTime />
        </span>
        <span>Built with Next.js, GSAP and Lenis</span>
        <a href="#top" className="hover:text-neon">
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx playwright test tests/e2e/contact.spec.ts tests/e2e/header.spec.ts`
Expected: all passed. (The header test's `local-time` locator is scoped to the header, so the footer's second clock does not collide.)

- [ ] **Step 5: Lint, build, commit**

```bash
npm run lint
npm run build
git add -A
git commit -m "feat: contact footer with magnetic copy-to-clipboard"
```

---

### Task 10: Whole-page checks, docs, and the pull request

**Files:**
- Create: `tests/e2e/page.spec.ts`
- Modify: `AGENTS.md`, `README.md`, `docs/DECISIONS.md`, `docs/STATE.md`, `docs/VERIFY.md`

**Interfaces:**
- Consumes: everything above.
- Produces: branch `redesign/motion-kit` pushed, draft PR open against `main`.

- [ ] **Step 1: Write the whole-page tests**

Create `tests/e2e/page.spec.ts`:

```ts
import { test, expect, type Page } from "@playwright/test";

async function lowContrast(page: Page) {
  return page.evaluate(() => {
    const rgba = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
    const lin = (v: number) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const lum = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const backdrop = (el: Element | null): number[] => {
      for (; el; el = el.parentElement) {
        const c = rgba(getComputedStyle(el).backgroundColor);
        if (c.length >= 3 && (c[3] ?? 1) === 1) return c;
      }
      return [10, 10, 11];
    };
    const out: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("body *")) {
      const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
      if (!ownText || el.closest("[aria-hidden='true'], .sr-only, svg, script, style")) continue;
      const cs = getComputedStyle(el);
      const fg = rgba(cs.color);
      const a = fg[3] ?? 1;
      if (a === 0 || cs.display === "none" || cs.visibility === "hidden") continue;
      const bg = backdrop(el);
      const mixed = [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
      const [hi, lo] = [lum(mixed), lum(bg)].sort((x, y) => y - x);
      const ratio = (hi + 0.05) / (lo + 0.05);
      const floor = parseFloat(cs.fontSize) >= 24 ? 3 : 4.5;
      if (ratio < floor) out.push(`${ratio.toFixed(2)}:1 <${el.tagName.toLowerCase()}> "${el.textContent!.trim().slice(0, 40)}"`);
    }
    return out;
  });
}

test("every visible text clears its contrast floor", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" }); // final state, nothing mid-fade
  await page.goto("/");
  expect(await lowContrast(page)).toEqual([]);
});

test("reduced motion: whole page, nothing pinned, no Lenis, all sections present", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator("html.lenis")).toHaveCount(0);
  for (const id of ["top", "work", "approach", "about", "contact"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
});

for (const width of [375, 768, 1024, 1440]) {
  test(`${width}px: the page never scrolls sideways, top to bottom`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 700) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(80);
      const extra = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(extra, `horizontal overflow at scrollY=${y}`).toBe(0);
    }
  });
}
```

- [ ] **Step 2: Run the full suite against the production build**

Run: `npm run test:e2e:prod`
Expected: every spec passes. If the contrast test lists an element, fix the colour at its source (never loosen the floors); if an overflow test fails, find the offending element with `document.querySelectorAll("*")` filtered by `getBoundingClientRect().right > innerWidth` and fix its width or clipping.

- [ ] **Step 3: Update `AGENTS.md`**

Replace everything from `## Design system` up to (not including) `## Deploying` with:

~~~~markdown
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
components/ui/            magnetic-button · section-heading · particle-field ·
                          velocity-marquee · local-time
components/scenes/        one refusal scene per project + registry
components/               hero · work · project-panel · approach · about ·
                          site-header · site-footer · lenis-provider · brand-icons
tests/e2e/                Playwright specs
```

`lib/projects.ts` is the content layer. Edit copy there, not in the components.

`brand-icons.tsx` exists because lucide-react v1 dropped its brand icons —
don't reintroduce `import { Github } from "lucide-react"`, it doesn't exist.
~~~~

Replace the `## Verifying` section with:

~~~~markdown
## Verifying

See `docs/VERIFY.md`. `npm run lint`, `npm run build` and `npm run test:e2e:prod`
must all pass. The Playwright suite covers contrast, 375px overflow, reduced motion,
no-JS and keyboard focus inside the pinned walkthrough.
~~~~

- [ ] **Step 4: Update `docs/DECISIONS.md`**

Change the heading `## Neo-brutalism, shared with StarMatch` to `## Neo-brutalism, shared with StarMatch (superseded 2026-09-27)`, and the headings `## \`@custom-variant dark (&:is(.dark *))\` is required` and `## Only volt carries white text` to end with ` (superseded 2026-09-27)`. Then append:

~~~~markdown
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

Horizontal pinning needs one project per screen. Below 1024×700, or with reduced
motion, the same panels render as a list. Clipping or hiding copy to make a panel fit
was rejected.

## Playwright end-to-end tests (2026-09-27)

The repo had no test runner and VERIFY.md asked for contrast, overflow and
reduced-motion checks by hand. They are now Playwright specs, run against the
production build with `npm run test:e2e:prod`.
~~~~

- [ ] **Step 5: Update `docs/VERIFY.md`**

Replace the top section (from the `# How to prove a change works` heading down to, not including, `## Contrast changes`) with:

~~~~markdown
# How to prove a change works

```bash
npm run lint
npm run build
npm run test:e2e:prod
```

All three must pass. First run on a new machine: `npx playwright install chromium`
(Windows PowerShell: `npx.cmd playwright install chromium`).
~~~~

Under `## Contrast changes`, `## Responsive` and `## Motion`, add one line each: "Automated in `tests/e2e/page.spec.ts`." (and for Motion also "and `tests/e2e/walkthrough.spec.ts`."). Keep the existing floors and the "After deploying" section unchanged.

- [ ] **Step 6: Update `docs/STATE.md` and `README.md`**

`docs/STATE.md`: set `**Last updated:** 2026-09-27 by claude-code`; replace the "Where things stand" paragraphs with a short summary of this redesign (Motion Kit look, scenes and Try buttons, pinned walkthrough, Playwright suite) and set "The exact next step" to "Review the Vercel preview on the PR, then merge to deploy."

`README.md`: replace the `## Design system` section with a two-paragraph version of the AGENTS.md design system text above (tokens table updated to the eight Motion Kit tokens); in `## The idea`, change "every project card leads with a hazard-striped **Refuses** band" to "every project leads with a hazard-striped **Refuses** band, and a button that asks it to do the thing anyway"; retitle `## Two bugs worth writing down` to `## Two bugs from the brutalist version, still worth knowing`; replace `## Motion` with a paragraph matching the AGENTS.md Motion section; add `npm run test:e2e` under "Running it"; update `## Structure` to the AGENTS.md layout block.

- [ ] **Step 7: Final gate**

```bash
npm run lint
npm run build
npm run test:e2e:prod
```

Expected: all pass. Then open the dev server and do the checks no test can do, noting results for the PR:

1. Chrome DevTools Performance, 4× CPU throttle, scroll hero → contact: no long tasks over 50ms during the walkthrough scrub; frames stay green.
2. Hover "stop." — the particle field freezes; leave — it resumes.
3. Magnetic buttons spring back with overshoot; on a touch device (DevTools device mode) they are static and tappable.

- [ ] **Step 8: Commit, push and open a draft PR**

```bash
git add -A
git commit -m "docs: record the Motion Kit redesign and the Playwright suite"
git fetch origin main
git push -u origin redesign/motion-kit
```

Open a draft PR `redesign/motion-kit` → `main` titled "Motion Kit redesign: refusals you can try". Body starts with the two attribution lines the session provides, then:

- **Before:** a light/dark neo-brutalist page with a two-column grid of project cards, each stating its refusal.
- **After:** a dark Motion Kit page where each project gets a screen of its own in a pinned walkthrough, acts out its refusal in a small animated scene, and has a button that asks it to do the forbidden thing anyway.
- **How:** Motion Kit tokens and the next-motion-starter foundation, six SVG scenes with GSAP timelines, Flip accordion for the rules, Playwright suite for the checks VERIFY.md used to ask for by hand.
- The manual check results from Step 7.

Assign and request review from JamesKevinJones. Do not merge: merging deploys to the printed URL, and that is Kevin's call after he has seen the Vercel preview.
