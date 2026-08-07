<div align="center">

# Portfolio — Kevin Jones

### Most portfolios show you the work. This one runs its own quality gate on the way down.

A personal site built as an operations console rather than a brochure — because
the projects behind it are governed AI systems, and the design should sound like
what it's describing.

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

The projects on this site — [frontier-platform](https://github.com/JamesKevinJones/frontier-platform),
[job-rag](https://github.com/JamesKevinJones/job-rag),
[riskpulse](https://github.com/JamesKevinJones/riskpulse),
[memoryvault-ai](https://github.com/JamesKevinJones/Memoryvault-ai) — share a
real vocabulary: CI quality gates, pass/fail evals, guardrails, risk scoring.
So the site is built from that vocabulary instead of from a template.

## The signature: a quality gate you scroll through

The centerpiece is a CI-status panel that starts at **`0 / 4 passing`**, every
check greyed out and pending. As you scroll, the section pins and the checks
resolve one at a time — the glyph flips from `–` to `✓`, the row lifts to full
opacity, and the counter climbs until it locks green at `4 / 4`.

It's the same badge that sits at the top of `frontier-platform`'s README, except
the thing being evaluated is a person. The motion isn't decoration; it's the
point being made.

## Design system

Committed to a single dark identity — no theme toggle, deliberately.

| Token     | Value     | Role                                     |
| --------- | --------- | ---------------------------------------- |
| `ink`     | `#0b0e14` | Background                               |
| `panel`   | `#12161f` | Glass surfaces                           |
| `wire`    | `#4a5468` | Secondary text, borders                  |
| `mist`    | `#e7eaf0` | Primary text                             |
| `signal`  | `#3ecf8e` | **Passing state only** — never decorative |
| `alert`   | `#f0a93e` | **At-risk state only** — held in reserve  |

The two accents are bound to real states. If something is green here, it means
it passed.

**Type:** Space Grotesk (display) · Inter (body) · JetBrains Mono (data + chrome).
The mono face carries every readout, path, and status — the interface's own voice.

**Glass:** panel-tinted frosted surfaces over an ambient grid field. Blur and
saturation, not white translucency, so it stays inside the console palette
rather than borrowing an iOS look.

## Motion

All of it runs through `gsap.matchMedia`, so `prefers-reduced-motion` isn't an
afterthought — the reduced branch renders the final state directly and registers
no ScrollTriggers at all.

- **Hero** — a staggered boot sequence on load
- **Eval gate** — pinned, scrubbed scroll story (above)
- **Projects** — `ScrollTrigger.batch` reveals, staggered by row
- **About** — two-speed parallax on the photographs

## Running it

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

```bash
npm run build   # production build
npm run start   # serve the build
npm run lint    # eslint
```

## Notes from the build

Two problems worth writing down, since neither is obvious from the docs:

**The pin silently collapsed.** `body` and `main` used a flex sticky-footer
pattern. ScrollTrigger injects a pin-spacer element to reserve scroll distance,
and as a flex child it inherited `flex-shrink: 1` — so the browser crushed it
from its intended 1758px down to 478px. The pin looked "created" (the spacer
existed, the trigger reported correct start/end) but never fired. Dropping the
unnecessary flex wrapper fixed it.

**Fonts measured too late.** ScrollTrigger takes its measurements before web
fonts finish loading, so the pin distance was computed against a stale layout.
A `document.fonts.ready` refresh corrects it — but scoped *inside* the component
effect. Calling refresh at module scope fires before the trigger exists and
leaves it in a broken state.

## Structure

```
app/            layout, page, global styles + design tokens
components/     StatusBar · Hero · EvalGate · Projects · About · Footer
lib/gsap.ts     GSAP + ScrollTrigger registration
public/images/  photography
```

## Contact

[LinkedIn](https://www.linkedin.com/in/jameskevinjones/) ·
[Instagram](https://www.instagram.com/jameskevinjones/) ·
[Email](mailto:kj6384647@gmail.com)

## License

MIT — see [LICENSE](LICENSE). The code is free to learn from; the photographs
and written content are not.
