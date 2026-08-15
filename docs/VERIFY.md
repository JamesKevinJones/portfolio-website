# How to prove a change works

There is no test runner in this project. `npm run build` is the real gate.

```bash
npm run lint
npm run build
```

Both must pass with no output before a change is done.

## Contrast changes

Never eyeball these. Run the site, open both themes, and measure the computed
ratio against the resolved background. Two failures already shipped from
eyeballing (white-on-coral at 3.05:1, and a light theme at 1.14:1 caused by the
`dark:` variant following the OS instead of the `.dark` class).

Floors: 4.5:1 for body and label text, 3:1 for text at 24px or above.

## Responsive

Check at 375px. `document.documentElement.scrollWidth` must equal
`clientWidth` — the page body never scrolls horizontally.

## Motion

With `prefers-reduced-motion: reduce`, no ScrollTrigger instances should be
registered and the page must render its final state directly.

## After deploying

Deploying is not pushing. Fetch the live URL and confirm the change is in the
response:

```bash
curl -s https://portfolio-website-eight-kappa-iwtiz3w2ef.vercel.app | grep -o "when to stop"
```
