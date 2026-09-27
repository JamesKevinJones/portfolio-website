"use client";

import { useRef, type ElementType } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { EASE, MQ, SCROLL, STAGGER } from "@/lib/animation-constants";

type InkRevealProps = {
  children: string;
  as?: ElementType;
  className?: string;
  /**
   * Opacity of a word before the reader reaches it. 0.5 keeps bone (#ededea) on ink
   * (#0a0a0b) at ~4.7:1, so unread words still pass the 4.5:1 body-text floor and look
   * like the page's existing text-mute copy. Go lower only for text 24px and up
   * (0.36 is the 3:1 floor there).
   */
  dim?: number;
};

/**
 * Words brighten one by one as the paragraph scrolls through the viewport, so the text
 * reads at the speed you scroll. Adapted from cred.club's "not everyone makes it in"
 * fold, which flips each word's colour from #333 to #fff; here only opacity moves (no
 * colour tween) and the unread state stays readable.
 * Reduced motion: no split, the paragraph renders at full opacity.
 */
export function InkReveal({ children, as: Tag = "p", className = "", dim = 0.5 }: InkRevealProps) {
  const el = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const split = SplitText.create(el.current, {
          type: "words",
          // autoSplit re-splits when fonts load or the width changes line breaks;
          // onSplit's returned tween is reverted and rebuilt with it.
          autoSplit: true,
          onSplit: (self) =>
            gsap.fromTo(
              self.words,
              { opacity: dim },
              {
                opacity: 1,
                stagger: STAGGER.words,
                // Linear: the scroll position is the easing on a scrubbed timeline.
                ease: EASE.scrub,
                scrollTrigger: {
                  trigger: el.current,
                  // First word lights when the block's top reaches 80% of the viewport,
                  // the last when its bottom reaches 45%: the lit edge sits just above
                  // the middle of the screen, where the eye already is.
                  start: "top 80%",
                  end: "bottom 45%",
                  scrub: SCROLL.scrub,
                },
              },
            ),
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: el, dependencies: [children, dim] },
  );

  return (
    <Tag ref={el} className={className}>
      {children}
    </Tag>
  );
}
